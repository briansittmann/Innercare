// Animaciones de "Mecanizado e impresión 3D" (#fabricacion), réplica de las
// del borrador de la landing (docs/landing/landing-borrador.html, drawFab):
// - Mecanizado CNC: un bloque de partículas; la fresa lo barre de arriba
//   abajo, el material sobrante se desprende y queda la pieza (la
//   endoprótesis de fémur, el sistema modular que se mecaniza). Al final
//   aparece la pieza en metal.
// - Impresión 3D: la pieza (la reconstrucción acetabular en titanio
//   trabecular) crece capa por capa desde abajo, y al final aparece en metal.
// Mismos tiempos y la misma lógica que el borrador; la ejecución suma
// detalle: formas con las partes reales de cada pieza (cono morse, alas para
// sutura, suplemento y vástago estriado; copa con capa porosa, reborde y
// ala con tornillos), el doble de partículas, la fresa y el láser que
// recorren la capa, y un reflejo que cruza el metal cuando la pieza termina.

import {
  Lotes,
  circulo,
  clamp,
  crearLienzo,
  lerp,
  limites,
  lectorMascara,
  leerColor,
  mascara,
  muestrear,
  recortar,
  rectRedondo,
  rgba,
  taper,
  type Ctx,
  type Rgb,
} from './lienzo'

export type ModoFabricacion = 'sustractiva' | 'aditiva'

// Duración total (borrador: 3,8 s). La herramienta trabaja hasta el 80 % y
// la pieza sólida aparece desde el 84 %.
export const DURACION_FAB = 3800

// Unidades: las formas se dibujan en una caja de 300 × 300, como en el
// borrador, y se escalan al canvas.
const U = 300
const ESCALA_MASCARA = 2

// Titanio: tres tonos fríos para el degradé del metal (el del borrador,
// --metal-0/1/2), y una sombra más honda para los poros.
const METAL_CLARO = '#f6f8fc'
const METAL_MEDIO = '#aeb9cb'
const METAL_OSCURO = '#5c6b86'
const METAL_HONDO = '#3e4a60'

// --- Endoprótesis modular de fémur (CNC) ----------------------------------
// Cabeza sobre el cono morse, cuerpo con las dos alas para sutura (afuera
// arriba, adentro abajo), la unión con el suplemento y el vástago estriado.
const FEMUR = {
  cabeza: { x: 199, y: 46, r: 33 },
  cuello: [184, 67, 9.5, 160, 99, 15] as const,
  cuerpo: { x: 122, y: 90, w: 60, h: 60, r: 12 },
  alaExterna: { x: 103, y: 97, w: 23, h: 40, r: 7 },
  alaInterna: { x: 178, y: 115, w: 23, h: 40, r: 7 },
  suplemento: { x: 126, y: 153, w: 52, h: 42, r: 6 },
  vastago: [152, 197, 15.5, 152, 291, 6] as const,
  agujeros: [
    [114.5, 109],
    [114.5, 125],
    [189.5, 127],
    [189.5, 143],
  ] as const,
  estrias: [
    [145.5, 214, 148.4, 280],
    [152, 212, 152, 283],
    [158.5, 214, 155.6, 280],
  ] as const,
}

function siluetaFemur(g: Ctx) {
  const { cabeza, cuerpo, alaExterna, alaInterna, suplemento } = FEMUR
  circulo(g, cabeza.x, cabeza.y, cabeza.r)
  taper(g, ...FEMUR.cuello)
  rectRedondo(g, cuerpo.x, cuerpo.y, cuerpo.w, cuerpo.h, cuerpo.r)
  rectRedondo(g, alaExterna.x, alaExterna.y, alaExterna.w, alaExterna.h, alaExterna.r)
  rectRedondo(g, alaInterna.x, alaInterna.y, alaInterna.w, alaInterna.h, alaInterna.r)
  rectRedondo(g, suplemento.x, suplemento.y, suplemento.w, suplemento.h, suplemento.r)
  taper(g, ...FEMUR.vastago)
  recortar(g, (g) => {
    for (const [x, y] of FEMUR.agujeros) circulo(g, x, y, 3.6)
    // Unión del cuerpo con el suplemento
    g.fillRect(118, 150.2, 68, 2.4)
    g.lineWidth = 1.6
    for (const [x1, y1, x2, y2] of FEMUR.estrias) {
      g.beginPath()
      g.moveTo(x1, y1)
      g.lineTo(x2, y2)
      g.stroke()
    }
  })
}

