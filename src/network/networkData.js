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
 * Phase 1.5: Defines the schema and a default four-way junction preset.
 * Phase 2+: The junction builder will create/modify these structures.
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

const LANE_WIDTH = 3
const ARM_LENGTH = 40

export function createDefaultJunction() {
  /** @type {RoadNetwork} */
  const network = {
    name: 'Default Four-Way Junction',
    metadata: {
      author: 'System',
      description: 'Standard Indian four-way intersection with two lanes per direction.',
      created: new Date().toISOString(),
    },
    nodes: [
      { id: 'center', type: 'intersection', x: 0, z: 0, config: { shape: 'cross' } },
      { id: 'north_end', type: 'endpoint', x: 0, z: -ARM_LENGTH - 6 },
      { id: 'south_end', type: 'endpoint', x: 0, z: ARM_LENGTH + 6 },
      { id: 'east_end', type: 'endpoint', x: ARM_LENGTH + 6, z: 0 },
      { id: 'west_end', type: 'endpoint', x: -(ARM_LENGTH + 6), z: 0 },
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
  }

  return network
}

// ─── Utility helpers for future editor / simulation ─────────────────────────

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

/**
 * Validate basic network integrity.
 * Returns an array of error strings (empty = valid).
 */
export function validateNetwork(network) {
  const errors = []
  const nodeIds = new Set(network.nodes.map(n => n.id))

  for (const edge of network.edges) {
    if (!nodeIds.has(edge.fromNodeId)) {
      errors.push(`Edge "${edge.id}" references unknown fromNode "${edge.fromNodeId}"`)
    }
    if (!nodeIds.has(edge.toNodeId)) {
      errors.push(`Edge "${edge.id}" references unknown toNode "${edge.toNodeId}"`)
    }
    if (edge.lanes.length === 0) {
      errors.push(`Edge "${edge.id}" has no lanes`)
    }
  }

  for (const sig of network.signals) {
    if (!nodeIds.has(sig.nodeId)) {
      errors.push(`Signal "${sig.id}" references unknown node "${sig.nodeId}"`)
    }
  }

  return errors
}
