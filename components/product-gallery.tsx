'use client'

import Image from 'next/image'
import { useState } from 'react'
import type { Image as ProductImage } from '@/content/types'

export function ProductGallery({
  images,
}: {
  images: readonly [ProductImage, ...ProductImage[]]
}) {
  const [active, setActive] = useState(0)
  const current = images[active] ?? images[0]

  return (
    <div>
      {/* Visor con fondo propio: las imágenes tienen proporciones y fondos
          distintos (fotos, renders, radiografías) y se muestran enteras. */}
      <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-low ring-1 ring-outline-variant/50">
        <Image
          key={current.src}
          src={current.src}
          alt={current.alt}
          fill
          preload={active === 0}
          sizes="(min-width: 1024px) 48vw, 100vw"
          className="object-contain p-lg"
        />
      </div>

      {images.length > 1 && (
        <ul className="mt-md grid grid-cols-4 gap-sm">
          {images.map((image, index) => (
            <li key={image.src}>
              <button
                type="button"
                onClick={() => setActive(index)}
                aria-label={`Ver imagen ${index + 1}: ${image.alt}`}
                aria-current={index === active ? 'true' : undefined}
                className="relative block aspect-square w-full overflow-hidden rounded-xl bg-surface-container-lowest ring-1 ring-outline-variant/50 transition hover:ring-primary/60 aria-[current=true]:ring-2 aria-[current=true]:ring-primary"
              >
                <Image src={image.src} alt="" fill sizes="120px" className="object-cover" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
