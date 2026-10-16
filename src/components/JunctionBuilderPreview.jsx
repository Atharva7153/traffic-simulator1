/**
 * JunctionBuilderPreview.jsx — Sandbox Junction Builder architecture preview.
 * Displays the modular, data-driven road network and demonstrates the transport
 * infrastructure architecture (Roads, Railway crossings, Metro tracks, Signals).
 */
import { useMemo, useState } from 'react'
import { Hammer, GitFork, Train, Compass, Layers, CheckCircle2, AlertCircle, Info } from 'lucide-react'
import { useSimulation } from '../simulation/useSimulation'
import { validateNetwork, getTotalLaneCount } from '../network/networkData'

export default function JunctionBuilderPreview() {
  const { network, setView } = useSimulation()
  const [selectedLayer, setSelectedLayer] = useState('all') // 'all' | 'roads' | 'rail' | 'metro' | 'signals'

  const errors = useMemo(() => validateNetwork(network), [network])
  const totalLanes = useMemo(() => getTotalLaneCount(network), [network])

  const layers = [
    { id: 'all', label: 'All Layers', icon: Layers, count: network.edges.length + network.signals.length },
    { id: 'roads', label: 'Road Network', icon: GitFork, count: network.edges.filter(e => e.type === 'road').length },
    { id: 'rail', label: 'Railway Corridors', icon: Train, count: 0, tag: 'Phase 2 Architecture' },
    { id: 'metro', label: 'Metro Infrastructure', icon: Compass, count: 0, tag: 'Phase 2 Architecture' },
  ]

  return (
    <div className="flex-1 flex flex-col p-6 overflow-y-auto bg-junction-dark">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-junction-border gap-4">
        <div>
          <div className="flex items-center gap-2 text-junction-accent text-xs font-semibold uppercase tracking-wider">
            <Hammer className="w-4 h-4" />
            <span>Sandbox Architecture & Graph Model</span>
          </div>
          <h2 className="text-xl font-bold text-white mt-1">Junction Builder Network Schema</h2>
          <p className="text-xs text-junction-muted mt-1 max-w-2xl">
            Decoupled topological network model. In Phase 2, interactive placement tools will mutate this graph,
            driving both the 3D scene and 2D canvas dynamically.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-junction-card border border-junction-border">
            {errors.length === 0 ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-junction-green" />
                <span className="text-xs font-medium text-junction-text">Graph Topology Valid</span>
              </>
            ) : (
              <>
                <AlertCircle className="w-4 h-4 text-junction-red" />
                <span className="text-xs font-medium text-junction-red">{errors.length} Schema Errors</span>
              </>
            )}
          </div>

          <button
            onClick={() => setView('simulation')}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-junction-accent/15 text-junction-accent border border-junction-accent/30 hover:bg-junction-accent/25 transition-colors"
          >
            Return to Simulation
          </button>
        </div>
      </div>

      {/* Network Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-6">
        <div className="bg-junction-card border border-junction-border rounded-xl p-4">
          <span className="text-[10px] text-junction-muted uppercase tracking-wider font-semibold">Intersection Nodes</span>
          <div className="text-2xl font-bold text-white mt-1">{network.nodes.length}</div>
          <span className="text-[10px] text-junction-accent mt-1 block">1 Hub, 4 Arterial Endpoints</span>
        </div>

        <div className="bg-junction-card border border-junction-border rounded-xl p-4">
          <span className="text-[10px] text-junction-muted uppercase tracking-wider font-semibold">Road Edges</span>
          <div className="text-2xl font-bold text-white mt-1">{network.edges.length}</div>
          <span className="text-[10px] text-junction-muted mt-1 block">Bidirectional Approaches</span>
        </div>

        <div className="bg-junction-card border border-junction-border rounded-xl p-4">
          <span className="text-[10px] text-junction-muted uppercase tracking-wider font-semibold">Configured Lanes</span>
          <div className="text-2xl font-bold text-white mt-1">{totalLanes}</div>
          <span className="text-[10px] text-junction-green mt-1 block">3.0m Standard Lane Width</span>
        </div>

        <div className="bg-junction-card border border-junction-border rounded-xl p-4">
          <span className="text-[10px] text-junction-muted uppercase tracking-wider font-semibold">Controlled Signals</span>
          <div className="text-2xl font-bold text-white mt-1">{network.signals.length}</div>
          <span className="text-[10px] text-junction-accent mt-1 block">4-Phase Coordinated Loop</span>
        </div>
      </div>

      {/* Builder Layer Navigation */}
      <div className="flex items-center gap-2 border-b border-junction-border pb-3 mb-6 overflow-x-auto">
        {layers.map(layer => {
          const Icon = layer.icon
          const isActive = selectedLayer === layer.id
          return (
            <button
              key={layer.id}
              onClick={() => setSelectedLayer(layer.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-junction-accent text-junction-dark font-semibold shadow-sm'
                  : 'bg-junction-card border border-junction-border text-junction-muted hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{layer.label}</span>
              {layer.tag ? (
                <span className={`text-[9px] px-1.5 py-0.5 rounded ${isActive ? 'bg-black/20 text-junction-dark' : 'bg-junction-border text-junction-muted'}`}>
                  {layer.tag}
                </span>
              ) : (
                <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isActive ? 'bg-black/20' : 'bg-junction-border text-junction-text'}`}>
                  {layer.count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Edge & Node Inspector */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-junction-card border border-junction-border rounded-xl p-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center justify-between">
              <span>Network Edges & Lane Configurations</span>
              <span className="text-[10px] font-normal text-junction-muted">Editable in Phase 2</span>
            </h3>

            <div className="space-y-2">
              {network.edges.map(edge => (
                <div key={edge.id} className="p-3 rounded-lg bg-black/20 border border-white/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-junction-accent">{edge.id}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-junction-border text-junction-text uppercase">{edge.type}</span>
                      <span className="text-[10px] text-junction-muted">Speed: {edge.speedLimit} km/h</span>
                    </div>
                    <div className="text-[11px] text-junction-muted">
                      Route: <span className="text-white font-mono">{edge.fromNodeId}</span> → <span className="text-white font-mono">{edge.toNodeId}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-junction-muted font-medium">
                      {edge.lanes.length} lanes ({edge.lanes.map(l => l.direction === 'forward' ? '↑' : '↓').join(' ')})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Railway & Metro Multi-modal Integration Architecture Box */}
          <div className="bg-gradient-to-br from-junction-card to-black/40 border border-junction-border rounded-xl p-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-2 flex items-center gap-2">
              <Train className="w-4 h-4 text-junction-amber" />
              <span>Multi-Modal Transport Integration Architecture (Upcoming)</span>
            </h3>
            <p className="text-xs text-junction-muted leading-relaxed mb-3">
              To support realistic Indian urban junctions, the graph architecture is designed to host Level Crossing Gates
              and Elevated Metro Lines without disrupting road physics:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-black/30 border border-white/5 space-y-1">
                <span className="font-semibold text-junction-amber block">Level Railway Crossing Logic</span>
                <p className="text-[11px] text-junction-muted">
                  Triggers preemption phases on approaching signals, lowers barricade collision meshes, and halts road lanes 25s prior to train arrival.
                </p>
              </div>
              <div className="p-3 rounded-lg bg-black/30 border border-white/5 space-y-1">
                <span className="font-semibold text-junction-accent block">Elevated Metro Pillar Placements</span>
                <p className="text-[11px] text-junction-muted">
                  Generates median corridor pillars and shadow projections above the road surface without obstructing lane turn radiuses.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Topology Details & Presets */}
        <div className="space-y-4">
          <div className="bg-junction-card border border-junction-border rounded-xl p-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3">
              Junction Presets
            </h3>
            <div className="space-y-2">
              <div className="p-3 rounded-lg bg-junction-accent/10 border border-junction-accent/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-white">4-Way Standard Intersection</span>
                  <span className="text-[10px] text-junction-accent font-medium uppercase">Active</span>
                </div>
                <p className="text-[11px] text-junction-muted mt-1">
                  Default Indian urban arterial cross junction with 2 inbound & outbound lanes.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/20 border border-white/5 opacity-50 cursor-not-allowed">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-junction-text">T-Junction with Level Crossing</span>
                  <span className="text-[9px] text-junction-muted">Phase 2</span>
                </div>
                <p className="text-[11px] text-junction-muted mt-1">
                  Three-way approach with integrated railway barrier timing.
                </p>
              </div>

              <div className="p-3 rounded-lg bg-black/20 border border-white/5 opacity-50 cursor-not-allowed">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-junction-text">Roundabout (Traffic Circle)</span>
                  <span className="text-[9px] text-junction-muted">Phase 2</span>
                </div>
                <p className="text-[11px] text-junction-muted mt-1">
                  Circular continuous flow junction with yield entries.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-junction-card border border-junction-border rounded-xl p-4 flex gap-3">
            <Info className="w-5 h-5 text-junction-accent shrink-0 mt-0.5" />
            <div className="text-[11px] text-junction-muted leading-relaxed">
              <strong className="text-white block mb-0.5">Editor State Isolation</strong>
              Network geometry is completely isolated from visual shaders and vehicle physics, enabling instant serialization to JSON and lossless import/export.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
