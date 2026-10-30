import { sedes, textosHome } from '@/content/company'
import type { Sede } from '@/content/types'

// Eje del país, de norte a sur, en grados de latitud (La Quiaca ≈ 22° S,
// Ushuaia ≈ 55° S): las sedes caen en su latitud real.
const NORTE = 22
const SUR = 55
const MARCAS = [25, 30, 35, 40, 45, 50, 55]

const posicion = (latitud: number) => ((Math.abs(latitud) - NORTE) / (SUR - NORTE)) * 100
const grados = (latitud: number) => `${Math.abs(latitud).toFixed(1).replace('.', ',')}° S`

// Sedes a menos de 3° entre sí comparten marca en el eje (Caseros y Alberti;
// Comodoro Rivadavia y Caleta Olivia), de norte a sur.
function agrupar(lista: readonly Sede[]) {
  const grupos: Sede[][] = []
  for (const sede of [...lista].sort((a, b) => b.latitud - a.latitud)) {
    const ultimo = grupos.at(-1)
    const ref = ultimo?.at(-1)
    if (ultimo && ref && Math.abs(ref.latitud - sede.latitud) < 3) ultimo.push(sede)
    else grupos.push([sede])
  }
  return grupos
}

const ciudad = (sede: Sede) => sede.localidad.replace(/^[A-Z]\d{4}[A-Z]{3}\s+/, '')
const provincia = (sede: Sede) => sede.provincia.replace(/^Provincia de\s+/, '')
const rol = (sede: Sede) => (sede.tipo.startsWith('Sucursal') ? 'Sucursal' : sede.tipo)

// Distribución a todo el país (#sedes): las cuatro sedes sobre un eje
// norte-sur. La línea se llena de arriba abajo mientras la sección cruza la
// pantalla (scroll-driven animation, solo CSS: .eje-relleno en globals.css);
// sin soporte, o con movimiento reducido, se ve llena.
export function Locations() {
  const { titulo, texto } = textosHome.distribucion
  const grupos = agrupar(sedes)

  return (
    <section id="sedes" aria-labelledby="sedes-titulo" className="bg-surface py-section md:py-[120px]">
      <div className="page-container grid gap-xl lg:grid-cols-12 lg:items-center lg:gap-lg">
        <div className="lg:col-span-5">
          <h2
            id="sedes-titulo"
            className="max-w-[14ch] text-balance font-display-lg text-display-lg text-on-surface"
          >
            {titulo}
          </h2>
          <p className="mt-md max-w-[44ch] text-body-lg text-on-surface-variant">{texto}</p>
        </div>

        <div className="lg:col-span-6 lg:col-start-7">
          <div
            role="group"
            aria-label="Sedes ordenadas de norte a sur"
            className="relative h-[30rem] sm:h-[38rem]"
          >
            {/* Línea del eje (en la columna de 4,5 rem) y su relleno */}
            <div aria-hidden className="absolute inset-y-0 left-[4.5rem] w-px bg-outline-variant">
              <div className="eje-relleno absolute inset-0 bg-primary" />
            </div>

            <span
              aria-hidden
              className="absolute -top-sm left-[5.5rem] text-body-sm font-semibold text-on-surface"
            >
              Norte
            </span>
            <span
              aria-hidden
              className="absolute -bottom-sm left-[5.5rem] text-body-sm font-semibold text-on-surface"
            >
              Sur
            </span>

            {MARCAS.map((marca) => (
              <span
                key={marca}
                aria-hidden
                className="absolute left-0 flex w-[4.5rem] -translate-y-1/2 items-center justify-end gap-sm font-data-mono text-[0.75rem] tabular-nums text-outline"
                style={{ top: `${posicion(marca)}%` }}
              >
                {marca}° S
                <span className="h-px w-sm bg-outline-variant" />
              </span>
            ))}

            {grupos.map((grupo) => {
              const lat = grupo.reduce((sum, sede) => sum + sede.latitud, 0) / grupo.length
              return (
                <div
                  key={grupo.map((sede) => sede.id).join('-')}
                  className="absolute left-[4.5rem] right-0 flex -translate-y-[0.6rem] items-start gap-lg"
                  style={{ top: `${posicion(lat)}%` }}
                >
                  <span
                    aria-hidden
                    className="mt-[0.35rem] -ml-[5px] size-[11px] shrink-0 rounded-full bg-primary ring-[6px] ring-primary/15"
                  />
                  <ul className="flex flex-col gap-md">
                    {grupo.map((sede) => (
                      <li key={sede.id}>
                        <p className="text-body-md font-semibold text-on-surface">
                          {ciudad(sede)}, {provincia(sede)}
                        </p>
                        <p className="text-body-sm text-on-surface-variant">
                          {rol(sede)}
                          <span className="ml-sm font-data-mono tabular-nums text-outline">
                            {grados(sede.latitud)}
                          </span>
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
