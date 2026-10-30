import Link from 'next/link'
import { SealCheckIcon } from '@phosphor-icons/react/ssr'
import type { CSSProperties } from 'react'
import { BotonVidrio } from '@/components/boton-vidrio'
import { Hero3D } from '@/components/hero-3d/hero-3d'
import { INTRO_AT } from '@/components/intro-timeline'
import { contactHref, contactLabel } from '@/components/nav-links'
import { habilitacionesResumen, tagline } from '@/content/company'
import { HeroFibers, HeroTitle, IntroSection } from './hero-intro'

// Ubicación de cada cinta de fibras: [desplazamiento, profundidad, pendiente,
// fase]. La principal es la de fábrica. La segunda, más atrás (misma
// profundidad que la de fábrica), entra por arriba a la altura de la barra,
// pasa por encima de la cabeza y sale por la derecha a un 44 % del alto. Hoy
// se dibuja solo la principal (layers={1}): la segunda queda por si vuelve.
const FIBER_PLACEMENTS = [
  [0, 0, 0, 0],
  [2.1, -4.6, 0.29, 2.4],
]

// Retraso de cada pieza en la entrada (.intro-in en globals.css)
const introAt = (ms: number) => ({ '--intro-at': `${ms}ms` }) as CSSProperties

// El hero entero tiene el degradé de azules de la marca, de borde a borde, y
// sube por detrás del header (64 px en el celular, 72 en escritorio), que es
// sticky y transparente arriba de todo. Texto y 3D comparten ese fondo: el
// canvas es transparente y el vidrio refracta el mismo degradé. Termina en un
// corte recto contra el gris de la sección siguiente, que coincide con el
// corte del busto.
//
// Entrada orquestada (components/intro.ts, tiempos en intro-timeline.ts):
// header, busto y fibras a la vez; mientras terminan, el título letra por
// letra; después el subtítulo, los botones, la línea de habilitaciones y, al
// final, el aviso de deslizar.
export function Hero() {
  return (
    <IntroSection
      id="inicio"
      className="relative -mt-16 overflow-hidden bg-linear-to-b from-stage-from to-stage-to pt-16 md:-mt-[72px] md:pt-[72px]"
    >
      {/* Cinta de fibras en tinta azul sobre el degradé, por detrás del texto
          y del 3D: baja en diagonal desde arriba a la izquierda hacia el
          cuello del busto. Sin viñeta, grano ni partículas, para que el
          degradé se siga leyendo igual. Con el mouse
          encima, la cámara se inclina hacia él con un resorte y se enfoca el
          tramo que queda bajo el puntero (los eventos se escuchan en window:
          el contenedor no los recibe). */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <HeroFibers
          lightMode
          glowColor="#003c6f"
          secondaryColor="#2260a1"
          lineColor="#ffffff"
          rotation={-39}
          fiberStyle="strands"
          threads={96}
          layers={1}
          placements={FIBER_PLACEMENTS}
          depthOfField={0.45}
          brightness={0.75}
          particles={0}
          sparkle={0.6}
          grain={0}
          vignette={0}
        />
      </div>
      <div className="page-container relative z-10 grid md:min-h-[calc(100dvh-72px)] md:grid-cols-12">
        <div className="flex flex-col justify-center pb-lg pt-xl md:relative md:col-span-6 md:py-section">
          <h1 className="text-balance font-display-xl text-display-xl text-on-surface">
            <HeroTitle text={tagline} />
          </h1>
          <p
            className="intro-in mt-lg max-w-[36ch] text-body-lg text-on-surface-variant"
            style={introAt(INTRO_AT.subtitle)}
          >
            Implantes ortopédicos modulares y a medida del paciente, fabricados en
            titanio en planta propia.
          </p>
          <div className="mt-xl flex flex-wrap items-center gap-md">
            {/* Más grandes que los botones del resto del sitio, para acompañar
                al titular, y del mismo tamaño entre sí: el relleno marca cuál es el
                principal. Crece un poco con el
                puntero encima (.boton-crece) */}
            <Link
              href={contactHref}
              className="intro-in boton boton-primario boton-crece min-h-[3.5rem] px-[1.75rem] text-body-lg font-semibold"
              style={introAt(INTRO_AT.actions)}
            >
              {contactLabel}
            </Link>
            {/* Vidrio, como "Ver la demo" de Mango (pedido del usuario) */}
            <BotonVidrio
              href="#recorrido"
              style={introAt(INTRO_AT.actions + 100)}
              className="intro-in min-h-[3.5rem] px-[1.75rem] text-body-lg font-semibold"
            >
              Recorrer los implantes
            </BotonVidrio>
          </div>
          {/* Credencial, no eslogan: chica y con el sello en el primario, para
              que se lea como dato y no compita con los botones */}
          <p
            className="intro-in mt-lg flex max-w-[46ch] items-start gap-sm text-body-sm text-on-surface-variant md:mt-xl"
            style={introAt(INTRO_AT.credentials)}
          >
            <SealCheckIcon size={20} weight="light" aria-hidden className="shrink-0 text-primary" />
            {habilitacionesResumen}
          </p>
          <ScrollCue />
        </div>
      </div>

      {/* Sin bordes propios: en escritorio va abajo a la derecha, a todo el
          alto (o al 80 % del ancho, si la pantalla es angosta) y en proporción
          14:15, con la figura al 55,5 % del canvas; el texto pasa por encima.
          En el celular va debajo del texto, centrada y un poco metida bajo los
          botones. El canvas es más ancho que el busto para que no corte los
          hombros, y no más: su área pesa en los cuadros por segundo. */}
      <Hero3D className="intro-3d -mt-xl h-[62vh] [--hero-3d-foco:0.5] md:absolute md:right-0 md:bottom-0 md:mt-0 md:aspect-[14/15] md:h-[min(100%,80vw)] md:w-auto md:[--hero-3d-foco:0.555]" />
    </IntroSection>
  )
}

// Aviso de deslizar: anticipa que el recorrido por el cuerpo se maneja con
// el scroll. Un tramo del primario cae por un riel fino, en loop
// (.aviso-deslizar en globals.css; quieto con movimiento reducido).
// Decorativo para los lectores de pantalla: el recorrido se anuncia con su
// propio título.
// Dónde va: centrado abajo no entra sin pisar el busto (en escritorio, la
// espalda del busto pasa por el centro de la pantalla hasta pantallas de
// proporción ≈ 1,8:1). Así que en escritorio va abajo de todo, alineado con
// el texto; en el celular, centrado entre la línea de habilitaciones y el
// busto, que es donde termina la primera pantalla. En los dos, el riel a la
// izquierda del texto, en una sola línea, para no empujar más el busto.
function ScrollCue() {
  return (
    <p
      aria-hidden
      className="intro-in aviso-deslizar mt-lg flex flex-row-reverse items-center gap-md self-center text-body-sm text-on-surface-variant md:absolute md:bottom-lg md:left-0 md:mt-0"
      style={introAt(INTRO_AT.scrollCue)}
    >
      Deslizá para recorrer el cuerpo
    </p>
  )
}
