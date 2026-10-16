/**
 * Vehicles.jsx — Procedural vehicle models placed on roads.
 * Includes sedan, SUV, bus, and auto-rickshaw silhouettes.
 * Phase 1: vehicles are stationary, positioned in sensible orientations.
 */
import { useMemo } from 'react'
import { JUNCTION_SIZE } from './Roads'

// Color palettes for vehicles
const CAR_COLORS = ['#1e40af', '#dc2626', '#f8fafc', '#0f766e', '#6b21a8', '#ea580c', '#374151', '#fbbf24']
const BUS_COLORS = ['#b91c1c', '#1d4ed8', '#047857']

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

/** Sedan — a compact car shape */
function Sedan({ position, rotation, color }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Body lower */}
      <mesh position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[1.8, 0.5, 3.8]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Body upper (cabin) */}
      <mesh position={[0, 0.75, -0.1]} castShadow>
        <boxGeometry args={[1.5, 0.5, 2.0]} />
        <meshStandardMaterial color={color} metalness={0.4} roughness={0.5} />
      </mesh>
      {/* Windshield front */}
      <mesh position={[0, 0.75, 0.85]}>
        <boxGeometry args={[1.4, 0.45, 0.05]} />
        <meshStandardMaterial color="#b0d4f1" metalness={0.8} roughness={0.1} opacity={0.7} transparent />
      </mesh>
      {/* Windshield rear */}
      <mesh position={[0, 0.75, -1.05]}>
        <boxGeometry args={[1.4, 0.45, 0.05]} />
        <meshStandardMaterial color="#b0d4f1" metalness={0.8} roughness={0.1} opacity={0.7} transparent />
      </mesh>
      {/* Side windows */}
      <mesh position={[0.76, 0.75, -0.1]}>
        <boxGeometry args={[0.05, 0.35, 1.8]} />
        <meshStandardMaterial color="#a5c9e0" metalness={0.6} roughness={0.2} opacity={0.6} transparent />
      </mesh>
      <mesh position={[-0.76, 0.75, -0.1]}>
        <boxGeometry args={[0.05, 0.35, 1.8]} />
        <meshStandardMaterial color="#a5c9e0" metalness={0.6} roughness={0.2} opacity={0.6} transparent />
      </mesh>
      {/* Wheels */}
      {[[-0.85, 0.15, 1.1], [0.85, 0.15, 1.1], [-0.85, 0.15, -1.1], [0.85, 0.15, -1.1]].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.25, 0.25, 0.2, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
      ))}
      {/* Headlights */}
      <mesh position={[-0.6, 0.35, 1.91]}>
        <boxGeometry args={[0.35, 0.15, 0.05]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.6, 0.35, 1.91]}>
        <boxGeometry args={[0.35, 0.15, 0.05]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={0.3} />
      </mesh>
      {/* Tail lights */}
      <mesh position={[-0.7, 0.4, -1.91]}>
        <boxGeometry args={[0.25, 0.12, 0.05]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.4} />
      </mesh>
      <mesh position={[0.7, 0.4, -1.91]}>
        <boxGeometry args={[0.25, 0.12, 0.05]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={0.4} />
      </mesh>
    </group>
  )
}

