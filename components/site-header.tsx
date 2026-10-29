import Image from 'next/image'
import Link from 'next/link'
import { DesktopNav } from './desktop-nav'
import { MobileNav } from './mobile-nav'
import { NavIntro } from './nav-intro'
import { NavGlass } from './nav-glass'

function Logo({ className }: { className: string }) {
  return (
    <Link href="/" aria-label="Innercare, inicio" className="shrink-0">
      <Image
        src="/logo.png"
        alt="Innercare"
        width={1200}
        height={466}
        sizes="96px"
        className={className}
      />
    </Link>
  )
}

// Capas: el header es la única capa fija (z-40); el menú móvil vive dentro.
// En escritorio, el header es transparente y deja pasar los clics fuera de la
// barra: lo único visible es la barra de vidrio flotante, con el contenido
// pasando por detrás al hacer scroll. Alto total: 8 px de margen + 64 px de
// barra = 72 px, lo que descuenta el hero. Con los 8 px de relleno del vidrio
// quedan 48 px para "Contactar", el mínimo táctil del sistema de botones.
//
// Entrada de escritorio (.nav-intro-* en globals.css), solo al cargar el sitio
// por la home (NavIntro): la barra arranca como una píldora con el logo y se
// estira hasta su ancho. El contenido se maqueta siempre al ancho final
// (100cqw de .nav-intro) y el vidrio lo recorta, así nada se reacomoda
// mientras crece.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 md:pointer-events-none md:pt-2">
      <div className="bg-surface/80 backdrop-blur-md md:hidden">
        <div className="page-container flex h-16 items-center justify-between gap-lg">
          <Logo className="h-8 w-auto" />
          <MobileNav />
        </div>
      </div>

      <div className="page-container hidden md:block">
        {/* Centrada con flex y no con mx-auto: en el rebote la barra se pasa
            del ancho final, y mx-auto mandaría todo el exceso a la derecha. */}
        <NavIntro className="mx-auto flex max-w-[max(46rem,62vw)] justify-center">
          <NavGlass
            width="100%"
            height={64}
            borderRadius={32}
            className="nav-intro-bar pointer-events-auto shrink-0"
          >
            <div className="w-full min-w-0">
              <div className="grid w-[calc(100cqw-1rem)] grid-cols-[1fr_auto_1fr] items-center pl-4">
                <span className="nav-intro-logo justify-self-start">
                  <Logo className="h-8 w-auto" />
                </span>
                <DesktopNav className="nav-intro-links" />
                <Link href="/contacto" className="nav-intro-cta boton boton-primario justify-self-end">
                  Contactar
                </Link>
              </div>
            </div>
          </NavGlass>
        </NavIntro>
      </div>
    </header>
  )
}
