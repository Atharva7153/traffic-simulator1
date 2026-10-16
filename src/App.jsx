/**
 * App.jsx — Root application component.
 * Wraps the dashboard in simulation state provider.
 */
import { SimulationProvider } from './simulation/simulationState'
import { MotionConfig } from 'motion/react'
import Header from './components/Header'
import Dashboard from './components/Dashboard'

export default function App() {
  return (
    <MotionConfig reducedMotion="user">
      <SimulationProvider>
        <div className="h-screen flex flex-col bg-junction-dark">
          <Header />
          <Dashboard />
        </div>
      </SimulationProvider>
    </MotionConfig>
  )
}
