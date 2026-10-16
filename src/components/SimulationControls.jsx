/**
 * SimulationControls.jsx — Play/Pause, Reset, and Spawn Rate controls.
 */
import { Play, Pause, RotateCcw, Gauge } from 'lucide-react'
import { motion } from 'motion/react'
import { useSimulation } from '../simulation/useSimulation'

export default function SimulationControls() {
  const {
    isRunning, toggleRunning, reset, spawnRate, setSpawnRate, elapsedTime,
    controllerMode, setControllerMode, simSpeed, setSimSpeed, phase, phaseRemaining,
    railwayCrossings, crossingState, crossingRemaining, startRailwayCycle,
  } = useSimulation()

  const formatTime = (seconds) => {
    const total = Math.floor(seconds)
    const m = Math.floor(total / 60).toString().padStart(2, '0')
    const s = (total % 60).toString().padStart(2, '0')
    return `${m}:${s}`
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-junction-card border border-junction-border rounded-lg p-3"
    >
      <h3 className="text-xs font-semibold text-junction-muted uppercase tracking-wider mb-3">
        Simulation Control
      </h3>

      {/* Timer display */}
      <div className="text-center mb-3">
        <span className="text-2xl font-mono font-bold text-white tabular-nums tracking-wider">
          {formatTime(elapsedTime)}
        </span>
        <p className="text-[10px] text-junction-muted mt-0.5">Elapsed Time</p>
      </div>

      {/* Play/Pause and Reset */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={toggleRunning}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-xs font-medium transition-all ${
            isRunning
              ? 'bg-junction-amber/15 text-junction-amber border border-junction-amber/30 hover:bg-junction-amber/25'
              : 'bg-junction-green/15 text-junction-green border border-junction-green/30 hover:bg-junction-green/25'
          }`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          {isRunning ? 'Pause' : elapsedTime > 0 ? 'Resume' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-white/5 text-junction-muted border border-junction-border hover:bg-white/10 hover:text-junction-text transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
      </div>

      <div className="mb-3 rounded-md bg-black/20 p-2.5">
        <div className="flex items-center justify-between text-[10px] uppercase tracking-wider">
          <span className="text-junction-muted">{phase.replaceAll('_', ' ')}</span>
          <span className="font-mono font-bold text-white">{Math.ceil(phaseRemaining)}s</span>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-1 rounded-md bg-black/30 p-1">
          {['fixed', 'adaptive'].map((mode) => (
            <button
              key={mode}
              onClick={() => setControllerMode(mode)}
              aria-pressed={controllerMode === mode}
              className={`rounded px-2 py-1 text-[10px] font-semibold capitalize transition-colors ${
                controllerMode === mode
                  ? 'bg-junction-accent text-junction-dark'
                  : 'text-junction-muted hover:text-white'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Spawn Rate Slider */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1">
            <Gauge className="w-3 h-3 text-junction-accent" />
            <span className="text-[10px] font-medium text-junction-muted uppercase tracking-wider">
              Spawn Rate
            </span>
          </div>
          <span className="text-xs font-bold text-junction-accent tabular-nums">
            {spawnRate}%
          </span>
        </div>
        <input
          type="range"
          min={0}
          max={100}
          value={spawnRate}
          onChange={(e) => setSpawnRate(Number(e.target.value))}
          className="w-full h-1.5 rounded-full appearance-none cursor-pointer
            [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3.5 [&::-webkit-slider-thumb]:h-3.5
            [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-junction-accent
            [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-junction-dark
            [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:cursor-pointer
            bg-gradient-to-r from-junction-accent-dim to-junction-accent"
          style={{
            background: `linear-gradient(to right, #0e7490 0%, #06b6d4 ${spawnRate}%, #1e293b ${spawnRate}%, #1e293b 100%)`,
          }}
        />
        <div className="flex justify-between mt-1">
          <span className="text-[9px] text-junction-muted">Low</span>
          <span className="text-[9px] text-junction-muted">High</span>
        </div>
      </div>

      <div className="mt-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-medium text-junction-muted uppercase tracking-wider">Simulation speed</span>
          <span className="text-xs font-bold text-junction-accent">{simSpeed}×</span>
        </div>
        <div className="grid grid-cols-3 gap-1">
          {[1, 2, 4].map((speed) => (
            <button
              key={speed}
              onClick={() => setSimSpeed(speed)}
              aria-pressed={simSpeed === speed}
              className={`rounded-md border py-1 text-[10px] font-medium ${
                simSpeed === speed
                  ? 'border-junction-accent/50 bg-junction-accent/15 text-junction-accent'
                  : 'border-junction-border text-junction-muted hover:text-white'
              }`}
            >
              {speed}×
            </button>
          ))}
        </div>
      </div>

      {railwayCrossings.length > 0 && (
        <div className="mt-3 rounded-md border border-junction-amber/20 bg-junction-amber/5 p-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-junction-amber">Rail crossing · {crossingState}</span>
            {crossingState !== 'open' && <span className="font-mono text-[10px] text-white">{Math.ceil(crossingRemaining)}s</span>}
          </div>
          <button
            onClick={startRailwayCycle}
            disabled={!isRunning || crossingState !== 'open'}
            className="mt-2 w-full rounded border border-junction-amber/30 bg-black/20 py-1.5 text-[10px] text-junction-amber disabled:opacity-40"
          >
            {isRunning ? 'Begin warning → closure cycle' : 'Start simulation to cycle crossing'}
          </button>
          <p className="mt-1 text-[9px] leading-relaxed text-junction-muted">Manual warning (3s), closure (8s), then reopen. No train actor is simulated.</p>
        </div>
      )}
    </motion.div>
  )
}
