/** Low-rise Indian streetscape details around the junction. */
import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, MathUtils } from 'three'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { JUNCTION_SIZE } from './Roads'

const STORES = [
  { position: [-26, 0, -25], color: '#f1dec0', sign: 'CHAI' },
  { position: [26, 0, -25], color: '#d7e6d6', sign: 'BAZAAR' },
  { position: [-26, 0, 25], color: '#ead5cc', sign: 'PHARMACY' },
]

function Storefront({ position, color, sign }) {
  const signTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 96
    const context = canvas.getContext('2d')
    context.fillStyle = '#0f766e'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#fffdf5'
    context.font = '700 54px system-ui, sans-serif'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText(sign, canvas.width / 2, canvas.height / 2)
    const texture = new CanvasTexture(canvas)
    texture.colorSpace = SRGBColorSpace
    return texture
  }, [sign])

  return (
    <group position={position}>
      <mesh position={[0, 2.25, 0]} castShadow receiveShadow>
        <boxGeometry args={[7.5, 4.5, 5.5]} />
        <meshStandardMaterial color={color} roughness={0.88} />
      </mesh>
      <mesh position={[0, 1.2, 2.78]}>
        <boxGeometry args={[2.7, 1.95, 0.08]} />
        <meshStandardMaterial color="#334b52" roughness={0.25} metalness={0.05} />
      </mesh>
      <mesh position={[0, 3.2, 2.83]}>
        <boxGeometry args={[5.1, 0.78, 0.22]} />
        <meshStandardMaterial color="#0f766e" roughness={0.6} />
      </mesh>
      <mesh position={[0, 3.2, 2.96]}>
        <planeGeometry args={[4.95, 0.68]} />
        <meshBasicMaterial map={signTexture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 4.57, -0.3]} castShadow>
        <boxGeometry args={[7.7, 0.18, 5.7]} />
        <meshStandardMaterial color="#c8794b" roughness={0.9} />
      </mesh>
    </group>
  )
}

function BusStop() {
  return (
    <group position={[10.5, 0, -19.5]}>
      <mesh position={[0, 2.55, 0]} castShadow>
        <boxGeometry args={[3.4, 0.18, 5.4]} />
        <meshStandardMaterial color="#e0e6e2" roughness={0.75} />
      </mesh>
      {[-1.45, 1.45].flatMap(x => [-2.35, 2.35].map(z => (
        <mesh key={`${x}-${z}`} position={[x, 1.3, z]}>
          <cylinderGeometry args={[0.07, 0.08, 2.6, 8]} />
          <meshStandardMaterial color="#74848a" metalness={0.25} roughness={0.6} />
        </mesh>
      )))}
      <mesh position={[0, 0.62, 1.6]}>
        <boxGeometry args={[2.3, 0.16, 0.55]} />
        <meshStandardMaterial color="#b87545" roughness={0.7} />
      </mesh>
      <mesh position={[1.8, 1.35, -1.6]}>
        <boxGeometry args={[0.12, 1.5, 0.9]} />
        <meshStandardMaterial color="#0f766e" roughness={0.7} />
      </mesh>
    </group>
  )
}

function Streetlight({ position, mode }) {
  const night = mode === 'night'
  const intensity = mode === 'night' ? 2.6 : mode === 'sunset' ? 0.8 : 0.12
  const lightRef = useRef()
  useFrame((_, delta) => {
    if (lightRef.current) lightRef.current.intensity = MathUtils.damp(lightRef.current.intensity, intensity, 2.2, delta)
  })
  return (
    <group position={position}>
      <mesh position={[0, 2.5, 0]}>
        <cylinderGeometry args={[0.07, 0.1, 5, 8]} />
        <meshStandardMaterial color="#718087" metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh position={[0.62, 4.8, 0]} rotation={[0, 0, -0.24]}>
        <cylinderGeometry args={[0.045, 0.045, 1.45, 8]} />
        <meshStandardMaterial color="#718087" metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh position={[1.12, 4.85, 0]}>
        <boxGeometry args={[0.5, 0.16, 0.34]} />
        <meshStandardMaterial color={night ? '#fff2bd' : '#f6f2df'} emissive="#ffe4a3" emissiveIntensity={night ? 1.5 : 0.05} />
      </mesh>
      <pointLight ref={lightRef} position={[1.1, 4.65, 0]} color="#ffe4a3" intensity={0.12} distance={14} decay={2} />
    </group>
  )
}

function GroundPlane({ mode }) {
  const material = useRef()
  const color = mode === 'night' ? '#394a50' : mode === 'sunset' ? '#d6c7ae' : '#c5d6c2'
  const target = useMemo(() => new Color(color), [color])
  useFrame((_, delta) => {
    if (material.current) material.current.color.lerp(target, 1 - Math.exp(-delta * 1.4))
  })
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.08, 0]} receiveShadow>
      <planeGeometry args={[190, 190]} />
      <meshStandardMaterial ref={material} color="#c5d6c2" roughness={1} />
    </mesh>
  )
}

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh position={[0, 0.8, 0]} castShadow>
        <cylinderGeometry args={[0.13, 0.18, 1.6, 7]} />
        <meshStandardMaterial color="#8b5e3c" roughness={0.9} />
      </mesh>
      <mesh position={[0, 2.15, 0]} castShadow>
        <sphereGeometry args={[1.12, 10, 9]} />
        <meshStandardMaterial color="#5e8c54" roughness={0.9} />
      </mesh>
      <mesh position={[0.48, 2.45, 0.16]}>
        <sphereGeometry args={[0.65, 9, 8]} />
        <meshStandardMaterial color="#71985d" roughness={0.9} />
      </mesh>
    </group>
  )
}

export default function Environment({ mode = 'day' }) {
  const jOff = JUNCTION_SIZE / 2
  return (
    <group>
      <GroundPlane mode={mode} />
      {STORES.map(store => <Storefront key={store.sign} {...store} />)}
      <BusStop />
      <Streetlight position={[jOff + 2, 0, -(jOff + 8)]} mode={mode} />
      <Streetlight position={[-(jOff + 2), 0, jOff + 8]} mode={mode} />
      <Streetlight position={[jOff + 8, 0, jOff + 2]} mode={mode} />
      <Streetlight position={[-(jOff + 8), 0, -(jOff + 2)]} mode={mode} />
      <Tree position={[-(jOff + 7), 0, -(jOff + 4)]} scale={1.05} />
      <Tree position={[jOff + 7, 0, jOff + 4]} scale={0.95} />
      <Tree position={[jOff + 4, 0, -(jOff + 7)]} />
      <Tree position={[-(jOff + 4), 0, jOff + 7]} scale={1.1} />
    </group>
  )
}
