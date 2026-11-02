// Manos de partículas del cierre de contacto (components/home/
// contacto-manos.tsx), con el comportamiento y los tiempos de `drawTouch`
// del borrador de la landing (docs/landing/landing-borrador.html), pero con
// las manos muestreadas de una foto (public/img/manos.webp: dos manos en
// gris sobre negro puro, ya en diagonal) en vez de dibujadas por código.
//
// Muestreo, una sola vez: la imagen se dibuja en un lienzo oculto de 800 px
// de ancho y se leen sus píxeles. Un píxel es mano si su brillo pasa el
// umbral, y la probabilidad de que lleve una partícula crece con el brillo,
// así las zonas iluminadas quedan más densas y se lee el volumen. La mitad
// izquierda es la mano del paciente (celeste) y la derecha la de titanio
// (plateada). Cada mano guarda su eje (del antebrazo a la yema): entra y se
// retira a lo largo de él, sin la rotación de -0,4 rad del borrador (la
// imagen ya viene inclinada).
//
// Con el progreso q del scroll de la sección: las manos arrancan como
// partículas esparcidas hacia los costados del escenario (el centro queda
// despejado para el texto), flotando, y se arman mientras se acercan (0 a
// 0,45; cada partícula converge con su propio retraso y deja de flotar al
// posarse, así la mano se regenera por partes), destello en el punto de
// contacto (0,5), crece una esfera (0,47 a 0,57), las manos se separan y se
// dispersan (0,53 a 0,73), la esfera viaja al borde de la tarjeta (0,64 a
// 0,78) y se apaga (0,8 a 0,88). Por tiempo se mueven las partículas sueltas
// (flotan) y la esfera (gira): mientras se ven, el lienzo se dibuja a cada
// cuadro; después, solo cuando cambia q.
//
// Con puntero fino, las manos reaccionan al mouse en todo momento (sueltas,
// armándose, armadas o separándose), como la pieza de "Cómo trabajamos"
// (proceso.ts): las partículas cerca del puntero se apartan (empuje hacia
// afuera con un desvío propio, más el arrastre del puntero) y vuelven a su
// lugar con un resorte amortiguado. Sin movimiento reducido, no.
//
// Es el único canvas del proyecto con mezcla aditiva ('lighter'): las
// partículas brillan sobre el azul oscuro del escenario.
import { Lotes, clamp, crearLienzo, leerColor, lerp, rgba, smooth, type Ctx, type Rgb } from './lienzo'
import type { Puntero } from './proceso'

export type { Puntero }

export const N_MANO_ESCRITORIO = 6000
export const N_MANO_CELULAR = 2500
const N_ESFERA_ESCRITORIO = 700
const N_ESFERA_CELULAR = 450
// Ancho del lienzo oculto en que se muestrea la imagen
const ANCHO_MUESTRA = 800
// Brillo mínimo (de 255) para que un píxel cuente como mano
const UMBRAL = 40
// Niveles de opacidad y tamaño de las partículas de las manos, por brillo
const NIVELES = 4
// Franja exterior de cada mano (fracción del ancho de la imagen) con la que
// se fija su eje: el centroide de esa franja es el antebrazo
const FRANJA_ENTRADA = 0.12
// Cuánto se esparcen las partículas al arrancar (fracción del ancho del
// lienzo, por la velocidad propia de cada una) y al separarse las manos
const ESPARCIDO_INICIAL = 0.22
const ESPARCIDO_FINAL = 0.14
// Cuánto arranca cada mano corrida hacia atrás por su eje (fracción del
// ancho del lienzo) y cuánto se retira al separarse
const RETIRO_INICIAL = 0.18
const RETIRO_FINAL = 0.08
// Vaivén de las partículas sueltas (px) y su ritmo
const VAIVEN = 18
const RITMO_VAIVEN = 1.3
// Hover, como en proceso.ts pero en fracciones del ancho de la imagen (S):
// radio de alcance, empuje hacia afuera (S/s²), arrastre de la velocidad
// del puntero (1/s) con su tope (px/s), desvío del empuje por partícula
// (rad), variación del alcance por partícula, resorte (1/s²) y
// amortiguación (1/s)
const ALCANCE_HOVER = 0.075
const EMPUJE_HOVER = 16
const ARRASTRE = 5
const VELOCIDAD_MAX = 1600
const DESVIO = 0.7
const ALCANCE_MIN = 0.5
const RESORTE = 26
const AMORTIGUACION = 6.5
// Cerca de los bordes laterales de la imagen el antebrazo se desvanece, para
// que no termine en un corte recto
const DESVANECIDO_LATERAL = 0.1
// Yemas de los dedos y punto de contacto (su punto medio), medidos en la
// imagen, como fracciones del ancho y del alto
const PUNTA_IZQ = [728 / 1536, 498 / 1024] as const
const PUNTA_DER = [782 / 1536, 461 / 1024] as const
const CONTACTO = [0.4915, 0.4683] as const

