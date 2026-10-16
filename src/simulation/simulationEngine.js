/**
 * Small deterministic traffic model for the four-way straight-through demo.
 * This module owns traffic state and movement; React and the renderers only
 * receive snapshots of the resulting vehicles and controller state.
 */
import { APPROACH_LAYOUT, JUNCTION_LAYOUT } from '../network/junctionLayout'

export const DIRECTIONS = ['north', 'south', 'east', 'west']

const PATH_LENGTH = JUNCTION_LAYOUT.spawnOffset * 2
const STOP_EDGE = JUNCTION_LAYOUT.stopLineOffset
const GREEN_ENTRY_BUFFER = 3.6
const AMBER_SECONDS = 3
const CLEARANCE_SECONDS = 1
const FIXED_GREEN_SECONDS = 13
const RAIL_CROSSING_PROGRESS = 15
const RAIL_WARNING_SECONDS = 3
const RAIL_CLOSED_SECONDS = 8
const GAP = 1.4
const VEHICLE_TYPES = {
  sedan: { length: 3.8, width: 1.8, speed: 7.2, color: '#2563eb' },
  suv: { length: 4.2, width: 2, speed: 6.8, color: '#dc2626' },
  bus: { length: 8, width: 2.4, speed: 6.2, color: '#b45309' },
  auto: { length: 2.4, width: 1.3, speed: 6.5, color: '#15803d' },
  motorcycle: { length: 2.1, width: 0.9, speed: 8.3, color: '#334155' },
  ambulance: { length: 4.6, width: 2, speed: 12.5, color: '#f8fafc' },
}

const ROUTES = Object.fromEntries(Object.entries(APPROACH_LAYOUT).map(([direction, approach]) => ([
  direction,
  { x: approach.spawn[0], z: approach.spawn[1], dx: approach.vector[0], dz: approach.vector[1] },
])))

const ZERO_COUNTS = () => ({ north: 0, south: 0, east: 0, west: 0 })
const OPPOSITE_DIRECTION = { north: 'south', south: 'north', east: 'west', west: 'east' }

