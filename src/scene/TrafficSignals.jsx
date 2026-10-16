/**
 * TrafficSignals.jsx — Four traffic signal assemblies at the junction corners.
 * Each signal has red, amber, and green lamps that respond to simulation state.
 */
import { useSimulation } from '../simulation/useSimulation'
import { JUNCTION_SIZE } from './Roads'

const SIGNAL_HEIGHT = 4
const POLE_RADIUS = 0.12
const LAMP_RADIUS = 0.34
const HOUSING_WIDTH = 0.9
const HOUSING_HEIGHT = 2.2
const HOUSING_DEPTH = 0.5

function SignalLamp({ position, color, isActive }) {
  return (
    <mesh position={position}>
      <sphereGeometry args={[LAMP_RADIUS, 16, 16]} />
      <meshStandardMaterial
        color={color}
        emissive={isActive ? color : '#111'}
        emissiveIntensity={isActive ? 4 : 0.025}
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  )
}

function SignalAssembly({ position, rotation, signalState }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Pole */}
      <mesh position={[0, SIGNAL_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[POLE_RADIUS, POLE_RADIUS, SIGNAL_HEIGHT, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Signal housing */}
      <group position={[0, SIGNAL_HEIGHT + HOUSING_HEIGHT / 2 - 0.3, 0]}>
        {/* Housing box */}
        <mesh>
          <boxGeometry args={[HOUSING_WIDTH, HOUSING_HEIGHT, HOUSING_DEPTH]} />
          <meshStandardMaterial color="#1f2937" metalness={0.3} roughness={0.5} />
        </mesh>

        {/* Hood/visor */}
        <mesh position={[0, 0, -HOUSING_DEPTH / 2 - 0.1]}>
          <boxGeometry args={[HOUSING_WIDTH + 0.1, HOUSING_HEIGHT + 0.1, 0.05]} />
          <meshStandardMaterial color="#111827" />
        </mesh>

        {/* Lamps: Red (top), Amber (middle), Green (bottom) */}
        <SignalLamp
          position={[0, 0.65, -HOUSING_DEPTH / 2 + 0.05]}
          color="#ef4444"
          isActive={signalState === 'red'}
        />
        <SignalLamp
          position={[0, 0, -HOUSING_DEPTH / 2 + 0.05]}
          color="#f59e0b"
          isActive={signalState === 'amber'}
        />
        <SignalLamp
          position={[0, -0.65, -HOUSING_DEPTH / 2 + 0.05]}
          color="#22c55e"
          isActive={signalState === 'green'}
        />
      </group>
    </group>
  )
}

export default function TrafficSignals() {
  const { signals } = useSimulation()
  const offset = JUNCTION_SIZE / 2 + 1.5

  return (
    <group>
      {/* North signal — on the right side of the north approach, facing south */}
      <SignalAssembly
        position={[offset - 2, 0, -offset]}
        rotation={[0, Math.PI, 0]}
        signalState={signals.north}
      />

      {/* South signal — on the right side of the south approach, facing north */}
      <SignalAssembly
        position={[-(offset - 2), 0, offset]}
        rotation={[0, 0, 0]}
        signalState={signals.south}
      />

      {/* East signal — on the right side of the east approach, facing west */}
      <SignalAssembly
        position={[offset, 0, offset - 2]}
        rotation={[0, Math.PI / 2, 0]}
        signalState={signals.east}
      />

      {/* West signal — on the right side of the west approach, facing east */}
      <SignalAssembly
        position={[-offset, 0, -(offset - 2)]}
        rotation={[0, -Math.PI / 2, 0]}
        signalState={signals.west}
      />
    </group>
  )
}
