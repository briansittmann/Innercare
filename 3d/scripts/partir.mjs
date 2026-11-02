// Compresión del cuerpo (cuerpo.glb de implantes.py) partido en mallas por
// zona. Son comandos propios de la CLI de gltf-transform, que se cargan con
// --config (los corre 3d/scripts/modelos.sh):
//
//   gltf-transform partir <cuerpo-optimizado.glb> <cuerpo-cabeza.glb> [--resto <resto.glb>] --config 3d/scripts/partir.mjs
//   gltf-transform verificar <cuerpo-entero.glb> <partidos.glb...> --config 3d/scripts/partir.mjs
//
// `partir` recibe el cuerpo de `optimize --compress false` (simplificado,
// sin cuantizar), lo cuantiza y comprime con meshopt como `optimize
// --compress meshopt` y, antes de escribirlo, parte la piel y la columna
// copiando los valores ya cuantizados. Con --resto escribe dos archivos: el
// principal, solo con lo que se ve en el hero (MALLAS_HERO), y el resto.
// `verificar` compara el resultado con el de `optimize --compress meshopt`:
// tienen que ser los mismos triángulos con los mismos valores.
//
// Por qué así y no en Blender (docs/landing/BITACORA.md, "Cuerpo único,
// fase 2"): optimize simplifica cada malla con un error relativo a su tamaño
// (la piel pasa de 120 000 a 62 000 triángulos) y la cuantiza en una grilla
// propia. Partida antes, cada trozo se simplifica por separado (la piel
// quedaba en 108 000 triángulos) y se cuantiza en otra grilla (la junta se
// abre). Partida acá, después de cuantizar y en la misma pasada, cada trozo
// tiene exactamente los triángulos, los vértices y las normales de la malla
// entera, y el mismo nodo (la traslación y la escala de la cuantización): la
// junta es estanca, las normales son las de antes y se ve igual. Tampoco se
// puede partir el archivo ya comprimido: volver a comprimir pasa otra vez
// las normales por el filtro octaédrico y corre algunas.
//
// Qué parte:
// - piel → piel_cabeza, piel_torso y piel_piernas, por caras completas
//   según la altura de su vértice más alto (ZONAS_PIEL). piel_cabeza es lo
//   que llega arriba del corte del hero (1,22 m, CORTE_PIEL en
//   components/recorrido-3d/aspecto-hero.ts): en la toma del hero, la
//   escena oculta las otras dos. piel_torso empieza debajo de la punta de
//   los dedos (0,686 m), así la junta no cruza las manos.
// - hueso_columna → hueso_columna_alta y hueso_columna_baja, por piezas
//   sueltas (vértebras y discos) según la altura media de cada una, con el
//   mismo corte que la piel: las de arriba son las del hero.

import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'

// Alturas en metros del mundo (pies en 0)
const CORTE_PIEL = 1.22
const ZONAS_PIEL = [
  ['piel_cabeza', CORTE_PIEL],
  ['piel_torso', 0.68],
  ['piel_piernas', -Infinity],
]
const CORTE_COLUMNA = 1.22
// Lo que se ve en la toma del hero (HUESOS_BUSTO en aspecto-hero.ts, más la
// piel de arriba del corte)
const MALLAS_HERO = new Set([
  'piel_cabeza',
  'hueso_craneo',
  'hueso_maxilar_entero',
  'hueso_mandibula',
  'hueso_columna_alta',
])

// Los módulos de la propia CLI, en su versión ESM: las mismas instancias que
// usa ella (las clases del documento tienen que coincidir). Se buscan desde
// el ejecutable de la CLI (process.argv[1]).
async function deLaCli(nombre) {
  const ruta = createRequire(process.argv[1]).resolve(nombre).replace(/index\.cjs$/, 'index.js')
  return import(pathToFileURL(ruta).href)
}

const M4 = (m, p) => [
  m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12],
  m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13],
  m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14],
]

function nodoDe(doc, nombre) {
  const nodo = doc.getRoot().listNodes().find((n) => n.getMesh()?.getName() === nombre)
  if (!nodo) throw new Error(`partir: falta la malla ${nombre}`)
  const primitivas = nodo.getMesh().listPrimitives()
  if (primitivas.length !== 1) throw new Error(`partir: ${nombre} tiene ${primitivas.length} primitivas`)
  return nodo
}

// Posiciones decodificadas (como las lee three) de la primitiva del nodo, y
// altura en el mundo de cada vértice
function posiciones(nodo) {
  const pos = nodo.getMesh().listPrimitives()[0].getAttribute('POSITION')
  const m = nodo.getWorldMatrix()
  const local = []
  const y = new Float64Array(pos.getCount())
  for (let i = 0; i < y.length; i++) {
    const p = pos.getElement(i, [0, 0, 0])
    local.push(p)
    y[i] = M4(m, p)[1]
  }
  return { local, y }
}

