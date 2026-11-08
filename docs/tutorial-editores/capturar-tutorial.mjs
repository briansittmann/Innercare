// Capturas del tutorial para los editores (docs/tutorial-editores/).
//
//   node docs/tutorial-editores/capturar-tutorial.mjs [--url http://localhost:3200] [--solo 04-tablero,07-escribir]
//
// Lee ESCENAS-INNERCARE.md (tipo, pantalla y rótulo de cada paso) y saca las
// capturas de los pasos de tipo `captura` y `antes-despues` en capturas/, más
// capturas/escenas.json con las cajas en píxeles de la imagen (cursor y
// resaltado) para el video. Las tarjetas van al JSON sin archivos.
//
// De dónde sale cada cosa:
//   - El panel, del modo local de Keystatic sobre `next dev` (--url): sin
//     inicio de sesión y sin commits. Guardar escribe content/datos/hero.json;
//     el script lo devuelve a su contenido original al terminar, falle o no.
//   - La pantalla de inicio de sesión (02 y 03), de producción sin sesión.
//   - La web (09 y 10), del mismo `next dev`, con la bajada de ejemplo.
//
// Navegador: el Chrome del sistema por patchright (memoria del proyecto,
// headless-qa-patchright). Panel y web en escritorio a 1440 × 810 a 2x (16:9,
// como el video); el celular a 402 × 870 a 3x, con agente de Safari como las
// capturas para el cliente.
import { createRequire } from 'node:module'
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const { chromium } = createRequire(
  '/Users/brianrebagliati/.vscode/extensions/danielsanmedium.dscodegpt-3.24.81/standalone/node_modules/',
)('patchright')

const aqui = dirname(fileURLToPath(import.meta.url))
const raiz = join(aqui, '..', '..')
const argv = process.argv.slice(2)
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d)

const LOCAL = opt('url', 'http://localhost:3200').replace(/\/$/, '')
const PRODUCCION = 'https://innercare-web.vercel.app'
const SOLO = opt('solo')?.split(',')
const OUT = join(aqui, 'capturas')
mkdirSync(OUT, { recursive: true })

const HERO_JSON = join(raiz, 'content/datos/hero.json')
const TEXTO_EJEMPLO =
  'Implantes ortopédicos modulares y a medida del paciente, fabricados en titanio en nuestra planta.'
// Más de 100 caracteres (LIMITES.heroBajada): el panel no guarda. Nunca se publica.
const TEXTO_LARGO =
  'Implantes ortopédicos modulares y a medida del paciente, fabricados en titanio en planta propia, para cirujanos y hospitales de todo el país.'

const UA_SAFARI_MAC =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Safari/605.1.15'
const UA_SAFARI_IPHONE =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'

