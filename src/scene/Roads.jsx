/**
 * Roads.jsx — Procedural road geometry for a four-way intersection.
 * Includes asphalt, lane markings, stop lines, zebra crossings, and curbs.
 */
import { useMemo } from 'react'
import { useSimulation } from '../simulation/useSimulation'

const ROAD_WIDTH = 12
const ROAD_LENGTH = 40
const LANE_WIDTH = 3
const JUNCTION_SIZE = ROAD_WIDTH

// Shared materials (created once, reused)
const asphaltColor = '#454c4e'
const markingColor = '#f7f5ed'
const curbColor = '#e6e6dd'
const sidewalkColor = '#d0d8d0'

function DashedCenterLine({ position, rotation, length }) {
  const dashes = useMemo(() => {
    const d = []
    const dashLen = 1.2
    const gapLen = 0.8
    const total = dashLen + gapLen
    const count = Math.floor(length / total)
    for (let i = 0; i < count; i++) {
      d.push(i * total - length / 2 + dashLen / 2)
    }
    return d
  }, [length])

  return (
    <group position={position} rotation={rotation}>
      {dashes.map((pos, i) => (
        <mesh key={i} position={[pos, 0.075, 0]}>
          <boxGeometry args={[1.2, 0.01, 0.12]} />
          <meshStandardMaterial color={markingColor} />
        </mesh>
      ))}
    </group>
  )
}

function StopLine({ position, rotation }) {
  return (
    <mesh position={[position[0], 0.075, position[2]]} rotation={rotation}>
      <boxGeometry args={[ROAD_WIDTH - 1, 0.02, 0.3]} />
      <meshStandardMaterial color={markingColor} />
    </mesh>
  )
}

function ZebraCrossing({ position, rotation }) {
  const stripes = useMemo(() => {
    const s = []
    const count = 7
    const spacing = (ROAD_WIDTH - 2) / count
    for (let i = 0; i < count; i++) {
      s.push(-((ROAD_WIDTH - 2) / 2) + spacing * i + spacing / 2)
    }
    return s
  }, [])

  return (
    <group position={position} rotation={rotation}>
      {stripes.map((x, i) => (
        <mesh key={i} position={[x, 0.075, 0]}>
          <boxGeometry args={[1.0, 0.01, 2.0]} />
          <meshStandardMaterial color={markingColor} opacity={0.85} transparent />
        </mesh>
      ))}
    </group>
  )
}

function RoadSurface({ position, rotation, width, length }) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow>
      <boxGeometry args={[width, 0.1, length]} />
      <meshStandardMaterial color={asphaltColor} roughness={0.9} />
    </mesh>
  )
}

function Curb({ position, rotation, length }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[length, 0.2, 0.3]} />
      <meshStandardMaterial color={curbColor} roughness={0.7} />
    </mesh>
  )
}

function SidewalkBlock({ position, size }) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={size} />
      <meshStandardMaterial color={sidewalkColor} roughness={0.85} />
    </mesh>
  )
}

function LaneMarkings({ position, rotation, roadLength }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Center dashed line */}
      <DashedCenterLine position={[0, 0, 0]} rotation={[0, 0, 0]} length={roadLength} />
      {/* Edge lines (solid) */}
      <mesh position={[0, 0.075, ROAD_WIDTH / 2 - 0.3]}>
        <boxGeometry args={[roadLength, 0.01, 0.1]} />
        <meshStandardMaterial color={markingColor} opacity={0.5} transparent />
      </mesh>
      <mesh position={[0, 0.075, -(ROAD_WIDTH / 2 - 0.3)]}>
        <boxGeometry args={[roadLength, 0.01, 0.1]} />
        <meshStandardMaterial color={markingColor} opacity={0.5} transparent />
      </mesh>
    </group>
  )
}