// Degradé de cilindro: oscuro en los bordes, claro un poco a la izquierda del
// centro (la luz viene de arriba a la izquierda)
function cilindro(g: Ctx, x0: number, x1: number) {
  const d = g.createLinearGradient(x0, 0, x1, 0)
  d.addColorStop(0, METAL_OSCURO)
  d.addColorStop(0.22, METAL_MEDIO)
  d.addColorStop(0.4, METAL_CLARO)
  d.addColorStop(0.62, METAL_MEDIO)
  d.addColorStop(1, METAL_OSCURO)
  return d
}

function metalFemur(g: Ctx) {
  const { cabeza, cuerpo, alaExterna, alaInterna, suplemento } = FEMUR
  // Vástago
  g.fillStyle = cilindro(g, 136, 168)
  taper(g, ...FEMUR.vastago)
  // Suplemento y cuerpo
  g.fillStyle = cilindro(g, suplemento.x, suplemento.x + suplemento.w)
  rectRedondo(g, suplemento.x, suplemento.y, suplemento.w, suplemento.h, suplemento.r)
  g.fillStyle = cilindro(g, alaExterna.x, alaExterna.x + alaExterna.w)
  rectRedondo(g, alaExterna.x, alaExterna.y, alaExterna.w, alaExterna.h, alaExterna.r)
  g.fillStyle = cilindro(g, alaInterna.x, alaInterna.x + alaInterna.w)
  rectRedondo(g, alaInterna.x, alaInterna.y, alaInterna.w, alaInterna.h, alaInterna.r)
  g.fillStyle = cilindro(g, cuerpo.x, cuerpo.x + cuerpo.w)
  rectRedondo(g, cuerpo.x, cuerpo.y, cuerpo.w, cuerpo.h, cuerpo.r)
  // Cono morse: degradé de través
  const [nx1, ny1, , nx2, ny2] = FEMUR.cuello
  const normal = Math.atan2(ny2 - ny1, nx2 - nx1) + Math.PI / 2
  const mx = (nx1 + nx2) / 2
  const my = (ny1 + ny2) / 2
  const cuello = g.createLinearGradient(
    mx - Math.cos(normal) * 14,
    my - Math.sin(normal) * 14,
    mx + Math.cos(normal) * 14,
    my + Math.sin(normal) * 14,
  )
  cuello.addColorStop(0, METAL_OSCURO)
  cuello.addColorStop(0.45, METAL_CLARO)
  cuello.addColorStop(1, METAL_OSCURO)
  g.fillStyle = cuello
  taper(g, ...FEMUR.cuello)
  // Cabeza: esfera pulida, con el brillo arriba a la izquierda
  const esfera = g.createRadialGradient(
    cabeza.x - 12,
    cabeza.y - 13,
    1,
    cabeza.x,
    cabeza.y,
    cabeza.r,
  )
  esfera.addColorStop(0, '#ffffff')
  esfera.addColorStop(0.25, METAL_CLARO)
  esfera.addColorStop(0.7, METAL_MEDIO)
  esfera.addColorStop(1, METAL_OSCURO)
  g.fillStyle = esfera
  circulo(g, cabeza.x, cabeza.y, cabeza.r)

  // Agujeros de sutura y unión: recortados, con el borde de abajo iluminado
  recortar(g, (g) => {
    for (const [x, y] of FEMUR.agujeros) circulo(g, x, y, 3.6)
    g.fillRect(118, 150.2, 68, 2.4)
  })
  g.lineWidth = 0.9
  g.strokeStyle = 'rgba(255,255,255,0.7)'
  for (const [x, y] of FEMUR.agujeros) {
    g.beginPath()
    g.arc(x, y, 3.6, 0.15 * Math.PI, 0.85 * Math.PI)
    g.stroke()
  }
  // Estrías del vástago: un surco oscuro y su borde de luz
  for (const [x1, y1, x2, y2] of FEMUR.estrias) {
    g.lineWidth = 1.5
    g.strokeStyle = 'rgba(62,74,96,0.55)'
    g.beginPath()
    g.moveTo(x1, y1)
    g.lineTo(x2, y2)
    g.stroke()
    g.lineWidth = 0.7
    g.strokeStyle = 'rgba(255,255,255,0.55)'
    g.beginPath()
    g.moveTo(x1 + 1.2, y1)
    g.lineTo(x2 + 1.1, y2)
    g.stroke()
  }
  // Bisel de luz en el borde de arriba del cuerpo y del suplemento
  g.lineWidth = 0.8
  g.strokeStyle = 'rgba(255,255,255,0.6)'
  g.beginPath()
  g.moveTo(cuerpo.x + 8, cuerpo.y + 1.2)
  g.lineTo(cuerpo.x + cuerpo.w - 8, cuerpo.y + 1.2)
  g.moveTo(suplemento.x + 5, suplemento.y + 1.2)
  g.lineTo(suplemento.x + suplemento.w - 5, suplemento.y + 1.2)
  g.stroke()
  // Tornillo de cierre del cuerpo (hexágono)
  hexagono(g, 152, 104, 4.2, METAL_HONDO, 0.55)
}

