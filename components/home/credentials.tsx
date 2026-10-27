import { habilitaciones } from '@/content/company'

export function Credentials() {
  return (
    <section
      aria-labelledby="habilitaciones-titulo"
      className="border-y border-outline-variant/60 bg-surface-container-lowest"
    >
      <h2 id="habilitaciones-titulo" className="sr-only">
        Habilitaciones
      </h2>
      <ul className="page-container grid divide-y divide-outline-variant/60 lg:grid-cols-4 lg:divide-x lg:divide-y-0">
        {habilitaciones.map((habilitacion) => (
          <li
            key={habilitacion.id}
            className="flex flex-col gap-xs py-lg lg:px-lg lg:first:pl-0 lg:last:pr-0"
          >
            <span className="font-label-md text-label-md text-primary">
              {habilitacion.organismo}
            </span>
            <span className="text-body-sm text-on-surface">{habilitacion.detalle}</span>
            <span className="font-data-mono text-data-mono tabular-nums text-on-surface-variant">
              {habilitacion.referencia}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}
