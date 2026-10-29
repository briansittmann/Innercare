// Enlaces principales, compartidos por la navegación de escritorio y la móvil.
export const navLinks = [
  { href: '/productos', label: 'Productos' },
  { href: '/casos-a-medida', label: 'Casos a medida' },
  { href: '/nosotros', label: 'Nosotros' },
] as const

// Un enlace está activo en su ruta y en las que cuelgan de ella
// (/productos/femur marca "Productos").
export const isNavActive = (pathname: string, href: string) =>
  pathname === href || pathname.startsWith(`${href}/`)
