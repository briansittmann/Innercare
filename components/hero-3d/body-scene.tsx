'use client'

import { Suspense, useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import { BackSide, CanvasTexture, MathUtils, SRGBColorSpace, type Group } from 'three'
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

// Fondo del panel: degradé de azules de la marca, el mismo que
// --color-stage-from y --color-stage-to en globals.css. Lo dibuja la escena
// (no el CSS) para que el vidrio refracte exactamente lo que se ve alrededor.
const STAGE_FROM = '#e6eef8'
const STAGE_TO = '#c3d7ee'

// Resolución: arranca en la de la pantalla, hasta 1,5x (a 2x, una pantalla
// retina de escritorio baja a menos de 20 cuadros), y si hace falta baja
// hasta 1x. El buffer del vidrio tiene antialiasing: a menos resolución la
// malla se ve más blanda, pero no dentada.
const MAX_DPR = 1.5
const MIN_DPR = 1

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

function StageBackground() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 256
    const context = canvas.getContext('2d')
    if (context) {
      const gradient = context.createLinearGradient(0, 0, 0, canvas.height)
      gradient.addColorStop(0, STAGE_FROM)
      gradient.addColorStop(1, STAGE_TO)
      context.fillStyle = gradient
      context.fillRect(0, 0, canvas.width, canvas.height)
    }
    const map = new CanvasTexture(canvas)
    map.colorSpace = SRGBColorSpace
    return map
  }, [])
  useEffect(() => () => texture.dispose(), [texture])
  return <primitive attach="background" object={texture} />
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
  const [dpr, setDpr] = useState(() =>
    MathUtils.clamp(window.devicePixelRatio, MIN_DPR, MAX_DPR),
  )
  const quality = fixedQuality ?? autoQuality

  // Solo baja, de a un paso, y no vuelve a subir: subir y bajar a mitad del
  // giro se nota. Primero la resolución y, al final, las muestras de la
  // refracción. Con ?calidad no se ajusta nada, para medir.
  const decline = () => {
    if (fixedQuality) return
    if (dpr > MIN_DPR) setDpr(Math.max(MIN_DPR, dpr - 0.25))
    else setAutoQuality('baja')
  }

  return (
    <Canvas
      frameloop={!active ? 'never' : animate ? 'always' : 'demand'}
      dpr={dpr}
      camera={{ position: [0, 0.02, 0.92], fov: 30, near: 0.05, far: 10 }}
      gl={{ antialias: true, powerPreference: 'high-performance' }}
    >
      <StageBackground />
      <PerformanceMonitor onDecline={decline} />
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
        {/* Contraluz: el brillo blanco en el borde del vidrio */}
        <Lightformer form="rect" intensity={4} position={[-2, 2, -5]} scale={[3, 6, 1]} />
      </Environment>
    </Canvas>
  )
}
