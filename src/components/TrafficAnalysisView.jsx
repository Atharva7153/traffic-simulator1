/** Local traffic analysis based on simulation measurements and explicit demand profiles. */
import { useMemo, useState } from 'react'
import { Activity, Brain, Cpu, Play, Timer, TrafficCone, Zap } from 'lucide-react'
import { useSimulation } from '../simulation/useSimulation'
import { SCENARIO_PRESETS, calculateOptimalTiming, runStrategyComparison } from '../analysis/trafficAnalysis'
import { getDirectionalSpeedLimits } from '../network/networkData'

const DIRECTIONS = ['north', 'south', 'east', 'west']
const TYPES = [
  { key: 'sedan', label: 'Cars', color: 'bg-blue-500' },
  { key: 'suv', label: 'SUVs', color: 'bg-red-500' },
  { key: 'bus', label: 'Buses', color: 'bg-amber-500' },
  { key: 'auto', label: 'Autos', color: 'bg-emerald-500' },
  { key: 'motorcycle', label: 'Motorcycles', color: 'bg-slate-500' },
  { key: 'ambulance', label: 'Ambulance', color: 'bg-rose-500' },
]
const APPROACH_MIX = [
  { key: 'cars', color: 'bg-blue-500' },
  { key: 'buses', color: 'bg-amber-500' },
  { key: 'autos', color: 'bg-emerald-500' },
  { key: 'twoWheelers', color: 'bg-slate-500' },
]

function Metric({ label, value, suffix = '' }) {
  return (
    <div className="rounded-lg border border-white/5 bg-black/20 p-3">
      <div className="text-[9px] uppercase tracking-wider text-junction-muted">{label}</div>
      <div className="mt-1 text-lg font-bold text-white tabular-nums">{value}<span className="ml-1 text-[10px] font-normal text-junction-muted">{suffix}</span></div>
    </div>
  )
}

function formatMetric(value, digits = 1) {
  return value === null || !Number.isFinite(value) ? '—' : value.toFixed(digits)
}

function loadComparison() {
  try {
    return typeof window === 'undefined' ? null : JSON.parse(window.sessionStorage.getItem('swayambhu-signal-comparison'))
  } catch {
    return null
  }
}