const TAM = {
  panel: { viewport: { width: 1440, height: 810 }, deviceScaleFactor: 2, locale: 'es-AR' },
  escritorio: { viewport: { width: 1440, height: 810 }, deviceScaleFactor: 2, locale: 'es-AR', userAgent: UA_SAFARI_MAC },
  celular: {
    viewport: { width: 402, height: 870 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
    locale: 'es-AR',
    userAgent: UA_SAFARI_IPHONE,
  },
}

// --- Escenas ---------------------------------------------------------------

function leerEscenas() {
  const md = readFileSync(join(aqui, 'ESCENAS-INNERCARE.md'), 'utf8')
  const bloques = md.split(/^### /m).slice(1)
  return bloques.map((b) => {
    const [id, ...lineas] = b.split('\n')
    const campo = (n) => lineas.find((l) => l.startsWith(`- ${n}: `))?.slice(n.length + 4).trim()
    const pantalla = campo('Pantalla') ?? ''
    const tipo = pantalla.split('.')[0].trim()
    return {
      id: id.trim(),
      tipo,
      pantalla: pantalla.slice(tipo.length + 1).trim(),
      rotulo: campo('Rótulo') ?? null,
      textoEjemplo: campo('Texto de ejemplo') ?? null,
    }
  })
}

// --- Utilidades ------------------------------------------------------------

const ocultarDev = (page) =>
  page.addStyleTag({ content: 'nextjs-portal{display:none!important}' }).catch(() => {})

// Caja de un localizador en píxeles de la imagen
// Caja de un localizador en píxeles de la imagen; `margen` en px de CSS
// (los resaltados llevan aire para que el recuadro no pise el texto)
async function caja(loc, densidad, margen = 0) {
  await loc.waitFor({ state: 'visible', timeout: 30000 })
  const b = await loc.boundingBox()
  if (!b) throw new Error('Sin caja para ' + loc)
  return escalar(b, densidad, margen)
}
function escalar(b, densidad, margen = 0) {
  const r = (v) => Math.round(v * densidad)
  return { x: r(b.x - margen), y: r(b.y - margen), w: r(b.width + margen * 2), h: r(b.height + margen * 2) }
}

// Caja del texto visible que empieza con `inicio`: el panel repite las ayudas
// en un nodo oculto para lectores de pantalla, que getByText encuentra primero
async function cajaTexto(page, inicio, densidad, margen = 0) {
  const b = await page.evaluate((inicio) => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT)
    let mejor = null
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (!n.textContent.trim().startsWith(inicio)) continue
      const r = document.createRange()
      r.selectNodeContents(n)
      const c = r.getBoundingClientRect()
      if (!mejor || c.height > mejor.height) mejor = { x: c.x, y: c.y, width: c.width, height: c.height }
    }
    return mejor
  }, inicio)
  if (!b || b.height < 4) throw new Error('Sin caja visible para el texto ' + inicio)
  return escalar(b, densidad, margen)
}
const centro = (c, clic) => ({ x: Math.round(c.x + c.w / 2), y: Math.round(c.y + c.h / 2), clic })

async function sacar(page, nombre, { conFoco = false } = {}) {
  await page.mouse.move(0, 0)
  if (!conFoco) await page.evaluate(() => document.activeElement?.blur?.())
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
  await page.screenshot({ path: join(OUT, nombre) })
  return nombre
}

async function abrirPanel(ctx, ruta) {
  const page = await ctx.newPage()
  await page.goto(LOCAL + ruta, { waitUntil: 'networkidle', timeout: 120000 })
  await ocultarDev(page)
  await page.getByRole('link', { name: 'Hero', exact: true }).first().waitFor({ state: 'visible', timeout: 60000 })
  await page.waitForTimeout(800)
  return page
}

const campoBajada = (page) => page.getByRole('textbox', { name: /^Bajada/ })

// Espera a que la home haya terminado la carga y la entrada, y a las fuentes
async function abrirHome(ctx) {
  const page = await ctx.newPage()
  await page.goto(LOCAL + '/', { waitUntil: 'load', timeout: 180000 })
  await ocultarDev(page)
  await page.waitForFunction(
    () => !document.querySelector('.pantalla-carga') && document.querySelector('[data-intro="done"]'),
    null,
    { timeout: 180000 },
  )
  const fuentes = await page.evaluate(async () => {
    await document.fonts.ready
    return document.fonts.check('500 40px "Hanken Grotesk"') && document.fonts.check('16px "Source Sans 3"')
  })
  if (!fuentes) throw new Error('La home no cargó las fuentes de la marca')
  await page.waitForTimeout(1500)
  return page
}

// --- Pasos -----------------------------------------------------------------

