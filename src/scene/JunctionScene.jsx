/**
 * JunctionScene.jsx — Main R3F scene composition.
 * Assembles roads, signals, vehicles, and environment into a complete 3D scene.
 */
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import Roads from './Roads'
import TrafficSignals from './TrafficSignals'
import Vehicles from './Vehicles'
import Environment from './Environment'

function SceneContent() {
  return (
    <>
      {/* Lighting */}
      <ambientLight intensity={0.35} color="#c7d2fe" />
      <directionalLight
        position={[30, 40, 20]}
        intensity={1.2}
        color="#f8fafc"
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-far={100}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <directionalLight
        position={[-20, 25, -15]}
        intensity={0.4}
        color="#e0e7ff"
      />
      {/* Subtle hemisphere light for more natural feel */}
      <hemisphereLight
        args={['#1e3a5f', '#1a1f2b', 0.3]}
      />

      {/* Scene components */}
      <Roads />
      <TrafficSignals />
      <Vehicles />
      <Environment />

      {/* Camera controls */}
      <OrbitControls
        makeDefault
        maxPolarAngle={Math.PI / 2.2}
        minPolarAngle={Math.PI / 8}
        minDistance={20}
        maxDistance={80}
        enableDamping
        dampingFactor={0.05}
        target={[0, 0, 0]}
      />
    </>
  )
}

export default function JunctionScene() {
  return (
    <div className="canvas-container w-full h-full">
      <Canvas
        camera={{
          position: [35, 30, 35],
          fov: 50,
          near: 0.5,
          far: 300,
        }}
        shadows
        dpr={[1, 1.5]}
        gl={{
          antialias: true,
          powerPreference: 'default',
        }}
        style={{ background: '#0a0f1a' }}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}
