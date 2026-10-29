'use client'

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, PerformanceMonitor } from '@react-three/drei'
import {
  BackSide,
  CanvasTexture,
  MathUtils,
  SRGBColorSpace,
  type Group,
  type PerspectiveCamera,
  type Texture,
} from 'three'
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

// Fondo del hero: degradé vertical de azules de la marca, el mismo que
// --color-stage-from y --color-stage-to en globals.css. Lo pinta el CSS de la
// sección y el canvas es transparente; la escena lo dibuja solo en el buffer
// del vidrio, para que refracte lo que se ve alrededor.
const STAGE_FROM = '#e6eef8'
const STAGE_TO = '#c3d7ee'

// Resolución: arranca en la de la pantalla, hasta 1,5x (a 2x, una pantalla
// retina de escritorio baja a menos de 20 cuadros), y si hace falta baja
// hasta 1x. El buffer del vidrio tiene antialiasing: a menos resolución la
// malla se ve más blanda, pero no dentada.
const MAX_DPR = 1.5
const MIN_DPR = 1

// Dónde queda el canvas dentro del hero: el tramo vertical del degradé que
// tiene detrás (0 arriba, 1 abajo) y la fracción del ancho donde va el centro
// de la figura. Lo mide hero-3d.tsx.
export type Framing = {
  stage: readonly [top: number, bottom: number]
  focusX: number
}

export type SceneSettings = {
  animate: boolean
  active: boolean
  framing: Framing
  // Dibuja el tramo del degradé también en el canvas (?fondo), para comprobar
  // que coincide con el del CSS
  showStage: boolean
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

function Bust({ animate, quality, boneOpacity, stage }: {
  animate: boolean
  quality: Quality
  boneOpacity: number
  stage: Texture
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
        <BodyModel quality={quality} boneOpacity={boneOpacity} stage={stage} />
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

// El tramo del degradé que queda detrás del canvas, en una textura de
// 2 × 512 px que three estira a todo el canvas. Se dibuja el degradé de la
// sección entera, corrido y estirado para que la textura muestre solo ese
// tramo: los colores salen iguales que en el CSS, sin calcular mezclas. El
// canvas 2D interpola en sRGB, igual que linear-gradient.
function useStageTexture([top, bottom]: Framing['stage']) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 512
    const context = canvas.getContext('2d')
    if (context) {
      const span = bottom - top
      const gradient = context.createLinearGradient(
        0,
        (-top / span) * canvas.height,
        0,
        ((1 - top) / span) * canvas.height,
      )
      gradient.addColorStop(0, STAGE_FROM)
      gradient.addColorStop(1, STAGE_TO)
      context.fillStyle = gradient
      context.fillRect(0, 0, canvas.width, canvas.height)
    }
    const map = new CanvasTexture(canvas)
    map.colorSpace = SRGBColorSpace
    return map
  }, [top, bottom])

  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    invalidate()
    return () => texture.dispose()
  }, [texture, invalidate])
  return texture
}

// La cámara apunta al centro de la figura. Para ponerla en focusX del ancho,
// el canvas se trata como un recorte de una vista más ancha centrada en ella:
// la figura se corre sin cambiar la perspectiva, como al recortar una foto.
// `manual` evita que R3F pise el aspecto al redimensionar.
function CameraFraming({ focusX }: { focusX: number }) {
  const get = useThree((state) => state.get)
  const width = useThree((state) => state.size.width)
  const height = useThree((state) => state.size.height)
  useLayoutEffect(() => {
    if (width === 0 || height === 0) return
    const { camera, invalidate } = get()
    const perspective = camera as PerspectiveCamera & { manual?: boolean }
    const fullWidth = width + 2 * Math.abs(focusX - 0.5) * width
    perspective.manual = true
    perspective.setViewOffset(fullWidth, height, fullWidth / 2 - focusX * width, 0, width, height)
    invalidate()
  }, [get, width, height, focusX])
  return null
}

// Todo lo que va dentro del canvas y depende del encuadre
function Scene({ framing, showStage, animate, quality, boneOpacity, onReady }: {
  framing: Framing
  showStage: boolean
  animate: boolean
  quality: Quality
  boneOpacity: number
  onReady: () => void
}) {
  const stage = useStageTexture(framing.stage)
  return (
    <>
      <CameraFraming focusX={framing.focusX} />
      {showStage && <primitive attach="background" object={stage} />}
      <Suspense fallback={null}>
        <Bust animate={animate} quality={quality} boneOpacity={boneOpacity} stage={stage} />
        <ReadySignal onReady={onReady} />
      </Suspense>
    </>
  )
}

export default function BodyScene({
  animate,
  active,
  framing,
  showStage,
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
      // Transparente: el fondo es el degradé CSS de la sección
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <PerformanceMonitor onDecline={decline} />
      <Scene
        framing={framing}
        showStage={showStage}
        animate={animate}
        quality={quality}
        boneOpacity={boneOpacity}
        onReady={onReady}
      />
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