function RailwayCrossing({ direction, state }) {
  const vertical = direction === 'north' || direction === 'south'
  const positions = { north: [0, -23], south: [0, 23], east: [23, 0], west: [-23, 0] }
  const [x, z] = positions[direction]
  const trackSize = vertical ? [12, 0.12, 0.16] : [0.16, 0.12, 12]
  const barrierSize = vertical ? [10, 0.16, 0.25] : [0.25, 0.16, 10]
  const barrierHeight = state === 'closed' ? 0.9 : state === 'warning' ? 2.2 : 3.5
  const stateColor = state === 'closed' ? '#ef4444' : state === 'warning' ? '#f59e0b' : '#22c55e'

  return (
    <group position={[x, 0, z]}>
      {[-0.8, 0.8].map(offset => (
        <mesh key={`rail-${offset}`} position={vertical ? [0, 0.12, offset] : [offset, 0.12, 0]}>
          <boxGeometry args={trackSize} />
          <meshStandardMaterial color="#cbd5e1" metalness={0.65} roughness={0.35} />
        </mesh>
      ))}
      {[-2.2, 2.2].map(offset => (
        <mesh key={`sleeper-${offset}`} position={vertical ? [0, 0.1, offset] : [offset, 0.1, 0]}>
          <boxGeometry args={vertical ? [12, 0.08, 0.28] : [0.28, 0.08, 12]} />
          <meshStandardMaterial color="#6b4f3b" roughness={0.8} />
        </mesh>
      ))}
      {[-1.5, 1.5].map(offset => (
        <group key={`gate-${offset}`} position={vertical ? [0, 0, offset] : [offset, 0, 0]}>
          <mesh position={[0, barrierHeight, 0]}>
            <boxGeometry args={barrierSize} />
            <meshStandardMaterial color={stateColor} emissive={stateColor} emissiveIntensity={0.25} />
          </mesh>
          <mesh position={[0, 1.3, 0]}>
            <boxGeometry args={[0.55, 2.6, 0.55]} />
            <meshStandardMaterial color="#374151" metalness={0.5} />
          </mesh>
          <mesh position={[0, 2.8, 0]}>
            <boxGeometry args={[0.7, 0.7, 0.7]} />
            <meshStandardMaterial color={stateColor} emissive={stateColor} emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

export default function Roads() {
  const { network, crossingState } = useSimulation()
  const armLength = ROAD_LENGTH
  const offset = JUNCTION_SIZE / 2 + armLength / 2

  return (
    <group>
      {/* Central junction box */}
      <RoadSurface position={[0, 0, 0]} rotation={[0, 0, 0]} width={JUNCTION_SIZE + 1} length={JUNCTION_SIZE + 1} />

      {/* North road (negative Z) */}
      <RoadSurface position={[0, 0, -offset]} rotation={[0, 0, 0]} width={ROAD_WIDTH} length={armLength} />
      <LaneMarkings position={[0, 0, -offset]} rotation={[0, Math.PI / 2, 0]} roadLength={armLength - 4} />

      {/* South road (positive Z) */}
      <RoadSurface position={[0, 0, offset]} rotation={[0, 0, 0]} width={ROAD_WIDTH} length={armLength} />
      <LaneMarkings position={[0, 0, offset]} rotation={[0, Math.PI / 2, 0]} roadLength={armLength - 4} />

      {/* East road (positive X) */}
      <RoadSurface position={[offset, 0, 0]} rotation={[0, 0, 0]} width={armLength} length={ROAD_WIDTH} />
      <LaneMarkings position={[offset, 0, 0]} rotation={[0, 0, 0]} roadLength={armLength - 4} />

      {/* West road (negative X) */}
      <RoadSurface position={[-offset, 0, 0]} rotation={[0, 0, 0]} width={armLength} length={ROAD_WIDTH} />
      <LaneMarkings position={[-offset, 0, 0]} rotation={[0, 0, 0]} roadLength={armLength - 4} />

      {/* Stop lines */}
      <StopLine position={[0, 0, -(JUNCTION_SIZE / 2 + 0.5)]} rotation={[0, 0, 0]} />
      <StopLine position={[0, 0, JUNCTION_SIZE / 2 + 0.5]} rotation={[0, 0, 0]} />
      <StopLine position={[-(JUNCTION_SIZE / 2 + 0.5), 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <StopLine position={[JUNCTION_SIZE / 2 + 0.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} />

      {/* Zebra crossings */}
      <ZebraCrossing position={[0, 0, -(JUNCTION_SIZE / 2 + 2.5)]} rotation={[0, 0, 0]} />
      <ZebraCrossing position={[0, 0, JUNCTION_SIZE / 2 + 2.5]} rotation={[0, 0, 0]} />
      <ZebraCrossing position={[-(JUNCTION_SIZE / 2 + 2.5), 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <ZebraCrossing position={[JUNCTION_SIZE / 2 + 2.5, 0, 0]} rotation={[0, Math.PI / 2, 0]} />

      {/* Curbs along each road */}
      {/* North arm curbs */}
      <Curb position={[ROAD_WIDTH / 2 + 0.15, 0.1, -offset]} rotation={[0, 0, 0]} length={armLength} />
      <Curb position={[-(ROAD_WIDTH / 2 + 0.15), 0.1, -offset]} rotation={[0, 0, 0]} length={armLength} />
      {/* South arm curbs */}
      <Curb position={[ROAD_WIDTH / 2 + 0.15, 0.1, offset]} rotation={[0, 0, 0]} length={armLength} />
      <Curb position={[-(ROAD_WIDTH / 2 + 0.15), 0.1, offset]} rotation={[0, 0, 0]} length={armLength} />
      {/* East arm curbs */}
      <Curb position={[offset, 0.1, ROAD_WIDTH / 2 + 0.15]} rotation={[0, Math.PI / 2, 0]} length={armLength} />
      <Curb position={[offset, 0.1, -(ROAD_WIDTH / 2 + 0.15)]} rotation={[0, Math.PI / 2, 0]} length={armLength} />
      {/* West arm curbs */}
      <Curb position={[-offset, 0.1, ROAD_WIDTH / 2 + 0.15]} rotation={[0, Math.PI / 2, 0]} length={armLength} />
      <Curb position={[-offset, 0.1, -(ROAD_WIDTH / 2 + 0.15)]} rotation={[0, Math.PI / 2, 0]} length={armLength} />

      {/* Corner sidewalks (the four quadrants around the junction) */}
      <SidewalkBlock position={[-(JUNCTION_SIZE / 2 + 8), 0.05, -(JUNCTION_SIZE / 2 + 8)]} size={[16, 0.15, 16]} />
      <SidewalkBlock position={[JUNCTION_SIZE / 2 + 8, 0.05, -(JUNCTION_SIZE / 2 + 8)]} size={[16, 0.15, 16]} />
      <SidewalkBlock position={[-(JUNCTION_SIZE / 2 + 8), 0.05, JUNCTION_SIZE / 2 + 8]} size={[16, 0.15, 16]} />
      <SidewalkBlock position={[JUNCTION_SIZE / 2 + 8, 0.05, JUNCTION_SIZE / 2 + 8]} size={[16, 0.15, 16]} />

      {(network.railwayCrossings || []).map(crossing => (
        <RailwayCrossing key={crossing.id} direction={crossing.direction} state={crossingState} />
      ))}
    </group>
  )
}

export { ROAD_WIDTH, ROAD_LENGTH, JUNCTION_SIZE, LANE_WIDTH }
