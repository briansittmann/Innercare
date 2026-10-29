'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ListIcon, XIcon } from '@phosphor-icons/react/ssr'
import { isNavActive, navLinks } from './nav-links'

export function MobileNav() {
  const pathname = usePathname()
  // El menú móvil queda asociado a la ruta en la que se abrió: al navegar
  // cambia la ruta y se cierra solo, sin efectos.
  const [openOn, setOpenOn] = useState<string | null>(null)
  const open = openOn === pathname

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenOn(null)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open])

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="menu-movil"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setOpenOn(open ? null : pathname)}
        className="inline-flex size-12 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container"
      >
        {open ? <XIcon size={22} /> : <ListIcon size={22} />}
      </button>

      {open && (
        <div
          id="menu-movil"
          className="absolute inset-x-0 top-full border-b border-outline-variant/60 bg-surface"
        >
          <nav aria-label="Principal" className="page-container py-lg">
            <ul className="flex flex-col">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isNavActive(pathname, link.href) ? 'page' : undefined}
                    className="block py-3 font-headline-sm text-headline-sm text-on-surface aria-[current=page]:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link href="/contacto" className="boton boton-primario mt-lg w-full">
              Contactar
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
