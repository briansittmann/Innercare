// La pieza de la pantalla de carga (components/pantalla-carga.tsx): la
// endoprótesis de fémur en partículas, que se imprime con el progreso de la
// carga. Mismo método que las animaciones de Fabricación (fabricacion.ts):
// la silueta sale del alfa del render de la pieza real
// (public/img/fabricacion/femur.webp) y las partículas, de muestrear esa
// máscara. La animación no sabe qué forma tiene la pieza.
//
// Cada partícula tiene un orden de abajo hacia arriba (las capas de la
// impresión 3D, con algo de ruido). Las que quedan por debajo del progreso
// están posadas en su lugar, sólidas; las de arriba son material suelto que
// flota alrededor de la pieza y, al llegarles el turno, vuela a su sitio. Al
// 100 % un reflejo cruza la pieza; en la salida las partículas se despegan
// de arriba hacia abajo y se dispersan.

import {
  Lotes,
  clamp,
  lerp,
  limites,
  leerColor,
  mascaraDeImagen,
  muestrear,
  rgba,
  smooth,
  type Ctx,
  type Rgb,
} from './lienzo'

// Unidades: la imagen, en 4:3, se dibuja en una caja de 300 × 225 y se escala
// al canvas (como en fabricacion.ts)
const U = 300
const ALTO_U = 225
const ESCALA_MASCARA = 2

// Paso del muestreo (unidades); el tamaño de cada partícula va con el paso,
// así la pieza posada se lee llena a cualquier tamaño de pantalla
const PASO_ESCRITORIO = 1.3
const PASO_CELULAR = 1.8
const TAMANO = 0.8
// Aire alrededor de la pieza en el encuadre (unidades)
const MARGEN = 16

// Material suelto: hasta dónde se esparce (unidades) y cuánto flota
const ESPARCIDO = 70
const VAIVEN = 4
const RITMO_VAIVEN = 1.1
// Lo que tarda una partícula en volar a su lugar (s) y en despegarse (s)
const DURACION_POSADO = 0.55
const DURACION_DESPEGUE = 0.5

type Particula = {
  x: number
  y: number
  borde: boolean
  // Turno de la partícula (0 abajo, 1 arriba)
  orden: number
  // Dónde flota mientras está suelta
  sx: number
  sy: number
  fase: number
  // Hacia dónde se va en la salida
  dx: number
  dy: number
  // Cuándo empezó a posarse (s) y desde dónde; -1: suelta
  desde: number
  dx0: number
  dy0: number
}

export class PiezaCarga {
  private particulas: Particula[] = []
  private caja: { x0: number; y0: number; x1: number; y1: number }
  private paso: number
  private lotes = new Lotes()
  private colores: { hueso: Rgb; metal: Rgb; primario: Rgb; linea: Rgb }

  constructor(imagen: HTMLImageElement, celular: boolean) {
    const m = mascaraDeImagen(imagen, U, ALTO_U, ESCALA_MASCARA)
    const b = limites(m, ESCALA_MASCARA)
    this.caja = b
    this.colores = {
      hueso: leerColor('--color-hueso', '#2260a1'),
      metal: leerColor('--color-metal', '#586884'),
      primario: leerColor('--color-primary', '#003c6f'),
      linea: leerColor('--color-outline', '#7b8794'),
    }
    const alto = Math.max(1, b.y1 - b.y0)
    const cx = (b.x0 + b.x1) / 2
    const cy = (b.y0 + b.y1) / 2
    this.paso = celular ? PASO_CELULAR : PASO_ESCRITORIO
    this.particulas = muestrear(m, this.paso, ESCALA_MASCARA).map((p) => {
      // Esparcido hacia afuera de la pieza, más hacia arriba (de donde "cae"
      // el material) y con algo de azar
      const ang = Math.atan2(p.y - cy, p.x - cx) + (Math.random() - 0.5) * 1.2
      const r = ESPARCIDO * (0.45 + Math.random() * 0.55)
      const dir = Math.random() * Math.PI * 2
      return {
        x: p.x,
        y: p.y,
        borde: p.borde,
        orden: clamp((b.y1 - p.y) / alto + (Math.random() - 0.5) * 0.08),
        sx: p.x + Math.cos(ang) * r,
        sy: p.y + Math.sin(ang) * r - 25 * Math.random(),
        fase: Math.random() * Math.PI * 2,
        dx: Math.cos(dir) * (20 + Math.random() * 50),
        dy: -30 - Math.random() * 60,
        desde: -1,
        dx0: 0,
        dy0: 0,
      }
    })
  }

  // Encuadre: la pieza (su caja, con margen) llena el canvas, centrada; el
  // aire del render alrededor no cuenta
  private encuadre(w: number, h: number) {
    const { x0, y0, x1, y1 } = this.caja
    const bw = x1 - x0 + MARGEN * 2
    const bh = y1 - y0 + MARGEN * 2
    const sc = Math.min(w / bw, h / bh)
    return { sc, ox: (w - bw * sc) / 2 - (x0 - MARGEN) * sc, oy: (h - bh * sc) / 2 - (y0 - MARGEN) * sc }
  }

