import { createSimulationModel, runModelForDuration } from '../simulation/simulationEngine.js'

/**
 * trafficAnalysis.js — Architecture and interfaces for AI Traffic Intelligence.
 *
 * Defines:
 * 1. Data contracts for real-time traffic measurements (inputs)
 * 2. Transparent arrival profiles (morning, evening, balanced midday)
 * 3. Signal timing recommendations based on live measurements
 * 4. Deterministic comparison runs using the shared simulation model
 * 5. Safe interface for future LLM / Groq API integration (no hardcoded keys)
 */

/**
 * @typedef {Object} DirectionMeasurement
 * @property {string} direction - 'north' | 'south' | 'east' | 'west'
 * @property {number} queueLength - Number of queued vehicles waiting
 * @property {number} vehicleCount - Total observed vehicles in period
 * @property {number} avgWaitTimeSec - Average wait time in seconds
 * @property {Object} composition - Vehicle distribution Breakdown
 * @property {number} composition.cars - Percentage (0-100)
 * @property {number} composition.buses - Percentage (0-100)
 * @property {number} composition.twoWheelers - Percentage (0-100)
 * @property {number} composition.autos - Percentage (0-100)
 */

/**
 * @typedef {Object} TrafficMeasurementPayload
 * @property {number} timestamp - Epoch timestamp (ms)
 * @property {string} scenario - 'morning_rush' | 'evening_rush' | 'balanced' | 'off_peak'
 * @property {DirectionMeasurement[]} approaches - Per-direction measurements
 * @property {number} currentCycleTimeSec - Current total cycle time (e.g. 60s)
 */

/**
 * @typedef {Object} SignalTimingRecommendation
 * @property {number} recommendedCycleSec - Suggested total cycle time
 * @property {Object} phaseAllocation - Seconds allocated per phase
 * @property {number} phaseAllocation.nsGreenSec - North/South green time
 * @property {number} phaseAllocation.nsAmberSec - North/South amber time
 * @property {number} phaseAllocation.ewGreenSec - East/West green time
 * @property {number} phaseAllocation.ewAmberSec - East/West amber time
 * @property {string} reasoning - Plain-text explanation of the bottleneck & rationale
 * @property {'heuristic' | 'ai_model' | 'rule_based'} engineType
 */

// These percentages shape generated arrivals; they are assumptions, not observations.
export const SCENARIO_PRESETS = {
  morning_rush: {
    id: 'morning_rush',
    name: 'Morning Peak (North-South Commute)',
    description: 'High commuter density entering the city center from North/South arterials.',
    demandWeights: { north: 0.36, south: 0.30, east: 0.17, west: 0.17 },
  },
  evening_rush: {
    id: 'evening_rush',
    name: 'Evening Peak (East-West Outflow)',
    description: 'Heavy residential dispersal heading East/West towards suburbs.',
    demandWeights: { north: 0.15, south: 0.15, east: 0.38, west: 0.32 },
  },
  balanced: {
    id: 'balanced',
    name: 'Balanced Midday Flow',
    description: 'Uniform arterial flow across both axes.',
    demandWeights: { north: 0.25, south: 0.25, east: 0.25, west: 0.25 },
  },
}

/**
 * Deterministic proportional demand split. Vehicle weights are PCU-style
 * heuristics and are applied only to measured active vehicle composition.
 *
 * @param {DirectionMeasurement[]} measurements
 * @param {number} totalCycleSec
 * @returns {SignalTimingRecommendation}
 */
