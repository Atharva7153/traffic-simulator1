import { useMemo, useRef } from 'react'
import { MathUtils } from 'three'
import { useFrame } from '@react-three/fiber'
import { useSimulation } from '../simulation/useSimulation'
import { getBallastTexture } from './textures'

export const RAIL_Z = -23
const ACTIVE = ['WARNING', 'CLOSED', 'TRAIN PASSING', 'CLEARANCE']

/** Detailed Train Coach with interior glow and realistic bogie wheel trucks */
function Coach({ x, locomotive = false, isLast = false, mode = 'day' }) {
  const isNight = mode === 'night'
  const isSunset = mode === 'sunset'
  const windowGlow = isNight ? '#fef08a' : isSunset ? '#fed7aa' : '#b9e7f2'
  const windowIntensity = isNight ? 1.5 : isSunset ? 0.6 : 0.15

  const bodyColor = locomotive ? '#0f4c81' : '#f1f5f9'
  const stripeColor = locomotive ? '#f59e0b' : '#0284c7'

  return (
    <group position={[x, 0, 0]}>
      {/* Main coach body */}
      <mesh position={[0, 1.85, 0]} castShadow>
        <boxGeometry args={[locomotive ? 8.2 : 7.6, 2.7, 2.5]} />
        <meshStandardMaterial color={bodyColor} metalness={0.4} roughness={0.45} />
      </mesh>

      {/* Speed livery stripe along side */}
      <mesh position={[0, 1.25, 0]}>
        <boxGeometry args={[locomotive ? 8.25 : 7.65, 0.45, 2.53]} />
        <meshStandardMaterial color={stripeColor} roughness={0.4} />
      </mesh>

      {/* Roof with longitudinal aerodynamic ribs */}
      <mesh position={[0, 3.25, 0]} castShadow>
        <boxGeometry args={[locomotive ? 8.0 : 7.4, 0.25, 2.45]} />
        <meshStandardMaterial color="#64748b" metalness={0.6} roughness={0.35} />
      </mesh>
      {/* Roof AC modules */}
      {[-1.8, 1.8].map((rx) => (
        <mesh key={rx} position={[rx, 3.48, 0]} castShadow>
          <boxGeometry args={[1.6, 0.24, 1.4]} />
          <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
        </mesh>
      ))}

      {/* Undercarriage dark chassis */}
      <mesh position={[0, 0.55, 0]}>
        <boxGeometry args={[locomotive ? 8.0 : 7.4, 0.22, 2.3]} />
        <meshStandardMaterial color="#111827" roughness={0.9} />
      </mesh>

      {/* Passenger Window Rows with interior cabin glow */}
      {!locomotive && (
        <>
          {[-2.2, -1.1, 0, 1.1, 2.2].map((wx) => (
            <group key={`win-${wx}`}>
              {/* Front side (+Z) */}
              <mesh position={[wx, 2.05, 1.26]}>
                <boxGeometry args={[0.85, 0.85, 0.04]} />
                <meshStandardMaterial
                  color={windowGlow}
                  emissive={windowGlow}
                  emissiveIntensity={windowIntensity}
                  roughness={0.2}
                />
              </mesh>
              {/* Back side (-Z) */}
              <mesh position={[wx, 2.05, -1.26]}>
                <boxGeometry args={[0.85, 0.85, 0.04]} />
                <meshStandardMaterial
                  color={windowGlow}
                  emissive={windowGlow}
                  emissiveIntensity={windowIntensity}
                  roughness={0.2}
                />
              </mesh>
            </group>
          ))}
        </>
      )}

      {/* Dual Bogie Wheel Trucks (4 wheels per bogie) */}
      {[-2.3, 2.3].map((bogieX) => (
        <group key={`bogie-${bogieX}`} position={[bogieX, 0, 0]}>
          {/* Bogie frame */}
          <mesh position={[0, 0.45, 0]}>
            <boxGeometry args={[1.9, 0.22, 2.2]} />
            <meshStandardMaterial color="#1e293b" metalness={0.7} roughness={0.5} />
          </mesh>
          {/* Wheels */}
          {[-0.65, 0.65].flatMap((wx) =>
            [-1.12, 1.12].map((wz) => (
              <mesh key={`wheel-${wx}-${wz}`} position={[wx, 0.36, wz]} rotation={[Math.PI / 2, 0, 0]} castShadow>
                <cylinderGeometry args={[0.36, 0.36, 0.16, 14]} />
                <meshStandardMaterial color="#0f172a" metalness={0.8} roughness={0.3} />
              </mesh>
            ))
          )}
        </group>
      ))}

      {/* Locomotive Specific Details */}
      {locomotive && (
        <>
          {/* Aerodynamic windshield cab */}
          <mesh position={[4.1, 2.1, 0]}>
            <boxGeometry args={[0.35, 1.2, 2.2]} />
            <meshStandardMaterial color="#38bdf8" roughness={0.1} metalness={0.8} />
          </mesh>

          {/* Front Cowcatcher / Pilot plow */}
          <mesh position={[4.2, 0.42, 0]}>
            <boxGeometry args={[0.45, 0.35, 2.4]} />
            <meshStandardMaterial color="#f59e0b" roughness={0.5} />
          </mesh>

          {/* High-intensity dual headlights */}
          {[-0.7, 0.7].map((hz) => (
            <mesh key={`hl-${hz}`} position={[4.15, 1.45, hz]}>
              <cylinderGeometry args={[0.22, 0.22, 0.1, 14]} rotation={[0, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#ffffff" emissive="#fef08a" emissiveIntensity={3} />
            </mesh>
          ))}
          {/* Top center headlight */}
          <mesh position={[4.05, 3.1, 0]}>
            <cylinderGeometry args={[0.18, 0.18, 0.1, 14]} rotation={[0, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#ffffff" emissive="#fef08a" emissiveIntensity={3.5} />
          </mesh>
          {/* Headlight forward illumination beam */}
          <pointLight position={[6, 1.8, 0]} color="#fff7cc" intensity={3} distance={28} decay={1.5} />

          {/* Roof Pantograph (Electric current collector) */}
          <group position={[-1.2, 3.4, 0]}>
            <mesh position={[0, 0.35, 0]}>
              <boxGeometry args={[1.2, 0.15, 1.1]} />
              <meshStandardMaterial color="#b45309" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0, 1.1, 0]} rotation={[0, 0, 0.35]}>
              <cylinderGeometry args={[0.04, 0.04, 1.6, 6]} />
              <meshStandardMaterial color="#d97706" metalness={0.8} roughness={0.3} />
            </mesh>
            <mesh position={[0.4, 1.85, 0]} rotation={[0, 0, -Math.PI / 2]}>
              <cylinderGeometry args={[0.05, 0.05, 1.8, 6]} />
              <meshStandardMaterial color="#1e293b" metalness={0.9} roughness={0.2} />
            </mesh>
          </group>
        </>
      )}

      {/* End coach red taillights */}
      {isLast && (
        <>
          {[-0.7, 0.7].map((tz) => (
            <mesh key={`tl-${tz}`} position={[-3.85, 1.45, tz]}>
              <cylinderGeometry args={[0.16, 0.16, 0.08, 12]} rotation={[0, 0, Math.PI / 2]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={3} />
            </mesh>
          ))}
        </>
      )}
    </group>
  )
}

/** Level Crossing Warning Signal with dual alternating flashing red lights */
function CrossingSignal({ position, active, flashAlt }) {
  return (
    <group position={position}>
      {/* Steel pole */}
      <mesh position={[0, 1.9, 0]}>
        <cylinderGeometry args={[0.09, 0.12, 3.8, 8]} />
        <meshStandardMaterial color="#475569" metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Crossbuck sign: "X" RAILWAY CROSSING */}
      <group position={[0, 3.4, 0]}>
        <mesh rotation={[0, 0, Math.PI / 4]}>
          <boxGeometry args={[1.3, 0.18, 0.04]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 4]}>
          <boxGeometry args={[1.3, 0.18, 0.04]} />
          <meshStandardMaterial color="#ffffff" roughness={0.5} />
        </mesh>
        <mesh rotation={[0, 0, Math.PI / 4]} position={[0, 0, 0.025]}>
          <boxGeometry args={[1.1, 0.08, 0.02]} />
          <meshStandardMaterial color="#b91c1c" />
        </mesh>
        <mesh rotation={[0, 0, -Math.PI / 4]} position={[0, 0, 0.025]}>
          <boxGeometry args={[1.1, 0.08, 0.02]} />
          <meshStandardMaterial color="#b91c1c" />
        </mesh>
      </group>

      {/* Dual warning flashers assembly */}
      <group position={[0, 2.7, 0]}>
        {/* Horizontal crossbar */}
        <mesh>
          <boxGeometry args={[1.4, 0.12, 0.12]} />
          <meshStandardMaterial color="#1e293b" />
        </mesh>
        {/* Left lamp */}
        <group position={[-0.55, 0, 0.1]}>
          {/* Black circular backboard */}
          <mesh position={[0, 0, -0.05]}>
            <circleGeometry args={[0.3, 16]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.18, 12, 10]} />
            <meshStandardMaterial
              color={active ? '#ef4444' : '#7f1d1d'}
              emissive="#ff1e1e"
              emissiveIntensity={active && flashAlt ? 3.5 : 0.05}
            />
          </mesh>
        </group>
        {/* Right lamp */}
        <group position={[0.55, 0, 0.1]}>
          <mesh position={[0, 0, -0.05]}>
            <circleGeometry args={[0.3, 16]} />
            <meshBasicMaterial color="#0f172a" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.18, 12, 10]} />
            <meshStandardMaterial
              color={active ? '#ef4444' : '#7f1d1d'}
              emissive="#ff1e1e"
              emissiveIntensity={active && !flashAlt ? 3.5 : 0.05}
            />
          </mesh>
        </group>
      </group>

      {/* Warning bell on top */}
      <mesh position={[0, 3.85, 0]}>
        <sphereGeometry args={[0.15, 10, 8]} />
        <meshStandardMaterial color="#b45309" metalness={0.8} roughness={0.3} />
      </mesh>
    </group>
  )
}

