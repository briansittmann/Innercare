// El contenido de la 404 de marca, compartido por las tres salidas: la global
// (app/global-not-found.tsx, para las URL que no coinciden con ninguna ruta),
// la del sitio (app/(sitio)/not-found.tsx, para los notFound() de las fichas,
// dentro del layout con header y footer) y la del panel
// (app/(panel)/keystatic/not-found.tsx, cuando el panel no está habilitado).
// Un <a> y no <Link>: la global se sirve fuera del router de Next, que es lo
// que Link necesita; la vuelta al inicio es una carga normal en las tres.
export function PaginaNoEncontrada() {
  return (
    <main className="page-container flex flex-1 flex-col justify-center py-section">
      <p className="font-data-mono text-body-sm tabular-nums text-on-surface-variant">Error 404</p>
      <h1 className="mt-sm max-w-[16ch] text-balance font-display-lg text-display-lg text-on-surface">
        Página no encontrada
      </h1>
      <p className="mt-md max-w-[40ch] text-body-lg text-on-surface-variant">
        La dirección que abriste no existe o cambió de lugar.
      </p>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/" className="boton boton-primario mt-lg self-start">
        Volver al inicio
      </a>
    </main>
  )
}
