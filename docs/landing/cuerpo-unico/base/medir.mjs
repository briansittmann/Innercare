// Capturas y mediciones del hero para la compuerta de paridad del cuerpo
// único (docs/landing/cuerpo-unico/base/MEDICIONES.md explica el método).
//
// Uso (con un build de producción servido, p. ej. `npx next start -p 3400`):
//   node docs/landing/cuerpo-unico/base/medir.mjs capturas [--url U] [--out DIR] [--tam escritorio|celular]
//   node docs/landing/cuerpo-unico/base/medir.mjs respaldo [--url U] [--out DIR] [--tam ...]
//   node docs/landing/cuerpo-unico/base/medir.mjs medidas  [--url U] [--out DIR] [--tam ...] [--sin-tope] [--vuelta N]
//   node docs/landing/cuerpo-unico/base/medir.mjs encuadre [--url U] [--out DIR]  (caja del 3D, foco y tramo)
//   node docs/landing/cuerpo-unico/base/medir.mjs resumen  [--out DIR]   (tabla de medidas/*.json)
//
// Opciones para el prototipo, si cambia el DOM:
//   --listo SEL      elemento que aparece cuando el 3D del hero ya se ve
//                    (hoy: el fundido del canvas de Hero3D en opacity-100)
//   --recorrido SEL  contenedor alto del recorrido (hoy: .recorrido)
//   --hero SEL       sección del hero, para la captura de su borde inferior
//                    en el celular (hoy: #inicio)
//   --primera N      tramo (seg) de la primera parada (hoy: 1 de 7)
//   --tramos N       tramos del recorrido (hoy: 7)
//
// patchright (fork de Playwright) sale de la extensión CodeGPT de VS Code;
// otra ruta con PATCHRIGHT_DIR. Chrome del sistema con la GPU del M1.

import { createRequire } from 'node:module'
import os from 'node:os'
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const PATCHRIGHT_DIR =
  process.env.PATCHRIGHT_DIR ??
  '/Users/brianrebagliati/.vscode/extensions/danielsanmedium.dscodegpt-3.24.79/standalone/'
const { chromium } = createRequire(PATCHRIGHT_DIR)('patchright')

const argv = process.argv.slice(2)
const modo = argv[0]
const opt = (name, def) => {
  const i = argv.indexOf(`--${name}`)
  return i >= 0 ? argv[i + 1] : def
}
const flag = (name) => argv.includes(`--${name}`)

const URL_BASE = opt('url', 'http://localhost:3400/')
const OUT = opt('out', dirname(fileURLToPath(import.meta.url)))
const LISTO = opt('listo', '[role="img"] > div.duration-700.opacity-100')
const RECORRIDO = opt('recorrido', '.recorrido')
const HERO = opt('hero', '#inicio')
const PRIMERA = Number(opt('primera', '1'))
const TRAMOS = Number(opt('tramos', '7'))
const VUELTA = opt('vuelta', '1')

const TAMANOS = {
  escritorio: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2, isMobile: false, hasTouch: false },
  celular: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
}
const tamanos = opt('tam') ? [opt('tam')] : Object.keys(TAMANOS)

const GPU = ['--use-angle=metal', '--ignore-gpu-blocklist']
const SIN_TOPE = ['--disable-gpu-vsync', '--disable-frame-rate-limit']
const SIN_WEBGL = ['--disable-webgl', '--disable-webgl2', '--disable-3d-apis']

