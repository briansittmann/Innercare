import { habilitaciones } from '@/content/company'

export function Statement() {
  return (
    <section id="habilitaciones" className="page-container py-section md:py-[120px]">
      <p className="reveal max-w-[30ch] font-headline-lg text-statement text-on-surface">
        Fabricamos implantes ortopédicos modulares y a medida del paciente en
        titanio biocompatible,{' '}
        <span className="text-on-surface-variant">
          con planificación quirúrgica 3D junto al equipo médico.
        </span>
      </p>

      <section aria-labelledby="habilitaciones-titulo" className="mt-section">
        <h2
          id="habilitaciones-titulo"
          className="text-body-sm text-on-surface-variant"
        >
          Habilitaciones
        </h2>
        <ul className="mt-md grid gap-x-lg gap-y-lg border-t border-outline-variant pt-lg sm:grid-cols-2 lg:grid-cols-4">
          {habilitaciones.map((habilitacion) => (
            <li key={habilitacion.id} className="reveal flex flex-col gap-xs">
              <span className="text-body-sm font-medium text-primary">
                {habilitacion.organismo}
              </span>
              <span className="text-body-md text-on-surface">{habilitacion.detalle}</span>
              <span className="font-data-mono text-data-mono tabular-nums text-on-surface-variant">
                {habilitacion.referencia}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </section>
  )
}
