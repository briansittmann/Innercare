// Prototipo del cuerpo único (?cuerpo-unico): lo que la escena del recorrido
// necesita para verse como el busto del hero en la toma 0. Valores de
// components/hero-3d/ (materials.tsx y body-scene.tsx) y de
// docs/landing/cuerpo-unico/base/MEDICIONES.md.

import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import {
  BufferGeometry,
  CanvasTexture,
  Color,
  Mesh,
  SRGBColorSpace,
  Vector3,
  type Material,
} from 'three'

// Fondo del hero: el degradé de --color-stage-from a --color-stage-to
// (globals.css). Si cambian ahí, cambian acá y en hero-3d/body-scene.tsx.
const STAGE_FROM = '#e6eef8'
const STAGE_TO = '#c3d7ee'

// El tramo [arriba, abajo] del degradé (fracciones del alto de la sección)
// que queda detrás del canvas, en una textura de 2 × 512 px: el fondo que
// refracta el vidrio. Igual que useStageTexture de body-scene.tsx.
export function useTexturaDegrade(tramo: readonly [number, number] | null) {
  const arriba = tramo?.[0] ?? 0
  const abajo = tramo?.[1] ?? 1
  const textura = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 512
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const tramoAlto = abajo - arriba
      const g = ctx.createLinearGradient(
        0,
        (-arriba / tramoAlto) * canvas.height,
        0,
        ((1 - arriba) / tramoAlto) * canvas.height,
      )
      g.addColorStop(0, STAGE_FROM)
      g.addColorStop(1, STAGE_TO)
      ctx.fillStyle = g
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
    const map = new CanvasTexture(canvas)
    map.colorSpace = SRGBColorSpace
    return map
  }, [arriba, abajo])
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    invalidate()
    return () => textura.dispose()
  }, [textura, invalidate])
  return textura
}

// Vidrio del busto (hero-3d/materials.tsx) y del recorrido (escena.tsx): la
// escena pasa de uno al otro con el peso del hero (camara.ts, pesoHero).
// El espesor del vidrio de three se multiplica por la escala de la malla, y
// la compresión (meshopt) guarda en la escala del nodo la cuantización de las
// posiciones: depende del tamaño de cada malla. La piel del busto
// (cabeza.glb) tiene escala 0,2117 y la del cuerpo (cuerpo.glb), 0,8496, así
// que el mismo `thickness` da un vidrio casi cuatro veces más grueso (más
// azul y más oscuro) en el cuerpo. Por eso el del hero va en metros del
// mundo (0,05 × 0,2117) y la escena lo divide por la escala de su piel.
const ESCALA_PIEL_BUSTO = 0.21169155091047287
export const ESPESOR_HERO_MUNDO = 0.05 * ESCALA_PIEL_BUSTO

// (el espesor, aparte: ESPESOR_HERO_MUNDO)
export const VIDRIO_HERO = {
  roughness: 0.06,
  ior: 1.25,
  color: new Color('#c8e1fa'),
  attenuationColor: new Color('#5b9ee0'),
  attenuationDistance: 0.35,
  clearcoatRoughness: 0.1,
  envMapIntensity: 1,
}

export const VIDRIO_RECORRIDO = {
  thickness: 0.06,
  roughness: 0.05,
  ior: 1.28,
  color: new Color('#eaf3fd'),
  attenuationColor: new Color('#3f86d6'),
  attenuationDistance: 0.22,
  clearcoatRoughness: 0.08,
  envMapIntensity: 1.4,
}

// Hueso: 0,4 en el busto y 0,34 en el recorrido
export const OPACIDAD_HUESO_HERO = 0.4

// Los huesos del busto (3d/scripts/cabeza.py): el resto del esqueleto no se
// ve en la toma del hero. El maxilar va entero (hueso_maxilar_entero): el
// recortado y su implante entran en la parada del maxilar.
// De la columna, solo las vértebras de arriba del corte (partirColumna).
export const HUESOS_BUSTO = new Set([
  'hueso_craneo',
  'hueso_maxilar_entero',
  'hueso_mandibula',
  'hueso_columna_alta',
])

