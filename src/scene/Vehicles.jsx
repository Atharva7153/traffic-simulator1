/**
 * Vehicles.jsx — Procedural vehicle models placed on roads.
 * Includes Indian road vehicles and a dispatched ambulance driven by the shared
 * simulation snapshot.
 */
import { useSimulation } from '../simulation/useSimulation'

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

function Motorcycle({ position, rotation, color }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.42, 0]}>
        <boxGeometry args={[0.32, 0.28, 1.2]} />
        <meshStandardMaterial color={color} roughness={0.72} />
      </mesh>
      <mesh position={[0, 0.62, 0.08]} rotation={[0.12, 0, 0]}>
        <boxGeometry args={[0.48, 0.28, 0.5]} />
        <meshStandardMaterial color="#d97706" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.78, -0.35]}>
        <boxGeometry args={[0.38, 0.14, 0.38]} />
        <meshStandardMaterial color="#111827" roughness={0.8} />
      </mesh>
      {[-0.72, 0.72].map(z => (
        <mesh key={z} position={[0, 0.22, z]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.24, 0.24, 0.12, 12]} />
          <meshStandardMaterial color="#111827" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[0, 0.6, 0.73]}>
        <sphereGeometry args={[0.12, 10, 8]} />
        <meshStandardMaterial color="#fff7cc" emissive="#fff1a8" emissiveIntensity={0.8} />
      </mesh>
      <mesh position={[0, 1.2, -0.05]}>
        <sphereGeometry args={[0.2, 10, 8]} />
        <meshStandardMaterial color="#1e293b" roughness={0.55} />
      </mesh>
      <mesh position={[0, 0.93, -0.02]}>
        <capsuleGeometry args={[0.16, 0.38, 4, 8]} />
        <meshStandardMaterial color="#2563eb" roughness={0.8} />
      </mesh>
    </group>
  )
}

function Ambulance({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[2, 1.25, 4.6]} />
        <meshStandardMaterial color="#f8fafc" roughness={0.55} />
      </mesh>
      <mesh position={[0, 1.42, -0.15]} castShadow>
        <boxGeometry args={[1.82, 0.82, 2.55]} />
        <meshStandardMaterial color="#ffffff" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.4, 1.14]}>
        <boxGeometry args={[1.55, 0.58, 0.04]} />
        <meshStandardMaterial color="#a8d7eb" roughness={0.25} metalness={0.1} />
      </mesh>
      {[-1.01, 1.01].map(side => (
        <group key={side} position={[side, 0.96, -0.25]}>
          <mesh><boxGeometry args={[0.04, 0.58, 0.2]} /><meshStandardMaterial color="#dc2626" /></mesh>
          <mesh><boxGeometry args={[0.04, 0.2, 0.58]} /><meshStandardMaterial color="#dc2626" /></mesh>
          <mesh position={[0, -0.49, 0.45]}><boxGeometry args={[0.05, 0.18, 1.65]} /><meshStandardMaterial color="#dc2626" /></mesh>
        </group>
      ))}
      {[[-0.92, 0.2, 1.45], [0.92, 0.2, 1.45], [-0.92, 0.2, -1.45], [0.92, 0.2, -1.45]].map((pos, index) => (
        <mesh key={index} position={pos} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.28, 0.28, 0.18, 12]} />
          <meshStandardMaterial color="#111827" roughness={0.9} />
        </mesh>
      ))}
      <mesh position={[-0.38, 1.95, 0]}>
        <boxGeometry args={[0.42, 0.16, 0.24]} />
        <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={2} />
      </mesh>
      <mesh position={[0.38, 1.95, 0]}>
        <boxGeometry args={[0.42, 0.16, 0.24]} />
        <meshStandardMaterial color="#2563eb" emissive="#2563eb" emissiveIntensity={2} />
      </mesh>
      <mesh position={[-0.68, 0.68, 2.31]}><boxGeometry args={[0.4, 0.18, 0.04]} /><meshStandardMaterial color="#fff7cc" emissive="#fff7cc" emissiveIntensity={0.8} /></mesh>
      <mesh position={[0.68, 0.68, 2.31]}><boxGeometry args={[0.4, 0.18, 0.04]} /><meshStandardMaterial color="#fff7cc" emissive="#fff7cc" emissiveIntensity={0.8} /></mesh>
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
  const { vehicles } = useSimulation()
  const rotations = { north: 0, south: Math.PI, east: -Math.PI / 2, west: Math.PI / 2 }

  return (
    <group>
      {vehicles.map((v) => {
        const position = [v.x, 0, v.z]
        const rotation = [0, rotations[v.direction], 0]
        switch (v.type) {
          case 'sedan':
            return <Sedan key={v.id} position={position} rotation={rotation} color={v.color} />
          case 'suv':
            return <SUV key={v.id} position={position} rotation={rotation} color={v.color} />
          case 'bus':
            return <Bus key={v.id} position={position} rotation={rotation} color={v.color} />
          case 'auto':
            return <AutoRickshaw key={v.id} position={position} rotation={rotation} color={v.color} />
          case 'motorcycle':
            return <Motorcycle key={v.id} position={position} rotation={rotation} color={v.color} />
          case 'ambulance':
            return <Ambulance key={v.id} position={position} rotation={rotation} />
          default:
            return null
        }
      })}
    </group>
  )
}
