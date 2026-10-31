// Capturas del recorrido del cuerpo único (fase 3): transición hero →
// craneoplastía, cada parada y el cierre, con y sin movimiento reducido, en
// 1440 × 900 y 390 × 844; cuenta de contextos WebGL y errores de consola.
// Uso: node docs/landing/cuerpo-unico/fase3/recorrido.mjs [--url U]
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = dirname(fileURLToPath(import.meta.url))
const PATCHRIGHT_DIR =
  process.env.PATCHRIGHT_DIR ??
  '/Users/brianrebagliati/.vscode/extensions/danielsanmedium.dscodegpt-3.24.79/standalone/'
const { chromium } = createRequire(PATCHRIGHT_DIR)('patchright')
const argv = process.argv.slice(2)
const URL = argv.includes('--url') ? argv[argv.indexOf('--url') + 1] : 'http://localhost:3400/'
const OUT = join(DIR, 'recorrido')
mkdirSync(OUT, { recursive: true })
const GPU = ['--use-angle=metal', '--ignore-gpu-blocklist']
const TAMS = { escritorio: [1440, 900], celular: [390, 844] }
const SEGS = [0.1, 0.2, 0.3, 0.35, 0.5, 1, 2, 3, 4, 5, 6, 7]
const informe = []

for (const [tam, [w, h]] of Object.entries(TAMS)) {
  for (const reducido of [false, true]) {
    const browser = await chromium.launch({ headless: true, channel: 'chrome', args: GPU })
    const page = await browser.newPage({
      viewport: { width: w, height: h },
      deviceScaleFactor: 1,
      reducedMotion: reducido ? 'reduce' : 'no-preference',
    })
    const errores = []
    page.on('console', (m) => m.type() === 'error' && errores.push(m.text()))
    page.on('pageerror', (e) => errores.push(String(e)))
    await page.goto(URL, { waitUntil: 'load' })
    await page.waitForSelector('.recorrido-escena[data-listo]', { timeout: 20000 })
    await page.waitForTimeout(4000)
    const contar = () =>
      page.evaluate(() => [...document.querySelectorAll('canvas')].filter((c) => {
        const r = c.getBoundingClientRect()
        return r.width > 0 && (c.getContext('webgl2') || c.getContext('webgl'))
      }).length)
    const contextosHero = await contar()
    for (const seg of SEGS) {
      await page.evaluate((s) => {
        const n = document.querySelector('.recorrido')
        const r = n.getBoundingClientRect()
        const top = r.top + window.scrollY
        window.scrollTo(0, top + (s / 7) * (r.height - window.innerHeight))
      }, seg)
      await page.waitForTimeout(seg === 1 ? 2500 : 1200)
      const nombre = `${tam}-${reducido ? 'reducido' : 'movimiento'}-seg-${String(seg).replace('.', '_')}`
      await page.screenshot({ path: join(OUT, `${nombre}.webp`), type: 'png' }).catch(async () => {
        await page.screenshot({ path: join(OUT, `${nombre}.png`) })
      })
    }
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
    await page.waitForTimeout(1500)
    const contextosPie = await contar()
    informe.push({ tam, reducido, contextosHero, contextosPie, errores })
    await browser.close()
  }
}
writeFileSync(join(OUT, 'informe.json'), JSON.stringify(informe, null, 2))
console.log(JSON.stringify(informe, null, 2))
