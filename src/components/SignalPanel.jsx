/**
 * SignalPanel.jsx — Visual status of all four traffic signals.
 */
import { motion } from 'motion/react'
import { useSimulation } from '../simulation/useSimulation'

const DIRECTIONS = [
  { key: 'north', label: 'North', short: 'N' },
  { key: 'south', label: 'South', short: 'S' },
  { key: 'east', label: 'East', short: 'E' },
  { key: 'west', label: 'West', short: 'W' },
]

const SIGNAL_COLORS = {
  red: { bg: 'bg-red-600', glow: '', text: 'text-red-700' },
  amber: { bg: 'bg-amber-500', glow: '', text: 'text-amber-700' },
  green: { bg: 'bg-emerald-600', glow: '', text: 'text-emerald-700' },
}

function SignalDot({ color, isActive }) {
  const cfg = SIGNAL_COLORS[color]
  return (
    <div
      className={`w-3 h-3 rounded-full transition-all duration-300 ${
        isActive ? `${cfg.bg} shadow-md ${cfg.glow}` : 'bg-gray-700'
      }`}
    />
  )
}

function DirectionSignal({ label, short, signalState, queueLength }) {
  const cfg = SIGNAL_COLORS[signalState]
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-md bg-black/20">
      <div className="w-7 h-7 rounded-md bg-junction-border flex items-center justify-center">
        <span className="text-xs font-bold text-white">{short}</span>
      </div>
      <div className="flex-1">
        <div className="text-xs font-medium text-junction-text">{label}</div>
        <div className={`text-[10px] font-medium uppercase tracking-wider ${cfg.text}`}>
          {signalState}
        </div>
      </div>
      <span className="rounded bg-white/5 px-1.5 py-0.5 font-mono text-[10px] text-junction-muted" title="Vehicles currently queued">
        {queueLength}
      </span>
      <div className="flex flex-col gap-1">
        <SignalDot color="red" isActive={signalState === 'red'} />
        <SignalDot color="amber" isActive={signalState === 'amber'} />
        <SignalDot color="green" isActive={signalState === 'green'} />
      </div>
    </div>
  )
}

export default function SignalPanel() {
  const { signals, queues, phase, phaseRemaining, controllerMode } = useSimulation()

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="bg-junction-card border border-junction-border rounded-lg p-3"
    >
      <h3 className="text-xs font-semibold text-junction-muted uppercase tracking-wider mb-2">
        Signal Status
      </h3>
      <div className="mb-2 flex items-center justify-between rounded-md border border-junction-border bg-black/20 px-2.5 py-1.5">
        <span className="text-[9px] font-semibold uppercase tracking-wider text-junction-muted">
          {controllerMode} · {phase.replaceAll('_', ' ')}
        </span>
        <span className="font-mono text-xs font-bold text-white">{Math.ceil(phaseRemaining)}s</span>
      </div>
      <div className="flex flex-col gap-1.5">
        {DIRECTIONS.map(({ key, label, short }) => (
          <DirectionSignal
            key={key}
            label={label}
            short={short}
            signalState={signals[key]}
            queueLength={queues[key]}
          />
        ))}
      </div>
    </motion.div>
  )
}
