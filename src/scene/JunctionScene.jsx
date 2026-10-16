/** Main R3F scene with a smooth three-preset day cycle. */
import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { Color, MathUtils, Vector3 } from 'three'
import { useSimulation } from '../simulation/useSimulation'
import Roads from './Roads'
import TrafficSignals from './TrafficSignals'
import Vehicles from './Vehicles'
import Environment from './Environment'

const LIGHTING = {
  day: {
    background: '#cde5f2', ambient: '#fff9ec', ambientIntensity: 1.25,
    sun: '#fff1d6', sunIntensity: 2.05, sunPosition: [30, 44, 22],
    fill: '#e0efff', fillIntensity: 0.36, sky: '#b9def1', ground: '#9aad86', hemiIntensity: 0.62,
  },
  sunset: {
    background: '#efbd99', ambient: '#ffddb7', ambientIntensity: 0.86,
    sun: '#ffb269', sunIntensity: 1.35, sunPosition: [42, 18, -28],
    fill: '#f5c59f', fillIntensity: 0.24, sky: '#efbd99', ground: '#8d7660', hemiIntensity: 0.42,
  },
  night: {
    background: '#152533', ambient: '#b5c6db', ambientIntensity: 0.78,
    sun: '#b6cafa', sunIntensity: 0.82, sunPosition: [-26, 34, -18],
    fill: '#a5c9df', fillIntensity: 0.46, sky: '#354c63', ground: '#59645d', hemiIntensity: 0.48,
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
    const blend = 1 - Math.exp(-delta * 1.4)
    if (scene.background?.isColor) scene.background.lerp(backgroundTarget, blend)
    if (scene.fog) scene.fog.color.lerp(backgroundTarget, blend)
    if (ambient.current) {
      ambient.current.color.lerp(ambientTarget, blend)
      ambient.current.intensity = MathUtils.damp(ambient.current.intensity, target.ambientIntensity, 1.4, delta)
    }
    if (sun.current) {
      sun.current.color.lerp(sunTarget, blend)
      sun.current.intensity = MathUtils.damp(sun.current.intensity, target.sunIntensity, 1.4, delta)
      sun.current.position.lerp(sunPosition, blend)
    }
    if (fill.current) {
      fill.current.color.lerp(fillTarget, blend)
      fill.current.intensity = MathUtils.damp(fill.current.intensity, target.fillIntensity, 1.4, delta)
    }
    if (hemisphere.current) {
      hemisphere.current.color.lerp(skyTarget, blend)
      hemisphere.current.groundColor.lerp(groundTarget, blend)
      hemisphere.current.intensity = MathUtils.damp(hemisphere.current.intensity, target.hemiIntensity, 1.4, delta)
    }
  })

  return (
    <>
      <color attach="background" args={[LIGHTING.day.background]} />
      <fog attach="fog" args={[LIGHTING.day.background, 95, 185]} />
      <ambientLight ref={ambient} intensity={LIGHTING.day.ambientIntensity} color={LIGHTING.day.ambient} />
      <directionalLight
        ref={sun}
        position={LIGHTING.day.sunPosition}
        intensity={LIGHTING.day.sunIntensity}
        color={LIGHTING.day.sun}
        castShadow
        shadow-mapSize-width={512}
        shadow-mapSize-height={512}
        shadow-camera-far={110}
        shadow-camera-left={-55}
        shadow-camera-right={55}
        shadow-camera-top={55}
        shadow-camera-bottom={-55}
      />
      <directionalLight ref={fill} position={[-24, 22, -18]} intensity={LIGHTING.day.fillIntensity} color={LIGHTING.day.fill} />
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
      <TrafficSignals />
      <Vehicles />
      <Environment mode={environmentMode} />
      <OrbitControls
        makeDefault
        maxPolarAngle={Math.PI / 2.15}
        minPolarAngle={Math.PI / 8}
        minDistance={20}
        maxDistance={78}
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
        camera={{ position: [43, 38, 45], fov: 48, near: 0.5, far: 300 }}
        shadows="percentage"
        dpr={[1, 1.35]}
        gl={{ antialias: true, powerPreference: 'default' }}
        style={{ background: '#cde5f2' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
