// Guion del recorrido por el cuerpo (#recorrido), tomado de updateTour y
// camFor del borrador (docs/landing/landing-borrador.html) y de
// docs/landing/LANDING_SPEC.md, sección 4. Sin three: lo usan la escena 3D y
// el armazón HTML (tarjetas, índice, títulos), que tiene que funcionar
// aunque no haya WebGL.
//
// El progreso p (0 a 1) del contenedor se reparte en 7 tramos entre 8 tomas:
// seg = p × 7. k = 0 es el hero (la cabeza de perfil, como el busto de vidrio
// de antes), k = 1…6 una parada por implante (cabeza, maxilar, hombro,
// acetábulo, fémur proximal, diáfisis) y k = 7 el cierre (el cuerpo entero).
//
// Coordenadas del modelo (public/modelos/cuerpo-cabeza.glb y
// cuerpo-resto.glb): metros, Y hacia arriba, pies en 0, la figura mira a +Z
// y su lado derecho es -X.

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

export type Encuadre = {
  // Fracción del ancho y del alto de la pantalla donde queda el objetivo
  ancla: readonly [x: number, y: number]
  // Alto de la pantalla, en metros, a la distancia del objetivo
  alto: number
  // Estiramiento horizontal de la imagen (1: ninguno). Solo la toma del
  // hero lo usa: ver HERO.
  estiramiento?: number
  // Distancia de la cámara al objetivo, en metros. Sin valor, sale del fov
  // de 30° sobre la vista entera (la pantalla agrandada para dejar el
  // objetivo en el ancla). Solo la toma del hero la fija: ahí la perspectiva
  // tiene que ser la del busto aunque la cabeza no quede en el centro del
  // alto (en el celular), y el fov sale de la distancia.
  distancia?: number
}

// Fov vertical del guion, sobre la vista entera
export const FOV_GUION = 30

export type Clave = Toma & { escritorio: Encuadre; celular: Encuadre }

// Escala del borrador: el cuerpo dibujado mide 1000 unidades y la figura,
// unas 945 (1,70 m). Una unidad son 1,8 mm.
const UNIDAD = 0.0018

export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v)
const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (t: number) => t * t * (3 - 2 * t)

// Cierre: el cuerpo entero anclado a la derecha (68 % del ancho), con el
// texto a la izquierda; en el celular, centrado y debajo del texto.
// Borrador: s = alto × 0,88 / 1000 en escritorio y × 0,6 en el celular.
const CENTRO_CUERPO: Vec3 = [0, 0.85, 0]
const cuerpoEntero = (fraccion: number) => (1000 * UNIDAD) / fraccion

const CIERRE: Clave = {
  objetivo: CENTRO_CUERPO,
  azimut: -0.3,
  elevacion: 0.04,
  escritorio: { ancla: [0.68, 0.53], alto: cuerpoEntero(0.88) },
  celular: { ancla: [0.5, 0.68], alto: cuerpoEntero(0.6) },
}

// --- Toma del hero -----------------------------------------------------------
// La del busto de vidrio de antes (components/hero-3d/, ya borrado), pasada a
// las coordenadas del cuerpo: docs/landing/cuerpo-unico/base/MEDICIONES.md,
// "Cámara y pose del hero". En el busto la cámara quedaba quieta en
// [0, 0,02, 0,92] mirando al centro de la cabeza y el busto giraba 62°
// (perfil); acá el cuerpo queda quieto y la cámara gira −62° alrededor de la
// cabeza (y el estudio de luz con ella: escena.tsx), que es la misma imagen.
const HERO_ALTURA_CAMARA = 0.02
const HERO_DISTANCIA = 0.92
// Alto visible a la distancia del objetivo con fov 30°
export const DISTANCIA_HERO = Math.hypot(HERO_DISTANCIA, HERO_ALTURA_CAMARA)
export const ALTO_HERO = 2 * DISTANCIA_HERO * Math.tan((15 * Math.PI) / 180)

// Giro del busto: perfil a 62°, vaivén hasta 22° y vuelta
// cada 22 s; la entrada llega desde 55° más atrás y 2,5 cm más abajo en
// 2,6 s, con cúbica de salida.
const grados = (g: number) => (g * Math.PI) / 180
export const GIRO_PERFIL = grados(62)
export const GIRO_FRENTE = grados(22)
export const PERIODO_VAIVEN = 22
export const GIRO_ENTRADA = grados(55)
export const SUBIDA_ENTRADA = 0.025
export const SEGUNDOS_ENTRADA = 2.6

export const giroVaiven = (t: number) =>
  lerp(GIRO_PERFIL, GIRO_FRENTE, (1 - Math.cos((t / PERIODO_VAIVEN) * Math.PI * 2)) / 2)

