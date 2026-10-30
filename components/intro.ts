import { useSyncExternalStore } from 'react'
import { INTRO_AT } from './intro-timeline'

export { INTRO_AT }

// Entrada orquestada de la home: una sola línea de tiempo que comparten el
// header, el hero (3D, fibras y textos) y, más adelante, la pantalla de carga.
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
// Hoy la arranca Hero3D en cuanto el 3D está listo, o a los INTRO_MAX_WAIT ms
// si tarda (en ese caso entra la imagen fija y el 3D la reemplaza después,
// sin giro). Cuando haya pantalla de carga, la arranca ella al irse.
// Los tiempos de cada pieza, en intro-timeline.ts.

export const INTRO_MAX_WAIT = 2500

// Si el sitio se cargó por la home. Se lee al evaluar el módulo, en la
// hidratación de la primera página (NavIntro lo importa desde el layout).
// Al llegar a la home navegando desde otra página no se espera al 3D: la
// entrada del hero arranca enseguida.
export const loadedAtHome = typeof window !== 'undefined' && window.location.pathname === '/'

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
