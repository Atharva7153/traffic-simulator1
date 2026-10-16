/**
 * SettingsView.jsx — Simulation and display settings panel.
 */
import { Settings, Sliders, Monitor, CheckCircle2 } from 'lucide-react'
import { useSimulation } from '../simulation/useSimulation'

export default function SettingsView() {
  const { setView, viewMode, setViewMode } = useSimulation()

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-junction-dark">
      {/* Header */}
      <div className="flex items-center justify-between pb-6 border-b border-junction-border">
        <div>
          <div className="flex items-center gap-2 text-junction-accent text-xs font-semibold uppercase tracking-wider">
            <Settings className="w-4 h-4" />
            <span>Application Preferences</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Simulation & Graphics Configuration</h2>
        </div>

        <button
          onClick={() => setView('simulation')}
          className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-junction-accent/15 text-junction-accent border border-junction-accent/30 hover:bg-junction-accent/25 transition-colors"
        >
          Return to Simulation
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6 max-w-4xl">
        {/* Render Engine Preference */}
        <div className="bg-junction-card border border-junction-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Monitor className="w-4 h-4 text-junction-accent" />
            <span>Default Viewport Mode</span>
          </div>
          <p className="text-xs text-junction-muted">
            Choose whether to start in 3D WebGL perspective view or 2D HTML Canvas Top-Down view.
          </p>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => setViewMode('3d')}
              className={`p-3 rounded-lg border text-left transition-all ${
                viewMode === '3d'
                  ? 'bg-junction-accent/15 border-junction-accent text-white'
                  : 'bg-black/20 border-white/5 text-junction-muted hover:text-white'
              }`}
            >
              <div className="text-xs font-bold">3D Perspective</div>
              <div className="text-[10px] text-junction-muted mt-0.5">R3F Three.js Canvas</div>
            </button>

            <button
              onClick={() => setViewMode('2d')}
              className={`p-3 rounded-lg border text-left transition-all ${
                viewMode === '2d'
                  ? 'bg-junction-accent/15 border-junction-accent text-white'
                  : 'bg-black/20 border-white/5 text-junction-muted hover:text-white'
              }`}
            >
              <div className="text-xs font-bold">2D Top-Down</div>
              <div className="text-[10px] text-junction-muted mt-0.5">HTML Canvas 2D</div>
            </button>
          </div>
        </div>

        {/* Active model capabilities */}
        <div className="bg-junction-card border border-junction-border rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Sliders className="w-4 h-4 text-junction-accent" />
            <span>Active simulation model</span>
          </div>
          <p className="text-xs text-junction-muted leading-relaxed">
            Fixed-step traffic updates at 30 steps per simulated second. Vehicles keep a safe following gap and use the configured arm speed limit as a cap.
          </p>
          <div className="grid grid-cols-2 gap-2 text-[10px] text-junction-muted">
            <div className="rounded-md border border-white/5 bg-black/20 p-2">Straight-through routes</div>
            <div className="rounded-md border border-white/5 bg-black/20 p-2">3s amber + 1s all-red</div>
            <div className="rounded-md border border-white/5 bg-black/20 p-2">Sedan, SUV, bus, auto</div>
            <div className="rounded-md border border-white/5 bg-black/20 p-2">No turn routing</div>
          </div>
          <div className="pt-1 flex items-center gap-2 text-xs text-junction-green">
            <CheckCircle2 className="w-4 h-4" />
            <span>Local model · no external service</span>
          </div>
        </div>
      </div>
    </div>
  )
}
