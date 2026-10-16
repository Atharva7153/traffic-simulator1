/**
 * SimulationProvider.jsx / simulationState.jsx
 * Provides simulation state, timer loops, and controls to the application.
 */

import { useReducer, useCallback, useRef, useEffect } from 'react'
import { createDefaultJunction } from '../network/networkData'
import { SIGNAL_PHASES } from './simulationConstants'
import { SimulationContext } from './simulationContext'

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
  activeView: 'simulation', // 'simulation' | 'builder' | 'analytics' | 'settings'
  viewMode: '3d', // '3d' | '2d' (Top-down HTML Canvas)
  network: createDefaultJunction(), // Data-driven road network architecture
}

function simulationReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_RUNNING':
      return { ...state, isRunning: !state.isRunning }
    case 'RESET':
      return {
        ...initialState,
        viewMode: state.viewMode,
        activeView: state.activeView,
        network: state.network,
      }
    case 'SET_SPAWN_RATE':
      return { ...state, spawnRate: action.payload }
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload }
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
    case 'SET_NETWORK':
      return { ...state, network: action.payload }
    default:
      return state
  }
}

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
  const setViewMode = useCallback((mode) => dispatch({ type: 'SET_VIEW_MODE', payload: mode }), [])
  const setNetwork = useCallback((net) => dispatch({ type: 'SET_NETWORK', payload: net }), [])

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
    setViewMode,
    setNetwork,
  }

  return (
    <SimulationContext.Provider value={value}>
      {children}
    </SimulationContext.Provider>
  )
}

export default SimulationProvider
