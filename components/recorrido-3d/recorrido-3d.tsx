'use client'

import dynamic from 'next/dynamic'
import { Component, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { getIntroPhase, INTRO_MAX_WAIT, loadedAtHome, startIntro, useIntroPhase } from '../intro'
import { ANCHO_CELULAR } from './camara'
import { estadoRecorrido } from './estado'

// three.js solo en el navegador y en un bundle aparte. La escena única (el
// hero y el recorrido) se monta apenas el navegador queda libre: es el 3D
// del primer pantallazo.
const EscenaRecorrido = dynamic(() => import('./escena'), { ssr: false })

// Resolución acotada: el vidrio del cuerpo entero llena la pantalla en las
// paradas cercanas. Como el canvas dibuja solo al hacer scroll, no hay
// medición de cuadros que la baje sola (PerformanceMonitor necesita un
// cuadro tras otro): se fija según la pantalla.
const DPR_ESCRITORIO = 1.5
const DPR_CELULAR = 1.5

let soporteWebGL: boolean | undefined
function hayWebGL() {
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
// lugar reservado (las vistas de planificación de cada parada)
class LimiteEscena extends Component<{ children: ReactNode }, { fallo: boolean }> {
  state = { fallo: false }

  static getDerivedStateFromError() {
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

  // Arranque de la entrada de la home (components/intro.ts), mientras no
  // haya pantalla de carga: cuando el 3D está listo (alListo de la escena), o
  // a los INTRO_MAX_WAIT ms si tarda. Enseguida si no hay 3D, si se pide
  // menos movimiento o si se llegó a la home desde otra página.
  useEffect(() => {
    if (getIntroPhase() !== 'waiting') return
    if (
      !loadedAtHome ||
      !hayWebGL() ||
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
      startIntro()
      return
    }
    const id = setTimeout(startIntro, INTRO_MAX_WAIT)
    return () => clearTimeout(id)
  }, [])

  // Giro de entrada del cuerpo en la toma del hero: quieto en la pose de
  // partida mientras la intro espera; si el 3D estuvo listo antes de que
  // arrancara, entra girando; si no, aparece ya en su pose.
  const fase = useIntroPhase()
  const [primero, setPrimero] = useState(false)
  useEffect(() => {
    estadoRecorrido.entrada = fase === 'waiting' ? 'hold' : primero ? 'play' : 'skip'
    estadoRecorrido.invalidar?.()
  }, [fase, primero])

  // Carga diferida: cuando el navegador queda libre (como mucho, 1,5 s)
  useEffect(() => {
    if (!webgl || montar) return
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
            if (getIntroPhase() === 'waiting') {
              setPrimero(true)
              estadoRecorrido.entrada = 'play'
              startIntro()
            }
            alListo()
          }}
        />
      </div>
    </LimiteEscena>
  )
}
