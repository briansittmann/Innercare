// Guion del recorrido por el cuerpo (#recorrido), tomado de updateTour y
// camFor del borrador (docs/landing/landing-borrador.html) y de
// docs/landing/LANDING_SPEC.md, sección 4. Sin three: lo usan la escena 3D y
// el armazón HTML (tarjetas, índice, títulos), que tiene que funcionar
// aunque no haya WebGL.
//
// El progreso p (0 a 1) del contenedor se reparte en 7 tramos entre 8 tomas:
// seg = p × 7. k = 0 es la entrada (el cuerpo entero), k = 1…6 una parada por
// implante (cabeza, maxilar, hombro, acetábulo, fémur proximal, diáfisis) y
// k = 7 el cierre (el cuerpo entero).
//
// Coordenadas del modelo (public/modelos/cuerpo.glb): metros, Y hacia arriba,
// pies en 0, la figura mira a +Z y su lado derecho es -X.

import type { ParadaId } from '@/content/recorrido'

export type Vec3 = readonly [x: number, y: number, z: number]

// Una toma de cámara: el punto que mira, cuánto se ve, desde dónde y en qué
// lugar de la pantalla queda ese punto.
type Toma = {
  objetivo: Vec3
  // Giro alrededor del cuerpo: 0 es de frente; negativo, hacia el lado
  // derecho de la figura (la cámara se corre a -X).
  azimut: number
  elevacion: number
}

type Encuadre = {
  // Fracción del ancho y del alto de la pantalla donde queda el objetivo
  ancla: readonly [x: number, y: number]
  // Alto de la pantalla, en metros, a la distancia del objetivo
  alto: number
}

export type Clave = Toma & { escritorio: Encuadre; celular: Encuadre }

// Escala del borrador: el cuerpo dibujado mide 1000 unidades y la figura,
// unas 945 (1,70 m). Una unidad son 1,8 mm.
const UNIDAD = 0.0018

// Entrada y cierre: el cuerpo entero anclado a la derecha (68 % del ancho),
// con el texto a la izquierda; en el celular, centrado y debajo del texto.
// Borrador: s = alto × 0,9 / 1000 (entrada) y × 0,88 (cierre) en escritorio,
// × 0,6 en el celular.
const CENTRO_CUERPO: Vec3 = [0, 0.85, 0]
const cuerpoEntero = (fraccion: number) => (1000 * UNIDAD) / fraccion

const ENTRADA: Clave = {
  objetivo: CENTRO_CUERPO,
  azimut: -0.42,
  elevacion: 0.04,
  escritorio: { ancla: [0.68, 0.53], alto: cuerpoEntero(0.9) },
  celular: { ancla: [0.5, 0.74], alto: cuerpoEntero(0.6) },
}

const CIERRE: Clave = {
  objetivo: CENTRO_CUERPO,
  azimut: -0.3,
  elevacion: 0.04,
  escritorio: { ancla: [0.68, 0.53], alto: cuerpoEntero(0.88) },
  celular: { ancla: [0.5, 0.68], alto: cuerpoEntero(0.6) },
}

// Paradas: el implante anclado al 34 % del ancho y la tarjeta a la derecha;
// en el celular, arriba (25 % del alto) y la tarjeta como hoja inferior.
// `vis` es el tramo del cuerpo que entra en el 62 % del alto (44 % en el
// celular): los `vis` del borrador (STOPS) pasados a metros.
// Los lados son los de docs/ARQUITECTURA_MODELO_3D.md (acetábulo e
// intercalar a la derecha, endoprótesis a la izquierda).
type Parada3D = Toma & { vis: number }

export const TOMAS_PARADA: Record<ParadaId, Parada3D> = {
  // Craneoplastía parieto-temporal derecha: de tres cuartos y desde arriba
  craneo: { objetivo: [-0.047, 1.622, -0.006], vis: 170 * UNIDAD, azimut: -1.02, elevacion: 0.38 },
  // Maxilar superior, de frente y apenas desde abajo
  maxilar: { objetivo: [0, 1.535, 0.06], vis: 150 * UNIDAD, azimut: -0.3, elevacion: -0.06 },
  // Hombro derecho: la articulación y el vástago en el húmero
  hombro: { objetivo: [-0.158, 1.3, -0.016], vis: 290 * UNIDAD, azimut: -0.62, elevacion: 0.08 },
  // Acetábulo derecho
  acetabulo: { objetivo: [-0.075, 0.905, -0.004], vis: 190 * UNIDAD, azimut: -0.36, elevacion: 0.06 },
  // Fémur proximal izquierdo: la cabeza, el cuerpo y el vástago
  femur: { objetivo: [0.1, 0.8, 0.002], vis: 330 * UNIDAD, azimut: 0.46, elevacion: 0.04 },
  // Diáfisis del fémur derecho
  intercalar: { objetivo: [-0.098, 0.67, 0.006], vis: 250 * UNIDAD, azimut: -0.42, elevacion: 0.02 },
}

