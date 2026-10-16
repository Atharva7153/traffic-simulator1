/**
 * TrafficAnalysisView.jsx — AI Traffic Intelligence & Analytics dashboard.
 * Evaluates traffic measurements, compares morning/evening scenarios,
 * and generates recommended green-time allocations using deterministic optimization.
 */
import { useState, useMemo } from 'react'
import { Brain, Cpu, Zap, Layers, Sliders } from 'lucide-react'
import { useSimulation } from '../simulation/useSimulation'
import { SCENARIO_PRESETS, calculateOptimalTiming } from '../analysis/trafficAnalysis'

export default function TrafficAnalysisView() {
  const { setView } = useSimulation()
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('morning_rush')
  const [totalCycleTime, setTotalCycleTime] = useState(60)

  const activeScenario = SCENARIO_PRESETS[selectedScenarioKey]

  // Calculate optimization recommendation
  const recommendation = useMemo(() => {
    return calculateOptimalTiming(activeScenario.measurements, totalCycleTime)
  }, [activeScenario, totalCycleTime])

  // Fixed baseline: equal 50/50 split minus amber
  const fixedSplit = useMemo(() => {
    const amber = 3
    const green = Math.floor((totalCycleTime - amber * 2) / 2)
    return { nsGreen: green, ewGreen: green, amber }
  }, [totalCycleTime])

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-junction-dark">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-junction-border gap-4">
        <div>
          <div className="flex items-center gap-2 text-junction-accent text-xs font-semibold uppercase tracking-wider">
            <Brain className="w-4 h-4" />
            <span>AI Signal Intelligence & Analytics Engine</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Adaptive Signal Optimization</h2>
          <p className="text-xs text-junction-muted mt-1 max-w-2xl">
            Simulated Passenger Car Unit (PCU) demand analyzer. Generates dynamic green-split recommendations
            based on multi-modal queue density and time-of-day flow patterns.
          </p>
        </div>

        <button
          onClick={() => setView('simulation')}
          className="self-start md:self-auto px-3.5 py-1.5 rounded-lg text-xs font-medium bg-junction-accent/15 text-junction-accent border border-junction-accent/30 hover:bg-junction-accent/25 transition-colors"
        >
          Return to Simulation
        </button>
      </div>

      {/* Scenario Selector & Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
        {Object.entries(SCENARIO_PRESETS).map(([key, item]) => {
          const isSelected = selectedScenarioKey === key
          return (
            <button
              key={key}
              onClick={() => setSelectedScenarioKey(key)}
              className={`p-4 rounded-xl text-left border transition-all ${
                isSelected
                  ? 'bg-junction-accent/10 border-junction-accent ring-1 ring-junction-accent/40'
                  : 'bg-junction-card border-junction-border hover:border-white/20'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-bold uppercase tracking-wider ${isSelected ? 'text-junction-accent' : 'text-junction-text'}`}>
                  {item.name}
                </span>
                {isSelected && <span className="w-2 h-2 rounded-full bg-junction-accent animate-pulse" />}
              </div>
              <p className="text-[11px] text-junction-muted mt-1 leading-relaxed">
                {item.description}
              </p>
            </button>
          )
        })}
      </div>

      {/* Interactive Cycle Length Controller */}
      <div className="bg-junction-card border border-junction-border rounded-xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-junction-accent" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">Total Cycle Window:</span>
          <span className="text-sm font-mono font-bold text-junction-accent">{totalCycleTime}s</span>
        </div>
        <div className="flex items-center gap-3 w-full sm:w-72">
          <span className="text-[10px] text-junction-muted">40s</span>
          <input
            type="range"
            min={40}
            max={120}
            step={5}
            value={totalCycleTime}
            onChange={(e) => setTotalCycleTime(Number(e.target.value))}
            className="w-full h-1.5 rounded-full appearance-none cursor-pointer bg-junction-border accent-cyan-500"
          />
          <span className="text-[10px] text-junction-muted">120s</span>
        </div>
      </div>

      {/* Simulation Inputs & Measured Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Measured Approach Density */}
        <div className="bg-junction-card border border-junction-border rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-junction-accent" />
              <span>Observed Approach Telemetry</span>
            </h3>
            <span className="text-[10px] text-junction-muted">Scenario: {activeScenario.name}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {activeScenario.measurements.map(m => (
              <div key={m.direction} className="p-3 rounded-lg bg-black/20 border border-white/5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-white uppercase">{m.direction} Approach</span>
                  <span className="text-[10px] text-junction-accent font-medium">Wait: ~{m.avgWaitTimeSec}s</span>
                </div>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-xl font-bold text-white">{m.queueLength}</span>
                  <span className="text-[10px] text-junction-muted">queued veh</span>
                </div>
                {/* Vehicle modal composition bar */}
                <div className="mt-2.5">
                  <div className="flex justify-between text-[9px] text-junction-muted mb-1">
                    <span>Cars {m.composition.cars}%</span>
                    <span>Buses {m.composition.buses}%</span>
                    <span>2W/Autos {m.composition.twoWheelers + m.composition.autos}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden flex">
                    <div style={{ width: `${m.composition.cars}%` }} className="bg-blue-500" />
                    <div style={{ width: `${m.composition.buses}%` }} className="bg-amber-500" />
                    <div style={{ width: `${m.composition.twoWheelers + m.composition.autos}%` }} className="bg-emerald-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Fixed vs Adaptive Comparison Card */}
        <div className="bg-junction-card border border-junction-border rounded-xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Zap className="w-4 h-4 text-junction-green" />
                <span>Fixed vs. Adaptive AI Timing Comparison</span>
              </h3>
              <span className="text-[10px] px-2 py-0.5 rounded bg-junction-green/10 text-junction-green border border-junction-green/20">
                {recommendation.estimatedImprovement}
              </span>
            </div>

            {/* Visual Split Bars */}
            <div className="space-y-4">
              {/* Fixed Baseline */}
              <div>
                <div className="flex justify-between text-xs text-junction-muted mb-1.5">
                  <span className="font-medium text-white/80">Static Fixed Cycle (50/50)</span>
                  <span>NS: {fixedSplit.nsGreen}s · EW: {fixedSplit.ewGreen}s</span>
                </div>
                <div className="h-4 w-full bg-black/40 rounded-md overflow-hidden flex text-[10px] font-bold text-black text-center leading-4">
                  <div style={{ width: `${(fixedSplit.nsGreen / totalCycleTime) * 100}%` }} className="bg-blue-400">
                    NS ({fixedSplit.nsGreen}s)
                  </div>
                  <div style={{ width: `${(fixedSplit.amber / totalCycleTime) * 100}%` }} className="bg-amber-400">
                    A
                  </div>
                  <div style={{ width: `${(fixedSplit.ewGreen / totalCycleTime) * 100}%` }} className="bg-emerald-400">
                    EW ({fixedSplit.ewGreen}s)
                  </div>
                  <div style={{ width: `${(fixedSplit.amber / totalCycleTime) * 100}%` }} className="bg-amber-400">
                    A
                  </div>
                </div>
              </div>

              {/* Recommended Adaptive */}
              <div>
                <div className="flex justify-between text-xs text-junction-muted mb-1.5">
                  <span className="font-medium text-junction-accent">AI Recommended Dynamic Split</span>
                  <span className="text-white font-medium">
                    NS: {recommendation.phaseAllocation.nsGreenSec}s · EW: {recommendation.phaseAllocation.ewGreenSec}s
                  </span>
                </div>
                <div className="h-4 w-full bg-black/40 rounded-md overflow-hidden flex text-[10px] font-bold text-black text-center leading-4 ring-1 ring-junction-accent/40">
                  <div style={{ width: `${(recommendation.phaseAllocation.nsGreenSec / totalCycleTime) * 100}%` }} className="bg-cyan-400 transition-all duration-500">
                    NS ({recommendation.phaseAllocation.nsGreenSec}s)
                  </div>
                  <div style={{ width: `${(recommendation.phaseAllocation.nsAmberSec / totalCycleTime) * 100}%` }} className="bg-amber-400">
                    A
                  </div>
                  <div style={{ width: `${(recommendation.phaseAllocation.ewGreenSec / totalCycleTime) * 100}%` }} className="bg-emerald-400 transition-all duration-500">
                    EW ({recommendation.phaseAllocation.ewGreenSec}s)
                  </div>
                  <div style={{ width: `${(recommendation.phaseAllocation.ewAmberSec / totalCycleTime) * 100}%` }} className="bg-amber-400">
                    A
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* AI Decision Rationale */}
          <div className="mt-4 p-3 rounded-lg bg-black/30 border border-white/5">
            <span className="text-[10px] text-junction-accent font-semibold uppercase tracking-wider block mb-1">
              Optimization Analysis & Rationale
            </span>
            <p className="text-xs text-junction-muted leading-relaxed">
              {recommendation.reasoning}
            </p>
          </div>
        </div>
      </div>

      {/* Safety & API Notice */}
      <div className="p-3 rounded-xl bg-junction-card border border-junction-border flex items-center justify-between text-xs text-junction-muted">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-junction-accent" />
          <span>Deterministic Local Optimization Mode active. No external API keys required. Ready for Groq/LLM integration in Phase 2.</span>
        </div>
        <span className="text-[10px] font-mono text-junction-green">Engine: PCU-Webster Local</span>
      </div>
    </div>
  )
}
