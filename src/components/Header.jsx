/**
 * Header.jsx — Top navigation bar with product identity and navigation.
 */
import { Activity, BarChart3, Settings, Radio } from 'lucide-react'
import { motion } from 'motion/react'
import { useSimulation } from '../simulation/simulationState'

const NAV_ITEMS = [
  { id: 'simulation', label: 'Simulation', icon: Activity },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'settings', label: 'Settings', icon: Settings },
]

export default function Header() {
  const { activeView, setView, isRunning } = useSimulation()

  return (
    <header className="flex items-center justify-between px-5 py-3 border-b border-junction-border bg-junction-card/80 backdrop-blur-md z-10">
      {/* Brand */}
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
          <Radio className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-sm font-bold tracking-wide text-white leading-none">
            TRAFFIC JUNCTION SIMULATOR
          </h1>
          <p className="text-[10px] text-junction-muted tracking-widest uppercase mt-0.5">
            Smart Signals. Smoother Cities.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex items-center gap-1">
        {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
          const isActive = activeView === id
          const isDisabled = id !== 'simulation' // Phase 1: only simulation is active

          return (
            <button
              key={id}
              onClick={() => !isDisabled && setView(id)}
              disabled={isDisabled}
              className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                isActive
                  ? 'text-junction-accent'
                  : isDisabled
                  ? 'text-junction-muted/40 cursor-not-allowed'
                  : 'text-junction-muted hover:text-junction-text'
              }`}
              title={isDisabled ? `${label} — Coming in Phase 2` : label}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
              {isActive && (
                <motion.div
                  layoutId="nav-indicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-junction-accent rounded-full"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
            </button>
          )
        })}
      </nav>

      {/* Status indicator */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-junction-green animate-pulse' : 'bg-junction-muted'}`} />
        <span className="text-xs text-junction-muted">
          {isRunning ? 'Running' : 'Paused'}
        </span>
      </div>
    </header>
  )
}
