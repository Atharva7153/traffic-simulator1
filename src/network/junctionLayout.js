/** Shared dimensions for the default four-way junction, in world units. */
export const JUNCTION_LAYOUT = Object.freeze({
  road: Object.freeze({
    width: 18,
    halfWidth: 9,
    extent: 46,
    junctionHalf: 11,
    armLength: 35,
  }),
  lane: Object.freeze({
    width: 3,
    activeOffset: 2.5,
    separatorOffset: 4.25,
    turnOffset: 6.35,
    medianHalfWidth: 0.8,
    edgeOffset: 8.2,
  }),
  stopLineOffset: 12.5,
  crosswalkOffset: 16,
  crosswalkDepth: 2.6,
  signalOffset: 20,
  median: Object.freeze({ start: 21, end: 44, length: 23, width: 1.6, height: 0.22 }),
  spawnOffset: 38,
  island: Object.freeze({ offset: 9.1, size: 2.7, height: 0.24, radius: 0.55 }),
  signalShoulderOffset: 11.6,
})

/** Approach coordinates use canvas/world convention: +X east and +Z south. */
export const APPROACH_LAYOUT = Object.freeze({
  north: Object.freeze({
    spawn: [-JUNCTION_LAYOUT.lane.activeOffset, -JUNCTION_LAYOUT.spawnOffset],
    vector: [0, 1],
    signal: [-JUNCTION_LAYOUT.signalShoulderOffset, -JUNCTION_LAYOUT.signalOffset],
    straightArrow: 0,
    turnArrow: -Math.PI / 2,
  }),
  south: Object.freeze({
    spawn: [JUNCTION_LAYOUT.lane.activeOffset, JUNCTION_LAYOUT.spawnOffset],
    vector: [0, -1],
    signal: [JUNCTION_LAYOUT.signalShoulderOffset, JUNCTION_LAYOUT.signalOffset],
    straightArrow: Math.PI,
    turnArrow: Math.PI / 2,
  }),
  east: Object.freeze({
    spawn: [JUNCTION_LAYOUT.spawnOffset, -JUNCTION_LAYOUT.lane.activeOffset],
    vector: [-1, 0],
    signal: [JUNCTION_LAYOUT.signalOffset, JUNCTION_LAYOUT.signalShoulderOffset],
    straightArrow: -Math.PI / 2,
    turnArrow: 0,
  }),
  west: Object.freeze({
    spawn: [-JUNCTION_LAYOUT.spawnOffset, JUNCTION_LAYOUT.lane.activeOffset],
    vector: [1, 0],
    signal: [-JUNCTION_LAYOUT.signalOffset, -JUNCTION_LAYOUT.signalShoulderOffset],
    straightArrow: Math.PI / 2,
    turnArrow: Math.PI,
  }),
})

export const APPROACH_DIRECTIONS = Object.keys(APPROACH_LAYOUT)
