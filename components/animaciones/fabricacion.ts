// Animaciones de "Mecanizado e impresión 3D" (#fabricacion), réplica de las
// del borrador de la landing (docs/landing/landing-borrador.html, drawFab):
// - Mecanizado CNC: un bloque de partículas; la fresa lo barre de arriba
//   abajo, el material sobrante se desprende y queda la pieza (la
//   endoprótesis de fémur, el sistema modular que se mecaniza).
// - Impresión 3D: la pieza (la reconstrucción acetabular en titanio
//   trabecular) crece capa por capa desde abajo.
// Al final, en las dos, aparece la pieza real: un render de la misma malla
// del recorrido 3D (public/img/fabricacion/, de `npm run fabricacion`:
// 3d/scripts/render-fabricacion.py) con fondo transparente. La silueta para
// las partículas, el bloque del CNC y las filas del láser salen del alfa de
// esa imagen: la animación no sabe qué forma tiene la pieza. Mismos tiempos
// y la misma lógica que el borrador; la ejecución suma el doble de
// partículas, la fresa y el láser que recorren la capa, y un reflejo que
// cruza la pieza cuando aparece.

import {
  Lotes,
  clamp,
  crearLienzo,
  lerp,
  limites,
  lectorMascara,
  leerColor,
  muestrear,
  rgba,
  type Ctx,
  type Rgb,
} from './lienzo'

export type ModoFabricacion = 'sustractiva' | 'aditiva'

// Duración total (borrador: 3,8 s). La herramienta trabaja hasta el 80 % y
// la pieza sólida aparece desde el 84 %.
export const DURACION_FAB = 3800

// Unidades: la imagen, en 4:3 como la escena de la tarjeta, se dibuja en una
// caja de 300 × 225 y se escala al canvas. El encuadre de la pieza (su
// tamaño, el aire alrededor) lo decide el render.
const U = 300
const ALTO_U = 225
const ESCALA_MASCARA = 2

// Qué píxel de la imagen es pieza: alfa casi pleno y no negro. La sombra de
// contacto del render es negra con alfa parcial: forma parte de la imagen
// pero no de la silueta (no se talla ni se imprime).
const ALFA_PIEZA = 200
const LUZ_PIEZA = 30

