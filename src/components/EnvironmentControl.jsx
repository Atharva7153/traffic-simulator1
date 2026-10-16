import { Moon, Sun, Sunset } from 'lucide-react'
import { useSimulation } from '../simulation/useSimulation'

const MODES = [
  { id: 'day', label: 'Day', Icon: Sun },
  { id: 'sunset', label: 'Sunset', Icon: Sunset },
  { id: 'night', label: 'Night', Icon: Moon },
]

export default function EnvironmentControl({ compact = false }) {
  const { environmentMode, setEnvironmentMode } = useSimulation()
  return (
    <div role="group" aria-label="Environment lighting" className="flex items-center gap-1 rounded-xl border border-junction-border bg-white/95 p-1 shadow-sm">
      {MODES.map(({ id, label, Icon }) => {
        const active = environmentMode === id
        return (
          <button
            key={id}
            type="button"
            aria-pressed={active}
            aria-label={`${label} environment`}
            title={`${label} environment`}
            onClick={() => setEnvironmentMode(id)}
            style={active ? { color: '#ffffff' } : undefined}
            className={`flex items-center justify-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${active ? 'bg-junction-accent text-white shadow-sm' : 'text-junction-muted hover:bg-junction-dark hover:text-junction-text'}`}
          >
            <Icon className="h-3.5 w-3.5" />
            {!compact && <span>{label}</span>}
          </button>
        )
      })}
    </div>
  )
}