function hexagono(g: Ctx, x: number, y: number, r: number, color: string, alfa: number) {
  g.save()
  g.globalAlpha = alfa
  g.fillStyle = color
  g.beginPath()
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + Math.PI / 6
    const px = x + Math.cos(a) * r
    const py = y + Math.sin(a) * r
    if (i === 0) g.moveTo(px, py)
    else g.lineTo(px, py)
  }
  g.closePath()
  g.fill()
  g.restore()
}

// --- Reconstrucción acetabular trabecular (impresión 3D) ------------------
// Copa en media esfera con la capa externa trabecular (poros irregulares,
// de tamaños distintos, que llegan a romper el borde), cara interna maciza
// con agujeros para tornillos, reborde y el ala superior: una lengüeta
// curva que sale de la copa hacia el ilíaco, con tres agujeros en fila.
const COPA = { x: 150, y: 196, r: 110, interior: 80 }

// Ala: la base apoya en la copa y la punta es redonda
const ALA = {
  base1: [69.8, 120.7] as const,
  base2: [139.6, 86.5] as const,
  punta: [92, 36] as const,
  radio: 21,
  control1: [71, 80] as const,
  control2: [121, 66] as const,
}
const AGUJEROS_ALA = [
  [100.9, 83.3, 5.2],
  [96.6, 60.5, 5.2],
  [92, 36, 5],
] as const

function trazarAla(g: Ctx) {
  const { base1, base2, punta, radio, control1, control2 } = ALA
  g.beginPath()
  g.moveTo(base1[0], base1[1])
  g.quadraticCurveTo(control1[0], control1[1], punta[0] - radio, punta[1])
  g.arc(punta[0], punta[1], radio, Math.PI, Math.PI * 2)
  g.quadraticCurveTo(control2[0], control2[1], base2[0], base2[1])
  g.closePath()
}

// Poros trabeculares: posiciones, tamaños y formas al azar pero con semilla
// fija, para que la máscara de las partículas y la pieza en metal coincidan
function semilla(n: number) {
  let a = n >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const POROS: readonly (readonly (readonly [number, number])[])[] = (() => {
  const azar = semilla(29)
  const centros: { x: number; y: number; r: number }[] = []
  for (let intento = 0; intento < 4000 && centros.length < 110; intento++) {
    const a = (1.03 + azar() * 0.94) * Math.PI
    const rr = 1.5 + azar() ** 1.6 * 2.6
    const radio = 88 + azar() * 21.5
    const x = COPA.x + Math.cos(a) * radio
    const y = COPA.y + Math.sin(a) * radio
    if (y > COPA.y - 6) continue
    if (centros.some((c) => Math.hypot(c.x - x, c.y - y) < c.r + rr + 1.7)) continue
    centros.push({ x, y, r: rr })
  }
  // Cada poro, un polígono de 5 a 7 lados con los vértices corridos
  return centros.map(({ x, y, r }) => {
    const lados = 5 + Math.floor(azar() * 3)
    const giro = azar() * Math.PI * 2
    return Array.from({ length: lados }, (_, i) => {
      const a = giro + (i / lados) * Math.PI * 2
      const rv = r * (0.72 + azar() * 0.5)
      return [x + Math.cos(a) * rv, y + Math.sin(a) * rv] as const
    })
  })
})()

function trazarPoros(g: Ctx) {
  g.beginPath()
  for (const poro of POROS) {
    poro.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)))
    g.closePath()
  }
}

