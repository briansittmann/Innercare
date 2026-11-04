import type { Metadata } from 'next'
import { PaginaNoEncontrada } from '@/components/pagina-no-encontrada'
import { claseFuentes } from './fuentes'
import './globals.css'

// 404 de todo el sitio para las URL que no coinciden con ninguna ruta. Con
// dos raíces (el sitio y el panel) no hay un layout único del que colgar un
// not-found.tsx, así que Next pide esta página entera, con <html> y <body>
// (not-found.md, "global-not-found.js"), activada con
// experimental.globalNotFound en next.config.ts. No pasa por ningún layout:
// trae las fuentes y los estilos por su cuenta y no lleva el header (sus
// piezas usan el router de Next, que acá no está). Los notFound() de las
// rutas van a app/(sitio)/not-found.tsx y app/(panel)/keystatic/not-found.tsx,
// con el mismo contenido (components/pagina-no-encontrada.tsx).
export const metadata: Metadata = {
  title: 'Página no encontrada | Innercare',
}

export default function GlobalNotFound() {
  return (
    <html lang="es-AR" className={`${claseFuentes} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-surface">
        <PaginaNoEncontrada />
      </body>
    </html>
  )
}