// Rect de la tarjeta de contacto, relativo al lienzo (en px CSS)
export type Tarjeta = { x: number; y: number; w: number; h: number }

type Mano = {
  n: number
  // Posición en unidades de imagen (ancho = 1), relativa al punto de contacto
  x: Float32Array
  y: Float32Array
  nivel: Uint8Array
  // Dirección y velocidad con que cada partícula se esparce (al arrancar y
  // al separarse las manos), y su retraso
  vx: Float32Array
  vy: Float32Array
  fase: Float32Array
  // Unitario, del antebrazo a la yema
  eje: readonly [number, number]
  estilos: readonly string[]
  tamanos: readonly number[]
  // Hover: desplazamiento y velocidad en pantalla (px, px/s), desvío del
  // empuje (cos y sen) y alcance propio de cada partícula
  dx: Float32Array
  dy: Float32Array
  hvx: Float32Array
  hvy: Float32Array
  desvioX: Float32Array
  desvioY: Float32Array
  alcance: Float32Array
}

type Esfera = {
  n: number
  x: Float32Array
  y: Float32Array
  z: Float32Array
  // Posición en el perímetro de la tarjeta a la que viaja y retraso
  u: Float32Array
  d: Float32Array
}

// Punto a la fracción `u` del perímetro de un rectángulo, en el sentido de
// las agujas del reloj desde la esquina de arriba a la izquierda
function puntoPerimetro(u: number, r: Tarjeta): [number, number] {
  const P = 2 * (r.w + r.h)
  let s = u * P
  if (s < r.w) return [r.x + s, r.y]
  s -= r.w
  if (s < r.h) return [r.x + r.w, r.y + s]
  s -= r.h
  if (s < r.w) return [r.x + r.w - s, r.y + r.h]
  s -= r.w
  return [r.x, r.y + r.h - s]
}

const mezclar = (a: Rgb, b: Rgb, t: number): Rgb => [
  Math.round(lerp(a[0], b[0], t)),
  Math.round(lerp(a[1], b[1], t)),
  Math.round(lerp(a[2], b[2], t)),
]

export class PiezaManos {
  private manos: Mano[] = []
  private esfera: Esfera
  private estilosEsfera: string[]
  private blanco: Rgb
  private celeste: Rgb
  private lotes = new Lotes()
  // Hay partículas apartadas por el hover que todavía vuelven: el
  // componente sigue dibujando hasta que se arman
  desarmada = false

  constructor(imagen: HTMLImageElement, celular: boolean) {
    this.blanco = leerColor('--color-on-primary', '#ffffff')
    this.celeste = leerColor('--color-mano-paciente', '#96afff')
    const plateado = leerColor('--color-mano-titanio', '#d7deec')
    const nMano = celular ? N_MANO_CELULAR : N_MANO_ESCRITORIO

    const w = ANCHO_MUESTRA
    const h = Math.max(1, Math.round((w * imagen.naturalHeight) / imagen.naturalWidth))
    const c = crearLienzo(w, h)
    const g = c.getContext('2d', { willReadFrequently: true })
    if (g) {
      g.drawImage(imagen, 0, 0, w, h)
      const d = g.getImageData(0, 0, w, h).data
      // Peso de cada píxel de mano (brillo por encima del umbral, con los
      // bordes laterales desvanecidos) y la suma por mano
      const peso = new Float32Array(w * h)
      const suma: [number, number] = [0, 0]
      const mitad = w / 2
      for (let p = 0; p < w * h; p++) {
        const b = d[p * 4] ?? 0
        if (b <= UMBRAL) continue
        const x = p % w
        const lateral = clamp(Math.min(x, w - 1 - x) / (DESVANECIDO_LATERAL * w))
        const v = ((b - UMBRAL) / (255 - UMBRAL)) ** 0.85 * lateral
        peso[p] = v
        suma[x < mitad ? 0 : 1] += v
      }
      const puntas = [PUNTA_IZQ, PUNTA_DER] as const
      const colores = [this.celeste, plateado] as const
      this.manos = [0, 1].map((lado) =>
        muestrearMano(peso, w, h, lado, nMano, suma[lado] ?? 1, puntas[lado] ?? PUNTA_IZQ, colores[lado] ?? plateado),
      )
    }

    // Esfera de Fibonacci
    const nEsfera = celular ? N_ESFERA_CELULAR : N_ESFERA_ESCRITORIO
    this.esfera = {
      n: nEsfera,
      x: new Float32Array(nEsfera),
      y: new Float32Array(nEsfera),
      z: new Float32Array(nEsfera),
      u: new Float32Array(nEsfera),
      d: new Float32Array(nEsfera),
    }
    for (let i = 0; i < nEsfera; i++) {
      const y = 1 - (2 * (i + 0.5)) / nEsfera
      const r = Math.sqrt(1 - y * y)
      const th = i * 2.39996
      this.esfera.x[i] = r * Math.cos(th)
      this.esfera.y[i] = y
      this.esfera.z[i] = r * Math.sin(th)
      this.esfera.u[i] = Math.random()
      this.esfera.d[i] = Math.random() * 0.3
    }
    const colorEsfera = mezclar(this.celeste, this.blanco, 0.5)
    this.estilosEsfera = Array.from({ length: 6 }, (_, i) => rgba(colorEsfera, (i + 1) / 6))
  }