const PASOS = {
  async '02-direccion'({ navegador }) {
    const ctx = await navegador.newContext(TAM.panel)
    const page = await ctx.newPage()
    await page.goto(PRODUCCION + '/keystatic', { waitUntil: 'networkidle', timeout: 120000 })
    const boton = page.getByRole('button', { name: /Log in with Keystatic Cloud/ })
    const c = await caja(boton, 2)
    const archivo = await sacar(page, 'login.png')
    await ctx.close()
    // La barra del navegador la dibuja el video: va la dirección, sin caja
    return {
      '02-direccion': { archivos: { captura: archivo }, barraNavegador: PRODUCCION.replace('https://', '') + '/keystatic' },
      '03-iniciar-sesion': { archivos: { captura: archivo }, cursor: centro(c, true) },
    }
  },

  async '04-tablero'({ ctxPanel }) {
    const page = await abrirPanel(ctxPanel, '/keystatic')
    const menu = page.getByRole('navigation').first()
    const resaltado = await caja(menu, 2)
    const grupos = []
    for (const g of ['Portada', 'Secciones', 'Sitio']) {
      grupos.push(centro(await caja(menu.getByText(g, { exact: true }), 2), false))
    }
    const hero = centro(await caja(menu.getByRole('link', { name: 'Hero', exact: true }), 2), true)
    const archivo = await sacar(page, 'tablero.png')
    await page.close()
    return {
      '04-tablero': { archivos: { captura: archivo }, resaltado, cursor: { ...grupos[2], recorrido: grupos } },
      '05-abrir-seccion': { archivos: { captura: archivo }, cursor: hero },
    }
  },

  async '06-ayuda'({ ctxPanel }) {
    const page = await abrirPanel(ctxPanel, '/keystatic/singleton/hero')
    const resaltado = await cajaTexto(page, 'Debajo del titular.', 2, 6)
    const archivo = await sacar(page, 'hero.png')
    await page.close()
    return { '06-ayuda': { archivos: { captura: archivo }, resaltado } }
  },

  // 07 y 08, y el guardado real que alimenta 09 y 10
  async '07-escribir'({ ctxPanel }) {
    const page = await abrirPanel(ctxPanel, '/keystatic/singleton/hero')
    const campo = campoBajada(page)
    const cajaCampo = await caja(campo, 2)
    const resaltadoCampo = await caja(campo, 2, 6)
    const antes = await sacar(page, 'escribir-antes.png')
    await campo.fill(TEXTO_EJEMPLO)
    const despues = await sacar(page, 'escribir-despues.png')
    const save = page.getByRole('button', { name: 'Save', exact: true })
    const cajaSave = await caja(save, 2)
    const guardar = await sacar(page, 'guardar.png')
    await save.click()
    // Espera a que el panel escriba el archivo
    const limite = Date.now() + 30000
    while (!readFileSync(HERO_JSON, 'utf8').includes(TEXTO_EJEMPLO)) {
      if (Date.now() > limite) throw new Error('El panel no guardó hero.json')
      await page.waitForTimeout(300)
    }
    await page.close()
    return {
      '07-escribir': {
        archivos: { antes, despues },
        cursor: centro(cajaCampo, true),
        resaltado: resaltadoCampo,
        campo: cajaCampo,
        caracteres: TEXTO_EJEMPLO.length,
      },
      '08-guardar': { archivos: { captura: guardar }, cursor: centro(cajaSave, true) },
    }
  },

  async '09-publicado'({ navegador }) {
    const salida = {}
    for (const [id, tam, densidad, nombre] of [
      ['09-publicado', TAM.escritorio, 2, 'web-escritorio.png'],
      ['10-celular', TAM.celular, 3, 'web-celular.png'],
    ]) {
      const ctx = await navegador.newContext(tam)
      const page = await abrirHome(ctx)
      const bajada = page.getByText(TEXTO_EJEMPLO, { exact: true }).first()
      const resaltado = await caja(bajada, densidad, 12)
      salida[id] = { archivos: { captura: await sacar(page, nombre) }, resaltado }
      await ctx.close()
    }
    return salida
  },

  async '11-limite'({ ctxPanel }) {
    const page = await abrirPanel(ctxPanel, '/keystatic/singleton/hero')
    const original = readFileSync(HERO_JSON, 'utf8')
    await campoBajada(page).fill(TEXTO_LARGO)
    await page.getByRole('button', { name: 'Save', exact: true }).click()
    const error = page.getByText(/must be no longer than/).first()
    const resaltado = await caja(error, 2, 8)
    const archivo = await sacar(page, 'limite.png')
    await page.waitForTimeout(1500)
    if (readFileSync(HERO_JSON, 'utf8') !== original) throw new Error('El texto largo se guardó')
    await page.close()
    return { '11-limite': { archivos: { captura: archivo }, resaltado } }
  },

  async '13-lista'({ ctxPanel }) {
    const page = await abrirPanel(ctxPanel, '/keystatic/singleton/habilitaciones')
    const agregar = page.getByRole('button', { name: 'Agregar', exact: true })
    const cursor = centro(await caja(agregar, 2), false)
    const lista = await sacar(page, 'habilitaciones.png')
    // 14: una fila abierta, sin cambiarla
    const fila = page.getByText('Importación y fabricación de productos médicos', { exact: true }).first()
    const cursorFila = centro(await caja(fila, 2), true)
    await fila.click()
    const dialogo = page.getByRole('dialog')
    await dialogo.waitFor({ state: 'visible', timeout: 15000 })
    await page.waitForTimeout(600)
    const campo = dialogo.getByRole('textbox', { name: /^Disposición o número/ })
    const resaltado = await caja(campo, 2, 6)
    // El foco en el campo resaltado, no en el identificador (que no se toca)
    await campo.focus()
    await page.waitForTimeout(300)
    const abierta = await sacar(page, 'fila.png', { conFoco: true })
    await page.keyboard.press('Escape')
    await page.close()
    return {
      '13-lista': { archivos: { captura: lista }, cursor, siguienteClic: cursorFila },
      '14-elemento': { archivos: { captura: abierta }, resaltado },
    }
  },

  async '15-archivos'({ ctxPanel }) {
    const page = await abrirPanel(ctxPanel, '/keystatic/singleton/fichas')
    const etiqueta = page.getByText('Fémur proximal: ficha técnica', { exact: true })
    const cajaEtiqueta = await caja(etiqueta, 2)
    const boton = page.getByRole('button', { name: 'Choose file' }).nth(4)
    const cajaBoton = await caja(boton, 2)
    const descarga = await caja(page.getByRole('button', { name: 'Download' }), 2)
    // El bloque del campo: de la etiqueta al final de sus botones
    const resaltado = {
      x: cajaEtiqueta.x - 16,
      y: cajaEtiqueta.y - 12,
      w: descarga.x + descarga.w - cajaEtiqueta.x + 32,
      h: cajaBoton.y + cajaBoton.h - cajaEtiqueta.y + 24,
    }
    const archivo = await sacar(page, 'fichas.png')
    await page.close()
    return { '15-archivos': { archivos: { captura: archivo }, cursor: centro(cajaBoton, false), resaltado } }
  },
}

