// Textos de la pantalla de carga (content/datos/carga.json, singleton
// "Pantalla de carga"): las etapas del proceso que van cambiando con el
// progreso, "Cargando" y "Listo".
import datos from './datos/carga.json'
import { Lector, pendiente } from './leer'

const carga = new Lector(datos, 'Pantalla de carga')

const palabras = carga.listaTextos('palabras', 'Etapas del proceso')

// Siempre al menos una: la cantidad define las franjas del progreso
export const PALABRAS: readonly string[] = palabras.length > 0 ? palabras : [pendiente('Pantalla de carga · Etapas del proceso')]

export const cargaTextos = {
  cargando: carga.texto('cargando', 'Cargando'),
  listo: carga.texto('listo', 'Listo'),
}
