import Image from 'next/image'
import { AnchorLink } from './anchor-link'
import { ContactLink } from './contact-link'
import { DesktopNav } from './desktop-nav'
import { MobileNav } from './mobile-nav'
import { NavIntro } from './nav-intro'
import { NavGlass } from './nav-glass'
import { contactHref, contactLabel } from './nav-links'

// El logo lleva al hero: en la home sube con el scroll suave (aunque #inicio
// ya esté en la URL); desde las fichas, vuelve a la home arriba de todo.
// #inicio arranca 72 px por encima (pasa por detrás del header), así que el
// scroll-padding-top lo deja en el borde de la página.
function Logo({ className }: { className: string }) {
  return (
    <AnchorLink href="/#inicio" aria-label="Innercare, inicio" className="shrink-0">
      <Image
        src="/logo.png"
        alt="Innercare"
        width={1200}
        height={466}
        sizes="96px"
        className={className}
      />
    </AnchorLink>
  )
}

// Capas: el header es la única capa fija (z-40); el menú móvil vive dentro.
// En la home, el hero sube por detrás del header (components/home/hero.tsx).
// El header es transparente y deja pasar los clics fuera de la barra: lo único
// visible es la barra de vidrio flotante, con el contenido pasando por detrás
// al hacer scroll. En el celular, 8 px de margen + 56 px de píldora = 64 px,
// lo que descuenta el hero (components/mobile-nav.tsx). En escritorio, 8 px de
// margen + 64 px de barra = 72 px. Con los 8 px de relleno del vidrio quedan
// 48 px para "Plantear un caso", el mínimo táctil del sistema de botones.
//
// Entrada (.nav-intro-* en globals.css), solo al cargar el sitio por la home
// (NavIntro) y a la vez que el busto del hero (components/intro.ts). En el
// celular, la barra baja con un fundido. En escritorio, arranca como una
// píldora con el logo y se estira hasta su ancho. El contenido se maqueta siempre al ancho final
// (100cqw de .nav-intro) y el vidrio lo recorta, así nada se reacomoda
// mientras crece.
export function SiteHeader() {
  return (
    <header className="pointer-events-none sticky top-0 z-40 pt-2">
      <NavIntro className="px-3 md:hidden">
        <MobileNav logo={<Logo className="h-8 w-auto" />} />
      </NavIntro>

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
                <ContactLink href={contactHref} className="nav-intro-cta boton boton-primario justify-self-end">
                  {contactLabel}
                </ContactLink>
              </div>
            </div>
          </NavGlass>
        </NavIntro>
      </div>
    </header>
  )
}
