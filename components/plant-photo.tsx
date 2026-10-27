import Image from 'next/image'

// Fotos de planta: vienen con luz y color dispares (dominantes rojas, carteles
// de terceros). Se muestran en blanco y negro con el tono de marca encima para
// que convivan con la paleta. Las fotos de producto no llevan este tratamiento.
export function PlantPhoto({
  src,
  alt,
  sizes,
  preload,
  className = '',
}: {
  src: string
  alt: string
  sizes: string
  preload?: boolean
  className?: string
}) {
  return (
    <div
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
