/**
 * Environment.jsx — Vibrant, bustling metropolis environment around the junction.
 * Replaces the empty "desert junction" with a full city:
 * - Structured city blocks, raised sidewalks, and granite curbs
 * - Grand City Central Park with animated water fountain, lush lawns, and walking paths
 * - Dense street furniture: modern LED street lamps, 40+ street trees, benches, hydrants, trash bins
 * - Parked vehicles along curbs
 * - Full architectural skyline via CityBuildings (skyscrapers, station, retail arcade)
 * - Strict railway clearance: completely clear corridor at Z = -23.
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, MathUtils } from 'three'
import CityBuildings from './CityBuildings'
import { getSidewalkTexture, getGrassTexture, getStonePaverTexture, getAsphaltTexture } from './textures'

/** Base Urban Terrain — transitions between Day, Sunset, and Night */
function GroundTerrain({ mode }) {
  const materialRef = useRef()
  const targetColor = useMemo(() => {
    return new Color(mode === 'night' ? '#111827' : mode === 'sunset' ? '#574338' : '#2d3748')
  }, [mode])

  const groundTexture = useMemo(() => {
    const tex = getAsphaltTexture().clone()
    tex.repeat.set(32, 32)
    tex.needsUpdate = true
    return tex
  }, [])

  useFrame((_, delta) => {
    if (materialRef.current) materialRef.current.color.lerp(targetColor, 1 - Math.exp(-delta * 1.5))
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.06, 0]} receiveShadow>
      <planeGeometry args={[320, 320]} />
      <meshStandardMaterial ref={materialRef} map={groundTexture} color="#2d3748" roughness={0.95} />
    </mesh>
  )
}

/** Raised Sidewalk Pavement Platform for an urban block with realistic concrete paver texture */
function SidewalkBlock({ x, z, width, depth, color = '#cbd5e1' }) {
  const sidewalkMap = useMemo(() => {
    const tex = getSidewalkTexture().clone()
    tex.repeat.set(Math.max(1, width / 6), Math.max(1, depth / 6))
    tex.needsUpdate = true
    return tex
  }, [width, depth])

  return (
    <group position={[x, 0.08, z]}>
      {/* Concrete slab */}
      <mesh receiveShadow castShadow>
        <boxGeometry args={[width, 0.16, depth]} />
        <meshStandardMaterial color={color} map={sidewalkMap} roughness={0.88} />
      </mesh>
      {/* Dark granite curb rim around the block */}
      <mesh position={[0, -0.01, 0]}>
        <boxGeometry args={[width + 0.35, 0.14, depth + 0.35]} />
        <meshStandardMaterial color="#64748b" roughness={0.7} />
      </mesh>
    </group>
  )
}