  // Dibuja el cuadro: `t` en segundos, `progreso` (0 a 1) lo que se imprimió,
  // `salida` (0 a 1) el despegue final, `quieto` sin movimiento propio
  // (movimiento reducido: todo posado hasta el progreso, sin flotar)
  dibujar(g: Ctx, w: number, h: number, dpr: number, t: number, progreso: number, salida: number, quieto: boolean) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.clearRect(0, 0, w, h)
    const { sc, ox, oy } = this.encuadre(w, h)
    const { hueso, primario } = this.colores
    const tam = Math.max(1.4, sc * this.paso * TAMANO)
    const lotes = this.lotes
    const { y0, y1 } = this.caja
    // La capa que se está imprimiendo
    const capa = lerp(y1, y0, progreso)
    // Reflejo que cruza la pieza al completarse (de izquierda a derecha)
    const reflejo = salida > 0 ? clamp(salida / 0.45) : -1

    for (const p of this.particulas) {
      const turno = progreso >= p.orden
      // Despegue: de arriba hacia abajo, cada una en su momento
      let k = 0
      if (salida > 0) {
        const inicio = 0.25 + (1 - p.orden) * 0.4
        k = quieto ? clamp(salida * 2) : smooth(clamp((salida - inicio) / (DURACION_DESPEGUE * 0.6)))
        if (k >= 1) continue
      }
      let x: number
      let y: number
      let a: number
      let s: number
      if (turno) {
        if (p.desde < 0) {
          // Empieza a volar a su lugar desde donde flotaba
          p.desde = quieto ? -2 : t
          p.dx0 = p.sx + Math.sin(t * RITMO_VAIVEN + p.fase) * VAIVEN - p.x
          p.dy0 = p.sy + Math.cos(t * RITMO_VAIVEN * 0.8 + p.fase * 1.7) * VAIVEN - p.y
        }
        const f = p.desde === -2 ? 1 : smooth(clamp((t - p.desde) / DURACION_POSADO))
        x = p.x + p.dx0 * (1 - f)
        y = p.y + p.dy0 * (1 - f)
        // Recién posada brilla un poco más; en el borde, un punto más grande
        const brillo = (1 - f) * 0.4
        a = 0.86 + brillo
        s = (p.borde ? tam * 1.18 : tam) * (1 + brillo * 0.5)
        // El reflejo de la salida
        if (reflejo >= 0) {
          const rx = lerp(this.caja.x0 - 30, this.caja.x1 + 30, reflejo)
          const cerca = clamp(1 - Math.abs(p.x - rx + (p.y - y0) * 0.35) / 22)
          a = Math.min(1.2, a + cerca * 0.5)
          s *= 1 + cerca * 0.4
        }
      } else {
        if (quieto) continue
        x = p.sx + Math.sin(t * RITMO_VAIVEN + p.fase) * VAIVEN
        y = p.sy + Math.cos(t * RITMO_VAIVEN * 0.8 + p.fase * 1.7) * VAIVEN
        // Las próximas en el turno se acercan y se encienden
        const prox = clamp(1 - (p.orden - progreso) / 0.18)
        x = lerp(x, p.x, prox * 0.35)
        y = lerp(y, p.y, prox * 0.35)
        a = 0.22 + prox * 0.3
        s = tam * (0.8 + prox * 0.2)
      }
      if (k > 0) {
        x += p.dx * k * k
        y += p.dy * k * k
        a *= 1 - k
      }
      const color = turno ? hueso : primario
      lotes.agregar(rgba(color, Math.round(Math.min(1, a) * 20) / 20), ox + x * sc, oy + y * sc, s)
    }
    lotes.dibujar(g)

    // La línea de la capa, mientras se imprime
    if (progreso > 0 && progreso < 1 && salida === 0) this.capa(g, sc, ox, oy, capa, quieto ? 0 : t)
  }

  private capa(g: Ctx, sc: number, ox: number, oy: number, capa: number, t: number) {
    const { hueso } = this.colores
    const { x0, x1 } = this.caja
    const y = oy + capa * sc
    g.lineWidth = 1
    g.strokeStyle = rgba(hueso, 0.55)
    g.beginPath()
    g.moveTo(ox + (x0 - 14) * sc, y)
    g.lineTo(ox + (x1 + 14) * sc, y)
    g.stroke()
    // El punto que funde la capa, yendo y viniendo
    const x = ox + lerp(x0, x1, Math.sin(t * 2.6) * 0.5 + 0.5) * sc
    const r = 7 * sc
    const halo = g.createRadialGradient(x, y, 0, x, y, r)
    halo.addColorStop(0, rgba(hueso, 0.35))
    halo.addColorStop(1, rgba(hueso, 0))
    g.fillStyle = halo
    g.beginPath()
    g.arc(x, y, r, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = rgba(hueso, 1)
    g.beginPath()
    g.arc(x, y, 2.4, 0, Math.PI * 2)
    g.fill()
  }
}
