'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AnchorLink } from '@/components/anchor-link'

// Armazón del recorrido por el cuerpo (#recorrido), con la composición del
// borrador (docs/landing/landing-borrador.html): una escena fija (sticky) a
// toda la pantalla, con la luz azul hacia la derecha; a la izquierda, el
// índice anatómico (desde 1100 px); las tarjetas pasan por encima, a la
// derecha (en el celular, abajo, como hoja inferior). La escena es el lugar
// del 3D de la fase 3 (LANDING_SPEC.md, secciones 4 y 5); hoy muestra la
// vista de la parada activa (`escenas`, una por parada más la del cierre).
//
// Parada activa: la que cruza la mitad de la pantalla (cada hijo marcado con
// data-parada="<índice>"). El observer avisa solo cuando un borde cruza esa
// línea, sin escuchar el scroll. La fase 3 lo reemplaza por el progreso del
// scroll, que además mueve la cámara y funde las tarjetas.
//
// Sin JS: la escena queda en la primera parada y todas las tarjetas se leen.
export function TourScroll({
  paradas,
  escenas,
  children,
}: {
  // Índice anatómico: id del ancla de cada parada y su nombre
  paradas: readonly { ancla: string; zona: string }[]
  // Una vista por parada, más la del cierre al final
  escenas: readonly ReactNode[]
  children: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [activa, setActiva] = useState(0)

  useEffect(() => {
    const root = ref.current
    if (!root) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActiva(Number(entry.target.getAttribute('data-parada')))
        }
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    for (const item of root.querySelectorAll('[data-parada]')) observer.observe(item)
    return () => observer.disconnect()
  }, [])

  // El índice se ve entre la primera y la última parada (no en el cierre)
  const enCierre = activa >= paradas.length
  // Avance del riel del índice: de la primera parada (0) a la última (1)
  const avance = Math.min(activa, paradas.length - 1) / Math.max(1, paradas.length - 1)

  return (
    <div ref={ref} data-activa={activa} className="relative">
      <div data-escena-3d className="escenario sticky top-0 h-dvh overflow-hidden">
        <div aria-hidden className="absolute inset-0">
          {escenas.map((escena, i) => (
            <div
              key={i}
              data-visible={i === activa || undefined}
              className="escena-vista escenario absolute inset-0"
            >
              {escena}
            </div>
          ))}
        </div>

        <nav
          aria-label="Implantes del recorrido"
          className={`absolute top-1/2 left-[clamp(1.25rem,3vw,2.5rem)] hidden -translate-y-1/2 transition-opacity duration-300 min-[1100px]:block ${
            enCierre ? 'pointer-events-none invisible opacity-0' : ''
          }`}
        >
          <ol
            className="indice-riel relative flex flex-col gap-[2px]"
            style={{ '--avance': avance } as CSSProperties}
          >
            {paradas.map((parada, i) => (
              <li key={parada.ancla}>
                <AnchorLink
                  href={`#${parada.ancla}`}
                  aria-current={i === activa ? 'location' : undefined}
                  className="block px-[0.875rem] py-[0.375rem] text-body-sm text-on-surface-variant transition-colors duration-200 hover:text-primary aria-[current]:font-semibold aria-[current]:text-on-surface"
                >
                  {parada.zona}
                </AnchorLink>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Las tarjetas pasan sobre la escena: el contenedor deja pasar los
          clics (al índice) y cada tarjeta los vuelve a tomar. */}
      <div className="pointer-events-none relative -mt-[100dvh]">{children}</div>
    </div>
  )
}