/** Bus — larger, rectangular vehicle */
function Bus({ position, rotation, color }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Main body */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <boxGeometry args={[2.4, 1.6, 8.0]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Roof */}
      <mesh position={[0, 1.75, 0]}>
        <boxGeometry args={[2.3, 0.1, 7.8]} />
        <meshStandardMaterial color="#e5e7eb" roughness={0.5} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 1.1, 4.01]}>
        <boxGeometry args={[2.0, 1.0, 0.05]} />
        <meshStandardMaterial color="#93c5fd" metalness={0.6} roughness={0.2} opacity={0.6} transparent />
      </mesh>
      {/* Side windows - row */}
      {[-3, -1.5, 0, 1.5, 3].map((z, i) => (
        <group key={i}>
          <mesh position={[1.21, 1.1, z]}>
            <boxGeometry args={[0.05, 0.7, 1.0]} />
            <meshStandardMaterial color="#bfdbfe" metalness={0.5} roughness={0.2} opacity={0.5} transparent />
          </mesh>
          <mesh position={[-1.21, 1.1, z]}>
            <boxGeometry args={[0.05, 0.7, 1.0]} />
            <meshStandardMaterial color="#bfdbfe" metalness={0.5} roughness={0.2} opacity={0.5} transparent />
          </mesh>
        </group>
      ))}
      {/* Wheels */}
      {[[-1.15, 0.25, 2.8], [1.15, 0.25, 2.8], [-1.15, 0.25, -2.8], [1.15, 0.25, -2.8]].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.35, 0.35, 0.25, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
      ))}
      {/* Route display on front */}
      <mesh position={[0, 1.55, 4.02]}>
        <boxGeometry args={[1.5, 0.25, 0.02]} />
        <meshStandardMaterial color="#fbbf24" emissive="#fbbf24" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

/** Auto-rickshaw — an iconic Indian three-wheeler */
function AutoRickshaw({ position, rotation, color = '#15803d' }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Lower body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.3, 0.45, 2.2]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Canopy / roof */}
      <mesh position={[0, 0.85, -0.15]}>
        <boxGeometry args={[1.3, 0.5, 1.7]} />
        <meshStandardMaterial color={color} roughness={0.6} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.75, 0.75]}>
        <boxGeometry args={[1.1, 0.5, 0.04]} />
        <meshStandardMaterial color="#a5f3fc" metalness={0.5} roughness={0.2} opacity={0.6} transparent />
      </mesh>
      {/* Open sides (no doors) — represented by dark interior */}
      <mesh position={[0.66, 0.65, -0.15]}>
        <boxGeometry args={[0.03, 0.35, 1.3]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      <mesh position={[-0.66, 0.65, -0.15]}>
        <boxGeometry args={[0.03, 0.35, 1.3]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>
      {/* Front wheel */}
      <mesh position={[0, 0.15, 0.85]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.15, 10]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Rear wheels */}
      <mesh position={[-0.6, 0.15, -0.75]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.15, 10]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      <mesh position={[0.6, 0.15, -0.75]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.2, 0.2, 0.15, 10]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>
      {/* Headlight */}
      <mesh position={[0, 0.5, 1.12]}>
        <sphereGeometry args={[0.1, 8, 8]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={0.5} />
      </mesh>
    </group>
  )
}

/** SUV — slightly larger than sedan */
function SUV({ position, rotation, color }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Body lower */}
      <mesh position={[0, 0.45, 0]} castShadow>
        <boxGeometry args={[2.0, 0.6, 4.2]} />
        <meshStandardMaterial color={color} metalness={0.35} roughness={0.5} />
      </mesh>
      {/* Body upper (cabin) */}
      <mesh position={[0, 0.95, -0.2]} castShadow>
        <boxGeometry args={[1.8, 0.6, 2.5]} />
        <meshStandardMaterial color={color} metalness={0.35} roughness={0.5} />
      </mesh>
      {/* Windshield */}
      <mesh position={[0, 0.95, 1.06]}>
        <boxGeometry args={[1.6, 0.5, 0.05]} />
        <meshStandardMaterial color="#93c5fd" metalness={0.7} roughness={0.15} opacity={0.65} transparent />
      </mesh>
      {/* Side windows */}
      <mesh position={[0.91, 0.95, -0.2]}>
        <boxGeometry args={[0.05, 0.45, 2.2]} />
        <meshStandardMaterial color="#93c5fd" metalness={0.6} roughness={0.2} opacity={0.55} transparent />
      </mesh>
      <mesh position={[-0.91, 0.95, -0.2]}>
        <boxGeometry args={[0.05, 0.45, 2.2]} />
        <meshStandardMaterial color="#93c5fd" metalness={0.6} roughness={0.2} opacity={0.55} transparent />
      </mesh>
      {/* Wheels */}
      {[[-0.95, 0.2, 1.3], [0.95, 0.2, 1.3], [-0.95, 0.2, -1.3], [0.95, 0.2, -1.3]].map((pos, i) => (
        <mesh key={i} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.3, 0.3, 0.22, 12]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
        </mesh>
      ))}
      {/* Headlights */}
      <mesh position={[-0.7, 0.45, 2.11]}>
        <boxGeometry args={[0.4, 0.15, 0.05]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={0.3} />
      </mesh>
      <mesh position={[0.7, 0.45, 2.11]}>
        <boxGeometry args={[0.4, 0.15, 0.05]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={0.3} />
      </mesh>
    </group>
  )
}