  // Mientras la esfera se ve, gira por tiempo y hace falta seguir dibujando
  static animaPorTiempo(q: number) {
    return q < 0.88
  }

  // Encuadre de la imagen en el lienzo: ancho de la imagen en px (S) y punto
  // de contacto (cx, cy). En escritorio las manos ocupan el 85 % del ancho
  // (pedido del usuario: grandes; la intro ya se fue cuando llegan); en el
  // celular, más que la pantalla: los antebrazos se cortan en los bordes y el
  // contacto va arriba del centro para dejarle lugar a la intro.
  static encuadre(w: number, h: number, celular: boolean) {
    const S = celular ? 1.5 * w : Math.min(0.85 * w, 1.35 * h)
    return { S, cx: w / 2, cy: (celular ? 0.45 : 0.5) * h }
  }

  // dt: segundos desde el cuadro anterior (para el hover); puntero: sobre el
  // lienzo, en px CSS, o null
  dibujar(
    g: Ctx,
    w: number,
    h: number,
    dpr: number,
    q: number,
    t: number,
    celular: boolean,
    tarjeta: Tarjeta | null,
    dt = 0,
    puntero: Puntero | null = null,
  ) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.clearRect(0, 0, w, h)
    const { S, cx, cy } = PiezaManos.encuadre(w, h, celular)
    const lotes = this.lotes
    g.globalCompositeOperation = 'lighter'

