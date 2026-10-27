import { tagline } from '@/content/company'

// Home provisional de la Fase 0: sólo comprueba fuentes, tokens y contenido.
// Se reemplaza por el diseño definitivo.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-container-max flex-1 flex-col justify-center gap-md px-gutter py-section">
      <p className="font-label-md text-label-md uppercase text-primary-container">
        Innercare
      </p>
      <h1 className="font-display-lg text-display-lg text-primary">{tagline}</h1>
      <p className="font-body-lg text-body-lg text-on-surface-variant">
        Sitio en construcción.
      </p>
    </main>
  )
}
