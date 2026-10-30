// Línea de tiempo de la entrada de la home (components/intro.ts), aparte
// para que la lean también los componentes de servidor.
//
// Línea de tiempo (ms desde el arranque):
//      0  header, busto y fibras a la vez (la barra se estira a los 750 ms)
//   1100  título, letra por letra (≈ 1,7 s), mientras termina lo anterior
//   2300  subtítulo, cuando el título ya está casi entero
//   2700  botones, de a uno
//   3000  línea de habilitaciones, debajo de los botones
//   3200  aviso de deslizar, centrado abajo
//   4000  fin (lo último dura 700 ms: termina a los 3900)
export const INTRO_AT = {
  title: 1100,
  subtitle: 2300,
  actions: 2700,
  credentials: 3000,
  scrollCue: 3200,
  end: 4000,
} as const