// --- Corrida ---------------------------------------------------------------

const escenas = leerEscenas()
const original = readFileSync(HERO_JSON, 'utf8')
// Sin barras de scroll: con scrollbar-gutter estable dejaban una franja a la derecha
const navegador = await chromium.launch({ channel: 'chrome', headless: true, args: ['--hide-scrollbars'] })
const ctxPanel = await navegador.newContext(TAM.panel)
const resultados = {}
let fallo = null
try {
  // En orden: 09 necesita el guardado de 07; 11 corre con hero.json restaurado
  for (const [clave, paso] of Object.entries(PASOS)) {
    if (clave === '11-limite') writeFileSync(HERO_JSON, original)
    if (SOLO && !SOLO.some((s) => s === clave || (clave === '07-escribir' && s.startsWith('09')))) continue
    console.log('·', clave)
    Object.assign(resultados, await paso({ navegador, ctxPanel }))
  }
} catch (e) {
  fallo = e
} finally {
  writeFileSync(HERO_JSON, original)
  await navegador.close()
}

const tamDe = { 'web-celular.png': [1206, 2610] }
const salida = escenas.map((e) => {
  const r = resultados[e.id] ?? {}
  const algunArchivo = r.archivos && Object.values(r.archivos)[0]
  return {
    ...e,
    ...r,
    ...(algunArchivo ? { tam: tamDe[algunArchivo] ?? [2880, 1620] } : {}),
    ...(e.tipo !== 'tarjeta' && !r.archivos ? { falta: true } : {}),
  }
})
// Con --solo, se suma a lo que ya había
const rutaJson = join(OUT, 'escenas.json')
let previo = []
try {
  previo = JSON.parse(readFileSync(rutaJson, 'utf8'))
} catch {}
const final = salida.map((e) => (e.falta && previo.find((p) => p.id === e.id && !p.falta)) || e)
writeFileSync(rutaJson, JSON.stringify(final, null, 2) + '\n')

const faltan = final.filter((e) => e.falta).map((e) => e.id)
console.log(faltan.length ? 'Faltan: ' + faltan.join(', ') : 'Todas las escenas listas')
if (readFileSync(HERO_JSON, 'utf8') !== original) console.error('hero.json NO quedó como estaba')
if (fallo) {
  console.error(fallo)
  process.exit(1)
}
