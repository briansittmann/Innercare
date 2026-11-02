// Proyección del mapa de Argentina de "Distribución a todo el país":
// transversa de Mercator esférica con meridiano central en 64° O, la familia
// de los mapas oficiales argentinos (Gauss-Krüger). Una equirectangular
// ensancharía Tierra del Fuego un tercio. La comparten el script que genera
// `content/mapa-argentina.ts` (scripts/mapa-argentina.mjs) y los componentes
// que ubican las sedes sobre ese mapa, así los pines caen donde están los
// límites.
export const MERIDIANO_CENTRAL = -64

// Encuadre del mapa generado: el viewBox (ancho y alto) y cómo pasar de las
// unidades crudas de la proyección a las del viewBox. `y0` es el borde norte.
export type Encuadre = {
  ancho: number
  alto: number
  x0: number
  y0: number
  escala: number
}

const RAD = Math.PI / 180

// Coordenadas crudas de la proyección (sin escala), con el norte hacia +y.
export function proyectarCrudo(lat: number, lon: number): { x: number; y: number } {
  const fi = lat * RAD
  const dl = (lon - MERIDIANO_CENTRAL) * RAD
  const b = Math.cos(fi) * Math.sin(dl)
  return {
    x: 0.5 * Math.log((1 + b) / (1 - b)),
    y: Math.atan2(Math.tan(fi), Math.cos(dl)),
  }
}

// Coordenadas en el viewBox del mapa (y hacia abajo, como en SVG).
export function proyectar(lat: number, lon: number, encuadre: Encuadre): { x: number; y: number } {
  const { x, y } = proyectarCrudo(lat, lon)
  return { x: (x - encuadre.x0) * encuadre.escala, y: (encuadre.y0 - y) * encuadre.escala }
}
