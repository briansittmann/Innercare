import Image from 'next/image'
import { AnchorLink } from './anchor-link'
import { ContactLink } from './contact-link'
import { DesktopNav } from './desktop-nav'
import { HeaderFondo } from './header-fondo'
import { MobileNav } from './mobile-nav'
import { NavIntro } from './nav-intro'
import { NavGlass } from './nav-glass'
import { contactHref, contactLabel } from './nav-links'

// El logo lleva al hero: en la home sube con el scroll suave (aunque #inicio
// ya esté en la URL); desde las fichas, vuelve a la home arriba de todo.
// #inicio arranca 72 px por encima (pasa por detrás del header), así que el
// scroll-padding-top lo deja en el borde de la página.
//
// La bolita naranja de arriba baja el texto del logo: "InnerCare" ocupa de
// 266 a 581 px de los 733 de la imagen, con su centro al 57,8 % del alto. Sube
// el 8,5 % de su alto (2,7 px a 32 px) para que quede a la altura del texto
// del menú; en el celular, centrado en la píldora.
//
// `compacto` (la barra de escritorio): la barra reparte el ancho entre el
// logo, los enlaces y el botón, y entre 768 y unos 1300 px de ventana a la
// columna del logo no le alcanza para el logo entero, que se aplastaba. Ahí
// va el ícono (el del favicon) en su lugar: lo decide una consulta de
// contenedor sobre la columna (.logo-barra en globals.css). Las dos imágenes
// van en el HTML y el CSS muestra una.
function Logo({ className, compacto = false }: { className: string; compacto?: boolean }) {
  return (
    <AnchorLink href="/#inicio" aria-label="Innercare, inicio" className="logo-header shrink-0">
      <Image
        src="/logo-header.png"
        alt="Innercare"
        width={2145}
        height={733}
        sizes="96px"
        className={`${compacto ? 'logo-completo ' : ''}${className} -translate-y-[8.5%]`}
      />
      {compacto && (
        <Image
          src="/favicon.png"
          alt="Innercare"
          width={256}
          height={256}
          sizes="32px"
          className="logo-icono h-8 w-8 object-contain"
        />
      )}
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
//
// Sobre el azul oscuro del contacto de la home, el vidrio pasa a opaco
// (HeaderFondo y .nav-glass en globals.css).
export function SiteHeader() {
  return (
    <HeaderFondo className="pointer-events-none sticky top-0 z-40 pt-2">
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
                {/* A todo el ancho de su columna: la consulta de contenedor
                    mide cuánto lugar le queda al logo */}
                <span className="nav-intro-logo logo-barra justify-self-stretch">
                  <Logo className="h-8 w-auto" compacto />
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
    </HeaderFondo>
  )
}
