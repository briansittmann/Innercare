// Datos institucionales verificables, tomados de la carpeta institucional
// (págs. 2 a 6). Son la única fuente de verdad para Nosotros, Contacto y Footer:
// cualquier cifra o credencial que se muestre en el sitio tiene que salir de acá.

export const tagline = 'Innovación tecnológica en beneficio del paciente'

export const trayectoria =
  'Empresa especializada en distribución, fabricación e importación de productos ' +
  'médicos ortopédicos e implantables. Proveedor mediante licitaciones y concursos ' +
  'en todo el país.'

// Habilitaciones ANMAT y trazabilidad (pág. 4).
export const habilitaciones = [
  {
    id: 'anmat-fabricacion',
    organismo: 'ANMAT',
    detalle: 'Importación y fabricación de productos médicos',
    referencia: 'Disposición 0999/17',
  },
  {
    id: 'anmat-bpf',
    organismo: 'ANMAT',
    detalle: 'Certificado de Buenas Prácticas de Fabricación',
    referencia: 'N° 298-2023-R',
  },
  {
    id: 'anmat-distribucion',
    organismo: 'ANMAT',
    detalle: 'Habilitación de empresa distribuidora de productos médicos',
    referencia: 'Disposición 9682/16',
  },
  {
    id: 'trazabilidad',
    organismo: 'Trazabilidad',
    detalle: 'Inscripción en el Sistema Nacional de Trazabilidad',
    referencia: 'GLN 7798276610001 · Sub-GLN 7798276610018',
  },
]

// Capacidades declaradas en la carpeta (pág. 4).
export const capacidades = [
  {
    icon: 'local_shipping',
    title: 'Distribución nacional',
    description: 'Distribución de productos médicos a todo el país.',
  },
  {
    icon: 'inventory_2',
    title: 'Calidad y trazabilidad',
    description:
      'Sistema de gestión de calidad, depósito geolocalizado y trazabilidad de cada unidad.',
  },
  {
    icon: '3d_rotation',
    title: 'Implantes a medida',
    description:
      'Planificación, diseño y fabricación de implantes a medida del paciente.',
  },
  {
    icon: 'lan',
    title: 'Gestión digital de casos',
    description:
      'Sistema digital para la gestión de casos y los registros de producción.',
  },
]

// Tecnologías de fabricación (págs. 5 y 6).
export const manufactura = [
  {
    id: 'sustractiva',
    kicker: 'Manufactura sustractiva',
    title: 'Mecanizado CNC en titanio biocompatible',
    image: '/img/fabricacion-cnc-planta.jpg',
    imageAlt: 'Centros de mecanizado CNC en la planta industrial de Innercare',
  },
  {
    id: 'aditiva',
    kicker: 'Manufactura aditiva',
    title: 'Impresión 3D en titanio biocompatible',
    image: '/img/fabricacion-impresion-3d.jpg',
    imageAlt: 'Equipo de impresión 3D en metal para implantes de titanio',
  },
]

// Infraestructura (pág. 3). `phones` sólo está cargado donde la carpeta lo indica.
export const sedes = [
  {
    id: 'laboratorio',
    tipo: 'Laboratorio de productos de tecnología médica',
    calle: 'Aráoz de Lamadrid 2741',
    localidad: 'B1678EEC Caseros',
    provincia: 'Provincia de Buenos Aires',
    phones: ['+54 9 11 2066-5434', '+54 9 11 2063-5071'],
    principal: true,
  },
  {
    id: 'planta',
    tipo: 'Planta industrial',
    calle: 'Av. Arquímedes Hernández 192, Parque Industrial N° 1',
    localidad: 'Alberti',
    provincia: 'Provincia de Buenos Aires',
    phones: [],
  },
  {
    id: 'caleta-olivia',
    tipo: 'Sucursal Caleta Olivia',
    calle: 'Av. Eva Perón 665',
    localidad: 'Caleta Olivia',
    provincia: 'Provincia de Santa Cruz',
    phones: [],
  },
  {
    id: 'comodoro',
    tipo: 'Sucursal Comodoro Rivadavia',
    calle: 'Viamonte 275',
    localidad: 'Comodoro Rivadavia',
    provincia: 'Provincia de Chubut',
    phones: [],
  },
]

export const sedePrincipal = sedes.find((sede) => sede.principal)

export const direccionCompleta = (sede) =>
  `${sede.calle}, ${sede.localidad}, ${sede.provincia}, Argentina`

// wa.me exige el número sin espacios, signo ni guiones.
export const whatsappDisplay = sedePrincipal.phones[0]
export const whatsappNumber = whatsappDisplay.replace(/\D/g, '')
