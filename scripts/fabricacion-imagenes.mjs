// Pasa a WebP los renders de las piezas de Fabricación (3d/scripts/
// render-fabricacion.py, en 3d/salida/fabricacion/) para las animaciones de
// la home (components/animaciones/fabricacion.ts): 1600 px de ancho, 4:3,
// con el alfa intacto (la animación saca la silueta de la pieza y el
// contorno del bloque del alfa, y la sombra de contacto va en el alfa bajo).
// Sin recorte: el encuadre lo decide el render. El plano que recoge la
// sombra deja un velo de alfa muy bajo (1 a 3 niveles de 255) lejos de la
// pieza, que sobre la tarjeta se veía como una zona apenas gris con borde:
// se resta del alfa de todos los píxeles la mediana del borde del cuadro y,
// como mínimo, VELO_MINIMO niveles, y la cola tenue de la sombra (hasta
// COLA_SOMBRA niveles) se apaga con una curva suave, así el fondo queda
// transparente del todo, la sombra se queda junto a la pieza y la pieza
// (alfa pleno) no cambia. La sombra que llega al borde de abajo del cuadro
// se desvanece en el último BORDE_SOMBRA del alto (si no, se cortaba en una
// línea recta contra el borde de la tarjeta); solo los píxeles oscuros, así
// una pieza que llegue al borde no se desvanece. `npm run fabricacion` corre el render y
// después este script.
import { mkdir, stat } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ORIGEN = '3d/salida/fabricacion'
const DESTINO = 'public/img/fabricacion'
const ANCHO = 1600
const PIEZAS = ['femur', 'acetabulo']
const VELO_MINIMO = 4
const COLA_SOMBRA = 48
const BORDE_SOMBRA = 0.16

await mkdir(DESTINO, { recursive: true })

for (const pieza of PIEZAS) {
  const entrada = path.join(ORIGEN, `${pieza}.png`)
  const salida = path.join(DESTINO, `${pieza}.webp`)
  const meta = await sharp(entrada).metadata()
  if (Math.abs(meta.width / meta.height - 4 / 3) > 0.01) {
    throw new Error(`${entrada} no es 4:3 (${meta.width}x${meta.height})`)
  }
  const { data, info } = await sharp(entrada).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const velo = Math.max(VELO_MINIMO, medirVelo(data, info.width, info.height))
  {
    const factor = 255 / (255 - velo)
    const { width, height } = info
    for (let i = 3; i < data.length; i += 4) {
      const a = data[i] ?? 0
      let b = a <= velo ? 0 : Math.min(255, (a - velo) * factor)
      if (b < COLA_SOMBRA) {
        const t = b / COLA_SOMBRA
        b *= t * t * (3 - 2 * t)
      }
      const oscuro = ((data[i - 3] ?? 0) + (data[i - 2] ?? 0) + (data[i - 1] ?? 0)) / 3 < 30
      if (oscuro) {
        const y = Math.floor(i / 4 / width)
        const t = Math.min(1, (height - 1 - y) / (height * BORDE_SOMBRA))
        b *= t * t * (3 - 2 * t)
      }
      data[i] = Math.round(b)
    }
  }
  await sharp(data, { raw: { width: info.width, height: info.height, channels: 4 } })
    .resize({ width: ANCHO, withoutEnlargement: true })
    .webp({ quality: 88, alphaQuality: 100, effort: 6 })
    .toFile(salida)
  const { size } = await stat(salida)
  console.log(`${salida}: ${Math.round(size / 1024)} KB (velo de ${velo} restado)`)
}

// Mediana del alfa en el borde del cuadro (el 8 % de cada lado), donde no hay
// pieza: lo que mide es el velo del plano de la sombra. Sin plano (la
// endoprótesis flota), da 0.
function medirVelo(data, ancho, alto) {
  const mx = Math.round(ancho * 0.08)
  const my = Math.round(alto * 0.08)
  const alfas = []
  for (let y = 0; y < alto; y++) {
    const borde = y < my || y >= alto - my
    for (let x = 0; x < ancho; x++) {
      if (!borde && x >= mx && x < ancho - mx) continue
      alfas.push(data[(y * ancho + x) * 4 + 3] ?? 0)
    }
  }
  alfas.sort((a, b) => a - b)
  return alfas[Math.floor(alfas.length / 2)] ?? 0
}
