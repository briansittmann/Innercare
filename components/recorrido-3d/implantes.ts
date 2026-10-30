// Los seis implantes del recorrido, uno por parada. ÚNICO lugar donde se dice
// de dónde sale cada pieza y dónde va en el cuerpo.
//
// CONTRATO (para reemplazar las primitivas por los modelos reales, fase 4):
// - Cada entrada tiene `fuente`:
//   · { tipo: 'glb', url, malla }: la malla llamada `malla` dentro del .glb de
//     `url` (comprimido con meshopt, como public/modelos/implantes.glb). Se
//     respeta la transformación del nodo en el archivo y encima se aplica la
//     de la entrada (`posicion`, `rotacion`, `escala`).
//   · { tipo: 'primitiva', crear }: una geometría de three armada acá, en
//     coordenadas locales alrededor de `posicion`.
// - `posicion` (metros), `rotacion` (radianes, orden XYZ) y `escala` ubican la
//   pieza en el cuerpo (public/modelos/cuerpo.glb: Y hacia arriba, pies en 0,
//   la figura mira a +Z y su lado derecho es -X). Un .glb generado sobre el
//   esqueleto (como hace 3d/scripts/implantes.py) ya viene en esas
//   coordenadas: va con posición y rotación 0 y escala 1.
// - `acabado`: 'trabecular' (impresión 3D: gris mate) o 'pulido' (CNC).
// - Para cambiar una primitiva por un modelo: exportar la pieza como
//   `implante_<parada>` (docs/ARQUITECTURA_MODELO_3D.md, "Nombres"), sumarla
//   a implantes.glb con `npm run modelos` y cambiar acá su `fuente` a
//   { tipo: 'glb', url: IMPLANTES_GLB, malla: 'implante_<parada>' } con la
//   transformación en cero. Nada más cambia: la escena, la cámara
//   (camara.ts) y las tarjetas no dependen de la forma de la pieza.
//
// Las primitivas son bocetos con las proporciones de la ficha o de la foto
// (ARQUITECTURA, "Los seis implantes"), no los productos: solo marcan dónde va
// cada uno hasta que lleguen los modelos.

