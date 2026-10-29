'use client'

import { useEffect, useState } from 'react'
import { NavGlass } from '../nav-glass'

export type SectionIndexItem = { id: string; label: string }

// Índice lateral de la home: marca la sección visible y lleva a cada una.
// Son enlaces #id normales (el scroll suave y el hueco del header salen de
// globals.css), así que también funcionan con teclado y sin JS. Solo en
// pantallas anchas: en móvil no hay margen libre y el scroll ya es natural.
export function SectionIndex({ items }: { items: readonly SectionIndexItem[] }) {
  const [active, setActive] = useState(items[0]?.id)

  useEffect(() => {
    const sections = items.flatMap((item) => {
      const section = document.getElementById(item.id)
      return section ? [section] : []
    })
    // Activa la última sección cuyo inicio ya pasó la mitad de la pantalla.
    // Así, con el footer a la vista, sigue marcada la última sección.
    const update = () => {
      const middle = window.innerHeight / 2
      const current = sections.findLast((section) => section.getBoundingClientRect().top <= middle)
      setActive((current ?? sections[0])?.id)
    }
    // El observer solo avisa cuando el borde de una sección cruza la mitad
    // de la pantalla: sin escuchar el scroll en cada fotograma.
    const observer = new IntersectionObserver(update, { rootMargin: '-50% 0px -50% 0px' })
    for (const section of sections) observer.observe(section)
    return () => observer.disconnect()
  }, [items])

  return (
    <nav
      aria-label="Secciones de la página"
      className="fixed right-4 top-1/2 z-30 hidden -translate-y-1/2 lg:block"
    >
      {/* El vidrio va detrás como capa propia: GlassSurface recorta su
          contenido (overflow hidden) y cortaría los nombres que asoman a la
          izquierda. */}
      <div aria-hidden className="absolute inset-0">
        <NavGlass width="100%" height="100%" borderRadius={20} />
      </div>
      <ol className="relative flex flex-col gap-xs px-1.5 py-2">
        {items.map((item) => {
          const current = item.id === active
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={current ? 'true' : undefined}
                className="group relative flex h-6 w-7 items-center justify-center rounded-full outline-none focus-visible:outline-solid focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              >
                {/* Marca: corta en reposo, larga y de marca en la sección actual. */}
                <span
                  aria-hidden
                  className="h-0.5 w-4 rounded-full bg-outline transition-[scale,background-color] duration-[160ms] ease-out scale-x-50 group-hover:scale-x-100 group-hover:bg-on-surface group-focus-visible:scale-x-100 group-aria-[current=true]:scale-x-100 group-aria-[current=true]:bg-primary"
                />
                {/* Nombre: lo leen siempre los lectores de pantalla; a la
                    vista aparece con el puntero o el foco. */}
                <span className="pointer-events-none absolute right-full mr-4 translate-x-1 whitespace-nowrap rounded-full bg-inverse-surface px-3 py-1 text-body-sm text-inverse-on-surface opacity-0 transition-[opacity,translate] duration-[160ms] ease-out group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:translate-x-0 group-focus-visible:opacity-100">
                  {item.label}
                </span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
