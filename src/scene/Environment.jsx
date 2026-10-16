/**
 * Environment.jsx — Urban environment details surrounding the junction.
 * Includes procedural buildings, streetlights, trees, and ground plane.
 */
import { useMemo } from 'react'
import { JUNCTION_SIZE } from './Roads'

const BUILDING_COLORS = ['#374151', '#3f3f46', '#44403c', '#334155', '#2c2c34', '#3a3541']

function seededRandom(seed) {
  let s = seed
  return () => {
    s = (s * 16807) % 2147483647
    return (s - 1) / 2147483646
  }
}

function Building({ position, width, depth, height, color }) {
  return (
    <group position={position}>
      {/* Main structure */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.8} />
      </mesh>
      {/* Window rows */}
      {Array.from({ length: Math.floor(height / 2) }).map((_, floor) => {
        const windowsPerRow = Math.floor(width / 2)
        return Array.from({ length: windowsPerRow }).map((_, w) => {
          const wx = -((windowsPerRow - 1) * 1.5) / 2 + w * 1.5
          const wy = 1.5 + floor * 2
          if (wy > height - 0.5) return null
          return (
            <mesh key={`${floor}-${w}`} position={[wx, wy, depth / 2 + 0.01]}>
              <boxGeometry args={[0.8, 0.9, 0.02]} />
              <meshStandardMaterial
                color="#1e293b"
                emissive="#334155"
                emissiveIntensity={0.15 + Math.random() * 0.2}
              />
            </mesh>
          )
        })
      })}
    </group>
  )
}

function Streetlight({ position }) {
  return (
    <group position={position}>
      {/* Pole */}
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.06, 0.08, 5, 6]} />
        <meshStandardMaterial color="#6b7280" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Arm */}
      <mesh position={[0.6, 4.8, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.04, 0.04, 1.4, 6]} />
        <meshStandardMaterial color="#6b7280" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Lamp */}
      <mesh position={[1.1, 4.9, 0]}>
        <boxGeometry args={[0.5, 0.12, 0.3]} />
        <meshStandardMaterial color="#fef9c3" emissive="#fef9c3" emissiveIntensity={0.6} />
      </mesh>
      {/* Light glow */}
      <pointLight position={[1.1, 4.7, 0]} color="#fef3c7" intensity={3} distance={12} decay={2} />
    </group>
  )
}

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={[scale, scale, scale]}>
      {/* Trunk */}
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.1, 0.15, 1.6, 6]} />
        <meshStandardMaterial color="#78350f" roughness={0.9} />
      </mesh>
      {/* Canopy */}
      <mesh position={[0, 2.2, 0]}>
        <sphereGeometry args={[0.9, 8, 8]} />
        <meshStandardMaterial color="#166534" roughness={0.85} />
      </mesh>
      <mesh position={[0.3, 2.6, 0.2]}>
        <sphereGeometry args={[0.6, 8, 8]} />
        <meshStandardMaterial color="#15803d" roughness={0.85} />
      </mesh>
    </group>
  )
}

export default function Environment() {
  const buildings = useMemo(() => {
    const rng = seededRandom(123)
    const jOff = JUNCTION_SIZE / 2 + 16
    const b = []
    const corners = [
      { cx: -jOff - 4, cz: -jOff - 4 },
      { cx: jOff + 4, cz: -jOff - 4 },
      { cx: -jOff - 4, cz: jOff + 4 },
      { cx: jOff + 4, cz: jOff + 4 },
    ]
    corners.forEach(({ cx, cz }) => {
      for (let i = 0; i < 3; i++) {
        const w = 4 + rng() * 5
        const d = 4 + rng() * 5
        const h = 5 + rng() * 14
        const color = BUILDING_COLORS[Math.floor(rng() * BUILDING_COLORS.length)]
        b.push({
          pos: [cx + (rng() - 0.5) * 10, 0, cz + (rng() - 0.5) * 10],
          width: w, depth: d, height: h, color,
        })
      }
    })
    return b
  }, [])

  const jOff = JUNCTION_SIZE / 2

  return (
    <group>
      {/* Ground plane */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
        <planeGeometry args={[200, 200]} />
        <meshStandardMaterial color="#1a1f2b" roughness={0.95} />
      </mesh>

      {/* Buildings */}
      {buildings.map((b, i) => (
        <Building key={i} position={b.pos} width={b.width} depth={b.depth} height={b.height} color={b.color} />
      ))}

      {/* Streetlights */}
      <Streetlight position={[jOff + 1, 0, -(jOff + 4)]} />
      <Streetlight position={[-(jOff + 1), 0, jOff + 4]} />
      <Streetlight position={[jOff + 4, 0, jOff + 1]} />
      <Streetlight position={[-(jOff + 4), 0, -(jOff + 1)]} />

      {/* Trees on sidewalks */}
      <Tree position={[-(jOff + 5), 0, -(jOff + 3)]} scale={1.1} />
      <Tree position={[jOff + 5, 0, jOff + 3]} scale={0.9} />
      <Tree position={[jOff + 3, 0, -(jOff + 5)]} />
      <Tree position={[-(jOff + 3), 0, jOff + 5]} scale={1.2} />
      <Tree position={[-(jOff + 8), 0, -(jOff + 7)]} scale={0.8} />
      <Tree position={[jOff + 8, 0, jOff + 7]} scale={1.0} />

      {/* Divider / median islands at road entrances */}
      {[
        [0, 0.1, -(jOff + 32)],
        [0, 0.1, jOff + 32],
        [-(jOff + 32), 0.1, 0],
        [jOff + 32, 0.1, 0],
      ].map((pos, i) => (
        <mesh key={`median-${i}`} position={pos} rotation={[0, i >= 2 ? Math.PI / 2 : 0, 0]}>
          <boxGeometry args={[0.4, 0.15, 8]} />
          <meshStandardMaterial color="#4b5563" />
        </mesh>
      ))}
    </group>
  )
}