/** Grand City Central Park with green lawn, walking paths, and animated fountain */
function CentralPark() {
  const fountainRef = useRef()
  const sprayRef = useRef()

  const grassMap = useMemo(() => {
    const tex = getGrassTexture().clone()
    tex.repeat.set(8, 8)
    tex.needsUpdate = true
    return tex
  }, [])

  const pathwayMap = useMemo(() => {
    const tex = getStonePaverTexture().clone()
    tex.repeat.set(8, 1.5)
    tex.needsUpdate = true
    return tex
  }, [])

  const plazaMap = useMemo(() => {
    const tex = getStonePaverTexture().clone()
    tex.repeat.set(3, 3)
    tex.needsUpdate = true
    return tex
  }, [])

  useFrame((state) => {
    if (fountainRef.current) {
      // Gentle water ripple shimmer
      fountainRef.current.material.emissiveIntensity = 0.4 + Math.sin(state.clock.elapsedTime * 3) * 0.2
    }
    if (sprayRef.current) {
      sprayRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 6) * 0.15
    }
  })

  return (
    <group position={[25, 0, 25]}>
      {/* 1. Lush Green Lawn Base with natural turf texture */}
      <mesh position={[0, 0.1, 0]} receiveShadow>
        <boxGeometry args={[26, 0.18, 26]} />
        <meshStandardMaterial color="#3f7038" map={grassMap} roughness={0.92} />
      </mesh>

      {/* Decorative Stone Rim */}
      <mesh position={[0, 0.09, 0]}>
        <boxGeometry args={[26.6, 0.17, 26.6]} />
        <meshStandardMaterial color="#94a3b8" roughness={0.75} />
      </mesh>

      {/* 2. Diagonal Paved Stroll Pathways with flagstone paver texture */}
      <mesh position={[0, 0.12, 0]} rotation={[0, Math.PI / 4, 0]} receiveShadow>
        <boxGeometry args={[34, 0.19, 3.2]} />
        <meshStandardMaterial color="#e2e8f0" map={pathwayMap} roughness={0.85} />
      </mesh>
      <mesh position={[0, 0.12, 0]} rotation={[0, -Math.PI / 4, 0]} receiveShadow>
        <boxGeometry args={[34, 0.19, 3.2]} />
        <meshStandardMaterial color="#e2e8f0" map={pathwayMap} roughness={0.85} />
      </mesh>

      {/* 3. Central Plaza Circular Paving */}
      <mesh position={[0, 0.13, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[6.2, 32]} />
        <meshStandardMaterial color="#cbd5e1" map={plazaMap} roughness={0.8} />
      </mesh>

      {/* 4. Grand Circular Fountain */}
      <group position={[0, 0.14, 0]}>
        {/* Outer stone pool basin */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <cylinderGeometry args={[3.8, 4.1, 0.8, 28, 1, true]} />
          <meshStandardMaterial color="#64748b" roughness={0.6} />
        </mesh>
        {/* Pool floor */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[3.8, 3.8, 0.2, 28]} />
          <meshStandardMaterial color="#0284c7" roughness={0.4} />
        </mesh>
        {/* Shimmering pool water */}
        <mesh ref={fountainRef} position={[0, 0.55, 0]}>
          <cylinderGeometry args={[3.75, 3.75, 0.05, 28]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.1}
            transparent
            opacity={0.88}
          />
        </mesh>
        {/* Center Tiered Pedestal */}
        <mesh position={[0, 0.8, 0]} castShadow>
          <cylinderGeometry args={[1.2, 1.5, 0.8, 16]} />
          <meshStandardMaterial color="#94a3b8" roughness={0.5} />
        </mesh>
        <mesh position={[0, 1.35, 0]} castShadow>
          <cylinderGeometry args={[1.8, 1.4, 0.35, 20]} />
          <meshStandardMaterial color="#64748b" roughness={0.5} />
        </mesh>
        {/* Water jet spray column */}
        <mesh ref={sprayRef} position={[0, 2.2, 0]}>
          <cylinderGeometry args={[0.08, 0.3, 1.5, 12]} />
          <meshStandardMaterial
            color="#e0f2fe"
            emissive="#bae6fd"
            emissiveIntensity={1.2}
            transparent
            opacity={0.75}
          />
        </mesh>
      </group>

      {/* 5. Park Benches around plaza */}
      {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((angle, bi) => {
        const bx = Math.cos(angle) * 7.5
        const bz = Math.sin(angle) * 7.5
        return (
          <group key={`bench-${bi}`} position={[bx, 0.2, bz]} rotation={[0, -angle + Math.PI / 2, 0]}>
            {/* Wooden seat */}
            <mesh position={[0, 0.35, 0]} castShadow>
              <boxGeometry args={[2.2, 0.1, 0.55]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
            {/* Bench backrest */}
            <mesh position={[0, 0.65, -0.22]} castShadow>
              <boxGeometry args={[2.2, 0.45, 0.08]} />
              <meshStandardMaterial color="#78350f" roughness={0.8} />
            </mesh>
            {/* Cast-iron legs */}
            {[-0.9, 0.9].map((lx) => (
              <mesh key={lx} position={[lx, 0.2, 0]}>
                <boxGeometry args={[0.08, 0.4, 0.5]} />
                <meshStandardMaterial color="#1e293b" metalness={0.7} />
              </mesh>
            ))}
          </group>
        )
      })}

      {/* 6. Flower Planters in park corners */}
      {[[-9, -9], [9, -9], [-9, 9], [9, 9]].map(([fx, fz], fi) => (
        <group key={`flower-${fi}`} position={[fx, 0.2, fz]}>
          {/* Concrete planter box */}
          <mesh position={[0, 0.3, 0]} castShadow>
            <cylinderGeometry args={[1.2, 1.0, 0.6, 12]} />
            <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
          </mesh>
          {/* Soil */}
          <mesh position={[0, 0.55, 0]}>
            <cylinderGeometry args={[1.1, 1.1, 0.1, 12]} />
            <meshStandardMaterial color="#451a03" roughness={0.95} />
          </mesh>
          {/* Colorful flowers */}
          <mesh position={[0, 0.72, 0]}>
            <sphereGeometry args={[0.85, 10, 8]} />
            <meshStandardMaterial color={fi % 2 === 0 ? '#f43f5e' : '#eab308'} roughness={0.8} />
          </mesh>
        </group>
      ))}

      {/* 7. Park Trees */}
      {[[-7, 5], [7, -5], [-5, -7], [5, 7]].map(([tx, tz], ti) => (
        <Tree key={`park-tree-${ti}`} position={[tx, 0.2, tz]} scale={1.25} />
      ))}
    </group>
  )
}

/** Procedural Street Tree with organic trunk and tiered leafy canopy */
function Tree({ position, scale = 1, variety = 0 }) {
  const foliageColor = variety === 1 ? '#2e6f40' : variety === 2 ? '#3b7d4f' : '#4d8a55'
  return (
    <group position={position} scale={scale}>
      {/* Tree trunk */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.24, 1.8, 8]} />
        <meshStandardMaterial color="#543d2b" roughness={0.92} />
      </mesh>
      {/* Lower full canopy */}
      <mesh position={[0, 2.3, 0]} castShadow>
        <sphereGeometry args={[1.35, 10, 9]} />
        <meshStandardMaterial color={foliageColor} roughness={0.88} />
      </mesh>
      {/* Upper layered canopy */}
      <mesh position={[0.3, 2.9, 0.2]} castShadow>
        <sphereGeometry args={[0.95, 9, 8]} />
        <meshStandardMaterial color="#5c9a63" roughness={0.88} />
      </mesh>
      <mesh position={[-0.25, 3.2, -0.2]} castShadow>
        <sphereGeometry args={[0.7, 8, 7]} />
        <meshStandardMaterial color="#6ea975" roughness={0.88} />
      </mesh>
    </group>
  )
}

/** Modern LED Streetlight with realistic cantilever arm, lamp head, and point light */
function Streetlight({ position, rotation = [0, 0, 0], mode = 'day' }) {
  const isNight = mode === 'night'
  const isSunset = mode === 'sunset'
  const intensity = isNight ? 2.8 : isSunset ? 0.9 : 0.05
  const lightRef = useRef()

  useFrame((_, delta) => {
    if (lightRef.current) {
      lightRef.current.intensity = MathUtils.damp(lightRef.current.intensity, intensity, 2.0, delta)
    }
  })

  return (
    <group position={position} rotation={rotation}>
      {/* Base flange */}
      <mesh position={[0, 0.15, 0]}>
        <cylinderGeometry args={[0.22, 0.26, 0.3, 8]} />
        <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Vertical pole */}
      <mesh position={[0, 2.9, 0]}>
        <cylinderGeometry args={[0.09, 0.14, 5.5, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.65} roughness={0.35} />
      </mesh>
      {/* Curved cantilever mast arm extending over the road/sidewalk */}
      <mesh position={[0.7, 5.5, 0]} rotation={[0, 0, -0.3]}>
        <cylinderGeometry args={[0.06, 0.07, 1.8, 8]} />
        <meshStandardMaterial color="#64748b" metalness={0.65} roughness={0.35} />
      </mesh>
      {/* Cobra-head LED luminaire housing */}
      <mesh position={[1.4, 5.68, 0]}>
        <boxGeometry args={[0.75, 0.16, 0.36]} />
        <meshStandardMaterial color="#334155" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Emissive LED panel lens */}
      <mesh position={[1.4, 5.59, 0]}>
        <planeGeometry args={[0.65, 0.28]} rotation={[-Math.PI / 2, 0, 0]} />
        <meshStandardMaterial
          color={isNight ? '#fffbeb' : '#f8fafc'}
          emissive="#fef08a"
          emissiveIntensity={isNight ? 2.5 : 0.1}
        />
      </mesh>
      {/* Warm Street Point Light */}
      <pointLight
        ref={lightRef}
        position={[1.4, 5.3, 0]}
        color="#fef3c7"
        intensity={0.05}
        distance={18}
        decay={2}
      />
    </group>
  )
}