// La toma: objetivo en el centro de la cabeza (1,56 m), de perfil y apenas
// desde arriba. El encuadre es el de la pantalla entera con la escena fija
// arriba de todo, medido sobre el hero de antes:
// - Escritorio (1440 × 900): la caja del 3D del hero ocupaba todo el alto y
//   la cabeza caía a 1066 px (ancla 0,740).
// - Celular (390 × 844): la cabeza cae a 625 px y hacia la derecha (ancla
//   [0,62, 0,74]), debajo del texto, con la cara, el cuello y el arranque de
//   los hombros a la vista (en las pantallas bajas, algo más abajo:
//   anclaHeroCelular); a su izquierda, a la altura del cuello, el aviso de
//   deslizar (CUELLO_BAJO_ANCLA). Con el desliz (deslizHero) va al busto
//   entero (ANCLA_FIN_DESLIZ). En el hero de antes caía a 922 px (ancla
//   1,092) y solo asomaba la coronilla; subió a pedido del usuario, con el
//   texto del hero más compacto en el celular.
// - Estiramiento: la cámara del busto tomaba el aspecto del canvas antes de
//   correr la figura con setViewOffset (R3F lo fija al crearla y después
//   `manual` lo congela), así que la imagen salía estirada a lo ancho en
//   1 + 2 × |foco − 0,5|: 1,11 en escritorio (foco 0,555) y 1 en el celular.
//   Es parte del busto que le gusta al usuario: se repite para no cambiarlo.
export const HERO: Clave = {
  objetivo: [0, 1.56, 0],
  azimut: -GIRO_PERFIL,
  elevacion: Math.atan2(HERO_ALTURA_CAMARA, HERO_DISTANCIA),
  escritorio: { ancla: [0.7404, 0.5], alto: ALTO_HERO, estiramiento: 1.11, distancia: DISTANCIA_HERO },
  celular: { ancla: [0.62, 0.74], alto: (ALTO_HERO * 844) / 523, estiramiento: 1, distancia: DISTANCIA_HERO },
}

// Celular: en las pantallas bajas, la cabeza baja lo justo para que la
// coronilla (0,14 m sobre el objetivo) quede debajo del texto del hero, hasta
// el ancla 0,8; en las altas queda en 0,74. `pieTexto` es el pie del texto
// (la línea de habilitaciones) en px desde arriba de la escena, y `alto`, el
// de la escena; los mide tour-scroll.tsx. `HERO.celular.alto` son los metros
// que entran en la pantalla.
const CORONILLA = 0.14
const ANCLA_HERO_BAJA = 0.8
export function anclaHeroCelular(pieTexto: number, alto: number) {
  const y = HERO.celular.ancla[1]
  if (pieTexto <= 0 || alto <= 0) return y
  return clamp(pieTexto / alto + CORONILLA / HERO.celular.alto, y, ANCLA_HERO_BAJA)
}

// Celular: cuánto más abajo que el objetivo queda el cuello (1,45 m, unos
// 3 cm bajo el mentón) en la toma del hero, en fracción del alto de la
// pantalla. El aviso de deslizar va a esa altura, a la izquierda del cuerpo
// (components/home/hero.tsx).
const ALTURA_CUELLO = 1.45
export const CUELLO_BAJO_ANCLA = (HERO.objetivo[1] - ALTURA_CUELLO) / HERO.celular.alto

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
  // Maxilar superior derecho, de frente y apenas desde abajo. Más cerca que
  // en el borrador: la estructura mide unos 5 cm y a 150 se perdía
  maxilar: { objetivo: [-0.013, 1.537, 0.066], vis: 82 * UNIDAD, azimut: -0.42, elevacion: -0.06 },
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

// Las ocho tomas: el hero, las seis paradas y el cierre
export const CLAVES: readonly Clave[] = [HERO, ...ORDEN_PARADAS.map(claveParada), CIERRE]

export type Camara = {
  objetivo: Vec3
  azimut: number
  elevacion: number
  ancla: readonly [number, number]
  alto: number
  estiramiento: number
  // Distancia de la cámara; null: la del fov del guion (camara.ts, Encuadre)
  distancia: number | null
}

// Distancia que da el fov del guion para un encuadre, o la fijada
function distanciaDe(enc: Encuadre) {
  if (enc.distancia) return enc.distancia
  const vistaEntera = 1 + 2 * Math.abs(enc.ancla[1] - 0.5)
  return (enc.alto * vistaEntera) / (2 * Math.tan(((FOV_GUION / 2) * Math.PI) / 180))
}

export type OpcionesCamara = {
  // Celular: cuánto se deslizó la toma del hero (deslizHero), en pantallas
  desliz?: number
  // Celular: alto del ancla de la toma del hero (anclaHeroCelular)
  anclaHero?: number | null
}

// Celular: la toma del hero se desliza como se deslizaba la
// página del hero de antes. Durante las primeras 0,4 pantallas de scroll el
// texto, las fibras y el degradé suben juntos, y el busto sube menos, hasta
// el busto entero centrado (ANCLA_FIN_DESLIZ, como en la base con unos 340 px
// de scroll): si subiera con el texto, asomaría el corte bajo los hombros.
// Recién después la cámara va a la craneoplastía, entre seg 0,4 y 0,9.
export const DESLIZ_HERO = 0.4
const FIN_DESLIZ = 0.9
const ANCLA_FIN_DESLIZ = [0.5, 0.692] as const

