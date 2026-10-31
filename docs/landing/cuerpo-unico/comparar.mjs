// Hoja de comparación de la compuerta del cuerpo único: base | prototipo |
// diferencia, captura por captura (mismos nombres en base/capturas y
// prototipo/capturas). Escribe prototipo/diferencias/*.webp (diferencia
// absoluta por canal, × 4, en grises), prototipo/diferencias.json (medidas)
// y comparacion.html, que se abre como archivo.
//
// Uso: node docs/landing/cuerpo-unico/comparar.mjs
// Medidas, sobre la zona del 3D del hero (escritorio: la caja del busto,
// x ≥ 600; celular: desde la línea de habilitaciones, y ≥ 330):
// - media: diferencia media (0 a 255) del canal que más cambia
// - mas24: % de píxeles que cambian más de 24/255 (≈ 10 %)
// - desplazamiento: corrimiento entero (dx, dy) que mejor alinea la zona del
//   busto, para separar "está corrido" de "se ve distinto"

import { createRequire } from 'node:module'
import { mkdirSync, readdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = dirname(fileURLToPath(import.meta.url))
const sharp = createRequire(join(DIR, '../../../'))('sharp')
const BASE = join(DIR, 'base/capturas')
// --contra fase3: compara esa carpeta (fase3/capturas) en lugar del prototipo
const CONTRA = process.argv.includes('--contra') ? process.argv[process.argv.indexOf('--contra') + 1] : 'prototipo'
const PROTO = join(DIR, CONTRA, 'capturas')
const DIF = join(DIR, CONTRA, 'diferencias')
mkdirSync(DIF, { recursive: true })

const zona = (nombre, w, h) => {
  const k = w / (nombre.startsWith('escritorio') ? 1440 : 390)
  return nombre.startsWith('escritorio')
    ? [600 * k, 0, w, h]
    : nombre.includes('hero-abajo')
      ? [0, 0, w, h]
      : [0, 330 * k, w, h]
}

const crudo = async (f) => sharp(f).removeAlpha().raw().toBuffer({ resolveWithObject: true })

function desplazamiento(A, B, [x0, y0, x1, y1]) {
  const W = A.info.width
  const lum = (d, i) => d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11
  let mejor = [Infinity, 0, 0]
  const paso = Math.max(1, Math.round((x1 - x0) / 300))
  for (let dy = -6; dy <= 6; dy++) for (let dx = -6; dx <= 6; dx++) {
    let s = 0, n = 0
    for (let y = Math.max(y0, 6); y < Math.min(y1, A.info.height - 6); y += paso)
      for (let x = Math.max(x0, 6); x < Math.min(x1, W - 6); x += paso) {
        s += Math.abs(lum(A.data, (y * W + x) * 3) - lum(B.data, ((y + dy) * W + x + dx) * 3))
        n++
      }
    if (s / n < mejor[0]) mejor = [s / n, dx, dy]
  }
  return [mejor[1], mejor[2]]
}

const filas = []
for (const archivo of readdirSync(BASE).filter((n) => n.endsWith('.webp')).sort()) {
  const nombre = archivo.replace(/\.webp$/, '')
  let P
  try {
    P = await crudo(join(PROTO, archivo))
  } catch {
    filas.push({ nombre, falta: true })
    continue
  }
  const A = await crudo(join(BASE, archivo))
  const { width: w, height: h } = A.info
  const [x0, y0, x1, y1] = zona(nombre, w, h).map(Math.round)
  const out = Buffer.alloc(w * h * 3)
  let suma = 0, n = 0, grandes = 0
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 3
    const d = Math.max(Math.abs(A.data[i] - P.data[i]), Math.abs(A.data[i + 1] - P.data[i + 1]), Math.abs(A.data[i + 2] - P.data[i + 2]))
    if (x >= x0 && x < x1 && y >= y0 && y < y1) { suma += d; n++; if (d > 24) grandes++ }
    out[i] = out[i + 1] = out[i + 2] = Math.min(255, d * 4)
  }
  await sharp(out, { raw: { width: w, height: h, channels: 3 } }).webp({ quality: 70 }).toFile(join(DIF, archivo))
  const fila = {
    nombre,
    media: +(suma / n).toFixed(2),
    mas24: +((100 * grandes) / n).toFixed(2),
    desplazamiento: desplazamiento(A, P, [x0, y0, x1, y1]),
  }
  filas.push(fila)
  console.log(JSON.stringify(fila))
}
writeFileSync(join(DIR, 'prototipo/diferencias.json'), JSON.stringify(filas, null, 1))

const celda = (src, alt) => `<figure><a href="${src}"><img loading="lazy" src="${src}" alt="${alt}"></a><figcaption>${alt}</figcaption></figure>`
const html = `<!doctype html>
<html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Paridad del cuerpo único</title>
<style>
:root { color-scheme: light; --tinta: #1b2733; --suave: #5d6b78; --linea: #d5dde5; --fondo: #f5f7f9; --marca: #003c6f; }
* { box-sizing: border-box; }
body { margin: 0; background: var(--fondo); color: var(--tinta); font: 15px/1.5 system-ui, sans-serif; }
header, section { max-width: 1680px; margin: 0 auto; padding: 24px 16px; }
h1 { font-weight: 500; font-size: 28px; margin: 0 0 8px; }
h2 { font-weight: 500; font-size: 18px; margin: 0 0 4px; }
p { color: var(--suave); max-width: 80ch; margin: 4px 0; }
section { border-top: 1px solid var(--linea); }
.fila { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; margin-top: 8px; }
.celular .fila { grid-template-columns: repeat(3, minmax(0, 260px)); }
figure { margin: 0; }
img { display: block; width: 100%; height: auto; border-radius: 8px; background: #000; }
figcaption { font-size: 13px; color: var(--suave); margin-top: 4px; }
.dato { font-variant-numeric: tabular-nums; font-family: ui-monospace, monospace; font-size: 13px; color: var(--marca); }
</style></head><body>
<header>
<h1>Paridad del cuerpo único: hero actual contra prototipo</h1>
<p>Cada fila: la captura de la base (hero actual, <code>base/capturas/</code>), la del prototipo con <code>?cuerpo-unico</code> (<code>prototipo/capturas/</code>, la escena del recorrido en la toma del hero) y la diferencia absoluta por píxel, multiplicada por 4 (negro: igual). Mismos momentos y condiciones (<code>base/MEDICIONES.md</code>). Las fibras del fondo se mueven solas y cambian entre corridas: la comparación que importa es la del busto.</p>
<p>Medidas sobre la zona del 3D: <b>media</b> (diferencia media, 0 a 255), <b>&gt;24</b> (% de píxeles que cambian más de 24/255) y <b>corrimiento</b> (dx, dy en píxeles que mejor alinean la zona).</p>
</header>
${filas.map((f) => f.falta ? `<section><h2>${f.nombre}</h2><p>Falta la captura del prototipo.</p></section>` : `<section class="${f.nombre.startsWith('celular') ? 'celular' : ''}">
<h2>${f.nombre}</h2><div class="dato">media ${f.media} · &gt;24: ${f.mas24} % · corrimiento ${f.desplazamiento.join(', ')}</div>
<div class="fila">${celda(`base/capturas/${f.nombre}.webp`, 'Base')}${celda(`prototipo/capturas/${f.nombre}.webp`, 'Prototipo')}${celda(`prototipo/diferencias/${f.nombre}.webp`, 'Diferencia × 4')}</div></section>`).join('\n')}
</body></html>
`
writeFileSync(join(DIR, 'comparacion.html'), html)