// Titanio de la craneoplastía en el busto: dentro del vidrio, refractado
export const TITANIO_HERO = { color: '#9aa1aa', metalness: 1, roughness: 0.5 }

// Corte del busto (cabeza.py): la piel a 1,33 m y las vértebras con el
// centro por debajo de 1,35 m. En el cuerpo entero se hace con un
// desvanecido por altura: debajo de `corte` todo es transparente y en los
// `banda` metros de arriba vuelve a ser opaco. En la toma del hero la banda
// es casi nula (el corte del busto es recto); con el scroll, el corte baja y
// la banda se ensancha para revelar el cuerpo.
export const CORTE_PIEL = 1.33
export const CORTE_HUESO = 1.35

export type UniformesCorte = {
  corteY: { value: number }
  corteBanda: { value: number }
}

export const uniformesCorte = (corte: number): UniformesCorte => ({
  corteY: { value: corte },
  corteBanda: { value: 0.004 },
})

const conCorte = new WeakSet<Material>()

// Suma el desvanecido por altura a un material ya creado, sin pisar su
// propio onBeforeCompile (el vidrio de drei arma el suyo). La altura es la
// del mundo (Y hacia arriba, pies en 0). El material tiene que ser
// transparente para que la banda se funda; debajo del corte se descarta.
export function aplicarCorte(material: Material, uniformes: UniformesCorte) {
  if (conCorte.has(material)) return
  conCorte.add(material)
  const previo = material.onBeforeCompile.bind(material)
  const clave = material.customProgramCacheKey()
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    shader.uniforms.corteY = uniformes.corteY
    shader.uniforms.corteBanda = uniformes.corteBanda
    shader.vertexShader =
      'varying float vCorteY;\n' +
      shader.vertexShader.replace(
        'void main() {',
        'void main() {\n  vCorteY = (modelMatrix * vec4(position, 1.0)).y;',
      )
    const final = shader.fragmentShader.lastIndexOf('}')
    shader.fragmentShader =
      'uniform float corteY;\nuniform float corteBanda;\nvarying float vCorteY;\n' +
      shader.fragmentShader.slice(0, final) +
      '  float corteF = smoothstep(corteY, corteY + corteBanda, vCorteY);\n' +
      '  if (corteF <= 0.0) discard;\n' +
      '  gl_FragColor.a *= corteF;\n' +
      shader.fragmentShader.slice(final)
  }
  material.customProgramCacheKey = () => `corte|${clave}`
  material.needsUpdate = true
}

// La columna del busto (cabeza.py) no se corta con un plano: se quitan
// enteras las piezas (vértebras y discos) con el centro por debajo de
// CORTE_HUESO. Acá se parte la del cuerpo igual, en dos mallas que comparten
// los vértices: `hueso_columna_alta` (las que quedan en el busto, sin corte)
// y `hueso_columna_baja` (las demás, que entran con el resto del esqueleto).
// Las piezas salen de los triángulos conectados, uniendo también los
// vértices repetidos en el mismo lugar (el .glb los separa por normales).
export function partirColumna(malla: Mesh): [Mesh, Mesh] {
  const geometria = malla.geometry
  const posicion = geometria.getAttribute('position')
  const indice = geometria.getIndex()
  malla.updateWorldMatrix(true, false)
  const n = posicion.count
  const padre = new Int32Array(n).map((_, i) => i)
  const raiz = (i: number): number => {
    while (padre[i] !== i) {
      const p = padre[i] ?? i
      padre[i] = padre[p] ?? p
      i = padre[i] ?? i
    }
    return i
  }
  const unir = (a: number, b: number) => {
    const ra = raiz(a)
    const rb = raiz(b)
    if (ra !== rb) padre[ra] = rb
  }
  const lugar = new Map<string, number>()
  for (let i = 0; i < n; i++) {
    const clave = `${posicion.getX(i).toFixed(4)},${posicion.getY(i).toFixed(4)},${posicion.getZ(i).toFixed(4)}`
    const otro = lugar.get(clave)
    if (otro === undefined) lugar.set(clave, i)
    else unir(i, otro)
  }
  const triangulos = indice ? indice.count / 3 : n / 3
  const vertice = (t: number, k: number) => (indice ? indice.getX(t * 3 + k) : t * 3 + k)
  for (let t = 0; t < triangulos; t++) {
    unir(vertice(t, 0), vertice(t, 1))
    unir(vertice(t, 1), vertice(t, 2))
  }
  // Altura media de cada pieza, en el mundo
  const suma = new Map<number, [number, number]>()
  const v = new Vector3()
  for (let i = 0; i < n; i++) {
    v.fromBufferAttribute(posicion, i).applyMatrix4(malla.matrixWorld)
    const r = raiz(i)
    const s = suma.get(r) ?? [0, 0]
    s[0] += v.y
    s[1] += 1
    suma.set(r, s)
  }
  const alta: number[] = []
  const baja: number[] = []
  for (let t = 0; t < triangulos; t++) {
    const a = vertice(t, 0)
    const [total, cuenta] = suma.get(raiz(a)) ?? [0, 1]
    ;(total / cuenta >= CORTE_HUESO ? alta : baja).push(a, vertice(t, 1), vertice(t, 2))
  }
  const parte = (indices: number[], nombre: string) => {
    const g = new BufferGeometry()
    for (const [nombreAtributo, atributo] of Object.entries(geometria.attributes)) {
      g.setAttribute(nombreAtributo, atributo)
    }
    g.setIndex(indices)
    const m = new Mesh(g)
    m.name = nombre
    m.position.copy(malla.position)
    m.quaternion.copy(malla.quaternion)
    m.scale.copy(malla.scale)
    return m
  }
  return [parte(alta, 'hueso_columna_alta'), parte(baja, 'hueso_columna_baja')]
}

