// Utilidades de canvas 2D para las animaciones de la home ("Cómo trabajamos"
// y "Mecanizado e impresión 3D"), con el mismo método que el borrador de la
// landing (docs/landing/landing-borrador.html): las formas se dibujan en una
// máscara y las partículas salen de muestrear esa máscara.

export const clamp = (v: number, a = 0, b = 1) => (v < a ? a : v > b ? b : v)
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t
export const smooth = (t: number) => t * t * (3 - 2 * t)

export type Ctx = CanvasRenderingContext2D

export function crearLienzo(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.round(w))
  c.height = Math.max(1, Math.round(h))
  return c
}

// Máscara blanca de una forma dibujada en unidades (`w` × `h`), a `escala`
// píxeles por unidad
export function mascara(w: number, h: number, dibujar: (g: Ctx) => void, escala = 1) {
  const c = crearLienzo(w * escala, h * escala)
  const g = c.getContext('2d', { willReadFrequently: true })
  if (!g) return c
  g.scale(escala, escala)
  g.fillStyle = '#fff'
  g.strokeStyle = '#fff'
  g.lineCap = 'round'
  g.lineJoin = 'round'
  dibujar(g)
  return c
}

export type Punto = { x: number; y: number; borde: boolean }

// Puntos dentro de la máscara, cada `paso` unidades, con un poco de ruido
// para que no se lea la grilla. `borde`: el punto está en el contorno.
export function muestrear(c: HTMLCanvasElement, paso: number, escala = 1, ruido = 0.8): Punto[] {
  const g = c.getContext('2d', { willReadFrequently: true })
  if (!g) return []
  const w = c.width
  const h = c.height
  const d = g.getImageData(0, 0, w, h).data
  const a = (x: number, y: number) => {
    const xi = Math.round(x * escala)
    const yi = Math.round(y * escala)
    return xi < 0 || yi < 0 || xi >= w || yi >= h ? 0 : (d[(yi * w + xi) * 4 + 3] ?? 0)
  }
  const puntos: Punto[] = []
  for (let y = 0; y < h / escala; y += paso) {
    for (let x = 0; x < w / escala; x += paso) {
      if (a(x, y) > 128) {
        const borde = a(x - paso, y) < 128 || a(x + paso, y) < 128 || a(x, y - paso) < 128 || a(x, y + paso) < 128
        puntos.push({
          x: x + (Math.random() - 0.5) * paso * ruido,
          y: y + (Math.random() - 0.5) * paso * ruido,
          borde,
        })
      }
    }
  }
  return puntos
}

// Máscara blanca con la silueta de una imagen con fondo transparente (los
// renders de public/img/fabricacion/), en una caja de `w` × `h` unidades a
// `escala` píxeles por unidad. Qué píxel es pieza: alfa casi pleno y no
// negro. La sombra de contacto del render es negra con alfa parcial: forma
// parte de la imagen pero no de la silueta.
export function mascaraDeImagen(imagen: HTMLImageElement, w: number, h: number, escala = 1) {
  const c = crearLienzo(w * escala, h * escala)
  const g = c.getContext('2d', { willReadFrequently: true })
  if (!g) return c
  g.drawImage(imagen, 0, 0, c.width, c.height)
  const datos = g.getImageData(0, 0, c.width, c.height)
  const d = datos.data
  for (let i = 0; i < d.length; i += 4) {
    const a = d[i + 3] ?? 0
    const luz = ((d[i] ?? 0) + (d[i + 1] ?? 0) + (d[i + 2] ?? 0)) / 3
    const pieza = a > ALFA_PIEZA && luz > LUZ_PIEZA
    d[i] = d[i + 1] = d[i + 2] = 255
    d[i + 3] = pieza ? 255 : 0
  }
  g.putImageData(datos, 0, 0)
  return c
}

const ALFA_PIEZA = 200
const LUZ_PIEZA = 30

// Alfa de la máscara en un punto (en unidades)
export function lectorMascara(c: HTMLCanvasElement, escala = 1) {
  const g = c.getContext('2d', { willReadFrequently: true })
  const w = c.width
  const h = c.height
  const d = g ? g.getImageData(0, 0, w, h).data : new Uint8ClampedArray(0)
  return (x: number, y: number) => {
    const xi = Math.round(x * escala)
    const yi = Math.round(y * escala)
    return xi < 0 || yi < 0 || xi >= w || yi >= h ? 0 : (d[(yi * w + xi) * 4 + 3] ?? 0)
  }
}

