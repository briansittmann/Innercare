import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import { customCases } from '@/content/customCases'

// Selección para la home y celda que ocupa cada caso en el bento (4 × 2).
// Las imágenes de origen son chicas: la celda grande lleva la de más resolución.
const seleccion = [
  { id: 'estructura-porosa', cell: 'md:col-span-2 md:row-span-2', sizes: '(min-width: 768px) 50vw, 100vw' },
  { id: 'craneoplastia-titanio', cell: '', sizes: '(min-width: 768px) 25vw, 100vw' },
  { id: 'reconstruccion-acetabular', cell: '', sizes: '(min-width: 768px) 25vw, 100vw' },
  { id: 'planificacion-espaciador-cotilo', cell: 'md:col-span-2', sizes: '(min-width: 768px) 50vw, 100vw' },
] as const

export function CustomCasesTeaser() {
  const items = seleccion.flatMap((item) => {
    const caso = customCases.find((c) => c.id === item.id)
    return caso ? [{ ...item, caso }] : []
  })

  return (
    <section className="page-container py-section">
      <div className="reveal max-w-[60ch]">
        <h2 className="font-display-lg text-display-lg text-on-surface">
          Cuando el caso no entra en un catálogo
        </h2>
        <p className="mt-md text-body-lg text-on-surface-variant">
          Diseñamos y fabricamos la pieza junto al equipo quirúrgico, a partir de
          los estudios del paciente.
        </p>
      </div>

      <ul className="mt-xl grid gap-md md:grid-cols-4 md:grid-rows-[repeat(2,20rem)]">
        {items.map(({ id, cell, sizes, caso }) => (
          <li key={id} className={`reveal ${cell}`}>
            <figure className="flex h-full flex-col">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface-container-lowest ring-1 ring-outline-variant/50 md:aspect-auto md:min-h-0 md:flex-1">
                <Image
                  src={caso.image}
                  alt={caso.imageAlt}
                  fill
                  sizes={sizes}
                  className="object-cover"
                />
              </div>
              <figcaption className="mt-sm text-body-sm text-on-surface">
                {caso.title}
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>

      <Link
        href="/casos-a-medida"
        className="mt-xl inline-flex items-center gap-sm font-label-md text-label-md text-primary underline-offset-4 hover:underline"
      >
        Ver casos a medida
        <ArrowRightIcon size={16} aria-hidden />
      </Link>
    </section>
  )
}
