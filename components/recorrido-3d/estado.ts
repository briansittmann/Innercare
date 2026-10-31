// Estado compartido entre el armazón HTML del recorrido (components/home/
// tour-scroll.tsx), que lee el scroll, y la escena 3D, que se carga aparte.
// Es un objeto mutable y no estado de React: cambia en cada cuadro del
// scroll y re-renderizar por eso sería caro. Una sola fuente de verdad para
// el progreso (LANDING_SPEC.md, sección 2).
export const estadoRecorrido = {
  // Progreso del recorrido, amortiguado: 0 (entrada) a 7 (cierre)
  seg: 0,
  reducido: false,
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
}

// Prototipo del cuerpo único (docs/landing/cuerpo-unico/): con
// ?cuerpo-unico en la URL de la home, el hero dibuja la escena del recorrido
// en la toma del hero y el recorrido arranca en esa toma. Sin el parámetro,
// todo queda como antes. Se lee una sola vez y solo en el navegador.
let cuerpoUnico: boolean | undefined
export function cuerpoUnicoActivo() {
  if (typeof window === 'undefined') return false
  cuerpoUnico ??= new URLSearchParams(window.location.search).has('cuerpo-unico')
  return cuerpoUnico
}
