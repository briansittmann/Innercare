// Los seis implantes del recorrido, uno por parada. ÚNICO lugar donde se dice
// de dónde sale cada pieza y dónde va en el cuerpo.
//
// CONTRATO:
// - Cada entrada tiene `fuente`:
//   · { tipo: 'glb', url, malla }: la malla llamada `malla` dentro del .glb de
//     `url` (comprimido con meshopt, como public/modelos/implantes.glb). Se
//     respeta la transformación del nodo en el archivo y encima se aplica la
//     de la entrada (`posicion`, `rotacion`, `escala`).
//   · { tipo: 'primitiva', crear }: una geometría de three armada acá, en
//     coordenadas locales alrededor de `posicion`.
// - `posicion` (metros), `rotacion` (radianes, orden XYZ) y `escala` ubican la
//   pieza en el cuerpo (CUERPO, abajo: Y hacia arriba, pies en 0,
//   la figura mira a +Z y su lado derecho es -X). Un .glb generado sobre el
//   esqueleto (como hace 3d/scripts/implantes.py) ya viene en esas
//   coordenadas: va con posición y rotación 0 y escala 1.
// - `acabado`: 'trabecular' (impresión 3D: gris mate) o 'pulido' (CNC).
// - Para cambiar una pieza: exportarla como `implante_<parada>`
//   (docs/ARQUITECTURA_MODELO_3D.md, "Nombres") en implantes-recorrido.glb
//   (`npm run modelos`; la craneoplastía va aparte, en implantes.glb: ver
//   abajo) y apuntar acá su `fuente` a esa malla, con la transformación en
//   cero. Nada más cambia: la escena, la cámara
//   (camara.ts) y las tarjetas no dependen de la forma de la pieza.
//
// Los seis son modelos generados en Blender sobre el esqueleto
// (3d/scripts/implantes.py), a partir de las fotos y fichas de content/: la
// craneoplastía sale de implantes.glb y las otras cinco de
// implantes-recorrido.glb. Los dos ya vienen en las coordenadas del cuerpo,
// con los huesos que reemplazan recortados en el cuerpo. Cuando lleguen los
// CAD de Innercare, reemplazan a estos respetando el nombre de malla.
//
// Por qué la craneoplastía sigue en su archivo (decidido en la fase 5 del
// cuerpo único): es la única pieza de la toma del hero. Va en el primer
// pantallazo, junto a CUERPO.hero (73 KB contra los 313 KB de
// implantes-recorrido.glb, que se pide después de la intro), y es el mismo
// archivo, byte por byte, que la paridad del hero verificó contra el busto de
// antes. Llevarla a implantes-recorrido.glb obligaba a bajar ese archivo
// entero antes de la intro o a partirlo, y a regenerar los .glb (Blender no
// es determinista en los booleanos). La escena la lee dos veces del mismo
// archivo, que se pide una sola vez: refractada dentro del vidrio en el hero
// (CraneoHero, escena.tsx) y en la capa de implantes desde la parada 1.
//
// Las primitivas (`tipo: 'primitiva'`) quedan en el contrato para piezas
// sin modelo todavía; hoy no hay ninguna.

import type { BufferGeometry } from 'three'
import type { ParadaId } from '@/content/recorrido'
import type { Vec3 } from './camara'

export const IMPLANTES_GLB = '/modelos/implantes.glb'
export const IMPLANTES_RECORRIDO_GLB = '/modelos/implantes-recorrido.glb'

// --- El cuerpo (piel y esqueleto) -------------------------------------------
// Va en dos archivos (3d/scripts/partir.mjs, desde npm run modelos), para
// que el primer pantallazo pese como el busto:
// - `hero`: lo que se ve en la toma del hero (CUERPO.mallasHero). Se pide
//   primero; el hero del cuerpo único carga solo este.
// - `resto`: todo lo demás. El recorrido carga los dos y busca cada malla
//   por nombre en cualquiera de ellos.
// La piel va partida por altura en tres mallas (CUERPO.piel), con los mismos
// triángulos, vértices, normales y nodo que la piel entera: la escena las
// trata como una sola y oculta las que quedan enteras debajo del corte. La
// columna va en dos: hueso_columna_alta (las vértebras del busto, arriba de
// 1,35 m) y hueso_columna_baja.
export const CUERPO = {
  hero: '/modelos/cuerpo-cabeza.glb',
  resto: '/modelos/cuerpo-resto.glb',
  mallasHero: [
    'piel_cabeza',
    'hueso_craneo',
    'hueso_maxilar_entero',
    'hueso_mandibula',
    'hueso_columna_alta',
  ],
  piel: ['piel_cabeza', 'piel_torso', 'piel_piernas'],
} as const

export const esPiel = (nombre: string) => nombre.startsWith('piel_')

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

// Pieza de un .glb generado sobre el esqueleto: sin transformación propia
const modelo = (
  parada: ParadaId,
  url: string,
  malla: string,
  acabado: Implante['acabado'],
): Implante => ({
  parada,
  fuente: { tipo: 'glb', url, malla },
  posicion: [0, 0, 0],
  rotacion: [0, 0, 0],
  escala: 1,
  acabado,
})

// --- Los seis, en el orden del recorrido ----------------------------------

export const IMPLANTES: readonly Implante[] = [
  // Titanio impreso: malla triangular sobre el cráneo derecho
  modelo('craneo', IMPLANTES_GLB, 'implante_craneoplastia', 'trabecular'),
  // Titanio impreso: placa calada sobre el maxilar derecho, con tres postes
  modelo('maxilar', IMPLANTES_RECORRIDO_GLB, 'implante_maxilar', 'trabecular'),
  // CNC: glenosfera, copa, cuerpo con suplemento y vástago estriado
  modelo('hombro', IMPLANTES_RECORRIDO_GLB, 'implante_hombro', 'pulido'),
  // Titanio trabecular: copa calada con ala superior y tornillos en abanico
  modelo('acetabulo', IMPLANTES_RECORRIDO_GLB, 'implante_acetabulo', 'trabecular'),
  // CNC: cabeza, cuerpo de 60 mm a 135°, suplemento y vástago (fémur izquierdo)
  modelo('femur', IMPLANTES_RECORRIDO_GLB, 'implante_femur', 'pulido'),
  // Titanio impreso: segmento poroso de la diáfisis derecha y clavo endomedular
  modelo('intercalar', IMPLANTES_RECORRIDO_GLB, 'implante_intercalar', 'trabecular'),
]
