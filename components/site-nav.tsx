'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ListIcon, XIcon } from '@phosphor-icons/react/ssr'

const links = [
  { href: '/productos', label: 'Productos' },
  { href: '/casos-a-medida', label: 'Casos a medida' },
  { href: '/nosotros', label: 'Nosotros' },
] as const

export function SiteNav() {
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

  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`)

  return (
    <>
      <nav aria-label="Principal" className="hidden md:block">
        <ul className="flex items-center gap-xl">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                aria-current={isActive(link.href) ? 'page' : undefined}
                className="text-body-md text-on-surface-variant transition-colors hover:text-on-surface aria-[current=page]:text-on-surface"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <Link
        href="/contacto"
        className="hidden justify-self-end text-body-md text-on-surface underline decoration-outline underline-offset-[6px] transition-colors hover:decoration-on-surface md:inline"
      >
        Contactar
      </Link>

      <button
        type="button"
        aria-expanded={open}
        aria-controls="menu-movil"
        aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
        onClick={() => setOpenOn(open ? null : pathname)}
        className="inline-flex size-10 items-center justify-center rounded-full text-on-surface transition-colors hover:bg-surface-container md:hidden"
      >
        {open ? <XIcon size={22} /> : <ListIcon size={22} />}
      </button>

      {open && (
        <div
          id="menu-movil"
          className="absolute inset-x-0 top-full border-b border-outline-variant/60 bg-surface md:hidden"
        >
          <nav aria-label="Principal" className="page-container py-lg">
            <ul className="flex flex-col">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={isActive(link.href) ? 'page' : undefined}
                    className="block py-3 font-headline-sm text-headline-sm text-on-surface aria-[current=page]:text-primary"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <Link
              href="/contacto"
              className="mt-lg flex h-12 items-center justify-center rounded-full bg-primary font-label-md text-label-md text-on-primary active:scale-[0.98]"
            >
              Contactar
            </Link>
          </nav>
        </div>
      )}
    </>
  )
}
