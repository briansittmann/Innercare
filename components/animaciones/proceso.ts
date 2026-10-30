// Pieza que se transforma de "Cómo trabajamos cada caso" (#proceso), con la
// idea y los tiempos del borrador de la landing (docs/landing/
// landing-borrador.html, drawProcess): un segmento de fémur hecho de
// partículas que pasa por tres formas, atadas a los tres pasos con el scroll.
//   1. Cortes de TC: el hueso en cortes axiales apilados.
//   2. Hueso con la zona a resecar: los cortes se juntan en el hueso; el
//      tramo a resecar en su color y los dos planos de corte punteados.
//   3. Implante y guías: los extremos del hueso quedan; el tramo resecado
//      pasa a ser el implante intercalar, con el clavo endomedular y las dos
//      guías de resección sobre los planos de corte.
// Más detalle que el borrador: la nube es 3D (proyectada en canvas 2D, con
// profundidad y un vaivén que gira de verdad), los cortes muestran la
// cortical y el canal medular (con hueso esponjoso en los extremos), el
// implante tiene la celosía porosa y los collares macizos, y cada guía su
// ranura de corte y dos vainas para clavijas. Es el caso del intercalar de
// fémur (content/customCases.ts, caso destacado): sin medidas inventadas,
// solo proporciones.

import { clamp, lerp, smooth, leerColor, type Ctx, type Rgb } from './lienzo'

type Categoria = 0 | 1 | 2 // hueso, zona a resecar, implante y guías
type P3 = { x: number; y: number; z: number; c: Categoria }

// Unidades: el segmento mide 300 de alto (y hacia abajo, como en el canvas),
// centrado en x = z = 0.
const ALTO = 300
const CORTE_1 = 101
const CORTE_2 = 199
const CORTES_TC = 26
const ACHATADO = 0.86 // sección elíptica del fémur

const rnd = (a: number, b: number) => a + Math.random() * (b - a)

// Radio del hueso: diáfisis y ensanche metafisario en los dos extremos
function abertura(y: number) {
  const t = y / ALTO
  return Math.max(0, (0.27 - t) / 0.27, (t - 0.73) / 0.27)
}
const radio = (y: number) => 26 + 28 * abertura(y) ** 1.6
// Canal medular: más ancho (cortical más fina) en los extremos
const canal = (y: number) => radio(y) * (0.56 + 0.3 * abertura(y))

function superficie(y: number, a: number, r: number): { x: number; z: number } {
  return { x: Math.sin(a) * r, z: Math.cos(a) * r * ACHATADO }
}