/** Fire Hydrant — classic urban red hydrant */
function FireHydrant({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.35, 0]} castShadow>
        <cylinderGeometry args={[0.16, 0.18, 0.7, 8]} />
        <meshStandardMaterial color="#dc2626" roughness={0.5} />
      </mesh>
      {/* Domed top */}
      <mesh position={[0, 0.75, 0]}>
        <sphereGeometry args={[0.17, 8, 8]} />
        <meshStandardMaterial color="#dc2626" roughness={0.5} />
      </mesh>
      {/* Side connection nozzles */}
      <mesh position={[0, 0.45, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.07, 0.07, 0.48, 8]} />
        <meshStandardMaterial color="#991b1b" metalness={0.6} />
      </mesh>
    </group>
  )
}

/** Modern Dual Recycling/Waste Bins */
function TrashBin({ position }) {
  return (
    <group position={position}>
      {/* Blue recycling bin */}
      <mesh position={[-0.24, 0.45, 0]} castShadow>
        <boxGeometry args={[0.42, 0.9, 0.42]} />
        <meshStandardMaterial color="#0284c7" roughness={0.6} />
      </mesh>
      {/* Green compost/waste bin */}
      <mesh position={[0.24, 0.45, 0]} castShadow>
        <boxGeometry args={[0.42, 0.9, 0.42]} />
        <meshStandardMaterial color="#16a34a" roughness={0.6} />
      </mesh>
    </group>
  )
}

