// Estado compartido entre el armazón HTML del recorrido (components/home/
// tour-scroll.tsx), que lee el scroll, y la escena 3D, que se carga aparte.
// Es un objeto mutable y no estado de React: cambia en cada cuadro del
// scroll y re-renderizar por eso sería caro. Una sola fuente de verdad para
// el progreso (LANDING_SPEC.md, sección 2).
export const estadoRecorrido = {
  // Progreso del recorrido, amortiguado: 0 (entrada) a 7 (cierre)
  seg: 0,
  reducido: false,
  // La escena se registra al montarse para que el scroll le pida un cuadro
  // (frameloop "demand": sin scroll no se dibuja nada).
  invalidar: null as (() => void) | null,
  // Nodo de la escena fija: la escena 3D escribe ahí la posición del halo y
  // de la luz (variables CSS), que son HTML encima y debajo del canvas.
  escena: null as HTMLElement | null,
}
