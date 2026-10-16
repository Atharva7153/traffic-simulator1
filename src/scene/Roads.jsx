/**
 * Roads.jsx — Enhanced procedural road layout for the urban intersection.
 * Features:
 * - Rich dark asphalt tarmac with realistic aggregate roughness
 * - Double solid yellow center medians, white dashed lane dividers, and edge lines
 * - Yellow criss-cross hatched "Keep Clear / Box Junction" grid in the center
 * - Stop lines and zebra pedestrian crosswalks on all approaches
 * - Smooth corner curbstone returns, stormwater drain grates, and manhole covers
 * - Extended road arms reaching seamlessly through the city blocks
 */
import { useMemo } from 'react'
import { JUNCTION_LAYOUT } from '../network/junctionLayout'
import { getAsphaltTexture } from './textures'

const ROAD_WIDTH = JUNCTION_LAYOUT.road.width // 18
const JUNCTION_SIZE = JUNCTION_LAYOUT.road.junctionHalf * 2 // 22
const EXTENDED_ARM_LENGTH = 68 // Extends roads deep into city districts
const LANE_WIDTH = JUNCTION_LAYOUT.lane.width

const asphaltColor = '#26292d'
const markingWhite = '#f8fafc'
const markingYellow = '#eab308'
const curbColor = '#94a3b8'

/** Road surface segment with high-res asphalt aggregate texture */
function Surface({ position, width, length }) {
  const texture = useMemo(() => {
    const tex = getAsphaltTexture().clone()
    tex.repeat.set(Math.max(1, width / 4), Math.max(1, length / 4))
    tex.needsUpdate = true
    return tex
  }, [width, length])

  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={[width, 0.1, length]} />
      <meshStandardMaterial
        color={asphaltColor}
        map={texture}
        roughnessMap={texture}
        roughness={0.92}
        metalness={0.15}
      />
    </mesh>
  )
}

