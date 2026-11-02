import type { ReactNode } from 'react'
import ShapeGrid from './shape-grid'

// Fondo de cierre: una malla hexagonal que deriva despacio hacia arriba (la
// estructura porosa de los implantes impresos en titanio), en el primario
// muy tenue y con los bordes desvanecidos. Bajo el cursor (puntero fino) se
// encienden las celdas. Canvas 2D, pausado fuera de pantalla y quieto con
// movimiento reducido (components/shape-grid.tsx). Lo usan la home (de
// Distribución al contacto) y las fichas (de "Más implantes" al contacto).
//
// Los costados y el borde de arriba se desvanecen en proporción a la caja.
// Abajo, con `hastaFooter`, la malla sigue 2,5 rem más allá del envoltorio
// (el padding de arriba del footer, hasta su línea) y se desvanece en 3 rem:
// así se ve entera debajo del bloque de contacto de las fichas, que queda
// centrado en ella (pedido del usuario). En la home ya no va antes del
// footer sino del cierre de contacto con las manos (fondo oscuro, opaco):
// ahí termina en su borde (`hastaFooter={false}`).
//
// El envoltorio pinta el fondo de la página y aísla el apilamiento: la malla
// va entre ese fondo y el contenido, que tiene que ser transparente donde
// se quiera ver.
export function FondoMalla({ children, hastaFooter = true }: { children: ReactNode; hastaFooter?: boolean }) {
  return (
    <div className="relative isolate bg-surface">
      <div className={`absolute inset-x-0 top-0 -z-10 ${hastaFooter ? '-bottom-[2.5rem]' : 'bottom-0'}`}>
        <ShapeGrid
          shape="hexagon"
          cellSize={64}
          lineWidth={1}
          direction="up"
          speed={0.12}
          lineColor="color-mix(in srgb, var(--color-primary) 10%, transparent)"
          hoverColor="var(--color-primary-container)"
          hoverFillColor="var(--color-primary)"
          fillOpacity={0.06}
          radius={1.8}
          trail={0.9}
          glow={0}
          fade={0.6}
          fadeBottom="3rem"
        />
      </div>
      {children}
    </div>
  )
}
