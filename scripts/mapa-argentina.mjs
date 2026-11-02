// Genera content/mapa-argentina.ts, el mapa de "Distribución a todo el país"
// (components/home/mapa-argentina.tsx): las provincias, la costa y los
// límites interiores como trazados SVG ya proyectados y simplificados.
//
// Fuente: Natural Earth 10m admin-1 (dominio público), en GeoJSON desde
// github.com/martynafford/natural-earth-geojson. Se baja una vez a una
// carpeta caché fuera del repo (63 MB). Entran las 24 jurisdicciones
// argentinas y las Islas Malvinas (que Natural Earth trae aparte, como FLK,
// y acá se suman a Tierra del Fuego); la Antártida queda afuera porque el
// mapa bicontinental no entra en la sección. Los polígonos se proyectan con
// la transversa de Mercator de components/home/mapa-proyeccion.ts, se
// simplifican preservando los límites compartidos (topojson) y se escriben
// con un decimal. La salida es determinista: `npm run mapa` dos veces da el
// mismo archivo.
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { topology } from 'topojson-server'
import { presimplify, simplify, filter, filterAttachedWeight } from 'topojson-simplify'
import { feature, mesh } from 'topojson-client'
import { proyectarCrudo } from '../components/home/mapa-proyeccion.ts'

const URL_FUENTE =
  'https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/10m/cultural/ne_10m_admin_1_states_provinces.json'
const CACHE = path.join(os.tmpdir(), 'innercare-natural-earth')
const ARCHIVO_FUENTE = path.join(CACHE, 'ne_10m_admin_1_states_provinces.json')
const SALIDA = 'content/mapa-argentina.ts'

// Ancho del viewBox; el alto sale de la proporción del país.
const ANCHO = 400
// Margen alrededor del país, en unidades del viewBox, para que el trazo de la
// costa no se recorte.
const MARGEN = 3
// Umbral de simplificación (área del triángulo de Visvalingam, en unidades
// crudas de la proyección al cuadrado). Calibrado para unos 2 500 puntos.
const UMBRAL = 3e-7
// Islas sueltas más chicas que esto (área en unidades crudas) se descartan.
const ISLA_MINIMA = 1.5e-6
// Nada al sur de este paralelo (sector antártico).
const LATITUD_MINIMA = -56

async function cargarFuente() {
  if (!existsSync(ARCHIVO_FUENTE)) {
    await mkdir(CACHE, { recursive: true })
    console.log(`Bajando Natural Earth a ${ARCHIVO_FUENTE}…`)
    const respuesta = await fetch(URL_FUENTE)
    if (!respuesta.ok) throw new Error(`No se pudo bajar la fuente: ${respuesta.status}`)
    await writeFile(ARCHIVO_FUENTE, Buffer.from(await respuesta.arrayBuffer()))
  }
  return JSON.parse(await readFile(ARCHIVO_FUENTE, 'utf8'))
}

// Polígonos de una geometría, cada uno como lista de anillos
const poligonosDe = (geometria) =>
  geometria.type === 'Polygon' ? [geometria.coordinates] : geometria.coordinates

const latitudMedia = (anillo) => anillo.reduce((suma, [, lat]) => suma + lat, 0) / anillo.length

// Proyecta un anillo y lo cierra
const proyectarAnillo = (anillo) =>
  anillo.map(([lon, lat]) => {
    const { x, y } = proyectarCrudo(lat, lon)
    return [x, y]
  })

const fuente = await cargarFuente()
const argentinas = fuente.features.filter((f) => f.properties.adm0_a3 === 'ARG')
const malvinas = fuente.features.find((f) => f.properties.adm0_a3 === 'FLK')
if (argentinas.length !== 24 || !malvinas) {
  throw new Error(`Se esperaban 24 jurisdicciones y las Malvinas; hay ${argentinas.length}`)
}

const provincias = argentinas
  .map((f) => {
    const id = f.properties.iso_3166_2
    let poligonos = poligonosDe(f.geometry).filter(
      (anillos) => latitudMedia(anillos[0]) > LATITUD_MINIMA,
    )
    if (id === 'AR-V') poligonos = [...poligonos, ...poligonosDe(malvinas.geometry)]
    return {
      type: 'Feature',
      id,
      properties: { nombre: f.properties.name },
      geometry: {
        type: 'MultiPolygon',
        coordinates: poligonos.map((anillos) => anillos.map(proyectarAnillo)),
      },
    }
  })
  .sort((a, b) => a.id.localeCompare(b.id))

