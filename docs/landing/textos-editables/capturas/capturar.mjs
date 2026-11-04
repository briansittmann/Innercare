// Capturas de referencia de la landing para comparar antes y después de
// pasar los textos al CMS (docs/landing/textos-editables/).
//
//   node docs/landing/textos-editables/capturas/capturar.mjs \
//     [--url http://localhost:3100] [--out <carpeta>] [--prefijo base] \
//     [--tam escritorio|celular] [--solo hero,parada-craneo,...] [--sin-texto]
//
// Sin --out, escribe en capturas/base/ (al lado de este archivo); el prefijo
// por defecto es el nombre de la carpeta de salida ("base" → base-hero-...).
// Contra el servidor de producción (`npm run build` y `npm run start -- -p
// 3100`), no contra `next dev`: las fuentes y el CSS son los del build.
//
// Qué saca:
//   - <prefijo>-<vista>-<escritorio|celular>.png: escritorio 1440 × 900 a 1x y
//     celular 390 × 844 a 2x. Vistas: hero, las seis paradas del recorrido
//     (#parada-<id>), el cierre del recorrido, proceso, fabricacion,
//     habilitaciones, sedes, contacto (#contacto, con la tarjeta armada),
//     footer y contacto-pagina (/contacto entera, página completa).
//   - <prefijo>-texto-<ruta>.txt: document.body.innerText de /, /contacto y la
//     ficha del fémur, con el JS apagado (el HTML del servidor, entero y en
//     orden: con JS, lo que la escena todavía no mostró queda fuera de
//     innerText y el resultado depende del momento).
//
// Navegador: Google Chrome del sistema sin interfaz, por patchright (no se
// instalan navegadores; ver la memoria del proyecto, headless-qa-patchright).
// Sin movimiento reducido: son capturas de referencia de cómo se ve.
import { createRequire } from 'node:module'
import { mkdirSync, writeFileSync } from 'node:fs'
import { basename, dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const { chromium } = createRequire(
  '/Users/brianrebagliati/.vscode/extensions/danielsanmedium.dscodegpt-3.24.81/standalone/node_modules/',
)('patchright')

const aqui = dirname(fileURLToPath(import.meta.url))
const argv = process.argv.slice(2)
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d)
const flag = (n) => argv.includes(`--${n}`)

const URL_BASE = opt('url', 'http://localhost:3100').replace(/\/$/, '')
const OUT = opt('out', join(aqui, 'base'))
const PREFIJO = opt('prefijo', basename(OUT))
const SOLO = opt('solo')?.split(',')
mkdirSync(OUT, { recursive: true })

const TAM = {
  escritorio: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  celular: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}
const tams = opt('tam') ? [opt('tam')] : Object.keys(TAM)
const GPU = ['--use-angle=metal', '--ignore-gpu-blocklist']
const PARADAS = ['craneo', 'maxilar', 'hombro', 'acetabulo', 'femur', 'intercalar']

// Espera a que la pantalla de carga se haya ido y la entrada de la home haya
// terminado, y a las fuentes
async function esperarHome(page) {
  await page.waitForFunction(
    () => !document.querySelector('.pantalla-carga') && document.querySelector('[data-intro="done"]'),
    null,
    { timeout: 60000 },
  )
  return page.evaluate(async () => {
    await document.fonts.ready
    return {
      hanken: document.fonts.check('500 40px "Hanken Grotesk"'),
      sourceSans: document.fonts.check('16px "Source Sans 3"'),
      cargadas: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family),
    }
  })
}

const ocultarDev = (page) => page.addStyleTag({ content: 'nextjs-portal{display:none!important}' })

// Dos cuadros, para que el scroll se pinte
const dosCuadros = (page) =>
  page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))