// Sonda que corre en el mundo de la página desde el primer byte del HTML
// (patchright no corre addInitScript en localhost, y page.evaluate vive en un
// mundo aislado: todo se comparte por el DOM). Anota en <html> los tiempos
// (data-sonda-running, -done, -listo) y lleva la cuenta de los contextos
// WebGL: creación, primer dibujo y dibujos. Un evento 'sonda' escribe el
// estado de los contextos en data-sonda-gl.
const sonda = (listo) => `<script>(() => {
  const html = document.documentElement
  const marcar = (k) => { if (!html.hasAttribute('data-sonda-' + k)) html.setAttribute('data-sonda-' + k, performance.now().toFixed(1)) }
  const gl = []
  const porCtx = new WeakMap()
  const getContext = HTMLCanvasElement.prototype.getContext
  HTMLCanvasElement.prototype.getContext = function (tipo, ...resto) {
    const ctx = getContext.call(this, tipo, ...resto)
    if (ctx && /webgl/.test(tipo) && !porCtx.has(ctx)) {
      const e = { ctx, canvas: this, tipo, creado: performance.now(), primerDibujo: null, dibujos: 0 }
      porCtx.set(ctx, e)
      gl.push(e)
    }
    return ctx
  }
  for (const C of [window.WebGLRenderingContext, window.WebGL2RenderingContext]) {
    if (!C) continue
    for (const m of ['drawArrays', 'drawElements', 'drawArraysInstanced', 'drawElementsInstanced', 'drawRangeElements']) {
      const f = C.prototype[m]
      if (!f) continue
      C.prototype[m] = function (...a) {
        const e = porCtx.get(this)
        if (e) { e.dibujos++; if (e.primerDibujo === null) e.primerDibujo = performance.now() }
        return f.apply(this, a)
      }
    }
  }
  document.addEventListener('sonda', () => {
    html.setAttribute('data-sonda-gl', JSON.stringify(gl.map((e, i) => ({
      i, tipo: e.tipo,
      vivo: !e.ctx.isContextLost(),
      enDom: e.canvas.isConnected,
      tam: e.canvas.width + 'x' + e.canvas.height,
      dentroDe: e.canvas.isConnected ? (e.canvas.parentElement?.parentElement?.className || '').toString().slice(0, 50) : null,
      creado: +e.creado.toFixed(0),
      primerDibujo: e.primerDibujo === null ? null : +e.primerDibujo.toFixed(0),
      dibujos: e.dibujos,
    }))))
  })
  const revisar = () => {
    if (document.querySelector('[data-intro="running"]')) marcar('running')
    if (document.querySelector('[data-intro="done"]')) marcar('done')
    if (document.querySelector(${JSON.stringify(listo)})) marcar('listo')
  }
  new MutationObserver(revisar).observe(html, { subtree: true, childList: true, attributes: true, attributeFilter: ['data-intro', 'class'] })
})()</script>`

async function abrir({ tam, reducido = false, args = [], query = '' }) {
  const browser = await chromium.launch({ headless: true, channel: 'chrome', args: [...GPU, ...args] })
  const context = await browser.newContext({
    ...TAMANOS[tam],
    reducedMotion: reducido ? 'reduce' : 'no-preference',
  })
  const page = await context.newPage()
  const errores = []
  page.on('pageerror', (e) => errores.push(String(e)))
  page.on('console', (m) => { if (m.type() === 'error') errores.push(m.text()) })
  await page.route(
    (u) => new URL(u).pathname === '/',
    async (route) => {
      if (route.request().resourceType() !== 'document') return route.continue()
      const resp = await route.fetch()
      const body = (await resp.text()).replace('<head>', `<head>${sonda(LISTO)}`)
      await route.fulfill({ response: resp, body })
    },
  )
  await page.goto(URL_BASE + query, { waitUntil: 'commit' })
  return { browser, page, errores }
}

const attr = (page, k) =>
  page.evaluate((k) => {
    const v = document.documentElement.getAttribute('data-sonda-' + k)
    return v === null ? null : Number(v)
  }, k)

async function esperarAttr(page, k, ms = 20000) {
  await page.waitForFunction((k) => document.documentElement.hasAttribute('data-sonda-' + k), k, {
    polling: 'raf',
    timeout: ms,
  })
  return attr(page, k)
}

const esperarHasta = (page, t) =>
  page.evaluate(
    (t) => new Promise((r) => { const f = () => (performance.now() >= t ? r() : requestAnimationFrame(f)); f() }),
    t,
  )

const ahora = (page) => page.evaluate(() => performance.now())

async function contextos(page) {
  return page.evaluate(() => {
    document.dispatchEvent(new Event('sonda'))
    return JSON.parse(document.documentElement.getAttribute('data-sonda-gl') ?? '[]')
  })
}

// ¿Se ve el 3D o la imagen de respaldo? El <img> del respaldo pasa a
// opacity 0 al terminar el fundido del canvas.
const estado3D = (page, listo) =>
  page.evaluate((listo) => {
    const img = document.querySelector('#inicio picture img')
    return {
      canvasVisible: Boolean(document.querySelector(listo)),
      respaldoOpacidad: img ? Number(getComputedStyle(img).opacity) : null,
    }
  }, listo)

