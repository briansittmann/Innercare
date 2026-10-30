import Image from 'next/image'
import type { CSSProperties } from 'react'
import { ejemplosProceso, proceso } from '@/content/customCases'

// Posición de cada lámina dentro del marco, en % (izquierda, arriba): en
// escalera, de la tomografía a la pieza fabricada.
const LAMINAS = [
  [3, 4],
  [28, 17],
  [53, 30],
] as const

// Cómo trabajamos cada caso (#proceso): los tres pasos y, a la derecha, el
// lugar de la pieza que se transforma (cortes de TC, hueso con la zona a
// resecar, implante y guías), que hace la fase 5 de la landing. Mientras
// tanto, ese marco muestra una lámina por paso, en escalera. Debajo, los
// casos a medida que no entran en el recorrido, como ejemplos.
export function Process() {
  return (
    <section
      id="proceso"
      aria-labelledby="proceso-titulo"
      className="bg-surface-container-low py-section md:py-[120px]"
    >
      <div className="page-container">
        <div className="grid gap-xl lg:grid-cols-12 lg:items-center lg:gap-lg">
          <div className="lg:col-span-5">
            <h2
              id="proceso-titulo"
              className="max-w-[14ch] text-balance font-display-lg text-display-lg text-on-surface"
            >
              Cómo trabajamos cada caso
            </h2>

            <ol className="mt-xl">
              {proceso.map((paso) => (
                <li
                  key={paso.step}
                  className="grid grid-cols-[3.5rem_1fr] gap-x-md border-t border-outline-variant py-lg"
                >
                  <span
                    aria-hidden
                    className="font-data-mono text-headline-lg tabular-nums leading-none text-primary"
                  >
                    {paso.step}
                  </span>
                  <div>
                    <h3 className="font-headline-sm text-headline-sm text-on-surface">
                      {paso.title}
                    </h3>
                    <p className="mt-xs max-w-[44ch] text-body-md text-on-surface-variant">
                      {paso.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          {/* Lugar de la pieza animada (fase 5): marco de proporción fija,
              para que la animación lo reemplace sin mover nada. */}
          <div
            data-pieza-proceso
            className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-container-lowest ring-1 ring-outline-variant/60 lg:col-span-7"
          >
            {proceso.map((paso, i) => {
              const [left, top] = LAMINAS[i] ?? LAMINAS[0]
              return (
                <figure
                  key={paso.step}
                  className="absolute w-[44%] rounded-xl bg-surface-container-lowest p-xs shadow-lamina ring-1 ring-outline-variant/70"
                  style={{ left: `${left}%`, top: `${top}%` } as CSSProperties}
                >
                  <div className="relative aspect-square overflow-hidden rounded-lg bg-surface-container-low">
                    <Image
                      src={paso.image.src}
                      alt={paso.image.alt}
                      fill
                      sizes="(min-width: 1024px) 24vw, 44vw"
                      className="object-contain mix-blend-multiply"
                    />
                  </div>
                  <figcaption className="px-xs pb-[2px] pt-xs font-data-mono text-data-mono tabular-nums text-on-surface-variant">
                    {paso.step}
                  </figcaption>
                </figure>
              )
            })}
          </div>
        </div>

        <div className="mt-section">
          <h3 className="font-headline-md text-headline-md text-on-surface">
            Otros desarrollos a medida
          </h3>
          <ul className="mt-lg grid gap-x-lg gap-y-xl sm:grid-cols-3 lg:grid-cols-5">
            {ejemplosProceso.map((ejemplo, i) => (
              <li key={ejemplo.id} className={i === 0 ? 'sm:col-span-3 lg:col-span-2' : ''}>
                <div className="relative h-[13rem] overflow-hidden rounded-xl bg-surface-container-lowest ring-1 ring-outline-variant/60">
                  <Image
                    src={ejemplo.image}
                    alt={ejemplo.imageAlt}
                    fill
                    sizes={i === 0 ? '(min-width: 1024px) 40vw, 100vw' : '(min-width: 640px) 33vw, 100vw'}
                    className="object-contain p-md mix-blend-multiply"
                  />
                </div>
                <h4 className="mt-md text-body-md font-semibold text-on-surface">{ejemplo.title}</h4>
                <p className="mt-xs text-body-sm text-on-surface-variant">{ejemplo.description}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  )
}
