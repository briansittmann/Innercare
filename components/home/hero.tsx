import Link from 'next/link'
import { SealCheckIcon } from '@phosphor-icons/react/ssr'
import type { CSSProperties } from 'react'
import { BotonVidrio } from '@/components/boton-vidrio'
import { INTRO_AT } from '@/components/intro-timeline'
import { contactHref, contactLabel } from '@/components/nav-links'
import { habilitacionesResumen, tagline } from '@/content/company'
import { HeroFibers, HeroTitle } from './hero-intro'

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

// Cuerpo único (fase 3): el hero vive dentro de la escena fija del recorrido
// (components/home/tour.tsx y tour-scroll.tsx). El degradé de azules de la
// marca es el fondo de esa escena, de borde a borde y por detrás del header,
// y el cuerpo entero es el canvas del recorrido en la toma del hero. Acá
// quedan el texto (HeroTexto) y la cinta de fibras (HeroFondo); el fundido
// de los dos va atado al progreso del recorrido (seg 0 a 0,35).
//
// Entrada orquestada (components/intro.ts, tiempos en intro-timeline.ts):
// header, cuerpo y fibras a la vez; mientras terminan, el título letra por
// letra; después el subtítulo, los botones, la línea de habilitaciones y, al
// final, el aviso de deslizar.

// Cinta de fibras en tinta azul sobre el degradé, por detrás del texto y del
// 3D: baja en diagonal desde arriba a la izquierda hacia el cuello. Sin
// viñeta, grano ni partículas, para que el degradé se siga leyendo igual.
// Con el mouse encima, la cámara se inclina hacia él con un resorte y se
// enfoca el tramo que queda bajo el puntero (los eventos se escuchan en
// window: el contenedor no los recibe).
export function HeroFondo() {
  return (
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
  )
}

// El texto del hero, con la misma maqueta que tenía como sección propia:
// columna de seis sobre doce en escritorio, a todo el alto bajo el header
export function HeroTexto() {
  return (
    <div className="page-container grid h-full md:grid-cols-12">
      <div className="flex flex-col pb-lg pt-xl md:relative md:col-span-6 md:justify-center md:py-section">
        <h1
          id="inicio-titulo"
          className="text-balance font-display-xl text-display-xl text-on-surface"
        >
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
              al titular, y del mismo tamaño entre sí: el relleno marca cuál
              es el principal. Crece un poco con el puntero encima
              (.boton-crece) */}
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
