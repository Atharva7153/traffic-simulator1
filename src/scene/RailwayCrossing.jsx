import { useRef } from 'react'
import { MathUtils } from 'three'
import { useFrame } from '@react-three/fiber'
import { useSimulation } from '../simulation/useSimulation'

const RAIL_Z = -23
const ACTIVE = ['WARNING', 'CLOSED', 'TRAIN PASSING', 'CLEARANCE']

function Coach({ x, locomotive = false }) {
  const body = locomotive ? '#174a78' : '#b91c36'
  const windows = locomotive ? '#b9e7f2' : '#d9f4f5'
  const wheelXs = locomotive ? [-2.6, 2.2] : [-2.5, 2.5]
  return (
    <group position={[x, 0, 0]}>
      <mesh position={[0, 1.8, 0]} castShadow>
        <boxGeometry args={[locomotive ? 7 : 7.4, 2.7, 2.45]} />
        <meshStandardMaterial color={body} roughness={0.55} />
      </mesh>
      <mesh position={[0, 3.18, 0]} castShadow>
        <boxGeometry args={[locomotive ? 6.8 : 7.1, 0.22, 2.55]} />
        <meshStandardMaterial color="#d4d8dc" metalness={0.35} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0.57, 0]}>
        <boxGeometry args={[locomotive ? 7.05 : 7.5, 0.18, 2.52]} />
        <meshStandardMaterial color={locomotive ? '#f3bd36' : '#f3c53d'} />
      </mesh>
      {[-0.9, 0, 0.9].map((side) => (
        <mesh key={`window-${side}`} position={[side * 2.15, 2.05, 1.235]}>
          <boxGeometry args={[locomotive ? 0.9 : 1.1, 0.76, 0.035]} />
          <meshStandardMaterial color={windows} metalness={0.25} roughness={0.25} />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={`window-back-${side}`} position={[side * 2.15, 2.05, -1.235]}>
          <boxGeometry args={[locomotive ? 0.9 : 1.1, 0.76, 0.035]} />
          <meshStandardMaterial color={windows} metalness={0.25} roughness={0.25} />
        </mesh>
      ))}
      {wheelXs.flatMap((wx) => [-1.13, 1.13].map((z) => (
        <mesh key={`wheel-${wx}-${z}`} position={[wx, 0.35, z]} rotation={[Math.PI / 2, 0, 0]} castShadow>
          <cylinderGeometry args={[0.36, 0.36, 0.18, 12]} />
          <meshStandardMaterial color="#20252a" roughness={0.85} />
        </mesh>
      )))}
      {locomotive && (
        <>
          <mesh position={[3.65, 1.75, 0]}>
            <boxGeometry args={[0.25, 1.35, 2.15]} />
            <meshStandardMaterial color="#f2b934" />
          </mesh>
          {[-0.68, 0.68].map((z) => (
            <mesh key={z} position={[3.79, 2.15, z]}>
              <cylinderGeometry args={[0.2, 0.2, 0.08, 12]} />
              <meshStandardMaterial color="#fff5bd" emissive="#ffe896" emissiveIntensity={2} />
            </mesh>
          ))}
          <mesh position={[3.67, 0.5, 0]}><boxGeometry args={[0.4, 0.28, 1.8]} /><meshStandardMaterial color="#222831" /></mesh>
        </>
      )}
    </group>
  )
}

function CrossingSign({ position, active, materialRef }) {
  return (
    <group position={position}>
      <mesh position={[0, 1.25, 0]}><cylinderGeometry args={[0.07, 0.1, 2.5, 8]} /><meshStandardMaterial color="#4b5563" /></mesh>
      <mesh position={[0, 2.35, 0]}><boxGeometry args={[0.9, 0.75, 0.15]} /><meshStandardMaterial color="#f4f5f0" /></mesh>
      <mesh position={[0, 2.35, 0.09]} rotation={[0, 0, Math.PI / 4]}><boxGeometry args={[0.58, 0.08, 0.025]} /><meshStandardMaterial color="#b91c1c" /></mesh>
      <mesh position={[0, 2.35, 0.1]} rotation={[0, 0, -Math.PI / 4]}><boxGeometry args={[0.58, 0.08, 0.025]} /><meshStandardMaterial color="#b91c1c" /></mesh>
      <mesh position={[0.56, 1.7, 0]}>
        <sphereGeometry args={[0.2, 12, 10]} />
        <meshStandardMaterial ref={materialRef} color={active ? '#ef2929' : '#7f1d1d'} emissive="#ff1616" emissiveIntensity={active ? 2 : 0.05} />
      </mesh>
    </group>
  )
}

