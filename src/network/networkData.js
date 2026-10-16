/**
 * networkData.js — Data model for an editable road network.
 *
 * Represents junctions, road segments, lanes, signals, and special infrastructure
 * as plain data structures. This separation allows:
 *   - The 3D scene to render FROM the data (not hardcode geometry)
 *   - The 2D canvas to render FROM the same data
 *   - A future editor to mutate the data
 *   - The simulation engine to consume the data
 *
 * Defines the road-network schema, a default junction, and validation helpers
 * consumed by the editor and the constrained traffic simulator.
 */

// ─── Node types ──────────────────────────────────────────────────────────────

/**
 * @typedef {'intersection' | 'endpoint' | 'railway_crossing' | 'metro_station'} NodeType
 */

/**
 * @typedef {Object} NetworkNode
 * @property {string}   id
 * @property {NodeType} type
 * @property {number}   x        — world X position
 * @property {number}   z        — world Z position
 * @property {Object}   [config] — type-specific configuration
 */

// ─── Edge (road segment) ────────────────────────────────────────────────────

/**
 * @typedef {'road' | 'railway' | 'metro'} EdgeType
 */

/**
 * @typedef {Object} Lane
 * @property {string}  id
 * @property {'forward' | 'backward'} direction  — relative to edge from→to
 * @property {number}  index       — lane index from center
 * @property {number}  width       — lane width in world units
 * @property {string}  [allowedVehicles]  — e.g. 'all', 'bus_only', 'emergency'
 */

/**
 * @typedef {Object} NetworkEdge
 * @property {string}   id
 * @property {EdgeType} type
 * @property {string}   fromNodeId
 * @property {string}   toNodeId
 * @property {Lane[]}   lanes
 * @property {number}   speedLimit  — km/h
 * @property {Object}   [config]    — type-specific (e.g. railway crossing gates)
 */

// ─── Signal ─────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} SignalConfig
 * @property {string}  id
 * @property {string}  nodeId       — which intersection this signal belongs to
 * @property {string}  controlsEdgeId — which incoming edge this signal controls
 * @property {string}  direction    — 'north' | 'south' | 'east' | 'west'
 * @property {string}  state        — 'red' | 'amber' | 'green'  (runtime)
 */

// ─── Full network ───────────────────────────────────────────────────────────

/**
 * @typedef {Object} RoadNetwork
 * @property {string}         name
 * @property {NetworkNode[]}  nodes
 * @property {NetworkEdge[]}  edges
 * @property {SignalConfig[]} signals
 * @property {Object}         metadata — author, created date, description, etc.
 */

// ─── Default four-way junction preset ───────────────────────────────────────

import { JUNCTION_LAYOUT } from './junctionLayout'

const LANE_WIDTH = JUNCTION_LAYOUT.lane.width
const ARM_LENGTH = JUNCTION_LAYOUT.road.extent

