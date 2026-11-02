// Recaptura de los respaldos sin WebGL de la toma del hero
// (public/img/cuerpo-inicio.webp y cuerpo-inicio-movil.webp): la escena en la
// pose inicial (movimiento reducido), solo el canvas y con fondo transparente,
// en el recorte que muestra VistaHero (components/home/tour.tsx).
//
// Uso (con la home servida, next dev o next start):
//   node docs/landing/cuerpo-unico/respaldos.mjs <carpeta> [url]
//   cwebp -q 82 -alpha_q 90 <carpeta>/cuerpo-inicio.png -o public/img/cuerpo-inicio.webp
//   (lo mismo con cuerpo-inicio-movil) y borrar .next/dev/cache/images
//
// No hace falta desactivar recorteHero: el cuerpo entra entero en la caja del
// busto en todas las poses del hero, y fuera de ella el canvas es
// transparente igual. La imagen no depende del ancho de la pantalla (solo se
// corre), así que el escritorio se toma a 1920 de ancho para que entren los
// 960 px alrededor de la cabeza.
//
// patchright, como en base/medir.mjs (otra ruta con PATCHRIGHT_DIR).
import { createRequire } from 'node:module'
const PATCHRIGHT_DIR =
  process.env.PATCHRIGHT_DIR ??
  '/Users/brianrebagliati/.vscode/extensions/danielsanmedium.dscodegpt-3.24.79/standalone/'
const { chromium } = createRequire(PATCHRIGHT_DIR)('patchright')
const out = process.argv[2]
const url = process.argv[3] ?? 'http://localhost:3000/'
const browser = await chromium.launch({ headless: true, channel: 'chrome', args: ['--use-angle=metal', '--ignore-gpu-blocklist'] })
const espera = (ms) => new Promise((r) => setTimeout(r, ms))
async function tomar(nombre, opts, scroll, clip) {
  const ctx = await browser.newContext({ ...opts, reducedMotion: 'reduce' })
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'load' })
  await page.waitForSelector('canvas[data-engine]', { timeout: 60000 })
  await espera(8000)
  if (scroll) await page.evaluate((y) => window.scrollTo(0, y * innerHeight), scroll)
  await espera(2500)
  await page.evaluate(() => {
    const s = document.createElement('style')
    s.textContent = 'html,body{background:transparent!important} *{visibility:hidden!important} canvas[data-engine]{visibility:visible!important}'
    document.head.append(s)
  })
  await espera(1500)
  await page.screenshot({ path: `${out}/${nombre}.png`, omitBackground: true, clip })
  await ctx.close()
}
// Escritorio: 960 × 900 centrado en la cabeza (ancla 0,7404 del ancho)
const W = 1920
await tomar('cuerpo-inicio', { viewport: { width: W, height: 900 }, deviceScaleFactor: 1.5 }, 0,
  { x: 0.7404 * W - 480, y: 0, width: 960, height: 900 })
// Celular: 720 × 523 (62vh) desde 78,2 % del alto, con la cabeza al 109,2 %;
// con el desliz entero (0,4 pantallas) la cabeza sube a 69,2 %
const H = 846
const cabeza = 0.692 * H
const arriba = cabeza - (1.092 - 0.782) * H
await tomar('cuerpo-inicio-movil', { viewport: { width: 720, height: H }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }, 0.4,
  { x: 0, y: arriba, width: 720, height: 0.62 * H })
await browser.close()