// Topología plana (ya proyectada), simplificada y sin islas menores
let topo = topology({ provincias: { type: 'FeatureCollection', features: provincias } }, 1e5)
topo = simplify(presimplify(topo, planarTriangleArea), UMBRAL)
topo = filter(topo, filterAttachedWeight(topo, ISLA_MINIMA, planarRingArea))

function planarTriangleArea([a, b, c]) {
  return Math.abs((a[0] - c[0]) * (b[1] - a[1]) - (a[0] - b[0]) * (c[1] - a[1])) / 2
}
function planarRingArea(anillo) {
  let area = 0
  for (let i = 0, n = anillo.length, j = n - 1; i < n; j = i++) {
    area += anillo[j][0] * anillo[i][1] - anillo[i][0] * anillo[j][1]
  }
  return Math.abs(area) / 2
}

// Encuadre: caja de todos los arcos en unidades crudas
const coleccion = feature(topo, topo.objects.provincias)
let xMin = Infinity
let xMax = -Infinity
let yMin = Infinity
let yMax = -Infinity
let puntos = 0
for (const f of coleccion.features) {
  for (const anillos of f.geometry.coordinates) {
    for (const anillo of anillos) {
      for (const [x, y] of anillo) {
        puntos++
        if (x < xMin) xMin = x
        if (x > xMax) xMax = x
        if (y < yMin) yMin = y
        if (y > yMax) yMax = y
      }
    }
  }
}
const escala = (ANCHO - 2 * MARGEN) / (xMax - xMin)
const alto = Math.ceil((yMax - yMin) * escala + 2 * MARGEN)
const encuadre = {
  ancho: ANCHO,
  alto,
  x0: xMin - MARGEN / escala,
  y0: yMax + MARGEN / escala,
  escala,
}

// Serialización: coordenadas del viewBox con un decimal, lineto implícito
const num = (v) => {
  const s = v.toFixed(1)
  return s === '-0.0' ? '0' : s.replace(/\.0$/, '')
}
const puntoSvg = ([x, y]) => `${num((x - encuadre.x0) * escala)} ${num((encuadre.y0 - y) * escala)}`
const lineaSvg = (linea, cerrar) => {
  const pts = cerrar ? linea.slice(0, -1) : linea
  return `M${pts.map(puntoSvg).join(' ')}${cerrar ? 'Z' : ''}`
}
const dDePoligonos = (multi) =>
  multi.flatMap((anillos) => anillos.map((anillo) => lineaSvg(anillo, true))).join('')
const dDeLineas = (multi) => multi.map((linea) => lineaSvg(linea, false)).join('')

const salidaProvincias = coleccion.features.map((f) => ({
  id: f.id,
  nombre: f.properties.nombre,
  d: dDePoligonos(f.geometry.coordinates),
}))
const contorno = dDeLineas(mesh(topo, topo.objects.provincias, (a, b) => a === b).coordinates)
const limites = dDeLineas(mesh(topo, topo.objects.provincias, (a, b) => a !== b).coordinates)

const ts = `// Generado por scripts/mapa-argentina.mjs (\`npm run mapa\`) a partir de
// Natural Earth 10m admin-1 (dominio público). No editar a mano: cualquier
// ajuste va en el script. Mapa de Argentina de "Distribución a todo el país":
// las 24 jurisdicciones (Malvinas con Tierra del Fuego; sin el sector
// antártico), proyectadas con la transversa de Mercator de
// components/home/mapa-proyeccion.ts y simplificadas a ${puntos} puntos.
// \`contorno\` es la costa y el límite exterior; \`limites\`, los límites
// interprovinciales, cada uno una sola vez.
import type { Encuadre } from '@/components/home/mapa-proyeccion'

export const MAPA: Encuadre = {
  ancho: ${encuadre.ancho},
  alto: ${encuadre.alto},
  x0: ${encuadre.x0},
  y0: ${encuadre.y0},
  escala: ${encuadre.escala},
}

export type Provincia = { id: string; nombre: string; d: string }

export const provincias: readonly Provincia[] = [
${salidaProvincias.map((p) => `  { id: '${p.id}', nombre: '${p.nombre}', d: '${p.d}' },`).join('\n')}
]

export const contorno = '${contorno}'

export const limites = '${limites}'
`
await writeFile(SALIDA, ts)
const kb = (s) => `${(Buffer.byteLength(s) / 1024).toFixed(1)} KB`
console.log(
  `${SALIDA}: ${puntos} puntos, viewBox ${encuadre.ancho}×${encuadre.alto}, provincias ${kb(
    salidaProvincias.map((p) => p.d).join(''),
  )}, contorno ${kb(contorno)}, límites ${kb(limites)}, total ${kb(ts)}`,
)
