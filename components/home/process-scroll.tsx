'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ajustar, clamp } from '@/components/animaciones/lienzo'
import {
  N_PROCESO_CELULAR,
  N_PROCESO_ESCRITORIO,
  PiezaProceso,
  pasoActivo,
} from '@/components/animaciones/proceso'

// Cómo trabajamos cada caso, con la estructura y el comportamiento del
// borrador de la landing (docs/landing/landing-borrador.html): la sección
// mide 3,4 pantallas y su contenido queda fijo (sticky) mientras se recorre.
// A la izquierda, el título y los tres pasos; el activo se resalta. A la
// derecha, la pieza que se transforma (components/animaciones/proceso.ts)
// con su leyenda. En el celular, la pieza arriba y los pasos abajo, con el
// texto solo del activo.
//
// Una sola fuente: el progreso del scroll de la sección decide el paso
// activo y la forma de la pieza. La pieza se dibuja solo con la sección en
// pantalla (el vaivén es continuo; con movimiento reducido, quieta y sin
// transiciones: cada paso muestra su forma).
//
// Sin JS no hay paso activo: los tres se ven enteros y, en lugar de la
// pieza, la vista del primer paso (`respaldo`, oculta con JS por CSS).
export function ProcessScroll({
  titulo,
  pasos,
  respaldo,
  leyenda,
}: {
  titulo: ReactNode
  pasos: readonly { step: string; title: string; description: string }[]
  respaldo: ReactNode
  leyenda: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const lienzo = useRef<HTMLCanvasElement>(null)
  const [activo, setActivo] = useState<number | null>(null)

  useEffect(() => {
    const root = ref.current
    const cv = lienzo.current
    const g = cv?.getContext('2d')
    if (!root || !cv || !g) return
    const movimiento = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pieza = new PiezaProceso(window.innerWidth < 820 ? N_PROCESO_CELULAR : N_PROCESO_ESCRITORIO)
    let medida = ajustar(cv)
    let visible = false
    let cuadro = 0
    let q = 0
    let ultimoPaso = -1

    const leer = () => {
      const r = root.getBoundingClientRect()
      const recorrido = r.height - window.innerHeight
      q = recorrido > 0 ? clamp(-r.top / recorrido) : 0
      const paso = pasoActivo(q)
      if (paso !== ultimoPaso) {
        ultimoPaso = paso
        setActivo(paso)
      }
    }

    const pintar = (ahora: number) => {
      cuadro = 0
      const reducido = movimiento.matches
      pieza.dibujar(g, medida.w, medida.h, medida.dpr, q, ahora / 1000, reducido)
      // El vaivén sigue mientras la sección se ve
      if (visible && !reducido) cuadro = requestAnimationFrame(pintar)
    }
    const pedir = () => {
      if (!cuadro) cuadro = requestAnimationFrame(pintar)
    }
    const alMover = () => {
      leer()
      if (visible) pedir()
    }

    const observador = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting)
      if (visible) alMover()
    })
    observador.observe(root)
    const tamano = new ResizeObserver(() => {
      medida = ajustar(cv)
      alMover()
    })
    tamano.observe(cv)

    leer()
    window.addEventListener('scroll', alMover, { passive: true })
    movimiento.addEventListener('change', alMover)
    return () => {
      observador.disconnect()
      tamano.disconnect()
      window.removeEventListener('scroll', alMover)
      movimiento.removeEventListener('change', alMover)
      cancelAnimationFrame(cuadro)
    }
  }, [])

  return (
    <div ref={ref} className="relative h-full">
      <div className="sticky top-0 mx-auto grid h-dvh max-w-[83.75rem] grid-rows-[auto_1fr] content-start gap-md px-[clamp(1.25rem,5vw,4.5rem)] pt-[5.25rem] pb-[2.5rem] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:grid-rows-1 md:content-center md:items-center md:gap-[clamp(1.5rem,5vw,4.5rem)] md:pt-[6rem]">
        <div>
          {titulo}
          <ol className="mt-[0.875rem] grid gap-xs md:mt-[2.25rem]">
            {pasos.map((paso, i) => {
              const apagado = activo !== null && activo !== i
              return (
                <li
                  key={paso.step}
                  aria-current={activo === i ? 'step' : undefined}
                  className={`grid grid-cols-[2.75rem_1fr] gap-x-[0.625rem] gap-y-[0.375rem] border-t border-outline-variant py-[0.625rem] transition-opacity duration-300 md:py-[0.875rem] ${
                    apagado ? 'opacity-45' : ''
                  }`}
                >
                  <span
                    aria-hidden
                    className="pt-[3px] font-data-mono text-[0.9375rem] font-semibold tabular-nums text-hueso"
                  >
                    {paso.step}
                  </span>
                  <h3 className="font-headline-sm text-[1.125rem] leading-snug font-medium tracking-[-0.015em] text-on-surface md:text-[1.3125rem]">
                    {paso.title}
                  </h3>
                  <p
                    className={`col-start-2 text-[0.9375rem] leading-normal text-on-surface-variant md:block ${
                      apagado ? 'hidden' : ''
                    }`}
                  >
                    {paso.description}
                  </p>
                </li>
              )
            })}
          </ol>
        </div>

        {/* La pieza: canvas sobre el alto fijo de la columna. Sin JS, la
            vista del primer paso (.proceso-respaldo). */}
        <div
          data-pieza-proceso
          className="relative order-first h-[38vh] md:order-none md:h-[min(74vh,43.75rem)]"
        >
          <div aria-hidden className="proceso-luz absolute inset-0 bottom-[2rem]" />
          <div aria-hidden className="proceso-respaldo absolute inset-0 bottom-[2rem]">
            {respaldo}
          </div>
          <div aria-hidden className="proceso-lienzo absolute inset-0 bottom-[2rem]">
            <canvas ref={lienzo} className="block size-full" />
          </div>
          {leyenda}
        </div>
      </div>
    </div>
  )
}
