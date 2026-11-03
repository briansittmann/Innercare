'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

// Franja que se mira, en fracciones del alto de la ventana: del 4 al 5 %
// (de 34 a 42 px en un celular de 844 px, de 36 a 45 en una pantalla de
// 900). Cae dentro de la barra, que va de 8 a 72 px en cualquier alto.
// En porcentajes y no en píxeles: el observer los resuelve contra el alto
// real en cada cuadro. Con píxeles calculados desde innerHeight, en el
// celular la barra del navegador reaparecía al subir rápido, la ventana se
// achicaba antes del evento resize y, con el margen viejo, la franja quedaba
// vacía: el vidrio se volvía transparente un instante.
const FRANJA = '-4% 0px -95% 0px'

// El header de la página, con data-fondo="oscuro" mientras una sección
// marcada con data-fondo-oscuro (hoy, el contacto de la home) pasa por detrás
// de la barra. El CSS (.nav-glass en globals.css) vuelve opaco el vidrio, que
// sobre el azul oscuro dejaba los enlaces sin contraste.
//
// El observer avisa solo cuando el borde de la sección cruza la franja, sin
// escuchar el scroll. El header no se desmonta al navegar: se vuelve a buscar
// la sección con cada ruta, y la limpieza apaga el estado (al ocultarse la
// home con <Activity>, también).
export function HeaderFondo({ className, children }: { className: string; children: ReactNode }) {
  const pathname = usePathname()
  const [oscuro, setOscuro] = useState(false)

  useEffect(() => {
    const secciones = document.querySelectorAll('[data-fondo-oscuro]')
    if (secciones.length === 0) return
    const cruzando = new Set<Element>()
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) cruzando.add(entry.target)
          else cruzando.delete(entry.target)
        }
        setOscuro(cruzando.size > 0)
      },
      { rootMargin: FRANJA },
    )
    for (const seccion of secciones) observer.observe(seccion)
    return () => {
      observer.disconnect()
      setOscuro(false)
    }
  }, [pathname])

  return (
    <header className={className} data-fondo={oscuro ? 'oscuro' : undefined}>
      {children}
    </header>
  )
}
