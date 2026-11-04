import datos from './datos/fabricacion.json'
import { Lector } from './leer'
import type { FotoPlanta } from './types'

// Fotos reales de la planta y de piezas fabricadas, para la tira de
// Fabricación (components/home/carrusel-planta.tsx). Salen de las fotos de
// la carpeta institucional que ya están en public/img/, reducidas a WebP con
// `npm run fotos` (scripts/fotos-carrusel.mjs). Fuera: la radiografía del
// hombro (muestra nombre e identificación de una paciente), los renders de
// planificación (no son fotos) y el molde del espaciador (un bulto blanco
// sobre blanco, no se entiende). Van en color, sin el tratamiento de
// PlantPhoto (docs/DECISIONES.md).
// [pendiente: fotos de la planta con gente trabajando, control de calidad y
// embalaje, pedidas a Innercare]
//
// Los archivos y su orden quedan acá, por clave; los textos de cada foto
// (alt, pie y segunda línea) se editan en el panel (content/datos/
// fabricacion.json, "Tira de fotos"), con la misma clave.
const ARCHIVOS = [
  { clave: 'cnc', src: '/img/carrusel/cnc-planta.webp' },
  { clave: 'intercalar', src: '/img/carrusel/intercalar-implante.webp' },
  { clave: 'femur', src: '/img/carrusel/femur-componentes.webp' },
  // La máquina de la foto es de electroerosión, no un centro CNC como dice
  // su alt en manufacturing.tsx. [pendiente: confirmar con Innercare]
  { clave: 'mecanizado', src: '/img/carrusel/sector-mecanizado.webp' },
  { clave: 'hombro', src: '/img/carrusel/hombro-implante.webp' },
  { clave: 'espaciador', src: '/img/carrusel/espaciador-pmma.webp' },
  // [pendiente: confirmar que la foto es de la planta y no del fabricante
  // de la máquina]
  { clave: 'impresion', src: '/img/carrusel/impresion-3d.webp' },
  { clave: 'tomografia', src: '/img/carrusel/intercalar-tc.webp' },
] as const

const fotos = new Lector(datos, 'Fabricación').hijo('fotos', 'Tira de fotos')

export const fotosPlanta: readonly FotoPlanta[] = ARCHIVOS.map(({ clave, src }, i) => {
  const foto = fotos.hijo(clave, `Foto ${i + 1}`)
  return {
    src,
    alt: foto.texto('alt', 'Texto alternativo'),
    titulo: foto.texto('titulo', 'Pie de foto'),
    subtitulo: foto.texto('subtitulo', 'Segunda línea'),
  }
})
