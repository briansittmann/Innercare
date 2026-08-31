import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <main className="flex-grow py-section px-gutter max-w-container-max mx-auto w-full text-center">
      <p className="font-data-mono text-data-mono text-on-surface-variant mb-sm">Error 404</p>
      <h1 className="font-display-lg text-display-lg text-primary mb-md">Página no encontrada</h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant mb-lg max-w-xl mx-auto">
        La página que buscás no existe o cambió de dirección.
      </p>
      <div className="flex flex-wrap gap-md justify-center">
        <Link
          to="/"
          className="inline-flex items-center gap-sm bg-primary-container text-on-primary px-lg py-md rounded-lg font-label-md text-label-md hover:bg-surface-tint transition-colors"
        >
          Volver al inicio
        </Link>
        <Link
          to="/productos"
          className="inline-flex items-center gap-sm bg-surface text-primary border border-outline px-lg py-md rounded-lg font-label-md text-label-md hover:bg-surface-container hover:border-primary transition-colors"
        >
          Ver productos
        </Link>
      </div>
    </main>
  )
}
