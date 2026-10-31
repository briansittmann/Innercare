import { createRequire } from 'node:module'
const { chromium } = createRequire('/Users/brianrebagliati/.vscode/extensions/danielsanmedium.dscodegpt-3.24.79/standalone/')('patchright')
const URL = process.argv[2] ?? 'http://localhost:3410/'
const variantes = (process.argv[3] ?? 'normal,sinfibras,sinminis,ambos').split(',')
const medir = (page, desde, hasta, ms) => page.evaluate(({ desde, hasta, ms }) => new Promise((res) => {
  const d = []; let last = performance.now(); const t0 = last
  const step = (now) => { d.push(now - last); last = now; const p = Math.min(1, (now - t0) / ms); scrollTo({ top: desde + (hasta - desde) * p, behavior: 'instant' }); if (p < 1) requestAnimationFrame(step); else { d.shift(); const s = [...d].sort((a, b) => a - b); res({ fps: +(1000 / (d.reduce((a, b) => a + b, 0) / d.length)).toFixed(1), p95: +s[Math.floor(s.length * 0.95)].toFixed(1), lentos: +(d.filter((x) => x > 20).length / d.length * 100).toFixed(0) }) } }
  requestAnimationFrame(step)
}), { desde, hasta, ms })
for (let vuelta = 1; vuelta <= 2; vuelta++) for (const v of variantes) {
  const browser = await chromium.launch({ headless: true, channel: 'chrome', args: ['--use-angle=metal', '--ignore-gpu-blocklist'] })
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 2 })
  await page.goto(URL, { waitUntil: 'load' })
  await page.waitForFunction(() => document.querySelector('[data-intro="done"]'), null, { timeout: 30000 })
  const geo = await page.evaluate(() => { const c = document.querySelector('.recorrido'); const top = c.getBoundingClientRect().top + scrollY; return { top, span: c.offsetHeight - innerHeight } })
  await page.evaluate((t) => scrollTo(0, t + 10), geo.top); await page.waitForTimeout(5000)
  if (v === 'sinfibras' || v === 'ambos') await page.evaluate(() => { const c = document.querySelector('.recorrido-fondo-hero canvas') ?? document.querySelector('.pointer-events-none.absolute.inset-0 canvas'); const gl = c?.getContext('webgl2'); gl?.getExtension('WEBGL_lose_context')?.loseContext(); c?.remove() })
  if (v === 'sinminis' || v === 'ambos') await page.addStyleTag({ content: '[data-miniatura-3d]{display:none!important}' })
  if (v === 'parado') { await page.evaluate((t) => scrollTo(0, t), geo.top + geo.span * 3 / 7); await page.waitForTimeout(1500); console.log(vuelta, v, JSON.stringify(await page.evaluate(() => new Promise((r) => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else r(n / 3) }; f() })))); await browser.close(); continue }
  const ida = await medir(page, geo.top, geo.top + geo.span, 12000)
  console.log(vuelta, v, JSON.stringify(ida))
  await browser.close()
}