export function createDefaultJunction() {
  /** @type {RoadNetwork} */
  const network = {
    name: 'Default Four-Way Junction',
    metadata: {
      author: 'System',
      description: 'Indian urban junction with one active straight-through lane per direction and marked inactive turning pockets.',
      created: new Date().toISOString(),
    },
    nodes: [
      { id: 'center', type: 'intersection', x: 0, z: 0, config: { shape: 'channelized-cross', layout: 'indian-urban-v1' } },
      { id: 'north_end', type: 'endpoint', x: 0, z: -ARM_LENGTH },
      { id: 'south_end', type: 'endpoint', x: 0, z: ARM_LENGTH },
      { id: 'east_end', type: 'endpoint', x: ARM_LENGTH, z: 0 },
      { id: 'west_end', type: 'endpoint', x: -ARM_LENGTH, z: 0 },
    ],
    edges: [
      {
        id: 'road_north', type: 'road',
        fromNodeId: 'north_end', toNodeId: 'center',
        speedLimit: 40,
        lanes: [
          { id: 'rn_l1', direction: 'forward', index: 0, width: LANE_WIDTH },
          { id: 'rn_l2', direction: 'backward', index: 1, width: LANE_WIDTH },
        ],
      },
      {
        id: 'road_south', type: 'road',
        fromNodeId: 'center', toNodeId: 'south_end',
        speedLimit: 40,
        lanes: [
          { id: 'rs_l1', direction: 'forward', index: 0, width: LANE_WIDTH },
          { id: 'rs_l2', direction: 'backward', index: 1, width: LANE_WIDTH },
        ],
      },
      {
        id: 'road_east', type: 'road',
        fromNodeId: 'center', toNodeId: 'east_end',
        speedLimit: 40,
        lanes: [
          { id: 're_l1', direction: 'forward', index: 0, width: LANE_WIDTH },
          { id: 're_l2', direction: 'backward', index: 1, width: LANE_WIDTH },
        ],
      },
      {
        id: 'road_west', type: 'road',
        fromNodeId: 'west_end', toNodeId: 'center',
        speedLimit: 40,
        lanes: [
          { id: 'rw_l1', direction: 'forward', index: 0, width: LANE_WIDTH },
          { id: 'rw_l2', direction: 'backward', index: 1, width: LANE_WIDTH },
        ],
      },
    ],
    signals: [
      { id: 'sig_north', nodeId: 'center', controlsEdgeId: 'road_north', direction: 'north', state: 'red' },
      { id: 'sig_south', nodeId: 'center', controlsEdgeId: 'road_south', direction: 'south', state: 'red' },
      { id: 'sig_east', nodeId: 'center', controlsEdgeId: 'road_east', direction: 'east', state: 'green' },
      { id: 'sig_west', nodeId: 'center', controlsEdgeId: 'road_west', direction: 'west', state: 'green' },
    ],
    railwayCrossings: [],
  }

  return network
}

// ─── Editor and simulation helpers ──────────────────────────────────────────

/**
 * Get all edges connected to a node.
 */
export function getNodeEdges(network, nodeId) {
  return network.edges.filter(e => e.fromNodeId === nodeId || e.toNodeId === nodeId)
}

/**
 * Get signals at a specific intersection node.
 */
export function getNodeSignals(network, nodeId) {
  return network.signals.filter(s => s.nodeId === nodeId)
}

/**
 * Count total lanes across all edges.
 */
export function getTotalLaneCount(network) {
  return network.edges.reduce((sum, e) => sum + e.lanes.length, 0)
}

/** Per-arm speed limits consumed by the straight-through vehicle model. */
export function getDirectionalSpeedLimits(network) {
  const limits = { north: null, south: null, east: null, west: null }
  const center = network.nodes.find(node => node.type === 'intersection' && node.x === 0 && node.z === 0)
  if (!center) return limits
  for (const edge of network.edges) {
    const outerId = edge.fromNodeId === center.id ? edge.toNodeId
      : edge.toNodeId === center.id ? edge.fromNodeId : null
    const outer = network.nodes.find(node => node.id === outerId)
    const direction = outer?.x === 0 && outer.z < 0 ? 'north'
      : outer?.x === 0 && outer.z > 0 ? 'south'
        : outer?.z === 0 && outer.x > 0 ? 'east'
          : outer?.z === 0 && outer.x < 0 ? 'west' : null
    if (direction && Number.isFinite(edge.speedLimit)) limits[direction] = edge.speedLimit
  }
  return limits
}

/**
 * Validate basic network integrity.
 * Returns an array of error strings (empty = valid).
 */
