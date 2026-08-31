import { useEffect, useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'

const navLinks = [
  { to: '/', label: 'Inicio' },
  { to: '/productos', label: 'Productos' },
  { to: '/nosotros', label: 'Nosotros' },
  { to: '/contacto', label: 'Contacto' },
]

function navLinkClasses({ isActive }) {
  return [
    'font-label-md text-label-md transition-colors duration-300 cursor-pointer',
    isActive
      ? 'text-primary border-b-2 border-primary pb-1'
      : 'text-on-surface-variant hover:text-primary',
  ].join(' ')
}

// El subrayado del link activo no funciona apilado en vertical: en el panel móvil
// el estado activo se marca con un fondo a ancho completo.
function mobileNavLinkClasses({ isActive }) {
  return [
    'block px-gutter py-md font-label-md text-label-md transition-colors duration-300',
    isActive
      ? 'text-primary bg-surface-container-low'
      : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low',
  ].join(' ')
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()

  // Cierra el panel ante cualquier navegación que no venga de tocar un link del menú
  // (por ejemplo el botón "atrás" del navegador). Ajuste de estado durante el render:
  // evita el render extra de hacerlo en un efecto.
  const [lastPathname, setLastPathname] = useState(pathname)
  if (lastPathname !== pathname) {
    setLastPathname(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event) => {
      if (event.key === 'Escape') setOpen(false)
    }

    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open])

  // El panel es md:hidden, así que al pasar a desktop desaparece de la vista pero el
  // estado quedaría abierto y reaparecería al volver a angostar la ventana.
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return

    const query = window.matchMedia('(min-width: 768px)')
    const onChange = (event) => {
      if (event.matches) setOpen(false)
    }

    query.addEventListener('change', onChange)
    return () => query.removeEventListener('change', onChange)
  }, [])

  const closeMenu = () => setOpen(false)

  return (
    <header className="bg-surface top-0 h-20 border-b border-outline-variant sticky z-50">
      <div className="flex justify-between items-center h-20 px-gutter max-w-container-max mx-auto w-full">
        <NavLink to="/" className="font-headline-md text-headline-md font-bold text-primary">
          Innercare
        </NavLink>
        <nav className="hidden md:flex items-center gap-lg">
          {navLinks.map((link) => (
            <NavLink key={link.to} to={link.to} end={link.to === '/'} className={navLinkClasses}>
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-md">
          <NavLink
            to="/contacto"
            className="hidden md:inline-flex bg-primary-container text-on-primary px-lg py-sm rounded font-label-md text-label-md hover:bg-surface-tint transition-colors"
          >
            Contactar
          </NavLink>
          <button
            type="button"
            className="md:hidden w-12 h-12 flex items-center justify-center text-primary rounded-full hover:bg-surface-container transition-colors"
            aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="material-symbols-outlined leading-none">
              {open ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={[
          'md:hidden absolute top-20 inset-x-0 bg-surface border-b border-outline-variant shadow-lg',
          'transition-[opacity,transform] duration-300 ease-out',
          open
            ? 'opacity-100 translate-y-0'
            : 'opacity-0 -translate-y-2 invisible pointer-events-none',
        ].join(' ')}
      >
        <nav className="flex flex-col py-sm">
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.to === '/'}
              className={mobileNavLinkClasses}
              onClick={closeMenu}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-gutter pb-md pt-sm">
          <NavLink
            to="/contacto"
            onClick={closeMenu}
            className="block text-center bg-primary-container text-on-primary px-lg py-md rounded font-label-md text-label-md hover:bg-surface-tint transition-colors"
          >
            Contactar
          </NavLink>
        </div>
      </div>
    </header>
  )
}
