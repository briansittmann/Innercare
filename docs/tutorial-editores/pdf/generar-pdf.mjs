// Genera un PDF desde una página HTML de hojas A4 fijas (`.hoja`, con `.pie`).
// Lo usan el tutorial de los editores (tutorial.html, tanda 2 de
// PROMPT-CAPTURAS.md) y el onboarding de Innercare (docs/onboarding/).
//
//   node docs/tutorial-editores/pdf/generar-pdf.mjs                 # el tutorial
//   node docs/tutorial-editores/pdf/generar-pdf.mjs <html> <pdf>    # otro documento
//
// El tutorial necesita las capturas de la tanda 1 en ../capturas/; los dos,
// conexión para las fuentes de Google Fonts. Las salidas van a carpetas
// `salida/`, que no se versionan. Antes de escribir el PDF comprueba que ninguna
// hoja se pase de su alto ni pise el pie y que carguen todas las imágenes y
// fuentes; después, que tenga una página por hoja, cuánto pesa y qué enlaces
// lleva.
import { createRequire } from 'node:module'
import { mkdirSync, readFileSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const { chromium } = createRequire(
  '/Users/brianrebagliati/.vscode/extensions/danielsanmedium.dscodegpt-3.24.81/standalone/node_modules/',
)('patchright')

const aqui = dirname(fileURLToPath(import.meta.url))
const [argHtml, argPdf] = process.argv.slice(2)
const html = argHtml ? resolve(argHtml) : join(aqui, 'tutorial.html')
const destino = argPdf ? resolve(argPdf) : join(aqui, '..', 'salida', 'Innercare - Cómo editar la web.pdf')
mkdirSync(dirname(destino), { recursive: true })

const navegador = await chromium.launch({ channel: 'chrome', headless: true })
let fallas = 0
try {
  const pagina = await navegador.newPage({ viewport: { width: 794, height: 1123 } })
  await pagina.goto(pathToFileURL(html).href, { waitUntil: 'networkidle' })
  await pagina.evaluate(() => document.fonts.ready)
  await pagina.emulateMedia({ media: 'print' })

  const revision = await pagina.evaluate(() => {
    const problemas = []
    for (const img of document.images) {
      if (!img.complete || img.naturalWidth === 0) problemas.push(`no cargó ${img.getAttribute('src')}`)
    }
    const fuentes = ['500 12px "Hanken Grotesk"', '400 12px "Source Sans 3"'].filter((f) => !document.fonts.check(f))
    if (fuentes.length) problemas.push(`fuentes sin cargar: ${fuentes.join(', ')}`)
    const libres = []
    const hojas = [...document.querySelectorAll('.hoja')]
    hojas.forEach((h, i) => {
      const caja = h.getBoundingClientRect()
      const pie = h.querySelector('.pie')
      const limite = pie ? pie.getBoundingClientRect().top - 2 : caja.bottom - 18 * 3.78
      let fondo = 0
      for (const hijo of h.children) {
        if (hijo === pie) continue
        fondo = Math.max(fondo, hijo.getBoundingClientRect().bottom)
      }
      const libre = Math.round((limite - fondo) / 3.78)
      if (fondo > limite) problemas.push(`hoja ${i + 1}: se pasa ${Math.ceil((fondo - limite) / 3.78)} mm`)
      else libres.push(libre)
    })
    return { problemas, hojas: hojas.length, libres }
  })
  console.log(`mm libres por hoja: ${revision.libres.join(' · ')}`)
  for (const p of revision.problemas) console.error(`  ✗ ${p}`)
  fallas += revision.problemas.length

  await pagina.pdf({ path: destino, printBackground: true, preferCSSPageSize: true })

  const crudo = readFileSync(destino).toString('latin1')
  const paginas = (crudo.match(/\/Type\s*\/Page(?![s\w])/g) ?? []).length
  const enlaces = [...crudo.matchAll(/\/URI\s*\(([^)]*)\)/g)].map((m) => m[1])
  const internos = (crudo.match(/\/Subtype\s*\/Link/g) ?? []).length - enlaces.length
  const mb = statSync(destino).size / 1024 / 1024
  console.log(`\n${destino}`)
  console.log(`${paginas} páginas (hojas: ${revision.hojas}), ${mb.toFixed(2)} MB`)
  console.log(`${enlaces.length} enlaces externos, ${internos} internos`)
  for (const u of [...new Set(enlaces)].sort()) console.log(`  ${u}`)
  if (paginas !== revision.hojas) { console.error('  ✗ una hoja ocupa más de una página'); fallas++ }
  if (mb >= 10) { console.error('  ✗ pesa 10 MB o más: no viaja bien por WhatsApp'); fallas++ }
} finally {
  await navegador.close()
}
process.exit(fallas ? 1 : 0)
