// Verificador: capturas del recorrido y de la página, base o cuerpo único
// node ver.mjs <modo> --url U --out DIR [--tam escritorio|celular] [--reducido]
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
const { chromium } = createRequire('/Users/brianrebagliati/.vscode/extensions/danielsanmedium.dscodegpt-3.24.79/standalone/')('patchright')
const sharp = createRequire('/Users/brianrebagliati/Documents/Work/Innercare/')('sharp')
const argv = process.argv.slice(2)
const modo = argv[0]
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d)
const flag = (n) => argv.includes(`--${n}`)
const URL = opt('url', 'http://localhost:3410/')
const OUT = opt('out', '.')
mkdirSync(OUT, { recursive: true })
const TAM = {
  escritorio: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 },
  celular: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
}
const tams = opt('tam') ? [opt('tam')] : Object.keys(TAM)
const GPU = ['--use-angle=metal', '--ignore-gpu-blocklist']
const SIN_WEBGL = ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis']
const informe = {}

async function abrir(tam, { reducido = false, args = GPU, js = true } = {}) {
  const browser = await chromium.launch({ headless: true, channel: 'chrome', args })
  const ctx = await browser.newContext({ ...TAM[tam], reducedMotion: reducido ? 'reduce' : 'no-preference', javaScriptEnabled: js })
  const page = await ctx.newPage()
  const consola = []
  page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) consola.push(`${m.type()}: ${m.text().slice(0, 300)}`) })
  page.on('pageerror', (e) => consola.push('pageerror: ' + String(e).slice(0, 300)))
  page.on('requestfailed', (r) => consola.push('requestfailed: ' + r.url()))
  return { browser, page, consola }
}
const guardar = async (page, nombre, o = {}) => {
  const png = await page.screenshot({ type: 'png', scale: flag('device') ? 'device' : 'css', ...o })
  await sharp(png).webp({ quality: 85 }).toFile(join(OUT, `${nombre}.webp`))
}
const irASeg = (page, s, sel = '.recorrido') => page.evaluate(([s, sel]) => {
  const r = document.querySelector(sel).getBoundingClientRect()
  window.scrollTo({ top: r.top + window.scrollY + (s / 7) * (r.height - window.innerHeight), behavior: 'instant' })
}, [s, sel])
const activo = (page) => page.evaluate(() => [...document.querySelectorAll('header [aria-current="location"]')].map((a) => a.textContent.trim()).join(',') || '-')

if (modo === 'transicion') {
  const SEGS = (opt('segs') ?? '0,0.1,0.2,0.3,0.35,0.5,0.7,0.85,1,1.3,1.4,1.5,1.6,1.7,1.8,1.9,2,3,4,5,6,7').split(',').map(Number)
  for (const tam of tams) for (const reducido of flag('reducido') ? [true] : flag('movimiento') ? [false] : [false, true]) {
    const { browser, page, consola } = await abrir(tam, { reducido })
    await page.goto(URL, { waitUntil: 'load' })
    await page.waitForFunction(() => document.querySelector('[data-intro="done"]'), null, { timeout: 30000 })
    await page.waitForTimeout(6000)
    const menu = {}
    for (const s of SEGS) {
      await irASeg(page, s)
      await page.waitForTimeout(s === 1 ? 2500 : 1500)
      menu[s] = await activo(page)
      await guardar(page, `${tam}-${reducido ? 'red' : 'mov'}-seg-${s.toFixed(2).replace('.', '_')}`)
    }
    informe[`${tam}-${reducido}`] = { menu, consola }
    await browser.close()
  }
}

