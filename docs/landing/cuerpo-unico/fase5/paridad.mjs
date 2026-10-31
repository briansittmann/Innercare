// Capturas de paridad para la limpieza: toma hero (tras la llegada del resto),
// seg 1 y seg 4, 1440x900 y 390x844 (DPR 1), con y sin movimiento reducido.
// node paridad.mjs <out> [url]
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const { chromium } = createRequire('/Users/brianrebagliati/.vscode/extensions/danielsanmedium.dscodegpt-3.24.79/standalone/')('patchright')
const OUT = process.argv[2]
const URL = process.argv[3] ?? 'http://localhost:3400/'
mkdirSync(OUT, { recursive: true })
const GPU = ['--use-angle=metal', '--ignore-gpu-blocklist']
const TAMS = { escritorio: [1440, 900], celular: [390, 844] }
const informe = []
const irASeg = (page, s) =>
  page.evaluate((s) => {
    const r = document.querySelector('.recorrido').getBoundingClientRect()
    window.scrollTo(0, r.top + window.scrollY + (s / 7) * (r.height - window.innerHeight))
  }, s)
const contar = (page) =>
  page.evaluate(() => [...document.querySelectorAll('canvas')].filter((c) => {
    const r = c.getBoundingClientRect()
    return r.width > 0 && (c.getContext('webgl2') || c.getContext('webgl'))
  }).length)
for (const [tam, [w, h]] of Object.entries(TAMS)) {
  for (const reducido of [true, false]) {
    const browser = await chromium.launch({ headless: true, channel: 'chrome', args: GPU })
    const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, reducedMotion: reducido ? 'reduce' : 'no-preference' })
    const errores = []
    page.on('console', (m) => ['error', 'warning'].includes(m.type()) && errores.push(m.text().slice(0, 200)))
    page.on('pageerror', (e) => errores.push(String(e)))
    await page.goto(URL, { waitUntil: 'load' })
    await page.waitForSelector('.recorrido-escena[data-listo]', { timeout: 20000 })
    await page.waitForFunction(() => document.querySelector('[data-intro="done"]'), null, { timeout: 20000 })
    await page.waitForTimeout(6000)
    const pre = `${tam}-${reducido ? 'reducido' : 'movimiento'}`
    await page.screenshot({ path: join(OUT, `${pre}-hero.png`) })
    const contextos = await contar(page)
    for (const seg of [1, 4]) {
      await irASeg(page, seg)
      await page.waitForTimeout(2500)
      await page.screenshot({ path: join(OUT, `${pre}-seg-${seg}.png`) })
    }
    informe.push({ tam, reducido, contextos, errores })
    await browser.close()
  }
}
writeFileSync(join(OUT, 'informe.json'), JSON.stringify(informe, null, 2))
console.log(JSON.stringify(informe))