const TORNILLOS_COPA = [1.25, 1.5, 1.75] as const

function siluetaAcetabulo(g: Ctx) {
  trazarAla(g)
  g.fill()
  g.beginPath()
  g.arc(COPA.x, COPA.y, COPA.r, Math.PI, Math.PI * 2)
  g.closePath()
  g.fill()
  rectRedondo(g, 32, 189, 236, 14, 5)
  recortar(g, (g) => {
    g.beginPath()
    g.arc(COPA.x, COPA.y, COPA.interior, Math.PI, Math.PI * 2)
    g.closePath()
    g.fill()
    for (const [x, y, r] of AGUJEROS_ALA) circulo(g, x, y, r)
    trazarPoros(g)
    g.fill()
  })
}

function metalAcetabulo(g: Ctx) {
  // Ala, por detrás de la copa: degradé de través (es una lámina curva) y
  // un filete de luz en el canto
  const [px, py] = ALA.punta
  const ala = g.createLinearGradient(px - 30, py + 20, px + 34, py + 4)
  ala.addColorStop(0, METAL_OSCURO)
  ala.addColorStop(0.42, METAL_CLARO)
  ala.addColorStop(1, METAL_MEDIO)
  g.fillStyle = ala
  trazarAla(g)
  g.fill()
  g.lineWidth = 0.9
  g.strokeStyle = 'rgba(62,74,96,0.45)'
  g.stroke()
  // Copa: esfera mate (titanio impreso), luz arriba a la izquierda
  const copa = g.createRadialGradient(COPA.x - 40, COPA.y - 80, 4, COPA.x, COPA.y, COPA.r * 1.05)
  copa.addColorStop(0, METAL_CLARO)
  copa.addColorStop(0.55, METAL_MEDIO)
  copa.addColorStop(1, METAL_OSCURO)
  g.fillStyle = copa
  g.beginPath()
  g.arc(COPA.x, COPA.y, COPA.r, Math.PI, Math.PI * 2)
  g.closePath()
  g.fill()
  // Reborde
  const reborde = g.createLinearGradient(0, 189, 0, 203)
  reborde.addColorStop(0, METAL_CLARO)
  reborde.addColorStop(1, METAL_OSCURO)
  g.fillStyle = reborde
  rectRedondo(g, 32, 189, 236, 14, 5)
  // Hueco de la copa y agujeros del ala, recortados
  recortar(g, (g) => {
    g.beginPath()
    g.arc(COPA.x, COPA.y, COPA.interior, Math.PI, Math.PI * 2)
    g.closePath()
    g.fill()
    for (const [x, y, r] of AGUJEROS_ALA) circulo(g, x, y, r)
  })
  // Cara interna: un filete de luz
  g.lineWidth = 1.2
  g.strokeStyle = 'rgba(255,255,255,0.65)'
  g.beginPath()
  g.arc(COPA.x, COPA.y, COPA.interior + 0.8, Math.PI * 1.03, Math.PI * 1.97)
  g.stroke()
  // Poros: hondos, no transparentes (la capa trabecular tiene profundidad);
  // los que rompen el borde, recortados contra el fondo
  g.save()
  g.beginPath()
  g.arc(COPA.x, COPA.y, COPA.r - 2.5, Math.PI, Math.PI * 2)
  g.closePath()
  g.clip()
  g.fillStyle = METAL_HONDO
  g.globalAlpha = 0.74
  trazarPoros(g)
  g.fill()
  g.restore()
  recortar(g, (g) => {
    g.beginPath()
    g.rect(0, 0, U, U)
    g.moveTo(COPA.x + COPA.r - 2.5, COPA.y)
    g.arc(COPA.x, COPA.y, COPA.r - 2.5, Math.PI * 2, Math.PI, true)
    g.closePath()
    g.clip('evenodd')
    trazarPoros(g)
    g.fill()
  })
  // Agujeros para tornillos en la cara maciza
  for (const a of TORNILLOS_COPA) {
    hexagono(g, COPA.x + Math.cos(a * Math.PI) * 84, COPA.y + Math.sin(a * Math.PI) * 84, 2.6, METAL_HONDO, 0.7)
  }
  // Agujeros del ala: avellanados, con el borde de abajo iluminado
  for (const [x, y, r] of AGUJEROS_ALA) {
    g.lineWidth = 1.6
    g.strokeStyle = 'rgba(62,74,96,0.35)'
    g.beginPath()
    g.arc(x, y, r + 1.4, 0, Math.PI * 2)
    g.stroke()
    g.lineWidth = 1
    g.strokeStyle = 'rgba(255,255,255,0.75)'
    g.beginPath()
    g.arc(x, y, r, 0.1 * Math.PI, 0.9 * Math.PI)
    g.stroke()
  }
}

