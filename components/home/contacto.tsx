import Image from 'next/image'
import { ContactLink } from '@/components/contact-link'
import { contactHref, contactLabel } from '@/components/nav-links'
import { ContactoManos } from './contacto-manos'

// Cierre de contacto de la home (#contacto), con la sección "touch" del
// borrador de la landing: 2,8 pantallas de scroll con el escenario fijo
// (contacto-manos.tsx), el texto de intro al centro y, al final, la tarjeta
// con la composición de components/contact-cta.tsx (la de las fichas, la del
// guion): a la izquierda el título y la bajada; a la derecha el logo en
// versión clara y el único botón, "Plantear un caso". Texto y tarjeta van en
// el HTML del servidor y se ven sin JS (la sección toma su alto natural).
// Las fichas siguen con ContactCta.
//
// Entradas (contacto-manos.tsx): la línea chica (data-kicker) aparece, sube
// y el titular entra palabra por palabra (data-palabra); las piezas de la
// tarjeta (data-entra) entran de a una cuando la tarjeta aparece, y el botón
// (data-rebote) llega con un rebote chico, como en el menú del celular.
const TITULAR_INTRO = 'Todo empieza con una conversación.'
//
// #contacto va en un ancla al final de la sección (.contacto-ancla): un
// enlace a /#contacto llega con la tarjeta ya armada.
//
// data-fondo-oscuro: mientras la sección pasa por detrás de la barra, el
// vidrio del header se vuelve opaco (components/header-fondo.tsx).
export function Contacto() {
  const palabras = TITULAR_INTRO.split(' ')
  return (
    <section
      aria-labelledby="contacto-cierre-titulo"
      data-fondo-oscuro
      className="contacto-seccion relative h-[280vh] bg-on-primary-fixed"
    >
      <span id="contacto" aria-hidden className="contacto-ancla" />
      <ContactoManos
        intro={
          <p className="text-balance font-display-lg text-[clamp(1.75rem,3.6vw,3.125rem)] leading-[1.05] tracking-[-0.035em]">
            <span
              data-kicker
              className="mb-[0.875rem] block text-[0.9375rem] leading-normal font-semibold tracking-normal text-on-primary-container"
            >
              Planificamos, diseñamos, fabricamos.
            </span>
            {/* La clave es la posición: una palabra repetida no puede romper la entrada */}
            {palabras.map((palabra, i) => (
              <span key={i} data-palabra className="inline-block">
                {palabra}
                {i < palabras.length - 1 ? ' ' : ''}
              </span>
            ))}
          </p>
        }
        tarjeta={
          <div className="cta-luz grid w-[min(80rem,calc(100vw-2rem))] items-end gap-xl rounded-xl p-[clamp(2.25rem,6vw,5rem)] text-on-primary md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
            <div>
              {/* contacto-cierre-titulo y no contacto-titulo: ese id es el del
                  encabezado del panel de contacto (contact-parts.tsx), que se
                  abre sobre la home */}
              <h2
                data-entra
                id="contacto-cierre-titulo"
                className="max-w-[16ch] text-balance font-display-lg text-[clamp(2.25rem,1.4rem+3.2vw,4.25rem)] leading-none tracking-[-0.04em]"
              >
                ¿Tenés un caso para resolver?
              </h2>
              <p data-entra className="mt-[1.125rem] max-w-[44ch] text-body-lg text-on-primary/85">
                Enviános los estudios del paciente y coordinamos la planificación quirúrgica junto a
                tu equipo.
              </p>
            </div>
            <div className="flex flex-col items-start gap-lg md:items-end">
              {/* Versión clara del logo: el mismo archivo, llevado a blanco. La
                  entrada va en el envoltorio: el desenfoque en línea pisaría
                  el filter que lo pasa a blanco. */}
              <div data-entra>
                <Image
                  src="/logo.png"
                  alt="Innercare"
                  width={1200}
                  height={466}
                  sizes="12rem"
                  className="h-[clamp(3.5rem,2.5rem+2.5vw,4.75rem)] w-auto brightness-0 invert"
                />
              </div>
              <ContactLink data-entra data-rebote href={contactHref} className="boton boton-claro">
                {contactLabel}
              </ContactLink>
            </div>
          </div>
        }
      />
    </section>
  )
}
