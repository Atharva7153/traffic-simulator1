/**
 * Simulation state management using React context.
 * Phase 1: Provides basic signal cycling, play/pause, and spawn rate control.
 * Phase 2 will extend this with the full traffic simulation engine.
 */

import { createContext, useContext, useReducer, useCallback, useRef, useEffect } from 'react'

// Signal phases: which directions get green
const SIGNAL_PHASES = [
  { name: 'NS_GREEN', north: 'green', south: 'green', east: 'red', west: 'red', duration: 8000 },
  { name: 'NS_AMBER', north: 'amber', south: 'amber', east: 'red', west: 'red', duration: 2000 },
  { name: 'EW_GREEN', north: 'red', south: 'red', east: 'green', west: 'green', duration: 8000 },
  { name: 'EW_AMBER', north: 'red', south: 'red', east: 'amber', west: 'amber', duration: 2000 },
]

const initialState = {
  isRunning: false,
  currentPhaseIndex: 0,
  signals: {
    north: 'red',
    south: 'red',
    east: 'green',
    west: 'green',
  },
  spawnRate: 50, // 0-100 slider value
  stats: {
    totalVehicles: 0,
    avgWaitTime: '--',
    throughput: '--',
    congestionLevel: 'Low',
  },
  elapsedTime: 0,
  activeView: 'simulation', // simulation | analytics | settings
}

function simulationReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_RUNNING':
      return { ...state, isRunning: !state.isRunning }
    case 'RESET':
      return { ...initialState }
    case 'SET_SPAWN_RATE':
      return { ...state, spawnRate: action.payload }
    case 'ADVANCE_PHASE': {
      const nextIndex = (state.currentPhaseIndex + 1) % SIGNAL_PHASES.length
      const phase = SIGNAL_PHASES[nextIndex]
      return {
        ...state,
        currentPhaseIndex: nextIndex,
        signals: {
          north: phase.north,
          south: phase.south,
          east: phase.east,
          west: phase.west,
        },
      }
    }
    case 'SET_VIEW':
      return { ...state, activeView: action.payload }
    case 'TICK':
      return { ...state, elapsedTime: state.elapsedTime + 1 }
    default:
      return state
  }
}

const SimulationContext = createContext(null)

export function SimulationProvider({ children }) {
  const [state, dispatch] = useReducer(simulationReducer, initialState)
  const timerRef = useRef(null)
  const phaseTimerRef = useRef(null)

  const toggleRunning = useCallback(() => dispatch({ type: 'TOGGLE_RUNNING' }), [])
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' })
  }, [])
  const setSpawnRate = useCallback((val) => dispatch({ type: 'SET_SPAWN_RATE', payload: val }), [])
  const setView = useCallback((view) => dispatch({ type: 'SET_VIEW', payload: view }), [])

  // Signal cycling timer
  useEffect(() => {
    if (state.isRunning) {
      const phase = SIGNAL_PHASES[state.currentPhaseIndex]
      phaseTimerRef.current = setTimeout(() => {
        dispatch({ type: 'ADVANCE_PHASE' })
      }, phase.duration)

      // Elapsed time ticker
      timerRef.current = setInterval(() => {
        dispatch({ type: 'TICK' })
      }, 1000)
    }

    return () => {
      if (phaseTimerRef.current) clearTimeout(phaseTimerRef.current)
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [state.isRunning, state.currentPhaseIndex])

  const value = {
    ...state,
    toggleRunning,
    reset,
    setSpawnRate,
    setView,
  }

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  )
}

export function useSimulation() {
  const ctx = useContext(SimulationContext)
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider')
  return ctx
}

export { SIGNAL_PHASES }