// --- Animación ------------------------------------------------------------

type Particula = { x: number; y: number; dentro: boolean; vx: number; borde: boolean }

type Caja = { x0: number; y0: number; x1: number; y1: number }

export class AnimacionFabricacion {
  private particulas: Particula[] = []
  private caja: Caja
  private solido: HTMLCanvasElement | null = null
  private brillo: HTMLCanvasElement | null = null
  private escalaSolido = 0
  // Para la impresión: dónde empieza y termina la pieza en cada fila (el
  // láser recorre solo ese tramo)
  private filas = new Map<number, readonly [number, number]>()
  private lotes = new Lotes()
  private colores: { hueso: Rgb; metal: Rgb; linea: Rgb }

  constructor(readonly modo: ModoFabricacion) {
    const forma = modo === 'sustractiva' ? siluetaFemur : siluetaAcetabulo
    const m = mascara(U, U, forma, ESCALA_MASCARA)
    const b = limites(m, ESCALA_MASCARA)
    this.colores = {
      hueso: leerColor('--color-hueso', '#2260a1'),
      metal: leerColor('--color-metal', '#586884'),
      linea: leerColor('--color-outline', '#7b8794'),
    }
    if (modo === 'sustractiva') {
      // El bloque: una grilla que envuelve la pieza con un margen
      const caja = { x0: b.x0 - 7, y0: b.y0 - 6, x1: b.x1 + 7, y1: b.y1 + 4 }
      const leer = lectorMascara(m, ESCALA_MASCARA)
      const paso = 3.4
      for (let y = caja.y0; y <= caja.y1; y += paso) {
        for (let x = caja.x0; x <= caja.x1; x += paso) {
          const dentro = leer(x, y) > 128
          const borde =
            dentro && (leer(x - paso, y) < 128 || leer(x + paso, y) < 128 || leer(x, y - paso) < 128 || leer(x, y + paso) < 128)
          this.particulas.push({
            x,
            y,
            dentro,
            borde,
            vx: (x < (caja.x0 + caja.x1) / 2 ? -1 : 1) * (30 + Math.random() * 55),
          })
        }
      }
      this.caja = caja
    } else {
      this.particulas = muestrear(m, 3.1, ESCALA_MASCARA).map((p) => ({ ...p, dentro: true, vx: 0 }))
      this.caja = { x0: b.x0 - 4, y0: b.y0 - 2, x1: b.x1 + 4, y1: b.y1 + 8 }
      const leer = lectorMascara(m, ESCALA_MASCARA)
      for (let y = Math.floor(b.y0); y <= Math.ceil(b.y1); y++) {
        let x0 = Infinity
        let x1 = -Infinity
        for (let x = b.x0; x <= b.x1; x += 1) {
          if (leer(x, y) > 128) {
            x0 = Math.min(x0, x)
            x1 = Math.max(x1, x)
          }
        }
        if (x1 >= x0) this.filas.set(y, [x0, x1])
      }
    }
  }