export function validateNetwork(network) {
  const errors = []
  if (!network || !Array.isArray(network.nodes) || !Array.isArray(network.edges) || !Array.isArray(network.signals)) {
    return ['Network must contain node, edge, and signal lists']
  }
  if (network.railwayCrossings !== undefined && !Array.isArray(network.railwayCrossings)) {
    return ['Railway crossings must be stored as a list']
  }
  const nodeIds = new Set()
  const edgeIds = new Set()
  const signalIds = new Set()
  const signalDirections = new Set()
  const edgeIdSet = new Set(network.edges.map(edge => edge.id))

  for (const node of network.nodes) {
    if (nodeIds.has(node.id)) errors.push(`Duplicate node id "${node.id}"`)
    nodeIds.add(node.id)
  }

  for (const edge of network.edges) {
    if (edgeIds.has(edge.id)) errors.push(`Duplicate edge id "${edge.id}"`)
    edgeIds.add(edge.id)
    if (!nodeIds.has(edge.fromNodeId)) {
      errors.push(`Edge "${edge.id}" references unknown fromNode "${edge.fromNodeId}"`)
    }
    if (!nodeIds.has(edge.toNodeId)) {
      errors.push(`Edge "${edge.id}" references unknown toNode "${edge.toNodeId}"`)
    }
    if (!Array.isArray(edge.lanes)) {
      errors.push(`Edge "${edge.id}" has an invalid lane list`)
      continue
    }
    if (!(Number.isFinite(edge.speedLimit) && edge.speedLimit > 0)) errors.push(`Edge "${edge.id}" has an invalid speed limit`)
    if (edge.lanes.length === 0) {
      errors.push(`Edge "${edge.id}" has no lanes`)
    }
    if (edge.fromNodeId === edge.toNodeId) errors.push(`Edge "${edge.id}" connects a node to itself`)
    for (const lane of edge.lanes) {
      if (!['forward', 'backward'].includes(lane.direction)) errors.push(`Edge "${edge.id}" has a lane with an invalid direction`)
      if (!(lane.width > 0)) errors.push(`Edge "${edge.id}" has a lane with invalid width`)
    }
  }

  for (const sig of network.signals) {
    if (signalIds.has(sig.id)) errors.push(`Duplicate signal id "${sig.id}"`)
    signalIds.add(sig.id)
    if (!nodeIds.has(sig.nodeId)) {
      errors.push(`Signal "${sig.id}" references unknown node "${sig.nodeId}"`)
    }
    if (!edgeIdSet.has(sig.controlsEdgeId)) errors.push(`Signal "${sig.id}" references missing road "${sig.controlsEdgeId}"`)
    if (!['north', 'south', 'east', 'west'].includes(sig.direction)) errors.push(`Signal "${sig.id}" has an invalid direction`)
    if (signalDirections.has(sig.direction)) errors.push(`More than one signal is assigned to the ${sig.direction} approach`)
    signalDirections.add(sig.direction)
    const signalNode = network.nodes.find(node => node.id === sig.nodeId)
    if (signalNode && signalNode.type !== 'intersection') errors.push(`Signal "${sig.id}" must be attached to an intersection`)
    const controlledEdge = network.edges.find(edge => edge.id === sig.controlsEdgeId)
    if (signalNode && controlledEdge) {
      if (controlledEdge.fromNodeId !== signalNode.id && controlledEdge.toNodeId !== signalNode.id) {
        errors.push(`Signal "${sig.id}" controlled road is not connected to its intersection`)
      }
      const otherNodeId = controlledEdge.fromNodeId === signalNode.id ? controlledEdge.toNodeId
        : controlledEdge.toNodeId === signalNode.id ? controlledEdge.fromNodeId : null
      const outerNode = network.nodes.find(node => node.id === otherNodeId)
      if (outerNode) {
        const edgeDirection = outerNode.x === 0 && outerNode.z < signalNode.z ? 'north'
          : outerNode.x === 0 && outerNode.z > signalNode.z ? 'south'
            : outerNode.z === 0 && outerNode.x > signalNode.x ? 'east'
              : outerNode.z === 0 && outerNode.x < signalNode.x ? 'west' : null
        if (edgeDirection && edgeDirection !== sig.direction) errors.push(`Signal "${sig.id}" direction does not match its controlled road`)
      }
    }
  }

  for (const crossing of network.railwayCrossings || []) {
    if (!edgeIdSet.has(crossing.edgeId)) errors.push(`Railway crossing "${crossing.id}" references a missing road`)
    if (!['north', 'south', 'east', 'west'].includes(crossing.direction)) errors.push(`Railway crossing "${crossing.id}" has an invalid approach`)
    if (!['open', 'warning', 'closed'].includes(crossing.state || 'open')) errors.push(`Railway crossing "${crossing.id}" has an invalid state`)
    if ((network.railwayCrossings || []).filter(item => item.edgeId === crossing.edgeId).length > 1) errors.push(`Road "${crossing.edgeId}" has more than one railway crossing`)
    const crossingEdge = network.edges.find(edge => edge.id === crossing.edgeId)
    const centerNode = network.nodes.find(node => node.id === crossing.nodeId)
    if (!centerNode) errors.push(`Railway crossing "${crossing.id}" references an unknown intersection`)
    if (centerNode && centerNode.type !== 'intersection') errors.push(`Railway crossing "${crossing.id}" must be at an intersection`)
    if (crossingEdge && centerNode && crossingEdge.fromNodeId !== centerNode.id && crossingEdge.toNodeId !== centerNode.id) {
      errors.push(`Railway crossing "${crossing.id}" road is not connected to its intersection`)
    }
    if (crossingEdge && centerNode) {
      const outerId = crossingEdge.fromNodeId === centerNode.id ? crossingEdge.toNodeId
        : crossingEdge.toNodeId === centerNode.id ? crossingEdge.fromNodeId : null
      const outer = network.nodes.find(node => node.id === outerId)
      const edgeDirection = outer?.x === 0 && outer.z < centerNode.z ? 'north'
        : outer?.x === 0 && outer.z > centerNode.z ? 'south'
          : outer?.z === 0 && outer.x > centerNode.x ? 'east'
            : outer?.z === 0 && outer.x < centerNode.x ? 'west' : null
      if (edgeDirection && edgeDirection !== crossing.direction) errors.push(`Railway crossing "${crossing.id}" direction does not match its road`)
    }
  }

  if (network.nodes.length > 0) {
    const adjacency = new Map(network.nodes.map(node => [node.id, new Set()]))
    for (const edge of network.edges) {
      if (!adjacency.has(edge.fromNodeId) || !adjacency.has(edge.toNodeId)) continue
      adjacency.get(edge.fromNodeId).add(edge.toNodeId)
      adjacency.get(edge.toNodeId).add(edge.fromNodeId)
    }
    const reached = new Set()
    const stack = [network.nodes[0].id]
    while (stack.length) {
      const id = stack.pop()
      if (reached.has(id)) continue
      reached.add(id)
      for (const next of adjacency.get(id) || []) if (!reached.has(next)) stack.push(next)
    }
    for (const node of network.nodes) {
      if (!reached.has(node.id)) errors.push(`Node "${node.id}" is disconnected from the road network`)
    }
  }

  return errors
}

/** The current traffic model supports only the standard four-arm, two-way cross. */
export function isSimulatorSupported(network) {
  if (validateNetwork(network).length) return false
  const center = network.nodes.filter(node => node.type === 'intersection' && node.x === 0 && node.z === 0)
  if (center.length !== 1 || network.edges.length !== 4 || network.signals.length !== 4) return false
  const approachDirections = new Set()
  for (const edge of network.edges) {
    if (edge.type !== 'road' || edge.lanes.length !== 2) return false
    const from = network.nodes.find(node => node.id === edge.fromNodeId)
    const to = network.nodes.find(node => node.id === edge.toNodeId)
    const outer = from.id === center[0].id ? to : to.id === center[0].id ? from : null
    if (!outer) return false
    const direction = outer.z < 0 && outer.x === 0 ? 'north'
      : outer.z > 0 && outer.x === 0 ? 'south'
        : outer.x > 0 && outer.z === 0 ? 'east'
          : outer.x < 0 && outer.z === 0 ? 'west' : null
    if (!direction || approachDirections.has(direction)) return false
    approachDirections.add(direction)
  }
  return approachDirections.size === 4 && network.signals.every(signal => signal.nodeId === center[0].id)
}