/** Yellow Hatched "Box Junction" (Do Not Block Grid) in the intersection center */
function BoxJunctionGrid() {
  const boxSize = JUNCTION_SIZE - 2.5
  const stripes = [-7, -5, -3, -1, 1, 3, 5, 7]

  return (
    <group position={[0, 0.076, 0]}>
      {/* Outer yellow border box */}
      {[-boxSize / 2, boxSize / 2].map((z, zi) => (
        <mesh key={`b-h-${zi}`} position={[0, 0, z]}>
          <boxGeometry args={[boxSize, 0.015, 0.2]} />
          <meshStandardMaterial color={markingYellow} roughness={0.6} />
        </mesh>
      ))}
      {[-boxSize / 2, boxSize / 2].map((x, xi) => (
        <mesh key={`b-v-${xi}`} position={[x, 0, 0]}>
          <boxGeometry args={[0.2, 0.015, boxSize]} />
          <meshStandardMaterial color={markingYellow} roughness={0.6} />
        </mesh>
      ))}

      {/* Criss-cross diagonal yellow stripes */}
      {stripes.map((offset) => (
        <mesh key={`diag1-${offset}`} position={[offset, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
          <boxGeometry args={[boxSize * 1.25, 0.014, 0.16]} />
          <meshStandardMaterial color={markingYellow} opacity={0.85} transparent roughness={0.6} />
        </mesh>
      ))}
      {stripes.map((offset) => (
        <mesh key={`diag2-${offset}`} position={[offset, 0, 0]} rotation={[0, -Math.PI / 4, 0]}>
          <boxGeometry args={[boxSize * 1.25, 0.014, 0.16]} />
          <meshStandardMaterial color={markingYellow} opacity={0.85} transparent roughness={0.6} />
        </mesh>
      ))}
    </group>
  )
}

/** Realistic lane markings with double yellow center line, lane dashes, and edge lines */
function RoadMarkings({ position, rotation, length }) {
  const dashCount = Math.floor(length / 3)
  const dashes = useMemo(() => {
    return Array.from({ length: dashCount }, (_, i) => i * 3 - length / 2 + 1.5)
  }, [dashCount, length])

  return (
    <group position={position} rotation={rotation}>
      {/* Double Solid Yellow Center Line */}
      {[-0.14, 0.14].map((z) => (
        <mesh key={`yellow-${z}`} position={[0, 0.076, z]}>
          <boxGeometry args={[length, 0.015, 0.12]} />
          <meshStandardMaterial color={markingYellow} roughness={0.5} />
        </mesh>
      ))}

      {/* White Dashed Lane Dividers (left and right traffic lanes) */}
      {[-4.2, 4.2].map((laneZ) => (
        <group key={`dashes-${laneZ}`}>
          {dashes.map((x) => (
            <mesh key={x} position={[x, 0.076, laneZ]}>
              <boxGeometry args={[1.8, 0.015, 0.14]} />
              <meshStandardMaterial color={markingWhite} roughness={0.5} />
            </mesh>
          ))}
        </group>
      ))}

      {/* Solid White Outer Shoulder Lines */}
      {[-ROAD_WIDTH / 2 + 0.4, ROAD_WIDTH / 2 - 0.4].map((z) => (
        <mesh key={`edge-${z}`} position={[0, 0.076, z]}>
          <boxGeometry args={[length, 0.015, 0.14]} />
          <meshStandardMaterial color={markingWhite} opacity={0.85} transparent roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

/** Stop Line before the crosswalk */
function StopLine({ position, rotation }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[ROAD_WIDTH - 1.2, 0.02, 0.38]} />
      <meshStandardMaterial color={markingWhite} roughness={0.5} />
    </mesh>
  )
}

/** Zebra Pedestrian Crossing */
function Zebra({ position, rotation }) {
  const count = 9
  const spacing = (ROAD_WIDTH - 2) / count
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: count }, (_, i) => (
        <mesh key={i} position={[-(ROAD_WIDTH - 2) / 2 + spacing * i + spacing / 2, 0.076, 0]}>
          <boxGeometry args={[1.2, 0.016, JUNCTION_LAYOUT.crosswalkDepth]} />
          <meshStandardMaterial color={markingWhite} opacity={0.92} transparent roughness={0.5} />
        </mesh>
      ))}
    </group>
  )
}

/** Granite Curbstone along road edge */
function Curb({ position, rotation, length }) {
  return (
    <mesh position={position} rotation={rotation} receiveShadow castShadow>
      <boxGeometry args={[length, 0.22, 0.35]} />
      <meshStandardMaterial color={curbColor} roughness={0.65} />
    </mesh>
  )
}

/** Stormwater Drain Grates along the curbs */
function DrainGrate({ position, rotation = [0, 0, 0] }) {
  return (
    <mesh position={position} rotation={rotation}>
      <boxGeometry args={[1.2, 0.03, 0.5]} />
      <meshStandardMaterial color="#1e293b" metalness={0.85} roughness={0.3} />
    </mesh>
  )
}

/** Cast-iron Manhole Cover in the road */
function Manhole({ position }) {
  return (
    <group position={position}>
      {/* Outer iron ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.5, 0.58, 16]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.4} />
      </mesh>
      {/* Textured iron center disk */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.5, 16]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.5} />
      </mesh>
    </group>
  )
}

