// Pieza que se transforma de "Cómo trabajamos cada caso" (#proceso), con la
// idea y los tiempos del borrador de la landing (docs/landing/
// landing-borrador.html, drawProcess): un fémur hecho de partículas que pasa
// por tres formas, atadas a los tres pasos con el scroll.
//   1. Cortes de TC: el fémur en cortes axiales apilados.
//   2. Hueso con la zona a resecar: los cortes se juntan en el fémur; el
//      tramo de diáfisis a resecar en su color y los dos planos de corte
//      punteados.
//   3. Implante y guías: el resto del fémur queda; el tramo resecado pasa a
//      ser el implante intercalar, con el clavo endomedular y las dos guías
//      de resección sobre los planos de corte.
// El borrador mostraba solo el tramo de diáfisis, un tubo que no se leía como
// hueso: va el fémur entero (cabeza, cuello, trocánteres, diáfisis y
// cóndilos) para que se entienda qué es (docs/DECISIONES.md). Más detalle
// que el borrador: la nube es 3D (proyectada en canvas 2D, con profundidad y
// un vaivén que gira de verdad), los cortes muestran la cortical y el canal
// medular (con hueso esponjoso en las epífisis), el implante tiene la
// celosía porosa y los collares macizos, y cada guía su ranura de corte y
// dos vainas para clavijas. Es el caso del intercalar de fémur
// (content/customCases.ts, caso destacado): sin medidas inventadas, solo
// proporciones.
//
// Al pasar el mouse, las partículas cerca del puntero se apartan y vuelven a
// su lugar con un resorte (desplazamiento en pantalla, aparte de la forma).

import { clamp, lerp, smooth, leerColor, type Ctx, type Rgb } from './lienzo'

// Hueso, zona a resecar, implante y guías, y planos de corte (en el azul
// del hueso, como en el borrador, pero aparte: no son hueso que quede)
type Categoria = 0 | 1 | 2 | 3
type P3 = { x: number; y: number; z: number; c: Categoria }

// Unidades: el fémur mide 400 de alto (y hacia abajo, como en el canvas),
// con la diáfisis sobre el eje x = z = 0 y la cabeza hacia -x (fémur derecho
// de frente).
const ALTO = 400
// Centro de la caja del fémur en x (de la cabeza al trocánter mayor)
const X_CENTRO = -17
const CORTE_1 = 170
const CORTE_2 = 260
const CORTES_TC = 26
// Medio ancho y media profundidad de los planos de corte
const PLANO_X = 46
const PLANO_Z = 30
// Guías: marcos en caja alrededor del hueso, más anchos que él (borrador:
// 96 de ancho contra unos 52 del hueso)
const GUIA_X = 28
const GUIA_Z = 21
const GUIA_ALTO = 14

const rnd = (a: number, b: number) => a + Math.random() * (b - a)

// Tubo de la diáfisis y las dos metáfisis: de bajo los trocánteres al
// ensanche de arriba de los cóndilos
const TUBO_0 = 62
const TUBO_1 = 354
const proximal = (y: number) => smooth(clamp((112 - y) / 50))
const distal = (y: number) => clamp((y - 290) / 66)
const abertura = (y: number) => Math.max(proximal(y), distal(y))
const radio = (y: number) => 16 + 4 * proximal(y) + 15 * distal(y) ** 1.6
// Sección elíptica, más achatada abajo
const achatado = (y: number) => 0.86 - 0.16 * distal(y)
// Canal medular: más ancho (cortical más fina) en los extremos
const canal = (y: number) => radio(y) * (0.56 + 0.3 * abertura(y))

function superficie(a: number, r: number, ach: number): { x: number; z: number } {
  return { x: Math.sin(a) * r, z: Math.cos(a) * r * ach }
}

// Punto de la superficie del fémur, con lo que hace falta para los cortes de
// TC: la normal horizontal (para entrar hacia el centro del corte) y cuánto
// se puede entrar (`grosor`: la cortical en el tubo, el hueso esponjoso en
// las epífisis)
type Muestra = { x: number; y: number; z: number; nx: number; nz: number; grosor: number; tubo: boolean }
type Primitiva = {
  area: number
  muestra: () => Muestra
  dentro: (x: number, y: number, z: number) => boolean
}

