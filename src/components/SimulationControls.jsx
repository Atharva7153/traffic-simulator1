/**
 * SimulationControls.jsx — Play/Pause, Reset, and Spawn Rate controls.
 */
import { Play, Pause, RotateCcw, Gauge } from 'lucide-react'
import { motion } from 'motion/react'
import { useSimulation } from '../simulation/useSimulation'

export default function SimulationControls() {
  const { isRunning, toggleRunning, reset, spawnRate, setSpawnRate, elapsedTime } = useSimulation()

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0')
    const s = (seconds % 60).toString().padStart(2, '0')
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
          {isRunning ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={reset}
          className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium bg-white/5 text-junction-muted border border-junction-border hover:bg-white/10 hover:text-junction-text transition-all"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Reset
        </button>
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

      {/* Phase 2 notice */}
      <div className="mt-3 p-2 rounded bg-junction-accent/5 border border-junction-accent/10">
        <p className="text-[9px] text-junction-muted leading-relaxed">
          Phase 1 demo — signals cycle automatically when running. Full vehicle simulation and adaptive control coming in Phase 2.
        </p>
      </div>
    </motion.div>
  )
}