import {
  BoxGeometry,
  CatmullRomCurve3,
  CylinderGeometry,
  Quaternion,
  SphereGeometry,
  TorusGeometry,
  TubeGeometry,
  Vector3,
  type BufferGeometry,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import type { ParadaId } from '@/content/recorrido'
import type { Vec3 } from './camara'

export const IMPLANTES_GLB = '/modelos/implantes.glb'

export type FuenteImplante =
  | { tipo: 'glb'; url: string; malla: string }
  | { tipo: 'primitiva'; crear: () => BufferGeometry }

export type Implante = {
  parada: ParadaId
  fuente: FuenteImplante
  posicion: Vec3
  rotacion: Vec3
  escala: number
  acabado: 'trabecular' | 'pulido'
}

// --- Ayudas para las primitivas -------------------------------------------

const ARRIBA = new Vector3(0, 1, 0)

// Cilindro (o cono truncado) de `a` a `b`, con radio ra en a y rb en b
function cilindro(a: Vec3, b: Vec3, ra: number, rb = ra, lados = 20) {
  const va = new Vector3(...a)
  const vb = new Vector3(...b)
  const eje = vb.clone().sub(va)
  // CylinderGeometry va a lo largo de Y, con radiusTop arriba (+Y)
  const g = new CylinderGeometry(rb, ra, eje.length(), lados)
  g.applyQuaternion(new Quaternion().setFromUnitVectors(ARRIBA, eje.clone().normalize()))
  g.translate(...va.add(vb).multiplyScalar(0.5).toArray())
  return g
}

function unir(partes: BufferGeometry[]) {
  // Las geometrías de three traen las mismas tres (posición, normal, uv)
  const geometria = mergeGeometries(partes.map((p) => (p.index ? p.toNonIndexed() : p)))
  for (const p of partes) p.dispose()
  if (!geometria) throw new Error('No se pudieron unir las partes del implante')
  return geometria
}

const local = (p: Vec3, o: Vec3): Vec3 => [p[0] - o[0], p[1] - o[1], p[2] - o[2]]

// --- Primitivas -----------------------------------------------------------

// 2. Maxilar: placa calada que sigue el arco alveolar, con tres postes hacia
// abajo para los implantes dentarios. Origen: centro del arco.
function maxilar() {
  const radio = 0.026
  const arco = new TorusGeometry(radio, 0.0026, 10, 64, Math.PI)
  // El arco pasa al plano horizontal con la curva hacia adelante (+Z) y se
  // estira en alto: una banda, no un alambre.
  arco.rotateX(Math.PI / 2)
  arco.scale(1.08, 2.4, 1)
  const postes = [0.2, 0.5, 0.8].map((t) => {
    const a = t * Math.PI
    const x = Math.cos(a) * radio * 1.08
    const z = Math.sin(a) * radio
    return cilindro([x, -0.004, z], [x, -0.016, z], 0.0021, 0.0017, 14)
  })
  return unir([arco, ...postes])
}

// 3. Hombro reverso: glenosfera sobre la escápula, copa humeral inclinada,
// cuerpo y vástago en el húmero. Origen: centro de la cabeza humeral.
function hombro() {
  const glenosfera = new SphereGeometry(0.0145, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2)
  glenosfera.rotateZ(Math.PI / 2) // la cúpula mira hacia afuera (-X)
  glenosfera.translate(0.017, 0.004, -0.004)
  const base = cilindro([0.017, 0.004, -0.004], [0.022, 0.004, -0.004], 0.0125, 0.0125, 24)
  const copa = cilindro([-0.001, -0.001, -0.002], [-0.013, -0.015, -0.003], 0.0185, 0.016, 28)
  const cuerpo = cilindro([-0.011, -0.013, -0.003], [-0.016, -0.058, -0.004], 0.0105, 0.0085)
  const vastago = cilindro([-0.016, -0.058, -0.004], [-0.028, -0.158, -0.018], 0.0062, 0.0034)
  return unir([glenosfera, base, copa, cuerpo, vastago])
}

// 4. Acetábulo: copa semiesférica trabecular abierta hacia abajo y afuera,
// con el ala superior sobre el ilíaco y dos tornillos. Origen: centro de la
// cavidad (el de la cabeza femoral).
function acetabulo() {
  const copa = new SphereGeometry(0.027, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2)
  copa.rotateZ(-0.72) // la boca mira hacia afuera y abajo
  const ala = new BoxGeometry(0.03, 0.026, 0.004)
  ala.rotateZ(-0.35)
  ala.translate(0.006, 0.036, -0.006)
  const tornillos = [
    cilindro([0.002, 0.03, -0.004], [0.016, 0.07, -0.01], 0.0021, 0.0016, 12),
    cilindro([0.012, 0.024, 0.002], [0.03, 0.058, -0.002], 0.0021, 0.0016, 12),
  ]
  return unir([copa, ala, ...tornillos])
}

// 5. Endoprótesis de fémur: cabeza con cono morse, cuerpo de 60 mm a 135° y
// vástago de Ø11 × 140 mm (ficha). Origen: centro de la cabeza femoral
// izquierda.
function endoprotesis() {
  const cabeza = new SphereGeometry(0.022, 32, 20)
  const cuello = cilindro([0, 0, 0], [0.026, -0.028, -0.004], 0.0065, 0.009)
  const cuerpo = cilindro([0.026, -0.03, -0.004], [0.034, -0.095, 0.002], 0.0125, 0.0115, 28)
  const collar = cilindro([0.0262, -0.032, -0.004], [0.0272, -0.04, -0.003], 0.0145, 0.0145, 28)
  const vastago = cilindro([0.034, -0.095, 0.002], [0.016, -0.235, 0.016], 0.0055, 0.0042)
  return unir([cabeza, cuello, cuerpo, collar, vastago])
}

// 6. Intercalar de fémur: segmento poroso que reemplaza un tramo de la
// diáfisis, clavo endomedular de Ø10 × 360 mm que sigue el canal desde el
// trocánter, y dos tornillos oblicuos de Ø3,5 mm (featuredCase). Origen:
// centro del segmento.
const ORIGEN_INTERCALAR: Vec3 = [-0.097, 0.66, 0.006]
function intercalar() {
  const o = ORIGEN_INTERCALAR
  const canal: Vec3[] = [
    [-0.119, 0.878, -0.017],
    [-0.1186, 0.852, -0.016],
    [-0.1111, 0.801, -0.006],
    [-0.1117, 0.748, 0.004],
    [-0.1003, 0.7, 0.005],
    [-0.0935, 0.652, 0.006],
    [-0.0962, 0.596, 0.004],
    [-0.0898, 0.549, 0.003],
    [-0.0868, 0.518, 0.0],
  ]
  const curva = new CatmullRomCurve3(canal.map((p) => new Vector3(...local(p, o))))
  const clavo = new TubeGeometry(curva, 64, 0.005, 14, false)
  const segmento = cilindro(local([-0.104, 0.716, 0.005], o), local([-0.095, 0.606, 0.004], o), 0.0138, 0.0132, 32)
  const tornillos = [
    cilindro(local([-0.135, 0.838, -0.01], o), local([-0.098, 0.808, 0.0], o), 0.00175, 0.00175, 10),
    cilindro(local([-0.108, 0.548, 0.003], o), local([-0.07, 0.572, 0.004], o), 0.00175, 0.00175, 10),
  ]
  return unir([clavo, segmento, ...tornillos])
}

// --- Los seis, en el orden del recorrido ----------------------------------

export const IMPLANTES: readonly Implante[] = [
  {
    parada: 'craneo',
    // Modelo real: el mismo del busto del hero
    fuente: { tipo: 'glb', url: IMPLANTES_GLB, malla: 'implante_craneoplastia' },
    posicion: [0, 0, 0],
    rotacion: [0, 0, 0],
    escala: 1,
    acabado: 'trabecular',
  },
  {
    parada: 'maxilar',
    fuente: { tipo: 'primitiva', crear: maxilar },
    posicion: [0, 1.534, 0.058],
    rotacion: [0, 0, 0],
    escala: 1,
    acabado: 'trabecular',
  },
  {
    parada: 'hombro',
    fuente: { tipo: 'primitiva', crear: hombro },
    posicion: [-0.151, 1.358, -0.012],
    rotacion: [0, 0, 0],
    escala: 1,
    acabado: 'pulido',
  },
  {
    parada: 'acetabulo',
    fuente: { tipo: 'primitiva', crear: acetabulo },
    posicion: [-0.083, 0.896, -0.008],
    rotacion: [0, 0, 0],
    escala: 1,
    acabado: 'trabecular',
  },
  {
    parada: 'femur',
    fuente: { tipo: 'primitiva', crear: endoprotesis },
    posicion: [0.0807, 0.8953, -0.0083],
    rotacion: [0, 0, 0],
    escala: 1,
    acabado: 'pulido',
  },
  {
    parada: 'intercalar',
    fuente: { tipo: 'primitiva', crear: intercalar },
    posicion: ORIGEN_INTERCALAR,
    rotacion: [0, 0, 0],
    escala: 1,
    acabado: 'trabecular',
  },
]
