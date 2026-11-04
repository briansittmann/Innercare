// Datos institucionales verificables, tomados de la carpeta institucional
// (págs. 2 a 6). Son la única fuente de verdad para la home, Contacto y el
// footer: cualquier cifra o credencial que se muestre en el sitio tiene que
// salir de acá. Lo que se edita en el panel llega por los JSON de
// content/datos/ (hero, habilitaciones, distribucion, fabricacion), leídos
// con content/leer.ts; el resto queda escrito acá.

import datosDistribucion from './datos/distribucion.json'
import datosFabricacion from './datos/fabricacion.json'
import datosHabilitaciones from './datos/habilitaciones.json'
import datosHero from './datos/hero.json'
import { nombresJurisdicciones } from './jurisdicciones'
import { Lector, avisar, pendiente } from './leer'
import type { Capacidad, Habilitacion, Manufactura, Sede } from './types'

const hero = new Lector(datosHero, 'Hero')
const habilitacionesDatos = new Lector(datosHabilitaciones, 'Habilitaciones')
const distribucion = new Lector(datosDistribucion, 'Distribución')
const fabricacion = new Lector(datosFabricacion, 'Fabricación')

// Titular del hero; también en el footer, en la imagen para redes y en el
// título de Open Graph
export const tagline = hero.texto('titular', 'Titular')

export const trayectoria =
  'Empresa especializada en distribución, fabricación e importación de productos ' +
  'médicos ortopédicos e implantables. Proveedor mediante licitaciones y concursos ' +
  'en todo el país.'

// Resumen de las tres habilitaciones ANMAT de abajo, para el hero y la
// imagen para redes (texto acordado en docs/landing/AJUSTES.md).
export const habilitacionesResumen = hero.texto('lineaHabilitaciones', 'Línea de habilitaciones')

// Habilitaciones ANMAT y trazabilidad (pág. 4), las filas de la tabla
const ORGANISMOS = ['ANMAT', 'Trazabilidad'] as const
export const habilitaciones: readonly Habilitacion[] = habilitacionesDatos
  .lista('filas', 'Fila')
  .flatMap((fila, i) => {
    const detalle = fila.textoOpcional('detalle')
    const referencia = fila.textoOpcional('referencia')
    if (!detalle || !referencia) {
      avisar(`${fila.nombre}: le falta el detalle o la referencia; se omite`)
      return []
    }
    return [
      {
        id: fila.textoOpcional('id') ?? `habilitacion-${i + 1}`,
        organismo: fila.opcion('organismo', 'Quién la otorga', ORGANISMOS, 'ANMAT'),
        detalle,
        referencia,
      },
    ]
  })

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

// Títulos y bajadas de las secciones de la home (guion de la landing,
// docs/landing/landing-borrador.html).
export const textosHome = {
  fabricacion: {
    titulo: fabricacion.texto('titulo', 'Título'),
    texto: fabricacion.texto('bajada', 'Bajada'),
  },
  habilitaciones: {
    titulo: habilitacionesDatos.texto('titulo', 'Título'),
    texto: habilitacionesDatos.texto('bajada', 'Bajada'),
  },
  distribucion: {
    titulo: distribucion.texto('titulo', 'Título'),
    texto: distribucion.texto('bajada', 'Bajada'),
  },
}

// Tecnologías de fabricación (págs. 5 y 6). Nombre y texto de cada tarjeta
// se editan en el panel; el resto no se usa en la landing.
const tarjetas = fabricacion.hijo('tarjetas', 'Las dos tarjetas')
const cnc = tarjetas.hijo('cnc', 'Mecanizado CNC')
const impresion = tarjetas.hijo('impresion', 'Impresión 3D')
export const manufactura: readonly Manufactura[] = [
  {
    id: 'sustractiva',
    kicker: 'Manufactura sustractiva',
    title: 'Mecanizado CNC en titanio biocompatible',
    nombre: cnc.texto('nombre', 'Nombre'),
    texto: cnc.texto('texto', 'Texto'),
    image: '/img/fabricacion-cnc-planta.jpg',
    imageAlt: 'Centros de mecanizado CNC en la planta industrial de Innercare',
  },
  {
    id: 'aditiva',
    kicker: 'Manufactura aditiva',
    title: 'Impresión 3D en titanio biocompatible',
    nombre: impresion.texto('nombre', 'Nombre'),
    texto: impresion.texto('texto', 'Texto'),
    image: '/img/fabricacion-impresion-3d.jpg',
    imageAlt: 'Equipo de impresión 3D en metal para implantes de titanio',
  },
]