/** Electrical Utility Transformer Cabinet */
function UtilityBox({ position }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.6, 0]} castShadow>
        <boxGeometry args={[1.1, 1.2, 0.8]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* Warning chevron label */}
      <mesh position={[0, 0.7, 0.41]}>
        <planeGeometry args={[0.3, 0.3]} />
        <meshStandardMaterial color="#facc15" roughness={0.4} />
      </mesh>
    </group>
  )
}

/** Parked Cars along curbside parking zones */
function ParkedCar({ position, rotation, color = '#3b82f6' }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Body */}
      <mesh position={[0, 0.4, 0]} castShadow>
        <boxGeometry args={[1.9, 0.5, 4.0]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Cabin */}
      <mesh position={[0, 0.8, -0.1]} castShadow>
        <boxGeometry args={[1.5, 0.45, 2.2]} />
        <meshStandardMaterial color={color} metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Windows */}
      <mesh position={[0, 0.8, 0.96]}>
        <planeGeometry args={[1.4, 0.4]} />
        <meshStandardMaterial color="#38bdf8" metalness={0.8} roughness={0.1} />
      </mesh>
      {/* Wheels */}
      {[[-0.95, 0.2, 1.2], [0.95, 0.2, 1.2], [-0.95, 0.2, -1.2], [0.95, 0.2, -1.2]].map((wp, wi) => (
        <mesh key={wi} position={wp} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.26, 0.26, 0.2, 10]} />
          <meshStandardMaterial color="#0f172a" roughness={0.9} />
        </mesh>
      ))}
    </group>
  )
}

/** Modern Glass Bus Transit Shelter */
function BusShelter({ position, rotation = [0, 0, 0] }) {
  return (
    <group position={position} rotation={rotation}>
      {/* Concrete foundation pad */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[4.4, 0.1, 2.2]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.8} />
      </mesh>
      {/* Curved glass roof canopy */}
      <mesh position={[0, 2.6, 0]} castShadow>
        <boxGeometry args={[4.2, 0.12, 2.4]} />
        <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Rear glass wall */}
      <mesh position={[0, 1.35, -0.95]}>
        <boxGeometry args={[3.8, 2.3, 0.08]} />
        <meshStandardMaterial color="#93c5fd" opacity={0.65} transparent roughness={0.2} metalness={0.7} />
      </mesh>
      {/* Steel support pillars */}
      {[-1.9, 1.9].map((px) => (
        <mesh key={px} position={[px, 1.3, -0.95]}>
          <cylinderGeometry args={[0.06, 0.06, 2.5, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.8} />
        </mesh>
      ))}
      {/* Waiting bench */}
      <mesh position={[0, 0.55, -0.5]} castShadow>
        <boxGeometry args={[2.8, 0.1, 0.5]} />
        <meshStandardMaterial color="#78350f" roughness={0.8} />
      </mesh>
      {/* Route map info pillar */}
      <mesh position={[1.8, 1.3, 0.6]}>
        <boxGeometry args={[0.15, 2.1, 0.8]} />
        <meshStandardMaterial color="#0f766e" roughness={0.6} />
      </mesh>
    </group>
  )
}