  // Encuadre de la caja de la pieza en el canvas (w × h en px de CSS)
  private encuadre(w: number, h: number) {
    const { x0, y0, x1, y1 } = this.caja
    // Peso visual parejo entre las dos tarjetas: la endoprótesis es alta y
    // angosta y llena el alto; la copa es ancha y va más chica
    const llenado = this.modo === 'sustractiva' ? 0.9 : 0.6
    const sc = Math.min(w / (x1 - x0), h / (y1 - y0)) * llenado
    const ox = (w - (x1 - x0) * sc) / 2 - x0 * sc
    const oy = (h - (y1 - y0) * sc) / 2 - y0 * sc
    return { sc, ox, oy }
  }

  // La pieza en metal, dibujada una vez por tamaño
  private metal(sc: number, dpr: number) {
    const escala = sc * dpr
    if (this.solido && Math.abs(this.escalaSolido - escala) < 0.01) return this.solido
    const c = crearLienzo(U * escala, U * escala)
    const g = c.getContext('2d')
    if (g) {
      g.scale(escala, escala)
      if (this.modo === 'sustractiva') metalFemur(g)
      else metalAcetabulo(g)
    }
    this.solido = c
    this.brillo = crearLienzo(c.width, c.height)
    this.escalaSolido = escala
    return c
  }

  // Dibuja el cuadro en el momento t (0 a 1) de la animación
  dibujar(g: Ctx, w: number, h: number, dpr: number, t: number) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.clearRect(0, 0, w, h)
    const { sc, ox, oy } = this.encuadre(w, h)
    const solido = clamp((t - 0.84) / 0.16)
    const { hueso, metal } = this.colores
    const tam = Math.max(1.5, sc * 1.05)

    if (this.modo === 'aditiva') this.plataforma(g, sc, ox, oy, t, solido)

    if (solido > 0) this.pieza(g, sc, ox, oy, dpr, solido)

