import type { Metadata } from 'next'
import { panelHabilitado } from '@/keystatic.config'
import { claseFuentes } from '../../fuentes'
import KeystaticApp from './keystatic'

// Raíz del panel de edición de contenidos (Keystatic), aparte de la del
// sitio: sin header, sin pantalla de carga, sin globals.css (su preflight
// pisaría la interfaz de Keystatic) y sin indexar. Keystatic trae su propio
// router y se monta solo en el cliente, así que `children` (la página
// vacía de [[...params]]) no se renderiza.
//
// En producción sin Keystatic Cloud el panel no existe (la API local no pide
// autenticación y expondría el árbol de archivos del proyecto). Entonces el
// layout sí renderiza `children`: la página llama a notFound() (status 404)
// y Next muestra el not-found.tsx de al lado, que es la 404 de marca y trae
// globals.css por su cuenta; Next carga el CSS de un not-found solo cuando
// lo renderiza, así que el panel habilitado sigue sin globals.css. Antes el
// notFound() estaba acá, en el layout raíz, y caía en la 404 genérica de
// Next ("404: This page could not be found."): un layout raíz no tiene
// ningún not-found por encima.
export const metadata: Metadata = panelHabilitado
  ? {
      title: 'Innercare · Panel de contenidos',
      robots: { index: false, follow: false },
    }
  : { title: 'Página no encontrada | Innercare' }

export default function PanelLayout({ children }: LayoutProps<'/keystatic'>) {
  if (panelHabilitado) {
    return (
      <html lang="es">
        <body>
          <KeystaticApp />
        </body>
      </html>
    )
  }
  return (
    <html lang="es-AR" className={`${claseFuentes} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-surface">{children}</body>
    </html>
  )
}