export default function Vehicles() {
  const vehicles = useMemo(() => {
    const rng = seededRandom(42)
    const pick = (arr) => arr[Math.floor(rng() * arr.length)]
    const jOff = JUNCTION_SIZE / 2

    return [
      // === NORTH APPROACH (coming from -Z, heading +Z) ===
      // Right lane (x ≈ +2.5)
      { type: 'sedan', pos: [2.5, 0, -(jOff + 8)], rot: [0, 0, 0], color: pick(CAR_COLORS) },
      { type: 'suv', pos: [2.5, 0, -(jOff + 14)], rot: [0, 0, 0], color: pick(CAR_COLORS) },
      { type: 'auto', pos: [2.5, 0, -(jOff + 20)], rot: [0, 0, 0] },
      // Left lane (x ≈ -2.5) — incoming in same direction
      { type: 'sedan', pos: [-2.5, 0, -(jOff + 10)], rot: [0, 0, 0], color: pick(CAR_COLORS) },

      // === SOUTH APPROACH (coming from +Z, heading -Z) ===
      { type: 'sedan', pos: [-2.5, 0, jOff + 9], rot: [0, Math.PI, 0], color: pick(CAR_COLORS) },
      { type: 'auto', pos: [-2.5, 0, jOff + 15], rot: [0, Math.PI, 0] },
      { type: 'suv', pos: [2.5, 0, jOff + 12], rot: [0, Math.PI, 0], color: pick(CAR_COLORS) },

      // === EAST APPROACH (coming from +X, heading -X) ===
      { type: 'bus', pos: [jOff + 14, 0, 2.5], rot: [0, -Math.PI / 2, 0], color: pick(BUS_COLORS) },
      { type: 'sedan', pos: [jOff + 8, 0, 2.5], rot: [0, -Math.PI / 2, 0], color: pick(CAR_COLORS) },
      { type: 'auto', pos: [jOff + 9, 0, -2.5], rot: [0, -Math.PI / 2, 0] },

      // === WEST APPROACH (coming from -X, heading +X) ===
      { type: 'sedan', pos: [-(jOff + 9), 0, -2.5], rot: [0, Math.PI / 2, 0], color: pick(CAR_COLORS) },
      { type: 'sedan', pos: [-(jOff + 15), 0, -2.5], rot: [0, Math.PI / 2, 0], color: pick(CAR_COLORS) },
      { type: 'suv', pos: [-(jOff + 11), 0, 2.5], rot: [0, Math.PI / 2, 0], color: pick(CAR_COLORS) },
    ]
  }, [])

  return (
    <group>
      {vehicles.map((v, i) => {
        switch (v.type) {
          case 'sedan':
            return <Sedan key={i} position={v.pos} rotation={v.rot} color={v.color} />
          case 'suv':
            return <SUV key={i} position={v.pos} rotation={v.rot} color={v.color} />
          case 'bus':
            return <Bus key={i} position={v.pos} rotation={v.rot} color={v.color} />
          case 'auto':
            return <AutoRickshaw key={i} position={v.pos} rotation={v.rot} />
          default:
            return null
        }
      })}
    </group>
  )
}