const tubo: Primitiva = {
  area: (() => {
    let s = 0
    for (let y = TUBO_0; y < TUBO_1; y++) s += Math.PI * radio(y) * (1 + achatado(y))
    return s
  })(),
  muestra: () => {
    let y: number
    do y = rnd(TUBO_0, TUBO_1)
    while (Math.random() * 34 > radio(y))
    const a = rnd(0, Math.PI * 2)
    const r = radio(y) - rnd(0, 1.2)
    const s = superficie(a, r, achatado(y))
    return { x: s.x, y, z: s.z, nx: Math.sin(a), nz: Math.cos(a), grosor: r - canal(y), tubo: true }
  },
  dentro: (x, y, z) => {
    if (y <= TUBO_0 || y >= TUBO_1) return false
    const r = radio(y)
    return (x / r) ** 2 + (z / (r * achatado(y))) ** 2 < 0.94
  },
}

function elipsoide(cx: number, cy: number, cz: number, a: number, b: number, c: number): Primitiva {
  const p = 1.6
  return {
    area: 4 * Math.PI * (((a * b) ** p + (a * c) ** p + (b * c) ** p) / 3) ** (1 / p),
    muestra: () => {
      const u = rnd(-1, 1)
      const f = rnd(0, Math.PI * 2)
      const s = Math.sqrt(1 - u * u) * (1 - rnd(0, 0.05))
      const ex = s * Math.cos(f) * a
      const ez = s * Math.sin(f) * c
      const l = Math.hypot(ex / a / a, ez / c / c) || 1
      return {
        x: cx + ex,
        y: cy + u * b,
        z: cz + ez,
        nx: ex / a / a / l,
        nz: ez / c / c / l,
        grosor: 0.85 * Math.hypot(ex, ez),
        tubo: false,
      }
    },
    dentro: (x, y, z) => ((x - cx) / a) ** 2 + ((y - cy) / b) ** 2 + ((z - cz) / c) ** 2 < 0.94,
  }
}

// Cuello: un cilindro entre dos puntos del plano xy (los extremos quedan
// dentro de la cabeza y de la metáfisis)
function cilindro(x0: number, y0: number, x1: number, y1: number, r: number): Primitiva {
  const L = Math.hypot(x1 - x0, y1 - y0)
  const ux = (x1 - x0) / L
  const uy = (y1 - y0) / L
  return {
    area: 2 * Math.PI * r * L,
    muestra: () => {
      const t = Math.random()
      const a = rnd(0, Math.PI * 2)
      // Normal: perpendicular al eje en el plano xy, o hacia z
      const nx = -uy * Math.cos(a)
      const ny = ux * Math.cos(a)
      const nz = Math.sin(a)
      const l = Math.hypot(nx, nz) || 1
      return {
        x: x0 + ux * t * L + nx * r,
        y: y0 + uy * t * L + ny * r,
        z: nz * r,
        nx: nx / l,
        nz: nz / l,
        grosor: 0.85 * r,
        tubo: false,
      }
    },
    dentro: (x, y, z) => {
      const t = clamp(((x - x0) * ux + (y - y0) * uy) / L)
      return Math.hypot(x - x0 - ux * t * L, y - y0 - uy * t * L, z) < r * 0.97
    },
  }
}

const PIEZAS: Primitiva[] = [
  tubo,
  // Metáfisis proximal: cierra el tubo bajo el cuello y el trocánter
  elipsoide(3, 60, 0, 19, 18, 18),
  // Cabeza y cuello (unos 130° con la diáfisis)
  elipsoide(-46, 28, 3, 20, 20, 20),
  cilindro(-44, 30, -2, 66, 11),
  // Trocánter mayor y menor (este, medial y posterior)
  elipsoide(16, 50, -3, 13, 22, 14),
  elipsoide(-14, 100, -7, 7, 9, 7),
  // Techo de la escotadura entre los cóndilos y los cóndilos, el medial
  // algo más grande y más bajo
  elipsoide(0, 352, -2, 20, 10, 20),
  elipsoide(-15, 368, -3, 18, 22, 24),
  elipsoide(15, 366, -3, 17, 20, 23),
]
const AREA = PIEZAS.reduce((s, p) => s + p.area, 0)

