import type { Metadata } from 'next'
import { PaginaNoEncontrada } from '@/components/pagina-no-encontrada'

// 404 de marca para los notFound() del sitio (las fichas con un slug que no
// existe, app/(sitio)/productos/[slug]/page.tsx): se renderiza dentro del
// layout del sitio, con header y footer. Las URL que no coinciden con
// ninguna ruta van a app/global-not-found.tsx, con el mismo contenido.
export const metadata: Metadata = {
  title: 'Página no encontrada | Innercare',
}

export default function NotFound() {
  return <PaginaNoEncontrada />
}
