'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { BackSide, MathUtils, type Group } from 'three'
import { BodyModel, preloadBodyModels } from './body-model'
import type { Quality } from './materials'

preloadBodyModels()

// Parada 1 (docs/ARQUITECTURA_MODELO_3D.md, "Recorrido"): busto en 3/4, de
// perfil mirando a la derecha de la pantalla, con la cabeza girando despacio
// hacia el frente y volviendo. Todavía sin scroll.
// La figura mira a +Z; girar en +Y la lleva hacia la derecha de la pantalla
// y deja a la vista su lado derecho, el de la craneoplastía.
const TURN_PROFILE = MathUtils.degToRad(62)
const TURN_FRONT = MathUtils.degToRad(22)
const TURN_PERIOD = 22 // segundos, ida y vuelta
// Altura del centro de la cabeza: el modelo está en metros, con los pies en 0
const HEAD_HEIGHT = 1.56

const QUALITY_STEPS: Quality[] = ['baja', 'media', 'alta']

export type SceneSettings = {
  animate: boolean
  active: boolean
  // Fija la calidad del vidrio; sin valor, se adapta al rendimiento
  quality?: Quality
  boneOpacity: number
  onReady: () => void
  onStats?: (stats: FrameStats) => void
}

export type FrameStats = {
  fps: number
  frameMs: number
  triangles: number
  calls: number
  dpr: number
  quality: Quality
}

function Bust({ animate, quality, boneOpacity }: {
  animate: boolean
  quality: Quality
  boneOpacity: number
}) {
  const ref = useRef<Group>(null)
  const time = useRef(0)

  useFrame((_, delta) => {
    const group = ref.current
    if (!group || !animate) return
    // El tiempo se acumula solo mientras se renderiza: al volver a la
    // pantalla sigue desde donde quedó, sin saltos.
    time.current += Math.min(delta, 0.1)
    const k = (1 - Math.cos((time.current / TURN_PERIOD) * Math.PI * 2)) / 2
    group.rotation.y = MathUtils.lerp(TURN_PROFILE, TURN_FRONT, k)
  })

  return (
    <group ref={ref} rotation={[0, TURN_PROFILE, 0]}>
      <group position={[0, -HEAD_HEIGHT, 0]}>
        <BodyModel quality={quality} boneOpacity={boneOpacity} />
      </group>
    </group>
  )
}

// Avisa cuando el modelo ya se dibujó (dos cuadros: el primero llena el
// buffer del vidrio), para mostrar el canvas sin el salto de la carga.
function ReadySignal({ onReady }: { onReady: () => void }) {
  const frames = useRef(0)
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => invalidate(), [invalidate])
  useFrame(() => {
    frames.current += 1
    if (frames.current === 2) onReady()
    if (frames.current < 2) invalidate()
  })
  return null
}

// Medición para el prototipo (?medir): cuadros por segundo promediados cada
// segundo, más triángulos y llamadas de dibujo del último cuadro.
function StatsProbe({ quality, onStats }: {
  quality: Quality
  onStats: (stats: FrameStats) => void
}) {
  const gl = useThree((state) => state.gl)
  const sample = useRef({ frames: 0, since: 0 })
  useFrame(() => {
    const now = performance.now()
    const w = sample.current
    if (w.since === 0) w.since = now
    w.frames += 1
    if (now - w.since < 1000) return
    const fps = (w.frames * 1000) / (now - w.since)
    onStats({
      fps,
      frameMs: 1000 / fps,
      triangles: gl.info.render.triangles,
      calls: gl.info.render.calls,
      dpr: gl.getPixelRatio(),
      quality,
    })
    w.frames = 0
    w.since = now
  })
  return null
}

export default function BodyScene({
  animate,
  active,
  quality: fixedQuality,
  boneOpacity,
  onReady,
  onStats,
}: SceneSettings) {
  const [autoQuality, setAutoQuality] = useState<Quality>('media')
  const [dpr, setDpr] = useState(1.5)
  const quality = fixedQuality ?? autoQuality

  const step = (direction: 1 | -1) => {
    if (fixedQuality) return
    setAutoQuality((current) => {
      const index = QUALITY_STEPS.indexOf(current) + direction
      return QUALITY_STEPS[MathUtils.clamp(index, 0, QUALITY_STEPS.length - 1)] ?? current
    })
  }

  return (
    <Canvas
      frameloop={!active ? 'never' : animate ? 'always' : 'demand'}
      dpr={dpr}
      camera={{ position: [0, 0.02, 0.92], fov: 30, near: 0.05, far: 10 }}
      gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
    >
      {/* Si no llega a los cuadros, baja primero la resolución y después la
          calidad del vidrio; si sobra, sube. */}
      <PerformanceMonitor
        onDecline={() => {
          if (dpr > 1) setDpr(1)
          else step(-1)
        }}
        onIncline={() => step(1)}
        flipflops={3}
        onFallback={() => {
          setDpr(1)
          if (!fixedQuality) setAutoQuality('baja')
        }}
      />
      <Suspense fallback={null}>
        <Bust animate={animate} quality={quality} boneOpacity={boneOpacity} />
        <ReadySignal onReady={onReady} />
      </Suspense>
      {onStats && <StatsProbe quality={quality} onStats={onStats} />}
      {/* Estudio de luz propio (sin HDRI descargado): paneles blancos y uno
          con el azul de marca para que el titanio y el vidrio lo reflejen.
          El fondo gris es el que refleja el metal entre panel y panel; si
          fuera negro, el titanio se vería negro. */}
      <Environment resolution={256}>
        <mesh scale={50}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshBasicMaterial color="#5f666e" side={BackSide} />
        </mesh>
        <Lightformer form="rect" intensity={3} position={[0, 5, -2]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#9ec5f0" position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#003c6f" position={[0, -1, -6]} scale={4} />
      </Environment>
    </Canvas>
  )
}
