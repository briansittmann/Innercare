'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'
import AnimatedContent from '@/components/animated-content'
import { ajustar, clamp, lerp } from '@/components/animaciones/lienzo'
import {
  DURACION_ENTRADA,
  N_PROCESO_CELULAR,
  N_PROCESO_ESCRITORIO,
  PiezaProceso,
  pasoActivo,
  type Puntero,
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
// Entrada, una vez al llegar (un solo disparo, el de AnimatedContent): el
// título y los tres pasos suben y se aclaran de un desenfoque, de a uno
// (los [data-entra]), mientras la pieza se arma con partículas que llegan
// desde los costados (proceso.ts); al terminar aparece la leyenda. Estado en
// `data-entrada` de la pieza: `espera`, `armando` y `lista`.
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
  // Cuándo arrancó la entrada (performance.now()); null mientras espera. Es
  // un ref para que sobreviva si la ruta se oculta y vuelve: la pieza nueva
  // aparece armada, como el texto.
  const inicioEntrada = useRef<number | null>(null)
  const [entrada, setEntrada] = useState<'espera' | 'armando' | 'lista'>('espera')

  useEffect(() => {
    const root = ref.current
    const cv = lienzo.current
    const g = cv?.getContext('2d')
    if (!root || !cv || !g) return
    const movimiento = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fino = window.matchMedia('(pointer: fine)')
    const pieza = new PiezaProceso(window.innerWidth < 820 ? N_PROCESO_CELULAR : N_PROCESO_ESCRITORIO)
    let medida = ajustar(cv)
    let visible = false
    let cuadro = 0
    let anterior = 0
    let q = 0
    let ultimoPaso = -1
    let armada = false
    // Puntero sobre la pieza (solo mouse o trackpad), en coordenadas de la
    // ventana, con su velocidad suavizada entre eventos. Se pasa al lienzo en
    // cada cuadro: al entrar a la sección con el scroll, el canvas se mueve
    // bajo el mouse quieto sin que llegue ningún pointermove.
    let puntero: (Puntero & { t: number }) | null = null

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
      const dt = anterior ? Math.min(1 / 30, (ahora - anterior) / 1000) : 0
      anterior = ahora
      // Con el puntero quieto, su velocidad se apaga
      if (puntero) {
        const f = Math.exp(-dt * 10)
        puntero.vx *= f
        puntero.vy *= f
      }
      let enLienzo: Puntero | null = null
      if (puntero) {
        const r = cv.getBoundingClientRect()
        const x = puntero.x - r.left
        const y = puntero.y - r.top
        if (x >= 0 && y >= 0 && x <= r.width && y <= r.height)
          enLienzo = { x, y, vx: puntero.vx, vy: puntero.vy }
      }
      const inicio = inicioEntrada.current
      const e = inicio === null ? 0 : clamp((ahora - inicio) / 1000 / DURACION_ENTRADA)
      if (e >= 1 && !armada) {
        armada = true
        setEntrada('lista')
      }
      pieza.dibujar(g, medida.w, medida.h, medida.dpr, q, ahora / 1000, reducido, dt, enLienzo, e)
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
    // Hover: las partículas cerca del puntero se apartan y vuelven a armarse
    // (components/animaciones/proceso.ts). Sin hover con pantalla táctil ni
    // con movimiento reducido.
    const alPuntero = (e: PointerEvent) => {
      if (!visible || !fino.matches || movimiento.matches) return
      const x = e.clientX
      const y = e.clientY
      if (puntero) {
        const dt = Math.max(8, e.timeStamp - puntero.t) / 1000
        puntero.vx = lerp(puntero.vx, (x - puntero.x) / dt, 0.5)
        puntero.vy = lerp(puntero.vy, (y - puntero.y) / dt, 0.5)
        Object.assign(puntero, { x, y, t: e.timeStamp })
      } else puntero = { x, y, vx: 0, vy: 0, t: e.timeStamp }
    }
    // El mouse salió de la ventana
    const alSalir = (e: PointerEvent) => {
      if (!e.relatedTarget) puntero = null
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
    window.addEventListener('pointermove', alPuntero, { passive: true })
    document.addEventListener('pointerout', alSalir)
    return () => {
      observador.disconnect()
      tamano.disconnect()
      window.removeEventListener('scroll', alMover)
      movimiento.removeEventListener('change', alMover)
      window.removeEventListener('pointermove', alPuntero)
      document.removeEventListener('pointerout', alSalir)
      cancelAnimationFrame(cuadro)
    }
  }, [])

  return (
    <div ref={ref} className="relative h-full">
      <AnimatedContent
        targets="[data-entra]"
        stagger={0.12}
        distance={24}
        blur={6}
        // Con la sección casi entera en pantalla: en escritorio la pieza va
        // centrada en la altura y, antes, se armaba debajo del borde
        threshold={0.7}
        onStart={() => {
          inicioEntrada.current ??= performance.now()
          setEntrada((actual) => (actual === 'espera' ? 'armando' : actual))
        }}
        // Sin animación (movimiento reducido, o la ruta que vuelve): armada
        onComplete={() => {
          inicioEntrada.current ??= -Infinity
          if (inicioEntrada.current === -Infinity) setEntrada('lista')
        }}
        className="sticky top-0 mx-auto grid h-dvh max-w-[83.75rem] grid-rows-[auto_1fr] content-start gap-md px-[clamp(1.25rem,5vw,4.5rem)] pt-[5.25rem] pb-[2.5rem] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:grid-rows-1 md:content-center md:items-center md:gap-[clamp(1.5rem,5vw,4.5rem)] md:pt-[6rem]"
      >
        <div>
          {titulo}
          <ol className="mt-[0.875rem] grid gap-xs md:mt-[2.25rem]">
            {pasos.map((paso, i) => {
              const apagado = activo !== null && activo !== i
              // La entrada anima el <li> (opacidad en línea) y el paso
              // apagado se atenúa adentro, para que no se pisen. El título
              // del activo crece y el del que deja de serlo se achica, con
              // el tamaño de letra (no con una escala) para que lo de abajo
              // se corra; el número sigue la línea de base del título.
              return (
                <li
                  key={paso.step}
                  data-entra
                  aria-current={activo === i ? 'step' : undefined}
                  className="border-t border-outline-variant py-[0.625rem] md:py-[0.875rem]"
                >
                  <div
                    className={`grid grid-cols-[2.75rem_1fr] items-baseline gap-x-[0.625rem] gap-y-[0.375rem] transition-opacity duration-300 ${
                      apagado ? 'opacity-45' : ''
                    }`}
                  >
                    <span
                      aria-hidden
                      className="font-data-mono text-[0.9375rem] font-semibold tabular-nums text-hueso"
                    >
                      {paso.step}
                    </span>
                    <h3
                      className={`font-headline-sm leading-snug font-medium tracking-[-0.015em] text-on-surface transition-[font-size] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${
                        activo === i
                          ? 'text-[1.375rem] md:text-[1.75rem]'
                          : 'text-[1.125rem] md:text-[1.3125rem]'
                      }`}
                    >
                      {paso.title}
                    </h3>
                    <p
                      className={`col-start-2 text-[0.9375rem] leading-normal text-on-surface-variant md:block ${
                        apagado ? 'hidden' : ''
                      }`}
                    >
                      {paso.description}
                    </p>
                  </div>
                </li>
              )
            })}
          </ol>
        </div>

        {/* La pieza: canvas sobre el alto fijo de la columna. Sin JS, la
            vista del primer paso (.proceso-respaldo). */}
        <div
          data-pieza-proceso
          data-entrada={entrada}
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
      </AnimatedContent>
    </div>
  )
}