if (modo === 'pagina') {
  // Secciones fuera del recorrido, menú, botones y panel de contacto
  for (const tam of tams) {
    const { browser, page, consola } = await abrir(tam, { reducido: flag('reducido') })
    await page.goto(URL, { waitUntil: 'load' })
    await page.waitForFunction(() => document.querySelector('[data-intro="done"]'), null, { timeout: 30000 })
    await page.waitForTimeout(3000)
    const r = { menu: {} }
    for (const id of ['proceso', 'fabricacion', 'habilitaciones', 'sedes', 'contacto']) {
      const ok = await page.evaluate((id) => { const e = document.getElementById(id); if (!e) return false; window.scrollTo({ top: e.getBoundingClientRect().top + scrollY, behavior: 'instant' }); return true }, id)
      if (!ok) { r.menu[id] = 'NO EXISTE'; continue }
      await page.waitForTimeout(id === 'fabricacion' ? 9000 : 2500)
      r.menu[id] = await activo(page)
      await guardar(page, `${tam}-sec-${id}`)
      if (id === 'proceso') {
        // a mitad del proceso
        await page.evaluate(() => scrollBy({ top: innerHeight * 1.5, behavior: 'instant' }))
        await page.waitForTimeout(1500)
        await guardar(page, `${tam}-sec-proceso-mitad`)
      }
    }
    await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }))
    await page.waitForTimeout(1500)
    await guardar(page, `${tam}-sec-pie`)
    // "Recorrer los implantes" desde arriba
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
    await page.waitForTimeout(1500)
    await page.click('a[href$="#recorrido"]:visible >> nth=0').catch((e) => (r.clickRecorrer = String(e).slice(0, 100)))
    await page.waitForTimeout(3000)
    r.recorrerSeg = await page.evaluate(() => { const c = document.querySelector('.recorrido'); const b = c.getBoundingClientRect(); return { scrollY, seg: +((-b.top / (b.height - innerHeight)) * 7).toFixed(3), hash: location.hash } })
    r.menuTrasRecorrer = await activo(page)
    await guardar(page, `${tam}-tras-recorrer`)
    // Menú: cada enlace de la barra
    if (tam === 'escritorio') {
      for (const t of ['Cómo trabajamos', 'Fabricación', 'Habilitaciones', 'Implantes']) {
        await page.click(`header a:has-text("${t}") >> nth=0`).catch((e) => (r['click-' + t] = String(e).slice(0, 80)))
        await page.waitForTimeout(2500)
        r['menu-' + t] = { activo: await activo(page), y: await page.evaluate(() => scrollY), hash: await page.evaluate(() => location.hash) }
      }
    }
    // "Plantear un caso" del hero abre el panel
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
    await page.waitForTimeout(1200)
    await page.click('main a:has-text("Plantear un caso") >> nth=0').catch((e) => (r.clickCaso = String(e).slice(0, 100)))
    await page.waitForTimeout(2500)
    r.panel = await page.evaluate(() => ({ url: location.pathname + location.search, dialogo: !!document.querySelector('dialog[open]') }))
    await guardar(page, `${tam}-panel-contacto`)
    await page.keyboard.press('Escape')
    await page.waitForTimeout(1500)
    r.trasCerrar = await page.evaluate(() => ({ url: location.pathname + location.search, dialogo: !!document.querySelector('dialog[open]'), scrollY }))
    r.consola = consola
    informe[tam] = r
    await browser.close()
  }
}

if (modo === 'sinjs') {
  for (const tam of tams) {
    const { browser, page, consola } = await abrir(tam, { js: false })
    await page.goto(URL, { waitUntil: 'load' })
    // forzar la carga de imágenes diferidas: recorrer la página
    const alto = await page.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < alto; y += 600) { await page.evaluate((y) => scrollTo(0, y), y); await page.waitForTimeout(120) }
    await page.waitForTimeout(1500)
    await page.evaluate(() => scrollTo(0, 0))
    await guardar(page, `${tam}-sinjs-pagina`, { fullPage: true })
    informe[tam] = {
      alto,
      imagenes: await page.evaluate(() => [...document.querySelectorAll('img')].map((i) => ({ src: (i.currentSrc || i.src).split('/').pop().slice(0, 80), completa: i.complete, w: i.naturalWidth, vis: i.getBoundingClientRect().width > 0 && getComputedStyle(i).visibility !== 'hidden' && +getComputedStyle(i).opacity > 0.05, op: getComputedStyle(i).opacity, loading: i.loading })).filter((i) => i.w === 0 || !i.vis)),
      ocultos: await page.evaluate(() => [...document.querySelectorAll('main h1, main h2, main h3, main p, main a, main li')].filter((n) => { const s = getComputedStyle(n); const r = n.getBoundingClientRect(); return s.visibility === 'hidden' || +s.opacity < 0.05 || r.height === 0 }).map((n) => n.textContent.trim().slice(0, 50))),
      consola,
    }
    await browser.close()
  }
}

if (modo === 'sinwebgl') {
  for (const tam of tams) {
    const { browser, page, consola } = await abrir(tam, { args: SIN_WEBGL })
    await page.goto(URL, { waitUntil: 'load' })
    await page.waitForFunction(() => document.querySelector('[data-intro="done"]'), null, { timeout: 30000 }).catch(() => {})
    await page.waitForTimeout(1500)
    await guardar(page, `${tam}-sinwebgl-seg-0`)
    for (const s of [1, 2, 3, 4, 5, 6, 7]) {
      await irASeg(page, s)
      await page.waitForTimeout(1500)
      await guardar(page, `${tam}-sinwebgl-seg-${s}`)
    }
    informe[tam] = { consola }
    await browser.close()
  }
}
writeFileSync(join(OUT, `informe-${modo}${opt('tam') ? '-' + opt('tam') : ''}.json`), JSON.stringify(informe, null, 1))
console.log(JSON.stringify(informe, null, 1))