// Punto de la superficie del fémur entero: de una pieza según su área, y
// solo si no queda dentro de otra
function muestraFemur(): Muestra {
  for (;;) {
    let r = Math.random() * AREA
    let pieza = PIEZAS[0]!
    for (const p of PIEZAS) {
      r -= p.area
      pieza = p
      if (r <= 0) break
    }
    const s = pieza.muestra()
    if (!PIEZAS.some((o) => o !== pieza && o.dentro(s.x, s.y, s.z))) return s
  }
}

function ordenarPorAltura<T extends { y: number }>(lista: T[]) {
  return lista
    .map((p) => ({ p, k: p.y + Math.random() * 6 }))
    .sort((a, b) => a.k - b.k)
    .map(({ p }) => p)
}

// Las tres formas, con la misma cantidad de partículas e índice a índice:
// la partícula i de una forma es la i de la siguiente.
function formas(n: number): [P3[], P3[], P3[]] {
  // --- 2. Hueso con la zona a resecar (la forma de base) ---
  const nPlano = Math.round(n * 0.035)
  const hueso: P3[] = []
  // Muestra de superficie de cada partícula de hueso (null en los planos)
  const datos: (Muestra | null)[] = []
  // Planos de corte: dos planos que atraviesan el hueso, unas tres veces más
  // anchos que él (las líneas punteadas del borrador), con el contorno en
  // trazos
  for (const yc of [CORTE_1, CORTE_2]) {
    const perimetro = 4 * (PLANO_X + PLANO_Z)
    let k = 0
    while (k < nPlano) {
      const t = rnd(0, perimetro)
      if (t % 13 > 8) continue
      let x: number
      let z: number
      if (t < 2 * PLANO_X) [x, z] = [-PLANO_X + t, PLANO_Z]
      else if (t < 2 * PLANO_X + 2 * PLANO_Z) [x, z] = [PLANO_X, PLANO_Z - (t - 2 * PLANO_X)]
      else if (t < 4 * PLANO_X + 2 * PLANO_Z) [x, z] = [PLANO_X - (t - 2 * PLANO_X - 2 * PLANO_Z), -PLANO_Z]
      else [x, z] = [-PLANO_X, -PLANO_Z + (t - 4 * PLANO_X - 2 * PLANO_Z)]
      hueso.push({ x: x + rnd(-0.6, 0.6), y: yc + rnd(-0.6, 0.6), z: z + rnd(-0.6, 0.6), c: 3 })
      datos.push(null)
      k++
    }
  }
  while (hueso.length < n) {
    const s = muestraFemur()
    const enHueco = (s.y > CORTE_1 - 2 && s.y < CORTE_1 + 2) || (s.y > CORTE_2 - 2 && s.y < CORTE_2 + 2)
    if (enHueco) continue
    hueso.push({ x: s.x, y: s.y, z: s.z, c: s.y > CORTE_1 && s.y < CORTE_2 ? 1 : 0 })
    datos.push(s)
  }

  // --- 1. Cortes de TC: cada partícula baja o sube a su corte ---
  const pasoCorte = (ALTO - 24) / (CORTES_TC - 1)
  const tc: P3[] = hueso.map((p, i) => {
    const yc = 12 + Math.round((clamp(p.y, 12, ALTO - 12) - 12) / pasoCorte) * pasoCorte
    const s = datos[i]
    if (s && !s.tubo) {
      // Epífisis: el contorno del corte y hueso esponjoso hacia adentro
      const d = Math.random() < 0.5 ? rnd(0, 1.2) : s.grosor * (1 - Math.sqrt(Math.random()))
      return { x: p.x - s.nx * d, y: yc, z: p.z - s.nz * d, c: 0 }
    }
    // Tubo (y los planos): contorno externo de la cortical, contorno del
    // canal y relleno entre los dos; en las metáfisis, algo de hueso
    // esponjoso dentro del canal
    const yt = clamp(yc, TUBO_0, TUBO_1)
    const r = radio(yt)
    const rc = canal(yt)
    const esponjoso = Math.random() < abertura(yt) * 0.3
    const tipo = Math.random()
    const rr = esponjoso
      ? Math.sqrt(Math.random()) * rc
      : tipo < 0.45
        ? r - rnd(0, 1.2)
        : tipo < 0.75
          ? rc + rnd(0, 1.2)
          : Math.sqrt(rnd((rc / r) ** 2, 1)) * r
    const a = Math.atan2(p.x, p.z / achatado(yt)) + rnd(-0.05, 0.05)
    const q = superficie(a, rr, achatado(yt))
    return { x: q.x, y: yc, z: q.z, c: 0 }
  })

  // --- 3. Implante y guías ---
  // El resto del fémur queda donde está; la zona resecada y los planos pasan
  // a implante, clavo y guías, emparejados por altura.
  const resto = hueso.map((p, i) => ({ y: p.y, i })).filter(({ i }) => hueso[i]?.c !== 0)
  const m = resto.length
  const nuevas: P3[] = []
  const nImplante = Math.round(m * 0.55)
  const nClavo = Math.round(m * 0.1)
  const nGuias = m - nImplante - nClavo
  // Implante intercalar: collares macizos en los extremos y, en el medio,
  // la celosía porosa: barras en diagonal sobre la cara que mira a la
  // cámara (atrás se superponían y no se leía). Un poco más ancho que el
  // hueso.
  const nCollar = Math.round(nImplante * 0.3)
  while (nuevas.length < nCollar) {
    const y = Math.random() < 0.5 ? rnd(CORTE_1 + 1.5, CORTE_1 + 7) : rnd(CORTE_2 - 7, CORTE_2 - 1.5)
    const s = superficie(rnd(0, Math.PI * 2), radio(y) + 1.2, achatado(y))
    nuevas.push({ x: s.x, y, z: s.z, c: 2 })
  }
  const celda = 9
  const rMedio = radio((CORTE_1 + CORTE_2) / 2) + 1.2
  while (nuevas.length < nImplante) {
    const y = rnd(CORTE_1 + 7, CORTE_2 - 7)
    // Una barra de cada familia (u + y y u − y constantes cada `celda`)
    const k = Math.round(rnd(-9, 9))
    const u = Math.random() < 0.5 ? k * celda - y : k * celda + y
    const a = (u / rMedio) % (Math.PI * 2)
    if (Math.cos(a) < -0.15) continue
    const s = superficie(a, radio(y) + 1.2, achatado(y))
    nuevas.push({ x: s.x, y, z: s.z, c: 2 })
  }
  // Clavo endomedular: de la punta del trocánter a la metáfisis distal
  for (let k = 0; k < nClavo; k++) {
    const a = rnd(0, Math.PI * 2)
    nuevas.push({ x: Math.sin(a) * 3.5, y: rnd(50, 345), z: Math.cos(a) * 3.5, c: 2 })
  }
  // Guías de resección: un marco en caja alrededor del hueso, apoyado junto
  // a cada plano de corte y bien más ancho que el hueso (el rectángulo del
  // borrador), con la ranura de corte en el borde que da al plano y dos
  // vainas para clavijas en la cara de adelante
  const guias = [
    { y0: CORTE_1 - 1 - GUIA_ALTO, y1: CORTE_1 - 1, ranura: CORTE_1 - 3 },
    { y0: CORTE_2 + 1, y1: CORTE_2 + 1 + GUIA_ALTO, ranura: CORTE_2 + 3 },
  ]
  for (let k = 0; k < nGuias; k++) {
    const g = guias[k % 2] ?? guias[0]!
    const tipo = Math.random()
    const ym = (g.y0 + g.y1) / 2
    if (tipo < 0.16) {
      // Vaina: un cilindro corto que sale de la cara de adelante
      const x0 = Math.random() < 0.5 ? -14 : 14
      const a = rnd(0, Math.PI * 2)
      nuevas.push({ x: x0 + Math.cos(a) * 2.2, y: ym + Math.sin(a) * 2.2, z: GUIA_Z + rnd(0, 8), c: 2 })
      continue
    }
    if (tipo < 0.26) {
      // Ranura: una línea sobre la cara de adelante, paralela al plano
      nuevas.push({ x: rnd(-GUIA_X, GUIA_X), y: g.ranura + rnd(-0.5, 0.5), z: GUIA_Z + 0.5, c: 2 })
      continue
    }
    // Las doce aristas de la caja, con un poco de espesor
    const arista = Math.floor(Math.random() * 12)
    const t = Math.random()
    const yb = arista % 2 ? g.y0 : g.y1
    let x: number
    let y: number
    let z: number
    if (arista < 4) [x, y, z] = [lerp(-GUIA_X, GUIA_X, t), yb, arista < 2 ? GUIA_Z : -GUIA_Z]
    else if (arista < 8) [x, y, z] = [arista < 6 ? GUIA_X : -GUIA_X, yb, lerp(-GUIA_Z, GUIA_Z, t)]
    else
      [x, y, z] = [
        arista < 10 ? GUIA_X : -GUIA_X,
        lerp(g.y0, g.y1, t),
        arista % 2 ? GUIA_Z : -GUIA_Z,
      ]
    nuevas.push({ x: x + rnd(-0.6, 0.6), y: y + rnd(-0.6, 0.6), z: z + rnd(-0.6, 0.6), c: 2 })
  }
  const destino = ordenarPorAltura(nuevas)
  const origen = ordenarPorAltura(resto)
  const implante: P3[] = hueso.map((p) => ({ ...p }))
  origen.forEach(({ i }, k) => {
    const d = destino[k]
    if (d) implante[i] = d
  })

  return [tc, hueso, implante]
}

