/**
 * TrafficSignals.jsx — Four roadside signal assemblies before the stop bars.
 * Each signal has red, amber, and green lamps that respond to simulation state.
 */
import { useMemo } from 'react'
import { CanvasTexture, DoubleSide, SRGBColorSpace } from 'three'
import { APPROACH_LAYOUT } from '../network/junctionLayout'
import { useSimulation } from '../simulation/useSimulation'

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

function createStraightOnlyTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const context = canvas.getContext('2d')
  context.fillStyle = '#126d72'
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.strokeStyle = '#f8f7ed'
  context.lineWidth = 9
  context.strokeRect(6, 6, canvas.width - 12, canvas.height - 12)
  context.fillStyle = '#fffdf5'
  context.font = '700 52px system-ui, sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText('STRAIGHT ONLY', canvas.width / 2, canvas.height / 2)
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

function SignalAssembly({ position, rotation, signalState, signTexture }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Pole */}
      <mesh position={[0, SIGNAL_HEIGHT / 2, 0]}>
        <cylinderGeometry args={[POLE_RADIUS, POLE_RADIUS, SIGNAL_HEIGHT, 8]} />
        <meshStandardMaterial color="#374151" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Indian-style straight-ahead sign on the approach signal pole. */}
      <mesh position={[0, 2.25, 0.1]}>
        <boxGeometry args={[2.7, 0.78, 0.12]} />
        <meshStandardMaterial color="#126d72" roughness={0.6} />
      </mesh>
      <mesh position={[0, 2.25, 0.035]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[2.5, 0.58]} />
        <meshBasicMaterial map={signTexture} side={DoubleSide} toneMapped={false} />
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
  const signTexture = useMemo(() => createStraightOnlyTexture(), [])
  const rotations = { north: 0, south: Math.PI, east: -Math.PI / 2, west: Math.PI / 2 }

  return (
    <group>
      {Object.entries(APPROACH_LAYOUT).map(([direction, approach]) => (
        <SignalAssembly
          key={direction}
          position={[approach.signal[0], 0, approach.signal[1]]}
          rotation={[0, rotations[direction], 0]}
          signalState={signals[direction]}
          signTexture={signTexture}
        />
      ))}
    </group>
  )
}