// Máscara blanca con la silueta de la pieza, en unidades a ESCALA_MASCARA,
// para muestrear con las utilidades de lienzo.ts
function mascaraDeImagen(imagen: HTMLImageElement) {
  const c = crearLienzo(U * ESCALA_MASCARA, ALTO_U * ESCALA_MASCARA)
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

type Particula = { x: number; y: number; dentro: boolean; vx: number; borde: boolean }

type Caja = { x0: number; y0: number; x1: number; y1: number }

export class AnimacionFabricacion {
  private particulas: Particula[] = []
  private caja: Caja
  private brillo: HTMLCanvasElement | null = null
  // Para la impresión: dónde empieza y termina la pieza en cada fila (el
  // láser recorre solo ese tramo)
  private filas = new Map<number, readonly [number, number]>()
  private lotes = new Lotes()
  private colores: { hueso: Rgb; metal: Rgb; linea: Rgb }

  constructor(
    readonly modo: ModoFabricacion,
    // La pieza terminada, ya cargada y decodificada (4:3, fondo transparente)
    private readonly imagen: HTMLImageElement,
  ) {
    const m = mascaraDeImagen(imagen)
    const b = limites(m, ESCALA_MASCARA)
    this.colores = {
      hueso: leerColor('--color-hueso', '#2260a1'),
      metal: leerColor('--color-metal', '#586884'),
      linea: leerColor('--color-outline', '#7b8794'),
    }
    const leer = lectorMascara(m, ESCALA_MASCARA)
    if (modo === 'sustractiva') {
      // El bloque: una grilla que envuelve la pieza con un margen
      const caja = { x0: b.x0 - 7, y0: b.y0 - 6, x1: b.x1 + 7, y1: b.y1 + 4 }
      const paso = 2.8
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
      this.particulas = muestrear(m, 2.6, ESCALA_MASCARA).map((p) => ({ ...p, dentro: true, vx: 0 }))
      this.caja = { x0: b.x0 - 4, y0: b.y0 - 2, x1: b.x1 + 4, y1: b.y1 + 8 }
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

  // Encuadre de la imagen en el canvas (w × h en px de CSS): la caja 4:3
  // entera, centrada
  private encuadre(w: number, h: number) {
    const sc = Math.min(w / U, h / ALTO_U)
    const ox = (w - U * sc) / 2
    const oy = (h - ALTO_U * sc) / 2
    return { sc, ox, oy }
  }

  // Dibuja el cuadro en el momento t (0 a 1) de la animación
  dibujar(g: Ctx, w: number, h: number, dpr: number, t: number) {
    g.setTransform(dpr, 0, 0, dpr, 0, 0)
    g.clearRect(0, 0, w, h)
    const { sc, ox, oy } = this.encuadre(w, h)
    const solido = clamp((t - 0.84) / 0.16)
    const { hueso, metal } = this.colores
    const tam = Math.max(1.5, sc * 0.95)

    if (this.modo === 'aditiva') this.plataforma(g, sc, ox, oy, t, solido)

    if (solido > 0) this.pieza(g, sc, ox, oy, dpr, solido)

    // Sobre la pieza terminada, las partículas casi desaparecen: el titanio
    // queda limpio, con el contorno apenas marcado
    const base = 0.85 * (1 - solido * 0.94)
    const lotes = this.lotes
    if (this.modo === 'sustractiva') {
      const { y0, y1 } = this.caja
      const arranque = y0 - 8
      const recorrido = y1 + 6 - arranque
      const herramienta = lerp(arranque, y1 + 6, clamp(t / 0.8))
      const activa = t > 0 && t < 0.82
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

  // La pieza real, con un reflejo que la cruza de izquierda a derecha
  // mientras aparece
  private pieza(g: Ctx, sc: number, ox: number, oy: number, dpr: number, solido: number) {
    const ancho = U * sc
    const alto = ALTO_U * sc
    let fuente: CanvasImageSource = this.imagen
    if (solido < 1) {
      const bw = Math.round(ancho * dpr)
      const bh = Math.round(alto * dpr)
      if (!this.brillo || this.brillo.width !== bw || this.brillo.height !== bh) this.brillo = crearLienzo(bw, bh)
      const b = this.brillo.getContext('2d')
      if (b) {
        b.globalCompositeOperation = 'copy'
        b.imageSmoothingQuality = 'high'
        b.drawImage(this.imagen, 0, 0, bw, bh)
        b.globalCompositeOperation = 'source-atop'
        const x = lerp(-0.25, 1.25, solido) * bw
        const banda = b.createLinearGradient(x - bw * 0.18, 0, x + bw * 0.18, bh * 0.35)
        banda.addColorStop(0, 'rgba(255,255,255,0)')
        banda.addColorStop(0.5, 'rgba(255,255,255,0.75)')
        banda.addColorStop(1, 'rgba(255,255,255,0)')
        b.fillStyle = banda
        b.fillRect(0, 0, bw, bh)
        b.globalCompositeOperation = 'source-over'
        fuente = this.brillo
      }
    }
    g.save()
    g.globalAlpha = solido
    g.imageSmoothingQuality = 'high'
    g.drawImage(fuente, ox, oy, ancho, alto)
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
  // cuando aparece la pieza
  private plataforma(g: Ctx, sc: number, ox: number, oy: number, t: number, solido: number) {
    const a = 0.5 * (1 - solido) * clamp(t * 12 + 0.2)
    if (a <= 0.01) return
    const { x0, x1, y1 } = this.caja
    g.fillStyle = rgba(this.colores.linea, a)
    g.fillRect(ox + (x0 - 14) * sc, oy + (y1 - 5) * sc, (x1 - x0 + 28) * sc, Math.max(1, 1.6 * sc))
  }
}
