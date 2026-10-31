// node dif.mjs <dirA> <dirB> [--zona]: diferencia media (canal que más cambia,
// 0-255) y % de píxeles que cambian más de 24, por archivo con el mismo nombre
import { createRequire } from 'node:module'
import { readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
const sharp = createRequire('/Users/brianrebagliati/Documents/Work/Innercare/')('sharp')
const [A, B] = process.argv.slice(2)
const zonaHero = process.argv.includes('--zona')
const zona = (n, w, h) => {
  const k = w / (n.startsWith('escritorio') ? 1440 : 390)
  if (!zonaHero) return [0, 0, w, h]
  return n.startsWith('escritorio') ? [600 * k, 0, w, h] : n.includes('hero-abajo') ? [0, 0, w, h] : [0, 330 * k, w, h]
}
for (const f of readdirSync(A).filter((n) => /\.(png|webp)$/.test(n)).sort()) {
  if (!existsSync(join(B, f))) { console.log(f, 'falta en B'); continue }
  const [a, b] = await Promise.all([A, B].map((d) => sharp(join(d, f)).removeAlpha().raw().toBuffer({ resolveWithObject: true })))
  if (a.info.width !== b.info.width || a.info.height !== b.info.height) { console.log(f, 'tamaño distinto'); continue }
  const W = a.info.width, H = a.info.height
  const [x0, y0, x1, y1] = zona(f, W, H).map(Math.round)
  let s = 0, n = 0, m24 = 0
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const i = (y * W + x) * 3
    const d = Math.max(Math.abs(a.data[i] - b.data[i]), Math.abs(a.data[i + 1] - b.data[i + 1]), Math.abs(a.data[i + 2] - b.data[i + 2]))
    s += d; n++; if (d > 24) m24++
  }
  console.log(f.padEnd(44), (s / n).toFixed(2).padStart(6), ((100 * m24) / n).toFixed(2).padStart(6) + ' %')
}
