/**
 * CityBuildings.jsx — Rich, dense procedural architecture for the metropolis.
 * Includes modern high-rise skyscrapers, corporate headquarters, mid-rise apartments,
 * retail storefronts with glowing signboards, central railway station concourse,
 * and an encircling skyline horizon.
 *
 * Strict railway clearance: The railway corridor at Z = -23 has an absolute
 * exclusion zone (Z ∈ [-28, -18]) along the entire width.
 */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, DoubleSide, SRGBColorSpace } from 'three'
import { getGlassCurtainTexture, getBrickTexture } from './textures'

/** Helper to create glowing signage textures */
function createSignTexture(text, bgColor = '#0f766e', textColor = '#ffffff', subtitle = '') {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = bgColor
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Border highlight
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'
  ctx.lineWidth = 6
  ctx.strokeRect(4, 4, canvas.width - 8, canvas.height - 8)

  ctx.fillStyle = textColor
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  if (subtitle) {
    ctx.font = 'bold 44px Inter, system-ui, sans-serif'
    ctx.fillText(text, canvas.width / 2, 48)
    ctx.font = '600 24px Inter, system-ui, sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.85)'
    ctx.fillText(subtitle, canvas.width / 2, 92)
  } else {
    ctx.font = 'bold 52px Inter, system-ui, sans-serif'
    ctx.fillText(text, canvas.width / 2, canvas.height / 2)
  }

  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  return texture
}

