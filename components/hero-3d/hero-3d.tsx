'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import {
  Component,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import type { FrameStats } from './body-scene'
import type { Quality } from './materials'

// three.js solo existe en el navegador: la escena se carga aparte y sin SSR,
// para que no pese en el HTML ni en el bundle inicial.
const BodyScene = dynamic(() => import('./body-scene'), { ssr: false })

// Imagen fija de la parada 1: se ve mientras carga el 3D, y en su lugar si
// no hay WebGL o si la escena falla. Es una captura del mismo modelo.
const POSTER = '/img/cuerpo-inicio.webp'
const BONE_OPACITY = 0.4

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  )
}

// Se comprueba una sola vez, creando un contexto de prueba
let webglSupport: boolean | undefined
function hasWebGL() {
  if (webglSupport === undefined) {
    try {
      const canvas = document.createElement('canvas')
      webglSupport = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
    } catch {
      webglSupport = false
    }
  }
  return webglSupport
}

const noSubscription = () => () => {}

function useWebGL() {
  return useSyncExternalStore(noSubscription, hasWebGL, () => false)
}

// Si la escena falla (contexto perdido, modelo que no carga), queda la imagen
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

// Parámetros de medición del prototipo, en la URL de la home:
// ?medir muestra cuadros por segundo, triángulos y tiempos de carga;
// ?calidad=alta|media|baja fija el vidrio, y ?hueso=0.3, la opacidad del hueso.
type Tuning = { measure: boolean; quality?: Quality; boneOpacity: number }

function readTuning(): Tuning {
  const params = new URLSearchParams(window.location.search)
  const quality = params.get('calidad')
  const bone = Number(params.get('hueso'))
  return {
    measure: params.has('medir'),
    quality: quality === 'alta' || quality === 'media' || quality === 'baja' ? quality : undefined,
    boneOpacity: bone > 0 && bone <= 1 ? bone : BONE_OPACITY,
  }
}

function modelBytes() {
  const entries = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
  return entries
    .filter((entry) => entry.name.includes('/modelos/'))
    .map((entry) => ({
      name: entry.name.split('/').pop() ?? entry.name,
      transfer: entry.transferSize,
      body: entry.decodedBodySize,
    }))
}

function MeasureOverlay({ stats, readyAt, mountedAt }: {
  stats: FrameStats | null
  readyAt: number | null
  mountedAt: number | null
}) {
  const kb = (bytes: number) => `${Math.round(bytes / 1024)} KB`
  const lines = [
    stats
      ? `${stats.fps.toFixed(0)} fps · ${stats.frameMs.toFixed(1)} ms · vidrio ${stats.quality} · dpr ${stats.dpr}`
      : 'midiendo…',
    stats ? `${stats.triangles.toLocaleString('es-AR')} triángulos · ${stats.calls} llamadas` : '',
    readyAt !== null
      ? `listo a los ${(readyAt / 1000).toFixed(2)} s de la navegación` +
        (mountedAt !== null ? ` (${((readyAt - mountedAt) / 1000).toFixed(2)} s desde el montaje)` : '')
      : 'cargando…',
    ...(readyAt !== null
      ? modelBytes().map((m) => `${m.name}: ${kb(m.transfer)} transferidos, ${kb(m.body)} sin comprimir`)
      : []),
  ].filter(Boolean)

  return (
    <div className="pointer-events-none absolute left-2 top-2 z-20 rounded-md bg-on-surface/85 px-2 py-1 font-data-mono text-[11px] leading-snug text-surface tabular-nums">
      {lines.map((line) => (
        <div key={line}>{line}</div>
      ))}
    </div>
  )
}

export function Hero3D({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  const webgl = useWebGL()
  const [mount, setMount] = useState(false)
  const [ready, setReady] = useState(false)
  // Fuera de pantalla no se renderiza: ahorra GPU y batería.
  const [visible, setVisible] = useState(false)
  const [tuning, setTuning] = useState<Tuning>({ measure: false, boneOpacity: BONE_OPACITY })
  const [stats, setStats] = useState<FrameStats | null>(null)
  const [times, setTimes] = useState<{ mounted: number | null; ready: number | null }>({
    mounted: null,
    ready: null,
  })

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setVisible(entry.isIntersecting)
    })
    observer.observe(node)
    return () => {
      observer.disconnect()
      // Al ocultarse la ruta (Cache Components la conserva con <Activity>),
      // el canvas deja de renderizar.
      setVisible(false)
    }
  }, [])

  // Carga diferida: el 3D se monta cuando el navegador queda libre, después
  // del contenido de la página.
  useEffect(() => {
    if (!webgl) return
    const start = () => {
      setTuning(readTuning())
      setTimes((t) => ({ ...t, mounted: performance.now() }))
      setMount(true)
    }
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(start, { timeout: 1500 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(start, 300)
    return () => clearTimeout(id)
  }, [webgl])

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Busto de vidrio con el cráneo a la vista y una craneoplastía de titanio trabecular en el lado derecho"
      className={`relative ${className}`}
    >
      <Image
        src={POSTER}
        alt=""
        fill
        sizes="(min-width: 768px) 56vw, 100vw"
        className={`object-cover transition-opacity duration-700 ${ready ? 'opacity-0' : 'opacity-100'}`}
      />
      {mount && (
        <SceneBoundary>
          <div
            className={`absolute inset-0 transition-opacity duration-700 ${ready ? 'opacity-100' : 'opacity-0'}`}
          >
            <BodyScene
              animate={!reducedMotion}
              active={visible}
              quality={tuning.quality}
              boneOpacity={tuning.boneOpacity}
              onReady={() => {
                setReady(true)
                setTimes((t) => ({ ...t, ready: t.ready ?? performance.now() }))
              }}
              onStats={tuning.measure ? setStats : undefined}
            />
          </div>
        </SceneBoundary>
      )}
      {tuning.measure && (
        <MeasureOverlay stats={stats} readyAt={times.ready} mountedAt={times.mounted} />
      )}
    </div>
  )
}
