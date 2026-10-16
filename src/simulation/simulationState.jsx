/** Shared UI state and requestAnimationFrame-driven traffic simulation. */
import { useCallback, useEffect, useRef, useState } from 'react'
import { createDefaultJunction, getDirectionalSpeedLimits, validateNetwork } from '../network/networkData'
import { SCENARIO_PRESETS, calculateOptimalTiming } from '../analysis/trafficAnalysis'
import {
  createSimulationModel,
  dispatchAmbulance as dispatchAmbulanceOnModel,
  getSimulationSnapshot,
  startRailwayCrossingCycle,
  stepSimulation,
} from './simulationEngine'
import { SimulationContext } from './simulationContext'

function loadSavedNetwork() {
  const fallback = createDefaultJunction()
  try {
    if (typeof window === 'undefined') return fallback
    const saved = window.localStorage.getItem('swayambhu-junction-network')
    if (!saved) return fallback
    const stored = JSON.parse(saved)
    const parsed = {
      ...stored,
      railwayCrossings: Array.isArray(stored.railwayCrossings) ? stored.railwayCrossings : [],
      metroEnabled: stored.metroEnabled === true,
    }
    return validateNetwork(parsed).length ? fallback : parsed
  } catch {
    return fallback
  }
}

function loadEnvironmentMode() {
  try {
    const saved = window.localStorage.getItem('swayambhu-environment-mode')
    return ['day', 'sunset', 'night'].includes(saved) ? saved : 'day'
  } catch {
    return 'day'
  }
}

export function SimulationProvider({ children }) {
  const [initialModel] = useState(createSimulationModel)
  const modelRef = useRef(initialModel)
  const [snapshot, setSnapshot] = useState(() => getSimulationSnapshot(initialModel))
  const [isRunning, setIsRunning] = useState(false)
  const [spawnRate, setSpawnRate] = useState(50)
  const [simSpeed, setSimSpeed] = useState(1)
  const [controllerMode, setControllerMode] = useState('fixed')
  const [demandScenario, setDemandScenario] = useState('balanced')
  const [activeView, setActiveView] = useState('simulation')
  const [viewMode, setViewMode] = useState('3d')
  const [network, setNetwork] = useState(loadSavedNetwork)
  const [environmentMode, setEnvironmentMode] = useState(loadEnvironmentMode)

  const configRef = useRef(null)
  useEffect(() => {
    configRef.current = {
      spawnRate,
      simSpeed,
      controllerMode,
      demandWeights: SCENARIO_PRESETS[demandScenario]?.demandWeights,
      speedLimits: getDirectionalSpeedLimits(network),
      crossingDirections: (network.railwayCrossings || []).map(crossing => crossing.direction),
      selectGreenDuration: (axis, measurements) => {
        if (controllerMode !== 'adaptive') return 13
        const recommendation = calculateOptimalTiming(measurements, 34)
        return axis === 'NS'
          ? recommendation.phaseAllocation.nsGreenSec
          : recommendation.phaseAllocation.ewGreenSec
      },
    }
  }, [spawnRate, simSpeed, controllerMode, demandScenario, network])

  useEffect(() => {
    try {
      window.localStorage.setItem('swayambhu-junction-network', JSON.stringify(network))
    } catch {
      // The editor remains usable when browser storage is unavailable.
    }
  }, [network])

  useEffect(() => {
    try {
      window.localStorage.setItem('swayambhu-environment-mode', environmentMode)
    } catch {
      // Keep the environment selector usable if browser storage is unavailable.
    }
  }, [environmentMode])

  const toggleRunning = useCallback(() => setIsRunning((running) => !running), [])
  const reset = useCallback(() => {
    modelRef.current = createSimulationModel()
    setSnapshot(getSimulationSnapshot(modelRef.current))
    setIsRunning(false)
  }, [])
  const startRailwayCycle = useCallback(() => {
    if (startRailwayCrossingCycle(modelRef.current)) setSnapshot(getSimulationSnapshot(modelRef.current))
  }, [])
  const dispatchAmbulance = useCallback(() => {
    const dispatched = dispatchAmbulanceOnModel(modelRef.current)
    if (!dispatched) return false
    setSnapshot(getSimulationSnapshot(modelRef.current))
    setIsRunning(true)
    return true
  }, [])
  const setView = useCallback((view) => setActiveView(view), [])

  useEffect(() => {
    if (!isRunning) return undefined

    const fixedStep = 1 / 30
    let frameId = null
    let lastTime = null
    let accumulator = 0
    let publishAccumulator = 0

    const frame = (now) => {
      if (lastTime === null) lastTime = now
      const realDelta = Math.min((now - lastTime) / 1000, 0.15)
      lastTime = now
      accumulator += realDelta * configRef.current.simSpeed

      let steps = 0
      while (accumulator >= fixedStep && steps < 12) {
        stepSimulation(modelRef.current, fixedStep, configRef.current)
        accumulator -= fixedStep
        steps += 1
      }

      publishAccumulator += realDelta
      if (publishAccumulator >= 0.08) {
        setSnapshot(getSimulationSnapshot(modelRef.current))
        publishAccumulator = 0
      }
      frameId = requestAnimationFrame(frame)
    }

    frameId = requestAnimationFrame(frame)
    return () => {
      if (frameId !== null) cancelAnimationFrame(frameId)
    }
  }, [isRunning])

  const value = {
    ...snapshot,
    isRunning,
    spawnRate,
    setSpawnRate,
    simSpeed,
    setSimSpeed,
    controllerMode,
    setControllerMode,
    demandScenario,
    setDemandScenario,
    activeView,
    viewMode,
    network,
    environmentMode,
    setEnvironmentMode,
    toggleRunning,
    reset,
    setView,
    setViewMode,
    setNetwork,
    startRailwayCycle,
    dispatchAmbulance,
    railwayCrossings: network.railwayCrossings || [],
  }

  return <SimulationContext.Provider value={value}>{children}</SimulationContext.Provider>
}

export default SimulationProvider
