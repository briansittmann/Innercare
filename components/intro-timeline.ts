// Línea de tiempo de la entrada de la home (components/intro.ts), aparte
// para que la lean también los componentes de servidor.
//
// Línea de tiempo (ms desde el arranque):
//      0  header, busto y fibras a la vez (la barra se estira a los 750 ms)
//   1100  título, letra por letra (≈ 1,7 s), mientras termina lo anterior
//   2300  subtítulo, cuando el título ya está casi entero
//   2700  botones, de a uno
//   3600  fin
export const INTRO_AT = {
  title: 1100,
  subtitle: 2300,
  actions: 2700,
  end: 3600,
} as const