export default function TrafficAnalysisView() {
  const {
    setView, demandScenario, setDemandScenario, approaches, stats, elapsedTime,
    spawnRate, controllerMode, setControllerMode, railwayCrossings, network,
  } = useSimulation()
  const [comparison, setComparison] = useState(loadComparison)
  const [comparing, setComparing] = useState(false)
  const activeScenario = SCENARIO_PRESETS[demandScenario]
  const recommendation = useMemo(() => calculateOptimalTiming(approaches, 34), [approaches])
  const passedTypeTotal = Object.values(stats.composition).reduce((sum, count) => sum + count, 0)

  const compare = () => {
    setComparing(true)
    requestAnimationFrame(() => {
      const result = runStrategyComparison({
        scenario: demandScenario,
        spawnRate,
        durationSec: 180,
        crossingDirections: railwayCrossings.map(crossing => crossing.direction),
        speedLimits: getDirectionalSpeedLimits(network),
      })
      setComparison(result)
      try {
        window.sessionStorage.setItem('swayambhu-signal-comparison', JSON.stringify(result))
      } catch {
        // Results remain visible in the current view without browser storage.
      }
      setComparing(false)
    })
  }

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-junction-dark">
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-5 border-b border-junction-border gap-4">
        <div>
          <div className="flex items-center gap-2 text-junction-accent text-xs font-semibold uppercase tracking-wider">
            <Brain className="w-4 h-4" />
            <span>Local Traffic Intelligence</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Measured demand & signal timing</h2>
          <p className="text-xs text-junction-muted mt-1 max-w-2xl">
            Queue, wait, and vehicle counts come from this run. Scenario profiles only shape future arrivals; they are not observed city data.
          </p>
        </div>
        <button
          onClick={() => setView('simulation')}
          className="self-start md:self-auto px-3.5 py-1.5 rounded-lg text-xs font-medium bg-junction-accent/15 text-junction-accent border border-junction-accent/30 hover:bg-junction-accent/25 transition-colors"
        >
          Return to Simulation
        </button>
      </div>

      <section className="my-5">
        <div className="mb-2 flex items-center gap-2">
          <Activity className="h-4 w-4 text-junction-accent" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-white">Arrival scenario</h3>
          <span className="text-[10px] text-junction-muted">Assumed directional shares for generated vehicles</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {Object.entries(SCENARIO_PRESETS).map(([key, scenario]) => {
            const selected = key === demandScenario
            return (
              <button
                key={key}
                onClick={() => setDemandScenario(key)}
                aria-pressed={selected}
                className={`rounded-xl border p-4 text-left transition-colors ${selected ? 'border-junction-accent bg-junction-accent/10' : 'border-junction-border bg-junction-card hover:border-white/20'}`}
              >
                <span className={`text-xs font-bold ${selected ? 'text-junction-accent' : 'text-white'}`}>{scenario.name}</span>
                <p className="mt-1 text-[11px] leading-relaxed text-junction-muted">{scenario.description}</p>
                <div className="mt-3 flex gap-2 text-[9px] uppercase tracking-wider text-junction-muted">
                  {DIRECTIONS.map((direction) => (
                    <span key={direction}>{direction[0]} {Math.round(scenario.demandWeights[direction] * 100)}%</span>
                  ))}
                </div>
              </button>
            )
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
        <section className="rounded-xl border border-junction-border bg-junction-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Live approach measurements</h3>
              <p className="mt-1 text-[10px] text-junction-muted">{elapsedTime.toFixed(1)} simulation seconds · {activeScenario.name} profile</p>
            </div>
            <span className="rounded border border-junction-border px-2 py-1 text-[9px] uppercase text-junction-muted">from this run</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {approaches.map((approach) => (
              <div key={approach.direction} className="rounded-lg border border-white/5 bg-black/20 p-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-white">{approach.direction}</span>
                  <span className="text-[10px] text-junction-muted">{approach.arrivalsObserved} arrived</span>
                </div>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-xl font-bold text-white">{approach.queueLength}</span>
                  <span className="text-[10px] text-junction-muted">queued</span>
                  <span className="ml-auto text-[10px] text-junction-accent">{approach.avgWaitTimeSec.toFixed(1)}s avg wait</span>
                </div>
                <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/5 flex" title="Current active vehicle mix on this approach">
                  {APPROACH_MIX.map(({ key, color }) => (
                    <div key={key} className={color} style={{ width: `${approach.composition[key]}%` }} />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 rounded-lg border border-white/5 bg-black/20 p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-junction-muted">Passed vehicle mix</span>
              <span className="text-[10px] text-junction-muted">{passedTypeTotal} completed vehicles</span>
            </div>
            <div className="flex h-2 overflow-hidden rounded-full bg-white/5">
              {TYPES.map(({ key, color }) => (
                <div key={key} className={color} style={{ width: `${passedTypeTotal ? (stats.composition[key] / passedTypeTotal) * 100 : 0}%` }} />
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-junction-muted">
              {TYPES.map(({ key, label }) => <span key={key}>{label} {stats.composition[key]}</span>)}
            </div>
          </div>
          {elapsedTime === 0 && <p className="mt-3 text-[10px] text-junction-amber">Start the simulation to collect measured queues and arrivals.</p>}
        </section>

        <section className="rounded-xl border border-junction-border bg-junction-card p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-white">Measured signal split</h3>
              <p className="mt-1 text-[10px] text-junction-muted">Adaptive controller uses current queues and arrivals · 34s target cycle</p>
            </div>
            <div className="flex rounded-md bg-black/30 p-1">
              {['fixed', 'adaptive'].map((mode) => (
                <button key={mode} onClick={() => setControllerMode(mode)} aria-pressed={controllerMode === mode}
                  className={`rounded px-2 py-1 text-[10px] capitalize ${controllerMode === mode ? 'bg-junction-accent text-junction-dark' : 'text-junction-muted'}`}>
                  {mode}
                </button>
              ))}
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-[10px] text-junction-muted"><span>Fixed baseline</span><span>NS 13s · EW 13s green</span></div>
              <div className="flex h-4 overflow-hidden rounded bg-black/40"><div className="bg-blue-400" style={{ width: `${13 / 34 * 100}%` }} /><div className="bg-amber-400" style={{ width: `${3 / 34 * 100}%` }} /><div className="bg-emerald-400" style={{ width: `${13 / 34 * 100}%` }} /><div className="bg-amber-400" style={{ width: `${3 / 34 * 100}%` }} /><div className="bg-slate-600" style={{ width: `${2 / 34 * 100}%` }} /></div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-[10px] text-junction-muted"><span>Adaptive allocation from current measurements</span><span>NS {recommendation.phaseAllocation.nsGreenSec}s · EW {recommendation.phaseAllocation.ewGreenSec}s</span></div>
              <div className="flex h-4 overflow-hidden rounded bg-black/40 ring-1 ring-junction-accent/30"><div className="bg-cyan-400" style={{ width: `${recommendation.phaseAllocation.nsGreenSec / 34 * 100}%` }} /><div className="bg-amber-400" style={{ width: `${3 / 34 * 100}%` }} /><div className="bg-emerald-400" style={{ width: `${recommendation.phaseAllocation.ewGreenSec / 34 * 100}%` }} /><div className="bg-amber-400" style={{ width: `${3 / 34 * 100}%` }} /><div className="bg-slate-600" style={{ width: `${2 / 34 * 100}%` }} /></div>
            </div>
          </div>
          <p className="mt-4 rounded-lg border border-white/5 bg-black/20 p-3 text-xs leading-relaxed text-junction-muted">{recommendation.reasoning}</p>
          <div className="mt-3 flex items-center gap-2 text-[10px] text-junction-muted"><TrafficCone className="h-3.5 w-3.5 text-junction-amber" />Both axes keep at least 8 seconds green; amber and all-red clearance remain active.</div>
        </section>
      </div>

      <section className="mt-5 rounded-xl border border-junction-border bg-junction-card p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white"><Zap className="h-4 w-4 text-junction-green" />Fixed vs adaptive run comparison</h3>
            <p className="mt-1 text-[10px] text-junction-muted">Same seed, spawn rate, open crossing layout, and {activeScenario.name.toLowerCase()} demand profile · 180 simulated seconds per strategy.</p>
          </div>
          <button onClick={compare} disabled={comparing} className="flex items-center justify-center gap-2 rounded-lg border border-junction-accent/30 bg-junction-accent/10 px-3 py-2 text-xs font-semibold text-junction-accent disabled:opacity-60">
            {comparing ? <Timer className="h-3.5 w-3.5 animate-pulse" /> : <Play className="h-3.5 w-3.5" />}
            {comparing ? 'Running comparison…' : 'Run comparison'}
          </button>
        </div>
        {comparison ? (
          <div className="mt-4">
            <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-junction-green">Completed simulation results · {comparison.durationSec}s each · captured under “{SCENARIO_PRESETS[comparison.demandProfile].name}”</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {['fixed', 'adaptive'].map((key) => {
                const result = comparison[key]
                return (
                  <div key={key} className="rounded-lg border border-white/5 bg-black/20 p-3">
                    <div className="mb-2 text-xs font-bold capitalize text-white">{key} timing</div>
                    <div className="grid grid-cols-3 gap-2">
                      <Metric label="Passed" value={result.vehiclesPassed} />
                      <Metric label="Avg wait" value={formatMetric(result.averageWaitTimeSec)} suffix="s" />
                      <Metric label="Avg queue" value={formatMetric(result.averageQueue)} suffix="per approach" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <p className="mt-3 text-[10px] text-junction-muted">No comparison run has been recorded yet. Results appear here after both simulations finish.</p>
        )}
      </section>

      <div className="mt-4 flex items-center gap-2 rounded-xl border border-junction-border bg-black/20 p-3 text-[10px] text-junction-muted">
        <Cpu className="h-4 w-4 text-junction-accent" />
        Deterministic local analysis only. Demand percentages are scenario assumptions; queue, wait, composition, and comparison metrics are measured in this simulator.
      </div>
    </div>
  )
}
