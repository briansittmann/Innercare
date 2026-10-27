'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import {
  ContactShadows,
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
} from '@react-three/drei'
import { Color, Group, LatheGeometry, MathUtils, Vector2 } from 'three'

// Escena provisional del hero: endoprótesis modular de fémur en titanio
// saliendo de un fémur distal translúcido. Geometría hecha con primitivas;
// cuando haya CAD/STL real de la pieza, se reemplaza el modelo y se conserva
// el resto (luces, materiales, movimiento).

// Perfil del fémur distal (radio, altura), girado alrededor del eje Y.
// Arriba termina plano: es el plano de resección donde apoya el implante.
const BONE_PROFILE: [number, number][] = [
  [0, 0.55],
  [0.31, 0.55],
  [0.32, 0.5],
  [0.31, 0],
  [0.3, -0.6],
  [0.31, -1.1],
  [0.36, -1.45],
  [0.48, -1.75],
  [0.6, -1.98],
  [0.62, -2.08],
  [0.55, -2.2],
  [0.35, -2.27],
  [0, -2.29],
]

const NECK_ANGLE = MathUtils.degToRad(45) // ángulo cérvico-diafisario de 135°
const NECK_LENGTH = 0.55
const NECK_START: [number, number] = [0, 1.15]
const NECK_END: [number, number] = [
  NECK_START[0] - Math.sin(NECK_ANGLE) * NECK_LENGTH,
  NECK_START[1] + Math.cos(NECK_ANGLE) * NECK_LENGTH,
]

function Titanium() {
  return <meshStandardMaterial color="#b8c0c8" metalness={1} roughness={0.26} />
}

function Implant() {
  return (
    <group>
      {/* Vástago cementado, dentro del canal medular */}
      <mesh position={[0, -0.325, 0]}>
        <cylinderGeometry args={[0.13, 0.08, 1.75, 48]} />
        <Titanium />
      </mesh>
      <mesh position={[0, -1.2, 0]}>
        <sphereGeometry args={[0.08, 32, 16]} />
        <Titanium />
      </mesh>

      {/* Cuerpo principal modular, sobre el plano de resección */}
      <mesh position={[0, 0.9, 0]}>
        <cylinderGeometry args={[0.33, 0.33, 0.7, 64]} />
        <Titanium />
      </mesh>
      {/* Junta entre módulos */}
      <mesh position={[0, 0.72, 0]}>
        <cylinderGeometry args={[0.315, 0.315, 0.03, 64]} />
        <meshStandardMaterial color="#6f7a85" metalness={1} roughness={0.4} />
      </mesh>

      {/* Cuello a 135° y cabeza cerámica */}
      <mesh
        position={[(NECK_START[0] + NECK_END[0]) / 2, (NECK_START[1] + NECK_END[1]) / 2, 0]}
        rotation={[0, 0, NECK_ANGLE]}
      >
        <cylinderGeometry args={[0.12, 0.16, NECK_LENGTH, 48]} />
        <Titanium />
      </mesh>
      <mesh position={[NECK_END[0] - 0.1, NECK_END[1] + 0.1, 0]}>
        <sphereGeometry args={[0.3, 64, 32]} />
        <meshPhysicalMaterial color="#f3f1ec" roughness={0.12} clearcoat={1} clearcoatRoughness={0.08} />
      </mesh>
    </group>
  )
}

// El canvas es transparente: el vidrio necesita saber qué hay "detrás" para
// refractarlo. Le damos el color de fondo de la página (--color-surface).
const PAGE_BACKGROUND = new Color('#f5f7f9')

function Bone() {
  const geometry = useMemo(
    () => new LatheGeometry(BONE_PROFILE.map(([r, y]) => new Vector2(r, y)), 96),
    [],
  )
  return (
    <mesh geometry={geometry} scale={[1.12, 1, 0.92]}>
      <MeshTransmissionMaterial
        backside
        samples={6}
        resolution={512}
        thickness={0.6}
        roughness={0.14}
        ior={1.3}
        chromaticAberration={0.04}
        anisotropicBlur={0.2}
        color="#dfeaf5"
        background={PAGE_BACKGROUND}
      />
    </mesh>
  )
}

function Model({ animate }: { animate: boolean }) {
  const ref = useRef<Group>(null)

  useFrame((state, delta) => {
    const group = ref.current
    if (!group || !animate) return
    // Giro lento y continuo, más una inclinación leve hacia el puntero.
    group.rotation.y += delta * 0.25
    group.rotation.x = MathUtils.damp(group.rotation.x, state.pointer.y * 0.12, 3, delta)
    group.rotation.z = MathUtils.damp(group.rotation.z, -0.14 - state.pointer.x * 0.08, 3, delta)
  })

  return (
    <group ref={ref} position={[0, 0.05, 0]} rotation={[0, -0.6, -0.14]}>
      <Bone />
      <Implant />
    </group>
  )
}

export default function ImplantScene({
  animate,
  active,
}: {
  animate: boolean
  active: boolean
}) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 10], fov: 30 }}
      gl={{ alpha: true, antialias: true }}
    >
      <ambientLight intensity={0.35} />
      <Model animate={animate} />
      <ContactShadows position={[0, -2.35, 0]} opacity={0.22} scale={6} blur={2.6} far={3} color="#0d1b2a" />
      {/* Estudio de luz propio (sin HDRI descargado): paneles blancos y uno
          con el azul de marca para que el titanio lo refleje. */}
      <Environment resolution={256}>
        <Lightformer form="rect" intensity={3} position={[0, 5, -2]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#9ec5f0" position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#003c6f" position={[0, -1, -6]} scale={4} />
      </Environment>
    </Canvas>
  )
}