    // Las manos se arman desde partículas esparcidas mientras se acercan por
    // su eje; después se retiran y se vuelven a dispersar
    const llegada = clamp(q / 0.45)
    const app = smooth(llegada)
    const open = smooth(clamp((q - 0.53) / 0.2))
    const alfaMano = 1 - open
    // Hover mientras las manos se ven: con el puntero encima o mientras las
    // partículas apartadas vuelven
    const visibles = alfaMano > 0.01
    if (!visibles && this.desarmada) this.armar()
    const hover = visibles && dt > 0 && (puntero !== null || this.desarmada)
    const alcance = ALCANCE_HOVER * S
    const empuje = EMPUJE_HOVER * S
    let pvx = 0
    let pvy = 0
    if (puntero) {
      const v = Math.hypot(puntero.vx, puntero.vy)
      const tope = v > VELOCIDAD_MAX ? VELOCIDAD_MAX / v : 1
      pvx = puntero.vx * tope * ARRASTRE
      pvy = puntero.vy * tope * ARRASTRE
    }
    const amort = Math.exp(-AMORTIGUACION * dt)
    let movimiento = 0
    if (alfaMano > 0.01) {
      const desp = (lerp(RETIRO_INICIAL * w, 0, app) + open * RETIRO_FINAL * w) / S
      const inicial = ESPARCIDO_INICIAL * w
      const final = ESPARCIDO_FINAL * w
      for (const m of this.manos) {
        const ox = -m.eje[0] * desp
        const oy = -m.eje[1] * desp
        for (let i = 0; i < m.n; i++) {
          const fase = m.fase[i] ?? 0
          // Cuánto le falta a esta partícula para posarse (con su retraso)
          const suelta = llegada < 1 ? 1 - smooth(clamp((llegada - 0.35 * fase) / 0.65)) : 0
          const oi = open > 0 ? smooth(clamp((open - 0.25 * fase) / 0.75)) : 0
          const esparcido = suelta * inicial + oi * final
          let X = cx + ((m.x[i] ?? 0) + ox) * S + (m.vx[i] ?? 0) * esparcido
          let Y = cy + ((m.y[i] ?? 0) + oy) * S + (m.vy[i] ?? 0) * esparcido
          // Las sueltas flotan; el vaivén se apaga al posarse
          if (suelta > 0) {
            const ph = fase * 6.2832
            const v = suelta * VAIVEN
            X += Math.sin(t * RITMO_VAIVEN + ph) * v
            Y += Math.cos(t * RITMO_VAIVEN * 0.8 + ph * 1.7) * v
          }
          if (hover) {
            let hx = m.dx[i] ?? 0
            let hy = m.dy[i] ?? 0
            let vx = m.hvx[i] ?? 0
            let vy = m.hvy[i] ?? 0
            if (puntero) {
              const px = X + hx - puntero.x
              const py = Y + hy - puntero.y
              const d2 = px * px + py * py
              const ai = alcance * (m.alcance[i] ?? 1)
              if (d2 < ai * ai) {
                const dist = Math.sqrt(d2) || 1
                const f = (1 - dist / ai) ** 2 * dt
                // Hacia afuera, girado por el desvío de la partícula
                const ux = px / dist
                const uy = py / dist
                const cd = m.desvioX[i] ?? 1
                const sd = m.desvioY[i] ?? 0
                vx += ((ux * cd - uy * sd) * empuje + pvx) * f
                vy += ((ux * sd + uy * cd) * empuje + pvy) * f
              }
            }
            // Resorte de vuelta a su lugar, con amortiguación
            vx = (vx - hx * RESORTE * dt) * amort
            vy = (vy - hy * RESORTE * dt) * amort
            hx += vx * dt
            hy += vy * dt
            m.dx[i] = hx
            m.dy[i] = hy
            m.hvx[i] = vx
            m.hvy[i] = vy
            movimiento = Math.max(movimiento, Math.abs(hx) + Math.abs(hy) + (Math.abs(vx) + Math.abs(vy)) * 0.05)
            X += hx
            Y += hy
          }
          if (X < -2 || Y < -2 || X > w + 2 || Y > h + 2) continue
          const nivel = m.nivel[i] ?? 0
          lotes.agregar(m.estilos[nivel] ?? '', X, Y, m.tamanos[nivel] ?? 1)
        }
        g.globalAlpha = alfaMano
        lotes.dibujar(g)
      }
      g.globalAlpha = 1
    }
    if (hover) {
      // Ya volvieron todas: se deja de calcular hasta el próximo puntero
      this.desarmada = puntero !== null || movimiento > 0.05
      if (!this.desarmada) this.armar()
    }

    // Destello en el punto de contacto
    const fq = Math.exp(-(((q - 0.5) / 0.03) ** 2))
    if (fq > 0.01) {
      const rad = (0.03 + 0.26 * fq) * Math.min(w, h)
      const fg = g.createRadialGradient(cx, cy, 0, cx, cy, rad)
      fg.addColorStop(0, rgba(this.blanco, 0.95 * fq))
      fg.addColorStop(0.25, rgba(this.celeste, 0.5 * fq))
      fg.addColorStop(1, rgba(this.celeste, 0))
      g.fillStyle = fg
      g.fillRect(cx - rad, cy - rad, rad * 2, rad * 2)
    }

    // La esfera: crece, gira y viaja al borde de la tarjeta
    const grow = smooth(clamp((q - 0.47) / 0.1))
    const fadeIn = smooth(clamp((q - 0.47) / 0.06))
    const fadeOut = 1 - smooth(clamp((q - 0.8) / 0.08))
    const sa = fadeIn * fadeOut
    if (sa > 0.01) {
      const e = this.esfera
      const sr = grow * Math.min(w, h) * 0.11
      const rot = t * 0.6
      const cr = Math.cos(rot)
      const sn = Math.sin(rot)
      const m = smooth(clamp((q - 0.64) / 0.14))
      for (let i = 0; i < e.n; i++) {
        const x = e.x[i] ?? 0
        const y = e.y[i] ?? 0
        const z = e.z[i] ?? 0
        const X = cx + (x * cr + z * sn) * sr
        const Y = cy + y * sr
        const zz = -x * sn + z * cr
        const mm = smooth(clamp((m - (e.d[i] ?? 0)) / 0.7))
        const [tx, ty] = tarjeta ? puntoPerimetro(e.u[i] ?? 0, tarjeta) : [cx, cy]
        const b = lerp(0.35 + (0.65 * (zz + 1)) / 2, 0.9, mm)
        const nivel = Math.min(5, Math.floor(b * 6))
        lotes.agregar(this.estilosEsfera[nivel] ?? '', lerp(X, tx, mm), lerp(Y, ty, mm), 1.8)
      }
      g.globalAlpha = sa
      lotes.dibujar(g)
      g.globalAlpha = 1
    }