function aWebp(png, destino, calidad = 80) {
  const tmp = destino.replace(/\.webp$/, '.tmp.png')
  writeFileSync(tmp, png)
  execFileSync('cwebp', ['-quiet', '-q', String(calidad), '-m', '6', tmp, '-o', destino])
  rmSync(tmp)
}

async function capturar(page, nombre, ref, registro, { completa = false } = {}) {
  const antes = await ahora(page)
  const png = await page.screenshot({ type: 'png', scale: completa ? 'device' : 'css' })
  const despues = await ahora(page)
  const estado = await estado3D(page, LISTO)
  aWebp(png, join(OUT, 'capturas', `${nombre}.webp`), completa ? 85 : 80)
  registro.push({
    nombre,
    desde: ref.nombre,
    msDesde: [+(antes - ref.t).toFixed(0), +(despues - ref.t).toFixed(0)],
    ...estado,
  })
  console.log(nombre, registro.at(-1).msDesde, estado)
}

async function capturas() {
  mkdirSync(join(OUT, 'capturas'), { recursive: true })
  const registro = []
  for (const tam of tamanos) {
    for (const reducido of [false, true]) {
      const mov = reducido ? 'reducido' : 'movimiento'
      const { browser, page, errores } = await abrir({ tam, reducido })
      const running = await esperarAttr(page, 'running')
      const r = { nombre: 'running', t: running }
      await capturar(page, `${tam}-${mov}-intro-0000`, r, registro)
      await esperarHasta(page, running + 2000)
      await capturar(page, `${tam}-${mov}-intro-2000`, r, registro)
      const done = await esperarAttr(page, 'done')
      const d = { nombre: 'done', t: done }
      await capturar(page, `${tam}-${mov}-intro-fin`, d, registro)
      for (const s of [0, 5, 11, 16]) {
        await esperarHasta(page, done + s * 1000 + (s === 0 ? 300 : 0))
        await capturar(page, `${tam}-${mov}-vaiven-${String(s).padStart(2, '0')}`, d, registro)
      }
      if (reducido) await capturar(page, `${tam}-reducido-detalle`, d, registro, { completa: true })
      // En el celular el busto queda casi entero debajo de la primera
      // pantalla: otra captura con el borde inferior del hero al pie.
      if (TAMANOS[tam].isMobile) {
        await page.evaluate((sel) => {
          const r = document.querySelector(sel).getBoundingClientRect()
          scrollTo({ top: r.bottom + scrollY - innerHeight, behavior: 'instant' })
        }, HERO)
        await page.waitForTimeout(600)
        await capturar(page, `${tam}-${mov}-hero-abajo`, d, registro)
      }
      registro.push({ nombre: `${tam}-${mov}`, running, done, listo: await attr(page, 'listo'), errores })
      await browser.close()
    }
  }
  writeFileSync(join(OUT, 'capturas.json'), JSON.stringify(registro, null, 1))
}

async function respaldo() {
  mkdirSync(join(OUT, 'capturas'), { recursive: true })
  const registro = []
  for (const tam of tamanos) {
    const { browser, page, errores } = await abrir({ tam, args: SIN_WEBGL })
    const done = await esperarAttr(page, 'done')
    await esperarHasta(page, done + 1000)
    await capturar(page, `${tam}-respaldo-sin-webgl`, { nombre: 'done', t: done }, registro)
    registro.push({ tam, running: await attr(page, 'running'), done, contextos: await contextos(page), errores })
    await browser.close()
  }
  writeFileSync(join(OUT, 'respaldo.json'), JSON.stringify(registro, null, 1))
}

