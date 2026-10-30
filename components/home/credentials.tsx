import { SealCheckIcon } from '@phosphor-icons/react/ssr'
import { habilitaciones, textosHome } from '@/content/company'

// "Disposición 0999/17" → prefijo y número, para que el número se lea como
// dato grande. Una referencia puede traer dos partes ("GLN … · Sub-GLN …").
const partes = (referencia: string) =>
  referencia.split(' · ').map((parte) => {
    const match = /^(.*?)\s*(\d[\w/-]*)$/.exec(parte)
    return match ? { prefijo: match[1] ?? '', numero: match[2] ?? parte } : { prefijo: '', numero: parte }
  })

// Habilitados por ANMAT (#habilitaciones): las cuatro habilitaciones de la
// carpeta, sin animación. A la izquierda el título, fijo mientras se recorre
// la lista en escritorio; a la derecha, cada habilitación con su número de
// disposición en grande, en cifras tabulares.
export function Credentials() {
  const { titulo, texto } = textosHome.habilitaciones

  return (
    <section
      id="habilitaciones"
      aria-labelledby="habilitaciones-titulo"
      className="border-y border-outline-variant/60 bg-surface-container-lowest py-section md:py-[120px]"
    >
      <div className="page-container grid gap-xl lg:grid-cols-12 lg:gap-lg">
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-[120px]">
            <SealCheckIcon size={40} weight="light" aria-hidden className="text-primary" />
            <h2
              id="habilitaciones-titulo"
              className="mt-lg max-w-[12ch] text-balance font-display-lg text-display-lg text-on-surface"
            >
              {titulo}
            </h2>
            <p className="mt-md max-w-[44ch] text-body-lg text-on-surface-variant">{texto}</p>
          </div>
        </div>

        <dl className="lg:col-span-7">
          {habilitaciones.map((habilitacion) => (
            <div
              key={habilitacion.id}
              className="grid gap-md border-t border-outline-variant py-lg first:border-t-0 first:pt-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-end sm:gap-lg lg:first:border-t lg:first:pt-lg"
            >
              <dt>
                <span className="block text-body-sm font-semibold text-primary">
                  {habilitacion.organismo}
                </span>
                <span className="mt-xs block max-w-[30ch] text-body-lg text-on-surface">
                  {habilitacion.detalle}
                </span>
              </dt>
              <dd className="flex flex-col gap-xs sm:items-end">
                {partes(habilitacion.referencia).map((parte) => (
                  <span key={parte.numero} className="flex items-baseline gap-sm sm:justify-end">
                    {parte.prefijo && (
                      <span className="text-body-sm text-on-surface-variant">{parte.prefijo}</span>
                    )}
                    <span className="font-data-mono text-[clamp(1.25rem,1rem+0.9vw,1.75rem)] font-medium tabular-nums leading-tight tracking-tight text-on-surface">
                      {parte.numero}
                    </span>
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
