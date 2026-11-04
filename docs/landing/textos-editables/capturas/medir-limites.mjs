// Mide el largo máximo (en caracteres) que admite cada texto editable de la
// landing sin romper el diseño actual (docs/landing/textos-editables/
// LIMITES.md).
//
//   node docs/landing/textos-editables/capturas/medir-limites.mjs \
//     [--url http://localhost:3100] [--out <archivo.json>] \
//     [--tam escritorio|celular] [--solo id1,id2] [--semillas 6]
//
// Contra `next start` (el build), no contra `next dev`. Sin --out escribe
// capturas/limites.json al lado de este archivo.
//
// Método: en la página servida, con movimiento reducido (nada a mitad de
// una animación), se reemplaza el texto del nodo por textos de prueba cada
// vez más largos (palabras en español de largo realista: promedio de unas 6
// letras, con alguna de 12 a 14) y, después de cada cambio, se fuerza el
// layout y se comprueban las reglas del texto: que no sume líneas respecto
// de hoy (o respecto del hermano más largo, o de un tope fijo), que no se
// salga de su caja, que no se superponga con otro elemento y que no empuje
// algo medido (el pie del texto del hero, la columna del logo, el alto de la
// tarjeta…). El máximo es el último largo que pasa todas las reglas, y se
// toma el menor entre varias secuencias de palabras (semillas), porque el
// corte de línea depende de qué palabras caen al final. Los textos partidos
// en letras (FoldText, el botón de vidrio) o en palabras (Distribución, el
// titular del contacto) se rearman con la misma estructura de spans.
// Al terminar cada medición se devuelven los nodos originales (los mismos
// objetos del DOM, para no romper a React).
import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const { chromium } = createRequire(
  '/Users/brianrebagliati/.vscode/extensions/danielsanmedium.dscodegpt-3.24.81/standalone/node_modules/',
)('patchright')

const aqui = dirname(fileURLToPath(import.meta.url))
const argv = process.argv.slice(2)
const opt = (n, d) => (argv.includes(`--${n}`) ? argv[argv.indexOf(`--${n}`) + 1] : d)
const URL_BASE = opt('url', 'http://localhost:3100').replace(/\/$/, '')
const OUT = opt('out', join(aqui, 'limites.json'))
const SOLO = opt('solo')?.split(',')
const N_SEMILLAS = Number(opt('semillas', 6))

const TAM = {
  escritorio: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  celular: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
}
const tams = opt('tam') ? [opt('tam')] : Object.keys(TAM)

// ---------------------------------------------------------------------------
// Textos de prueba
// ---------------------------------------------------------------------------

// Palabras del rubro, en tres grupos. Con las probabilidades de abajo, el
// promedio queda en unas 6 letras por palabra.
const CORTAS = ['de', 'la', 'en', 'y', 'con', 'los', 'del', 'por', 'para', 'una', 'que', 'el', 'las', 'al', 'su', 'sin', 'cada', 'más']
const MEDIAS = [
  'implante', 'titanio', 'paciente', 'pieza', 'diseño', 'equipo', 'cirugía', 'hueso', 'fémur', 'medida', 'modular',
  'planta', 'estudio', 'caso', 'sistema', 'prótesis', 'cadera', 'hombro', 'cráneo', 'maxilar', 'guías', 'tornillo',
  'cuerpo', 'vástago', 'cabeza', 'médico', 'clínica', 'hospital', 'fabricamos', 'diseñamos', 'tomografía', 'segmento',
  'resección', 'anclaje', 'estructura', 'material', 'técnica', 'nacional', 'productos', 'calidad', 'servicio', 'modelo',
  'virtual', 'proceso', 'sucursal', 'provincia', 'porosa', 'superficie', 'compras', 'consulta', 'entrega', 'tamaño',
]
const LARGAS = [
  'planificación', 'biocompatible', 'reconstrucción', 'trazabilidad', 'segmentación', 'endoprótesis', 'quirúrgica',
  'craneoplastía', 'customizable', 'habilitación', 'distribuidora', 'espaciadores', 'intercalares', 'mecanizado',
]
// Para valores técnicos (specs, referencias): cifras, unidades y siglas
const TECNICAS = [
  'Ti-6Al-4V', 'mm', '12', '160', '×', 'Ø10', 'titanio', 'trabecular', 'modular', '135°', 'a', 'y', 'cono', 'morse',
  '12-14', 'Disposición', '0999/17', 'N°', 'GLN', 'PMMA', 'CNC', 'impresión', '3D', 'poroso', '40', '60', 'Cr-Co',
  'Biolox', 'vástago', 'cuerpo', '7798276610001', 'quirúrgica', 'virtual',
]