export default function Environment({ mode = 'day' }) {
  return (
    <group>
      {/* 1. Base Metropolitan Ground */}
      <GroundTerrain mode={mode} />

      {/* 2. Structured City Blocks & Raised Sidewalks */}
      {/* South-West Sidewalk Block (Financial District) */}
      <SidewalkBlock x={-38} z={38} width={54} depth={54} color="#e2e8f0" />

      {/* South-East Sidewalk Block (Central Park & Hotel) */}
      <SidewalkBlock x={38} z={38} width={54} depth={54} color="#e2e8f0" />

      {/* North-West Sidewalk Promenade (Retail strip south of railway: Z ∈ [-18.5, -11]) */}
      <SidewalkBlock x={-32} z={-14.8} width={42} depth={6.8} color="#f1f5f9" />
      {/* North-West Station Plaza (North of railway: Z ∈ [-65, -28.5]) */}
      <SidewalkBlock x={-36} z={-48} width={50} depth={37} color="#cbd5e1" />

      {/* North-East Sidewalk Block (South of railway: Z ∈ [-18.5, -11]) */}
      <SidewalkBlock x={32} z={-14.8} width={42} depth={6.8} color="#f1f5f9" />
      {/* North-East Towers Block (North of railway: Z ∈ [-65, -28.5]) */}
      <SidewalkBlock x={36} z={-48} width={50} depth={37} color="#e2e8f0" />

      {/* 3. Grand Central Park with Fountain in South-East quadrant */}
      <CentralPark />

      {/* 4. Complete City Architecture (Skyscrapers, Retail Arcade, Central Station, Distant Skyline) */}
      <CityBuildings mode={mode} />

      {/* 5. Transit Shelters */}
      <BusShelter position={[11.5, 0, -14.8]} rotation={[0, -Math.PI / 2, 0]} />
      <BusShelter position={[-11.5, 0, 16]} rotation={[0, Math.PI / 2, 0]} />

      {/* 6. Curbside Parked Cars */}
      <ParkedCar position={[-10.8, 0, 24]} rotation={[0, 0, 0]} color="#2563eb" />
      <ParkedCar position={[-10.8, 0, 31]} rotation={[0, 0, 0]} color="#dc2626" />
      <ParkedCar position={[-10.8, 0, 38]} rotation={[0, 0, 0]} color="#f1f5f9" />
      <ParkedCar position={[10.8, 0, 44]} rotation={[0, Math.PI, 0]} color="#475569" />
      <ParkedCar position={[10.8, 0, 51]} rotation={[0, Math.PI, 0]} color="#16a34a" />
      <ParkedCar position={[26, 0, 10.8]} rotation={[0, -Math.PI / 2, 0]} color="#d97706" />
      <ParkedCar position={[33, 0, 10.8]} rotation={[0, -Math.PI / 2, 0]} color="#0284c7" />

      {/* 7. Dense Streetlights lining the intersection and road approaches */}
      {/* North approach */}
      <Streetlight position={[-10.4, 0, -12]} rotation={[0, Math.PI / 2, 0]} mode={mode} />
      <Streetlight position={[10.4, 0, -12]} rotation={[0, -Math.PI / 2, 0]} mode={mode} />
      <Streetlight position={[-10.4, 0, -32]} rotation={[0, Math.PI / 2, 0]} mode={mode} />
      <Streetlight position={[10.4, 0, -32]} rotation={[0, -Math.PI / 2, 0]} mode={mode} />
      <Streetlight position={[-10.4, 0, -48]} rotation={[0, Math.PI / 2, 0]} mode={mode} />
      <Streetlight position={[10.4, 0, -48]} rotation={[0, -Math.PI / 2, 0]} mode={mode} />

      {/* South approach */}
      <Streetlight position={[-10.4, 0, 13]} rotation={[0, Math.PI / 2, 0]} mode={mode} />
      <Streetlight position={[10.4, 0, 13]} rotation={[0, -Math.PI / 2, 0]} mode={mode} />
      <Streetlight position={[-10.4, 0, 29]} rotation={[0, Math.PI / 2, 0]} mode={mode} />
      <Streetlight position={[10.4, 0, 29]} rotation={[0, -Math.PI / 2, 0]} mode={mode} />
      <Streetlight position={[-10.4, 0, 45]} rotation={[0, Math.PI / 2, 0]} mode={mode} />
      <Streetlight position={[10.4, 0, 45]} rotation={[0, -Math.PI / 2, 0]} mode={mode} />

      {/* East approach */}
      <Streetlight position={[13, 0, -10.4]} rotation={[0, 0, 0]} mode={mode} />
      <Streetlight position={[13, 0, 10.4]} rotation={[0, Math.PI, 0]} mode={mode} />
      <Streetlight position={[29, 0, -10.4]} rotation={[0, 0, 0]} mode={mode} />
      <Streetlight position={[29, 0, 10.4]} rotation={[0, Math.PI, 0]} mode={mode} />
      <Streetlight position={[45, 0, -10.4]} rotation={[0, 0, 0]} mode={mode} />
      <Streetlight position={[45, 0, 10.4]} rotation={[0, Math.PI, 0]} mode={mode} />

      {/* West approach */}
      <Streetlight position={[-13, 0, -10.4]} rotation={[0, 0, 0]} mode={mode} />
      <Streetlight position={[-13, 0, 10.4]} rotation={[0, Math.PI, 0]} mode={mode} />
      <Streetlight position={[-29, 0, -10.4]} rotation={[0, 0, 0]} mode={mode} />
      <Streetlight position={[-29, 0, 10.4]} rotation={[0, Math.PI, 0]} mode={mode} />
      <Streetlight position={[-45, 0, -10.4]} rotation={[0, 0, 0]} mode={mode} />
      <Streetlight position={[-45, 0, 10.4]} rotation={[0, Math.PI, 0]} mode={mode} />

      {/* 8. Lush Tree-lined Avenues & Sidewalk Trees (over 30 trees placed outside road & rail!) */}
      {/* Retail Promenade tree line (Z = -11.5) */}
      {[-13, -20, -29, -38, -46].map((tx) => (
        <Tree key={`tree-ret-${tx}`} position={[tx, 0.15, -11.4]} scale={0.95} variety={0} />
      ))}
      {/* North-East corner tree line */}
      {[13, 21, 30, 40, 48].map((tx) => (
        <Tree key={`tree-ne-${tx}`} position={[tx, 0.15, -11.4]} scale={0.95} variety={1} />
      ))}
      {/* South-West financial avenue trees */}
      {[-11.5, -11.5, -11.5, -11.5].map((_, i) => (
        <Tree key={`tree-sw-v-${i}`} position={[-11.5, 0.15, 20 + i * 11]} scale={1.05} variety={2} />
      ))}
      {/* South-West horizontal trees */}
      {[-20, -32, -42, -54].map((tx) => (
        <Tree key={`tree-sw-h-${tx}`} position={[tx, 0.15, 11.4]} scale={1.0} variety={0} />
      ))}
      {/* North Station trees (Z < -28) */}
      {[-14, -34, -54].map((tx) => (
        <Tree key={`tree-stn-${tx}`} position={[tx, 0.15, -30]} scale={1.1} variety={1} />
      ))}
      {[14, 34, 52].map((tx) => (
        <Tree key={`tree-net-${tx}`} position={[tx, 0.15, -30]} scale={1.1} variety={2} />
      ))}

      {/* 9. City Street Furniture (Fire Hydrants, Trash Bins, Utility Cabinets) */}
      <FireHydrant position={[-10.6, 0.15, 12]} />
      <FireHydrant position={[10.6, 0.15, -12]} />
      <FireHydrant position={[12, 0.15, 10.6]} />
      <FireHydrant position={[-12, 0.15, -10.6]} />

      <TrashBin position={[-10.6, 0.15, 15]} />
      <TrashBin position={[10.6, 0.15, 15]} />
      <TrashBin position={[-18, 0.15, -11.4]} />
      <TrashBin position={[20, 0.15, -11.4]} />

      <UtilityBox position={[-11.8, 0.15, 27]} />
      <UtilityBox position={[11.8, 0.15, -35]} />
      <UtilityBox position={[-36, 0.15, 11.8]} />
    </group>
  )
}
