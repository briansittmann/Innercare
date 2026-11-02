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
export const fotosPlanta: readonly FotoPlanta[] = [
  {
    src: '/img/carrusel/cnc-planta.webp',
    alt: 'Centros de mecanizado CNC en la planta industrial de Innercare',
    titulo: 'Centros de mecanizado CNC',
    subtitulo: 'Planta de Alberti',
  },
  {
    src: '/img/carrusel/intercalar-implante.webp',
    alt: 'Implante intercalar de fémur junto a las guías de resección fabricadas',
    titulo: 'Implante intercalar de fémur con sus guías',
    subtitulo: 'Pieza a medida en titanio',
  },
  {
    src: '/img/carrusel/femur-componentes.webp',
    alt: 'Componentes modulares de titanio de la endoprótesis femoral',
    titulo: 'Componentes modulares de la endoprótesis femoral',
    subtitulo: 'Mecanizado CNC',
  },
  {
    // La máquina de la foto es de electroerosión, no un centro CNC como dice
    // su alt en manufacturing.tsx. [pendiente: confirmar con Innercare]
    src: '/img/carrusel/sector-mecanizado.webp',
    alt: 'Sector de mecanizado de la planta de Innercare',
    titulo: 'Sector de mecanizado',
    subtitulo: 'Planta de Alberti',
  },
  {
    src: '/img/carrusel/hombro-implante.webp',
    alt: 'Prótesis modular reversa de hombro fabricada por Innercare',
    titulo: 'Prótesis modular reversa de hombro',
    subtitulo: 'Mecanizado CNC',
  },
  {
    src: '/img/carrusel/espaciador-pmma.webp',
    alt: 'Espaciador a medida en PMMA sobre una mesa de acero',
    titulo: 'Espaciador a medida en PMMA',
    subtitulo: 'Guías y espaciadores',
  },
  {
    // [pendiente: confirmar que la foto es de la planta y no del fabricante
    // de la máquina]
    src: '/img/carrusel/impresion-3d.webp',
    alt: 'Equipo de impresión 3D en metal para implantes de titanio',
    titulo: 'Impresión 3D en metal',
    subtitulo: 'Manufactura aditiva',
  },
  {
    src: '/img/carrusel/intercalar-tc.webp',
    alt: 'Estudio tomográfico de los miembros inferiores del paciente',
    titulo: 'Estudio tomográfico del caso',
    subtitulo: 'Planificación',
  },
]