function prng(semilla) {
  let s = semilla * 2654435761 >>> 0
  return () => {
    s = (s + 0x6d2b79f5) >>> 0
    let t = s
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function palabras(semilla, n, corpus) {
  const azar = prng(semilla)
  const elegir = (lista) => lista[Math.floor(azar() * lista.length)]
  const out = []
  for (let i = 0; i < n; i++) {
    if (corpus === 'tecnico') out.push(elegir(TECNICAS))
    else {
      const x = azar()
      // La primera palabra nunca es un artículo suelto
      out.push(x < 0.3 && i > 0 ? elegir(CORTAS) : x < 0.9 ? elegir(MEDIAS) : elegir(LARGAS))
    }
  }
  return out
}

// Da a la secuencia la forma del texto original: mayúscula inicial, punto
// final, signos de pregunta
function formatear(ps, original) {
  let t = ps.join(' ')
  const o = original.trim()
  if (/^[A-ZÁÉÍÓÚÑ¿]/.test(o)) t = t.charAt(0).toUpperCase() + t.slice(1)
  if (o.startsWith('¿')) t = `¿${t.charAt(0).toUpperCase()}${t.slice(1)}?`
  else if (o.endsWith('.')) t += '.'
  return t
}

// Candidatos de largo creciente sobre la misma secuencia de palabras: uno por
// cada largo L (fina[L]), con las palabras enteras que entran y, si sobra
// lugar, el comienzo de la siguiente; y los largos donde termina una palabra
// (gruesa), para la primera pasada
function candidatos(semilla, original, corpus, tope) {
  const ps = palabras(semilla, 400, corpus)
  const extra = formatear(['x'], original).length - 1
  const fina = []
  const gruesa = []
  let k = 0
  let crudo = ''
  for (let L = 1; L <= tope; L++) {
    const util = L - extra
    if (util < 1) continue
    while (k < ps.length && (crudo ? crudo.length + 1 : 0) + ps[k].length <= util) {
      crudo = crudo ? `${crudo} ${ps[k]}` : ps[k]
      k++
      gruesa.push(formatear([crudo], original).length)
    }
    let t = crudo
    const resto = util - crudo.length
    if (!crudo) t = ps[k].slice(0, util)
    else if (resto >= 2) t = `${crudo} ${ps[k].slice(0, resto - 1)}`
    else if (resto === 1) continue
    const f = formatear([t], original)
    if (f.length === L) fina[L] = f
  }
  return { fina, gruesa: [...new Set(gruesa)].filter((L) => fina[L]) }
}

// Promedio de letras por palabra de la secuencia general (para el informe)
const muestra = palabras(1, 5000, 'general')
const PROMEDIO_LETRAS = muestra.reduce((a, p) => a + p.length, 0) / muestra.length

// ---------------------------------------------------------------------------
// Lo que corre en la página
// ---------------------------------------------------------------------------

function enPagina({ item, series }) {
  const Q = (s) => document.querySelector(s)
  const QA = (s) => [...document.querySelectorAll(s)]
  const R = (e) => (e ? e.getBoundingClientRect() : null)
  const W = innerWidth
  const H = innerHeight

  // Líneas de un conjunto de rectángulos: se agrupan por el centro vertical
  function lineasDe(rects) {
    const rs = rects.filter((r) => r.width > 0.5 && r.height > 0.5).sort((a, b) => a.top + a.height / 2 - (b.top + b.height / 2))
    let n = 0
    let ultimo = -Infinity
    for (const r of rs) {
      const c = r.top + r.height / 2
      if (c - ultimo > r.height * 0.5) {
        n++
        ultimo = c
      }
    }
    return n
  }
  // Líneas del contenido de un elemento
  function L(el) {
    if (!el) return 0
    const rg = document.createRange()
    rg.selectNodeContents(el)
    return lineasDe([...rg.getClientRects()])
  }
  const ev = (expr) => new Function('Q', 'QA', 'R', 'W', 'H', 'L', `return (${expr})`)(Q, QA, R, W, H, L)
  const lista = (x) => (Array.isArray(x) ? x : x ? [x] : [])

  // --- Preparación de los nodos según cómo se renderiza el texto ---
  // (antes, la preparación propia del ítem: mostrar algo oculto, etc.)
  try {
    if (item.prep) ev(`(() => { ${item.prep} })()`)
  } catch (e) {
    return { error: `prep: ${String(e).slice(0, 200)}` }
  }
  const objetivos = []
  for (const obj of item.objetivos) {
    const els = lista(ev(obj.sel)).filter(Boolean)
    if (!els.length) return { error: `sin nodo: ${obj.sel}` }
    for (const el of els) {
      const originales = [...el.childNodes]
      const o = { el, modo: obj.modo ?? 'texto', originales }
      if (o.modo === 'texto') {
        const textos = originales.filter((n) => n.nodeType === 3 && n.data.trim())
        if (!textos.length) return { error: `sin texto directo: ${obj.sel}` }
        o.original = textos.map((n) => n.data).join('').trim()
        o.tn = new Text(o.original)
        const primero = originales.indexOf(textos[0])
        o.hijos = originales.flatMap((n, i) => (i === primero ? [o.tn] : textos.includes(n) ? [] : [n]))
        o.aplicar = (s) => {
          o.tn.data = s
        }
        o.rects = () => {
          const rg = document.createRange()
          rg.selectNodeContents(o.tn)
          return [...rg.getClientRects()]
        }
        el.replaceChildren(...o.hijos)
      } else if (o.modo === 'fold') {
        const sr = el.querySelector('.sr-only')
        const cont = el.querySelector('[aria-hidden="true"]')
        const molde = cont.querySelector(':scope > span')
        const pieza = molde.firstElementChild
        o.original = sr.textContent
        o.srOriginal = sr.textContent
        o.sr = sr
        o.cont = cont
        o.contOriginales = [...cont.childNodes]
        o.piezas = []
        o.aplicar = (s) => {
          sr.textContent = s
          const hijos = []
          o.piezas = []
          s.split(' ').forEach((w, i) => {
            if (i > 0) hijos.push(new Text(' '))
            const pal = molde.cloneNode(false)
            for (const c of Array.from(w)) {
              const p = pieza.cloneNode(true)
              const interior = p.querySelector('[data-fold-text]') ?? p
              interior.setAttribute('data-fold-text', c)
              interior.textContent = c
              pal.append(p)
              o.piezas.push(p)
            }
            hijos.push(pal)
          })
          cont.replaceChildren(...hijos)
        }
        o.rects = () => o.piezas.map((p) => p.getBoundingClientRect())
      } else if (o.modo === 'rueda') {
        const sr = el.querySelector('.sr-only')
        const cont = el.querySelector('.texto-rueda')
        const molde = cont.firstElementChild
        o.original = sr.textContent
        o.srOriginal = sr.textContent
        o.sr = sr
        o.cont = cont
        o.contOriginales = [...cont.childNodes]
        o.aplicar = (s) => {
          sr.textContent = s
          cont.replaceChildren(
            ...Array.from(s).map((c, i) => {
              const sp = molde.cloneNode(false)
              sp.style.setProperty('--i', i)
              sp.textContent = c === ' ' ? ' ' : c
              return sp
            }),
          )
        }
        o.rects = () => [...cont.children].map((c) => c.getBoundingClientRect())
      } else if (o.modo === 'palabras') {
        // Cada palabra, un span; entre ellas un espacio de texto (sep
        // 'espacio') o un espacio duro al final del span (sep 'nbsp')
        const esPalabra = (n) => n.nodeType === 1 && n.matches(obj.palabra)
        const pals = originales.filter(esPalabra)
        const molde = pals[0]
        o.original = pals.map((p) => p.textContent.replace(/ /g, ' ').trim()).join(' ')
        const fijos = originales.filter((n) => !esPalabra(n) && !(n.nodeType === 3 && !n.data.trim()))
        o.spans = []
        o.aplicar = (s) => {
          const ws = s.split(' ')
          o.spans = ws.map((w, i) => {
            const sp = molde.cloneNode(false)
            sp.textContent = obj.sep === 'nbsp' && i < ws.length - 1 ? `${w} ` : w
            return sp
          })
          const hijos = [...fijos]
          o.spans.forEach((sp, i) => {
            if (i > 0 && obj.sep !== 'nbsp') hijos.push(new Text(' '))
            hijos.push(sp)
          })
          el.replaceChildren(...hijos)
        }
        o.rects = () => o.spans.map((sp) => sp.getBoundingClientRect())
      }
      objetivos.push(o)
    }
  }

  const restaurar = () => {
    for (const o of objetivos) {
      if (o.cont) {
        o.cont.replaceChildren(...o.contOriginales)
        o.sr.textContent = o.srOriginal
      } else o.el.replaceChildren(...o.originales)
    }
  }

  try {
    const reglas = item.reglas ?? {}
    const original = objetivos[0].original
    objetivos.forEach((o) => o.aplicar(o.original))

    // --- Línea de base, con el texto de hoy ---
    const union = (rs) => {
      const v = rs.filter((r) => r.width > 0.5 && r.height > 0.5)
      if (!v.length) return null
      return {
        left: Math.min(...v.map((r) => r.left)),
        right: Math.max(...v.map((r) => r.right)),
        top: Math.min(...v.map((r) => r.top)),
        bottom: Math.max(...v.map((r) => r.bottom)),
      }
    }
    const inter = (a, b) => {
      if (!a || !b) return 0
      const w = Math.min(a.right, b.right) - Math.max(a.left, b.left)
      const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top)
      return w > 0 && h > 0 ? w * h : 0
    }
    const lineasBase = objetivos.map((o) => lineasDe(o.rects()))
    let topeLineas = null
    if (typeof reglas.lineas === 'number') topeLineas = reglas.lineas
    else if (reglas.lineas === 'libre') topeLineas = Infinity
    else if (typeof reglas.lineas === 'string') topeLineas = ev(reglas.lineas)
    const vigilar = (reglas.vigilar ?? []).map((v) => ({
      ...v,
      base: ev(v.v),
      max: v.max === undefined ? undefined : v.max === 'base' ? null : typeof v.max === 'string' ? ev(v.max) : v.max,
      min: v.min === undefined ? undefined : v.min === 'base' ? null : typeof v.min === 'string' ? ev(v.min) : v.min,
    }))
    vigilar.forEach((v) => {
      if (v.max === null) v.max = v.base
      if (v.min === null) v.min = v.base
    })
    const solapes = (reglas.solapes ?? []).map((s) => ({ ...s, base: lista(ev(s.b)).reduce((a, b) => a + inter(union(objetivos.flatMap((o) => o.rects())), R(b)), 0) }))
    const dentro = (reglas.dentro ?? []).map((d) => ({ expr: d, el: ev(d) }))

    const fallas = () => {
      const f = []
      objetivos.forEach((o, i) => {
        const rs = o.rects()
        const n = lineasDe(rs)
        const tope = topeLineas ?? lineasBase[i]
        if (n > tope) f.push(`líneas ${n} > ${tope}${objetivos.length > 1 ? ` (nodo ${i})` : ''}`)
        const u = union(rs)
        if (u && (u.right > W + 0.5 || u.left < -0.5)) f.push('se sale de la pantalla')
        if (u && reglas.anchoMax && u.right - u.left > reglas.anchoMax + 0.5) f.push(`ancho ${(u.right - u.left).toFixed(0)} > ${reglas.anchoMax} px`)
        for (const d of dentro) {
          const c = R(d.el)
          if (u && c && (u.right > c.right + 1 || u.left < c.left - 1)) f.push(`se sale de ${d.expr}`)
          if (d.el && d.el.scrollWidth > d.el.clientWidth + 1 && getComputedStyle(d.el).display !== 'inline') f.push(`desborda ${d.expr}`)
        }
      })
      for (const v of vigilar) {
        const x = ev(v.v)
        const tol = v.tol ?? 1
        if (v.max !== undefined && x > v.max + tol) f.push(`${v.n}: ${x.toFixed(1)} > ${v.max.toFixed(1)}`)
        if (v.min !== undefined && x < v.min - tol) f.push(`${v.n}: ${x.toFixed(1)} < ${v.min.toFixed(1)}`)
      }
      for (const s of solapes) {
        const u = union(objetivos.flatMap((o) => o.rects()))
        const a = lista(ev(s.b)).reduce((acc, b) => acc + inter(u, R(b)), 0)
        if (a > s.base + 1) f.push(`se superpone con ${s.n}`)
      }
      return f
    }

    const yaFalla = fallas()
    const resultado = {
      original,
      largoActual: original.length,
      lineasBase,
      topeLineas,
      vigilarBase: vigilar.map((v) => ({ n: v.n, base: +v.base.toFixed(1), max: v.max, min: v.min })),
      yaFalla,
      semillas: [],
    }
    const probar = (t) => {
      objetivos.forEach((o) => o.aplicar(t))
      const f = fallas().filter((x) => !yaFalla.includes(x))
      return f.length ? { largo: t.length, motivo: f.join('; '), texto: t } : null
    }
    for (const { fina, gruesa } of series) {
      // Primera pasada, de palabra entera en palabra entera; después, letra
      // por letra entre la última que pasó y la primera que falló
      let previo = 0
      let falla = null
      for (const L of gruesa) {
        falla = probar(fina[L])
        if (falla) break
        previo = L
      }
      const hasta = falla ? falla.largo - 1 : fina.length - 1
      let ultimoOk = previo
      for (let L = previo + 1; L <= hasta; L++) {
        if (!fina[L]) continue
        const f = probar(fina[L])
        if (f) {
          falla = f
          break
        }
        ultimoOk = L
      }
      resultado.semillas.push({ ultimoOk, falla, tope: fina.length - 1 })
    }
    return resultado
  } catch (e) {
    return { error: String(e).slice(0, 300) }
  } finally {
    restaurar()
  }
}

// ---------------------------------------------------------------------------
// Qué se mide
// ---------------------------------------------------------------------------

// Atajos para las expresiones (corren en la página: Q, QA, R, W, H, L)
const tarjeta = (i) => `Q('[data-tarjeta="${i}"]')`
const ALTO_TARJETAS = `Math.max(...QA('.recorrido-tarjeta').map((t) => R(t).height))`
const reglaTarjeta = (i, tam) => ({
  vigilar: [
    { n: 'alto de la tarjeta (tope: la más alta de hoy)', v: `R(${tarjeta(i)}).height`, max: ALTO_TARJETAS },
    ...(tam === 'escritorio'
      ? [{ n: 'la tarjeta entra en el riel', v: `R(${tarjeta(i)}).height`, max: `R(Q('.recorrido-riel')).height` }]
      : [{ n: 'la hoja no tapa la retícula del implante', v: `R(${tarjeta(i)}).top - R(Q('.reticula-marco')).bottom`, min: 0 }]),
  ],
})
const PARADAS = [
  ['acetabulo', 3],
  ['femur', 4],
]

function items(tam) {
  const esc = tam === 'escritorio'
  const L = []
  const add = (x) => {
    if (!x.tams || x.tams.includes(tam)) L.push(x)
  }

  // 1. Pantalla de carga (página aparte: los .glb bloqueados para que no se vaya)
  add({
    id: 'carga-palabra', pagina: 'carga', campo: 'Palabra de la pantalla de carga (la más larga: "Planificación quirúrgica")',
    objetivos: [{ sel: `Q('.pantalla-carga-palabra > [data-entra]')` }],
    prep: `const s = Q('.pantalla-carga-palabra > [data-entra]'); s.firstChild.data = 'Planificación quirúrgica'`,
    reglas: { lineas: 1, vigilar: [{ n: 'ancho útil (pantalla menos 16 px por lado)', v: `R(Q('.pantalla-carga-palabra > [data-entra]')).width`, max: `W - 32` }] },
  })
  add({
    id: 'carga-etiqueta', pagina: 'carga', campo: '"Cargando" / "Listo" (etiqueta del Lattice Loader)',
    objetivos: [{ sel: `Q('.pantalla-carga-pie [data-active]')` }],
    reglas: {
      lineas: 1,
      vigilar: [
        { n: 'hueco entre la etiqueta y el porcentaje', v: `R(Q('.pantalla-carga-numero')).left - R(Q('.pantalla-carga-pie [data-active]')).right`, min: 16 },
        { n: 'el porcentaje no se corre', v: `R(Q('.pantalla-carga-numero')).right`, max: 'base' },
      ],
    },
  })

  // 2. Menú
  const ETIQUETAS = ['Implantes', 'Cómo trabajamos', 'Fabricación', 'Habilitaciones']
  const enLaBarra = (t) => `QA('.nav-intro-links *').filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.data.trim() === ${JSON.stringify(t)}))`
  const LOGO = { n: 'columna del logo (≥ 94 px, si no pasa al ícono)', v: `R(Q('.logo-barra')).width`, min: 94, tol: 0 }
  const CENTRADO = { n: 'enlaces centrados en la barra', v: `Math.abs((R(Q('.nav-intro-links')).left + R(Q('.nav-intro-links')).right) / 2 - (R(Q('.logo-barra')).left + R(Q('.nav-intro-cta')).right) / 2)`, max: 'base', tol: 2 }
  if (esc) {
    add({ id: 'menu-cuatro-logo', campo: 'Las cuatro etiquetas del menú a la vez (mismo largo cada una): logo', objetivos: ETIQUETAS.map((t) => ({ sel: enLaBarra(t) })), reglas: { lineas: 1, vigilar: [LOGO] } })
    add({ id: 'menu-cuatro-centro', campo: 'Las cuatro etiquetas del menú a la vez: enlaces centrados', objetivos: ETIQUETAS.map((t) => ({ sel: enLaBarra(t) })), reglas: { lineas: 1, vigilar: [CENTRADO] } })
    ETIQUETAS.forEach((t, i) => {
      add({ id: `menu-${i}-logo`, campo: `Menú: "${t}" sola (las otras como hoy): logo`, objetivos: [{ sel: enLaBarra(t) }], reglas: { lineas: 1, vigilar: [LOGO] } })
      add({ id: `menu-${i}-centro`, campo: `Menú: "${t}" sola: enlaces centrados`, objetivos: [{ sel: enLaBarra(t) }], reglas: { lineas: 1, vigilar: [CENTRADO] } })
    })
  } else {
    add({
      id: 'menu-movil', campo: 'Etiquetas en el panel del menú del celular', pagina: 'menu',
      objetivos: [{ sel: `QA('#menu-movil li a')[1]` }],
      reglas: { lineas: 1, dentro: [`Q('#menu-movil nav')`] },
    })
  }

  // 3. Hero
  const CTA_HERO = `Q('.recorrido-hero a.boton-primario')`
  const VIDRIO = `Q('.recorrido-hero .boton-vidrio')`
  const PIE = { n: 'pie del texto del hero (data-pie-hero, mueve el 3D en el celular)', v: `(() => { const p = Q('[data-pie-hero]'); return p.offsetTop + p.offsetHeight })()`, max: 'base' }
  add({ id: 'hero-titular', campo: 'Titular del hero (tagline, FoldText)', ir: { tipo: 'arriba' }, objetivos: [{ sel: `Q('#inicio-titulo')`, modo: 'fold' }], reglas: { vigilar: [PIE], dentro: [`Q('#inicio-titulo')`] } })
  add({ id: 'hero-subtitulo', campo: 'Subtítulo del hero', ir: { tipo: 'arriba' }, objetivos: [{ sel: `Q('#inicio-titulo').nextElementSibling` }], reglas: { vigilar: [PIE] } })
  add({ id: 'hero-anmat', campo: 'Línea de habilitaciones ANMAT del hero', ir: { tipo: 'arriba' }, objetivos: [{ sel: `Q('[data-pie-hero]')` }], reglas: { vigilar: [PIE] } })
  const UNA_FILA = { n: 'los dos botones del hero en una fila', v: `Math.abs(R(${CTA_HERO}).top - R(${VIDRIO}).top)`, max: 1 }
  const CTA_ENTRA = { n: 'el botón de la barra entra en su columna', v: `R(Q('.nav-intro-cta')).right - R(Q('.nav-intro-bar')).right`, max: -4 }
  add({
    id: 'plantear-caso', campo: '"Plantear un caso" (contactLabel, en todos sus lugares a la vez)', ir: { tipo: 'arriba' },
    objetivos: [{ sel: `QA('main a, header a').filter((e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.data.trim() === 'Plantear un caso'))` }],
    reglas: { lineas: 1, vigilar: [UNA_FILA, ...(esc ? [LOGO, CENTRADO, CTA_ENTRA] : [])] },
  })
  add({ id: 'recorrer', campo: '"Recorrer los implantes" (botón de vidrio)', ir: { tipo: 'arriba' }, objetivos: [{ sel: VIDRIO, modo: 'rueda' }], reglas: { lineas: 1, vigilar: [UNA_FILA] } })
  add({
    id: 'aviso-hero', campo: 'Aviso "Deslizá para recorrer el cuerpo"', ir: { tipo: 'arriba' },
    objetivos: [{ sel: `Q('.recorrido-hero .aviso-deslizar')` }],
    reglas: esc ? { vigilar: [{ n: 'no pasa de la columna del texto (6/12)', v: `R(Q('.recorrido-hero .aviso-deslizar')).right`, max: `R(Q('#inicio-titulo').parentElement).right` }] } : {},
  })
  add({
    id: 'aviso-cierre', campo: 'Aviso "Deslizá para continuar"', ir: { tipo: 'cierre' },
    objetivos: [{ sel: `Q('.recorrido-aviso-cierre p')` }],
    reglas: esc ? { vigilar: [{ n: 'no entra en el cuerpo (borde izquierdo ≥ 74 % del ancho)', v: `R(Q('.recorrido-aviso-cierre p')).left / W`, min: 0.74, tol: 0 }] } : {},
  })

  // 4. Recorrido: paradas (acetábulo, la más larga, y fémur, cuatro specs)
  for (const [id, i] of PARADAS) {
    const base = reglaTarjeta(i, tam)
    const ir = { id: `parada-${id}` }
    add({ id: `${id}-zona`, campo: `Zona (cabecera de la tarjeta), ${id}`, ir, objetivos: [{ sel: `${tarjeta(i)}.firstElementChild.lastElementChild` }], reglas: { lineas: 1, ...base, solapes: [{ n: 'la píldora A medida / Catálogo', b: `${tarjeta(i)}.firstElementChild.firstElementChild` }] } })
    add({ id: `${id}-titulo`, campo: `Título de la parada, ${id}`, ir, objetivos: [{ sel: `Q('#parada-${id}-titulo')` }], reglas: { lineas: 2, ...base } })
    // La descripción no tiene tope de líneas propio: manda el alto de la
    // tarjeta. Dos variantes: sin pasar de la tarjeta más alta de hoy, y la
    // física (entra en el riel en escritorio; no tapa la retícula en el
    // celular)
    const desc = `${tarjeta(i)}.querySelector(':scope > p')`
    add({ id: `${id}-descripcion`, campo: `Descripción de la parada, ${id}`, ir, objetivos: [{ sel: desc }], reglas: { lineas: 'libre', ...base } })
    add({ id: `${id}-descripcion-fisico`, campo: `Descripción de la parada, ${id} (solo el tope físico)`, ir, objetivos: [{ sel: desc }], reglas: { lineas: 'libre', vigilar: base.vigilar.slice(1) } })
    if (esc) {
      add({ id: `${id}-spec-label`, campo: `Etiqueta de spec (columna de 7,375 rem), ${id}`, ir, objetivos: [{ sel: `${tarjeta(i)}.querySelector('dl dt')` }], reglas: { lineas: 1, ...base } })
      add({ id: `${id}-spec-valor`, campo: `Valor de spec, ${id}`, corpus: 'tecnico', ir, objetivos: [{ sel: `${tarjeta(i)}.querySelector('dl dd')` }], reglas: { lineas: 1, ...base } })
    }
  }
  if (esc) {
    // El índice anatómico: el nombre más el corrimiento del hover (14 px) no
    // llega a la retícula del implante más a la izquierda (hombro,
    // acetábulo…): la cota se calcula al principio (contexto.reticulaIzq)
    add({
      id: 'indice-zona', campo: 'Zona en el índice anatómico (desde 1100 px)', ir: { id: 'parada-acetabulo' },
      objetivos: [{ sel: `Q('.indice-enlace[href="#parada-femur"] .indice-texto')` }],
      reglas: { lineas: 1, vigilar: [{ n: 'el índice (más 14 px del hover) no llega al implante más a la izquierda', v: `R(Q('.indice-enlace[href="#parada-femur"] .indice-texto')).right + 14`, max: '__RETICULA_IZQ__ - 16', tol: 0 }] },
    })
  }

  // Cierre del recorrido
  add({ id: 'cierre-titulo', campo: 'Título del cierre del recorrido', ir: { tipo: 'cierre' }, objetivos: [{ sel: `Q('.recorrido-cierre h3')` }], reglas: {} })
  add({ id: 'cierre-bajada', campo: 'Bajada del cierre del recorrido', ir: { tipo: 'cierre' }, objetivos: [{ sel: `Q('.recorrido-cierre p')` }], reglas: {} })

  // 5. Cómo trabajamos
  const irP = { id: 'proceso' }
  const ACTIVO = esc ? '1.75rem' : '1.375rem'
  const INACTIVO = esc ? '1.3125rem' : '1.125rem'
  // Se simula que el paso k es el activo: su título en el tamaño grande, los
  // otros en el chico y, en el celular, solo su descripción a la vista
  const activar = (k) =>
    // (sin la transición del tamaño de letra: el layout la leería a medio
    // camino, todavía en el tamaño de antes)
    `QA('#proceso ol h3').forEach((h, i) => { h.style.transition = 'none'; h.style.fontSize = i === ${k} ? '${ACTIVO}' : '${INACTIVO}' });` +
    (esc ? '' : `QA('#proceso ol li p').forEach((p, i) => p.classList.toggle('hidden', i !== ${k}))`)
  const desactivar = `QA('#proceso ol h3').forEach((h) => { h.style.fontSize = ''; h.style.transition = '' });` + (esc ? '' : `QA('#proceso ol li p').forEach((p, i) => p.classList.toggle('hidden', i !== 0))`)
  // Líneas de la descripción más larga de hoy (mostrándolas un momento)
  const DESC_LINEAS = `Math.max(...QA('#proceso ol li p').map((p) => { const h = p.classList.contains('hidden'); p.classList.remove('hidden'); const n = L(p); if (h) p.classList.add('hidden'); return n }))`
  const PASOS_ENTRAN = { n: 'los pasos entran en la pantalla fija', v: `R(Q('#proceso ol')).bottom`, max: 'H' }
  add({ id: 'proceso-titulo', campo: 'Título de Cómo trabajamos', ir: irP, objetivos: [{ sel: `Q('#proceso-titulo')` }], reglas: {} })
  for (let k = 0; k < 3; k++) {
    add({ id: `proceso-paso${k + 1}-titulo`, campo: `Título del paso ${k + 1} (activo, en el tamaño grande)`, ir: irP, prep: activar(k), despues: desactivar, objetivos: [{ sel: `QA('#proceso ol h3')[${k}]` }], reglas: { lineas: 1, vigilar: [PASOS_ENTRAN] } })
  }
  for (let k = 0; k < 3; k++) {
    add({ id: `proceso-paso${k + 1}-descripcion`, campo: `Descripción del paso ${k + 1} (activo)`, ir: irP, prep: activar(k), despues: desactivar, objetivos: [{ sel: `QA('#proceso ol li p')[${k}]` }], reglas: { lineas: DESC_LINEAS, vigilar: [PASOS_ENTRAN] } })
  }
  add({ id: 'proceso-leyenda', campo: 'Etiqueta de la leyenda (las tres a la vez)', ir: irP, objetivos: [{ sel: `QA('.proceso-leyenda li')` }], reglas: { vigilar: [{ n: 'la leyenda sigue en una fila', v: `L(Q('.proceso-leyenda'))`, max: 'base', tol: 0 }] } })

  // 6. Fabricación
  const irF = { id: 'fabricacion' }
  add({ id: 'fab-titulo', campo: 'Título de Fabricación', ir: irF, objetivos: [{ sel: `Q('#fabricacion-titulo')` }], reglas: {} })
  add({ id: 'fab-bajada', campo: 'Bajada de Fabricación', ir: irF, objetivos: [{ sel: `Q('#fabricacion-titulo').nextElementSibling` }], reglas: {} })
  add({ id: 'fab-nombre', campo: 'Nombre de la técnica (tarjeta)', ir: irF, objetivos: [{ sel: `Q('#fabricacion-sustractiva')` }], reglas: { lineas: `Math.max(...QA('.tarjeta-fabricacion h3').map(L))` } })
  add({ id: 'fab-texto', campo: 'Texto de la técnica (tarjeta)', ir: irF, objetivos: [{ sel: `Q('#fabricacion-sustractiva').nextElementSibling` }], reglas: { lineas: `Math.max(...QA('.tarjeta-fabricacion h3 + p').map(L))` } })
  add({
    id: 'fab-volver', campo: '"Volver a ver"', ir: irF,
    prep: `QA('.tarjeta-fabricacion button').forEach((b) => (b.style.display = 'inline-flex'))`,
    despues: `QA('.tarjeta-fabricacion button').forEach((b) => (b.style.display = ''))`,
    objetivos: [{ sel: `Q('.tarjeta-fabricacion button')` }],
    reglas: { lineas: 1, dentro: [`Q('.tarjeta-fabricacion button').parentElement`], vigilar: [{ n: 'la tarjeta no se ensancha', v: `R(Q('.tarjeta-fabricacion')).width`, max: 'base' }] },
  })
  // Tira de fotos: la clásica (celular y sin WebGL) y la caption del Flex
  // Carousel (escritorio)
  add({
    id: 'tira-titulo', campo: 'Título de foto de la tira clásica (tarjeta de min(78vw, 26rem))', ir: irF,
    // Parte de la caption más larga de hoy (así el tope de la prueba es el
    // triple de esa)
    prep: `Q('.carrusel-respaldo').style.display = 'flex'; const p = Q('.carrusel-respaldo li p'); [...p.childNodes].find((n) => n.nodeType === 3).data = 'Componentes modulares de la endoprótesis femoral'`,
    despues: `Q('.carrusel-respaldo').style.display = ''`,
    objetivos: [{ sel: `Q('.carrusel-respaldo li p')` }],
    reglas: { lineas: `Math.max(...QA('.carrusel-respaldo li p').map((p) => L(p) - L(p.querySelector('span'))))` },
  })
  add({
    id: 'tira-subtitulo', campo: 'Subtítulo de foto de la tira clásica', ir: irF,
    prep: `Q('.carrusel-respaldo').style.display = 'flex'`, despues: `Q('.carrusel-respaldo').style.display = ''`,
    objetivos: [{ sel: `Q('.carrusel-respaldo li p span')` }],
    reglas: { lineas: `Math.max(...QA('.carrusel-respaldo li p span').map(L))` },
  })
  // Caption del Flex Carousel (escritorio con WebGL2): una línea centrada
  // bajo la foto señalada. Fotos de ancho natural: la más angosta (el
  // estudio tomográfico) mide ≈ 228 px a 1440 × 900 (captura); la caption no
  // debería pasarla
  if (esc) {
    const irCar = { sel: '.carrusel-planta', block: 'center', espera: 3000 }
    add({ id: 'carrusel-titulo', campo: 'Caption del carrusel (título), escritorio', ir: irCar, objetivos: [{ sel: `Q('#fabricacion span.text-body-md')` }], reglas: { lineas: 1, anchoMax: 228 } })
    add({ id: 'carrusel-subtitulo', campo: 'Caption del carrusel (subtítulo), escritorio', ir: irCar, objetivos: [{ sel: `Q('#fabricacion span.text-body-md span')` }], reglas: { lineas: 1, anchoMax: 228 } })
  }

  // 7. Habilitaciones
  const irH = { id: 'habilitaciones' }
  add({ id: 'hab-titulo', campo: 'Título de Habilitaciones', ir: irH, objetivos: [{ sel: `Q('#habilitaciones-titulo')` }], reglas: {} })
  add({ id: 'hab-bajada', campo: 'Bajada de Habilitaciones', ir: irH, objetivos: [{ sel: `Q('#habilitaciones-titulo').nextElementSibling` }], reglas: {} })
  const DT_LINEAS = `Math.max(...QA('.lectura-fila dt').map((d) => L(d) - L(d.querySelector('small'))))`
  add({ id: 'hab-detalle', campo: 'Detalle de una habilitación (fila)', ir: irH, objetivos: [{ sel: `QA('.lectura-fila dt')[2]` }], reglas: { lineas: DT_LINEAS } })
  add({
    id: 'hab-referencia', campo: 'Referencia (una parte; el GLN usa dos)', corpus: 'tecnico', ir: irH,
    objetivos: [{ sel: `QA('.lectura-fila dd [aria-hidden="true"]')[2]` }],
    prep: `const s = QA('.lectura-fila dd [aria-hidden="true"]')[2]; s.replaceChildren(new Text(s.parentElement.querySelector('.sr-only').textContent))`,
    reglas: { lineas: 1, vigilar: [{ n: 'los detalles no suman líneas (la referencia les come ancho)', v: `QA('.lectura-fila dt').reduce((a, d) => a + L(d), 0)`, max: 'base', tol: 0 }], dentro: [`Q('.lectura')`] },
  })

  // 8. Distribución
  const irS = { id: 'sedes' }
  add({ id: 'sedes-titulo', campo: 'Título de Distribución (palabra por palabra)', ir: irS, objetivos: [{ sel: `Q('#sedes-titulo')`, modo: 'palabras', palabra: 'span.inline-block', sep: 'espacio' }], reglas: {} })
  add({ id: 'sedes-bajada', campo: 'Bajada de Distribución (palabra por palabra)', ir: irS, objetivos: [{ sel: `Q('#sedes-titulo').nextElementSibling`, modo: 'palabras', palabra: 'span.inline-block', sep: 'espacio' }], reglas: {} })
  const ETIQ_LINEAS = `Math.max(...QA('.mapa-etiqueta').map((b) => L(b) - L(b.querySelector('span'))))`
  for (const sede of ['laboratorio', 'planta', 'comodoro']) {
    const sel = `Q('[data-sede^="${sede}"] .mapa-etiqueta')`
    add({
      id: `sede-${sede}-etiqueta`, campo: `Etiqueta del mapa "{ciudad}, {provincia}" (${sede})`, ir: irS,
      objetivos: [{ sel }],
      reglas: {
        lineas: ETIQ_LINEAS,
        dentro: [`Q('[data-sede^="${sede}"]').closest('ul')`],
        solapes: [{ n: 'otra etiqueta', b: `QA('.mapa-etiqueta').filter((b) => b !== ${sel})` }],
      },
    })
    add({ id: `sede-${sede}-rol`, campo: `Rol bajo la etiqueta (${sede})`, ir: irS, objetivos: [{ sel: `${sel}.querySelector('span')` }], reglas: { lineas: 1, dentro: [`Q('[data-sede^="${sede}"]').closest('ul')`] } })
    const CARD = `Q('[data-sede^="${sede}"] .mapa-globo')`
    const ALTO_CARDS = { n: 'alto de la card (tope: la más alta de hoy)', v: `R(${CARD}).height`, max: `Math.max(...QA('.mapa-globo').map((c) => R(c).height))` }
    add({ id: `sede-${sede}-tipo`, campo: `Tipo en la card (${sede})`, ir: irS, objetivos: [{ sel: `${CARD}.querySelector('p')` }], reglas: { lineas: 'libre', vigilar: [ALTO_CARDS] } })
    add({ id: `sede-${sede}-calle`, campo: `"{calle}, {ciudad}" en la card (${sede})`, ir: irS, objetivos: [{ sel: `${CARD}.querySelector('p span')` }], reglas: { lineas: 'libre', vigilar: [ALTO_CARDS] } })
  }

  // 9. Contacto de la home
  const irC = { id: 'contacto' }
  // La intro se ve al principio de la sección (q = 0), centrada en el
  // escenario; en #contacto (q = 1) ya se apagó. Con movimiento reducido no
  // se muestra (va la tarjeta directa): se la vuelve a mostrar para medirla
  const irIntro = { sel: '.contacto-seccion' }
  const prepIntro = `Q('.contacto-intro').style.display = 'block'`
  const desIntro = `Q('.contacto-intro').style.display = ''`
  add({ id: 'contacto-kicker', campo: 'Línea chica de la intro (kicker)', ir: irIntro, prep: prepIntro, despues: desIntro, objetivos: [{ sel: `Q('[data-kicker]')` }], reglas: { lineas: 1 } })
  add({ id: 'contacto-titular', campo: 'Titular de la intro (palabra por palabra)', ir: irIntro, prep: prepIntro, despues: desIntro, objetivos: [{ sel: `Q('.contacto-intro p')`, modo: 'palabras', palabra: '[data-palabra]', sep: 'nbsp' }], reglas: {} })
  add({ id: 'contacto-h2', campo: 'Título de la tarjeta de contacto', ir: irC, objetivos: [{ sel: `Q('main #contacto-titulo')` }], reglas: {} })
  add({ id: 'contacto-bajada', campo: 'Bajada de la tarjeta de contacto', ir: irC, objetivos: [{ sel: `Q('main #contacto-titulo').nextElementSibling` }], reglas: {} })

  // 10. Footer (lo compartido que se ve ahí)
  const FILA_FOOTER = { n: 'los tres bloques del footer en una fila', v: `new Set([...Q('footer > div').children].map((c) => Math.round(R(c).top))).size`, max: 'base', tol: 0 }
  add({ id: 'footer-tagline', campo: 'Tagline en el footer (con el punto)', ir: { tipo: 'fondo' }, objetivos: [{ sel: `Q('footer p')` }], reglas: { vigilar: [FILA_FOOTER] } })
  add({ id: 'footer-calle', campo: 'Dirección en el footer ("{calle}, {localidad}")', ir: { tipo: 'fondo' }, objetivos: [{ sel: `Q('footer address')` }], reglas: { vigilar: [FILA_FOOTER] } })

  // 11. Panel y página de contacto
  // Los ids de la página llevan "pagina-" (contacto-* son los de la sección de la home)
  for (const pagina of ['contacto', 'panel']) {
    const pre = pagina === 'contacto' ? 'pagina' : 'panel'
    const enc = pagina === 'contacto' ? 'main h1' : 'dialog #contacto-titulo'
    const raiz = pagina === 'contacto' ? 'main' : 'dialog'
    add({ id: `${pre}-titulo`, pagina, campo: `Título (${pagina === 'contacto' ? 'página /contacto' : 'panel'})`, objetivos: [{ sel: `Q('${enc}')` }], reglas: {} })
    add({ id: `${pre}-bajada`, pagina, campo: `Bajada (${pagina === 'contacto' ? 'página' : 'panel'})`, objetivos: [{ sel: `Q('${enc}').nextElementSibling` }], reglas: {} })
    add({ id: `${pre}-motivo`, pagina, campo: `Etiqueta de motivo (${pagina}; la más larga, "Consulta sobre un producto")`, objetivos: [{ sel: `Q('${raiz} fieldset label')` }], reglas: { lineas: 1 } })
    add({ id: `${pre}-canales`, pagina, campo: `"¿Preferís otro canal?" (${pagina})`, objetivos: [{ sel: `QA('${raiz} p').find((p) => p.textContent.includes('otro canal'))` }], reglas: { lineas: 1 } })
  }
  return L
}

// ---------------------------------------------------------------------------
// Navegación
// ---------------------------------------------------------------------------

const GPU = ['--use-angle=metal', '--ignore-gpu-blocklist']
const dosCuadros = (page) => page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))

