/**
 * Dashboard.jsx — Main layout assembling the viewport (3D/2D toggleable)
 * and all dashboard panels, or rendering the selected tab view.
 */
import { Car, Timer, TrendingUp, AlertTriangle, Eye, Layers } from 'lucide-react'
import JunctionScene from '../scene/JunctionScene'
import TopDownCanvas from '../canvas/TopDownCanvas'
import { useSimulation } from '../simulation/useSimulation'
import StatCard from './StatCard'
import SignalPanel from './SignalPanel'
import SimulationControls from './SimulationControls'
import JunctionBuilderPreview from './JunctionBuilderPreview'
import TrafficAnalysisView from './TrafficAnalysisView'
import SettingsView from './SettingsView'
import EnvironmentControl from './EnvironmentControl'
import RailwayPanel from './RailwayPanel'

function DirectionLegend() {
  return (
    <div className="bg-junction-card border border-junction-border rounded-lg p-3">
      <h3 className="text-xs font-semibold text-junction-muted uppercase tracking-wider mb-2">
        Junction Overview
      </h3>
      <div className="relative w-full aspect-square max-w-[140px] mx-auto">
        {/* Compass style mini-map */}
        <svg viewBox="0 0 100 100" className="w-full h-full">
          {/* Roads */}
          <rect x="42" y="0" width="16" height="100" fill="#2a2a2e" rx="1" />
          <rect x="0" y="42" width="100" height="16" fill="#2a2a2e" rx="1" />
          {/* Center junction */}
          <rect x="40" y="40" width="20" height="20" fill="#374151" rx="1" />
          {/* Dashed center lines */}
          <line x1="50" y1="5" x2="50" y2="38" stroke="#e8e8e0" strokeWidth="0.5" strokeDasharray="3,2" />
          <line x1="50" y1="62" x2="50" y2="95" stroke="#e8e8e0" strokeWidth="0.5" strokeDasharray="3,2" />
          <line x1="5" y1="50" x2="38" y2="50" stroke="#e8e8e0" strokeWidth="0.5" strokeDasharray="3,2" />
          <line x1="62" y1="50" x2="95" y2="50" stroke="#e8e8e0" strokeWidth="0.5" strokeDasharray="3,2" />
          {/* Direction labels */}
          <text x="50" y="8" textAnchor="middle" fill="#06b6d4" fontSize="7" fontWeight="bold">N</text>
          <text x="50" y="97" textAnchor="middle" fill="#06b6d4" fontSize="7" fontWeight="bold">S</text>
          <text x="5" y="52" textAnchor="middle" fill="#06b6d4" fontSize="7" fontWeight="bold">W</text>
          <text x="95" y="52" textAnchor="middle" fill="#06b6d4" fontSize="7" fontWeight="bold">E</text>
          {/* Vehicle indicators */}
          <rect x="52" y="18" width="3" height="5" fill="#3b82f6" rx="0.5" />
          <rect x="45" y="25" width="3" height="5" fill="#ef4444" rx="0.5" />
          <rect x="73" y="47" width="5" height="3" fill="#22c55e" rx="0.5" />
          <rect x="20" y="52" width="5" height="3" fill="#fbbf24" rx="0.5" />
        </svg>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { stats, activeView, viewMode, setViewMode, elapsedTime } = useSimulation()
  const waitValue = stats.avgWaitTimeSec === null ? '--' : stats.avgWaitTimeSec.toFixed(1)

  // Tab views
  if (activeView === 'builder') {
    return <JunctionBuilderPreview />
  }

  if (activeView === 'analytics') {
    return <TrafficAnalysisView />
  }

  if (activeView === 'settings') {
    return <SettingsView />
  }

  // Primary Simulation view
  return (
    <div className="min-w-0 flex-1 flex overflow-hidden">
      {/* Main Viewport (3D or 2D Top-Down Canvas) */}
      <div className="relative min-w-0 flex-1 bg-junction-dark">
        {/* Render either 3D Three.js scene or 2D HTML Canvas */}
        {viewMode === '3d' ? (
          <JunctionScene />
        ) : (
          <TopDownCanvas />
        )}

        {/* View mode switcher badge & controls */}
        <div className="absolute top-3 left-3 flex items-center gap-2 z-10">
          {/* Segmented Switcher for 3D vs 2D Top-Down */}
          <div className="flex items-center bg-white/95 backdrop-blur-sm p-1 rounded-xl border border-junction-border shadow-sm">
            <button
              onClick={() => setViewMode('3d')}
              style={viewMode === '3d' ? { color: '#fff' } : undefined}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                viewMode === '3d'
                  ? 'bg-junction-accent text-white font-semibold shadow-sm'
                  : 'text-junction-muted hover:text-junction-text'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>3D Scene</span>
            </button>
            <button
              onClick={() => setViewMode('2d')}
              style={viewMode === '2d' ? { color: '#fff' } : undefined}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                viewMode === '2d'
                  ? 'bg-junction-accent text-white font-semibold shadow-sm'
                  : 'text-junction-muted hover:text-junction-text'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>2D Canvas</span>
            </button>
          </div>

          {/* Interaction hint */}
          <div className="hidden xl:block bg-white/95 rounded-lg px-2.5 py-1.5 border border-junction-border shadow-sm">
            <span className="text-[10px] font-medium text-junction-muted tracking-wide">
              {viewMode === '3d'
                ? '3D Orbit: Left-drag · Pan: Right-drag · Zoom: Scroll'
                : 'Top-Down 2D HTML Canvas · Auto-resizing · Shared Simulation State'}
            </span>
          </div>
        </div>

        <div className="absolute top-3 right-3 z-10">
          <EnvironmentControl />
        </div>
      </div>

      {/* Right sidebar */}
      <aside className="flex w-64 shrink-0 flex-col gap-2 overflow-y-auto border-l border-junction-border bg-white p-2">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            icon={Car}
            label="Passed"
            value={stats.totalPassed}
            unit="vehicles"
          />
          <StatCard
            icon={Timer}
            label="Avg Wait"
            value={waitValue}
            unit="sec"
            pending={waitValue === '--'}
          />
          <StatCard
            icon={TrendingUp}
            label="Throughput"
            value={stats.throughputPerMinute.toFixed(1)}
            unit="v/min"
            pending={elapsedTime === 0}
          />
          <StatCard
            icon={AlertTriangle}
            label="Congestion"
            value={stats.congestionLevel}
            pending={elapsedTime === 0}
          />
        </div>

        {/* Signal panel */}
        <SignalPanel />

        {/* Controls */}
        <SimulationControls />
        <RailwayPanel />

        {/* Direction legend */}
        <DirectionLegend />
      </aside>
    </div>
  )
}