// Cuadros por segundo a partir de requestAnimationFrame: promedio y
// percentiles del tiempo entre cuadros. Con `desde`/`hasta`, hace scroll
// lineal de una posición a otra en `ms`.
const medirCuadros = (page, { ms, desde = null, hasta = null }) =>
  page.evaluate(
    ({ ms, desde, hasta }) =>
      new Promise((res) => {
        const d = []
        let last = performance.now()
        const t0 = last
        const step = (now) => {
          d.push(now - last)
          last = now
          const p = Math.min(1, (now - t0) / ms)
          if (desde !== null) scrollTo({ top: desde + (hasta - desde) * p, behavior: 'instant' })
          if (p < 1) requestAnimationFrame(step)
          else {
            d.shift()
            const s = [...d].sort((a, b) => a - b)
            const avg = d.reduce((a, b) => a + b, 0) / d.length
            res({
              cuadros: d.length,
              fps: +(1000 / avg).toFixed(1),
              p50: +s[Math.floor(s.length / 2)].toFixed(1),
              p95: +s[Math.floor(s.length * 0.95)].toFixed(1),
              max: +s[s.length - 1].toFixed(1),
            })
          }
        }
        requestAnimationFrame(step)
      }),
    { ms, desde, hasta },
  )

const modelos = (page) =>
  page.evaluate(() =>
    performance
      .getEntriesByType('resource')
      .filter((e) => e.name.includes('/modelos/'))
      .map((e) => ({
        archivo: e.name.split('/').pop(),
        transferidos: e.transferSize,
        sinComprimir: e.decodedBodySize,
        pedido: +e.startTime.toFixed(0),
        fin: +e.responseEnd.toFixed(0),
      })),
  )

async function medidas() {
  const sinTope = flag('sin-tope')
  const resultados = []
  for (const tam of tamanos) {
    const { browser, page, errores } = await abrir({ tam, args: sinTope ? SIN_TOPE : [] })
    // Carga de la máquina al empezar (la medición es ruidosa si hay otras
    // apps usando la GPU: comparar solo corridas con carga parecida)
    const r = { tam, tope: !sinTope, vuelta: VUELTA, cargaMaquina: os.loadavg().map((v) => +v.toFixed(2)) }
    r.running = await esperarAttr(page, 'running')
    r.done = await esperarAttr(page, 'done')
    r.listo = await attr(page, 'listo')
    r.modelosHero = await modelos(page)
    r.contextosHero = await contextos(page)
    await esperarHasta(page, r.done + 1000)
    r.heroQuieto = await medirCuadros(page, { ms: 6000 })

    // El recorrido se carga cuando terminó la intro y asoma: se lo precarga y
    // se vuelve arriba, como en las fases anteriores.
    const geo = await page.evaluate((sel) => {
      const c = document.querySelector(sel)
      const top = c.getBoundingClientRect().top + scrollY
      return { top, span: c.offsetHeight - innerHeight, vh: innerHeight }
    }, RECORRIDO)
    await page.evaluate((top) => scrollTo({ top: top + 10, behavior: 'instant' }), geo.top)
    r.recorridoListo = await page
      .waitForFunction(() => Boolean(document.querySelector('[data-listo]')), null, { timeout: 15000 })
      .then(() => true, () => false)
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
    await page.waitForTimeout(1500)
    r.paso30vh = await medirCuadros(page, { ms: 4000, desde: 0, hasta: geo.vh * 0.3 })
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
    await page.waitForTimeout(1000)
    const primera = geo.top + (geo.span * PRIMERA) / TRAMOS
    r.pasoPrimeraParada = await medirCuadros(page, { ms: 5000, desde: 0, hasta: primera })
    await page.evaluate((top) => scrollTo({ top, behavior: 'instant' }), geo.top)
    await page.waitForTimeout(800)
    r.recorrido = await medirCuadros(page, { ms: 12000, desde: geo.top, hasta: geo.top + geo.span })

    // Resto de la página, hasta el pie
    const fin = await page.evaluate(() => document.documentElement.scrollHeight - innerHeight)
    await medirCuadros(page, { ms: 6000, desde: geo.top + geo.span, hasta: fin })
    await page.waitForTimeout(1500)
    r.contextosPie = await contextos(page)
    // Quién sigue dibujando al pie: dibujos por contexto en 2 s
    await page.waitForTimeout(2000)
    const despues = await contextos(page)
    r.dibujosPie2s = despues.map((c) => c.dibujos - (r.contextosPie.find((x) => x.i === c.i)?.dibujos ?? 0))
    r.modelosTodos = await modelos(page)
    r.errores = errores
    await browser.close()

    // Hero quieto con el vidrio fijo en calidad media (memoria del proyecto)
    if (sinTope) {
      const b = await abrir({ tam, args: SIN_TOPE, query: '?calidad=media' })
      const done = await esperarAttr(b.page, 'done')
      await esperarHasta(b.page, done + 1000)
      r.heroQuietoCalidadMedia = await medirCuadros(b.page, { ms: 6000 })
      await b.browser.close()
    }
    console.log(JSON.stringify(r))
    resultados.push(r)
  }
  mkdirSync(join(OUT, 'medidas'), { recursive: true })
  writeFileSync(
    join(OUT, 'medidas', `medidas-${sinTope ? 'sin-tope' : 'con-tope'}-${VUELTA}.json`),
    JSON.stringify(resultados, null, 1),
  )
}