export const N_PROCESO_ESCRITORIO = 6400
export const N_PROCESO_CELULAR = 3800

// Paso activo según el progreso de la sección (borrador)
export const pasoActivo = (q: number) => {
  const f = q * 2
  return f < 0.62 ? 0 : f < 1.62 ? 1 : 2
}

// Puntero sobre el lienzo, en píxeles CSS, con su velocidad (px/s)
export type Puntero = { x: number; y: number; vx: number; vy: number }

// Hover: radio de alcance (en unidades del fémur), empuje hacia afuera (en
// unidades del fémur/s², así abre lo mismo en cualquier pantalla), arrastre
// de la velocidad del puntero (1/s) con su tope (px/s, para que un barrido
// rápido no abra mucho más que el mouse lento), desvío del empuje por
// partícula (rad) y variación del alcance por partícula (para que se desarme
// con el borde roto en vez de abrirse en un anillo limpio), resorte (1/s²) y
// amortiguación (1/s). Vuelve a armarse en algo más de un segundo.
const ALCANCE = 64
const EMPUJE = 9000
const ARRASTRE = 5
const VELOCIDAD_MAX = 1600
const DESVIO = 0.7
const ALCANCE_MIN = 0.5
const RESORTE = 26
const AMORTIGUACION = 6.5

