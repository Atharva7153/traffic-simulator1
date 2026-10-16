/**
 * useSimulation.js — Custom hook to access simulation state.
 */
import { useContext } from 'react'
import { SimulationContext } from './simulationContext'

export function useSimulation() {
  const ctx = useContext(SimulationContext)
  if (!ctx) throw new Error('useSimulation must be used within SimulationProvider')
  return ctx
}
