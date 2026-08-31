// Catálogo de fabricación propia. Cada ficha sale del material impreso de
// Innercare: la endoprótesis de fémur del brochure "rev.300326" y el hombro
// reverso de la carpeta institucional (pág. 9).
//
// La línea distribuida (AK Medical: cadera, rodilla, maxilofacial, neurocirugía)
// queda fuera de este archivo hasta resolver permisos de marca e imágenes.
//
// Campos opcionales: `compatibility`, `availableSizes` y `datasheetUrl` pueden
// faltar cuando la fuente no los declara; las vistas los omiten en ese caso.

const products = [
  {
    id: 1,
    slug: 'endoprotesis-modular-femur-customizable',
    name: 'Endoprótesis no convencional modular para fémur customizable',
    shortName: 'Endoprótesis femoral',
    shortDescription:
      'Sistema modular customizable a medida para adaptarse a patologías específicas de cada paciente.',
    category: 'Reconstrucción articular',
    manufacturing: 'Fabricación propia',
    technique: 'Mecanizado CNC',
    material: 'Titanio Ti-6Al-4V',
    indications: 'Pérdida de hueso femoral por trauma o resección.',
    compatibility: 'Cabezas de Cerámica Biolox o Cr-Co con cono morse 12-14',
    specifications: [
      'Cuerpo principal de 40mm y 60mm x 135°, con y sin alas para sutura',
      'Vástagos cementados de Ø10, 11 y 12mm x 120, 140 y 160mm',
      'Suplementos modulares de 40mm a 90mm',
      'Tornillo de cierre',
      'Vástagos curvos disponibles a pedido',
    ],
    availableSizes: [
      '40mm x 135°',
      '60mm x 135°',
      'Ø10 x 120mm',
      'Ø10 x 140mm',
      'Ø10 x 160mm',
      'Ø11 x 120mm',
      'Ø11 x 140mm',
      'Ø11 x 160mm',
      'Ø12 x 120mm',
      'Ø12 x 140mm',
      'Ø12 x 160mm',
    ],
    datasheetUrl: '/endoprotesis-modular-femur-innercare.pdf',
    images: [
      {
        src: '/img/femur-componentes.jpg',
        alt: 'Componentes modulares de titanio de la endoprótesis femoral',
      },
      {
        src: '/img/femur-planificacion.jpg',
        alt: 'Planificación quirúrgica 3D con el plano de resección femoral sugerido',
      },
    ],
  },
  {
    id: 2,
    slug: 'protesis-modular-reversa-hombro',
    name: 'Prótesis modular reversa de hombro',
    shortName: 'Prótesis reversa de hombro',
    shortDescription:
      'Implante que no se fabricaba en el país. Permite obtener mayor estabilidad articular y sustituir la falta de hueso con suplementos combinables.',
    category: 'Reconstrucción articular',
    manufacturing: 'Fabricación propia',
    technique: 'Mecanizado CNC',
    material: 'Titanio biocompatible',
    indications:
      'Reemplazo articular de hombro con déficit óseo que requiere suplementos combinables.',
    specifications: [
      'Implante que no se fabricaba en el país',
      'Permite obtener mayor estabilidad articular',
      'Permite sustituir la falta de hueso con suplementos combinables',
      'Planificación quirúrgica previa sobre el estudio del paciente',
    ],
    images: [
      {
        src: '/img/hombro-implante.jpg',
        alt: 'Prótesis modular reversa de hombro fabricada por Innercare',
      },
      {
        src: '/img/hombro-planificacion-reseccion.jpg',
        alt: 'Segmentación de la escápula con el plano de resección sugerido',
      },
      {
        src: '/img/hombro-planificacion-implante.jpg',
        alt: 'Implante de hombro posicionado sobre el modelo 3D del paciente',
      },
      {
        src: '/img/hombro-radiografia.jpg',
        alt: 'Control radiográfico del implante de hombro colocado',
      },
    ],
  },
]

export default products

export function getProductBySlug(slug) {
  return products.find((product) => product.slug === slug)
}
