// Compuerta del build: valida los contenidos editables (content/datos/*.json)
// antes de `next build`. Lee cada sección con el lector de Keystatic y el
// mismo esquema del panel (keystatic.esquema.ts), que comprueba obligatorios,
// largos, patrones, opciones y claves desconocidas, y suma lo que el esquema
// no puede: una sola sede principal, que cada ficha PDF exista y sea un PDF,
// identificadores únicos y que ninguna foto quede sin texto alternativo.
//
// Si algo falla, imprime cada error en español, con la sección y el campo
// como los ve el editor, y termina con código 1: en Vercel el build se corta
// y queda publicada la versión anterior. Se corre con `npm run contenido` y
// al principio de `npm run build`.
import { access } from 'node:fs/promises'
import { join } from 'node:path'
import { config } from '@keystatic/core'
import { createReader } from '@keystatic/core/reader'
import { LIMITES, singletons } from '../keystatic.esquema.ts'

const raiz = process.cwd()
const reader = createReader(raiz, config({ storage: { kind: 'local' }, singletons }))

const errores = []
const error = (seccion, mensaje) => errores.push(`${seccion}: ${mensaje}`)

// La ruta de un campo ("sedes.1.latitud") como la ve el editor
// ("Sedes › 2 › Latitud"), caminando el esquema
function etiquetaDe(schema, ruta) {
  const partes = []
  let actual = { kind: 'object', fields: schema }
  for (const segmento of ruta.split('.').filter(Boolean)) {
    if (actual?.kind === 'object') {
      actual = actual.fields[segmento]
      partes.push(actual?.label ?? segmento)
    } else if (actual?.kind === 'array') {
      partes.push(String(Number(segmento) + 1))
      actual = actual.element
    } else {
      partes.push(segmento)
    }
  }
  return { etiqueta: partes.join(' › '), campo: actual?.label ?? partes.at(-1) ?? '' }
}

// Los mensajes del lector de Keystatic, en español
function traducir(mensaje, campo) {
  const sinEtiqueta = campo && mensaje.startsWith(campo + ' ') ? mensaje.slice(campo.length + 1) : mensaje
  const reglas = [
    [/^must not be empty$/, () => 'no puede quedar vacío'],
    [/^must be no longer than (\d+) characters$/, (m) => `no puede tener más de ${m[1]} caracteres`],
    [/^must be at least (\d+) characters long$/, (m) => `tiene que tener al menos ${m[1]} caracteres`],
    [/^must be at least (-?[\d.]+)$/, (m) => `tiene que ser como mínimo ${m[1]}`],
    [/^must be at most (-?[\d.]+)$/, (m) => `tiene que ser como máximo ${m[1]}`],
    [/^Must have at least (\d+) element/, (m) => `tiene que tener al menos ${m[1]} ${m[1] === '1' ? 'elemento' : 'elementos'}`],
    [/^Must have at most (\d+) element/, (m) => `tiene que tener como máximo ${m[1]} ${m[1] === '1' ? 'elemento' : 'elementos'}`],
    [/^Key on object value "(.+)" is not allowed$/, (m) => `la clave «${m[1]}» no existe en el esquema (¿quedó de una versión anterior?)`],
    [/^Must be a valid option$/, () => 'no es una de las opciones del desplegable'],
    [/^Must be a string$/, () => 'tiene que ser un texto'],
    [/^Must be a number$/, () => 'tiene que ser un número'],
    [/^Must be a boolean$/, () => 'tiene que ser verdadero o falso'],
    [/^Must be an object$/, () => 'tiene que ser un objeto'],
    [/^Must be an array$/, () => 'tiene que ser una lista'],
  ]
  for (const [regex, texto] of reglas) {
    const m = sinEtiqueta.match(regex)
    if (m) return texto(m)
  }
  // Los mensajes de los patrones ya están en español (keystatic.esquema.ts)
  return sinEtiqueta
}

const existe = (ruta) =>
  access(ruta).then(
    () => true,
    () => false,
  )

const leidos = {}
for (const [clave, definicion] of Object.entries(singletons)) {
  const archivo = `${definicion.path}.json`
  try {
    const datos = await reader.singletons[clave].read()
    if (!datos) {
      error(definicion.label, `falta el archivo ${archivo}`)
      continue
    }
    leidos[clave] = datos
  } catch (causa) {
    if (causa instanceof SyntaxError) {
      error(definicion.label, `${archivo} no es un JSON válido (${causa.message})`)
    } else if (/^Invalid data for singleton/.test(causa.message)) {
      const lineas = causa.message.split('\n').slice(1).filter(Boolean)
      for (const linea of lineas) {
        const [, ruta = '', mensaje = linea] = linea.match(/^([^:]*): (.*)$/) ?? []
        const { etiqueta, campo } = etiquetaDe(definicion.schema, ruta)
        error(definicion.label, `${etiqueta ? etiqueta + ': ' : ''}${traducir(mensaje, campo)}`)
      }
    } else {
      error(definicion.label, causa.message)
    }
  }
}