function seededRandom(seed) {
  let value = seed % 2147483647
  if (value <= 0) value += 2147483646
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

function normalizeWeights(weights = {}) {
  const values = DIRECTIONS.map((direction) => Math.max(0, Number(weights[direction]) || 0))
  const total = values.reduce((sum, value) => sum + value, 0)
  if (!total) return { north: 0.25, south: 0.25, east: 0.25, west: 0.25 }
  return Object.fromEntries(DIRECTIONS.map((direction, index) => [direction, values[index] / total]))
}

export function createSimulationModel(seed = 2026) {
  return {
    random: seededRandom(seed),
    nextId: 1,
    vehicles: [],
    elapsedTime: 0,
    spawnTimer: 1.2,
    phase: 'NS_GREEN',
    phaseRemaining: FIXED_GREEN_SECONDS,
    currentGreenDuration: FIXED_GREEN_SECONDS,
    crossingState: 'open',
    crossingRemaining: 0,
    emergency: null,
    controllerMode: 'fixed',
    totalPassed: 0,
    totalWaitCompleted: 0,
    waitedVehicles: 0,
    totalWaitCompletedByDirection: ZERO_COUNTS(),
    waitedVehiclesByDirection: ZERO_COUNTS(),
    totalQueueVehicleSeconds: 0,
    demandSinceCycle: ZERO_COUNTS(),
    spawnedByDirection: ZERO_COUNTS(),
    spawnedByType: { sedan: 0, suv: 0, bus: 0, auto: 0, motorcycle: 0, ambulance: 0 },
    passedByType: { sedan: 0, suv: 0, bus: 0, auto: 0, motorcycle: 0, ambulance: 0 },
  }
}

function axisForPhase(phase) {
  return phase.startsWith('NS') ? 'NS' : phase.startsWith('EW') ? 'EW' : null
}

function axisForDirection(direction) {
  return direction === 'north' || direction === 'south' ? 'NS' : 'EW'
}

export function getSignals(model) {
  if (model.phase === 'EMERGENCY_CLEARANCE' || model.phase === 'EMERGENCY_RETURN_CLEARANCE') {
    return { north: 'red', south: 'red', east: 'red', west: 'red' }
  }
  if (model.phase === 'EMERGENCY_GREEN' || model.phase === 'EMERGENCY_AMBER') {
    return Object.fromEntries(DIRECTIONS.map(direction => [
      direction,
      direction === model.emergency?.direction
        ? (model.phase === 'EMERGENCY_GREEN' ? 'green' : 'amber')
        : 'red',
    ]))
  }
  if (model.phase === 'NS_GREEN') return { north: 'green', south: 'green', east: 'red', west: 'red' }
  if (model.phase === 'NS_AMBER') return { north: 'amber', south: 'amber', east: 'red', west: 'red' }
  if (model.phase === 'EW_GREEN') return { north: 'red', south: 'red', east: 'green', west: 'green' }
  if (model.phase === 'EW_AMBER') return { north: 'red', south: 'red', east: 'amber', west: 'amber' }
  return { north: 'red', south: 'red', east: 'red', west: 'red' }
}

function queueCounts(model) {
  const queues = ZERO_COUNTS()
  for (const vehicle of model.vehicles) {
    const stopProgress = PATH_LENGTH / 2 - STOP_EDGE - vehicle.length / 2 - 0.5
    if (vehicle.progress < stopProgress + 0.1 && vehicle.speed < 0.8) queues[vehicle.direction] += 1
  }
  return queues
}

function isIntersectionOccupied(model) {
  const entry = PATH_LENGTH / 2 - STOP_EDGE
  const exit = PATH_LENGTH / 2 + STOP_EDGE
  return model.vehicles.some((vehicle) => (
    vehicle.progress + vehicle.length / 2 > entry && vehicle.progress - vehicle.length / 2 < exit
  ))
}

function crossingPositionForRoute(routeDirection, crossingDirection) {
  if (routeDirection === crossingDirection) return RAIL_CROSSING_PROGRESS
  const opposite = { north: 'south', south: 'north', east: 'west', west: 'east' }
  return opposite[routeDirection] === crossingDirection ? PATH_LENGTH - RAIL_CROSSING_PROGRESS : null
}

function isRailwayTrackOccupied(model, crossingDirections) {
  return model.vehicles.some(vehicle => crossingDirections.some(direction => {
    const position = crossingPositionForRoute(vehicle.direction, direction)
    return position !== null
      && vehicle.progress + vehicle.length / 2 > position - 1
      && vehicle.progress - vehicle.length / 2 < position + 1
  }))
}

function advanceRailwayCrossing(model, dt, config) {
  if (config.crossingState) {
    model.crossingState = config.crossingState
    return
  }
  const directions = config.crossingDirections?.length ? config.crossingDirections : ['north']
  if (model.crossingState === 'open') return
  model.crossingRemaining = Math.max(0, model.crossingRemaining - dt)
  if (model.crossingState === 'warning' && model.crossingRemaining <= 1e-8) {
    if (isRailwayTrackOccupied(model, directions)) return
    model.crossingState = 'closed'
    model.crossingRemaining = RAIL_CLOSED_SECONDS
  } else if (model.crossingState === 'closed' && model.crossingRemaining <= 1e-8) {
    model.crossingState = 'open'
    model.crossingRemaining = 0
  }
}

export function startRailwayCrossingCycle(model) {
  if (model.crossingState !== 'open') return false
  model.crossingState = 'warning'
  model.crossingRemaining = RAIL_WARNING_SECONDS
  return true
}

function approachMeasurements(model) {
  const queues = queueCounts(model)
  const compositionCounts = Object.fromEntries(DIRECTIONS.map((direction) => [direction, { sedan: 0, suv: 0, bus: 0, auto: 0, motorcycle: 0, ambulance: 0 }]))
  const currentWaitByDirection = ZERO_COUNTS()
  const currentWaitedByDirection = ZERO_COUNTS()
  for (const vehicle of model.vehicles) {
    compositionCounts[vehicle.direction][vehicle.type] += 1
    currentWaitByDirection[vehicle.direction] += vehicle.waitTime
    if (vehicle.waitTime > 0.1) currentWaitedByDirection[vehicle.direction] += 1
  }

  return DIRECTIONS.map((direction) => {
    const types = compositionCounts[direction]
    const count = Object.values(types).reduce((sum, value) => sum + value, 0)
    const percent = (value) => count ? (value / count) * 100 : 0
    return {
      direction,
      queueLength: queues[direction],
      vehicleCount: model.demandSinceCycle[direction],
      arrivalsObserved: model.spawnedByDirection[direction],
      avgWaitTimeSec: (model.totalWaitCompletedByDirection[direction] + currentWaitByDirection[direction])
        / Math.max(1, model.waitedVehiclesByDirection[direction] + currentWaitedByDirection[direction]),
      composition: {
        cars: percent(types.sedan + types.suv + types.ambulance),
        buses: percent(types.bus),
        twoWheelers: percent(types.motorcycle),
        autos: percent(types.auto),
      },
    }
  })
}

function beginGreen(model, axis, config) {
  const phase = `${axis}_GREEN`
  const measurements = approachMeasurements(model)
  const selected = config.selectGreenDuration?.(axis, measurements)
  const duration = Number.isFinite(selected) ? Math.max(8, Math.min(20, selected)) : FIXED_GREEN_SECONDS
  model.phase = phase
  model.phaseRemaining = duration
  model.currentGreenDuration = duration
  if (axis === 'NS') model.demandSinceCycle = ZERO_COUNTS()
}

function advanceController(model, dt, config) {
  model.phaseRemaining = Math.max(0, model.phaseRemaining - dt)
  if (model.phaseRemaining > 1e-8) return

  if (model.phase === 'NS_GREEN') {
    model.phase = 'NS_AMBER'
    model.phaseRemaining = AMBER_SECONDS
  } else if (model.phase === 'NS_AMBER') {
    model.phase = 'ALL_RED_NS_EW'
    model.phaseRemaining = CLEARANCE_SECONDS
  } else if (model.phase === 'ALL_RED_NS_EW') {
    if (isIntersectionOccupied(model)) return
    beginGreen(model, 'EW', config)
  } else if (model.phase === 'EW_GREEN') {
    model.phase = 'EW_AMBER'
    model.phaseRemaining = AMBER_SECONDS
  } else if (model.phase === 'EW_AMBER') {
    model.phase = 'ALL_RED_EW_NS'
    model.phaseRemaining = CLEARANCE_SECONDS
  } else if (model.phase === 'ALL_RED_EW_NS') {
    if (isIntersectionOccupied(model)) return
    beginGreen(model, 'NS', config)
  }
}

function pickWeightedDirection(weights, random) {
  const normalized = normalizeWeights(weights)
  const pick = random()
  let cumulative = 0
  for (const direction of DIRECTIONS) {
    cumulative += normalized[direction]
    if (pick <= cumulative) return direction
  }
  return 'west'
}

function nextType(random) {
  const pick = random()
  if (pick < 0.43) return 'sedan'
  if (pick < 0.59) return 'suv'
  if (pick < 0.69) return 'bus'
  if (pick < 0.82) return 'auto'
  return 'motorcycle'
}

function spawnVehicle(model, direction, type) {
  const route = ROUTES[direction]
  const spec = VEHICLE_TYPES[type]
  const vehicle = {
    id: model.nextId++,
    type,
    direction,
    x: route.x,
    z: route.z,
    progress: 0,
    speed: 0,
    waitTime: 0,
    length: spec.length,
    width: spec.width,
    color: spec.color,
  }
  model.vehicles.push(vehicle)
  model.spawnedByDirection[direction] += 1
  model.demandSinceCycle[direction] += 1
  model.spawnedByType[type] += 1
  return vehicle
}

function trySpawn(model, config) {
  const direction = pickWeightedDirection(config.demandWeights, model.random)
  const atSpawn = model.vehicles.filter((vehicle) => vehicle.direction === direction && vehicle.progress < 12)
  if (atSpawn.length || (model.emergency && model.emergency.direction === direction)) return false

  const type = nextType(model.random)
  spawnVehicle(model, direction, type)
  return true
}

/** Dispatch one ambulance on a supported straight-through route. */
export function dispatchAmbulance(model) {
  if (model.emergency) return false
  const sortedApproaches = DIRECTIONS.map((direction) => ({
    direction,
    blockedAtSpawn: model.vehicles.filter(vehicle => vehicle.direction === direction && vehicle.progress < 12).length,
    vehiclesAhead: model.vehicles.filter(vehicle => vehicle.direction === direction).length,
  })).sort((a, b) => a.blockedAtSpawn - b.blockedAtSpawn || a.vehiclesAhead - b.vehiclesAhead)
  const { direction } = sortedApproaches[0]
  model.emergency = { id: null, direction, stage: 'waiting', dispatchedAt: model.elapsedTime }
  return true
}

function activateWaitingAmbulance(model) {
  if (model.emergency?.stage !== 'waiting') return
  const blocked = model.vehicles.some(vehicle => (
    vehicle.direction === model.emergency.direction && vehicle.progress < 12
  ))
  if (blocked) return
  const ambulance = spawnVehicle(model, model.emergency.direction, 'ambulance')
  model.emergency.id = ambulance.id
  model.emergency.stage = 'requesting'
}

function advanceEmergencyController(model, dt) {
  const emergency = model.emergency
  if (!emergency || emergency.stage === 'waiting') return false

  if (emergency.stage === 'requesting') {
    if (model.phase === 'NS_GREEN' || model.phase === 'EW_GREEN') {
      model.phase = model.phase.replace('_GREEN', '_AMBER')
      model.phaseRemaining = AMBER_SECONDS
      emergency.stage = 'transitioning'
      return true
    }
    emergency.stage = 'transitioning'
  }

  if (emergency.stage === 'transitioning') {
    if (model.phase === 'NS_GREEN' || model.phase === 'EW_GREEN') {
      model.phase = model.phase.replace('_GREEN', '_AMBER')
      model.phaseRemaining = AMBER_SECONDS
      return true
    }
    if (model.phase === 'NS_AMBER' || model.phase === 'EW_AMBER') {
      model.phaseRemaining = Math.max(0, model.phaseRemaining - dt)
      if (model.phaseRemaining <= 1e-8) {
        model.phase = 'EMERGENCY_CLEARANCE'
        model.phaseRemaining = CLEARANCE_SECONDS
        emergency.stage = 'clearing'
      }
      return true
    }
    model.phase = 'EMERGENCY_CLEARANCE'
    model.phaseRemaining = Math.max(0, model.phaseRemaining - dt)
    if (model.phaseRemaining <= 1e-8 && !isIntersectionOccupied(model)) {
      model.phase = 'EMERGENCY_GREEN'
      model.phaseRemaining = 30
      emergency.stage = 'serving'
    }
    return true
  }

  if (emergency.stage === 'clearing') {
    model.phaseRemaining = Math.max(0, model.phaseRemaining - dt)
    if (model.phaseRemaining <= 1e-8 && !isIntersectionOccupied(model)) {
      model.phase = 'EMERGENCY_GREEN'
      model.phaseRemaining = 30
      emergency.stage = 'serving'
    }
    return true
  }

  if (emergency.stage === 'serving') {
    if (!model.vehicles.some(vehicle => vehicle.id === emergency.id)) {
      model.phase = 'EMERGENCY_AMBER'
      model.phaseRemaining = 2
      emergency.stage = 'returning'
    } else {
      model.phaseRemaining = Math.max(0, model.phaseRemaining - dt)
    }
    return true
  }

  if (emergency.stage === 'returning') {
    model.phaseRemaining = Math.max(0, model.phaseRemaining - dt)
    if (model.phaseRemaining <= 1e-8) {
      model.phase = 'EMERGENCY_RETURN_CLEARANCE'
      model.phaseRemaining = CLEARANCE_SECONDS
      emergency.stage = 'return-clearing'
    }
    return true
  }

  if (emergency.stage === 'return-clearing') {
    model.phaseRemaining = Math.max(0, model.phaseRemaining - dt)
    if (model.phaseRemaining <= 1e-8 && !isIntersectionOccupied(model)) {
      model.phase = axisForDirection(emergency.direction) === 'NS' ? 'ALL_RED_NS_EW' : 'ALL_RED_EW_NS'
      model.phaseRemaining = 0
      model.emergency = null
    }
    return true
  }

  return false
}

function moveVehicles(model, dt, config) {
  const signals = getSignals(model)
  const axis = model.phase === 'EMERGENCY_GREEN'
    ? axisForDirection(model.emergency.direction)
    : axisForPhase(model.phase)
  const acceptingEntries = axis && model.phaseRemaining > GREEN_ENTRY_BUFFER
  let queueVehicles = 0

  for (const direction of DIRECTIONS) {
    const route = ROUTES[direction]
    const list = model.vehicles
      .filter((vehicle) => vehicle.direction === direction)
      .sort((a, b) => b.progress - a.progress)
    let leader = null

    for (const vehicle of list) {
      const current = vehicle.progress
      const stopProgress = PATH_LENGTH / 2 - STOP_EDGE - vehicle.length / 2 - 0.5
      const phaseAllows = signals[direction] === 'green'
      const arm = vehicle.progress < PATH_LENGTH / 2 ? direction : OPPOSITE_DIRECTION[direction]
      const configuredSpeed = Number(config.speedLimits?.[arm]) / 3.6
      const maxSpeed = Number.isFinite(configuredSpeed) && configuredSpeed > 0
        ? Math.min(VEHICLE_TYPES[vehicle.type].speed, configuredSpeed)
        : VEHICLE_TYPES[vehicle.type].speed
      let target = current + maxSpeed * dt
      if (current <= stopProgress + 0.15 && (!phaseAllows || !acceptingEntries)) {
        target = Math.min(target, stopProgress)
      }

      if (leader) {
        const followingLimit = leader.progress - leader.length / 2 - vehicle.length / 2 - GAP
        target = Math.min(target, followingLimit)
      }
      const isCrossingActive = model.crossingState !== 'open' || (config.crossingState && config.crossingState !== 'open')
      const activeCrossingDirections = config.crossingDirections?.length ? config.crossingDirections : ['north']
      if (isCrossingActive) {
        for (const crossingDirection of activeCrossingDirections) {
          const crossingPosition = crossingPositionForRoute(direction, crossingDirection)
          if (crossingPosition === null) continue
          const crossingStop = crossingPosition - vehicle.length / 2 - 1.5
          if (current <= crossingStop + 0.15) target = Math.min(target, crossingStop)
        }
      }
      target = Math.max(current, target)
      vehicle.progress = target
      vehicle.speed = dt > 0 ? (target - current) / dt : 0
      vehicle.x = route.x + route.dx * vehicle.progress
      vehicle.z = route.z + route.dz * vehicle.progress
      if (vehicle.speed < 0.25) {
        vehicle.waitTime += dt
        if (vehicle.progress < stopProgress + 0.2) queueVehicles += 1
      }
      leader = vehicle
    }
  }

  model.totalQueueVehicleSeconds += (queueVehicles / DIRECTIONS.length) * dt
  const weights = config.demandWeights
  const spawnRate = Math.max(0, Math.min(100, Number(config.spawnRate) || 0))
  if (spawnRate > 0) {
    model.spawnTimer -= dt
    if (model.spawnTimer <= 0) {
      trySpawn(model, { demandWeights: weights })
      const baseInterval = 6.5 - 5.3 * (spawnRate / 100)
      model.spawnTimer = baseInterval * (0.82 + model.random() * 0.36)
    }
  }

  const stillActive = []
  for (const vehicle of model.vehicles) {
    if (vehicle.progress > PATH_LENGTH + vehicle.length / 2) {
      model.totalPassed += 1
      model.totalWaitCompleted += vehicle.waitTime
      model.totalWaitCompletedByDirection[vehicle.direction] += vehicle.waitTime
      if (vehicle.waitTime > 0.1) {
        model.waitedVehicles += 1
        model.waitedVehiclesByDirection[vehicle.direction] += 1
      }
      model.passedByType[vehicle.type] += 1
      if (vehicle.type === 'ambulance' && model.emergency?.id === vehicle.id) {
        model.emergency.stage = 'returning'
        model.phase = 'EMERGENCY_AMBER'
        model.phaseRemaining = 2
      }
    } else stillActive.push(vehicle)
  }
  model.vehicles = stillActive
}

export function stepSimulation(model, dt, config = {}) {
  if (!(dt > 0)) return model
  model.elapsedTime += dt
  advanceRailwayCrossing(model, dt, config)
  activateWaitingAmbulance(model)
  const emergencyOwnsController = advanceEmergencyController(model, dt)
  if (!emergencyOwnsController) advanceController(model, dt, config)
  moveVehicles(model, dt, config)
  return model
}

export function getApproachMeasurements(model) {
  return approachMeasurements(model)
}

export function getSimulationSnapshot(model) {
  const queues = queueCounts(model)
  const waitingNow = model.vehicles.filter((vehicle) => vehicle.waitTime > 0.1).length
  const activeWait = model.vehicles.reduce((sum, vehicle) => sum + vehicle.waitTime, 0)
  const avgWaitCount = model.waitedVehicles + model.vehicles.filter((vehicle) => vehicle.waitTime > 0.1).length
  const avgWait = avgWaitCount
    ? (model.totalWaitCompleted + activeWait) / avgWaitCount
    : null
  const maxQueue = Math.max(...DIRECTIONS.map((direction) => queues[direction]))

  return {
    vehicles: model.vehicles.map((vehicle) => ({ ...vehicle })),
    signals: getSignals(model),
    phase: model.phase,
    phaseRemaining: model.phaseRemaining,
    currentGreenDuration: model.currentGreenDuration,
    crossingState: model.crossingState,
    crossingRemaining: model.crossingRemaining,
    emergency: model.emergency ? { ...model.emergency } : null,
    elapsedTime: model.elapsedTime,
    queues,
    approaches: approachMeasurements(model),
    stats: {
      totalPassed: model.totalPassed,
      activeVehicles: model.vehicles.length,
      avgWaitTimeSec: avgWait,
      throughputPerMinute: model.elapsedTime > 0 ? model.totalPassed * 60 / model.elapsedTime : 0,
      averageQueue: model.elapsedTime > 0 ? model.totalQueueVehicleSeconds / model.elapsedTime : 0,
      waitingVehicles: waitingNow,
      congestionLevel: maxQueue >= 7 ? 'High' : maxQueue >= 3 ? 'Moderate' : 'Low',
      composition: { ...model.passedByType },
    },
  }
}

export function runModelForDuration(model, seconds, config, step = 1 / 30) {
  let remaining = seconds
  while (remaining > 1e-8) {
    const dt = Math.min(step, remaining)
    stepSimulation(model, dt, config)
    remaining -= dt
  }
  return getSimulationSnapshot(model)
}