    g.globalCompositeOperation = 'source-over'
  }

  // Todas las partículas en su lugar, quietas
  private armar() {
    for (const m of this.manos) {
      m.dx.fill(0)
      m.dy.fill(0)
      m.hvx.fill(0)
      m.hvy.fill(0)
    }
    this.desarmada = false
  }
}

// Partículas de una mano (lado 0: izquierda, del paciente; 1: derecha, de
// titanio): aceptación con probabilidad proporcional al peso del píxel, para
// que la cantidad esperada sea `n`.
function muestrearMano(
  peso: Float32Array,
  w: number,
  h: number,
  lado: number,
  n: number,
  suma: number,
  punta: readonly [number, number],
  color: Rgb,
): Mano {
  const x0 = lado === 0 ? 0 : w / 2
  const x1 = lado === 0 ? w / 2 : w
  const k = suma > 0 ? n / suma : 0
  const xs: number[] = []
  const ys: number[] = []
  const ps: number[] = []
  // Centroide de la franja exterior (el antebrazo)
  let ex = 0
  let ey = 0
  let en = 0
  const franja = FRANJA_ENTRADA * w
  for (let y = 0; y < h; y++) {
    for (let x = x0; x < x1; x++) {
      const p = peso[y * w + x] ?? 0
      if (p <= 0 || Math.random() >= p * k) continue
      const px = x + Math.random() - 0.5
      const py = y + Math.random() - 0.5
      xs.push(px)
      ys.push(py)
      ps.push(p)
      if (lado === 0 ? x < franja : x > w - franja) {
        ex += px
        ey += py
        en++
      }
    }
  }
  const puntaX = punta[0] * w
  const puntaY = punta[1] * h
  let eje: [number, number] = [lado === 0 ? 1 : -1, 0]
  if (en > 0) {
    const dx = puntaX - ex / en
    const dy = puntaY - ey / en
    const largo = Math.hypot(dx, dy) || 1
    eje = [dx / largo, dy / largo]
  }
  const cantidad = xs.length
  const mano: Mano = {
    n: cantidad,
    x: new Float32Array(cantidad),
    y: new Float32Array(cantidad),
    nivel: new Uint8Array(cantidad),
    vx: new Float32Array(cantidad),
    vy: new Float32Array(cantidad),
    fase: new Float32Array(cantidad),
    eje,
    estilos: Array.from({ length: NIVELES }, (_, i) => rgba(color, 0.18 + 0.2 * i)),
    tamanos: Array.from({ length: NIVELES }, (_, i) => 1.2 + 0.2 * i),
    dx: new Float32Array(cantidad),
    dy: new Float32Array(cantidad),
    hvx: new Float32Array(cantidad),
    hvy: new Float32Array(cantidad),
    desvioX: new Float32Array(cantidad),
    desvioY: new Float32Array(cantidad),
    alcance: new Float32Array(cantidad),
  }
  for (let i = 0; i < cantidad; i++) {
    mano.x[i] = ((xs[i] ?? 0) - CONTACTO[0] * w) / w
    mano.y[i] = ((ys[i] ?? 0) - CONTACTO[1] * h) / w
    mano.nivel[i] = Math.min(NIVELES - 1, Math.floor((ps[i] ?? 0) * NIVELES))
    // Hacia afuera (cada mano a su costado), para que el centro del
    // escenario quede más limpio mientras están sueltas
    const a = Math.random() * Math.PI * 2
    const s = 0.4 + Math.random()
    mano.vx[i] = (lado === 0 ? -1 : 1) * (0.2 + Math.abs(Math.cos(a))) * s
    mano.vy[i] = Math.sin(a) * s * 0.8
    mano.fase[i] = Math.random()
    const desvio = (Math.random() * 2 - 1) * DESVIO
    mano.desvioX[i] = Math.cos(desvio)
    mano.desvioY[i] = Math.sin(desvio)
    mano.alcance[i] = ALCANCE_MIN + Math.random() * (1 - ALCANCE_MIN)
  }
  return mano
}
