'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState, type AnimationEvent, type CSSProperties, type ReactNode } from 'react'
import { ListIcon, XIcon } from '@phosphor-icons/react/ssr'
import { AnchorLink } from './anchor-link'
import { ContactLink } from './contact-link'
import { NavGlass } from './nav-glass'
import { contactHref, contactLabel, navLinks } from './nav-links'

// Barra del celular: una píldora de vidrio flotante, como la de escritorio,
// algo más transparente, y el menú en un panel esmerilado debajo. El panel va
// fuera de la píldora porque GlassSurface recorta su contenido, y no es
// NavGlass porque el vidrio refractivo dejaba leer (y espejaba en el borde)
// el titular del hero a través de los enlaces (.menu-movil-panel).
//
// Abrir y cerrar (.menu-movil en globals.css): el panel se despliega hacia
// abajo, los enlaces entran de a uno y "Plantear un caso" llega al final con
// un rebote chico. Al cerrar, todo sale en el orden inverso y el panel se
// pliega hacia arriba, más despacio. El panel sigue montado mientras se
// cierra (data-estado="cerrando") y se desmonta al terminar su animación.
export function MobileNav({ logo }: { logo: ReactNode }) {
  const pathname = usePathname()
  // El menú queda asociado a la ruta en la que se abrió: al navegar cambia la
  // ruta y se cierra solo, sin efectos. Las anclas de la home no cambian la
  // ruta, así que esas lo cierran al tocarlas.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const [closing, setClosing] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const open = openOn === pathname
  const expanded = open && !closing

  const close = () => setClosing(true)
  const finishClose = () => {
    setOpenOn(null)
    setClosing(false)
  }

  useEffect(() => {
    if (!expanded) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setClosing(true)
    }
    // Tocar fuera del panel lo cierra: el logo (un ancla de la home) o
    // cualquier punto de la página. El botón del menú se maneja solo. Con
    // composedPath y no con event.target: el mismo clic que abre llega acá
    // después de que el ícono cambió, y su destino ya no está en el DOM.
    const onClick = (event: MouseEvent) => {
      const path = event.composedPath()
      const panel = document.getElementById('menu-movil')
      if ((panel && path.includes(panel)) || (toggleRef.current && path.includes(toggleRef.current))) return
      setClosing(true)
    }
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('click', onClick)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('click', onClick)
    }
  }, [expanded])

  // Respaldo por si la animación de cierre no llega a correr (o a avisar).
  useEffect(() => {
    if (!closing) return
    const timer = window.setTimeout(() => {
      setOpenOn(null)
      setClosing(false)
    }, 1200)
    return () => window.clearTimeout(timer)
  }, [closing])

  const onAnimationEnd = (event: AnimationEvent<HTMLDivElement>) => {
    if (closing && (event.target as Element).classList.contains('menu-movil-panel')) finishClose()
  }

  return (
    <>
      <NavGlass
        width="100%"
        height={56}
        borderRadius={28}
        backgroundOpacity={0.25}
        className="nav-intro-movil pointer-events-auto"
      >
        <div className="flex w-full items-center justify-between gap-lg pr-1 pl-4">
          {logo}
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={expanded}
            aria-controls="menu-movil"
            aria-label={expanded ? 'Cerrar menú' : 'Abrir menú'}
            onClick={() => {
              if (expanded) close()
              else {
                setClosing(false)
                setOpenOn(pathname)
              }
            }}
            className="menu-movil-boton inline-flex size-12 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container"
          >
            {expanded ? <XIcon size={22} /> : <ListIcon size={22} />}
          </button>
        </div>
      </NavGlass>

      {open && (
        <div
          id="menu-movil"
          data-estado={closing ? 'cerrando' : 'abierto'}
          onAnimationEnd={onAnimationEnd}
          style={{ '--n': navLinks.length } as CSSProperties}
          className="menu-movil pointer-events-auto absolute inset-x-3 top-full mt-2"
        >
          <div className="menu-movil-panel">
            <nav aria-label="Principal" className="px-lg pt-sm pb-lg">
              <ul className="flex flex-col">
                {navLinks.map((link, i) => (
                  <li key={link.href} className="menu-movil-item" style={{ '--i': i } as CSSProperties}>
                    <AnchorLink
                      href={link.href}
                      onClick={close}
                      className="block py-3 font-headline-sm text-headline-sm text-on-surface"
                    >
                      {link.label}
                    </AnchorLink>
                  </li>
                ))}
              </ul>
              <ContactLink
                href={contactHref}
                onClick={close}
                className="menu-movil-cta boton boton-primario mt-md w-full"
                style={{ '--i': navLinks.length } as CSSProperties}
              >
                {contactLabel}
              </ContactLink>
            </nav>
          </div>
        </div>
      )}
    </>
  )
}
