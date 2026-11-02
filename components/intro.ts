import { useSyncExternalStore } from 'react'
import { INTRO_AT } from './intro-timeline'

export { INTRO_AT }

// Entrada orquestada de la home: una sola línea de tiempo que comparten el
// header, el hero (3D, fibras y textos) y la pantalla de carga.
//
// Fases:
// - waiting: todo listo para entrar, pero oculto. Es lo que trae el HTML del
//   servidor; el CSS solo oculta con JS (`@media (scripting: enabled)`), y
//   si el JS no llega todo aparece solo a los 4 s.
// - running: corre la entrada (CSS bajo [data-intro='running'], el 3D y las
//   fibras desde su propio bucle).
// - done: terminó. Ya no hay animaciones aplicadas, así que volver a la home
//   (Cache Components la conserva con <Activity>) no la repite.
//
// La arranca la pantalla de carga (components/pantalla-carga.tsx) al irse,
// con el 3D entero ya cargado y dibujado: startIntro() si la página está
// arriba (el hero a la vista) y skipIntro() si se recargó con el scroll más
// abajo (no hay nada que hacer entrar). Los tiempos de cada pieza, en
// intro-timeline.ts.

export type IntroPhase = 'waiting' | 'running' | 'done'

let phase: IntroPhase = 'waiting'
const listeners = new Set<() => void>()

function emit() {
  for (const listener of listeners) listener()
}

export function getIntroPhase() {
  return phase
}

export function startIntro() {
  if (phase !== 'waiting') return
  phase = 'running'
  emit()
  setTimeout(() => {
    phase = 'done'
    emit()
  }, INTRO_AT.end)
}

// Sin entrada: todo aparece armado (la página se cargó con el scroll lejos
// del hero, o sin movimiento)
export function skipIntro() {
  if (phase !== 'waiting') return
  phase = 'done'
  emit()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function useIntroPhase() {
  return useSyncExternalStore(
    subscribe,
    () => phase,
    () => 'waiting' as const,
  )
}
