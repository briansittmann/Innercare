import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { panelHabilitado } from '@/keystatic.config'
import KeystaticApp from './keystatic'

// Raíz del panel de edición de contenidos (Keystatic), aparte de la del
// sitio: sin header, sin pantalla de carga, sin globals.css (su preflight
// pisaría la interfaz de Keystatic) y sin indexar. Keystatic trae su propio
// router y se monta solo en el cliente, así que `children` (la página
// vacía de [[...params]]) no se renderiza.
export const metadata: Metadata = {
  title: 'Innercare · Panel de contenidos',
  robots: { index: false, follow: false },
}

export default function PanelLayout() {
  // En producción sin Keystatic Cloud no existe: la API local no pide
  // autenticación y expondría el árbol de archivos del proyecto.
  if (!panelHabilitado) notFound()
  return (
    <html lang="es">
      <body>
        <KeystaticApp />
      </body>
    </html>
  )
}
