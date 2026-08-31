// Casos a medida documentados en la carpeta institucional (págs. 10 a 15).
// Los textos son los de la carpeta: no agregar indicaciones, resultados ni
// cifras clínicas que no estén en la fuente.

export const proceso = [
  {
    step: '01',
    icon: 'monitor_heart',
    title: 'Planificación quirúrgica virtual 3D',
    description:
      'Sobre los estudios del paciente se segmenta la anatomía, se define el plano de resección y se acuerda la estrategia con el equipo quirúrgico.',
  },
  {
    step: '02',
    icon: 'draw',
    title: 'Diseño del implante y del instrumental',
    description:
      'Se diseña el implante a medida junto con las guías de resección, biomodelos y accesorios que requiere el procedimiento.',
  },
  {
    step: '03',
    icon: 'precision_manufacturing',
    title: 'Fabricación en titanio biocompatible',
    description:
      'Se fabrica por mecanizado CNC o impresión 3D, con estructura trabecular porosa en las áreas de contacto con el hueso.',
  },
]

// Caso destacado: la carpeta lo desarrolla en dos páginas con detalle de diseño.
export const featuredCase = {
  id: 'implante-intercalar-femur',
  kicker: 'Caso destacado',
  title: 'Implante intercalar de fémur a medida del paciente',
  summary:
    'Reconstrucción de un segmento femoral con implante y guías diseñados a partir de la tomografía del paciente.',
  images: [
    {
      src: '/img/caso-intercalar-tc.jpg',
      alt: 'Estudio tomográfico de los miembros inferiores del paciente',
      caption: 'Estudio del paciente',
    },
    {
      src: '/img/caso-intercalar-guias.jpg',
      alt: 'Guías de resección a medida montadas sobre el modelo del fémur',
      caption: 'Guías de resección a medida',
    },
    {
      src: '/img/caso-intercalar-implante.jpg',
      alt: 'Implante intercalar de fémur junto a las guías de resección fabricadas',
      caption: 'Implante y guías fabricados',
    },
  ],
  guias:
    'Se fabrican dos guías de resección a medida del paciente para realizar las ' +
    'osteotomías. Las mismas se fijan con clavijas roscadas Ø 2,5 mm.',
  diseno: [
    'Implante intercalar a medida en aleación de titanio (Ti-6Al-4V).',
    'Estructura maciza microperforada en las zonas en contacto con tejido blando.',
    'Estructura trabecular porosa en las áreas de contacto con el hueso.',
    'Alojamientos oblicuos en la parte proximal y distal para tornillos Ø 3,5 mm.',
    'Permite la colocación de clavo endomedular anterógrado Ø 10 mm y longitud 360 mm.',
  ],
}

const customCases = [
  {
    id: 'planificacion-espaciador-cotilo',
    title: 'Guías de resección y espaciador en PMMA',
    description:
      'Planificación quirúrgica, fabricación de guías para resección y de espaciador en PMMA con alojamiento para cotilo.',
    image: '/img/caso-espaciador-pmma.jpg',
    imageAlt: 'Espaciador en PMMA con alojamiento para cotilo fabricado a medida',
  },
  {
    id: 'biomodelos',
    title: 'Biomodelos y accesorios a pedido médico',
    description:
      'Biomodelos, guías y accesorios desarrollados a pedido médico a partir de la planificación quirúrgica virtual 3D.',
    image: '/img/caso-planificacion-3d.jpg',
    imageAlt: 'Segmentación 3D de pelvis en tres vistas para planificación quirúrgica',
  },
  {
    id: 'anclaje-dentario',
    title: 'Reconstrucción para anclaje de implantes dentarios',
    description:
      'Planificación quirúrgica y fabricación de implante de reconstrucción de estructura para anclaje de implantes dentarios.',
    image: '/img/caso-anclaje-dentario.jpg',
    imageAlt: 'Biomodelo maxilofacial con la estructura de anclaje para implantes dentarios',
  },
  {
    id: 'correccion-desvio',
    title: 'Corrección de desvío con espaciador a medida',
    description:
      'Planificación quirúrgica para corrección de desvío, diseño de espaciador y fabricación de moldes para la confección intraoperatoria del espaciador.',
    image: '/img/caso-correccion-desvio.jpg',
    imageAlt: 'Planificación 3D de la corrección de desvío sobre el hueso del paciente',
  },
  {
    id: 'estructura-porosa',
    title: 'Implante con estructura porosa',
    description:
      'Implante con estructura porosa en las superficies en contacto con el hueso, presentado sobre el biomodelo del defecto.',
    image: '/img/caso-porosa-biomodelo.jpg',
    imageAlt: 'Implante poroso presentado sobre el biomodelo del defecto óseo',
  },
  {
    id: 'reconstruccion-acetabular',
    title: 'Reconstrucción acetabular 3D en titanio trabecular',
    description:
      'Segmentación de la prótesis primaria con displasia de cadera, diseño del implante y de los alojamientos para tornillos.',
    image: '/img/caso-acetabular-tornillos.jpg',
    imageAlt: 'Diseño del implante acetabular con los alojamientos para tornillos',
  },
  {
    id: 'craneoplastia-pmma',
    title: 'Craneoplastía a medida en PMMA',
    description:
      'A partir de la tomografía se reconstruye el defecto craneal en 3D y se fabrica la pieza a medida en PMMA.',
    image: '/img/caso-craneoplastia-pmma.jpg',
    imageAlt: 'Craneoplastía a medida en PMMA sobre el biomodelo del cráneo',
  },
  {
    id: 'craneoplastia-titanio',
    title: 'Craneoplastía a medida en titanio trabecular',
    description:
      'Pieza craneal a medida fabricada por impresión 3D en titanio, con estructura trabecular en toda su superficie.',
    image: '/img/caso-craneoplastia-titanio.jpg',
    imageAlt: 'Craneoplastía a medida en titanio trabecular sobre el biomodelo del cráneo',
  },
]

export default customCases
