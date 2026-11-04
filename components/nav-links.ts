// Menú de la barra superior, compartido por la navegación de escritorio y la
// móvil: anclas a las secciones de la home. Van con la barra delante (/#id)
// para que funcionen también desde otras páginas, como una ficha de producto:
// Link navega a la home y baja hasta la sección (el hueco del header sale de
// scroll-padding-top en globals.css). Las etiquetas se editan en el panel
// (content/menu.ts); las anclas son código.
import { menuTextos } from '@/content/menu'

export const navLinks = [
  { href: '/#recorrido', label: menuTextos.enlaces.implantes },
  { href: '/#proceso', label: menuTextos.enlaces.proceso },
  { href: '/#fabricacion', label: menuTextos.enlaces.fabricacion },
  { href: '/#habilitaciones', label: menuTextos.enlaces.habilitaciones },
] as const

// Contacto: "Plantear un caso" es la única etiqueta en todo el sitio. Abre el
// panel de contacto (ruta interceptada en app/@modal) con el motivo de caso a
// medida precargado; en las fichas se usa ?producto=<slug> en su lugar.
export const contactHref = '/contacto?motivo=caso'
export const contactLabel = menuTextos.plantearCaso

// Id de la sección a la que lleva cada enlace (sin "/#")
export const sectionIdOf = (href: string) => href.slice(href.indexOf('#') + 1)
