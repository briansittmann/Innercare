// Menú de la barra superior, compartido por la navegación de escritorio y la
// móvil: anclas a las secciones de la home. Van con la barra delante (/#id)
// para que funcionen también desde otras páginas, como una ficha de producto:
// Link navega a la home y baja hasta la sección (el hueco del header sale de
// scroll-padding-top en globals.css).
export const navLinks = [
  { href: '/#recorrido', label: 'Implantes' },
  { href: '/#proceso', label: 'Cómo trabajamos' },
  { href: '/#fabricacion', label: 'Fabricación' },
  { href: '/#habilitaciones', label: 'Habilitaciones' },
] as const

// Contacto: "Plantear un caso" es la única etiqueta en todo el sitio. Abre el
// panel de contacto (ruta interceptada en app/@modal) con el motivo de caso a
// medida precargado; en las fichas se usa ?producto=<slug> en su lugar.
export const contactHref = '/contacto?motivo=caso'
export const contactLabel = 'Plantear un caso'

// Id de la sección a la que lleva cada enlace (sin "/#")
export const sectionIdOf = (href: string) => href.slice(href.indexOf('#') + 1)
