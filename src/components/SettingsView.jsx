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

        {/* Phase 2 Settings Notice */}
        <div className="bg-junction-card border border-junction-border rounded-xl p-5 space-y-3">
          <div className="flex items-center gap-2 text-white font-semibold text-sm">
            <Sliders className="w-4 h-4 text-junction-accent" />
            <span>Simulation Physics & Timing Parameters</span>
          </div>
          <p className="text-xs text-junction-muted leading-relaxed">
            Additional physical tuning options (collision braking distance, driver reaction delay,
            yellow light dilemma zone tolerance) will be enabled when the Phase 2 physics engine is loaded.
          </p>
          <div className="pt-2 flex items-center gap-2 text-xs text-junction-green">
            <CheckCircle2 className="w-4 h-4" />
            <span>Phase 1.5 Architecture Validated</span>
          </div>
        </div>
      </div>
    </div>
  )
}
