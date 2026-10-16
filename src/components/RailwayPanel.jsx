import { TrainFront, Radio } from 'lucide-react'
import { useSimulation } from '../simulation/useSimulation'

const statusColor = {
  OPEN: 'text-emerald-700 bg-emerald-50', WARNING: 'text-amber-800 bg-amber-50',
  CLOSED: 'text-red-700 bg-red-50', 'TRAIN PASSING': 'text-red-700 bg-red-50',
  CLEARANCE: 'text-indigo-700 bg-indigo-50', REOPENING: 'text-sky-700 bg-sky-50',
}

export default function RailwayPanel() {
  const { railwayStatus, railwayProgress, railwayMode, setRailwayMode, autoTrainIn, dispatchTrain } = useSimulation()
  const active = railwayStatus !== 'OPEN'
  return (
    <section className="rounded-lg border border-junction-border bg-white p-3" aria-label="Railway crossing controls">
      <div className="mb-2 flex items-center justify-between">
        <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-junction-muted">
          <TrainFront className="h-4 w-4 text-junction-accent" /> Railway crossing
        </h3>
        <span className={`rounded-full px-2 py-1 text-[9px] font-bold ${statusColor[railwayStatus] || statusColor.OPEN}`}>{railwayStatus}</span>
      </div>
      <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-slate-100" aria-label={`Train progress ${Math.round(railwayProgress * 100)} percent`}>
        <div className="h-full rounded-full bg-amber-500 transition-[width] duration-100" style={{ width: `${railwayProgress * 100}%` }} />
      </div>
      <button
        onClick={dispatchTrain}
        disabled={active}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-junction-accent px-3 py-2 text-xs font-semibold text-white transition hover:bg-junction-accent-dim disabled:cursor-not-allowed disabled:opacity-45"
      >
        <TrainFront className="h-3.5 w-3.5" /> {active ? 'Train crossing active' : 'Dispatch Train'}
      </button>
      <div className="mt-2 flex items-center justify-between text-[9px] text-junction-muted">
        <span>{railwayMode === 'automatic' ? `Automatic · next in ${autoTrainIn}s` : 'Manual dispatch'}</span>
        {railwayMode === 'manual' ? (
          <button onClick={() => setRailwayMode('automatic')} className="font-semibold text-junction-accent hover:underline">Return to Automatic</button>
        ) : (
          <button onClick={() => setRailwayMode('manual')} className="flex items-center gap-1 font-medium hover:text-junction-text"><Radio className="h-3 w-3" /> Manual</button>
        )}
      </div>
      <p className="mt-2 text-[9px] leading-relaxed text-junction-muted">Independent train demo; junction traffic is not routed through this crossing.</p>
    </section>
  )
}