// Caja que ocupa la máscara, en unidades
export function limites(c: HTMLCanvasElement, escala = 1) {
  const leer = lectorMascara(c, escala)
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  const w = c.width / escala
  const h = c.height / escala
  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      if (leer(x, y) > 128) {
        if (x < x0) x0 = x
        if (x > x1) x1 = x
        if (y < y0) y0 = y
        if (y > y1) y1 = y
      }
    }
  }
  return { x0, y0, x1, y1 }
}

export function taper(g: Ctx, x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) {
  const a = Math.atan2(y2 - y1, x2 - x1) + Math.PI / 2
  const cx = Math.cos(a)
  const cy = Math.sin(a)
  g.beginPath()
  g.moveTo(x1 + cx * r1, y1 + cy * r1)
  g.lineTo(x2 + cx * r2, y2 + cy * r2)
  g.lineTo(x2 - cx * r2, y2 - cy * r2)
  g.lineTo(x1 - cx * r1, y1 - cy * r1)
  g.closePath()
  g.fill()
  g.beginPath()
  g.arc(x1, y1, r1, 0, Math.PI * 2)
  g.fill()
  g.beginPath()
  g.arc(x2, y2, r2, 0, Math.PI * 2)
  g.fill()
}

export function rectRedondo(g: Ctx, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath()
  g.roundRect(x, y, w, h, r)
  g.fill()
}

export function circulo(g: Ctx, x: number, y: number, r: number) {
  g.beginPath()
  g.arc(x, y, r, 0, Math.PI * 2)
  g.fill()
}

// Recorta (borra) lo que dibuje `fn`
export function recortar(g: Ctx, fn: (g: Ctx) => void) {
  g.save()
  g.globalCompositeOperation = 'destination-out'
  g.fillStyle = '#000'
  g.strokeStyle = '#000'
  fn(g)
  g.restore()
}

// Colores de marca leídos de los tokens de globals.css (@theme), como
// tripletas RGB: así el canvas sigue a los tokens si cambian.
export type Rgb = readonly [number, number, number]

export function leerColor(nombre: string, respaldo: string): Rgb {
  const valor = getComputedStyle(document.documentElement).getPropertyValue(nombre).trim() || respaldo
  return hexARgb(valor) ?? hexARgb(respaldo) ?? [0, 0, 0]
}

function hexARgb(hex: string): Rgb | null {
  const m = /^#([0-9a-f]{6})$/i.exec(hex)
  if (!m?.[1]) return null
  const n = Number.parseInt(m[1], 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

export const rgba = ([r, g, b]: Rgb, a: number) => `rgba(${r},${g},${b},${a.toFixed(3)})`

// Ajusta el canvas a su tamaño en pantalla y a la densidad de píxeles
export function ajustar(cv: HTMLCanvasElement, dprMax = 2) {
  const r = cv.getBoundingClientRect()
  const dpr = Math.min(dprMax, window.devicePixelRatio || 1)
  const w = Math.max(1, Math.round(r.width * dpr))
  const h = Math.max(1, Math.round(r.height * dpr))
  if (cv.width !== w || cv.height !== h) {
    cv.width = w
    cv.height = h
  }
  return { w: r.width, h: r.height, dpr }
}

// Lotes de rectángulos por estilo: un solo fill por color y opacidad, en vez
// de cambiar fillStyle en cada partícula.
export class Lotes {
  private xs = new Map<string, number[]>()

  agregar(estilo: string, x: number, y: number, s: number) {
    let lista = this.xs.get(estilo)
    if (!lista) {
      lista = []
      this.xs.set(estilo, lista)
    }
    lista.push(x, y, s)
  }

  dibujar(g: Ctx) {
    for (const [estilo, lista] of this.xs) {
      if (lista.length === 0) continue
      g.fillStyle = estilo
      g.beginPath()
      for (let i = 0; i < lista.length; i += 3) {
        const s = lista[i + 2] ?? 1
        g.rect((lista[i] ?? 0) - s / 2, (lista[i + 1] ?? 0) - s / 2, s, s)
      }
      g.fill()
      lista.length = 0
    }
  }
}
