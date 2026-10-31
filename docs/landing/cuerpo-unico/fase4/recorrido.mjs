// Comprobaciones del cuerpo único (fase 4), con un build de producción servido:
// - transición hero → craneoplastía y craneoplastía → maxilar (fundido del
//   hueso entero al recortado con su implante), con y sin movimiento reducido,
//   en 1440 × 900 y 390 × 844
// - contextos WebGL vivos en el hero y al pie, y errores de consola
// - punto activo del menú (aria-current) en el hero y durante el recorrido
// - "Recorrer los implantes": a qué seg baja
// - la toma hero antes y después de que lleguen cuerpo-resto.glb e
//   implantes-recorrido.glb (diferencia media)
// - la página sin JS y sin WebGL
// Uso: node docs/landing/cuerpo-unico/fase4/recorrido.mjs [--url U] [--solo recorrido|extras]
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIR = dirname(fileURLToPath(import.meta.url))
const PATCHRIGHT_DIR =
  process.env.PATCHRIGHT_DIR ??
  '/Users/brianrebagliati/.vscode/extensions/danielsanmedium.dscodegpt-3.24.79/standalone/'
const { chromium } = createRequire(PATCHRIGHT_DIR)('patchright')
const sharp = createRequire(join(DIR, '../../../../'))('sharp')
const argv = process.argv.slice(2)
const arg = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d)
const URL = arg('url', 'http://localhost:3400/')
const SOLO = arg('solo', '')
const OUT = join(DIR, 'recorrido')
mkdirSync(OUT, { recursive: true })
const GPU = ['--use-angle=metal', '--ignore-gpu-blocklist']
const TAMS = { escritorio: [1440, 900], celular: [390, 844] }
const SEGS = [0.1, 0.2, 0.35, 1, 1.3, 1.45, 1.55, 1.65, 1.78, 2, 3, 7]
const informe = { recorrido: [], extras: {} }

const guardar = async (page, nombre, opciones = {}) => {
  const png = await page.screenshot({ type: 'png', ...opciones })
  await sharp(png).webp({ quality: 82 }).toFile(join(OUT, `${nombre}.webp`))
  return png
}
const irASeg = (page, s) =>
  page.evaluate((s) => {
    const r = document.querySelector('.recorrido').getBoundingClientRect()
    window.scrollTo(0, r.top + window.scrollY + (s / 7) * (r.height - window.innerHeight))
  }, s)
const segActual = (page) =>
  page.evaluate(() => {
    const r = document.querySelector('.recorrido').getBoundingClientRect()
    return (-r.top / (r.height - window.innerHeight)) * 7
  })
const contar = (page) =>
  page.evaluate(() => [...document.querySelectorAll('canvas')].filter((c) => {
    const r = c.getBoundingClientRect()
    return r.width > 0 && (c.getContext('webgl2') || c.getContext('webgl'))
  }).length)
const activo = (page) =>
  page.evaluate(() => [...document.querySelectorAll('header [aria-current="location"]')].map((a) => a.textContent.trim()).join(',') || '-')
const diferencia = async (a, b) => {
  const [x, y] = await Promise.all([a, b].map((p) => sharp(p).raw().toBuffer()))
  let t = 0
  for (let i = 0; i < x.length; i++) t += Math.abs(x[i] - y[i])
  return +(t / x.length).toFixed(2)
}

if (SOLO !== 'extras') {
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
      await page.waitForFunction(() => document.querySelector('[data-intro="done"]'), null, { timeout: 20000 })
      // Toma hero apenas termina la intro y después de que llega el resto
      const antes = await page.screenshot({ type: 'png' })
      await page.waitForTimeout(6000)
      const despues = await guardar(page, `${tam}-${reducido ? 'reducido' : 'movimiento'}-hero-con-resto`)
      const llegadaResto = await diferencia(antes, despues)
      const contextosHero = await contar(page)
      const menu = { hero: await activo(page) }
      for (const seg of SEGS) {
        await irASeg(page, seg)
        await page.waitForTimeout(seg === 1 ? 2500 : 1200)
        if (seg === 0.35 || seg === 1 || seg === 3) menu[seg] = await activo(page)
        await guardar(page, `${tam}-${reducido ? 'reducido' : 'movimiento'}-seg-${String(seg).replace('.', '_')}`)
      }
      // "Recorrer los implantes" desde arriba
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(800)
      await page.click('a[href$="#recorrido"]:visible >> nth=0').catch(() => {})
      await page.waitForTimeout(2500)
      const segBoton = +(await segActual(page)).toFixed(3)
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
      await page.waitForTimeout(1500)
      const contextosPie = await contar(page)
      informe.recorrido.push({ tam, reducido, contextosHero, contextosPie, llegadaResto, menu, segBoton, errores })
      await browser.close()
    }
  }
}

if (SOLO !== 'recorrido') {
  for (const [tam, [w, h]] of Object.entries(TAMS)) {
    // Sin JS: la página entera, y qué queda oculto
    let browser = await chromium.launch({ headless: true, channel: 'chrome', args: GPU })
    let page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, javaScriptEnabled: false })
    await page.goto(URL, { waitUntil: 'load' })
    await page.waitForTimeout(1000)
    const recorte = await page.evaluate(() => {
      const e = document.querySelector('.recorrido')
      return { y: e.getBoundingClientRect().top + window.scrollY, alto: e.getBoundingClientRect().height }
    })
    await guardar(page, `${tam}-sin-js`, { fullPage: true, clip: { x: 0, y: 0, width: w, height: Math.min(recorte.y + recorte.alto, 16000) } })
    const ocultos = await page.evaluate(() => [...document.querySelectorAll('.recorrido h1, .recorrido h2, .recorrido h3, .recorrido p, .recorrido a')].filter((n) => {
      const s = getComputedStyle(n)
      const r = n.getBoundingClientRect()
      return s.visibility === 'hidden' || +s.opacity < 0.05 || r.height === 0
    }).map((n) => n.textContent.trim().slice(0, 40)))
    informe.extras[`${tam}-sin-js`] = { ocultos }
    await browser.close()
    // Sin WebGL: la captura del busto en la toma hero y la vista de una parada
    browser = await chromium.launch({ headless: true, channel: 'chrome', args: ['--disable-webgl', '--disable-3d-apis'] })
    page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 })
    const errores = []
    page.on('pageerror', (e) => errores.push(String(e)))
    await page.goto(URL, { waitUntil: 'load' })
    await page.waitForTimeout(5000)
    await guardar(page, `${tam}-sin-webgl-hero`)
    await irASeg(page, 2)
    await page.waitForTimeout(1500)
    await guardar(page, `${tam}-sin-webgl-maxilar`)
    informe.extras[`${tam}-sin-webgl`] = { contextos: await contar(page), errores }
    await browser.close()
  }
}

writeFileSync(join(OUT, `informe${SOLO ? '-' + SOLO : ''}.json`), JSON.stringify(informe, null, 2))
console.log(JSON.stringify(informe, null, 2))
