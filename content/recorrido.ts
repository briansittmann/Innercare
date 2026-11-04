// Recorrido por el cuerpo de la home: seis paradas, de la cabeza al fémur
// (docs/landing/LANDING_SPEC.md, sección 3, y AJUSTES.md). Los textos de
// cada parada, el cierre y las etiquetas se editan en el panel
// (content/datos/recorrido.json, singleton "Recorrido de implantes"); las
// fichas PDF, en su propio singleton (content/datos/fichas.json, "Fichas
// técnicas (PDF)", por id de parada); las fotos salen de customCases.ts y
// products.ts, sin agregar nada que no esté en la fuente.
//
// La escena 3D se monta sobre estas paradas: el orden, los ids, el tipo
// (catálogo o a medida) y el producto de cada una son código, los del guion
// de cámara (k = 1…6, components/recorrido-3d/camara.ts e implantes.ts).

import { customCases, featuredCase } from './customCases'
import datosFichas from './datos/fichas.json'
import datos from './datos/recorrido.json'
import { Lector, avisar } from './leer'
import { NOMBRES_PARADAS, type ParadaId } from './paradas'
import type { Image } from './types'

export type { ParadaId }

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
  // La ficha técnica en PDF, subida desde el panel (public/fichas/<id>.pdf)
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

// Lo que es código de cada parada: tipo, fotos, producto. El orden es el del
// guion de cámara.
const FIJO: readonly {
  id: ParadaId
  tipo: Parada['tipo']
  miniatura: string
  escena: Image
  productoSlug?: string
}[] = [
  {
    id: 'craneo',
    tipo: 'a-medida',
    miniatura: craneo.image,
    escena: { src: '/img/caso-craneo-3d.jpg', alt: 'Reconstrucción 3D del cráneo con el defecto a cubrir' },
  },
  {
    id: 'maxilar',
    tipo: 'a-medida',
    miniatura: maxilar.image,
    escena: {
      src: '/img/caso-anclaje-planificacion.jpg',
      alt: 'Planificación 3D de la estructura de anclaje sobre el cráneo del paciente',
    },
  },
  {
    id: 'hombro',
    tipo: 'catalogo',
    miniatura: '/img/hombro-implante.jpg',
    escena: {
      src: '/img/hombro-planificacion-implante.jpg',
      alt: 'Implante de hombro posicionado sobre el modelo 3D del paciente',
    },
    productoSlug: 'protesis-modular-reversa-hombro',
  },
  {
    id: 'acetabulo',
    tipo: 'a-medida',
    miniatura: acetabulo.image,
    escena: {
      src: '/img/caso-acetabular-segmentacion.jpg',
      alt: 'Segmentación 3D de la cadera con la prótesis primaria',
    },
  },
  {
    id: 'femur',
    tipo: 'catalogo',
    miniatura: '/img/femur-componentes.jpg',
    escena: {
      src: '/img/femur-planificacion.jpg',
      alt: 'Planificación quirúrgica 3D con el plano de resección femoral sugerido',
    },
    productoSlug: 'endoprotesis-modular-femur-customizable',
  },
  {
    id: 'intercalar',
    tipo: 'a-medida',
    miniatura: imagenIntercalar(2).src,
    escena: imagenIntercalar(1),
  },
]

const recorrido = new Lector(datos, 'Recorrido de implantes')
const fichas = new Lector(datosFichas, 'Fichas técnicas (PDF)')

export const paradas: readonly Parada[] = FIJO.map((fijo) => {
  const textos = recorrido.hijo(fijo.id, NOMBRES_PARADAS[fijo.id])
  const specs = textos.lista('specs', 'Dato técnico').flatMap((dato) => {
    const label = dato.textoOpcional('etiqueta')
    const valor = dato.textoOpcional('valor')
    if (!label || !valor) {
      avisar(`${dato.nombre}: le falta el dato o el valor; se omite`)
      return []
    }
    return [{ label, valor }]
  })
  const datasheetUrl = fichas.pdf(fijo.id, `${NOMBRES_PARADAS[fijo.id]}: ficha técnica`)
  return {
    id: fijo.id,
    zona: textos.texto('zona', 'Zona anatómica'),
    tipo: fijo.tipo,
    titulo: textos.texto('titulo', 'Título'),
    descripcion: textos.texto('descripcion', 'Descripción'),
    specs,
    miniatura: { src: fijo.miniatura, alt: textos.texto('miniaturaAlt', 'Texto alternativo de la foto') },
    escena: fijo.escena,
    ...(fijo.productoSlug ? { productoSlug: fijo.productoSlug } : {}),
    ...(datasheetUrl ? { datasheetUrl } : {}),
  }
})

// Cierre del recorrido (k = 7 del guion: el cuerpo entero)
const cierre = recorrido.hijo('cierre', 'Cierre del recorrido')
export const cierreRecorrido = {
  titulo: cierre.texto('titulo', 'Título'),
  texto: cierre.texto('texto', 'Bajada'),
}

const etiquetas = recorrido.hijo('etiquetas', 'Etiquetas de las tarjetas')
const accesibilidad = recorrido.hijo('accesibilidad', 'Lectores de pantalla')

// Etiquetas y avisos del recorrido (components/home/tour.tsx y tour-scroll.tsx)
export const recorridoTextos = {
  avisoContinuar: recorrido.texto('avisoContinuar', 'Aviso de continuar'),
  etiquetas: {
    aMedida: etiquetas.texto('aMedida', 'Implante a medida'),
    catalogo: etiquetas.texto('catalogo', 'Implante de catálogo'),
    fichaTecnica: etiquetas.texto('fichaTecnica', 'Enlace a la ficha PDF'),
  },
  accesibilidad: {
    escena: accesibilidad.texto('escena', 'Descripción del cuerpo 3D'),
    indice: accesibilidad.texto('indice', 'Nombre del índice'),
  },
}
