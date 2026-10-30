import Image from 'next/image'
import type { ComponentPropsWithoutRef } from 'react'

// Fotos de planta: vienen con luz y color dispares (dominantes rojas, carteles
// de terceros). Se muestran en blanco y negro con el tono de marca encima para
// que convivan con la paleta. Las fotos de producto no llevan este tratamiento.
// El resto de las props (p. ej. atributos data-*) van al contenedor.
export function PlantPhoto({
  src,
  alt,
  sizes,
  preload,
  className = '',
  ...rest
}: {
  src: string
  alt: string
  sizes: string
  preload?: boolean
  className?: string
} & Omit<ComponentPropsWithoutRef<'div'>, 'children'>) {
  return (
    <div
      {...rest}
      className={`relative overflow-hidden rounded-xl bg-surface-container ring-1 ring-outline-variant/50 ${className}`}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        preload={preload}
        className="object-cover brightness-110 contrast-[1.05] grayscale"
      />
      <div aria-hidden className="absolute inset-0 bg-primary opacity-60 mix-blend-color" />
    </div>
  )
}
