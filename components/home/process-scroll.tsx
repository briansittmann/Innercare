'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

// Cómo trabajamos cada caso, con la estructura del borrador de la landing
// (docs/landing/landing-borrador.html): la sección mide 3,4 pantallas y su
// contenido queda fijo (sticky) mientras se recorre. A la izquierda, el
// título y los tres pasos; el activo se resalta. A la derecha, la pieza que
// se transforma (fase 5) con su leyenda; hasta que exista, una vista por paso.
// En el celular, la pieza arriba y los pasos abajo, con el texto solo del
// activo.
//
// Paso activo: cada tercio de la sección tiene un marcador; el que cruza la
// mitad de la pantalla manda (IntersectionObserver, sin escuchar el scroll).
// La fase 5 lo reemplaza por el progreso del scroll que mueve la pieza.
//
// Sin JS (o antes de llegar a la sección) no hay paso activo: los tres se
// ven enteros y la pieza muestra el primero.
export function ProcessScroll({
  titulo,
  pasos,
  vistas,
  leyenda,
}: {
  titulo: ReactNode
  pasos: readonly { step: string; title: string; description: string }[]
  vistas: readonly ReactNode[]
  leyenda: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [activo, setActivo] = useState<number | null>(null)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActivo(Number(entry.target.getAttribute('data-tramo')))
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    for (const tramo of root.querySelectorAll('[data-tramo]')) observer.observe(tramo)
    return () => observer.disconnect()
  }, [])

  const visible = activo ?? 0

  return (
    <div ref={ref} className="relative h-full">
      {pasos.map((paso, i) => (
        <div
          key={paso.step}
          aria-hidden
          data-tramo={i}
          className="absolute left-0 w-px"
          style={{ top: `${(i * 100) / pasos.length}%`, height: `${100 / pasos.length}%` }}
        />
      ))}

      <div className="sticky top-0 mx-auto grid h-dvh max-w-[83.75rem] grid-rows-[auto_1fr] content-start gap-sm px-[clamp(1.25rem,5vw,4.5rem)] pt-[5.25rem] pb-[2.5rem] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:grid-rows-1 md:content-center md:items-center md:gap-[clamp(1.5rem,5vw,4.5rem)] md:pt-[6rem]">
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

        {/* Lugar de la pieza animada (fase 5): alto fijo, para que la
            animación lo reemplace sin mover nada. */}
        <div
          data-pieza-proceso
          className="relative order-first h-[38vh] md:order-none md:h-[min(74vh,43.75rem)]"
        >
          <div aria-hidden className="absolute inset-0 bottom-[2rem]">
            {vistas.map((vista, i) => (
              <div
                key={i}
                data-visible={i === visible || undefined}
                className="escena-vista absolute inset-0 bg-surface"
              >
                {vista}
              </div>
            ))}
          </div>
          {leyenda}
        </div>
      </div>
    </div>
  )
}