// La piel del cuerpo es una sola malla de 62 000 triángulos y en la toma del
// hero se ve menos de un tercio (la del busto tiene 21 600). Para no
// procesar lo que el corte descarta, se ordenan sus triángulos de arriba
// abajo por su vértice más alto y se dibujan solo los que llegan por encima
// del corte (drawRange). Devuelve la geometría ordenada, que comparte los
// vértices con la original, y la función que da cuántos índices dibujar
// para un corte (en metros del mundo).
export function ordenarPorAltura(malla: Mesh) {
  const geometria = malla.geometry
  const posicion = geometria.getAttribute('position')
  const indice = geometria.getIndex()
  malla.updateWorldMatrix(true, false)
  const triangulos = indice ? indice.count / 3 : posicion.count / 3
  const vertice = (t: number, k: number) => (indice ? indice.getX(t * 3 + k) : t * 3 + k)
  const v = new Vector3()
  const alturaDe = (i: number) => v.fromBufferAttribute(posicion, i).applyMatrix4(malla.matrixWorld).y
  const alturas = new Float32Array(posicion.count)
  for (let i = 0; i < posicion.count; i++) alturas[i] = alturaDe(i)
  const orden = Array.from({ length: triangulos }, (_, t) => {
    const a = alturas[vertice(t, 0)] ?? 0
    const b = alturas[vertice(t, 1)] ?? 0
    const c = alturas[vertice(t, 2)] ?? 0
    return { t, tope: Math.max(a, b, c) }
  }).sort((p, q) => q.tope - p.tope)
  const indices = new Uint32Array(triangulos * 3)
  orden.forEach(({ t }, j) => {
    indices[j * 3] = vertice(t, 0)
    indices[j * 3 + 1] = vertice(t, 1)
    indices[j * 3 + 2] = vertice(t, 2)
  })
  const ordenada = new BufferGeometry()
  for (const [nombre, atributo] of Object.entries(geometria.attributes)) ordenada.setAttribute(nombre, atributo)
  ordenada.setIndex(Array.from(indices))
  ordenada.boundingSphere = geometria.boundingSphere
  ordenada.boundingBox = geometria.boundingBox
  const topes = orden.map((o) => o.tope)
  // Cuántos índices tienen el vértice más alto por encima del corte
  const indicesSobre = (corte: number) => {
    let lo = 0
    let hi = topes.length
    while (lo < hi) {
      const m = (lo + hi) >> 1
      if ((topes[m] ?? 0) >= corte) lo = m + 1
      else hi = m
    }
    return lo * 3
  }
  return { geometria: ordenada, indicesSobre }
}
