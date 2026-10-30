'use client'

import dynamic from 'next/dynamic'
import { Component, useEffect, useState, useSyncExternalStore, type ReactNode } from 'react'
import { ANCHO_CELULAR } from './camara'

// three.js solo en el navegador y en un bundle aparte: la escena se carga
// cuando el recorrido está por entrar en pantalla.
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
      soporteWebGL = Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'))
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

// Monta el canvas del recorrido. `cerca`: el recorrido está a menos de una
// pantalla (se carga); `enVista`: se ve (se dibuja). Avisa con `alListo`
// cuando el cuerpo ya está en pantalla, para quitar el lugar reservado.
export function Recorrido3D({
  cerca,
  enVista,
  alListo,
}: {
  cerca: boolean
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

  // Carga diferida: cuando el recorrido se acerca y el navegador queda libre
  useEffect(() => {
    if (!webgl || !cerca || montar) return
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setMontar(true), { timeout: 1200 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(() => setMontar(true), 200)
    return () => clearTimeout(id)
  }, [webgl, cerca, montar])

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
            alListo()
          }}
        />
      </div>
    </LimiteEscena>
  )
}
