import { habilitaciones, textosHome } from '@/content/company'

// Bajo cada habilitación, quién la otorga (borrador): la ANMAT, o la
// inscripción en el sistema de trazabilidad.
const otorga = (organismo: string) => (organismo === 'ANMAT' ? 'ANMAT' : 'Inscripción')

// Habilitados por ANMAT (#habilitaciones), con la estructura del borrador de
// la landing: a la izquierda el título y la bajada; a la derecha, la tabla de
// las cuatro habilitaciones de la carpeta, con la referencia en el primario y
// en cifras tabulares. Sin animación.
export function Credentials() {
  const { titulo, texto } = textosHome.habilitaciones

  return (
    <section
      id="habilitaciones"
      aria-labelledby="habilitaciones-titulo"
      className="bg-surface py-[clamp(5.5rem,13vh,9.375rem)]"
    >
      <div className="page-container grid items-start gap-[clamp(1.75rem,5vw,5rem)] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <h2
            id="habilitaciones-titulo"
            className="max-w-[16ch] text-balance font-display-lg text-display-lg text-on-surface"
          >
            {titulo}
          </h2>
          <p className="mt-[1.25rem] max-w-[56ch] text-body-lg text-on-surface-variant">{texto}</p>
        </div>

        <dl className="border-t border-outline-variant">
          {habilitaciones.map((habilitacion) => (
            <div
              key={habilitacion.id}
              className="grid gap-x-lg gap-y-[0.375rem] border-b border-outline-variant py-[1.25rem] md:grid-cols-[minmax(0,1fr)_auto]"
            >
              <dt className="text-[1.09375rem] font-medium text-on-surface">
                {habilitacion.detalle}
                <small className="mt-[2px] block text-body-sm font-normal text-on-surface-variant">
                  {otorga(habilitacion.organismo)}
                </small>
              </dt>
              {/* Una referencia puede tener dos partes (GLN y Sub-GLN):
                  una por línea. */}
              <dd className="font-data-mono font-medium tabular-nums text-primary md:text-right">
                {habilitacion.referencia.split(' · ').map((parte) => (
                  <span key={parte} className="block md:whitespace-nowrap">
                    {parte}
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