export const ORDEN_PARADAS: readonly ParadaId[] = [
  'craneo',
  'maxilar',
  'hombro',
  'acetabulo',
  'femur',
  'intercalar',
]

export const TRAMOS = ORDEN_PARADAS.length + 1

// Por debajo de este ancho, la cámara y la tarjeta del celular (borrador)
export const ANCHO_CELULAR = 820

function claveParada(id: ParadaId): Clave {
  const toma = TOMAS_PARADA[id]
  return {
    ...toma,
    escritorio: { ancla: [0.34, 0.5], alto: toma.vis / 0.62 },
    celular: { ancla: [0.5, 0.25], alto: toma.vis / 0.44 },
  }
}

export const CLAVES: readonly Clave[] = [ENTRADA, ...ORDEN_PARADAS.map(claveParada), CIERRE]

export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (t: number) => t * t * (3 - 2 * t)

export type Camara = {
  objetivo: Vec3
  azimut: number
  elevacion: number
  ancla: readonly [number, number]
  alto: number
}

function encuadreDe(clave: Clave, ancho: number, alto: number): Encuadre {
  if (ancho >= ANCHO_CELULAR) return clave.escritorio
  // En el celular, la entrada también se limita por el ancho (borrador:
  // min(alto × 0,6 / 1000, ancho × 1,05 / 400)).
  if (clave === ENTRADA) {
    const porAncho = ((400 / 1.05) * UNIDAD * alto) / ancho
    return { ...clave.celular, alto: Math.max(clave.celular.alto, porAncho) }
  }
  return clave.celular
}

// Cámara para un punto del recorrido. Entre la toma k y la k + 1 se
// interpola con e = smoothstep((u − 0,22) / 0,56): queda una pausa al
// principio y al final de cada tramo para leer la tarjeta. El alto visible
// se interpola en escala logarítmica. Con movimiento reducido, cada parada
// muestra su toma sin transición (cambia en la mitad del tramo).
export function camaraPara(seg: number, ancho: number, alto: number, reducido: boolean): Camara {
  const s = clamp(seg, 0, TRAMOS)
  if (reducido) {
    const clave = CLAVES[Math.round(s)] ?? ENTRADA
    const enc = encuadreDe(clave, ancho, alto)
    return { ...clave, ancla: enc.ancla, alto: enc.alto }
  }
  const k = Math.min(TRAMOS - 1, Math.floor(s))
  const u = s - k
  const e = smooth(clamp((u - 0.22) / 0.56))
  const a = CLAVES[k] ?? ENTRADA
  const b = CLAVES[k + 1] ?? CIERRE
  const ea = encuadreDe(a, ancho, alto)
  const eb = encuadreDe(b, ancho, alto)
  return {
    objetivo: [
      lerp(a.objetivo[0], b.objetivo[0], e),
      lerp(a.objetivo[1], b.objetivo[1], e),
      lerp(a.objetivo[2], b.objetivo[2], e),
    ],
    azimut: lerp(a.azimut, b.azimut, e),
    elevacion: lerp(a.elevacion, b.elevacion, e),
    ancla: [lerp(ea.ancla[0], eb.ancla[0], e), lerp(ea.ancla[1], eb.ancla[1], e)],
    alto: Math.exp(lerp(Math.log(ea.alto), Math.log(eb.alto), e)),
  }
}

// Peso de la tarjeta i (parada i + 1): w = 1 − clamp((|seg − (i + 1)| − 0,22) / 0,24).
// Opacidad = w; desplazamiento de ±22 px según el lado; oculta bajo 0,02.
// Con movimiento reducido, solo la de la parada más cercana, entera.
export function pesoTarjeta(seg: number, i: number, reducido: boolean) {
  if (reducido) return Math.round(clamp(seg, 0, TRAMOS)) === i + 1 ? 1 : 0
  return 1 - clamp((Math.abs(seg - (i + 1)) - 0.22) / 0.24)
}

// Opacidad de base de los implantes: 60 % en la entrada, 26 % los inactivos
// durante el recorrido y 95 % todos en el cierre. El activo va al 100 %
// (max(base, w)) y con brillo.
export function opacidadBase(seg: number, reducido: boolean) {
  const s = reducido ? Math.round(clamp(seg, 0, TRAMOS)) : seg
  if (s > 6.4) return lerp(0.26, 0.95, clamp((s - 6.4) / 0.5))
  return lerp(0.62, 0.26, clamp(s / 0.6))
}

// Texto de la entrada: se va entre seg 0 y 0,35. Cierre: aparece entre 6,55
// y 6,85. Índice anatómico: visible entre 0,5 y 6,5.
export function opacidadEntrada(seg: number, reducido: boolean) {
  if (reducido) return Math.round(seg) === 0 ? 1 : 0
  return 1 - clamp(seg / 0.35)
}

export function opacidadCierre(seg: number, reducido: boolean) {
  if (reducido) return Math.round(seg) >= TRAMOS ? 1 : 0
  return clamp((seg - 6.55) / 0.3)
}

export const indiceVisible = (seg: number) => seg > 0.5 && seg < 6.5
