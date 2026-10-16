/**
 * Dashboard.jsx — Main layout assembling the 3D viewport and all dashboard panels.
 */
import { Car, Timer, TrendingUp, AlertTriangle } from 'lucide-react'
import JunctionScene from '../scene/JunctionScene'
import { useSimulation } from '../simulation/simulationState'
import StatCard from './StatCard'
import SignalPanel from './SignalPanel'
import SimulationControls from './SimulationControls'

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
  const { stats } = useSimulation()

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main 3D Viewport */}
      <div className="flex-1 relative">
        <JunctionScene />
        {/* Viewport label */}
        <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm rounded-md px-2.5 py-1 border border-white/5">
          <span className="text-[10px] font-medium text-white/60 uppercase tracking-wider">
            3D Viewport — Orbit: Drag · Zoom: Scroll
          </span>
        </div>
      </div>

      {/* Right sidebar */}
      <aside className="w-64 flex flex-col gap-2 p-2 border-l border-junction-border bg-junction-dark/50 overflow-y-auto">
        {/* Stats row */}
        <div className="grid grid-cols-2 gap-2">
          <StatCard
            icon={Car}
            label="Vehicles"
            value={stats.totalVehicles}
            unit="active"
            pending={stats.totalVehicles === 0}
          />
          <StatCard
            icon={Timer}
            label="Avg Wait"
            value={stats.avgWaitTime}
            unit="sec"
            pending={stats.avgWaitTime === '--'}
          />
          <StatCard
            icon={TrendingUp}
            label="Throughput"
            value={stats.throughput}
            unit="v/min"
            pending={stats.throughput === '--'}
          />
          <StatCard
            icon={AlertTriangle}
            label="Congestion"
            value={stats.congestionLevel}
          />
        </div>

        {/* Signal panel */}
        <SignalPanel />

        {/* Controls */}
        <SimulationControls />

        {/* Direction legend */}
        <DirectionLegend />
      </aside>
    </div>
  )
}
