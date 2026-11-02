import { useSyncExternalStore } from 'react'

// Carga de la home (la pantalla de carga, components/pantalla-carga.tsx):
// qué falta para que la página se pueda mostrar con el 3D completo. Hermana
// de intro.ts: un módulo con estado propio que React lee con
// useSyncExternalStore, sin volver a renderizar a cada byte.
//
// Cada tarea tiene un peso (los .glb, su tamaño en KB: solo cambian la
// proporción del número; si `npm run modelos` los cambia mucho, se
// actualizan) y un avance de 0 a 1. El progreso total es la suma ponderada.
// La pantalla se va cuando todo terminó (o falló: entonces quedan las vistas
// de respaldo, como antes), y después no vuelve a aparecer en la sesión: los
// modelos quedan en la caché de useLoader.

export const TAREAS = {
  // El chunk de three.js y la escena (components/recorrido-3d/escena.tsx)
  escena: 60,
  '/modelos/cuerpo-cabeza.glb': 436,
  '/modelos/implantes.glb': 73,
  '/modelos/cuerpo-resto.glb': 541,
  '/modelos/implantes-recorrido.glb': 313,
  // El primer cuadro dibujado con todo montado (Listo en escena.tsx)
  cuadro: 60,
  // Las fuentes del sitio (document.fonts.ready)
  fuentes: 20,
} as const

export type Tarea = keyof typeof TAREAS

const PESO_TOTAL = Object.values(TAREAS).reduce((a, b) => a + b, 0)

const avances = new Map<Tarea, number>()
let fallo = false
let version = 0
const oyentes = new Set<() => void>()

function emitir() {
  version += 1
  for (const oyente of oyentes) oyente()
}

function esTarea(nombre: string): nombre is Tarea {
  return nombre in TAREAS
}

// Avance parcial de una tarea (0 a 1). Nunca retrocede.
export function avanzar(nombre: string, fraccion: number) {
  if (!esTarea(nombre)) return
  const actual = avances.get(nombre) ?? 0
  const nuevo = Math.min(1, Math.max(actual, fraccion))
  if (nuevo === actual) return
  avances.set(nombre, nuevo)
  emitir()
}

export function completar(nombre: string) {
  avanzar(nombre, 1)
}

// Algo no va a llegar (sin WebGL, error de la escena, tiempo agotado): se da
// todo por terminado para que la pantalla se vaya.
export function fallar() {
  fallo = true
  for (const nombre of Object.keys(TAREAS) as Tarea[]) avances.set(nombre, 1)
  emitir()
}

export function getProgreso() {
  let suma = 0
  for (const [nombre, peso] of Object.entries(TAREAS) as [Tarea, number][]) {
    suma += (avances.get(nombre) ?? 0) * peso
  }
  return suma / PESO_TOTAL
}

export function estaCompleta() {
  return (Object.keys(TAREAS) as Tarea[]).every((nombre) => (avances.get(nombre) ?? 0) >= 1)
}

export function huboFallo() {
  return fallo
}

function suscribir(oyente: () => void) {
  oyentes.add(oyente)
  return () => {
    oyentes.delete(oyente)
  }
}

// Versión del estado: cambia con cada avance. Quien la lee vuelve a
// renderizar con cada cambio; para el número, mejor leer getProgreso() en el
// bucle de dibujo.
export function useCarga() {
  return useSyncExternalStore(
    suscribir,
    () => version,
    () => 0,
  )
}
