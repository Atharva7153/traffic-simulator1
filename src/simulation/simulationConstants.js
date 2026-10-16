/**
 * simulationConstants.js — Constants for signal timing and phases.
 */

export const SIGNAL_PHASES = [
  { name: 'NS_GREEN', north: 'green', south: 'green', east: 'red', west: 'red', duration: 8000 },
  { name: 'NS_AMBER', north: 'amber', south: 'amber', east: 'red', west: 'red', duration: 2000 },
  { name: 'EW_GREEN', north: 'red', south: 'red', east: 'green', west: 'green', duration: 8000 },
  { name: 'EW_AMBER', north: 'red', south: 'red', east: 'amber', west: 'amber', duration: 2000 },
]