async function irA(page, como) {
  if (!como) return
  await page.evaluate((como) => {
    if (como.tipo === 'arriba') window.scrollTo({ top: 0, behavior: 'instant' })
    else if (como.tipo === 'fondo') window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' })
    else if (como.tipo === 'cierre') {
      const c = document.querySelector('.recorrido')
      const r = c.getBoundingClientRect()
      window.scrollTo({ top: r.top + window.scrollY + r.height - window.innerHeight, behavior: 'instant' })
    } else if (como.sel) document.querySelector(como.sel)?.scrollIntoView({ behavior: 'instant', block: como.block ?? 'start' })
    else document.getElementById(como.id)?.scrollIntoView({ behavior: 'instant', block: 'start' })
  }, como)
  await dosCuadros(page)
  await page.waitForTimeout(como.espera ?? 900)
}

async function abrirHome(ctx) {
  const page = await ctx.newPage()
  await page.goto(`${URL_BASE}/`, { waitUntil: 'load' })
  await page.waitForFunction(() => !document.querySelector('.pantalla-carga') && document.querySelector('[data-intro="done"]'), null, { timeout: 60000 })
  await page.addStyleTag({ content: 'nextjs-portal{display:none!important}' })
  await page.evaluate(() => document.fonts.ready)
  await page.waitForTimeout(1200)
  return page
}

