import Image from 'next/image'
import { proceso } from '@/content/customCases'
import { ProcessScroll } from './process-scroll'

// Leyenda de la pieza (borrador): qué color es cada material
const LEYENDA = [
  { color: 'bg-hueso', label: 'Hueso' },
  { color: 'bg-resecar', label: 'Zona a resecar' },
  { color: 'bg-metal', label: 'Implante y guías' },
] as const

// Cómo trabajamos cada caso (#proceso). Estructura del borrador: ver
// process-scroll.tsx. La pieza que se transforma (cortes de TC, hueso con la
// zona a resecar, implante y guías) está en components/animaciones/
// proceso.ts; sin JS, en su lugar va la imagen del primer paso, con el mismo
// tratamiento que la escena del recorrido (.visor-imagen).
export function Process() {
  const primerPaso = proceso[0]
  return (
    <section id="proceso" aria-labelledby="proceso-titulo" className="relative h-[340vh] bg-surface">
      <ProcessScroll
        titulo={
          <h2
            id="proceso-titulo"
            className="max-w-[16ch] text-balance font-display-lg text-[1.875rem] leading-none tracking-[-0.03em] text-on-surface md:text-display-lg"
          >
            Cómo trabajamos cada caso
          </h2>
        }
        pasos={proceso.map(({ step, title, description }) => ({ step, title, description }))}
        respaldo={
          primerPaso && (
            <Image
              src={primerPaso.image.src}
              alt=""
              fill
              sizes="(min-width: 768px) 55vw, 100vw"
              className="visor-imagen object-contain"
            />
          )
        }
        leyenda={
          <ul className="proceso-leyenda absolute bottom-0 left-0 flex flex-wrap gap-x-[1.125rem] gap-y-xs text-[0.84375rem] text-on-surface-variant">
            {LEYENDA.map((item) => (
              <li key={item.label} className="inline-flex items-center gap-[0.4375rem]">
                <span aria-hidden className={`size-[9px] rounded-full ${item.color}`} />
                {item.label}
              </li>
            ))}
          </ul>
        }
      />
    </section>
  )
}