// Lo demás de la sección de Fabricación que se edita: el botón de repetir y
// los textos para lectores de pantalla (components/home/manufacturing.tsx)
const accesibilidadFabricacion = fabricacion.hijo('accesibilidad', 'Lectores de pantalla')
export const fabricacionTextos = {
  volverAVer: fabricacion.texto('volverAVer', 'Botón de repetir'),
  tiraFotos: accesibilidadFabricacion.texto('tira', 'Nombre de la tira de fotos'),
  fotoCncAlt: accesibilidadFabricacion.texto('fotoCnc', 'Foto de planta del mecanizado'),
  fotoImpresionAlt: accesibilidadFabricacion.texto('fotoImpresion', 'Foto de planta de la impresión 3D'),
}

export const distribucionTextos = {
  mapaAria: distribucion.hijo('accesibilidad', 'Lectores de pantalla').texto('mapa', 'Nombre del mapa'),
}

// Infraestructura (pág. 3): las sedes, editadas en el panel. Las fotos van
// acá, por id (son de instalaciones: PlantPhoto); una sede nueva sin foto
// muestra el placeholder "Foto pendiente" hasta que se agregue acá.
const FOTOS_SEDES: Record<string, string> = {
  // [pendiente: foto real del laboratorio; reemplazar el archivo]
  laboratorio: '/img/sedes/laboratorio.webp',
  planta: '/img/fabricacion-cnc-planta.jpg',
  // [pendiente: foto real de la sucursal; reemplazar el archivo]
  'caleta-olivia': '/img/sedes/caleta-olivia.webp',
  // [pendiente: foto real de la sucursal; reemplazar el archivo]
  comodoro: '/img/sedes/comodoro.webp',
}
const FOTO_PENDIENTE = '/img/sedes/laboratorio.webp'
const ROLES = ['laboratorio', 'planta', 'sucursal'] as const
// Natural Earth trae los nombres sin "Provincia de"; el footer lo muestra
// completo
const provinciaCompleta = (nombre: string) =>
  nombre === 'Ciudad de Buenos Aires' ? nombre : `Provincia de ${nombre}`

export const sedes: readonly Sede[] = distribucion.lista('sedes', 'Sede').flatMap((sede) => {
  const id = sede.textoOpcional('id')
  const calle = sede.textoOpcional('calle')
  const localidad = sede.textoOpcional('localidad')
  const latitud = sede.numero('latitud', 'Latitud', { min: -56, max: -21 })
  const longitud = sede.numero('longitud', 'Longitud', { min: -74, max: -53 })
  if (!id || !calle || !localidad || latitud === undefined || longitud === undefined) {
    avisar(`${sede.nombre}: le faltan datos para ubicarla; se omite`)
    return []
  }
  const codigoPostal = sede.textoOpcional('codigoPostal')
  return [
    {
      id,
      rol: sede.opcion('rol', 'Tipo de sede', ROLES, 'sucursal'),
      tipo: sede.texto('tipo', 'Nombre completo'),
      calle,
      localidad: codigoPostal ? `${codigoPostal} ${localidad}` : localidad,
      latitud,
      longitud,
      provincia: provinciaCompleta(sede.opcion('provincia', 'Provincia', nombresJurisdicciones, 'Buenos Aires')),
      phones: sede.listaTextos('telefonos', 'Teléfonos'),
      ...(sede.booleano('principal') ? { principal: true } : {}),
      foto: { src: FOTOS_SEDES[id] ?? FOTO_PENDIENTE, alt: sede.texto('fotoAlt', 'Texto alternativo de la foto') },
    },
  ]
})

// Por si el JSON quedara sin sedes: el footer y el contacto no se rompen
const SEDE_RESPALDO: Sede = {
  id: 'pendiente',
  rol: 'laboratorio',
  tipo: pendiente('Distribución · Sede principal'),
  calle: pendiente('Distribución · Calle'),
  localidad: pendiente('Distribución · Localidad'),
  latitud: -34.61,
  longitud: -58.56,
  provincia: pendiente('Distribución · Provincia'),
  phones: [],
  principal: true,
  foto: { src: FOTO_PENDIENTE, alt: '' },
}

const principales = sedes.filter((sede) => sede.principal)
if (principales.length !== 1) avisar(`Distribución: hay ${principales.length} sedes principales; tiene que haber una`)
export const sedePrincipal: Sede = principales[0] ?? sedes[0] ?? SEDE_RESPALDO

export const direccionCompleta = (sede: Sede) =>
  `${sede.calle}, ${sede.localidad}, ${sede.provincia}, Argentina`

// wa.me exige el número sin espacios, signo ni guiones. El WhatsApp es el
// primer teléfono de la sede principal.
export const whatsappDisplay = sedePrincipal.phones[0] ?? pendiente('Distribución · Teléfono')
export const whatsappNumber = whatsappDisplay.replace(/\D/g, '')
