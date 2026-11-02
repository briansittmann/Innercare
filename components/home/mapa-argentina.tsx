import { MAPA, contorno, limites, provincias } from '@/content/mapa-argentina'

// Mapa de Argentina de "Distribución a todo el país", estático: las
// provincias como relleno, los límites interiores y la costa como trazos.
// Los trazados vienen ya proyectados y simplificados de
// content/mapa-argentina.ts (`npm run mapa`). Es un Server Component: los
// 50 KB de trazados van en el HTML y no en el bundle. Lo interactivo (sedes,
// ruta, globo) lo pone MapaSedes encima, en el mismo viewBox.
// `pathLength={1}` deja la animación de dibujo de la entrada en términos de
// fracción (.mapa-contorno, .mapa-limites en globals.css).
export function MapaArgentina() {
  return (
    <svg
      aria-hidden
      className="absolute inset-0 size-full overflow-visible"
      viewBox={`0 0 ${MAPA.ancho} ${MAPA.alto}`}
    >
      {provincias.map((p) => (
        <path key={p.id} className="mapa-provincia" d={p.d} />
      ))}
      <path className="mapa-limites" d={limites} pathLength={1} />
      <path className="mapa-contorno" d={contorno} pathLength={1} />
    </svg>
  )
}