export class PiezaProceso {
  private formas: [P3[], P3[], P3[]]
  private retraso: Float32Array
  private estilos: string[][][][] = []
  private lotes = new Map<string, number[]>()
  // Desplazamiento del hover por partícula, en pantalla (px y px/s), y cuánto
  // la empuja, hacia dónde y desde qué distancia (para que no se abra como un
  // anillo limpio)
  private dx: Float32Array
  private dy: Float32Array
  private vx: Float32Array
  private vy: Float32Array
  private peso: Float32Array
  private desvioX: Float32Array
  private desvioY: Float32Array
  private alcance: Float32Array
  private desarmada = false

  constructor(n: number) {
    this.formas = formas(n)
    this.retraso = new Float32Array(n).map(() => Math.random() * 0.3)
    this.dx = new Float32Array(n)
    this.dy = new Float32Array(n)
    this.vx = new Float32Array(n)
    this.vy = new Float32Array(n)
    this.peso = new Float32Array(n).map(() => 0.55 + Math.random() * 0.9)
    const desvio = new Float32Array(n).map(() => (Math.random() * 2 - 1) * DESVIO)
    this.desvioX = desvio.map(Math.cos)
    this.desvioY = desvio.map(Math.sin)
    this.alcance = new Float32Array(n).map(() => ALCANCE_MIN + Math.random() * (1 - ALCANCE_MIN))
    const hueso = leerColor('--color-hueso', '#2260a1')
    const colores: Rgb[] = [
      hueso,
      leerColor('--color-resecar', '#c8456b'),
      leerColor('--color-metal', '#586884'),
      hueso,
    ]
    // Estilos precalculados: categoría de origen y de destino, paso de la
    // mezcla (0 a 8) y nivel de profundidad (0 a 3)
    for (let a = 0; a < 4; a++) {
      this.estilos[a] = []
      for (let b = 0; b < 4; b++) {
        this.estilos[a]![b] = []
        for (let q = 0; q <= 8; q++) {
          const ca = colores[a]!
          const cb = colores[b]!
          const t = q / 8
          const rgb = [0, 1, 2].map((k) => Math.round(lerp(ca[k]!, cb[k]!, t)))
          // Opacidad por profundidad: atrás, más tenue (siempre legible)
          this.estilos[a]![b]![q] = [0.5, 0.68, 0.84, 1].map(
            (alfa) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alfa})`,
          )
        }
      }
    }
  }

  // q: progreso de la sección (0 a 1); t: segundos, para el vaivén; dt:
  // segundos desde el cuadro anterior, para el hover; puntero: null si no
  // está sobre la pieza (o con movimiento reducido)
  dibujar(
    g: Ctx,
    w: number,
    h: number,
    dpr: number,
    q: number,
    t: number,
    reducido: boolean,
    dt = 0,
    puntero: Puntero | null = null,
  ) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.clearRect(0, 0, w, h)
    // Tramo y mezcla (borrador): dos tramos entre tres formas, con una pausa
    // al principio y al final de cada uno. Con movimiento reducido, la forma
    // del paso activo, sin transición.
    let k: number
    let e: number
    if (reducido) {
      const paso = pasoActivo(q)
      // Paso 0: forma 0; paso 1: forma 1 (fin del primer tramo); paso 2:
      // forma 2 (fin del segundo)
      k = paso === 2 ? 1 : 0
      e = paso === 0 ? 0 : 1
    } else {
      const f = q * 2
      k = Math.min(1, Math.floor(f))
      const u = f >= 2 ? 1 : f - k
      e = smooth(clamp((u - 0.25) / 0.5))
    }
    const A = this.formas[k]!
    const B = this.formas[k + 1]!

    // Vaivén (borrador: sin(t × 0,45) × 0,35), y la vista un poco desde
    // arriba para que los cortes se lean como elipses
    const giro = reducido ? 0.18 : 0.18 + Math.sin(t * 0.45) * 0.35
    const cg = Math.cos(giro)
    const sg = Math.sin(giro)
    const el = 0.32
    const ce = Math.cos(el)
    const se = Math.sin(el)
    // Ancho: la cabeza con el trocánter y los planos de corte, que giran con
    // el vaivén
    const sc = Math.min(w / 150, h / (ALTO * ce + 50)) * 0.97
    const cx = w / 2
    const cy = h / 2
    const tam = Math.max(1.8, sc * 1.05)

    // Hover: con el puntero encima o mientras las partículas vuelven
    if (reducido && this.desarmada) this.armar()
    const hover = !reducido && dt > 0 && (puntero !== null || this.desarmada)
    const alcance = ALCANCE * sc
    const empuje = EMPUJE * sc
    let pvx = 0
    let pvy = 0
    if (puntero) {
      const v = Math.hypot(puntero.vx, puntero.vy)
      const tope = v > VELOCIDAD_MAX ? VELOCIDAD_MAX / v : 1
      pvx = puntero.vx * tope * ARRASTRE
      pvy = puntero.vy * tope * ARRASTRE
    }
    let movimiento = 0

    for (let i = 0; i < A.length; i++) {
      const a = A[i]!
      const b = B[i]!
      const d = this.retraso[i] ?? 0
      const m = e <= 0 ? 0 : e >= 1 && d < 0.3 ? 1 : smooth(clamp((e - d) / 0.7))
      const x = lerp(a.x, b.x, m) - X_CENTRO
      const y = lerp(a.y, b.y, m)
      const z = lerp(a.z, b.z, m)
      const X = x * cg + z * sg
      const Z = -x * sg + z * cg
      let sx = cx + X * sc
      let sy = cy + ((y - ALTO / 2) * ce + Z * se) * sc
      if (hover) {
        let ox = this.dx[i]!
        let oy = this.dy[i]!
        let vx = this.vx[i]!
        let vy = this.vy[i]!
        if (puntero) {
          const px = sx + ox - puntero.x
          const py = sy + oy - puntero.y
          const d2 = px * px + py * py
          const ai = alcance * this.alcance[i]!
          if (d2 < ai * ai) {
            const dist = Math.sqrt(d2) || 1
            const f = (1 - dist / ai) ** 2 * this.peso[i]! * dt
            // Dirección hacia afuera, girada por el desvío de la partícula
            const ux = px / dist
            const uy = py / dist
            const cd = this.desvioX[i]!
            const sd = this.desvioY[i]!
            vx += ((ux * cd - uy * sd) * empuje + pvx) * f
            vy += ((ux * sd + uy * cd) * empuje + pvy) * f
          }
        }
        // Resorte de vuelta a su lugar, con amortiguación
        const amort = Math.exp(-AMORTIGUACION * dt)
        vx = (vx - ox * RESORTE * dt) * amort
        vy = (vy - oy * RESORTE * dt) * amort
        ox += vx * dt
        oy += vy * dt
        this.dx[i] = ox
        this.dy[i] = oy
        this.vx[i] = vx
        this.vy[i] = vy
        movimiento = Math.max(movimiento, Math.abs(ox) + Math.abs(oy) + Math.abs(vx) * 0.05 + Math.abs(vy) * 0.05)
        sx += ox
        sy += oy
      }
      // Profundidad: lo de atrás, más tenue y más chico
      const prof = clamp((Z / 35 + 1) / 2)
      let nivel = Math.min(3, Math.floor(prof * 4))
      // El metal (implante y guías) un punto más fuerte y más grande: es lo
      // que el paso 3 tiene que mostrar
      const metal = (b.c === 2 ? m : 0) + (a.c === 2 ? 1 - m : 0)
      if (metal > 0.5) nivel = Math.min(3, nivel + 1)
      const mezcla = a.c === b.c ? 0 : Math.round(m * 8)
      const estilo = this.estilos[a.c]![b.c]![mezcla]![nivel]!
      let lista = this.lotes.get(estilo)
      if (!lista) {
        lista = []
        this.lotes.set(estilo, lista)
      }
      lista.push(sx, sy, tam * (0.8 + prof * 0.4) * (1 + metal * 0.25))
    }
    if (hover) {
      // Ya volvieron todas: se deja de calcular hasta el próximo puntero
      this.desarmada = puntero !== null || movimiento > 0.05
      if (!this.desarmada) this.armar()
    }
    for (const [estilo, lista] of this.lotes) {
      if (!lista.length) continue
      g.fillStyle = estilo
      g.beginPath()
      for (let i = 0; i < lista.length; i += 3) {
        const s = lista[i + 2]!
        g.rect(lista[i]! - s / 2, lista[i + 1]! - s / 2, s, s)
      }
      g.fill()
      lista.length = 0
    }
  }

  // Todas las partículas en su lugar, quietas
  private armar() {
    this.dx.fill(0)
    this.dy.fill(0)
    this.vx.fill(0)
    this.vy.fill(0)
    this.desarmada = false
  }
}