/** Billboard display screen with bright advertisement */
function Billboard({ position, rotation, width = 7, height = 4.2, title, subtitle, color = '#2563eb' }) {
  const texture = useMemo(() => createSignTexture(title, color, '#ffffff', subtitle), [title, subtitle, color])
  return (
    <group position={position} rotation={rotation}>
      {/* Frame */}
      <mesh position={[0, 0, -0.05]} castShadow>
        <boxGeometry args={[width + 0.3, height + 0.3, 0.15]} />
        <meshStandardMaterial color="#1e293b" metalness={0.8} roughness={0.3} />
      </mesh>
      {/* Illuminated screen */}
      <mesh position={[0, 0, 0.05]}>
        <planeGeometry args={[width, height]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Rooftop props: HVAC chillers, water tank, communications antenna, beacon light */
function RooftopDetails({ width, depth, height, mode, hasSpire = false, hasHelipad = false }) {
  const beaconRef = useRef()
  const isNight = mode === 'night'

  useFrame((state) => {
    if (beaconRef.current) {
      const blink = Math.sin(state.clock.elapsedTime * 4) > 0.3 ? (isNight ? 3 : 1) : 0.1
      beaconRef.current.emissiveIntensity = blink
    }
  })

  return (
    <group position={[0, height / 2, 0]}>
      {/* Mechanical penthouse */}
      <mesh position={[0, 1.2, 0]} castShadow>
        <boxGeometry args={[width * 0.45, 2.4, depth * 0.45]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* HVAC chiller units */}
      {[-width * 0.28, width * 0.28].map((x, i) => (
        <mesh key={`hvac-${i}`} position={[x, 0.6, depth * 0.25]} castShadow>
          <boxGeometry args={[1.6, 1.2, 2.0]} />
          <meshStandardMaterial color="#475569" metalness={0.4} roughness={0.6} />
        </mesh>
      ))}

      {/* Classic wooden/metal water tower */}
      <group position={[-width * 0.25, 0, -depth * 0.25]}>
        {/* Legs */}
        {[[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].map(([lx, lz], li) => (
          <mesh key={li} position={[lx, 0.75, lz]}>
            <cylinderGeometry args={[0.05, 0.05, 1.5, 6]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.4} />
          </mesh>
        ))}
        {/* Barrel */}
        <mesh position={[0, 2.1, 0]} castShadow>
          <cylinderGeometry args={[0.9, 0.9, 1.4, 12]} />
          <meshStandardMaterial color="#78350f" roughness={0.85} />
        </mesh>
        {/* Conical cap */}
        <mesh position={[0, 3.1, 0]}>
          <coneGeometry args={[1.05, 0.7, 12]} />
          <meshStandardMaterial color="#451a03" roughness={0.8} />
        </mesh>
      </group>

      {/* Spire with aviation warning beacon */}
      {hasSpire && (
        <group position={[0, 2.4, 0]}>
          <mesh position={[0, 4, 0]}>
            <cylinderGeometry args={[0.06, 0.22, 8, 8]} />
            <meshStandardMaterial color="#e2e8f0" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh ref={beaconRef} position={[0, 8.1, 0]}>
            <sphereGeometry args={[0.22, 8, 8]} />
            <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={isNight ? 3 : 0.5} />
          </mesh>
          {isNight && <pointLight position={[0, 8.1, 0]} color="#ef4444" intensity={1.5} distance={15} />}
        </group>
      )}

      {/* Rooftop Helipad */}
      {hasHelipad && (
        <group position={[0, 2.45, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[width * 0.35, 24]} />
            <meshStandardMaterial color="#1f2937" roughness={0.8} />
          </mesh>
          {/* Outer yellow ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <ringGeometry args={[width * 0.32, width * 0.35, 24]} />
            <meshStandardMaterial color="#facc15" roughness={0.5} />
          </mesh>
          {/* 'H' mark */}
          <mesh position={[0, 0.03, 0]}>
            <boxGeometry args={[width * 0.08, 0.02, width * 0.35]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
          <mesh position={[0, 0.03, 0]}>
            <boxGeometry args={[width * 0.28, 0.02, width * 0.08]} />
            <meshStandardMaterial color="#ffffff" roughness={0.4} />
          </mesh>
        </group>
      )}
    </group>
  )
}

/** Skyscraper Tower with glass facade, window grid, and entrance lobby */
function Skyscraper({
  position,
  width = 14,
  depth = 14,
  height = 42,
  wallColor = '#1e293b',
  glassColor = '#38bdf8',
  mode = 'day',
  hasSpire = false,
  hasHelipad = false,
  hasSetback = false,
  billboard = null,
}) {
  const isNight = mode === 'night'
  const isSunset = mode === 'sunset'
  const windowEmissive = isNight ? '#fde047' : isSunset ? '#fb923c' : '#ffffff'
  const windowIntensity = isNight ? 0.75 : isSunset ? 0.3 : 0.02

  const glassTexture = useMemo(() => {
    const tex = getGlassCurtainTexture().clone()
    tex.repeat.set(Math.max(1, Math.round(width / 3.5)), Math.max(1, Math.round(height / 4)))
    tex.needsUpdate = true
    return tex
  }, [width, height])

  return (
    <group position={position}>
      {/* Main tower shaft */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={wallColor} roughness={0.55} metalness={0.35} />
      </mesh>

      {/* Decorative vertical architectural mullions */}
      {[-width / 2 + 0.1, width / 2 - 0.1].map((x, xi) => (
        <mesh key={`mullion-x-${xi}`} position={[x, height / 2, 0]}>
          <boxGeometry args={[0.3, height + 0.2, depth + 0.1]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.3} />
        </mesh>
      ))}

      {/* Horizontal floor bands */}
      {Array.from({ length: Math.floor(height / 4) }).map((_, fi) => (
        <mesh key={`floor-${fi}`} position={[0, fi * 4 + 2, 0]}>
          <boxGeometry args={[width + 0.15, 0.35, depth + 0.15]} />
          <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* Facade Window Panels with night glow and glass curtain texture */}
      {[-depth / 2 - 0.05, depth / 2 + 0.05].map((z, zi) => (
        <mesh key={`win-z-${zi}`} position={[0, height / 2, z]}>
          <planeGeometry args={[width - 1.2, height - 3]} />
          <meshStandardMaterial
            color={glassColor}
            map={glassTexture}
            metalness={0.8}
            roughness={0.2}
            emissive={windowEmissive}
            emissiveIntensity={windowIntensity}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}

      {[-width / 2 - 0.05, width / 2 + 0.05].map((x, xi) => (
        <mesh key={`win-x-${xi}`} position={[x, height / 2, 0]} rotation={[0, Math.PI / 2, 0]}>
          <planeGeometry args={[depth - 1.2, height - 3]} />
          <meshStandardMaterial
            color={glassColor}
            map={glassTexture}
            metalness={0.8}
            roughness={0.2}
            emissive={windowEmissive}
            emissiveIntensity={windowIntensity}
            transparent
            opacity={0.9}
          />
        </mesh>
      ))}

      {/* Ground Floor Grand Entrance Lobby */}
      <mesh position={[0, 2.2, depth / 2 + 0.35]}>
        <boxGeometry args={[width * 0.55, 4.2, 0.7]} />
        <meshStandardMaterial color="#0f172a" metalness={0.7} roughness={0.3} />
      </mesh>
      <mesh position={[0, 2.2, depth / 2 + 0.72]}>
        <planeGeometry args={[width * 0.48, 3.6]} />
        <meshStandardMaterial
          color="#bae6fd"
          emissive={isNight ? '#fde047' : '#bae6fd'}
          emissiveIntensity={isNight ? 1.2 : 0.2}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>
      {/* Entrance canopy */}
      <mesh position={[0, 4.3, depth / 2 + 1.2]} castShadow>
        <boxGeometry args={[width * 0.6, 0.25, 1.8]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Setback Crown (if tower is stepped) */}
      {hasSetback && (
        <group position={[0, height + 4, 0]}>
          <mesh castShadow>
            <boxGeometry args={[width * 0.72, 8, depth * 0.72]} />
            <meshStandardMaterial color={wallColor} roughness={0.5} metalness={0.4} />
          </mesh>
          <mesh position={[0, 0, depth * 0.36 + 0.05]}>
            <planeGeometry args={[width * 0.65, 7]} />
            <meshStandardMaterial
              color={glassColor}
              metalness={0.8}
              roughness={0.2}
              emissive={windowEmissive}
              emissiveIntensity={windowIntensity}
            />
          </mesh>
          <RooftopDetails
            width={width * 0.72}
            depth={depth * 0.72}
            height={8}
            mode={mode}
            hasSpire={hasSpire}
            hasHelipad={hasHelipad}
          />
        </group>
      )}

      {/* Top of tower if no setback */}
      {!hasSetback && (
        <RooftopDetails width={width} depth={depth} height={height} mode={mode} hasSpire={hasSpire} hasHelipad={hasHelipad} />
      )}

      {/* Optional Illuminated Billboard on facade */}
      {billboard && (
        <Billboard
          position={[billboard.x || 0, billboard.y || height * 0.5, depth / 2 + 0.25]}
          rotation={[0, 0, 0]}
          title={billboard.title}
          subtitle={billboard.subtitle}
          color={billboard.color}
          width={billboard.width || 7}
          height={billboard.height || 4}
        />
      )}
    </group>
  )
}

/** Mid-Rise Commercial/Residential Building (5-7 stories) */
function MidRiseBuilding({
  position,
  width = 12,
  depth = 10,
  height = 18,
  color = '#cbd5e1',
  trimColor = '#475569',
  mode = 'day',
  hasBalconies = false,
  sign = null,
}) {
  const isNight = mode === 'night'
  const isSunset = mode === 'sunset'
  const windowEmissive = isNight ? '#fde047' : isSunset ? '#fb923c' : '#ffffff'
  const windowIntensity = isNight ? 0.65 : isSunset ? 0.25 : 0.02

  const signTexture = useMemo(() => {
    if (!sign) return null
    return createSignTexture(sign.text, sign.bg || '#0f766e', '#ffffff')
  }, [sign])

  const brickMap = useMemo(() => {
    const tex = getBrickTexture().clone()
    tex.repeat.set(Math.max(1, Math.round(width / 3)), Math.max(1, Math.round(height / 3)))
    tex.needsUpdate = true
    return tex
  }, [width, height])

  return (
    <group position={position}>
      {/* Building Body with architectural brick texture */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} map={brickMap} roughness={0.75} />
      </mesh>

      {/* Roof cornice */}
      <mesh position={[0, height + 0.25, 0]} castShadow>
        <boxGeometry args={[width + 0.6, 0.5, depth + 0.6]} />
        <meshStandardMaterial color={trimColor} roughness={0.6} />
      </mesh>

      {/* Grid of punched windows on front facade */}
      {Array.from({ length: Math.floor(height / 3.2) - 1 }).map((_, row) => {
        const y = 3.8 + row * 3.2
        return Array.from({ length: Math.floor(width / 3.0) }).map((__, col) => {
          const colCount = Math.floor(width / 3.0)
          const x = (col - (colCount - 1) / 2) * 2.8
          return (
            <group key={`win-${row}-${col}`} position={[x, y, depth / 2 + 0.06]}>
              {/* Window frame */}
              <mesh>
                <boxGeometry args={[1.5, 1.8, 0.1]} />
                <meshStandardMaterial color={trimColor} roughness={0.5} />
              </mesh>
              {/* Glass */}
              <mesh position={[0, 0, 0.06]}>
                <planeGeometry args={[1.3, 1.6]} />
                <meshStandardMaterial
                  color="#38bdf8"
                  metalness={0.7}
                  roughness={0.2}
                  emissive={windowEmissive}
                  emissiveIntensity={windowIntensity}
                />
              </mesh>
              {/* Balcony railing if residential */}
              {hasBalconies && (
                <mesh position={[0, -0.6, 0.55]} castShadow>
                  <boxGeometry args={[1.7, 0.75, 0.9]} />
                  <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.4} />
                </mesh>
              )}
            </group>
          )
        })
      })}

      {/* Storefront Signboard if equipped */}
      {signTexture && (
        <group position={[0, 4.2, depth / 2 + 0.2]}>
          <mesh castShadow>
            <boxGeometry args={[width * 0.8, 1.1, 0.25]} />
            <meshStandardMaterial color="#1e293b" />
          </mesh>
          <mesh position={[0, 0, 0.14]}>
            <planeGeometry args={[width * 0.78, 1.0]} />
            <meshBasicMaterial map={signTexture} toneMapped={false} />
          </mesh>
        </group>
      )}

      {/* Ground Floor display windows */}
      <mesh position={[0, 1.8, depth / 2 + 0.08]}>
        <planeGeometry args={[width - 1.6, 2.6]} />
        <meshStandardMaterial
          color="#bae6fd"
          emissive={isNight ? '#fde047' : '#bae6fd'}
          emissiveIntensity={isNight ? 0.9 : 0.1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Rooftop Details */}
      <RooftopDetails width={width} depth={depth} height={height} mode={mode} />
    </group>
  )
}

/** Detailed Retail Storefront with fabric awning and illuminated neon sign */
function RetailStore({ position, width = 7.5, depth = 5.5, height = 4.8, color = '#f8fafc', sign, awningColor = '#b91c1c', mode = 'day' }) {
  const isNight = mode === 'night'
  const signTexture = useMemo(() => createSignTexture(sign, '#0f766e', '#ffffff'), [sign])

  return (
    <group position={position}>
      {/* Building block */}
      <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={color} roughness={0.85} />
      </mesh>

      {/* Upper cornice */}
      <mesh position={[0, height + 0.15, 0]} castShadow>
        <boxGeometry args={[width + 0.4, 0.3, depth + 0.4]} />
        <meshStandardMaterial color="#334155" roughness={0.6} />
      </mesh>

      {/* Large glass display window */}
      <mesh position={[0, 1.6, depth / 2 + 0.05]}>
        <planeGeometry args={[width * 0.7, 2.4]} />
        <meshStandardMaterial
          color="#93c5fd"
          emissive={isNight ? '#fef08a' : '#93c5fd'}
          emissiveIntensity={isNight ? 1.0 : 0.1}
          roughness={0.2}
          metalness={0.6}
        />
      </mesh>

      {/* Entrance door */}
      <mesh position={[width * 0.32, 1.3, depth / 2 + 0.06]}>
        <boxGeometry args={[1.3, 2.4, 0.08]} />
        <meshStandardMaterial color="#0f172a" roughness={0.4} />
      </mesh>

      {/* Striped fabric awning */}
      <group position={[0, 3.1, depth / 2 + 0.75]}>
        <mesh rotation={[0.3, 0, 0]} castShadow>
          <boxGeometry args={[width * 0.85, 0.1, 1.5]} />
          <meshStandardMaterial color={awningColor} roughness={0.8} />
        </mesh>
      </group>

      {/* Illuminated sign board */}
      <group position={[0, 4.05, depth / 2 + 0.2]}>
        <mesh castShadow>
          <boxGeometry args={[width * 0.8, 0.9, 0.18]} />
          <meshStandardMaterial color="#042f2e" roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[width * 0.78, 0.8]} />
          <meshBasicMaterial map={signTexture} toneMapped={false} />
        </mesh>
      </group>
    </group>
  )
}

/** Central Railway Station Concourse Building & Passenger Overpass */
function RailwayStation({ position, mode = 'day' }) {
  const isNight = mode === 'night'
  const signTexture = useMemo(() => createSignTexture('CITY CENTRAL STATION', '#1e3a8a', '#ffffff', 'METRO LINK & REGIONAL RAIL'), [])

  return (
    <group position={position}>
      {/* Main station concourse hall */}
      <mesh position={[0, 4.5, 0]} castShadow receiveShadow>
        <boxGeometry args={[20, 9, 11]} />
        <meshStandardMaterial color="#334155" roughness={0.7} />
      </mesh>

      {/* Arched station roof canopy */}
      <mesh position={[0, 9.4, 0]} castShadow>
        <cylinderGeometry args={[6.5, 6.5, 20.4, 16, 1, false, 0, Math.PI]} rotation={[0, 0, Math.PI / 2]} />
        <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.3} side={DoubleSide} />
      </mesh>

      {/* Grand glass entrance facade */}
      <mesh position={[0, 4.2, 5.56]}>
        <planeGeometry args={[17.5, 7.2]} />
        <meshStandardMaterial
          color="#7dd3fc"
          emissive={isNight ? '#fde047' : '#7dd3fc'}
          emissiveIntensity={isNight ? 1.2 : 0.2}
          roughness={0.1}
          metalness={0.8}
        />
      </mesh>

      {/* Station entrance sign */}
      <group position={[0, 8.4, 5.8]}>
        <mesh castShadow>
          <boxGeometry args={[14, 1.4, 0.25]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh position={[0, 0, 0.14]}>
          <planeGeometry args={[13.6, 1.25]} />
          <meshBasicMaterial map={signTexture} toneMapped={false} />
        </mesh>
      </group>

      {/* Station Clock Tower */}
      <group position={[9, 0, 4]}>
        <mesh position={[0, 8.5, 0]} castShadow>
          <boxGeometry args={[2.8, 17, 2.8]} />
          <meshStandardMaterial color="#1e293b" roughness={0.6} />
        </mesh>
        {/* Pyramid roof */}
        <mesh position={[0, 18, 0]}>
          <coneGeometry args={[2.2, 2.4, 4]} rotation={[0, Math.PI / 4, 0]} />
          <meshStandardMaterial color="#0284c7" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* Illuminated clock faces */}
        {[0, Math.PI / 2, Math.PI, -Math.PI / 2].map((rot, ci) => (
          <group key={ci} rotation={[0, rot, 0]} position={[0, 15, 0]}>
            <mesh position={[0, 0, 1.42]}>
              <circleGeometry args={[0.9, 16]} />
              <meshStandardMaterial
                color="#ffffff"
                emissive="#fef08a"
                emissiveIntensity={isNight ? 1.5 : 0.3}
                roughness={0.2}
              />
            </mesh>
            {/* Clock hands */}
            <mesh position={[0, 0, 1.44]}>
              <boxGeometry args={[0.1, 0.7, 0.02]} />
              <meshBasicMaterial color="#111827" />
            </mesh>
            <mesh position={[0.2, 0, 1.44]} rotation={[0, 0, -Math.PI / 3]}>
              <boxGeometry args={[0.1, 0.5, 0.02]} />
              <meshBasicMaterial color="#111827" />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  )
}

/** Distant skyline horizon silhouette ring — encircles the city so it feels infinite */
function DistantSkyline({ mode = 'day' }) {
  const isNight = mode === 'night'
  const isSunset = mode === 'sunset'
  const skylineColor = isNight ? '#111c38' : isSunset ? '#6b4038' : '#6f8ba4'
  const windowGlow = isNight ? '#fde047' : isSunset ? '#fb923c' : '#ffffff'
  const windowIntensity = isNight ? 0.4 : isSunset ? 0.15 : 0.01

  // Deterministic ring of 32 distant towers
  const towers = useMemo(() => {
    return Array.from({ length: 32 }, (_, i) => {
      const angle = (i / 32) * Math.PI * 2
      const radius = 105 + ((i * 19) % 25)
      const x = Math.cos(angle) * radius
      const z = Math.sin(angle) * radius
      const width = 8 + ((i * 7) % 8)
      const depth = 8 + ((i * 11) % 8)
      const height = 30 + ((i * 17) % 40)
      return { id: i, x, z, width, depth, height }
    })
  }, [])

  return (
    <group>
      {towers.map((t) => (
        <group key={t.id} position={[t.x, t.height / 2, t.z]}>
          <mesh>
            <boxGeometry args={[t.width, t.height, t.depth]} />
            <meshStandardMaterial color={skylineColor} roughness={0.9} metalness={0.1} />
          </mesh>
          {/* Subtle distant window rows */}
          <mesh position={[0, 0, t.depth / 2 + 0.05]}>
            <planeGeometry args={[t.width * 0.75, t.height * 0.7]} />
            <meshStandardMaterial
              color="#38bdf8"
              emissive={windowGlow}
              emissiveIntensity={windowIntensity}
              transparent
              opacity={0.6}
            />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/**
 * Main export: Complete city architectural quarters.
 * Strictly guarantees all buildings are outside the roads (|X|>9.8 or |Z|>9.8)
 * and strictly outside the railway corridor (Z < -28 or Z > -18).
 */
export default function CityBuildings({ mode = 'day' }) {
  return (
    <group>
      {/* =========================================================================
          SOUTH-WEST QUADRANT: DOWNTOWN FINANCIAL & HIGH-RISE DISTRICT
          X ∈ [-65, -12], Z ∈ [12, 65]
          No railway here — massive soaring skyscrapers!
         ========================================================================= */}
      {/* 1. Nexus Financial Tower (Tallest Skyscraper) */}
      <Skyscraper
        position={[-24, 0, 24]}
        width={14}
        depth={14}
        height={46}
        wallColor="#0f172a"
        glassColor="#38bdf8"
        mode={mode}
        hasSpire={true}
        hasSetback={true}
        billboard={{ title: 'GLOBAL TECH', subtitle: 'FUTURE IS NOW', color: '#2563eb', width: 8, height: 4.5, y: 22 }}
      />

      {/* 2. Horizon Corporate Center with Rooftop Helipad */}
      <Skyscraper
        position={[-44, 0, 22]}
        width={15}
        depth={13}
        height={36}
        wallColor="#1e293b"
        glassColor="#60a5fa"
        mode={mode}
        hasHelipad={true}
      />

      {/* 3. Titan Megatower (Back row landmark) */}
      <Skyscraper
        position={[-26, 0, 52]}
        width={16}
        depth={15}
        height={52}
        wallColor="#18181b"
        glassColor="#0284c7"
        mode={mode}
        hasSpire={true}
      />

      {/* 4. Silicon Plaza Tech Hub */}
      <MidRiseBuilding
        position={[-48, 0, 48]}
        width={15}
        depth={14}
        height={26}
        color="#e2e8f0"
        trimColor="#334155"
        mode={mode}
        sign={{ text: 'TECH INNOVATION PARK', bg: '#0369a1' }}
      />

      {/* 5. Metro Bank & Commerce Center */}
      <MidRiseBuilding
        position={[-16, 0, 42]}
        width={10}
        depth={12}
        height={22}
        color="#f1f5f9"
        trimColor="#0f172a"
        mode={mode}
        hasBalconies={true}
        sign={{ text: 'METRO COMMERCE BANK', bg: '#15803d' }}
      />

      {/* =========================================================================
          SOUTH-EAST QUADRANT: HOSPITALITY, RESIDENCES & CIVIC PLAZA
          X ∈ [12, 65], Z ∈ [12, 65]
         ========================================================================= */}
      {/* 6. Grand Metropolis Luxury Hotel */}
      <Skyscraper
        position={[46, 0, 22]}
        width={16}
        depth={14}
        height={38}
        wallColor="#292524"
        glassColor="#fbbf24"
        mode={mode}
        hasSetback={true}
        billboard={{ title: 'GRAND METROPOLIS', subtitle: 'LUXURY SUITES & SPA', color: '#d97706', width: 9, height: 4.2, y: 19 }}
      />

      {/* 7. Skyline Condominium Tower */}
      <Skyscraper
        position={[26, 0, 50]}
        width={14}
        depth={14}
        height={40}
        wallColor="#1e293b"
        glassColor="#38bdf8"
        mode={mode}
        hasHelipad={true}
      />

      {/* 8. Pavilion Arts & Culture Center */}
      <MidRiseBuilding
        position={[48, 0, 50]}
        width={16}
        depth={13}
        height={20}
        color="#f8fafc"
        trimColor="#b91c1c"
        mode={mode}
        sign={{ text: 'METROPOLIS ARTS PAVILION', bg: '#b91c1c' }}
      />

      {/* =========================================================================
          NORTH-WEST QUADRANT (STRICT RAILWAY CORRIDOR AT Z = -23):
          - South of Railway: Z ∈ [-18.5, -11] -> Retail Promenade (Z = -14.8)
          - North of Railway: Z ∈ [-65, -28.5] -> Central Station & Towers
         ========================================================================= */}
      {/* Retail Promenade safely placed at Z = -14.8 (Clearance: >8 units from track!) */}
      <RetailStore
        position={[-16, 0, -14.8]}
        width={7.2}
        depth={5.2}
        height={4.8}
        color="#f8fafc"
        sign="CITY PHARMACY"
        awningColor="#059669"
        mode={mode}
      />
      <RetailStore
        position={[-24.5, 0, -14.8]}
        width={7.2}
        depth={5.2}
        height={4.8}
        color="#fef3c7"
        sign="CAFE EXPRESS"
        awningColor="#b45309"
        mode={mode}
      />
      <RetailStore
        position={[-33, 0, -14.8]}
        width={7.2}
        depth={5.2}
        height={4.8}
        color="#ecfdf5"
        sign="GRAND BAZAAR"
        awningColor="#0284c7"
        mode={mode}
      />
      <RetailStore
        position={[-41.5, 0, -14.8]}
        width={7.2}
        depth={5.2}
        height={4.8}
        color="#f1f5f9"
        sign="TECH BOUTIQUE"
        awningColor="#7c3aed"
        mode={mode}
      />

      {/* North of Railway: Central Railway Station at Z = -35 (Clearance: 12 units north of track!) */}
      <RailwayStation position={[-25, 0, -35]} mode={mode} />

      {/* Station Corporate Towers behind the station */}
      <Skyscraper
        position={[-46, 0, -38]}
        width={14}
        depth={13}
        height={36}
        wallColor="#1e293b"
        glassColor="#38bdf8"
        mode={mode}
        hasSpire={true}
      />
      <Skyscraper
        position={[-26, 0, -55]}
        width={15}
        depth={14}
        height={42}
        wallColor="#0f172a"
        glassColor="#60a5fa"
        mode={mode}
      />
      <MidRiseBuilding
        position={[-48, 0, -56]}
        width={14}
        depth={13}
        height={24}
        color="#e2e8f0"
        trimColor="#475569"
        mode={mode}
        sign={{ text: 'STATION HOTEL & TRANSIT', bg: '#1d4ed8' }}
      />

      {/* =========================================================================
          NORTH-EAST QUADRANT (STRICT RAILWAY CORRIDOR AT Z = -23):
          - South of Railway: Z ∈ [-18.5, -11] -> Retail & Convenience (Z = -14.8)
          - North of Railway: Z ∈ [-65, -28.5] -> Medical Center & Residential Towers
         ========================================================================= */}
      {/* South of Railway at Z = -14.8 */}
      <RetailStore
        position={[16, 0, -14.8]}
        width={7.2}
        depth={5.2}
        height={4.8}
        color="#f0fdf4"
        sign="7-METRO MART"
        awningColor="#15803d"
        mode={mode}
      />
      <RetailStore
        position={[24.5, 0, -14.8]}
        width={7.2}
        depth={5.2}
        height={4.8}
        color="#fef2f2"
        sign="ARTISAN BAKERY"
        awningColor="#dc2626"
        mode={mode}
      />

      {/* North of Railway (Z < -28.5): Residential Towers & Medical Center */}
      <Skyscraper
        position={[24, 0, -38]}
        width={14}
        depth={14}
        height={44}
        wallColor="#18181b"
        glassColor="#38bdf8"
        mode={mode}
        hasHelipad={true}
        hasSetback={true}
      />
      <Skyscraper
        position={[44, 0, -36]}
        width={14}
        depth={13}
        height={34}
        wallColor="#1e293b"
        glassColor="#60a5fa"
        mode={mode}
      />
      <MidRiseBuilding
        position={[26, 0, -56]}
        width={16}
        depth={14}
        height={22}
        color="#f8fafc"
        trimColor="#0284c7"
        mode={mode}
        sign={{ text: 'METROPOLIS MEDICAL CENTER', bg: '#dc2626' }}
      />
      <Skyscraper
        position={[48, 0, -56]}
        width={13}
        depth={13}
        height={32}
        wallColor="#0f172a"
        glassColor="#38bdf8"
        mode={mode}
      />

      {/* Distant Skyline Horizon Ring encircling the entire map */}
      <DistantSkyline mode={mode} />
    </group>
  )
}
