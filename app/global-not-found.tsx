import type { Metadata } from 'next'
import { claseFuentes } from './fuentes'
import './globals.css'

// 404 de todo el sitio para las URL que no coinciden con ninguna ruta. Con
// dos raíces (el sitio y el panel) no hay un layout único del que colgar un
// not-found.tsx, así que Next pide esta página entera, con <html> y <body>
// (not-found.md, "global-not-found.js"), activada con
// experimental.globalNotFound en next.config.ts. No pasa por ningún layout:
// trae las fuentes y los estilos por su cuenta y no lleva el header (sus
// piezas usan el router de Next, que acá no está).
export const metadata: Metadata = {
  title: 'Página no encontrada | Innercare',
}

export default function GlobalNotFound() {
  return (
    <html lang="es-AR" className={`${claseFuentes} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-surface">
        <main className="page-container flex flex-1 flex-col justify-center py-section">
          <p className="font-data-mono text-body-sm tabular-nums text-on-surface-variant">Error 404</p>
          <h1 className="mt-sm max-w-[16ch] text-balance font-display-lg text-display-lg text-on-surface">
            Página no encontrada
          </h1>
          <p className="mt-md max-w-[40ch] text-body-lg text-on-surface-variant">
            La dirección que abriste no existe o cambió de lugar.
          </p>
          {/* Un <a> y no <Link>: esta página se sirve fuera del router de Next,
              que es lo que Link necesita; la vuelta al inicio es una carga
              normal */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a href="/" className="boton boton-primario mt-lg self-start">
            Volver al inicio
          </a>
        </main>
      </body>
    </html>
  )
}