// Arma una malla nueva con los triángulos `tris` de la primitiva del nodo:
// copia los valores crudos (cuantizados) de los vértices que usa, en el
// orden en que aparecen (el que dejó meshopt), y un nodo con la misma
// matriz.
function extraer(doc, nodo, tris, nombre) {
  const prim = nodo.getMesh().listPrimitives()[0]
  const indices = prim.getIndices().getArray()
  const nuevo = new Map()
  const orden = []
  const idx = new Uint32Array(tris.length * 3)
  tris.forEach((t, j) => {
    for (let k = 0; k < 3; k++) {
      const v = indices[t * 3 + k]
      let n = nuevo.get(v)
      if (n === undefined) {
        n = orden.length
        nuevo.set(v, n)
        orden.push(v)
      }
      idx[j * 3 + k] = n
    }
  })
  const buffer = doc.getRoot().listBuffers()[0]
  const p = doc.createPrimitive().setMode(prim.getMode()).setMaterial(prim.getMaterial())
  for (const semantica of prim.listSemantics()) {
    const a = prim.getAttribute(semantica)
    const tam = a.getElementSize()
    const src = a.getArray()
    const dst = new src.constructor(orden.length * tam)
    orden.forEach((v, n) => {
      for (let c = 0; c < tam; c++) dst[n * tam + c] = src[v * tam + c]
    })
    p.setAttribute(
      semantica,
      doc.createAccessor().setType(a.getType()).setArray(dst).setNormalized(a.getNormalized()).setBuffer(buffer),
    )
  }
  const tipo = orden.length < 65535 ? Uint16Array : Uint32Array
  p.setIndices(doc.createAccessor().setType('SCALAR').setArray(new tipo(idx)).setBuffer(buffer))
  const malla = doc.createMesh(nombre).addPrimitive(p)
  const n = doc.createNode(nombre).setMesh(malla).setMatrix(nodo.getMatrix())
  for (const padre of nodo.listParents()) {
    if (padre.propertyType === 'Scene' || padre.propertyType === 'Node') padre.addChild(n)
  }
  return { nombre, triangulos: tris.length, vertices: orden.length }
}

function quitar(nodo) {
  const malla = nodo.getMesh()
  nodo.dispose()
  if (!malla || malla.listParents().some((p) => p.propertyType === 'Node')) return
  for (const prim of malla.listPrimitives()) {
    const accesores = [...prim.listAttributes(), prim.getIndices()].filter(Boolean)
    prim.dispose()
    for (const a of accesores) {
      if (!a.listParents().some((p) => p.propertyType !== 'Root')) a.dispose()
    }
  }
  malla.dispose()
}

function partirPiel(doc) {
  const nodo = nodoDe(doc, 'piel')
  const { y } = posiciones(nodo)
  const indices = nodo.getMesh().listPrimitives()[0].getIndices().getArray()
  const grupos = ZONAS_PIEL.map(() => [])
  for (let t = 0; t < indices.length / 3; t++) {
    const tope = Math.max(y[indices[t * 3]], y[indices[t * 3 + 1]], y[indices[t * 3 + 2]])
    grupos[ZONAS_PIEL.findIndex(([, desde]) => tope >= desde)].push(t)
  }
  const partes = ZONAS_PIEL.map(([nombre], i) => extraer(doc, nodo, grupos[i], nombre))
  quitar(nodo)
  return partes
}

function partirColumna(doc) {
  const nodo = nodoDe(doc, 'hueso_columna')
  const indices = nodo.getMesh().listPrimitives()[0].getIndices().getArray()
  const { local, y } = posiciones(nodo)
  const n = local.length
  // Piezas sueltas: vértices unidos por triángulos o por estar en el mismo
  // lugar (la malla repite vértices donde cambian las normales), con la
  // misma tolerancia que usaba la escena (cuatro decimales de la posición
  // decodificada)
  const padre = Int32Array.from({ length: n }, (_, i) => i)
  const raiz = (i) => {
    while (padre[i] !== i) i = padre[i] = padre[padre[i]]
    return i
  }
  const unir = (a, b) => {
    const ra = raiz(a)
    const rb = raiz(b)
    if (ra !== rb) padre[ra] = rb
  }
  const lugar = new Map()
  local.forEach((p, i) => {
    const clave = p.map((c) => c.toFixed(4)).join(',')
    const otro = lugar.get(clave)
    if (otro === undefined) lugar.set(clave, i)
    else unir(i, otro)
  })
  for (let t = 0; t < indices.length / 3; t++) {
    unir(indices[t * 3], indices[t * 3 + 1])
    unir(indices[t * 3 + 1], indices[t * 3 + 2])
  }
  const suma = new Map()
  for (let i = 0; i < n; i++) {
    const r = raiz(i)
    const s = suma.get(r) ?? [0, 0]
    s[0] += y[i]
    s[1] += 1
    suma.set(r, s)
  }
  const alta = []
  const baja = []
  for (let t = 0; t < indices.length / 3; t++) {
    const [total, cuenta] = suma.get(raiz(indices[t * 3]))
    ;(total / cuenta >= CORTE_COLUMNA ? alta : baja).push(t)
  }
  const partes = [extraer(doc, nodo, alta, 'hueso_columna_alta'), extraer(doc, nodo, baja, 'hueso_columna_baja')]
  quitar(nodo)
  return partes
}