/** Overhead Electrification Catenary Gantry (Electric railway wire support) */
function CatenaryGantry({ x }) {
  return (
    <group position={[x, 0, RAIL_Z]}>
      {/* South steel lattice pole */}
      <mesh position={[0, 3.2, 3.1]} castShadow>
        <boxGeometry args={[0.22, 6.4, 0.22]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* North steel lattice pole */}
      <mesh position={[0, 3.2, -3.1]} castShadow>
        <boxGeometry args={[0.22, 6.4, 0.22]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Horizontal steel crossbeam spanning tracks */}
      <mesh position={[0, 6.0, 0]} castShadow>
        <boxGeometry args={[0.28, 0.35, 6.4]} />
        <meshStandardMaterial color="#475569" metalness={0.7} roughness={0.3} />
      </mesh>
      {/* Cantilever droppers */}
      {[-0.9, 0.9].map((z) => (
        <mesh key={z} position={[0, 5.4, z]}>
          <cylinderGeometry args={[0.02, 0.02, 1.2, 6]} />
          <meshStandardMaterial color="#64748b" metalness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

/** Railway Security Fence along the tracks */
function RailwayFence({ startX, endX, z }) {
  const length = endX - startX
  const centerX = (startX + endX) / 2
  return (
    <group position={[centerX, 0.7, z]}>
      {/* Horizontal rails */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[length, 0.06, 0.06]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[length, 0.06, 0.06]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.6} roughness={0.4} />
      </mesh>
      {/* Fence posts */}
      {Array.from({ length: Math.floor(length / 4) + 1 }).map((_, i) => (
        <mesh key={i} position={[-length / 2 + i * 4, 0, 0]}>
          <cylinderGeometry args={[0.04, 0.04, 1.4, 6]} />
          <meshStandardMaterial color="#64748b" metalness={0.7} roughness={0.4} />
        </mesh>
      ))}
    </group>
  )
}

/** Railway Gatekeeper Relay Cabin */
function GatehouseCabin({ position }) {
  return (
    <group position={position}>
      {/* Concrete cabin */}
      <mesh position={[0, 1.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[4.2, 3.2, 3.6]} />
        <meshStandardMaterial color="#e2e8f0" roughness={0.8} />
      </mesh>
      {/* Dark roof */}
      <mesh position={[0, 3.3, 0]} castShadow>
        <boxGeometry args={[4.6, 0.3, 4.0]} />
        <meshStandardMaterial color="#0f172a" roughness={0.6} />
      </mesh>
      {/* Observation windows facing railway crossing */}
      <mesh position={[0, 1.8, 1.82]}>
        <planeGeometry args={[3.2, 1.4]} />
        <meshStandardMaterial color="#38bdf8" roughness={0.2} metalness={0.8} opacity={0.85} transparent />
      </mesh>
      {/* Door */}
      <mesh position={[1.4, 1.1, -1.82]}>
        <planeGeometry args={[1.0, 2.2]} rotation={[0, Math.PI, 0]} />
        <meshStandardMaterial color="#334155" roughness={0.5} />
      </mesh>
      {/* Radio antenna */}
      <mesh position={[-1.6, 4.2, -1.3]}>
        <cylinderGeometry args={[0.03, 0.06, 2.2, 6]} />
        <meshStandardMaterial color="#94a3b8" metalness={0.8} />
      </mesh>
    </group>
  )
}

/** Station Passenger Platform alongside the track (north of track, Z = -26.5) */
function StationPlatform() {
  return (
    <group position={[28, 0, RAIL_Z - 3.2]}>
      {/* Concrete platform slab */}
      <mesh position={[0, 0.42, 0]} receiveShadow castShadow>
        <boxGeometry args={[32, 0.84, 3.4]} />
        <meshStandardMaterial color="#cbd5e1" roughness={0.85} />
      </mesh>
      {/* Yellow tactile safety edge along track */}
      <mesh position={[0, 0.85, 1.55]}>
        <boxGeometry args={[32, 0.02, 0.3]} />
        <meshStandardMaterial color="#facc15" roughness={0.6} />
      </mesh>
      {/* Platform waiting canopy */}
      <mesh position={[0, 3.2, -0.4]} castShadow>
        <boxGeometry args={[22, 0.2, 2.6]} />
        <meshStandardMaterial color="#0284c7" metalness={0.6} roughness={0.3} />
      </mesh>
      {/* Canopy support columns */}
      {[-8, 0, 8].map((px) => (
        <mesh key={px} position={[px, 1.9, -0.4]}>
          <cylinderGeometry args={[0.08, 0.08, 2.3, 8]} />
          <meshStandardMaterial color="#1e293b" metalness={0.7} />
        </mesh>
      ))}
      {/* Platform benches */}
      {[-6, 6].map((bx) => (
        <mesh key={bx} position={[bx, 1.1, -0.6]} castShadow>
          <boxGeometry args={[2.2, 0.45, 0.6]} />
          <meshStandardMaterial color="#78350f" roughness={0.8} />
        </mesh>
      ))}
    </group>
  )
}

export default function RailwayCrossing({ mode = 'day' }) {
  const { railwayStatus, railwayProgress } = useSimulation()
  const northGate = useRef()
  const southGate = useRef()
  const train = useRef()
  const lampLight = useRef()
  const lampLight2 = useRef()

  const closed = ['CLOSED', 'TRAIN PASSING', 'CLEARANCE'].includes(railwayStatus)
  const active = ACTIVE.includes(railwayStatus)

  // Track length spans the entire metropolitan footprint
  const TRACK_LENGTH = 260
  const SLEEPER_COUNT = Math.floor(TRACK_LENGTH / 1.5)

  useFrame((state, delta) => {
    // Smooth gate arm rotation: 0 is horizontal (closed), PI/2 is vertical (open)
    const targetGate = closed ? 0 : (railwayStatus === 'WARNING' ? 0 : Math.PI / 2)
    if (northGate.current) northGate.current.rotation.z = MathUtils.damp(northGate.current.rotation.z, targetGate, 1.8, delta)
    if (southGate.current) southGate.current.rotation.z = MathUtils.damp(southGate.current.rotation.z, targetGate, 1.8, delta)

    // Smooth train travel across the entire metropolis (from x = -95 to x = +115)
    if (train.current) {
      if (railwayStatus === 'TRAIN PASSING') {
        // Traverses from western off-screen tracks across the road into eastern district
        train.current.position.x = -95 + railwayProgress * 190
        train.current.visible = true
      } else if (railwayStatus === 'CLEARANCE') {
        // Exits smoothly into distant tracks
        train.current.position.x = 95 + delta * 25
        train.current.visible = true
      } else {
        train.current.visible = false
      }
    }

    // Alternating flashers for the warning signals
    const blink = active && Math.sin(state.clock.elapsedTime * 9) > 0
    if (lampLight.current) lampLight.current.intensity = blink ? 2.8 : 0
    if (lampLight2.current) lampLight2.current.intensity = blink ? 2.8 : 0
  })

  // Precompute sleeper X positions
  const sleeperPositions = useMemo(() => {
    return Array.from({ length: SLEEPER_COUNT }, (_, i) => -TRACK_LENGTH / 2 + i * 1.5 + 0.75)
  }, [SLEEPER_COUNT, TRACK_LENGTH])

  const ballastMap = useMemo(() => {
    const tex = getBallastTexture().clone()
    tex.repeat.set(TRACK_LENGTH / 6, 1)
    tex.needsUpdate = true
    return tex
  }, [TRACK_LENGTH])

  // Catenary gantry positions along the track (skipping the road crossing zone [-10, 10])
  const gantryPositions = [-110, -85, -60, -35, -15, 15, 35, 60, 85, 110]

  return (
    <group>
      {/* =========================================================================
          RAILWAY TRACK INFRASTRUCTURE (Ballast bed, sleepers, steel rails, wires)
         ========================================================================= */}
      {/* 1. Crushed dark-stone ballast gravel bed */}
      <mesh position={[0, 0.08, RAIL_Z]} receiveShadow>
        <boxGeometry args={[TRACK_LENGTH, 0.16, 5.0]} />
        <meshStandardMaterial
          color="#38332f"
          map={ballastMap}
          roughnessMap={ballastMap}
          roughness={0.95}
        />
      </mesh>

      {/* 2. Wooden sleepers along entire length */}
      {sleeperPositions.map((x) => (
        <mesh key={`sleeper-${x}`} position={[x, 0.18, RAIL_Z]} receiveShadow>
          <boxGeometry args={[0.34, 0.12, 3.2]} />
          <meshStandardMaterial color="#54433a" roughness={0.9} />
        </mesh>
      ))}

      {/* 3. Continuous Shiny Steel Rails */}
      {[-0.92, 0.92].map((z) => (
        <mesh key={`rail-${z}`} position={[0, 0.28, RAIL_Z + z]} receiveShadow>
          <boxGeometry args={[TRACK_LENGTH, 0.2, 0.14]} />
          <meshStandardMaterial color="#d1d5db" metalness={0.88} roughness={0.18} />
        </mesh>
      ))}

      {/* 4. Overhead Electrification Catenary Wire (continuous thin copper wire) */}
      <mesh position={[0, 5.2, RAIL_Z]}>
        <boxGeometry args={[TRACK_LENGTH, 0.025, 0.025]} />
        <meshStandardMaterial color="#f59e0b" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* 5. Catenary support gantries */}
      {gantryPositions.map((gx) => (
        <CatenaryGantry key={`gantry-${gx}`} x={gx} />
      ))}

      {/* 6. Security Fences along both sides (leaving road open [-9.5, 9.5]) */}
      <RailwayFence startX={-TRACK_LENGTH / 2} endX={-9.8} z={RAIL_Z + 2.7} />
      <RailwayFence startX={9.8} endX={TRACK_LENGTH / 2} z={RAIL_Z + 2.7} />
      <RailwayFence startX={-TRACK_LENGTH / 2} endX={-9.8} z={RAIL_Z - 2.7} />
      <RailwayFence startX={9.8} endX={TRACK_LENGTH / 2} z={RAIL_Z - 2.7} />

      {/* 7. Gatekeeper Cabin safely set back at X = -14, Z = -28.5 (5.5m clear of track!) */}
      <GatehouseCabin position={[-14, 0, RAIL_Z - 5.5]} />

      {/* 8. Station Passenger Platform on the north side at Z = -26.2 */}
      <StationPlatform />

      {/* =========================================================================
          CROSSING GATES & WARNING SIGNALS AT ROAD APPROACH
         ========================================================================= */}
      {/* North and South Automated Barrier Gates */}
      {[-4.3, 4.3].map((offset, index) => (
        <group key={`barrier-${offset}`} position={[-5.4, 0.75, RAIL_Z + offset]}>
          {/* Sturdy base mechanism housing */}
          <mesh position={[0, -0.35, 0]} castShadow>
            <boxGeometry args={[0.7, 0.85, 0.7]} />
            <meshStandardMaterial color="#334155" metalness={0.5} roughness={0.5} />
          </mesh>
          {/* Pivoting barrier arm with red/white safety stripes */}
          <group ref={index === 0 ? northGate : southGate} rotation={[0, 0, closed ? 0 : Math.PI / 2]}>
            <mesh position={[5.4, 0, 0]} castShadow>
              <boxGeometry args={[11.2, 0.22, 0.22]} />
              <meshStandardMaterial color="#f8fafc" />
            </mesh>
            {/* Red reflective stripes */}
            {Array.from({ length: 6 }, (_, i) => (
              <mesh key={i} position={[1.1 + i * 1.8, 0.01, 0.12]}>
                <boxGeometry args={[0.85, 0.23, 0.025]} />
                <meshStandardMaterial color="#dc2626" />
              </mesh>
            ))}
            {/* Tip LED warning lamp */}
            <mesh position={[10.9, 0, 0]}>
              <sphereGeometry args={[0.1, 8, 8]} />
              <meshStandardMaterial color="#ef4444" emissive="#ef4444" emissiveIntensity={closed ? 3 : 0.1} />
            </mesh>
          </group>
        </group>
      ))}

      {/* Level Crossing Warning Signals with Alternating Red Lamps */}
      <CrossingSignal position={[-7.2, 0, RAIL_Z - 4.5]} active={active} flashAlt={true} />
      <CrossingSignal position={[7.2, 0, RAIL_Z + 4.5]} active={active} flashAlt={false} />

      <pointLight ref={lampLight} color="#ff2222" intensity={0} distance={8} position={[-7.2, 2.7, RAIL_Z - 4.5]} />
      <pointLight ref={lampLight2} color="#ff2222" intensity={0} distance={8} position={[7.2, 2.7, RAIL_Z + 4.5]} />

      {/* =========================================================================
          THE TRAIN: High-speed electric locomotive + 4 Passenger Coaches
         ========================================================================= */}
      <group ref={train} visible={false} position={[-95, 0, RAIL_Z]}>
        {/* Locomotive (Leading engine) */}
        <Coach x={0} locomotive={true} mode={mode} />
        {/* Passenger Coaches */}
        <Coach x={-8.5} mode={mode} />
        <Coach x={-16.7} mode={mode} />
        <Coach x={-24.9} mode={mode} />
        {/* Tail Coach with red taillights */}
        <Coach x={-33.1} isLast={true} mode={mode} />
      </group>
    </group>
  )
}
