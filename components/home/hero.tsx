import { SealCheckIcon } from '@phosphor-icons/react/ssr'
import type { CSSProperties } from 'react'
import { BotonVidrio } from '@/components/boton-vidrio'
import { ContactLink } from '@/components/contact-link'
import { INTRO_AT } from '@/components/intro-timeline'
import { contactHref, contactLabel } from '@/components/nav-links'
import { CUELLO_BAJO_ANCLA } from '@/components/recorrido-3d/camara'
import { habilitacionesResumen, tagline } from '@/content/company'
import { FibrasEscena } from './fibras-escena'
import { HeroTitle } from './hero-intro'

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
// window: el contenedor no los recibe). La misma cinta vuelve en el cierre
// del recorrido, detrás del cuerpo entero y con otra diagonal: los ajustes
// de las dos tomas están en fibras-escena.tsx.
export function HeroFondo() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <FibrasEscena />
    </div>
  )
}

// El texto del hero, con la misma maqueta que tenía como sección propia:
// columna de seis sobre doce en escritorio, a todo el alto bajo el header
export function HeroTexto() {
  return (
    <div className="page-container grid h-full md:grid-cols-12">
      <div className="flex flex-col pb-lg pt-lg md:relative md:col-span-6 md:justify-center md:py-section">
        <h1
          id="inicio-titulo"
          className="text-balance font-display-xl text-display-xl text-on-surface"
        >
          <HeroTitle text={tagline} />
        </h1>
        <p
          className="intro-in mt-md max-w-[36ch] text-body-lg text-on-surface-variant md:mt-lg"
          style={introAt(INTRO_AT.subtitle)}
        >
          Implantes ortopédicos modulares y a medida del paciente, fabricados en
          titanio en planta propia.
        </p>
        <div className="mt-lg flex flex-wrap items-center gap-sm md:mt-xl md:gap-md">
          {/* Más grandes que los botones del resto del sitio, para acompañar
              al titular, y del mismo tamaño entre sí: el relleno marca cuál
              es el principal. Crece un poco con el puntero encima
              (.boton-crece) */}
          <ContactLink
            href={contactHref}
            className="intro-in boton boton-primario boton-crece px-4 text-[15px] font-semibold md:min-h-[3.5rem] md:px-[1.75rem] md:text-body-lg"
            style={introAt(INTRO_AT.actions)}
          >
            {contactLabel}
          </ContactLink>
          {/* Vidrio, como "Ver la demo" de Mango (pedido del usuario) */}
          <BotonVidrio
            href="#recorrido"
            style={introAt(INTRO_AT.actions + 100)}
            className="intro-in px-4 text-[15px] font-semibold md:min-h-[3.5rem] md:px-[1.75rem] md:text-body-lg"
          >
            Recorrer los implantes
          </BotonVidrio>
        </div>
        {/* Credencial, no eslogan: chica y con el sello en el primario, para
            que se lea como dato y no compita con los botones */}
        <p
          data-pie-hero
          className="intro-in mt-md flex max-w-[46ch] items-start gap-sm text-body-sm text-on-surface-variant md:mt-xl"
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
// el texto, en una sola línea. En el celular, a la izquierda del cuerpo y
// centrado en la altura del cuello (el ancla de la toma, --ancla-hero de
// tour-scroll.tsx, más CUELLO_BAJO_ANCLA de camara.ts), en dos líneas: es el
// hueco que deja la cabeza corrida a la derecha. Sin JS, con el ancla de las
// pantallas altas (77 % del alto, en dvh como la escena fija). Al empezar a
// deslizar se apaga (--desliz-t). En los dos, el riel a la izquierda.
function ScrollCue() {
  return (
    <p
      aria-hidden
      className="intro-in aviso-deslizar absolute top-[calc(var(--ancla-hero,77dvh)+var(--cuello)-1.25rem)] left-[clamp(1rem,4vw,1.5rem)] flex max-w-[10rem] flex-row-reverse items-center gap-md text-balance text-body-sm text-on-surface-variant md:top-auto md:bottom-lg md:left-0 md:max-w-none"
      style={{ ...introAt(INTRO_AT.scrollCue), '--cuello': `${(CUELLO_BAJO_ANCLA * 100).toFixed(2)}dvh` } as CSSProperties}
    >
      Deslizá para recorrer el cuerpo
    </p>
  )
}