// Punto sobre la superficie del hueso, con y repartida según el perímetro
function yEnHueso(y0: number, y1: number) {
  for (;;) {
    const y = rnd(y0, y1)
    if (Math.random() * 54 < radio(y)) return y
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
  const anillo = Math.round(n * 0.04)
  const hueso: P3[] = []
  // Planos de corte: dos anillos punteados alrededor del hueso
  for (const yc of [CORTE_1, CORTE_2]) {
    const r = radio(yc) + 9
    let k = 0
    while (k < anillo) {
      const a = rnd(0, Math.PI * 2)
      if ((a * r) % 10 > 6) continue
      const s = superficie(a, a, r)
      hueso.push({ x: s.x, y: yc + rnd(-0.4, 0.4), z: s.z, c: 1 })
      k++
    }
  }
  while (hueso.length < n) {
    const y = yEnHueso(0, ALTO)
    const enHueco = (y > CORTE_1 - 2 && y < CORTE_1 + 2) || (y > CORTE_2 - 2 && y < CORTE_2 + 2)
    if (enHueco) continue
    const a = rnd(0, Math.PI * 2)
    const s = superficie(a, a, radio(y) - rnd(0, 1.4))
    hueso.push({ x: s.x, y, z: s.z, c: y > CORTE_1 && y < CORTE_2 ? 1 : 0 })
  }

  // --- 1. Cortes de TC: cada partícula baja o sube a su corte ---
  const pasoCorte = (ALTO - 12) / (CORTES_TC - 1)
  const tc: P3[] = hueso.map((p) => {
    const yc = 6 + Math.round((clamp(p.y, 6, ALTO - 6) - 6) / pasoCorte) * pasoCorte
    const r = radio(yc)
    const rc = canal(yc)
    // En los extremos, algo de hueso esponjoso dentro del canal
    const esponjoso = Math.random() < abertura(yc) * 0.5
    const rr = esponjoso ? Math.sqrt(Math.random()) * rc : Math.sqrt(rnd((rc / r) ** 2, 1)) * r
    const a = Math.atan2(p.x, p.z / ACHATADO) + rnd(-0.05, 0.05)
    const s = superficie(a, a, rr)
    return { x: s.x, y: yc, z: s.z, c: 0 }
  })

  // --- 3. Implante y guías ---
  // Los extremos del hueso quedan donde están; el resto (zona resecada y
  // planos) pasa a implante, clavo y guías, emparejados por altura.
  const resto = hueso.map((p, i) => ({ y: p.y, i })).filter(({ i }) => hueso[i]?.c !== 0)
  const m = resto.length
  const nuevas: P3[] = []
  const nImplante = Math.round(m * 0.64)
  const nClavo = Math.round(m * 0.1)
  const nGuias = m - nImplante - nClavo
  // Implante intercalar: collares macizos en los extremos y, en el medio,
  // la celosía porosa: barras en diagonal sobre la cara que mira a la
  // cámara (atrás se superponían y no se leía). Un poco más ancho que el
  // hueso.
  const nCollar = Math.round(nImplante * 0.3)
  while (nuevas.length < nCollar) {
    const y = Math.random() < 0.5 ? rnd(CORTE_1 + 2, CORTE_1 + 10) : rnd(CORTE_2 - 10, CORTE_2 - 2)
    const a = rnd(0, Math.PI * 2)
    const s = superficie(a, a, radio(y) + 1.6)
    nuevas.push({ x: s.x, y, z: s.z, c: 2 })
  }
  const celda = 13
  const rMedio = radio(150) + 1.6
  while (nuevas.length < nImplante) {
    const y = rnd(CORTE_1 + 10, CORTE_2 - 10)
    // Una barra de cada familia (u + y y u − y constantes cada `celda`)
    const k = Math.round(rnd(-6, 6))
    const u = Math.random() < 0.5 ? k * celda - y : k * celda + y
    const a = (u / rMedio) % (Math.PI * 2)
    if (Math.cos(a) < -0.15) continue
    const s = superficie(a, a, radio(y) + 1.6)
    nuevas.push({ x: s.x, y, z: s.z, c: 2 })
  }
  // Clavo endomedular a lo largo de todo el segmento
  for (let k = 0; k < nClavo; k++) {
    const a = rnd(0, Math.PI * 2)
    nuevas.push({ x: Math.sin(a) * 5, y: rnd(3, ALTO - 3), z: Math.cos(a) * 5, c: 2 })
  }
  // Guías de resección: una media caña que abraza el hueso del lado de
  // adelante, apoyada en el hueso junto a cada plano de corte, con la ranura
  // en el borde y dos vainas para clavijas
  const guias = [
    { y0: CORTE_1 - 23, y1: CORTE_1 - 1 },
    { y0: CORTE_2 + 1, y1: CORTE_2 + 23 },
  ]
  for (let k = 0; k < nGuias; k++) {
    const g = guias[k % 2] ?? guias[0]!
    const tipo = Math.random()
    const ym = (g.y0 + g.y1) / 2
    if (tipo < 0.22) {
      // Vaina: un cilindro corto que sale hacia adelante
      const lado = Math.random() < 0.5 ? -0.42 : 0.42
      const base = radio(ym) + 7
      const largo = rnd(0, 11)
      const a = rnd(0, Math.PI * 2)
      const dir = superficie(lado, lado, 1)
      const px = dir.x * (base + largo) + Math.cos(lado) * Math.cos(a) * 2.6
      const pz = dir.z * (base + largo) - Math.sin(lado) * Math.cos(a) * 2.6
      nuevas.push({ x: px, y: ym + Math.sin(a) * 2.6, z: pz, c: 2 })
      continue
    }
    const a = rnd(-0.78 * Math.PI, 0.78 * Math.PI)
    const y = rnd(g.y0, g.y1)
    const rg = radio(y) + 7
    if (tipo < 0.36) {
      // Bordes de arriba y de abajo de la media caña
      const yb = Math.random() < 0.5 ? g.y0 : g.y1
      const s = superficie(a, a, rnd(radio(yb) + 1, radio(yb) + 7))
      nuevas.push({ x: s.x, y: yb, z: s.z, c: 2 })
      continue
    }
    const s = superficie(a, a, rg)
    nuevas.push({ x: s.x, y, z: s.z, c: 2 })
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

export class PiezaProceso {
  private formas: [P3[], P3[], P3[]]
  private retraso: Float32Array
  private estilos: string[][][][] = []
  private lotes = new Map<string, number[]>()

  constructor(n: number) {
    this.formas = formas(n)
    this.retraso = new Float32Array(n).map(() => Math.random() * 0.3)
    const colores: Rgb[] = [
      leerColor('--color-hueso', '#2260a1'),
      leerColor('--color-resecar', '#c8456b'),
      leerColor('--color-metal', '#586884'),
    ]
    // Estilos precalculados: categoría de origen y de destino, paso de la
    // mezcla (0 a 8) y nivel de profundidad (0 a 3)
    for (let a = 0; a < 3; a++) {
      this.estilos[a] = []
      for (let b = 0; b < 3; b++) {
        this.estilos[a]![b] = []
        for (let q = 0; q <= 8; q++) {
          const ca = colores[a]!
          const cb = colores[b]!
          const t = q / 8
          const rgb = [0, 1, 2].map((k) => Math.round(lerp(ca[k]!, cb[k]!, t)))
          this.estilos[a]![b]![q] = [0.34, 0.52, 0.7, 0.9].map(
            (alfa) => `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alfa})`,
          )
        }
      }
    }
  }

  // q: progreso de la sección (0 a 1); t: segundos, para el vaivén
  dibujar(g: Ctx, w: number, h: number, dpr: number, q: number, t: number, reducido: boolean) {
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
    const sc = Math.min(w / 170, h / (ALTO * ce + 40)) * 0.97
    const cx = w / 2
    const cy = h / 2
    const tam = Math.max(1.3, sc * 0.6)

    for (let i = 0; i < A.length; i++) {
      const a = A[i]!
      const b = B[i]!
      const d = this.retraso[i] ?? 0
      const m = e <= 0 ? 0 : e >= 1 && d < 0.3 ? 1 : smooth(clamp((e - d) / 0.7))
      const x = lerp(a.x, b.x, m)
      const y = lerp(a.y, b.y, m)
      const z = lerp(a.z, b.z, m)
      const X = x * cg + z * sg
      const Z = -x * sg + z * cg
      const sx = cx + X * sc
      const sy = cy + ((y - ALTO / 2) * ce + Z * se) * sc
      // Profundidad: lo de atrás, más tenue y más chico
      const prof = clamp((Z / 50 + 1) / 2)
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
}
