import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import type { Product } from '@/content/types'

export function ProductTile({
  product,
  sizes,
}: {
  product: Product
  sizes: string
}) {
  const [image] = product.images

  return (
    <Link href={`/productos/${product.slug}`} className="group block">
      {/* Con multiply, los fondos claros de las fotos toman el tono del
          escenario y las piezas conviven con la paleta neutra. */}
      <div className="relative isolate aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-low">
        <Image
          src={image.src}
          alt={image.alt}
          fill
          sizes={sizes}
          className="object-cover mix-blend-multiply transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
        />
      </div>

      <div className="mt-lg flex items-start justify-between gap-md">
        <div>
          <h3 className="font-headline-md text-headline-md text-on-surface">
            {product.shortName}
          </h3>
          <p className="mt-sm max-w-[48ch] text-body-md text-on-surface-variant">
            {product.shortDescription}
          </p>
        </div>
        <ArrowRightIcon
          size={22}
          aria-hidden
          className="mt-1 shrink-0 text-on-surface transition-transform group-hover:translate-x-1"
        />
      </div>

      <dl className="mt-md flex flex-wrap gap-x-lg gap-y-xs font-data-mono text-data-mono">
        <div className="flex gap-sm">
          <dt className="text-on-surface-variant">Material</dt>
          <dd className="text-on-surface">{product.material}</dd>
        </div>
        <div className="flex gap-sm">
          <dt className="text-on-surface-variant">Técnica</dt>
          <dd className="text-on-surface">{product.technique}</dd>
        </div>
      </dl>
    </Link>
  )
}
