/**
 * JunctionScene.jsx — Main 3D Canvas with enhanced lighting, soft PCF shadows,
 * realistic atmospheric fog, and smooth Day/Sunset/Night cycle.
 */
import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Color, MathUtils, Vector3 } from 'three'
import { useSimulation } from '../simulation/useSimulation'
import Roads from './Roads'
import TrafficSignals from './TrafficSignals'
import Vehicles from './Vehicles'
import Environment from './Environment'
import RailwayCrossing from './RailwayCrossing'

const LIGHTING = {
  day: {
    background: '#a3cef1',
    ambient: '#ffffff',
    ambientIntensity: 1.15,
    sun: '#fff8ed',
    sunIntensity: 2.3,
    sunPosition: [42, 54, 28],
    fill: '#bae6fd',
    fillIntensity: 0.45,
    sky: '#b0d4f1',
    ground: '#475569',
    hemiIntensity: 0.65,
    fogNear: 110,
    fogFar: 260,
  },
  sunset: {
    background: '#ea8c55',
    ambient: '#ffd7ba',
    ambientIntensity: 0.85,
    sun: '#ff7e33',
    sunIntensity: 2.2,
    sunPosition: [55, 22, -32],
    fill: '#f4a261',
    fillIntensity: 0.35,
    sky: '#f97316',
    ground: '#451a03',
    hemiIntensity: 0.5,
    fogNear: 95,
    fogFar: 230,
  },
  night: {
    background: '#0b132b',
    ambient: '#1e293b',
    ambientIntensity: 0.45,
    sun: '#93c5fd',
    sunIntensity: 0.52,
    sunPosition: [-28, 48, -20],
    fill: '#334155',
    fillIntensity: 0.3,
    sky: '#1e293b',
    ground: '#090d16',
    hemiIntensity: 0.35,
    fogNear: 90,
    fogFar: 220,
  },
}

function DayNightLighting({ mode }) {
  const { scene } = useThree()
  const ambient = useRef()
  const sun = useRef()
  const fill = useRef()
  const hemisphere = useRef()

  const target = LIGHTING[mode] || LIGHTING.day
  const backgroundTarget = useMemo(() => new Color(target.background), [target.background])
  const ambientTarget = useMemo(() => new Color(target.ambient), [target.ambient])
  const sunTarget = useMemo(() => new Color(target.sun), [target.sun])
  const fillTarget = useMemo(() => new Color(target.fill), [target.fill])
  const skyTarget = useMemo(() => new Color(target.sky), [target.sky])
  const groundTarget = useMemo(() => new Color(target.ground), [target.ground])
  const sunPosition = useMemo(() => new Vector3(...target.sunPosition), [target.sunPosition])

  useFrame((_, delta) => {
    const blend = 1 - Math.exp(-delta * 1.5)
    if (scene.background?.isColor) scene.background.lerp(backgroundTarget, blend)
    if (scene.fog) {
      scene.fog.color.lerp(backgroundTarget, blend)
      scene.fog.near = MathUtils.damp(scene.fog.near, target.fogNear, 1.5, delta)
      scene.fog.far = MathUtils.damp(scene.fog.far, target.fogFar, 1.5, delta)
    }
    if (ambient.current) {
      ambient.current.color.lerp(ambientTarget, blend)
      ambient.current.intensity = MathUtils.damp(ambient.current.intensity, target.ambientIntensity, 1.5, delta)
    }
    if (sun.current) {
      sun.current.color.lerp(sunTarget, blend)
      sun.current.intensity = MathUtils.damp(sun.current.intensity, target.sunIntensity, 1.5, delta)
      sun.current.position.lerp(sunPosition, blend)
    }
    if (fill.current) {
      fill.current.color.lerp(fillTarget, blend)
      fill.current.intensity = MathUtils.damp(fill.current.intensity, target.fillIntensity, 1.5, delta)
    }
    if (hemisphere.current) {
      hemisphere.current.color.lerp(skyTarget, blend)
      hemisphere.current.groundColor.lerp(groundTarget, blend)
      hemisphere.current.intensity = MathUtils.damp(hemisphere.current.intensity, target.hemiIntensity, 1.5, delta)
    }
  })

  return (
    <>
      <color attach="background" args={[LIGHTING.day.background]} />
      <fog attach="fog" args={[LIGHTING.day.background, LIGHTING.day.fogNear, LIGHTING.day.fogFar]} />
      <ambientLight ref={ambient} intensity={LIGHTING.day.ambientIntensity} color={LIGHTING.day.ambient} />
      <directionalLight
        ref={sun}
        position={LIGHTING.day.sunPosition}
        intensity={LIGHTING.day.sunIntensity}
        color={LIGHTING.day.sun}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-bias={-0.0003}
        shadow-camera-near={1}
        shadow-camera-far={160}
        shadow-camera-left={-80}
        shadow-camera-right={80}
        shadow-camera-top={80}
        shadow-camera-bottom={-80}
      />
      <directionalLight ref={fill} position={[-28, 24, -22]} intensity={LIGHTING.day.fillIntensity} color={LIGHTING.day.fill} />
      <hemisphereLight ref={hemisphere} args={[LIGHTING.day.sky, LIGHTING.day.ground, LIGHTING.day.hemiIntensity]} />
    </>
  )
}

function SceneContent() {
  const { environmentMode } = useSimulation()
  return (
    <>
      <DayNightLighting mode={environmentMode} />
      <Roads />
      <RailwayCrossing mode={environmentMode} />
      <TrafficSignals />
      <Vehicles mode={environmentMode} />
      <Environment mode={environmentMode} />
      <OrbitControls
        makeDefault
        maxPolarAngle={Math.PI / 2.12}
        minPolarAngle={Math.PI / 10}
        minDistance={16}
        maxDistance={145}
        enableDamping
        dampingFactor={0.06}
        target={[0, 0, 0]}
      />
    </>
  )
}

export default function JunctionScene() {
  return (
    <div className="canvas-container w-full h-full">
      <Canvas
        camera={{ position: [52, 48, 54], fov: 46, near: 0.5, far: 380 }}
        shadows="soft"
        dpr={[1, 1.5]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
        style={{ background: '#a3cef1' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
