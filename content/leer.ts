// Lectura tolerante de los JSON que escribe el panel (content/datos/*.json).
// Es la última red: la compuerta del build (scripts/contenido.mjs) ya valida
// cada archivo con el esquema de Keystatic antes de compilar, así que esto no
// debería dispararse nunca. Pero la página no puede romperse por un
// contenido mal cargado: nada de acá lanza. Un texto vacío o que falta se
// muestra como "[pendiente: …]" (regla de CLAUDE.md), un PDF que no es PDF
// se omite, una fila inválida se salta con un aviso en el build.
//
// Sin dependencias: lo importan módulos que van tanto al servidor como al
// navegador.

export type Crudo = Record<string, unknown>

const esObjeto = (valor: unknown): valor is Crudo =>
  typeof valor === 'object' && valor !== null && !Array.isArray(valor)

export const pendiente = (campo: string) => `[pendiente: ${campo}]`

// Solo en el servidor (build, next dev, scripts): en el navegador no suma
export function avisar(mensaje: string) {
  if (typeof window === 'undefined') console.warn(`[contenido] ${mensaje}`)
}

export class Lector {
  readonly datos: Crudo
  // Cómo lo ve el editor: "Hero", "Recorrido · Fémur proximal"
  readonly nombre: string

  // Sin propiedades de parámetro en el constructor: Node 24 corre estos
  // módulos sacando los tipos (scripts/volcar-contenido.mjs) y no las admite
  constructor(crudo: unknown, nombre: string) {
    this.nombre = nombre
    if (esObjeto(crudo)) {
      this.datos = crudo
    } else {
      this.datos = {}
      avisar(`${nombre}: no hay datos (${crudo === undefined ? 'falta' : 'no es un objeto'}); todo queda pendiente`)
    }
  }

  // Texto obligatorio: si falta o está vacío, el marcador visible
  texto(clave: string, etiqueta: string): string {
    const valor = this.datos[clave]
    if (typeof valor === 'string' && valor.trim()) return valor
    return pendiente(`${this.nombre} · ${etiqueta}`)
  }

  textoOpcional(clave: string): string | undefined {
    const valor = this.datos[clave]
    return typeof valor === 'string' && valor.trim() ? valor : undefined
  }

  numero(clave: string, etiqueta: string, rango?: { min: number; max: number }): number | undefined {
    const valor = this.datos[clave]
    if (typeof valor !== 'number' || !Number.isFinite(valor)) {
      avisar(`${this.nombre} · ${etiqueta}: falta o no es un número`)
      return undefined
    }
    if (rango && (valor < rango.min || valor > rango.max)) {
      avisar(`${this.nombre} · ${etiqueta}: ${valor} está fuera de ${rango.min} a ${rango.max}`)
      return undefined
    }
    return valor
  }

  booleano(clave: string): boolean {
    return this.datos[clave] === true
  }

  opcion<T extends string>(clave: string, etiqueta: string, opciones: readonly T[], porDefecto: T): T {
    const valor = this.datos[clave]
    if (opciones.includes(valor as T)) return valor as T
    avisar(`${this.nombre} · ${etiqueta}: «${String(valor)}» no es una opción válida; va ${porDefecto}`)
    return porDefecto
  }

  // Ruta pública de un PDF subido desde el panel; cualquier otra cosa, nada
  // (el enlace no se muestra)
  pdf(clave: string, etiqueta: string): string | undefined {
    const valor = this.datos[clave]
    if (valor === undefined || valor === null || valor === '') return undefined
    if (typeof valor === 'string' && /^\/[^\s]+\.pdf$/i.test(valor)) return valor
    avisar(`${this.nombre} · ${etiqueta}: «${String(valor)}» no es un PDF; se omite`)
    return undefined
  }

  hijo(clave: string, etiqueta: string): Lector {
    return new Lector(this.datos[clave], `${this.nombre} · ${etiqueta}`)
  }

  // Lista de objetos; lo que no es un objeto se salta
  lista(clave: string, etiqueta: string): Lector[] {
    const valor = this.datos[clave]
    if (!Array.isArray(valor)) {
      avisar(`${this.nombre} · ${etiqueta}: falta o no es una lista`)
      return []
    }
    return valor.flatMap((item, i) => {
      if (esObjeto(item)) return [new Lector(item, `${this.nombre} · ${etiqueta} ${i + 1}`)]
      avisar(`${this.nombre} · ${etiqueta} ${i + 1}: no es un objeto; se omite`)
      return []
    })
  }

  // Lista de textos; los vacíos se saltan
  listaTextos(clave: string, etiqueta: string): string[] {
    const valor = this.datos[clave]
    if (!Array.isArray(valor)) {
      avisar(`${this.nombre} · ${etiqueta}: falta o no es una lista`)
      return []
    }
    return valor.filter((item): item is string => typeof item === 'string' && item.trim() !== '')
  }
}
