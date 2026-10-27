// Tipos del contenido institucional. Los campos opcionales son los que la
// fuente impresa no declara para todos los productos: las vistas los omiten
// cuando faltan, nunca se completan con texto inventado.

// Nombre de un icono de Material Symbols (p. ej. 'local_shipping').
export type MaterialSymbol = string

export type Image = {
  src: string
  alt: string
}

export type Habilitacion = {
  id: string
  organismo: 'ANMAT' | 'Trazabilidad'
  detalle: string
  referencia: string
}

export type Capacidad = {
  icon: MaterialSymbol
  title: string
  description: string
}

export type Manufactura = {
  id: 'sustractiva' | 'aditiva'
  kicker: string
  title: string
  image: string
  imageAlt: string
}

export type Sede = {
  id: string
  tipo: string
  calle: string
  localidad: string
  provincia: string
  phones: readonly string[]
  principal?: boolean
}

export type Product = {
  id: number
  slug: string
  name: string
  shortName: string
  shortDescription: string
  category: string
  manufacturing: string
  technique: string
  material: string
  indications: string
  compatibility?: string
  specifications: readonly string[]
  availableSizes?: readonly string[]
  datasheetUrl?: string
  // Al menos una imagen: la primera es la principal de la ficha y la tarjeta.
  images: readonly [Image, ...Image[]]
}

export type ProcesoStep = {
  step: string
  icon: MaterialSymbol
  title: string
  description: string
}

export type FeaturedCase = {
  id: string
  kicker: string
  title: string
  summary: string
  images: readonly (Image & { caption: string })[]
  guias: string
  diseno: readonly string[]
}

export type CustomCase = {
  id: string
  title: string
  description: string
  image: string
  imageAlt: string
}
