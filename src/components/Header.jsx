import { NavLink } from 'react-router-dom'

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

export default function Header() {
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
            className="md:hidden text-primary p-sm rounded-full hover:bg-surface-container transition-colors"
            aria-label="Abrir menú"
          >
            <span className="material-symbols-outlined">menu</span>
          </button>
        </div>
      </div>
    </header>
  )
}
