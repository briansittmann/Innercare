'use client'

import { useEffect, useRef, useState, useSyncExternalStore } from 'react'
import GhostFibers from '@/components/ghost-fibers'

// Fondo del cierre de contacto (components/contact-cta.tsx): la cinta de
// fibras del hero, ahora en blanco sobre el azul de la marca, para que la
// página cierre con la misma pieza con la que abre. Es GhostFibers, el mismo
// componente del hero: sin código ni dependencias nuevas.
//
// Rendimiento (AJUSTES.md, "Diseño"): el contexto WebGL se crea recién
// cuando el bloque está a media pantalla de entrar (antes no existe), la
// cinta solo dibuja mientras se ve (GhostFibers se detiene fuera de
// pantalla) y en ese tramo de la página ni el hero ni el recorrido 3D están
// a la vista. Su entrada corre cuando el bloque aparece, porque la intro de
// GhostFibers solo avanza mientras se ve. Con movimiento reducido, un cuadro
// fijo. Sin WebGL2, queda la luz de .cta-luz.
//
// La cinta va por detrás del tramo libre del bloque: en escritorio, entre el
// título y el logo, y se desvanece hacia la izquierda para no cruzar el
// texto; en el celular, abajo a la derecha, al costado del botón.
// Las ubicaciones se eligieron con capturas (docs/landing/BITACORA.md, fase 6).

const ESCRITORIO = '(min-width: 48rem)'

const suscribir = (aviso: () => void) => {
  const consulta = window.matchMedia(ESCRITORIO)
  consulta.addEventListener('change', aviso)
  return () => consulta.removeEventListener('change', aviso)
}

// [desplazamiento, profundidad, pendiente, fase] de la cinta (GhostFibers)
const AJUSTES = {
  escritorio: {
    rotation: -30,
    placements: [[0.5, 0, 0, 0]],
    dpr: 1.5,
    mascara: 'linear-gradient(to right, transparent 45%, #000 75%)',
  },
  celular: {
    rotation: -40,
    placements: [[-1.2, 0, 0, 0]],
    dpr: 1,
    mascara: 'linear-gradient(to bottom, transparent 55%, #000 75%)',
  },
} as const

export function FondoContacto() {
  const caja = useRef<HTMLDivElement>(null)
  const [cerca, setCerca] = useState(false)
  // null en el servidor: las fibras se montan solo en el cliente
  const escritorio = useSyncExternalStore(
    suscribir,
    () => window.matchMedia(ESCRITORIO).matches,
    () => null,
  )

  useEffect(() => {
    const nodo = caja.current
    if (!nodo) return
    const observador = new IntersectionObserver(
      ([entrada]) => {
        if (!entrada?.isIntersecting) return
        setCerca(true)
        observador.disconnect()
      },
      { rootMargin: '50% 0px' },
    )
    observador.observe(nodo)
    return () => observador.disconnect()
  }, [])

  const ajuste = escritorio ? AJUSTES.escritorio : AJUSTES.celular

  return (
    <div
      ref={caja}
      className="absolute inset-0"
      style={{ maskImage: ajuste.mascara, WebkitMaskImage: ajuste.mascara }}
    >
      {cerca && escritorio !== null && (
        <GhostFibers
          key={escritorio ? 'escritorio' : 'celular'}
          glowColor="#a4c9ff"
          secondaryColor="#2260a1"
          lineColor="#ffffff"
          rotation={ajuste.rotation}
          placements={ajuste.placements.map((p) => [...p])}
          fiberStyle="strands"
          threads={64}
          layers={1}
          depthOfField={0.45}
          brightness={0.5}
          particles={0}
          dpr={ajuste.dpr}
        />
      )}
    </div>
  )
}
