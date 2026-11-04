// Vuelca todos los exports de content/*.ts a un JSON ordenado, para comparar
// el contenido antes y después de un cambio de origen (p. ej. la migración a
// Keystatic): `node scripts/volcar-contenido.mjs salida.json`. Las funciones
// se omiten, salvo getProducts(), que se llama (es la API de las vistas).
import { writeFile } from 'node:fs/promises'
import { register } from 'node:module'

register('./cargador-ts.mjs', import.meta.url)

const modulos = ['company', 'contact', 'customCases', 'planta', 'products', 'recorrido', 'hero', 'menu', 'carga', 'seo']
const salida = process.argv[2]
if (!salida) {
  console.error('Uso: node scripts/volcar-contenido.mjs <salida.json>')
  process.exit(1)
}

const ordenar = (valor) => {
  if (Array.isArray(valor)) return valor.map(ordenar)
  if (valor && typeof valor === 'object') {
    return Object.fromEntries(
      Object.keys(valor)
        .sort()
        .map((k) => [k, ordenar(valor[k])]),
    )
  }
  return valor
}

const volcado = {}
for (const nombre of modulos) {
  let modulo
  try {
    modulo = await import(`../content/${nombre}.ts`)
  } catch (error) {
    if (error.code === 'ERR_MODULE_NOT_FOUND') continue
    throw error
  }
  const datos = {}
  for (const [clave, valor] of Object.entries(modulo)) {
    if (typeof valor === 'function') {
      if (clave === 'getProducts') datos[clave] = await valor()
      continue
    }
    datos[clave] = valor
  }
  volcado[nombre] = ordenar(datos)
}

await writeFile(salida, JSON.stringify(volcado, null, 2) + '\n')
console.log(`Volcado en ${salida}: ${Object.keys(volcado).join(', ')}`)