export function calculateOptimalTiming(measurements, totalCycleSec = 60) {
  const AMBER_TIME = 3
  const lostTime = AMBER_TIME * 2 + 2
  const availableGreen = Math.max(10, totalCycleSec - lostTime)

  // Passenger Car Unit (PCU) weighted demand:
  // Bus = 2.5 PCU, Car = 1.0, Auto = 0.8, Two-wheeler = 0.5
  const calcPcu = (m) => {
    const comp = m.composition || {}
    const compositionTotal = (comp.cars || 0) + (comp.buses || 0) + (comp.twoWheelers || 0) + (comp.autos || 0)
    if (!compositionTotal) return m.queueLength * 1.5 + m.vehicleCount * 0.8
    const factor = ((comp.cars || 0) * 1.0 + (comp.buses || 0) * 2.5 + (comp.autos || 0) * 0.8 + (comp.twoWheelers || 0) * 0.5) / 100
    return (m.queueLength * 1.5 + m.vehicleCount * 0.8) * factor
  }

  const north = measurements.find(m => m.direction === 'north') || { queueLength: 0, vehicleCount: 0 }
  const south = measurements.find(m => m.direction === 'south') || { queueLength: 0, vehicleCount: 0 }
  const east  = measurements.find(m => m.direction === 'east')  || { queueLength: 0, vehicleCount: 0 }
  const west  = measurements.find(m => m.direction === 'west')  || { queueLength: 0, vehicleCount: 0 }

  const nsDemand = Math.max(1, calcPcu(north) + calcPcu(south))
  const ewDemand = Math.max(1, calcPcu(east) + calcPcu(west))
  const totalDemand = nsDemand + ewDemand

  const nsRatio = nsDemand / totalDemand
  const minGreen = 8
  const maxGreen = Math.max(minGreen, availableGreen - minGreen)
  const nsGreen = Math.round(Math.max(minGreen, Math.min(maxGreen, availableGreen * nsRatio)))
  const ewGreen = availableGreen - nsGreen

  const heavierAxis = nsDemand >= ewDemand ? 'North-South' : 'East-West'
  const nsShare = Math.round(nsRatio * 100)
  const nsGreenShare = Math.round(nsGreen / availableGreen * 100)

  return {
    recommendedCycleSec: totalCycleSec,
    phaseAllocation: {
      nsGreenSec: nsGreen,
      nsAmberSec: AMBER_TIME,
      ewGreenSec: ewGreen,
      ewAmberSec: AMBER_TIME,
    },
    reasoning: `Measured queue and arrival demand currently favors ${heavierAxis}. North–South accounts for ${nsShare}% of weighted demand, so the rule-based split assigns ${nsGreenShare}% of available green to North–South and preserves a minimum green for both axes. This is a timing recommendation, not a predicted delay reduction.`,
    engineType: 'heuristic',
  }
}
/** Run both strategies against the same seeded arrivals and demand profile. */
export function runStrategyComparison({ scenario = 'balanced', spawnRate = 50, durationSec = 180, crossingDirections = [], speedLimits = {} } = {}) {
  const demandWeights = SCENARIO_PRESETS[scenario]?.demandWeights || SCENARIO_PRESETS.balanced.demandWeights
  const run = (controllerMode) => {
    const model = createSimulationModel(2026)
    const config = {
      spawnRate,
      demandWeights,
      crossingDirections,
      speedLimits,
      selectGreenDuration: (axis, measurements) => {
        if (controllerMode === 'fixed') return 13
        const timing = calculateOptimalTiming(measurements, 34)
        return axis === 'NS' ? timing.phaseAllocation.nsGreenSec : timing.phaseAllocation.ewGreenSec
      },
    }
    return runModelForDuration(model, durationSec, config)
  }

  const fixed = run('fixed')
  const adaptive = run('adaptive')
  const result = (snapshot) => ({
    vehiclesPassed: snapshot.stats.totalPassed,
    averageWaitTimeSec: snapshot.stats.avgWaitTimeSec,
    averageQueue: snapshot.stats.averageQueue,
    simulatedSeconds: snapshot.elapsedTime,
  })

  return {
    completed: true,
    demandProfile: scenario,
    durationSec,
    fixed: result(fixed),
    adaptive: result(adaptive),
  }
}
