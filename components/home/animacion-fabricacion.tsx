'use client'

import { ArrowCounterClockwiseIcon } from '@phosphor-icons/react/ssr'
import { useEffect, useRef, type ReactNode } from 'react'
import { DURACION_FAB, AnimacionFabricacion as Animacion, type ModoFabricacion } from '@/components/animaciones/fabricacion'
import { ajustar, clamp } from '@/components/animaciones/lienzo'

// Animación de una tarjeta de fabricación (borrador de la landing): arranca
// una sola vez, cuando la tarjeta entra al 45 % en pantalla y la imagen de la
// pieza terminada ya cargó, dura 3,8 s y tiene "Volver a ver". Fuera de
// pantalla no dibuja, y al terminar se detiene (el último cuadro queda
// quieto). Con movimiento reducido muestra directamente el estado final (la
// pieza), sin el botón.
//
// La pieza (`pieza`, un render con fondo transparente: public/img/
// fabricacion/) se pide al montar, con prioridad baja; la animación saca de
// su alfa la silueta a tallar o imprimir. Si no carga, queda la foto de
// planta (`data-sin-pieza`).
//
// Sin JS se ve `respaldo` (la foto de planta): el CSS oculta la foto y
// muestra el canvas solo con `scripting: enabled` (.fab-respaldo, .fab-lienzo).
export function AnimacionFabricacion({
  modo,
  pieza,
  etiquetaVolver,
  respaldo,
  children,
}: {
  modo: ModoFabricacion
  pieza: string
  // Texto del botón que repite la animación
  etiquetaVolver: string
  respaldo: ReactNode
  // Título y texto de la tarjeta, entre la animación y el botón
  children: ReactNode
}) {
  const tarjeta = useRef<HTMLDivElement>(null)
  const escena = useRef<HTMLDivElement>(null)
  const lienzo = useRef<HTMLCanvasElement>(null)
  const reproducir = useRef<() => void>(() => {})

  useEffect(() => {
    const nodo = tarjeta.current
    const cv = lienzo.current
    const g = cv?.getContext('2d')
    if (!nodo || !cv || !g) return
    const movimiento = window.matchMedia('(prefers-reduced-motion: reduce)')
    let animacion: Animacion | null = null
    let inicio = 0
    // La tarjeta ya llegó al 45 % pero la imagen todavía no estaba
    let pendiente = false
    let visible = false
    let cuadro = 0
    let medida = ajustar(cv)

    const pintar = (ahora: number) => {
      cuadro = 0
      if (!animacion) return
      const t = movimiento.matches ? 1 : inicio ? clamp((ahora - inicio) / DURACION_FAB) : 0
      animacion.dibujar(g, medida.w, medida.h, medida.dpr, t)
      // Sigue mientras dura y la tarjeta se ve
      if (visible && inicio && t < 1) cuadro = requestAnimationFrame(pintar)
    }
    const pedir = () => {
      if (!cuadro) cuadro = requestAnimationFrame(pintar)
    }
    const arrancar = () => {
      if (!animacion) {
        pendiente = true
        return
      }
      inicio = performance.now()
      pedir()
    }

    const imagen = new Image()
    imagen.decoding = 'async'
    imagen.fetchPriority = 'low'
    imagen.src = pieza
    let cancelado = false
    imagen
      .decode()
      .then(() => {
        if (cancelado) return
        animacion = new Animacion(modo, imagen)
        if (pendiente) arrancar()
        else pedir()
      })
      .catch(() => {
        if (!cancelado) escena.current?.setAttribute('data-sin-pieza', '')
      })

    const observador = new IntersectionObserver(
      ([e]) => {
        if (!e) return
        visible = e.isIntersecting
        if (e.intersectionRatio >= 0.45 && !inicio && !pendiente) arrancar()
        if (visible) pedir()
      },
      { threshold: [0, 0.45] },
    )
    observador.observe(nodo)

    const tamano = new ResizeObserver(() => {
      medida = ajustar(cv)
      pedir()
    })
    tamano.observe(cv)

    reproducir.current = arrancar
    movimiento.addEventListener('change', pedir)
    pedir()

    return () => {
      cancelado = true
      observador.disconnect()
      tamano.disconnect()
      movimiento.removeEventListener('change', pedir)
      cancelAnimationFrame(cuadro)
      reproducir.current = () => {}
    }
  }, [modo, pieza])

  return (
    // Columna de alto completo: con textos de distinto largo, "Volver a ver"
    // queda a la misma altura en las dos tarjetas.
    <div ref={tarjeta} className="flex h-full flex-col">
      <div ref={escena} className="fab-escena relative aspect-[4/3] overflow-hidden rounded-xl">
        <div className="fab-respaldo absolute inset-0">{respaldo}</div>
        <canvas ref={lienzo} aria-hidden className="fab-lienzo absolute inset-0 size-full" />
      </div>
      <div className="flex flex-1 flex-col items-start px-sm pt-[1.125rem]">
        <div className="flex-1">{children}</div>
        <button
          type="button"
          onClick={() => reproducir.current()}
          className="boton boton-claro mt-[1.125rem] motion-reduce:hidden"
        >
          <ArrowCounterClockwiseIcon aria-hidden size={20} />
          {etiquetaVolver}
        </button>
      </div>
    </div>
  )
}