    const lotes = this.lotes
    if (this.modo === 'sustractiva') {
      const { y0, y1 } = this.caja
      const arranque = y0 - 8
      const recorrido = y1 + 6 - arranque
      const herramienta = lerp(arranque, y1 + 6, clamp(t / 0.8))
      const activa = t > 0 && t < 0.82
      const base = 0.85 * (1 - solido * 0.8)
      for (const p of this.particulas) {
        if (p.dentro) {
          // La pieza queda en azul; la fila que acaba de pasar la fresa se
          // ilumina un instante
          const cerca = activa ? clamp(1 - Math.abs(p.y - herramienta) / 7) : 0
          const a = Math.min(1, base + cerca * 0.3)
          const s = (p.borde ? tam * 1.18 : tam) * (1 + cerca * 0.35)
          lotes.agregar(rgba(hueso, Math.round(a * 20) / 20), ox + p.x * sc, oy + p.y * sc, s)
          continue
        }
        // Material sobrante: se desprende cuando pasa la fresa
        const rt = clamp((p.y - arranque) / recorrido) * 0.8
        const f = clamp((t - rt) / 0.12)
        if (f >= 1) continue
        const a = Math.round(0.55 * (1 - f) * 20) / 20
        if (a <= 0) continue
        lotes.agregar(
          rgba(metal, a),
          ox + (p.x + f * p.vx) * sc,
          oy + (p.y - f * 8 + f * f * 50) * sc,
          tam * (1 - f * 0.3),
        )
      }
      lotes.dibujar(g)
      if (activa) this.fresa(g, sc, ox, oy, herramienta, t)
    } else {
      const { y0, y1 } = this.caja
      const capa = lerp(y1 - 8, y0 + 2, clamp(t / 0.8))
      const base = 0.85 * (1 - solido * 0.8)
      for (const p of this.particulas) {
        if (p.y < capa) continue
        const fv = clamp((p.y - capa) / 14)
        const a = Math.round(base * fv * 20) / 20
        if (a <= 0) continue
        lotes.agregar(rgba(hueso, a), ox + p.x * sc, oy + (p.y - (1 - fv) * 10) * sc, p.borde ? tam * 1.18 : tam)
      }
      lotes.dibujar(g)
      if (t > 0 && t < 0.82) this.laser(g, sc, ox, oy, capa, t)
    }
  }

  private pieza(g: Ctx, sc: number, ox: number, oy: number, dpr: number, solido: number) {
    const metal = this.metal(sc, dpr)
    let fuente: HTMLCanvasElement = metal
    // Un reflejo cruza la pieza mientras aparece, de izquierda a derecha
    const brillo = this.brillo
    if (brillo && solido < 1) {
      const b = brillo.getContext('2d')
      if (b) {
        b.globalCompositeOperation = 'copy'
        b.drawImage(metal, 0, 0)
        b.globalCompositeOperation = 'source-atop'
        const x = lerp(-0.25, 1.25, solido) * brillo.width
        const banda = b.createLinearGradient(x - brillo.width * 0.18, 0, x + brillo.width * 0.18, brillo.height * 0.35)
        banda.addColorStop(0, 'rgba(255,255,255,0)')
        banda.addColorStop(0.5, 'rgba(255,255,255,0.75)')
        banda.addColorStop(1, 'rgba(255,255,255,0)')
        b.fillStyle = banda
        b.fillRect(0, 0, brillo.width, brillo.height)
        b.globalCompositeOperation = 'source-over'
        fuente = brillo
      }
    }
    g.save()
    g.globalAlpha = solido * 0.95
    g.drawImage(fuente, ox, oy, U * sc, U * sc)
    g.restore()
  }

  // Fresa: el pórtico que baja (la línea del borrador) y la herramienta, que
  // va y viene sobre él
  private fresa(g: Ctx, sc: number, ox: number, oy: number, yh: number, t: number) {
    const { hueso } = this.colores
    const { x0, x1 } = this.caja
    const y = oy + yh * sc
    g.lineWidth = 1.5
    g.strokeStyle = rgba(hueso, 0.9)
    g.beginPath()
    g.moveTo(ox + (x0 - 8) * sc, y)
    g.lineTo(ox + (x1 + 8) * sc, y)
    g.stroke()
    const tx = ox + lerp(x0, x1, Math.sin(t * 60) * 0.5 + 0.5) * sc
    this.punta(g, tx, y, sc, hueso)
    // Husillo sobre la herramienta
    g.fillStyle = rgba(hueso, 0.55)
    g.fillRect(tx - 1, y - 12 * sc, 2, 12 * sc - 4)
  }

  // Láser: la línea de la capa (borrador) y el punto que la funde, solo
  // sobre el tramo de la pieza en esa fila
  private laser(g: Ctx, sc: number, ox: number, oy: number, capa: number, t: number) {
    const { hueso } = this.colores
    const { x0, x1 } = this.caja
    const y = oy + capa * sc
    g.lineWidth = 1.5
    g.strokeStyle = rgba(hueso, 0.9)
    g.beginPath()
    g.moveTo(ox + (x0 - 12) * sc, y)
    g.lineTo(ox + (x1 + 12) * sc, y)
    g.stroke()
    const fila = this.filas.get(Math.round(capa))
    if (fila) {
      const tx = ox + lerp(fila[0], fila[1], Math.sin(t * 45) * 0.5 + 0.5) * sc
      this.punta(g, tx, y, sc, hueso)
    }
  }

  private punta(g: Ctx, x: number, y: number, sc: number, color: Rgb) {
    const r = 9 * sc
    const halo = g.createRadialGradient(x, y, 0, x, y, r)
    halo.addColorStop(0, rgba(color, 0.35))
    halo.addColorStop(1, rgba(color, 0))
    g.fillStyle = halo
    g.beginPath()
    g.arc(x, y, r, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = rgba(color, 1)
    g.beginPath()
    g.arc(x, y, 3.6, 0, Math.PI * 2)
    g.fill()
    g.fillStyle = '#ffffff'
    g.beginPath()
    g.arc(x, y, 1.3, 0, Math.PI * 2)
    g.fill()
  }

  // Plataforma de impresión bajo la pieza: se ve mientras crece y se va
  // cuando aparece en metal
  private plataforma(g: Ctx, sc: number, ox: number, oy: number, t: number, solido: number) {
    const a = 0.5 * (1 - solido) * clamp(t * 12 + 0.2)
    if (a <= 0.01) return
    const { x0, x1, y1 } = this.caja
    g.fillStyle = rgba(this.colores.linea, a)
    g.fillRect(ox + (x0 - 14) * sc, oy + (y1 - 5) * sc, (x1 - x0 + 28) * sc, Math.max(1, 1.6 * sc))
  }
}
