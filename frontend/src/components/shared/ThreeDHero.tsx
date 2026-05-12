import { useRef, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera, useTexture } from '@react-three/drei'
import * as THREE from 'three'

function RotatingPlane() {
  const meshRef = useRef<THREE.Mesh>(null)
  const texture = useTexture('/football-player.jpg')

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.003
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.0005) * 0.3
    }
  })

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <planeGeometry args={[4, 5]} />
      <meshStandardMaterial map={texture} />
    </mesh>
  )
}

function Lights() {
  return (
    <>
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#f97316" />
      <pointLight position={[-10, -10, 10]} intensity={0.8} color="#22c55e" />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
    </>
  )
}

export default function ThreeDHero() {
  return (
    <div className="w-full h-96 rounded-2xl overflow-hidden shadow-2xl border border-orange-500/20">
      <Canvas>
        <PerspectiveCamera makeDefault position={[0, 0, 6]} />
        <Lights />
        <RotatingPlane />
        <OrbitControls 
          enableZoom={false}
          autoRotate
          autoRotateSpeed={2}
          enablePan={false}
        />
        <color attach="background" args={['#080c08']} />
      </Canvas>
    </div>
  )
}
