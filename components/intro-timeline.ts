// Línea de tiempo de la entrada de la home (components/intro.ts), aparte
// para que la lean también los componentes de servidor.
//
// Línea de tiempo (ms desde el arranque): el cuerpo (giro y desenfoque,
// 2,6 s) y las fibras arrancan solos, y la barra entra junto con el título,
// no desde el primer cuadro (estirándose desde los 750 ms, a la vez que el
// cuerpo arrancaba su giro, el conjunto daba un tirón: el filtro de vidrio
// de la barra se recalcula mientras cambia de tamaño; quieta como píldora
// desde el principio parecía rota, y esperando al final del título se hacía
// larga: pedidos del usuario, 2026-11-02).
//      0  el cuerpo y las fibras
//   1100  título, letra por letra (≈ 1,7 s), y la barra: aparece como
//         píldora con el logo, a los 350 ms se estira (900 ms) y entran los
//         enlaces; a los 1000 ms, "Plantear un caso" con su rebote (700 ms).
//         En el celular, baja con un fundido.
//   2300  subtítulo, cuando el título ya está casi entero
//   2700  botones, de a uno
//   3000  línea de habilitaciones, debajo de los botones
//   3200  aviso de deslizar, centrado abajo
//   4000  fin (lo último dura 700 ms: termina a los 3900)
export const INTRO_AT = {
  title: 1100,
  nav: 1100,
  subtitle: 2300,
  actions: 2700,
  credentials: 3000,
  scrollCue: 3200,
  end: 4000,
} as const
