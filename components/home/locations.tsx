import { sedes, textosHome } from '@/content/company'
import type { Sede } from '@/content/types'

// Eje del país de norte a sur, en grados de latitud sur (La Quiaca ≈ 22°,
// Ushuaia ≈ 55°), como el del borrador. Cada grupo de sedes tiene su punto
// en su latitud (la media del grupo) y cada etiqueta, la latitud exacta.
const NORTE = 22
const SUR = 55
// Alto del eje (460 px del borrador)
const ALTO = 28.75
// Separación mínima entre etiquetas (ciudad y rol: dos o tres líneas)
const PASO_ETIQUETA = 4
// Ancho de la guía que une el punto con cada etiqueta (16 px del borrador más
// el tramo de la guía)
const GUIA = 2.5

const yDe = (latitud: number) => ((Math.abs(latitud) - NORTE) / (SUR - NORTE)) * ALTO
const grados = (latitud: number) => `${Math.abs(latitud).toFixed(1).replace('.', ',')}° S`

const ciudad = (sede: Sede) => sede.localidad.replace(/^[A-Z]\d{4}[A-Z]{3}\s+/, '')
const provincia = (sede: Sede) => sede.provincia.replace(/^Provincia de\s+/, '')
const rol = (sede: Sede) => (sede.tipo.startsWith('Sucursal') ? 'Sucursal' : sede.tipo)

// Etiquetas: cada una va a la altura de su punto, salvo que choque con la
// anterior (Caseros y Alberti están a 0,4° entre sí; Comodoro Rivadavia y
// Caleta Olivia, a 0,6°). Las que chocan se reparten, parejas, alrededor de
// la altura media del grupo, donde va su único punto, y una guía une el
// punto con cada etiqueta.
function ubicar(lista: readonly Sede[]) {
  const ordenadas = [...lista].sort((a, b) => b.latitud - a.latitud)
  const grupos: Sede[][] = []
  for (const sede of ordenadas) {
    const ultimo = grupos.at(-1)
    const previa = ultimo?.at(-1)
    if (ultimo && previa && yDe(sede.latitud) - yDe(previa.latitud) < PASO_ETIQUETA) ultimo.push(sede)
    else grupos.push([sede])
  }
  return grupos.flatMap((grupo) => {
    const media = grupo.reduce((sum, sede) => sum + yDe(sede.latitud), 0) / grupo.length
    return grupo.map((sede, i) => ({
      sede,
      media,
      etiqueta: media + (i - (grupo.length - 1) / 2) * PASO_ETIQUETA,
    }))
  })
}

// Distribución a todo el país (#sedes), con la disposición del borrador de
// la landing: a la izquierda el título y la bajada; a la derecha, el eje
// norte-sur con las cuatro sedes.
export function Locations() {
  const { titulo, texto } = textosHome.distribucion
  const ubicadas = ubicar(sedes)

  return (
    <section
      id="sedes"
      aria-labelledby="sedes-titulo"
      className="bg-surface py-[clamp(5.5rem,13vh,9.375rem)]"
    >
      <div className="page-container grid items-center gap-[clamp(1.75rem,5vw,5rem)] md:grid-cols-2">
        <div>
          <h2
            id="sedes-titulo"
            className="max-w-[16ch] text-balance font-display-lg text-display-lg text-on-surface"
          >
            {titulo}
          </h2>
          <p className="mt-[1.25rem] max-w-[56ch] text-body-lg text-on-surface-variant">{texto}</p>
        </div>

        <div
          role="group"
          aria-label="Sedes ordenadas de norte a sur"
          className="relative ml-[1.25rem]"
          style={{ height: `${ALTO}rem` }}
        >
          {/* Línea del eje: se intensifica en el medio, como en el borrador */}
          <div
            aria-hidden
            className="absolute inset-y-0 left-0 w-[2px] -translate-x-1/2 bg-linear-to-b from-primary/15 via-primary/70 to-primary/15"
          />
          <span
            aria-hidden
            className="absolute -top-sm left-[1.125rem] text-[0.8125rem] font-medium text-on-surface-variant"
          >
            Norte
          </span>
          <span
            aria-hidden
            className="absolute -bottom-sm left-[1.125rem] text-[0.8125rem] font-medium text-on-surface-variant"
          >
            Sur
          </span>

          {/* Guías del punto de cada grupo a sus etiquetas (en px: 1 rem =
              16 px). Con una sola sede, la guía es recta. */}
          <svg
            aria-hidden
            className="absolute top-0 left-0 overflow-visible"
            width={GUIA * 16}
            height={ALTO * 16}
            viewBox={`0 0 ${GUIA * 16} ${ALTO * 16}`}
          >
            {ubicadas.map(({ sede, media, etiqueta }) => (
              <path
                key={sede.id}
                d={`M 10 ${media * 16} H 14 L ${GUIA * 16 - 10} ${etiqueta * 16} H ${GUIA * 16 - 4}`}
                fill="none"
                stroke="var(--color-primary)"
                strokeOpacity="0.5"
                strokeWidth="1"
              />
            ))}
          </svg>

          {/* Un punto por grupo, con el halo del borrador: las sedes que
              están casi a la misma latitud (Caseros y Alberti, a 0,4°;
              Comodoro y Caleta, a 0,6°) comparten punto y se abren en dos
              etiquetas con guías, cada una con su latitud exacta. */}
          {[...new Set(ubicadas.map(({ media }) => media))].map((media) => (
            <span
              key={media}
              aria-hidden
              className="absolute left-0 size-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary shadow-[0_0_0_6px_rgb(0_60_111/0.14)]"
              style={{ top: `${media}rem` }}
            />
          ))}

          <ul>
            {ubicadas.map(({ sede, etiqueta }) => (
              <li
                key={sede.id}
                className="absolute right-0 -translate-y-1/2 text-[1.0625rem] leading-[1.3] font-medium text-on-surface"
                style={{ top: `${etiqueta}rem`, left: `${GUIA}rem` }}
              >
                {ciudad(sede)}, {provincia(sede)}
                <span className="mt-[2px] block text-body-sm font-normal text-on-surface-variant">
                  {rol(sede)}
                  <span className="ml-sm font-data-mono tabular-nums">{grados(sede.latitud)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
