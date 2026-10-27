import Image from 'next/image'
import { ContentIcon } from '@/components/icon'
import { proceso } from '@/content/customCases'

export function Process() {
  return (
    <section className="bg-surface-container-low">
      <div className="page-container grid gap-xl py-section md:grid-cols-12">
        <div className="md:col-span-5">
          <div className="md:sticky md:top-28">
            <h2 className="font-display-lg text-display-lg text-on-surface">
              Cómo trabajamos cada caso
            </h2>
            <p className="mt-md max-w-[48ch] text-body-lg text-on-surface-variant">
              Cada implante se desarrolla junto al equipo quirúrgico, desde el
              estudio del paciente hasta la entrega de la pieza y su instrumental.
            </p>
            <div className="relative mt-xl aspect-[1031/868] overflow-hidden rounded-xl bg-surface-container-lowest ring-1 ring-outline-variant/50">
              <Image
                src="/img/femur-planificacion.jpg"
                alt="Planificación quirúrgica 3D con el plano de resección femoral sugerido"
                fill
                sizes="(min-width: 768px) 40vw, 100vw"
                className="object-contain"
              />
            </div>
          </div>
        </div>

        {/* La secuencia la da el <ol> y la línea que une los pasos. */}
        <ol className="md:col-span-6 md:col-start-7 md:pt-xs">
          {proceso.map((paso) => (
            <li key={paso.step} className="reveal grid grid-cols-[auto_1fr] gap-x-lg">
              <div className="flex flex-col items-center">
                <span className="flex size-12 items-center justify-center rounded-full bg-surface-container-lowest text-primary ring-1 ring-outline-variant/60">
                  <ContentIcon name={paso.icon} size={24} />
                </span>
                <span aria-hidden className="w-px flex-1 bg-outline-variant [li:last-child_&]:hidden" />
              </div>
              <div className="pb-xl pt-sm [li:last-child_&]:pb-0">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  {paso.title}
                </h3>
                <p className="mt-sm max-w-[52ch] text-body-md text-on-surface-variant">
                  {paso.description}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}
