/** Constrained road-network editor for the simulator's data model. */
import { useMemo, useState } from 'react'
import { AlertCircle, CheckCircle2, Hammer, Play, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { useSimulation } from '../simulation/useSimulation'
import { createDefaultJunction, getTotalLaneCount, isSimulatorSupported, validateNetwork } from '../network/networkData'

function edgeKey(a, b) {
  return [a, b].sort().join('::')
}

function getEndpointDirection(network, edge) {
  const from = network.nodes.find(node => node.id === edge.fromNodeId)
  const to = network.nodes.find(node => node.id === edge.toNodeId)
  if (!from || !to) return null
  const outer = from.type === 'endpoint' ? from : to.type === 'endpoint' ? to : null
  if (!outer) return null
  if (outer.x === 0 && outer.z < 0) return 'north'
  if (outer.x === 0 && outer.z > 0) return 'south'
  if (outer.z === 0 && outer.x > 0) return 'east'
  if (outer.z === 0 && outer.x < 0) return 'west'
  return null
}

function candidateEndpointPairs(network) {
  const endpoints = network.nodes.filter(node => node.type === 'endpoint')
  const existing = new Set(network.edges.map(edge => edgeKey(edge.fromNodeId, edge.toNodeId)))
  const pairs = []
  for (let i = 0; i < endpoints.length; i += 1) {
    for (let j = i + 1; j < endpoints.length; j += 1) {
      const a = endpoints[i]
      const b = endpoints[j]
      const aligned = (a.x === b.x && a.z !== b.z) || (a.z === b.z && a.x !== b.x)
      if (aligned && !existing.has(edgeKey(a.id, b.id))) pairs.push([a, b])
    }
  }
  return pairs
}

export default function JunctionBuilderPreview() {
  const { network, setNetwork, setView, isRunning, toggleRunning } = useSimulation()
  const [selectedEdgeId, setSelectedEdgeId] = useState(network.edges[0]?.id || '')
  const [selectedSignalId, setSelectedSignalId] = useState(network.signals[0]?.id || '')
  const errors = useMemo(() => validateNetwork(network), [network])
  const totalLanes = useMemo(() => getTotalLaneCount(network), [network])
  const supported = isSimulatorSupported(network)
  const selectedEdge = network.edges.find(edge => edge.id === selectedEdgeId)
  const selectedSignal = network.signals.find(signal => signal.id === selectedSignalId)
  const center = network.nodes.find(node => node.type === 'intersection')
  const candidatePairs = candidateEndpointPairs(network)
  const missingSignals = ['north', 'south', 'east', 'west'].filter(direction => !network.signals.some(signal => signal.direction === direction))
  const signalEdges = network.edges.filter(edge => center && (edge.fromNodeId === center.id || edge.toNodeId === center.id) && getEndpointDirection(network, edge))
  const crossingForSelected = network.railwayCrossings?.find(crossing => crossing.edgeId === selectedEdgeId)

  const changeEdge = (id, transform) => setNetwork({
    ...network,
    edges: network.edges.map(edge => edge.id === id ? transform(edge) : edge),
  })

  const setLaneCount = (edge, count) => {
    const laneSpecs = count === 2
      ? [{ direction: 'forward', index: 0 }, { direction: 'backward', index: 0 }]
      : [
          { direction: 'forward', index: 0 }, { direction: 'forward', index: 1 },
          { direction: 'backward', index: 0 }, { direction: 'backward', index: 1 },
        ]
    changeEdge(edge.id, current => ({
      ...current,
      lanes: laneSpecs.map((lane, index) => ({ ...lane, id: `${current.id}_lane_${index + 1}`, width: 3 })),
    }))
  }

  const addRoad = (pair) => {
    if (!pair) return
    const [from, to] = pair
    const id = `road_${from.id}_${to.id}`
    setNetwork({
      ...network,
      edges: [...network.edges, {
        id, type: 'road', fromNodeId: from.id, toNodeId: to.id, speedLimit: 40,
        lanes: [
          { id: `${id}_f`, direction: 'forward', index: 0, width: 3 },
          { id: `${id}_b`, direction: 'backward', index: 0, width: 3 },
        ],
      }],
    })
    setSelectedEdgeId(id)
  }

  const removeRoad = (edge) => {
    setNetwork({
      ...network,
      edges: network.edges.filter(item => item.id !== edge.id),
      signals: network.signals.filter(signal => signal.controlsEdgeId !== edge.id),
    })
    setSelectedEdgeId(network.edges.find(item => item.id !== edge.id)?.id || '')
  }

  const addSignal = (direction) => {
    const edge = network.edges.find(item => getEndpointDirection(network, item) === direction)
    if (!edge || !center) return
    const signal = { id: `sig_${direction}`, nodeId: center.id, controlsEdgeId: edge.id, direction, state: 'red' }
    setNetwork({ ...network, signals: [...network.signals, signal] })
    setSelectedSignalId(signal.id)
  }

  const toggleRailwayCrossing = () => {
    if (!selectedEdge) return
    const crossings = network.railwayCrossings || []
    if (crossingForSelected) {
      setNetwork({ ...network, railwayCrossings: crossings.filter(crossing => crossing.id !== crossingForSelected.id) })
      return
    }
    const direction = getEndpointDirection(network, selectedEdge)
    if (!direction || !center) return
    setNetwork({
      ...network,
      railwayCrossings: [...crossings, {
        id: `crossing_${direction}`,
        edgeId: selectedEdge.id,
        nodeId: center.id,
        direction,
        state: 'open',
      }],
    })
  }

  const updateSignalEdge = (edgeId) => {
    if (!selectedSignal) return
    setNetwork({
      ...network,
      signals: network.signals.map(signal => signal.id === selectedSignal.id ? { ...signal, controlsEdgeId: edgeId } : signal),
    })
  }

  const resetLayout = () => {
    const fresh = createDefaultJunction()
    setNetwork(fresh)
    setSelectedEdgeId(fresh.edges[0].id)
    setSelectedSignalId(fresh.signals[0].id)
  }

  const startSimulation = () => {
    if (!supported) return
    setView('simulation')
    if (!isRunning) toggleRunning()
  }

  const nodeById = new Map(network.nodes.map(node => [node.id, node]))
  const point = (node) => ({ x: 250 + node.x * 4, y: 250 + node.z * 4 })

  return (
    <div className="flex-1 flex flex-col p-5 overflow-y-auto bg-junction-dark">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-junction-border pb-4">
        <div>
          <div className="flex items-center gap-2 text-junction-accent text-xs font-semibold uppercase tracking-wider"><Hammer className="h-4 w-4" />Junction sandbox</div>
          <h2 className="mt-1 text-xl font-bold text-white">Edit the road network</h2>
          <p className="mt-1 max-w-2xl text-xs text-junction-muted">Select an edge, change its stored lane or speed properties, connect aligned endpoints, and validate before running.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={resetLayout} className="flex items-center gap-1.5 rounded-lg border border-junction-border bg-junction-card px-3 py-2 text-xs text-junction-muted hover:text-white"><RotateCcw className="h-3.5 w-3.5" />Reset Layout</button>
          <button onClick={startSimulation} disabled={!supported} title={supported ? 'Run this standard four-way layout' : 'The simulator supports the standard four-way layout only'} className="flex items-center gap-1.5 rounded-lg border border-junction-green/30 bg-junction-green/10 px-3 py-2 text-xs font-semibold text-junction-green disabled:cursor-not-allowed disabled:opacity-40"><Play className="h-3.5 w-3.5" />Start Simulation</button>
        </div>
      </div>

      <div className="my-4 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
        {[
          ['Nodes', network.nodes.length],
          ['Road segments', network.edges.length],
          ['Lanes', totalLanes],
          ['Signals', network.signals.length],
          ['Rail crossings', network.railwayCrossings?.length || 0],
          ['Emergency dispatch', 'Ready'],
        ].map(([label, value]) => <div key={label} className="rounded-lg border border-junction-border bg-junction-card p-3"><div className="text-[9px] uppercase tracking-wider text-junction-muted">{label}</div><div className="mt-1 text-xl font-bold text-white">{value}</div></div>)}
      </div>

      <div className="grid flex-1 grid-cols-1 gap-4 xl:grid-cols-5">
        <section className="xl:col-span-3 rounded-xl border border-junction-border bg-junction-card p-3">
          <div className="mb-2 flex items-center justify-between px-1"><h3 className="text-xs font-bold uppercase tracking-wider text-white">Network view</h3><span className="text-[9px] text-junction-muted">Click a road segment to select it</span></div>
          <svg viewBox="0 0 500 500" className="w-full rounded-lg bg-[#f3f7f5]">
            {network.edges.map(edge => {
              const from = point(nodeById.get(edge.fromNodeId) || { x: 0, z: 0 })
              const to = point(nodeById.get(edge.toNodeId) || { x: 0, z: 0 })
              const selected = edge.id === selectedEdgeId
              const width = Math.max(6, edge.lanes.length * 5)
              return <g key={edge.id} onClick={() => setSelectedEdgeId(edge.id)} className="cursor-pointer">
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke={selected ? '#0f766e' : '#68777a'} strokeWidth={width + 7} strokeLinecap="round" />
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="7 7" opacity="0.55" />
                <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="transparent" strokeWidth="32" />
              </g>
            })}
            {network.nodes.map(node => {
              const p = point(node)
              return <g key={node.id}>
                <circle cx={p.x} cy={p.y} r={node.type === 'intersection' ? 10 : 6} fill={node.type === 'intersection' ? '#0f766e' : '#ffffff'} stroke="#52676a" strokeWidth="3" />
                <text x={p.x + 11} y={p.y - 10} fill="#526672" fontSize="9">{node.id}</text>
              </g>
            })}
            {network.railwayCrossings?.map(crossing => {
              const p = crossing.direction === 'north' ? point({ x: 0, z: -23 }) : crossing.direction === 'south' ? point({ x: 0, z: 23 }) : crossing.direction === 'east' ? point({ x: 23, z: 0 }) : point({ x: -23, z: 0 })
              return <g key={crossing.id}><circle cx={p.x} cy={p.y} r="10" fill="#f59e0b" stroke="#f3f7f5" strokeWidth="3" /><text x={p.x} y={p.y + 3} textAnchor="middle" fill="#203744" fontSize="8" fontWeight="bold">R</text></g>
            })}
            {network.signals.map(signal => {
              const anchor = signal.direction === 'north' ? { x: 280, y: 216 } : signal.direction === 'south' ? { x: 220, y: 284 } : signal.direction === 'east' ? { x: 284, y: 280 } : { x: 216, y: 220 }
              return <circle key={signal.id} cx={anchor.x} cy={anchor.y} r="5" fill="#fbbf24" stroke="#f3f7f5" strokeWidth="2" />
            })}
          </svg>
          <div className="mt-2 flex items-center justify-between text-[10px]">
            <span className={`flex items-center gap-1.5 ${errors.length ? 'text-junction-red' : 'text-junction-green'}`}>
              {errors.length ? <AlertCircle className="h-3.5 w-3.5" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
              {errors.length ? `${errors.length} validation issue${errors.length === 1 ? '' : 's'}` : 'Network structure valid'}
            </span>
            <span className={supported ? 'text-junction-green' : 'text-junction-amber'}>{supported ? 'Supported by simulator' : 'Valid layouts may exceed current simulator scope'}</span>
          </div>
          {errors.length > 0 && <ul className="mt-2 space-y-1 rounded-lg border border-red-500/20 bg-red-500/5 p-3 text-[10px] text-red-300">{errors.map((error, index) => <li key={`${error}-${index}`}>• {error}</li>)}</ul>}
        </section>

        <aside className="space-y-4 xl:col-span-2">
          <section className="rounded-xl border border-junction-border bg-junction-card p-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-white">Road segment editor</h3>
            <label className="mt-3 block text-[10px] text-junction-muted">Selected segment</label>
            <select value={selectedEdgeId} onChange={event => setSelectedEdgeId(event.target.value)} className="mt-1 w-full rounded-md border border-junction-border bg-white p-2 text-xs text-junction-text">
              {network.edges.map(edge => <option key={edge.id} value={edge.id}>{edge.id} · {edge.fromNodeId} → {edge.toNodeId}</option>)}
            </select>
            {selectedEdge ? <div className="mt-3 grid grid-cols-2 gap-3">
              <label className="text-[10px] text-junction-muted">Lanes<select value={selectedEdge.lanes.length} onChange={event => setLaneCount(selectedEdge, Number(event.target.value))} className="mt-1 w-full rounded-md border border-junction-border bg-white p-2 text-xs text-junction-text"><option value={2}>2 · one each way</option><option value={4}>4 · two each way</option></select></label>
              <label className="text-[10px] text-junction-muted">Speed limit<select value={selectedEdge.speedLimit} onChange={event => changeEdge(selectedEdge.id, edge => ({ ...edge, speedLimit: Number(event.target.value) }))} className="mt-1 w-full rounded-md border border-junction-border bg-white p-2 text-xs text-junction-text">{[20, 30, 40, 50, 60].map(speed => <option key={speed} value={speed}>{speed} km/h</option>)}</select></label>
              <button onClick={() => removeRoad(selectedEdge)} className="col-span-2 flex items-center justify-center gap-1.5 rounded-md border border-red-500/20 bg-red-500/5 py-2 text-[10px] text-red-300 hover:bg-red-500/10"><Trash2 className="h-3.5 w-3.5" />Remove selected segment</button>
            </div> : <p className="mt-2 text-[10px] text-junction-muted">Add a road segment to begin editing.</p>}
            <div className="mt-4 border-t border-junction-border pt-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-junction-muted">Add straight segment</div>
              {candidatePairs.length ? candidatePairs.map(pair => <button key={edgeKey(pair[0].id, pair[1].id)} onClick={() => addRoad(pair)} className="mb-1 flex w-full items-center justify-between rounded-md border border-junction-border bg-black/20 px-2.5 py-2 text-left text-[10px] text-junction-text hover:border-junction-accent/40"><span>{pair[0].id} ↔ {pair[1].id}</span><Plus className="h-3.5 w-3.5 text-junction-accent" /></button>) : <p className="text-[10px] text-junction-muted">No additional aligned endpoint pair is available.</p>}
            </div>
            <div className="mt-4 border-t border-junction-border pt-3">
              <div className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-junction-muted">Railway crossing</div>
              <button onClick={toggleRailwayCrossing} disabled={!selectedEdge || (!crossingForSelected && !getEndpointDirection(network, selectedEdge))} className="w-full rounded-md border border-junction-amber/30 bg-junction-amber/5 px-2.5 py-2 text-[10px] text-junction-amber disabled:opacity-40">
                {crossingForSelected ? `Remove ${crossingForSelected.direction} approach crossing` : 'Place crossing on selected approach'}
              </button>
              <p className="mt-1 text-[9px] text-junction-muted">Vehicles stop at the crossing during a user-triggered warning and closure cycle.</p>
            </div>
          </section>

          <section className="rounded-xl border border-junction-border bg-junction-card p-4">
            <div className="flex items-center justify-between"><h3 className="text-xs font-bold uppercase tracking-wider text-white">Intersection signals</h3><span className="text-[9px] text-junction-muted">{center?.id || 'no intersection'}</span></div>
            <div className="mt-2 flex flex-wrap gap-1.5">{network.signals.map(signal => <button key={signal.id} onClick={() => setSelectedSignalId(signal.id)} className={`rounded-md border px-2 py-1 text-[10px] uppercase ${selectedSignalId === signal.id ? 'border-junction-accent/50 bg-junction-accent/10 text-junction-accent' : 'border-junction-border text-junction-muted'}`}>{signal.direction}</button>)}</div>
            {selectedSignal && <label className="mt-3 block text-[10px] text-junction-muted">Controlled road<select value={selectedSignal.controlsEdgeId} onChange={event => updateSignalEdge(event.target.value)} className="mt-1 w-full rounded-md border border-junction-border bg-white p-2 text-xs text-junction-text">{signalEdges.map(edge => <option key={edge.id} value={edge.id}>{edge.id} · {getEndpointDirection(network, edge)}</option>)}</select></label>}
            {missingSignals.length > 0 && <div className="mt-3 flex gap-1.5">{missingSignals.map(direction => <button key={direction} onClick={() => addSignal(direction)} disabled={!signalEdges.some(edge => getEndpointDirection(network, edge) === direction)} className="rounded-md border border-junction-border px-2 py-1 text-[9px] uppercase text-junction-accent disabled:opacity-30">+ {direction}</button>)}</div>}
          </section>
        </aside>
      </div>
      {!supported && errors.length === 0 && <p className="mt-3 text-[10px] text-junction-amber">The simulation currently models one straight-through lane per approach on the standard four-way junction. This network is valid, but unsupported layouts or lane configurations cannot be started.</p>}
    </div>
  )
}