async function irA(page, como) {
  await page.evaluate((como) => {
    if (como.tipo === 'arriba') window.scrollTo({ top: 0, behavior: 'instant' })
    else if (como.tipo === 'fondo')
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
    else if (como.tipo === 'cierre') {
      // El final del recorrido: seg 7, con el cierre quieto
      const c = document.querySelector('.recorrido')
      const r = c.getBoundingClientRect()
      window.scrollTo({ top: r.top + window.scrollY + r.height - window.innerHeight, behavior: 'instant' })
    } else document.getElementById(como.id)?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, como)
  await dosCuadros(page)
}

const VISTAS = [
  { nombre: 'hero', como: { tipo: 'arriba' }, espera: 1500 },
  ...PARADAS.map((id) => ({ nombre: `parada-${id}`, como: { id: `parada-${id}` }, espera: 3000 })),
  { nombre: 'cierre', como: { tipo: 'cierre' }, espera: 3500 },
  { nombre: 'proceso', como: { id: 'proceso' }, espera: 4000 },
  { nombre: 'fabricacion', como: { id: 'fabricacion' }, espera: 9000 },
  { nombre: 'habilitaciones', como: { id: 'habilitaciones' }, espera: 4000 },
  { nombre: 'sedes', como: { id: 'sedes' }, espera: 6000 },
  { nombre: 'contacto', como: { id: 'contacto' }, espera: 3500 },
  { nombre: 'footer', como: { tipo: 'fondo' }, espera: 2000 },
]

const informe = { url: URL_BASE, fecha: new Date().toISOString(), tamanos: {} }
const browser = await chromium.launch({ headless: true, channel: 'chrome', args: GPU })

for (const tam of tams) {
  const ctx = await browser.newContext({ ...TAM[tam], reducedMotion: 'no-preference' })
  const page = await ctx.newPage()
  const errores = []
  page.on('pageerror', (e) => errores.push(String(e).slice(0, 200)))
  await page.goto(`${URL_BASE}/`, { waitUntil: 'load' })
  const fuentes = await esperarHome(page)
  await ocultarDev(page)
  await page.waitForTimeout(1500)
  const hechas = []
  for (const v of VISTAS) {
    if (SOLO && !SOLO.includes(v.nombre)) continue
    await irA(page, v.como)
    await page.waitForTimeout(v.espera)
    const archivo = join(OUT, `${PREFIJO}-${v.nombre}-${tam}.png`)
    await page.screenshot({ path: archivo, type: 'png' })
    hechas.push(archivo)
  }
  // /contacto entera (la página, no el panel)
  if (!SOLO || SOLO.includes('contacto-pagina')) {
    await page.goto(`${URL_BASE}/contacto`, { waitUntil: 'load' })
    await ocultarDev(page)
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(2000)
    const archivo = join(OUT, `${PREFIJO}-contacto-pagina-${tam}.png`)
    await page.screenshot({ path: archivo, type: 'png', fullPage: true })
    hechas.push(archivo)
  }
  informe.tamanos[tam] = { fuentes, capturas: hechas, errores }
  await ctx.close()
}

// Texto visible de cada ruta, con el HTML del servidor (JS apagado)
if (!flag('sin-texto')) {
  const ctx = await browser.newContext({ ...TAM.escritorio, javaScriptEnabled: false })
  const page = await ctx.newPage()
  const rutas = {
    inicio: '/',
    contacto: '/contacto',
    'productos-endoprotesis-modular-femur-customizable': '/productos/endoprotesis-modular-femur-customizable',
  }
  informe.textos = []
  for (const [nombre, ruta] of Object.entries(rutas)) {
    await page.goto(`${URL_BASE}${ruta}`, { waitUntil: 'load' })
    const texto = await page.evaluate(() => document.body.innerText)
    const archivo = join(OUT, `${PREFIJO}-texto-${nombre}.txt`)
    writeFileSync(archivo, texto.endsWith('\n') ? texto : `${texto}\n`)
    informe.textos.push(archivo)
  }
  await ctx.close()
}

await browser.close()
writeFileSync(join(OUT, `${PREFIJO}-informe.json`), JSON.stringify(informe, null, 2))
console.log(JSON.stringify(informe, null, 2))