export default function RailwayCrossing() {
  const { railwayStatus, railwayProgress } = useSimulation()
  const northGate = useRef()
  const southGate = useRef()
  const train = useRef()
  const lamp = useRef()
  const lamp2 = useRef()
  const lampMaterial = useRef()
  const lampMaterial2 = useRef()
  const closed = ['CLOSED', 'TRAIN PASSING', 'CLEARANCE'].includes(railwayStatus)
  const active = ACTIVE.includes(railwayStatus)

  useFrame((state, delta) => {
    const target = closed ? 0 : (railwayStatus === 'WARNING' ? 0 : Math.PI / 2)
    if (northGate.current) northGate.current.rotation.z = MathUtils.damp(northGate.current.rotation.z, target, 1.4, delta)
    if (southGate.current) southGate.current.rotation.z = MathUtils.damp(southGate.current.rotation.z, target, 1.4, delta)
    if (train.current) {
      train.current.position.x = -47 + railwayProgress * 83
      train.current.visible = railwayStatus === 'TRAIN PASSING' || railwayStatus === 'CLEARANCE'
    }
    const blink = active && Math.sin(state.clock.elapsedTime * 8) > 0 ? 2.4 : 0.05
    if (lamp.current) lamp.current.intensity = blink
    if (lamp2.current) lamp2.current.intensity = blink
    if (lampMaterial.current) lampMaterial.current.emissiveIntensity = blink
    if (lampMaterial2.current) lampMaterial2.current.emissiveIntensity = blink
  })

  return (
    <group>
      {/* East-west ground-level railway crossing on the north road approach. */}
      {[-0.92, 0.92].map((z) => (
        <mesh key={`rail-${z}`} position={[0, 0.16, RAIL_Z + z]} receiveShadow>
          <boxGeometry args={[78, 0.22, 0.18]} />
          <meshStandardMaterial color="#aeb7ba" metalness={0.75} roughness={0.27} />
        </mesh>
      ))}
      {Array.from({ length: 47 }, (_, i) => -38 + i * 1.65).map((x) => (
        <mesh key={`sleeper-${x}`} position={[x, 0.09, RAIL_Z]}>
          <boxGeometry args={[0.32, 0.12, 3.15]} />
          <meshStandardMaterial color="#665347" roughness={0.9} />
        </mesh>
      ))}
      {[-4.15, 4.15].map((offset, index) => (
        <group key={`barrier-${offset}`} position={[-5.1, 0.72, RAIL_Z + offset]}>
          <mesh position={[0, -0.35, 0]}><boxGeometry args={[0.55, 0.75, 0.55]} /><meshStandardMaterial color="#4b5563" /></mesh>
          <group ref={index === 0 ? northGate : southGate} rotation={[0, 0, closed ? 0 : Math.PI / 2]}>
            <mesh position={[5.1, 0, 0]} castShadow>
              <boxGeometry args={[10.5, 0.2, 0.22]} />
              <meshStandardMaterial color="#f3f4f6" />
            </mesh>
            {Array.from({ length: 5 }, (_, i) => (
              <mesh key={i} position={[1.15 + i * 1.8, 0.01, 0.12]}>
                <boxGeometry args={[0.8, 0.205, 0.025]} />
                <meshStandardMaterial color="#d62828" />
              </mesh>
            ))}
          </group>
        </group>
      ))}
      <CrossingSign position={[-7.2, 0, RAIL_Z - 4.2]} active={active} materialRef={lampMaterial} />
      <CrossingSign position={[7.2, 0, RAIL_Z + 4.2]} active={active} materialRef={lampMaterial2} />
      <pointLight ref={lamp} color="#ff3030" intensity={0} distance={7} position={[-7.2, 1.7, RAIL_Z - 4.2]} />
      <pointLight ref={lamp2} color="#ff3030" intensity={0} distance={7} position={[7.2, 1.7, RAIL_Z + 4.2]} />
      <group ref={train} visible={false} position={[-47, 0, RAIL_Z]}>
        <Coach x={0} locomotive />
        <Coach x={-7.8} />
        <Coach x={-15.5} />
        <Coach x={-23.2} />
      </group>
    </group>
  )
}
