import type { ComponentProps } from 'react'
import GlassSurface from './glass-surface'

// Vidrio de la navegación: la barra superior y el índice lateral comparten
// estos ajustes. Es la única translucidez de la interfaz (docs/DECISIONES.md).
// - backgroundOpacity 0.4: los enlaces se leen sobre fotos.
// - Aberración cromática contenida: los valores por defecto (0/10/20) tiñen
//   de arcoíris los bordes.
// - .nav-glass: versión opaca con prefers-reduced-transparency (globals.css).
export function NavGlass({ className = '', ...props }: ComponentProps<typeof GlassSurface>) {
  return (
    <GlassSurface
      backgroundOpacity={0.4}
      saturation={1.2}
      redOffset={0}
      greenOffset={3}
      blueOffset={6}
      {...props}
      className={`nav-glass ${className}`}
    />
  )
}