export const deslizHero = (seg: number, celular: boolean) =>
  celular ? clamp(seg, 0, DESLIZ_HERO) : 0

// El seg con el que corren la cámara y el peso del hero: en el celular, el
// primer tramo empieza después del desliz. Con movimiento reducido no se
// usa: cada toma cambia en la mitad del tramo, como las tarjetas.
export function segCuerpo(seg: number, celular: boolean) {
  if (!celular || seg >= 1) return seg
  return clamp((seg - DESLIZ_HERO) / (FIN_DESLIZ - DESLIZ_HERO))
}

function encuadreDe(clave: Clave, ancho: number, opciones?: OpcionesCamara): Encuadre {
  if (ancho >= ANCHO_CELULAR) return clave.escritorio
  if (clave !== HERO) return clave.celular
  const [x, y0] = clave.celular.ancla
  const y = opciones?.anclaHero ?? y0
  const t = (opciones?.desliz ?? 0) / DESLIZ_HERO
  return {
    ...clave.celular,
    ancla: [lerp(x, ANCLA_FIN_DESLIZ[0], t), lerp(y, ANCLA_FIN_DESLIZ[1], t)],
  }
}

// Cámara para un punto del recorrido. Entre la toma k y la k + 1 se
// interpola con e = smoothstep((u − 0,22) / 0,56): queda una pausa al
// principio y al final de cada tramo para leer la tarjeta. El alto visible
// se interpola en escala logarítmica. Con movimiento reducido, cada parada
// muestra su toma sin transición (cambia en la mitad del tramo).
export function camaraPara(
  seg: number,
  ancho: number,
  reducido: boolean,
  opciones?: OpcionesCamara,
): Camara {
  const s = clamp(seg, 0, TRAMOS)
  if (reducido) {
    const clave = CLAVES[Math.round(s)] ?? HERO
    const enc = encuadreDe(clave, ancho, opciones)
    return {
      ...clave,
      ancla: enc.ancla,
      alto: enc.alto,
      estiramiento: enc.estiramiento ?? 1,
      distancia: enc.distancia ?? null,
    }
  }
  const k = Math.min(TRAMOS - 1, Math.floor(s))
  const u = s - k
  const e = smooth(clamp((u - 0.22) / 0.56))
  const a = CLAVES[k] ?? HERO
  const b = CLAVES[k + 1] ?? CIERRE
  const ea = encuadreDe(a, ancho, opciones)
  const eb = encuadreDe(b, ancho, opciones)
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
    estiramiento: lerp(ea.estiramiento ?? 1, eb.estiramiento ?? 1, e),
    // Solo si alguna de las dos tomas fija la distancia (la del hero): se
    // interpola en escala logarítmica, como el alto
    distancia:
      ea.distancia || eb.distancia
        ? Math.exp(lerp(Math.log(distanciaDe(ea)), Math.log(distanciaDe(eb)), e))
        : null,
  }
}

// Peso del aspecto del hero: 1 en la toma 0 y 0 desde la
// craneoplastía, con la misma curva que la cámara del primer tramo. Con
// movimiento reducido, de golpe en la mitad del tramo.
export function pesoHero(seg: number, reducido: boolean) {
  if (reducido) return Math.round(clamp(seg, 0, TRAMOS)) === 0 ? 1 : 0
  return 1 - smooth(clamp((clamp(seg, 0, 1) - 0.22) / 0.56))
}

// Maxilar: 0 con el hueso entero (hero y craneoplastía) y 1
// con el recortado y su implante. Se funde al acercarse a la parada 2
// (seg 1,4 a 1,78, cuando su tarjeta termina de entrar) y queda así hasta el
// cierre. Con movimiento reducido, el estado final de cada parada.
export function pesoMaxilar(seg: number, reducido: boolean) {
  if (reducido) return Math.round(clamp(seg, 0, TRAMOS)) >= 2 ? 1 : 0
  return smooth(clamp((seg - 1.4) / 0.38))
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

// Texto del hero (la entrada): se va entre seg 0 y 0,35. Cierre: aparece entre 6,55
// y 6,85. Índice anatómico: visible entre 0,5 y 6,5.
// En el celular el texto sube con el desliz del hero (deslizHero) y se va
// después, entre 0,4 y 0,6: como en la página de antes, los botones siguen a
// la vista mientras asoma el busto entero.
export function opacidadEntrada(seg: number, reducido: boolean, celular = false) {
  if (reducido) return Math.round(seg) === 0 ? 1 : 0
  if (celular) return 1 - clamp((seg - 0.4) / 0.2)
  return 1 - clamp(seg / 0.35)
}

export function opacidadCierre(seg: number, reducido: boolean) {
  if (reducido) return Math.round(seg) >= TRAMOS ? 1 : 0
  return clamp((seg - 6.55) / 0.3)
}

export const indiceVisible = (seg: number) => seg > 0.5 && seg < 6.5
