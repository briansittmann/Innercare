'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AnchorLink } from '@/components/anchor-link'

// Armazón del recorrido por el cuerpo (#recorrido). Desde lg hay una escena
// fija (sticky, a toda la pantalla) y las tarjetas pasan por encima, a la
// derecha: es el lugar de la escena 3D de la fase 3 (LANDING_SPEC.md,
// secciones 4 y 5), que hoy muestra la vista de planificación de la parada
// activa. En el celular no hay escena: las tarjetas van una debajo de otra.
//
// Parada activa: la que cruza la mitad de la pantalla (cada hijo marcado con
// data-parada="<índice>"). El observer avisa solo cuando un borde cruza esa
// línea, sin escuchar el scroll. La fase 3 lo reemplaza por el progreso del
// scroll, que además mueve la cámara.
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

  const enCierre = activa >= paradas.length
  // Avance del índice: de la primera parada (0) a la última (1)
  const avance = Math.min(activa, paradas.length - 1) / Math.max(1, paradas.length - 1)

  return (
    <div ref={ref} data-activa={activa} className="relative">
      <div className="sticky top-0 hidden h-dvh overflow-hidden lg:block">
        {/* Lugar de la escena 3D: la mitad izquierda y algo más (el implante
            activo se ancla al 34 % del ancho, según el guion). Las vistas se
            cruzan con un fundido corto al cambiar de parada. */}
        <div
          aria-hidden
          data-escena-3d
          className="absolute inset-y-0 left-0 w-[58%] pb-xl pt-[104px] min-[1100px]:pl-[11rem]"
        >
          <div className="relative size-full">
            {escenas.map((escena, i) => (
              <div
                key={i}
                data-visible={i === activa || undefined}
                className="escena-vista absolute inset-0"
              >
                {escena}
              </div>
            ))}
          </div>
        </div>

        {/* Índice anatómico, desde 1100 px: lleva a cada parada y marca la
            activa sobre un riel que se llena de arriba abajo. */}
        <nav
          aria-label="Implantes del recorrido"
          className={`absolute left-[max(1.5rem,calc((100vw-80rem)/2))] top-1/2 hidden -translate-y-1/2 transition-opacity duration-300 min-[1100px]:block ${
            enCierre ? 'pointer-events-none opacity-0' : ''
          }`}
        >
          <ol
            className="indice-riel relative flex flex-col gap-xs pl-md"
            style={{ '--avance': avance } as CSSProperties}
          >
            {paradas.map((parada, i) => (
              <li key={parada.ancla}>
                <AnchorLink
                  href={`#${parada.ancla}`}
                  aria-current={i === activa ? 'location' : undefined}
                  className="block py-xs text-body-sm text-on-surface-variant transition-colors duration-200 hover:text-primary aria-[current]:font-semibold aria-[current]:text-on-surface"
                >
                  {parada.zona}
                </AnchorLink>
              </li>
            ))}
          </ol>
        </nav>
      </div>

      {/* Las tarjetas pasan por encima de la escena: el contenedor deja pasar
          los clics (al índice) y cada tarjeta los vuelve a tomar. */}
      <div className="pointer-events-none relative lg:-mt-[100dvh]">{children}</div>
    </div>
  )
}