async function medir(page, item, contexto) {
  // Las series se arman en Node: primero se pide el texto de hoy (y la línea
  // de base), para darles su forma y su tope (el triple del largo de hoy)
  const it = sustituir(item, contexto)
  const probe = await page.evaluate(enPagina, { item: it, series: [] })
  if (probe.error) return probe
  const tope = Math.max(probe.largoActual * 3, 60)
  const series = Array.from({ length: N_SEMILLAS }, (_, s) => candidatos(s + 1, probe.original, item.corpus ?? 'general', tope))
  const r = await page.evaluate(enPagina, { item: it, series })
  if (item.despues)
    await page.evaluate((code) => {
      const Q = (s) => document.querySelector(s)
      const QA = (s) => [...document.querySelectorAll(s)]
      new Function('Q', 'QA', code)(Q, QA)
    }, item.despues)
  return r
}

// Reemplaza marcadores de contexto (__RETICULA_IZQ__) en las reglas
function sustituir(item, contexto) {
  return JSON.parse(JSON.stringify(item).replaceAll('__RETICULA_IZQ__', String(contexto.reticulaIzq ?? 9999)))
}

const resumen = (r) => {
  if (r.error) return r
  const oks = r.semillas.map((s) => s.ultimoOk).sort((a, b) => a - b)
  const sinFalla = r.semillas.every((s) => !s.falla)
  return {
    ...r,
    maximo: oks[0],
    mediana: oks[Math.floor(oks.length / 2)],
    sinFallaHastaTope: sinFalla,
    motivo: r.semillas.find((s) => s.ultimoOk === oks[0])?.falla?.motivo ?? null,
  }
}

