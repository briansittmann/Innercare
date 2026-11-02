'use client'

import dynamic from 'next/dynamic'
import { Component, useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from 'react'
import { completar, estaCompleta, fallar } from '../carga'
import { useIntroPhase } from '../intro'
import { ANCHO_CELULAR } from './camara'
import { estadoRecorrido } from './estado'

// three.js solo en el navegador y en un bundle aparte. La escena única (el
// hero y el recorrido) se monta de inmediato mientras la pantalla de carga
// (components/pantalla-carga.tsx) espera por ella; si ya está todo cargado
// (se vuelve a la home), apenas el navegador queda libre.
const EscenaRecorrido = dynamic(() => import('./escena'), { ssr: false })

// Resolución acotada: el vidrio del cuerpo entero llena la pantalla en las
// paradas cercanas. Como el canvas dibuja solo al hacer scroll, no hay
// medición de cuadros que la baje sola (PerformanceMonitor necesita un
// cuadro tras otro): se fija según la pantalla.
const DPR_ESCRITORIO = 1.5
const DPR_CELULAR = 1.5

let soporteWebGL: boolean | undefined
export function hayWebGL() {
  if (typeof document === 'undefined') return false
  if (soporteWebGL === undefined) {
    try {
      const canvas = document.createElement('canvas')
      const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl')
      soporteWebGL = Boolean(gl)
      // La prueba no queda como un contexto vivo más
      gl?.getExtension('WEBGL_lose_context')?.loseContext()
    } catch {
      soporteWebGL = false
    }
  }
  return soporteWebGL
}

const sinSuscripcion = () => () => {}

// Si la escena falla (contexto perdido, modelo que no carga), queda el
// lugar reservado (las vistas de planificación de cada parada) y la pantalla
// de carga se va igual
class LimiteEscena extends Component<{ children: ReactNode }, { fallo: boolean }> {
  state = { fallo: false }

  static getDerivedStateFromError() {
    fallar()
    return { fallo: true }
  }

  render() {
    return this.state.fallo ? null : this.props.children
  }
}

// Monta el canvas de la escena única. `enVista`: la sección se ve (se
// dibuja). Avisa con `alListo` cuando el cuerpo ya está en pantalla, para
// quitar el lugar reservado.
export function Recorrido3D({
  enVista,
  alListo,
}: {
  enVista: boolean
  alListo: () => void
}) {
  const webgl = useSyncExternalStore(sinSuscripcion, hayWebGL, () => false)
  const [montar, setMontar] = useState(false)
  const [listo, setListo] = useState(false)
  const [config] = useState(() =>
    typeof window === 'undefined'
      ? { dpr: 1, calidad: 'media' as const }
      : {
          dpr: Math.min(
            window.devicePixelRatio || 1,
            window.innerWidth < ANCHO_CELULAR ? DPR_CELULAR : DPR_ESCRITORIO,
          ),
          // En el celular, menos muestras de refracción (se ve igual)
          calidad: window.innerWidth < ANCHO_CELULAR ? ('baja' as const) : ('media' as const),
        },
  )

  // Sin WebGL no hay nada que cargar: la pantalla de carga se va enseguida
  useEffect(() => {
    if (!hayWebGL()) fallar()
  }, [])

  // Giro de entrada del cuerpo en la toma del hero: quieto en la pose de
  // partida mientras la pantalla de carga espera (la intro, en `waiting`);
  // entra girando si la intro corre (startIntro), y aparece ya en su pose si
  // se saltó (skipIntro: la página se cargó lejos del hero). Una vez que
  // giró, sigue en `play` cuando la intro termina.
  const fase = useIntroPhase()
  const giro = useRef(false)
  useEffect(() => {
    if (fase === 'running') giro.current = true
    estadoRecorrido.entrada = fase === 'waiting' ? 'hold' : giro.current ? 'play' : 'skip'
    estadoRecorrido.invalidar?.()
  }, [fase])

  // Montaje: de inmediato mientras la pantalla de carga espera por los
  // modelos; si ya están (se vuelve a la home), cuando el navegador queda
  // libre (como mucho, 1,5 s)
  useEffect(() => {
    if (!webgl || montar) return
    if (!estaCompleta()) {
      const id = setTimeout(() => setMontar(true), 0)
      return () => clearTimeout(id)
    }
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setMontar(true), { timeout: 1500 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(() => setMontar(true), 300)
    return () => clearTimeout(id)
  }, [webgl, montar])

  if (!montar) return null

  return (
    <LimiteEscena>
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${listo ? 'opacity-100' : 'opacity-0'}`}
      >
        <EscenaRecorrido
          activa={enVista}
          calidad={config.calidad}
          dpr={config.dpr}
          alListo={() => {
            setListo(true)
            completar('cuadro')
            alListo()
          }}
        />
      </div>
    </LimiteEscena>
  )
}
