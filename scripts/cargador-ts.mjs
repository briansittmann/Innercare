// Ganchos de carga para correr módulos de `content/` directo con Node 24, sin
// compilar: Node ya saca los tipos de los .ts, pero no resuelve imports sin
// extensión ni JSON sin `with { type: 'json' }`. Los registra scripts/
// volcar-contenido.mjs con `register()` de node:module (este archivo solo
// exporta los ganchos: corre en el hilo de hooks de Node).
import { access } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const existe = (url) =>
  access(fileURLToPath(url)).then(
    () => true,
    () => false,
  )

export async function resolve(specifier, context, next) {
  // Alias @/ del tsconfig → raíz del proyecto
  if (specifier.startsWith('@/')) {
    specifier = new URL('../' + specifier.slice(2), import.meta.url).href
  }
  const relativo = specifier.startsWith('./') || specifier.startsWith('../') || specifier.startsWith('file:')
  if (relativo && !/\.[a-z]+$/i.test(specifier)) {
    const base = new URL(specifier, context.parentURL)
    for (const ext of ['.ts', '.tsx', '/index.ts']) {
      const candidato = base.href + ext
      if (await existe(candidato)) return next(candidato, context)
    }
  }
  return next(specifier, context)
}

export async function load(url, context, next) {
  if (url.endsWith('.json')) {
    const { source } = await next(url, { ...context, importAttributes: { type: 'json' } })
    return { format: 'module', shortCircuit: true, source: `export default ${source}` }
  }
  return next(url, context)
}