const linea = (r) =>
  r.error ??
  `${r.largoActual} → mín ${r.maximo} · mediana ${r.mediana}${r.sinFallaHastaTope ? ' (sin falla hasta el tope)' : ''} (${r.motivo ?? '-'})${r.yaFalla?.length ? ' YA FALLA: ' + r.yaFalla.join('; ') : ''}`

const informe = { url: URL_BASE, fecha: new Date().toISOString(), promedioLetras: +PROMEDIO_LETRAS.toFixed(2), semillas: N_SEMILLAS, tamanos: {} }
const browser = await chromium.launch({ headless: true, channel: 'chrome', args: GPU })

for (const tam of tams) {
  const ctx = await browser.newContext({ ...TAM[tam], reducedMotion: 'reduce' })
  const lista = items(tam).filter((x) => !SOLO || SOLO.includes(x.id))
  const res = {}
  const contexto = {}

  // Home
  const home = lista.filter((x) => !x.pagina)
  if (home.length) {
    const page = await abrirHome(ctx)
    contexto.fuentes = await page.evaluate(() => ({ hanken: document.fonts.check('500 40px "Hanken Grotesk"'), sourceSans: document.fonts.check('16px "Source Sans 3"') }))
    if (tam === 'escritorio') {
      // Borde izquierdo de la retícula en cada parada: el índice no la alcanza
      const izqs = []
      for (const id of ['craneo', 'maxilar', 'hombro', 'acetabulo', 'femur', 'intercalar']) {
        await irA(page, { id: `parada-${id}` })
        await page.waitForTimeout(1200)
        izqs.push(await page.evaluate(() => document.querySelector('.reticula-marco').getBoundingClientRect().left))
      }
      contexto.reticulas = izqs.map((x) => +x.toFixed(1))
      contexto.reticulaIzq = Math.min(...izqs)
    }
    for (const item of home) {
      await irA(page, item.ir)
      res[item.id] = { campo: item.campo, ...resumen(await medir(page, item, contexto)) }
      console.log(tam, item.id, linea(res[item.id]))
    }
    // Menú del celular abierto
    const menu = lista.filter((x) => x.pagina === 'menu')
    if (menu.length) {
      await irA(page, { tipo: 'arriba' })
      await page.click('button[aria-controls="menu-movil"]')
      await page.waitForTimeout(800)
      for (const item of menu) {
        res[item.id] = { campo: item.campo, ...resumen(await medir(page, item, contexto)) }
        console.log(tam, item.id, linea(res[item.id]))
      }
      await page.keyboard.press('Escape')
    }
    // Panel de contacto, abierto desde el hero
    const panel = lista.filter((x) => x.pagina === 'panel')
    if (panel.length) {
      await irA(page, { tipo: 'arriba' })
      await page.click('.recorrido-hero a.boton-primario')
      await page.waitForSelector('dialog[open] fieldset label', { timeout: 15000 })
      await page.waitForTimeout(1200)
      contexto.panelAncho = await page.evaluate(() => document.querySelector('dialog[open]').getBoundingClientRect().width)
      for (const item of panel) {
        res[item.id] = { campo: item.campo, ...resumen(await medir(page, item, contexto)) }
        console.log(tam, item.id, linea(res[item.id]))
      }
    }
    await page.close()
  }

  // Pantalla de carga: se bloquean los .glb para que se quede
  const carga = lista.filter((x) => x.pagina === 'carga')
  if (carga.length) {
    const page = await ctx.newPage()
    await page.route('**/*.glb', (route) => route.abort())
    await page.goto(`${URL_BASE}/`, { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.pantalla-carga-palabra > [data-entra]')
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(500)
    for (const item of carga) {
      const r = await page.evaluate(() => !!document.querySelector('.pantalla-carga'))
      res[item.id] = r ? { campo: item.campo, ...resumen(await medir(page, item, contexto)) } : { campo: item.campo, error: 'la pantalla de carga ya se fue' }
      console.log(tam, item.id, linea(res[item.id]))
    }
    await page.close()
  }

  // Página /contacto
  const pagContacto = lista.filter((x) => x.pagina === 'contacto')
  if (pagContacto.length) {
    const page = await ctx.newPage()
    await page.goto(`${URL_BASE}/contacto`, { waitUntil: 'load' })
    await page.waitForSelector('main fieldset label', { timeout: 15000 })
    await page.evaluate(() => document.fonts.ready)
    await page.waitForTimeout(800)
    for (const item of pagContacto) {
      res[item.id] = { campo: item.campo, ...resumen(await medir(page, item, contexto)) }
      console.log(tam, item.id, linea(res[item.id]))
    }
    await page.close()
  }

  informe.tamanos[tam] = { contexto, resultados: res }
  await ctx.close()
}

// Imagen OG (app/opengraph-image.tsx): Satori no se puede medir en la
// página, así que se rearma su columna en Chrome con las mismas fuentes
// (los woff de assets/fuentes/), el mismo cuerpo, interlineado, tracking y
// anchos, y se mide igual. Presupuesto vertical: 630 − 60 − 56 de relleno;
// logo 75; titular n × 72; resumen n × 29,7; el sobrante se reparte en dos
// huecos (space-between).
if (!SOLO || SOLO.includes('og')) {
  const raiz = join(aqui, '../../../..')
  const b64 = (f) => readFileSync(join(raiz, 'assets/fuentes', f)).toString('base64')
  const html = `<!doctype html><style>
    @font-face { font-family: H; src: url(data:font/woff;base64,${b64('hanken-grotesk-latin-500-normal.woff')}); font-weight: 500 }
    @font-face { font-family: S; src: url(data:font/woff;base64,${b64('source-sans-3-latin-400-normal.woff')}) }
    body { margin: 0 }
    #col { width: 548px }
    #t { font: 500 72px/1 H; letter-spacing: -0.035em }
    #r { display: flex; align-items: flex-start; max-width: 500px; font: 22px/1.35 S }
    #r i { width: 10px; height: 10px; flex-shrink: 0; margin: 10px 14px 0 0 }
    #m { font: 500 72px/1 H; letter-spacing: -0.035em; white-space: nowrap; position: absolute; top: 900px }
  </style><div id="col"><div id="t">Innovación tecnológica en beneficio del paciente</div><div id="r"><i></i><span id="rt">Habilitados por ANMAT para fabricar, importar y distribuir productos médicos en todo el país.</span></div></div><div id="m"></div>`
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 630 } })
  const page = await ctx.newPage()
  await page.setContent(html)
  await page.evaluate(() => document.fonts.ready)
  const og = {}
  const prom = await page.evaluate((txt) => {
    const m = document.getElementById('m')
    m.textContent = txt
    return m.getBoundingClientRect().width / txt.length
  }, palabras(7, 300, 'general').join(' '))
  og.anchoMedioGlifoTitular = +prom.toFixed(1)
  og.letrasPorLineaTitular = Math.floor(548 / prom)
  og['og-titular-4'] = { campo: 'Titular de la imagen OG (tagline), cuatro líneas como hoy', ...resumen(await medir(page, { objetivos: [{ sel: `Q('#t')` }], reglas: { lineas: 4 } }, {})) }
  og['og-titular-5'] = { campo: 'Titular de la imagen OG, cinco líneas (los huecos bajan a ≈ 10 px)', ...resumen(await medir(page, { objetivos: [{ sel: `Q('#t')` }], reglas: { lineas: 5 } }, {})) }
  og['og-resumen-2'] = { campo: 'Resumen ANMAT en la OG, dos líneas como hoy', ...resumen(await medir(page, { objetivos: [{ sel: `Q('#rt')` }], reglas: { lineas: 2 } }, {})) }
  og['og-resumen-3'] = { campo: 'Resumen ANMAT en la OG, tres líneas (con el titular en cuatro, entra)', ...resumen(await medir(page, { objetivos: [{ sel: `Q('#rt')` }], reglas: { lineas: 3 } }, {})) }
  for (const k of Object.keys(og)) if (og[k]?.campo) console.log('og', k, linea(og[k]))
  console.log('og ancho medio de glifo del titular', og.anchoMedioGlifoTitular, 'px →', og.letrasPorLineaTitular, 'por línea')
  informe.og = og
  await ctx.close()
}

await browser.close()
writeFileSync(OUT, JSON.stringify(informe, null, 2))
console.log(`promedio de letras por palabra: ${PROMEDIO_LETRAS.toFixed(2)}`)
console.log(`escrito ${OUT}`)
