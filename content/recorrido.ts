// Recorrido por el cuerpo de la home: seis paradas, de la cabeza al fémur
// (docs/landing/LANDING_SPEC.md, sección 3, y AJUSTES.md). Textos del guion
// (docs/landing/landing-borrador.html), que cuentan cada caso con los datos
// de customCases.ts; las fotos y sus textos alternativos salen de ahí y de
// products.ts, sin agregar nada que no esté en la fuente.
//
// La fase 3 de la landing monta acá la escena 3D: el orden y los ids de las
// paradas son los del guion de cámara (k = 1…6).

import { customCases, featuredCase } from './customCases'
import type { Image } from './types'

export type ParadaId = 'craneo' | 'maxilar' | 'hombro' | 'acetabulo' | 'femur' | 'intercalar'

export type Parada = {
  id: ParadaId
  // Nombre en el índice anatómico y en la tarjeta
  zona: string
  tipo: 'catalogo' | 'a-medida'
  titulo: string
  descripcion: string
  specs: readonly { label: string; valor: string }[]
  // Lugar de la miniatura 3D de la tarjeta: hasta que exista, la foto de la
  // pieza (del producto o del caso).
  miniatura: Image
  // Vista grande de la escena fija: hasta que llegue el cuerpo 3D, la
  // planificación sobre la anatomía del paciente.
  escena: Image
  // Paradas de catálogo: su ficha
  productoSlug?: string
  datasheetUrl?: string
}

const caso = (id: string) => {
  const found = customCases.find((c) => c.id === id)
  if (!found) throw new Error(`Falta el caso ${id} en content/customCases.ts`)
  return found
}

const craneo = caso('craneoplastia-titanio')
const maxilar = caso('anclaje-dentario')
const acetabulo = caso('reconstruccion-acetabular')
// Caso destacado: [0] estudio, [1] guías, [2] implante y guías fabricados
const imagenIntercalar = (i: number): Image => {
  const found = featuredCase.images[i]
  if (!found) throw new Error(`Falta la imagen ${i} del caso destacado`)
  return { src: found.src, alt: found.alt }
}

export const paradas: readonly Parada[] = [
  {
    id: 'craneo',
    zona: 'Cráneo',
    tipo: 'a-medida',
    titulo: 'Craneoplastía a medida',
    descripcion:
      'A partir de la tomografía reconstruimos el defecto en 3D y fabricamos la pieza en PMMA o en titanio impreso con estructura trabecular.',
    specs: [
      { label: 'Material', valor: 'PMMA o titanio trabecular' },
      { label: 'Técnica', valor: 'Impresión 3D' },
    ],
    miniatura: { src: craneo.image, alt: craneo.imageAlt },
    escena: {
      src: '/img/caso-craneo-3d.jpg',
      alt: 'Reconstrucción 3D del cráneo con el defecto a cubrir',
    },
  },
  {
    id: 'maxilar',
    zona: 'Maxilar',
    tipo: 'a-medida',
    titulo: 'Reconstrucción para anclaje dentario',
    descripcion:
      'Planificamos la cirugía y fabricamos una estructura de reconstrucción que sirve de base para los implantes dentarios.',
    specs: [
      { label: 'Planificación', valor: 'Quirúrgica virtual 3D' },
      { label: 'Desarrollo', valor: 'A pedido médico' },
    ],
    miniatura: { src: maxilar.image, alt: maxilar.imageAlt },
    escena: {
      src: '/img/caso-anclaje-planificacion.jpg',
      alt: 'Planificación 3D de la estructura de anclaje sobre el cráneo del paciente',
    },
  },
  {
    id: 'hombro',
    zona: 'Hombro',
    tipo: 'catalogo',
    titulo: 'Prótesis modular reversa de hombro',
    descripcion:
      'Un implante que no se fabricaba en el país. Da mayor estabilidad articular y suple la falta de hueso con suplementos combinables.',
    specs: [
      { label: 'Material', valor: 'Titanio biocompatible' },
      { label: 'Técnica', valor: 'Mecanizado CNC' },
      { label: 'Indicación', valor: 'Reemplazo de hombro con déficit óseo' },
    ],
    miniatura: {
      src: '/img/hombro-implante.jpg',
      alt: 'Prótesis modular reversa de hombro fabricada por Innercare',
    },
    escena: {
      src: '/img/hombro-planificacion-implante.jpg',
      alt: 'Implante de hombro posicionado sobre el modelo 3D del paciente',
    },
    productoSlug: 'protesis-modular-reversa-hombro',
  },
  {
    id: 'acetabulo',
    zona: 'Acetábulo',
    tipo: 'a-medida',
    titulo: 'Reconstrucción acetabular en titanio trabecular',
    descripcion:
      'Diseñamos el implante y los alojamientos para tornillos sobre la segmentación 3D de la cadera del paciente. También fabricamos espaciadores en PMMA con alojamiento para cotilo.',
    specs: [
      { label: 'Material', valor: 'Titanio trabecular' },
      { label: 'Técnica', valor: 'Impresión 3D' },
    ],
    miniatura: { src: acetabulo.image, alt: acetabulo.imageAlt },
    escena: {
      src: '/img/caso-acetabular-segmentacion.jpg',
      alt: 'Segmentación 3D de la cadera con la prótesis primaria',
    },
  },
  {
    id: 'femur',
    zona: 'Fémur proximal',
    tipo: 'catalogo',
    titulo: 'Endoprótesis modular de fémur',
    descripcion:
      'Sistema modular customizable para pérdida de hueso femoral por trauma o resección.',
    specs: [
      { label: 'Material', valor: 'Titanio Ti-6Al-4V' },
      { label: 'Cuerpo', valor: '40 y 60 mm × 135°' },
      { label: 'Vástagos', valor: 'Ø10 a 12 mm × 120 a 160 mm' },
      { label: 'Cabezas', valor: 'Biolox o Cr-Co, cono morse 12-14' },
    ],
    miniatura: {
      src: '/img/femur-componentes.jpg',
      alt: 'Componentes modulares de titanio de la endoprótesis femoral',
    },
    escena: {
      src: '/img/femur-planificacion.jpg',
      alt: 'Planificación quirúrgica 3D con el plano de resección femoral sugerido',
    },
    productoSlug: 'endoprotesis-modular-femur-customizable',
    datasheetUrl: '/endoprotesis-modular-femur-innercare.pdf',
  },
  {
    id: 'intercalar',
    zona: 'Diáfisis femoral',
    tipo: 'a-medida',
    titulo: 'Implante intercalar de fémur',
    descripcion:
      'Reconstrucción de un segmento femoral con implante y guías de resección diseñados desde la tomografía del paciente.',
    specs: [
      { label: 'Material', valor: 'Titanio Ti-6Al-4V' },
      { label: 'Contacto óseo', valor: 'Estructura trabecular porosa' },
      { label: 'Clavo', valor: 'Endomedular Ø10 × 360 mm' },
    ],
    miniatura: imagenIntercalar(2),
    escena: imagenIntercalar(1),
  },
]

// Cierre del recorrido (k = 7 del guion: el cuerpo entero)
export const cierreRecorrido = {
  titulo: 'Lo que está en el catálogo y lo que no, lo fabricamos nosotros.',
  texto: 'Sistemas modulares listos para pedir y piezas únicas diseñadas con tu equipo quirúrgico.',
}
