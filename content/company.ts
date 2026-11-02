// Datos institucionales verificables, tomados de la carpeta institucional
// (págs. 2 a 6). Son la única fuente de verdad para Nosotros, Contacto y Footer:
// cualquier cifra o credencial que se muestre en el sitio tiene que salir de acá.

import type { Capacidad, Habilitacion, Manufactura, Sede } from './types'

export const tagline = 'Innovación tecnológica en beneficio del paciente'

export const trayectoria =
  'Empresa especializada en distribución, fabricación e importación de productos ' +
  'médicos ortopédicos e implantables. Proveedor mediante licitaciones y concursos ' +
  'en todo el país.'

// Resumen de las tres habilitaciones ANMAT de abajo, para el hero
// (texto acordado en docs/landing/AJUSTES.md).
export const habilitacionesResumen =
  'Habilitados por ANMAT para fabricar, importar y distribuir productos médicos en todo el país.'

// Habilitaciones ANMAT y trazabilidad (pág. 4).
export const habilitaciones: readonly Habilitacion[] = [
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
export const capacidades: readonly Capacidad[] = [
  {
    icon: 'distribucion',
    title: 'Distribución nacional',
    description: 'Distribución de productos médicos a todo el país.',
  },
  {
    icon: 'trazabilidad',
    title: 'Calidad y trazabilidad',
    description:
      'Sistema de gestión de calidad, depósito geolocalizado y trazabilidad de cada unidad.',
  },
  {
    icon: 'a-medida',
    title: 'Implantes a medida',
    description:
      'Planificación, diseño y fabricación de implantes a medida del paciente.',
  },
  {
    icon: 'gestion-digital',
    title: 'Gestión digital de casos',
    description:
      'Sistema digital para la gestión de casos y los registros de producción.',
  },
]

// Textos de las secciones de la home (guion de la landing,
// docs/landing/landing-borrador.html).
export const textosHome = {
  fabricacion: {
    titulo: 'Mecanizado e impresión 3D en la misma planta',
    texto:
      'Con las dos tecnologías resolvemos tanto series modulares como piezas únicas para un paciente.',
  },
  habilitaciones: {
    titulo: 'Habilitados por ANMAT',
    texto:
      'Fabricamos, importamos y distribuimos productos médicos bajo habilitación de la ANMAT, y registramos cada unidad en el Sistema Nacional de Trazabilidad.',
  },
  distribucion: {
    titulo: 'Distribución a todo el país',
    texto:
      'Proveemos a hospitales y clínicas mediante licitaciones y concursos en todo el país, desde nuestra planta y sucursales.',
  },
} as const

// Tecnologías de fabricación (págs. 5 y 6).
export const manufactura: readonly Manufactura[] = [
  {
    id: 'sustractiva',
    kicker: 'Manufactura sustractiva',
    title: 'Mecanizado CNC en titanio biocompatible',
    nombre: 'Mecanizado CNC',
    texto:
      'Partimos de un bloque de titanio y retiramos material hasta la forma final. Así fabricamos los sistemas modulares, con medidas repetibles.',
    image: '/img/fabricacion-cnc-planta.jpg',
    imageAlt: 'Centros de mecanizado CNC en la planta industrial de Innercare',
  },
  {
    id: 'aditiva',
    kicker: 'Manufactura aditiva',
    title: 'Impresión 3D en titanio biocompatible',
    nombre: 'Impresión 3D en titanio',
    texto:
      'Construimos la pieza capa por capa. Permite estructura trabecular porosa donde el implante toca hueso y piezas únicas para un solo paciente.',
    image: '/img/fabricacion-impresion-3d.jpg',
    imageAlt: 'Equipo de impresión 3D en metal para implantes de titanio',
  },
]

// Infraestructura (pág. 3). `phones` sólo está cargado donde la carpeta lo indica.
const telefonosLaboratorio = ['+54 9 11 2066-5434', '+54 9 11 2063-5071'] as const

export const sedePrincipal: Sede = {
  id: 'laboratorio',
  tipo: 'Laboratorio de productos de tecnología médica',
  calle: 'Aráoz de Lamadrid 2741',
  localidad: 'B1678EEC Caseros',
  latitud: -34.61,
  longitud: -58.56,
  provincia: 'Provincia de Buenos Aires',
  phones: telefonosLaboratorio,
  principal: true,
  // [pendiente: foto real del laboratorio; reemplazar el archivo]
  foto: { src: '/img/sedes/laboratorio.webp', alt: 'Laboratorio de Innercare en Caseros' },
}

export const sedes: readonly Sede[] = [
  sedePrincipal,
  {
    id: 'planta',
    tipo: 'Planta industrial',
    calle: 'Av. Arquímedes Hernández 192, Parque Industrial N° 1',
    localidad: 'Alberti',
    latitud: -35.03,
    longitud: -60.28,
    provincia: 'Provincia de Buenos Aires',
    phones: [],
    foto: {
      src: '/img/fabricacion-cnc-planta.jpg',
      alt: 'Centros de mecanizado CNC en la planta industrial de Alberti',
    },
  },
  {
    id: 'caleta-olivia',
    tipo: 'Sucursal Caleta Olivia',
    calle: 'Av. Eva Perón 665',
    localidad: 'Caleta Olivia',
    latitud: -46.44,
    longitud: -67.52,
    provincia: 'Provincia de Santa Cruz',
    phones: [],
    // [pendiente: foto real de la sucursal; reemplazar el archivo]
    foto: { src: '/img/sedes/caleta-olivia.webp', alt: 'Sucursal de Innercare en Caleta Olivia' },
  },
  {
    id: 'comodoro',
    tipo: 'Sucursal Comodoro Rivadavia',
    calle: 'Viamonte 275',
    localidad: 'Comodoro Rivadavia',
    latitud: -45.86,
    longitud: -67.48,
    provincia: 'Provincia de Chubut',
    phones: [],
    // [pendiente: foto real de la sucursal; reemplazar el archivo]
    foto: { src: '/img/sedes/comodoro.webp', alt: 'Sucursal de Innercare en Comodoro Rivadavia' },
  },
]

export const direccionCompleta = (sede: Sede) =>
  `${sede.calle}, ${sede.localidad}, ${sede.provincia}, Argentina`

// wa.me exige el número sin espacios, signo ni guiones.
export const whatsappDisplay = telefonosLaboratorio[0]
export const whatsappNumber = whatsappDisplay.replace(/\D/g, '')