// Deja en el documento solo las mallas que cumplen `quedan`
function filtrar(doc, quedan) {
  for (const nodo of doc.getRoot().listNodes()) {
    const malla = nodo.getMesh()
    if (malla && !quedan(malla.getName())) quitar(nodo)
  }
}

const config = {
  onProgramReady({ program, io }) {
    program
      .command('partir', 'Comprime el cuerpo con meshopt y parte la piel y la columna por zonas')
      .argument('<input>', 'cuerpo.glb de optimize --compress false')
      .argument('<output>', 'El cuerpo partido; con --resto, solo lo del hero')
      .option('--resto <path>', 'Lo que no es del hero, en otro archivo')
      .action(async ({ args, options, logger }) => {
        const { meshopt } = await deLaCli('@gltf-transform/functions')
        const { MeshoptEncoder } = await deLaCli('meshoptimizer')
        await MeshoptEncoder.ready
        // Lo mismo que optimize --compress meshopt (nivel alto), y la
        // partición antes de escribir
        const procesar = async () => {
          const doc = await io.read(args.input)
          await doc.transform(meshopt({ encoder: MeshoptEncoder, level: 'high' }))
          return { doc, partes: [...partirPiel(doc), ...partirColumna(doc)] }
        }
        const { doc, partes } = await procesar()
        for (const p of partes) logger.info(`partir: ${p.nombre}: ${p.triangulos} triángulos, ${p.vertices} vértices`)
        if (options.resto) {
          const { doc: resto } = await procesar()
          filtrar(doc, (nombre) => MALLAS_HERO.has(nombre))
          filtrar(resto, (nombre) => !MALLAS_HERO.has(nombre))
          await io.write(options.resto, resto)
        }
        await io.write(args.output, doc)
      })

    program
      .command('verificar', 'Comprueba que el cuerpo partido es el entero, valor por valor')
      .argument('<input>', 'cuerpo.glb de optimize --compress meshopt, sin partir')
      .argument('<partidos...>', 'El o los archivos partidos')
      .action(async ({ args, logger }) => {
        const entero = await io.read(args.input)
        const partidos = await Promise.all(args.partidos.map((r) => io.read(r)))
        const nodos = partidos.flatMap((doc) => doc.getRoot().listNodes().filter((n) => n.getMesh()))
        const origen = (nombre) =>
          nombre.startsWith('piel_') ? 'piel' : nombre.startsWith('hueso_columna_') ? 'hueso_columna' : nombre
        // Cada triángulo como clave de sus valores crudos (posición y normal
        // cuantizadas de cada vértice) y de la matriz del nodo
        const triangulos = (nodo, cuenta) => {
          const prim = nodo.getMesh().listPrimitives()[0]
          const atributos = prim.listSemantics().sort().map((s) => prim.getAttribute(s))
          const indices = prim.getIndices().getArray()
          const matriz = nodo.getMatrix().join(',')
          for (let t = 0; t < indices.length / 3; t++) {
            const vertices = [0, 1, 2].map((k) => {
              const v = indices[t * 3 + k]
              return atributos
                .map((a) => {
                  const tam = a.getElementSize()
                  return Array.from(a.getArray().subarray(v * tam, v * tam + tam)).join(',')
                })
                .join('/')
            })
            // El códec de índices de meshopt puede rotar los vértices de un
            // triángulo (en el mismo sentido): se empieza por el menor
            const r = vertices.indexOf([...vertices].sort()[0])
            const clave = [matriz, ...vertices.slice(r), ...vertices.slice(0, r)].join('|')
            cuenta.set(clave, (cuenta.get(clave) ?? 0) + 1)
          }
        }
        const esperado = new Map()
        const obtenido = new Map()
        for (const n of entero.getRoot().listNodes()) if (n.getMesh()) triangulos(n, esperado)
        for (const n of nodos) triangulos(n, obtenido)
        const distintos = [...esperado].filter(([k, c]) => obtenido.get(k) !== c).length
        const sobran = [...obtenido].filter(([k]) => !esperado.has(k)).length
        const nombres = new Set(nodos.map((n) => origen(n.getMesh().getName())))
        const faltan = entero
          .getRoot()
          .listMeshes()
          .map((m) => m.getName())
          .filter((m) => !nombres.has(m))
        const total = (m) => [...m.values()].reduce((a, b) => a + b, 0)
        logger.info(`verificar: ${total(esperado)} triángulos en el entero, ${total(obtenido)} en los partidos`)
        if (distintos || sobran || faltan.length) {
          throw new Error(`verificar: ${distintos} distintos, ${sobran} de más, mallas que faltan: ${faltan.join(', ')}`)
        }
        logger.info('verificar: mismos triángulos, vértices, normales y nodos')
      })
  },
}

export default config