// Tabla compacta de todos los medidas/*.json
async function resumen() {
  const { readdirSync, readFileSync } = await import('node:fs')
  const dir = join(OUT, 'medidas')
  const f = (m) => (m ? `${m.fps} (p95 ${m.p95})` : '-')
  for (const archivo of readdirSync(dir).filter((n) => n.endsWith('.json')).sort()) {
    for (const r of JSON.parse(readFileSync(join(dir, archivo), 'utf8'))) {
      const enDom = (cs) => cs.filter((c) => c.vivo && c.enDom).length
      const sueltos = (cs) => cs.filter((c) => c.vivo && !c.enDom).length
      console.log(
        [
          r.tam, r.tope ? 'con tope' : 'sin tope', `vuelta ${r.vuelta}`,
          `running ${(r.running / 1000).toFixed(2)} s`, `listo ${(r.listo / 1000).toFixed(2)} s`,
          `hero ${f(r.heroQuieto)}`, `hero calidad media ${f(r.heroQuietoCalidadMedia)}`,
          `paso 30vh ${f(r.paso30vh)}`, `paso a la 1.ª parada ${f(r.pasoPrimeraParada)}`,
          `recorrido ${f(r.recorrido)}`,
          `contextos hero ${enDom(r.contextosHero)} en el DOM + ${sueltos(r.contextosHero)} sueltos`,
          `pie ${enDom(r.contextosPie)} + ${sueltos(r.contextosPie)}`,
          `dibujos al pie en 2 s ${JSON.stringify(r.dibujosPie2s ?? null)}`,
          `errores ${r.errores.length}`,
        ].join(' | '),
      )
    }
  }
}

// Encuadre del hero en el DOM: alto de la sección, caja del canvas, foco y
// tramo del degradé que queda detrás (lo que mide hero-3d.tsx)
async function encuadre() {
  const filas = []
  for (const tam of tamanos) {
    const { browser, page } = await abrir({ tam, reducido: true })
    const done = await esperarAttr(page, 'done')
    await esperarHasta(page, done + 500)
    filas.push({
      tam,
      ...(await page.evaluate((sel) => {
        const sec = document.querySelector(sel)
        const caja = document.querySelector(sel + ' [role="img"]')
        const canvas = caja?.querySelector('canvas')
        const r = caja.getBoundingClientRect()
        const s = sec.getBoundingClientRect()
        return {
          seccion: { alto: s.height, ancho: s.width, top: s.top + scrollY },
          caja3d: { x: r.x, y: r.y, ancho: r.width, alto: r.height },
          foco: getComputedStyle(caja).getPropertyValue('--hero-3d-foco').trim(),
          tramo: [caja.offsetTop / sec.offsetHeight, (caja.offsetTop + caja.offsetHeight) / sec.offsetHeight].map((v) => +v.toFixed(4)),
          canvasPx: canvas ? `${canvas.width}x${canvas.height}` : null,
          dpr: devicePixelRatio,
        }
      }, HERO)),
    })
    await browser.close()
  }
  console.log(JSON.stringify(filas, null, 1))
  writeFileSync(join(OUT, 'encuadre.json'), JSON.stringify(filas, null, 1))
}

if (modo === 'resumen') await resumen()
else if (modo === 'encuadre') await encuadre()
else if (modo === 'capturas') await capturas()
else if (modo === 'respaldo') await respaldo()
else if (modo === 'medidas') await medidas()
else {
  console.error('modo: capturas | respaldo | medidas')
  process.exit(1)
}
