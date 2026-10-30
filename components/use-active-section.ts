'use client'

import { useEffect, useState } from 'react'

// Sección de la home que cruza la mitad de la pantalla, entre las de `ids`.
// Marca el enlace activo del menú de anclas (components/desktop-nav.tsx).
// Si ninguna cruza la mitad (el hero, el cierre de contacto) o si `enabled`
// es falso (otras páginas), no hay activa. Las secciones que todavía no
// existen se ignoran.
//
// El observer solo avisa cuando el borde de una sección cruza la línea media:
// sin escuchar el scroll en cada fotograma.
export function useActiveSection(ids: readonly string[], enabled: boolean) {
  const [active, setActive] = useState<string | undefined>()

  useEffect(() => {
    if (!enabled) return
    const sections = ids.flatMap((id) => {
      const section = document.getElementById(id)
      return section ? [section] : []
    })
    const crossing = new Set<string>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) crossing.add(entry.target.id)
          else crossing.delete(entry.target.id)
        }
        setActive(ids.find((id) => crossing.has(id)))
      },
      { rootMargin: '-50% 0px -50% 0px' },
    )
    for (const section of sections) observer.observe(section)
    return () => {
      observer.disconnect()
      setActive(undefined)
    }
  }, [ids, enabled])

  return enabled ? active : undefined
}
