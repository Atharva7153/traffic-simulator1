/** Procedural road layout for the four-way intersection. */
import { JUNCTION_LAYOUT } from '../network/junctionLayout'

const ROAD_WIDTH = JUNCTION_LAYOUT.road.width
const ROAD_LENGTH = JUNCTION_LAYOUT.road.armLength
const LANE_WIDTH = JUNCTION_LAYOUT.lane.width
const JUNCTION_SIZE = JUNCTION_LAYOUT.road.junctionHalf * 2
const asphaltColor = '#454c4e'
const markingColor = '#f7f5ed'
const curbColor = '#e6e6dd'
const sidewalkColor = '#d0d8d0'

function Surface({ position, width, length }) {
  return <mesh position={position} receiveShadow><boxGeometry args={[width, 0.1, length]} /><meshStandardMaterial color={asphaltColor} roughness={0.9} /></mesh>
}

function RoadMarkings({ position, rotation, length }) {
  const dashes = Array.from({ length: Math.floor(length / 2) }, (_, i) => i * 2 - length / 2 + 0.6)
  return (
    <group position={position} rotation={rotation}>
      {dashes.map((x) => <mesh key={x} position={[x, 0.075, 0]}><boxGeometry args={[1.2, 0.015, 0.12]} /><meshStandardMaterial color={markingColor} /></mesh>)}
      {[-ROAD_WIDTH / 2 + 0.3, ROAD_WIDTH / 2 - 0.3].map((z) => <mesh key={z} position={[0, 0.075, z]}><boxGeometry args={[length, 0.015, 0.1]} /><meshStandardMaterial color={markingColor} opacity={0.5} transparent /></mesh>)}
    </group>
  )
}

function StopLine({ position, rotation }) {
  return <mesh position={position} rotation={rotation}><boxGeometry args={[ROAD_WIDTH - 1, 0.02, 0.3]} /><meshStandardMaterial color={markingColor} /></mesh>
}

function Zebra({ position, rotation }) {
  const count = 8
  const spacing = (ROAD_WIDTH - 2) / count
  return (
    <group position={position} rotation={rotation}>
      {Array.from({ length: count }, (_, i) => <mesh key={i} position={[-(ROAD_WIDTH - 2) / 2 + spacing * i + spacing / 2, 0.075, 0]}><boxGeometry args={[1.1, 0.015, JUNCTION_LAYOUT.crosswalkDepth]} /><meshStandardMaterial color={markingColor} opacity={0.88} transparent /></mesh>)}
    </group>
  )
}

function Curb({ position, rotation, length }) {
  return <mesh position={position} rotation={rotation}><boxGeometry args={[length, 0.2, 0.3]} /><meshStandardMaterial color={curbColor} roughness={0.7} /></mesh>
}

export default function Roads() {
  const armOffset = JUNCTION_LAYOUT.road.junctionHalf + ROAD_LENGTH / 2
  const markingLength = ROAD_LENGTH - 4
  const stop = JUNCTION_LAYOUT.stopLineOffset
  const crosswalk = JUNCTION_LAYOUT.crosswalkOffset
  const curbOffset = ROAD_WIDTH / 2 + 0.15
  return (
    <group>
      <Surface position={[0, 0, 0]} width={JUNCTION_SIZE + 1} length={JUNCTION_SIZE + 1} />
      <Surface position={[0, 0, -armOffset]} width={ROAD_WIDTH} length={ROAD_LENGTH} />
      <Surface position={[0, 0, armOffset]} width={ROAD_WIDTH} length={ROAD_LENGTH} />
      <Surface position={[armOffset, 0, 0]} width={ROAD_LENGTH} length={ROAD_WIDTH} />
      <Surface position={[-armOffset, 0, 0]} width={ROAD_LENGTH} length={ROAD_WIDTH} />
      <RoadMarkings position={[0, 0, -armOffset]} rotation={[0, Math.PI / 2, 0]} length={markingLength} />
      <RoadMarkings position={[0, 0, armOffset]} rotation={[0, Math.PI / 2, 0]} length={markingLength} />
      <RoadMarkings position={[armOffset, 0, 0]} rotation={[0, 0, 0]} length={markingLength} />
      <RoadMarkings position={[-armOffset, 0, 0]} rotation={[0, 0, 0]} length={markingLength} />
      <StopLine position={[0, 0.075, -stop]} rotation={[0, 0, 0]} />
      <StopLine position={[0, 0.075, stop]} rotation={[0, 0, 0]} />
      <StopLine position={[-stop, 0.075, 0]} rotation={[0, Math.PI / 2, 0]} />
      <StopLine position={[stop, 0.075, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Zebra position={[0, 0, -crosswalk]} rotation={[0, 0, 0]} />
      <Zebra position={[0, 0, crosswalk]} rotation={[0, 0, 0]} />
      <Zebra position={[-crosswalk, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      <Zebra position={[crosswalk, 0, 0]} rotation={[0, Math.PI / 2, 0]} />
      {[-1, 1].flatMap((sign) => [
        <Curb key={`ns-${sign}-n`} position={[sign * curbOffset, 0.1, -armOffset]} rotation={[0, 0, 0]} length={ROAD_LENGTH} />,
        <Curb key={`ns-${sign}-s`} position={[sign * curbOffset, 0.1, armOffset]} rotation={[0, 0, 0]} length={ROAD_LENGTH} />,
        <Curb key={`ew-${sign}-e`} position={[armOffset, 0.1, sign * curbOffset]} rotation={[0, Math.PI / 2, 0]} length={ROAD_LENGTH} />,
        <Curb key={`ew-${sign}-w`} position={[-armOffset, 0.1, sign * curbOffset]} rotation={[0, Math.PI / 2, 0]} length={ROAD_LENGTH} />,
      ])}
      {[-1, 1].flatMap((x) => [-1, 1].map((z) => (
        <mesh key={`sidewalk-${x}-${z}`} position={[x * (JUNCTION_LAYOUT.road.junctionHalf + 8), 0.05, z * (JUNCTION_LAYOUT.road.junctionHalf + 8)]} receiveShadow>
          <boxGeometry args={[16, 0.15, 16]} /><meshStandardMaterial color={sidewalkColor} roughness={0.85} />
        </mesh>
      )))}
    </group>
  )
}

export { ROAD_WIDTH, ROAD_LENGTH, JUNCTION_SIZE, LANE_WIDTH }
