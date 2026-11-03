'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState, type ReactNode } from 'react'

// Altura de la línea que se mira: la mitad de la barra (8 px de margen más
// la mitad de los 64 px de escritorio; en el celular, 36 px).
const LINEA = 40

// El header de la página, con data-fondo="oscuro" mientras una sección
// marcada con data-fondo-oscuro (hoy, el contacto de la home) pasa por detrás
// de la barra. El CSS (.nav-glass en globals.css) vuelve opaco el vidrio, que
// sobre el azul oscuro dejaba los enlaces sin contraste.
//
// El observer mira una franja de 1 px a la altura de la barra: avisa solo
// cuando el borde de la sección la cruza, sin escuchar el scroll. El margen
// depende del alto de la ventana, así que se rearma al cambiarlo. El header
// no se desmonta al navegar: se vuelve a buscar la sección con cada ruta, y
// la limpieza apaga el estado (al ocultarse la home con <Activity>, también).
export function HeaderFondo({ className, children }: { className: string; children: ReactNode }) {
  const pathname = usePathname()
  const [oscuro, setOscuro] = useState(false)

  useEffect(() => {
    const secciones = document.querySelectorAll('[data-fondo-oscuro]')
    if (secciones.length === 0) return
    const cruzando = new Set<Element>()
    let observer: IntersectionObserver | undefined

    const armar = () => {
      observer?.disconnect()
      cruzando.clear()
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (entry.isIntersecting) cruzando.add(entry.target)
            else cruzando.delete(entry.target)
          }
          setOscuro(cruzando.size > 0)
        },
        { rootMargin: `-${LINEA}px 0px -${Math.max(0, window.innerHeight - LINEA - 1)}px 0px` },
      )
      for (const seccion of secciones) observer.observe(seccion)
    }

    armar()
    window.addEventListener('resize', armar)
    return () => {
      window.removeEventListener('resize', armar)
      observer?.disconnect()
      setOscuro(false)
    }
  }, [pathname])

  return (
    <header className={className} data-fondo={oscuro ? 'oscuro' : undefined}>
      {children}
    </header>
  )
}
