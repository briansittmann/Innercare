// Estado compartido entre el armazón HTML del recorrido (components/home/
// tour-scroll.tsx), que lee el scroll, y la escena 3D, que se carga aparte.
// Es un objeto mutable y no estado de React: cambia en cada cuadro del
// scroll y re-renderizar por eso sería caro. Una sola fuente de verdad para
// el progreso (LANDING_SPEC.md, sección 2).
export const estadoRecorrido = {
  // Progreso del recorrido, amortiguado: 0 (entrada) a 7 (cierre)
  seg: 0,
  reducido: false,
  // Pantalla de celular (< ANCHO_CELULAR): la toma del hero se desliza
  celular: false,
  // Las miniaturas 3D ya se ven por el hueco de las tarjetas (data-minis):
  // hasta entonces el ensamble no arranca, así no se lo pierde detrás de la
  // foto
  minis: false,
  // La escena fija ocupa la pantalla (el hero ya salió): solo entonces el
  // cuerpo hace su vaivén
  fijo: false,
  // La escena se registra al montarse para que el scroll le pida un cuadro
  // (frameloop "demand": sin scroll no se dibuja nada).
  invalidar: null as (() => void) | null,
  // Nodo de la escena fija: la escena 3D escribe ahí la posición del halo y
  // de la luz (variables CSS), que son HTML encima y debajo del canvas.
  escena: null as HTMLElement | null,
  // Entrada del hero (components/intro.ts): 'hold' quieto en la pose de
  // partida, 'play' gira hasta su pose, 'skip' sin entrada
  entrada: 'hold' as 'hold' | 'play' | 'skip',
}

// Cuerpo único (docs/landing/cuerpo-unico/): desde la fase 3, el hero vive
// dentro de la escena del recorrido y es el camino normal. La función queda
// hasta la limpieza (fase 5).
export function cuerpoUnicoActivo() {
  return true
}