// Lo que el esquema no puede comprobar. Primero, las combinaciones de
// textos que comparten un espacio (docs/landing/textos-editables/LIMITES.md,
// "Combinaciones"): un tope por campo no alcanza.
const largo = (...textos) => textos.reduce((suma, texto) => suma + (texto?.length ?? 0), 0)
const menu = leidos.menu
if (menu) {
  const enlaces = Object.values(menu.enlaces)
  if (largo(...enlaces) > LIMITES.sumaMenu) {
    error('Menú y footer', `Enlaces del menú: entre las cuatro etiquetas suman ${largo(...enlaces)} caracteres y no pueden pasar de ${LIMITES.sumaMenu} (la barra se descentra)`)
  }
}
const hero = leidos.hero
if (hero && menu) {
  const botones = largo(menu.plantearCaso, hero.botonRecorrer)
  if (botones > LIMITES.sumaBotonesHero) {
    error('Hero', `Botón de vidrio y «${menu.plantearCaso}» suman ${botones} caracteres y no pueden pasar de ${LIMITES.sumaBotonesHero} (van en una fila en el celular)`)
  }
  const ogTitulo = `${menu.marca} | ${hero.titular}`
  if (ogTitulo.length > LIMITES.ogTitulo) {
    error('Hero', `Titular: el título para redes «${ogTitulo}» mide ${ogTitulo.length} caracteres y no puede pasar de ${LIMITES.ogTitulo}`)
  }
}
const proceso = leidos.proceso
if (proceso) {
  const leyenda = Object.values(proceso.leyenda)
  if (largo(...leyenda) > LIMITES.sumaLeyenda) {
    error('Cómo trabajamos', `Leyenda de la pieza: entre las tres suman ${largo(...leyenda)} caracteres y no pueden pasar de ${LIMITES.sumaLeyenda} (una fila en el celular)`)
  }
}

const distribucion = leidos.distribucion
if (distribucion) {
  distribucion.sedes.forEach((sede, i) => {
    const direccion = `${sede.calle}, ${sede.localidad}`
    if (direccion.length > LIMITES.direccionCard) {
      error('Distribución', `Sedes › ${i + 1} › Calle y número: «${direccion}» mide ${direccion.length} caracteres y la tarjeta admite hasta ${LIMITES.direccionCard}`)
    }
    const tipoMostrado = sede.rol === 'sucursal' ? 'Sucursal' : sede.tipo
    const card = largo(tipoMostrado, sede.calle, sede.localidad)
    if (card > LIMITES.sumaSedeCard) {
      error('Distribución', `Sedes › ${i + 1}: nombre, calle y localidad suman ${card} caracteres en la tarjeta y no pueden pasar de ${LIMITES.sumaSedeCard}`)
    }
  })
  const principales = distribucion.sedes.filter((sede) => sede.principal)
  if (principales.length !== 1) {
    error(
      'Distribución',
      `tiene que haber exactamente una sede principal marcada (hay ${principales.length}): es la del footer y el contacto`,
    )
  }
  const ids = distribucion.sedes.map((sede) => sede.id)
  for (const id of new Set(ids.filter((id, i) => ids.indexOf(id) !== i))) {
    error('Distribución', `Sedes: el identificador «${id}» está repetido`)
  }
}

const habilitaciones = leidos.habilitaciones
if (habilitaciones) {
  const ids = habilitaciones.filas.map((fila) => fila.id)
  for (const id of new Set(ids.filter((id, i) => ids.indexOf(id) !== i))) {
    error('Habilitaciones', `Filas de la tabla: el identificador «${id}» está repetido`)
  }
}

const recorrido = leidos.recorrido
if (recorrido) {
  for (const [clave, campo] of Object.entries(singletons.recorrido.schema)) {
    if (!('ficha' in (campo.fields ?? {}))) continue
    const parada = recorrido[clave]
    const nombre = `${campo.label} › Ficha técnica (PDF)`
    if (!parada.miniaturaAlt?.trim()) error('Recorrido de implantes', `${campo.label}: la foto no tiene texto alternativo`)
    if (!parada.ficha) continue
    if (!/\.pdf$/i.test(parada.ficha)) {
      error('Recorrido de implantes', `${nombre}: el archivo «${parada.ficha}» no es un PDF`)
    } else if (!(await existe(join(raiz, 'public', parada.ficha)))) {
      error('Recorrido de implantes', `${nombre}: no está el archivo public${parada.ficha}`)
    }
  }
}

const fabricacion = leidos.fabricacion
if (fabricacion) {
  for (const [clave, foto] of Object.entries(fabricacion.fotos)) {
    if (!foto.alt?.trim()) {
      error('Fabricación', `Tira de fotos › ${singletons.fabricacion.schema.fotos.fields[clave].label}: le falta el texto alternativo`)
    }
  }
}

if (errores.length > 0) {
  console.error(`\nEl contenido tiene ${errores.length === 1 ? 'un error' : `${errores.length} errores`}. Corregilo en el panel (/keystatic) o en content/datos/:\n`)
  for (const mensaje of errores) console.error(`  ERROR  ${mensaje}`)
  console.error('')
  process.exit(1)
}

console.log(`Contenido OK: ${Object.keys(leidos).length} secciones validadas.`)