export default function Roads() {
  const armOffset = JUNCTION_LAYOUT.road.junctionHalf + EXTENDED_ARM_LENGTH / 2
  const markingLength = EXTENDED_ARM_LENGTH - 4
  const stop = JUNCTION_LAYOUT.stopLineOffset
  const crosswalk = JUNCTION_LAYOUT.crosswalkOffset
  const curbOffset = ROAD_WIDTH / 2 + 0.18

  return (
    <group>
      {/* Central Junction Surface */}
      <Surface position={[0, 0, 0]} width={JUNCTION_SIZE + 0.2} length={JUNCTION_SIZE + 0.2} />

      {/* 4 Extended Road Arms */}
      <Surface position={[0, 0, -armOffset]} width={ROAD_WIDTH} length={EXTENDED_ARM_LENGTH} />
      <Surface position={[0, 0, armOffset]} width={ROAD_WIDTH} length={EXTENDED_ARM_LENGTH} />
      <Surface position={[armOffset, 0, 0]} width={EXTENDED_ARM_LENGTH} length={ROAD_WIDTH} />
      <Surface position={[-armOffset, 0, 0]} width={EXTENDED_ARM_LENGTH} length={ROAD_WIDTH} />

      {/* Yellow Box Junction Grating in center */}
      <BoxJunctionGrid />

      {/* Lane Markings on all 4 arms */}
      <RoadMarkings position={[0, 0, -armOffset]} rotation={[0, Math.PI / 2, 0]} length={markingLength} />
      <RoadMarkings position={[0, 0, armOffset]} rotation={[0, Math.PI / 2, 0]} length={markingLength} />
      <RoadMarkings position={[armOffset, 0, 0]} rotation={[0, 0, 0]} length={markingLength} />
      <RoadMarkings position={[-armOffset, 0, 0]} rotation={[0, 0, 0]} length={markingLength} />

      {/* Stop Lines on all 4 approaches */}
      <StopLine position={[0, 0.076, -stop]} rotation={[0, 0, 0]} />
      <StopLine position={[0, 0.076, stop]} rotation={[0, 0, 0]} />
      <StopLine position={[-stop, 0.076, 0]} rotation={[0, Math.PI / 2, 0]} />
      <StopLine position={[stop, 0.076, 0]} rotation={[0, Math.PI / 2, 0]} />

      {/* Zebra Crossings on all 4 approaches */}
      <Zebra position={[0, 0, -crosswalk]} rotation={[0, 0, 0]} />
      <Zebra position={[0, 0, crosswalk]} rotation={[0, 0, 0]} />
      <Zebra position={[-crosswalk, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Zebra position={[crosswalk, 0, 0]} rotation={[0, Math.PI / 2, 0]} />

      {/* Granite Curbs along road approaches */}
      {[-1, 1].flatMap((sign) => [
        <Curb key={`ns-${sign}-n`} position={[sign * curbOffset, 0.11, -armOffset]} rotation={[0, 0, 0]} length={EXTENDED_ARM_LENGTH} />,
        <Curb key={`ns-${sign}-s`} position={[sign * curbOffset, 0.11, armOffset]} rotation={[0, 0, 0]} length={EXTENDED_ARM_LENGTH} />,
        <Curb key={`ew-${sign}-e`} position={[armOffset, 0.11, sign * curbOffset]} rotation={[0, Math.PI / 2, 0]} length={EXTENDED_ARM_LENGTH} />,
        <Curb key={`ew-${sign}-w`} position={[-armOffset, 0.11, sign * curbOffset]} rotation={[0, Math.PI / 2, 0]} length={EXTENDED_ARM_LENGTH} />,
      ])}

      {/* Stormwater Drain Grates along curbs */}
      <DrainGrate position={[-curbOffset + 0.4, 0.077, -18]} rotation={[0, Math.PI / 2, 0]} />
      <DrainGrate position={[curbOffset - 0.4, 0.077, -18]} rotation={[0, Math.PI / 2, 0]} />
      <DrainGrate position={[-curbOffset + 0.4, 0.077, 18]} rotation={[0, Math.PI / 2, 0]} />
      <DrainGrate position={[curbOffset - 0.4, 0.077, 18]} rotation={[0, Math.PI / 2, 0]} />
      <DrainGrate position={[-18, 0.077, -curbOffset + 0.4]} rotation={[0, 0, 0]} />
      <DrainGrate position={[-18, 0.077, curbOffset - 0.4]} rotation={[0, 0, 0]} />
      <DrainGrate position={[18, 0.077, -curbOffset + 0.4]} rotation={[0, 0, 0]} />
      <DrainGrate position={[18, 0.077, curbOffset - 0.4]} rotation={[0, 0, 0]} />

      {/* Cast-iron Manhole Covers on the road lanes */}
      <Manhole position={[3.5, 0.077, -14]} />
      <Manhole position={[-3.5, 0.077, 14]} />
      <Manhole position={[14, 0.077, 3.5]} />
      <Manhole position={[-14, 0.077, -3.5]} />
    </group>
  )
}

export { ROAD_WIDTH, JUNCTION_SIZE, LANE_WIDTH }
