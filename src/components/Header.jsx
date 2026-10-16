/**
 * Header.jsx — Top navigation bar with product identity and navigation.
 */
import { Activity, Settings, Radio, Hammer, Brain } from 'lucide-react'
import { motion } from 'motion/react'
import { useSimulation } from '../simulation/useSimulation'

const NAV_ITEMS = [
  { id: 'simulation', label: 'Simulation', short: 'Sim', icon: Activity },
  { id: 'builder', label: 'Junction Builder', short: 'Builder', icon: Hammer },
  { id: 'analytics', label: 'Analytics', short: 'Analytics', icon: Brain },
  { id: 'settings', label: 'Settings', short: 'Settings', icon: Settings },
]

export default function Header() {
  const { activeView, setView, isRunning } = useSimulation()

  return (
    <header className="flex min-h-[64px] min-w-0 items-center justify-between gap-2 border-b border-junction-border bg-white px-3 py-2.5 shadow-sm z-10 shrink-0 sm:gap-4 sm:px-5">
      {/* Brand */}
      <div className="flex min-w-0 shrink items-center gap-2 sm:gap-3">
        <div className="w-9 h-9 rounded-xl bg-junction-accent flex items-center justify-center">
          <Radio className="w-4 h-4" style={{ color: '#fff' }} />
        </div>
        <div>
          <h1 className="whitespace-nowrap text-[11px] font-bold tracking-wide text-junction-text leading-none sm:text-sm">
            TRAFFIC JUNCTION SIMULATOR
          </h1>
          <p className="mt-0.5 hidden text-[10px] uppercase tracking-widest text-junction-muted sm:block">
            Smart Signals. Smoother Cities.
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex shrink-0 items-center gap-0.5 sm:gap-1">
        {NAV_ITEMS.map(({ id, label, short, icon: Icon }) => {
          const isActive = activeView === id

          return (
            <button
              key={id}
              onClick={() => setView(id)}
              aria-label={label}
              className={`relative flex items-center gap-1.5 rounded-lg px-2 py-2 text-[11px] font-semibold transition-colors sm:gap-2 sm:px-3 sm:text-xs ${
                isActive
                  ? 'text-junction-accent bg-junction-accent/10'
                  : 'text-junction-muted hover:text-junction-text hover:bg-junction-dark'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden xl:inline">{label}</span>
              <span className="xl:hidden">{short}</span>
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
        <div className={`w-2 h-2 rounded-full ${isRunning ? 'bg-junction-green' : 'bg-slate-400'}`} />
        <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${isRunning ? 'bg-emerald-50 text-junction-green' : 'bg-slate-100 text-junction-muted'}`}>
          {isRunning ? 'Running' : 'Paused'}
        </span>
      </div>
    </header>
  )
}
