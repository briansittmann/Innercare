// Datos que el servidor (locations.tsx) le pasa al cliente (mapa-sedes.tsx)
// para dibujar las sedes y la línea que las une. Va en su propio módulo
// porque lo que exporta un módulo 'use client' llega al servidor como
// referencia, no como valor.
//
// Las medidas que dependen del ancho de pantalla no viajan acá: el ancho del
// lienzo (--ancho-lienzo), la separación entre etiquetas (--paso) y dónde
// empieza la columna de etiquetas (--x-etiquetas) son variables de CSS en
// .mapa (globals.css), así el celular y el escritorio usan los mismos datos.
export type SedeEnMapa = {
  id: string
  ciudad: string
  provincia: string
  // Rol corto para la etiqueta (Laboratorio, Planta industrial, Sucursal) y
  // el tipo para la card (el del laboratorio, completo)
  rol: string
  tipo: string
  calle: string
  provinciaId: string
  foto: { src: string; alt: string }
  // Pin: x en fracción del ancho del lienzo, y en fracción de su alto
  x: number
  y: number
  // Etiqueta: la altura media de su grupo (fracción del alto) más `k` pasos
  // (las que casi coinciden se reparten alrededor de la media: -0,5 y 0,5)
  yGrupo: number
  k: number
  // Cuándo aparece el pin en la entrada, en ms
  retraso: number
}

// Un tramo de la línea entre dos sedes consecutivas (en unidades del
// viewBox del mapa), con cuándo empieza a dibujarse y cuánto tarda, en ms
export type Tramo = { d: string; retraso: number; duracion: number }
