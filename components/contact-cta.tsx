import Image from 'next/image'
import Link from 'next/link'
import { contactHref, contactLabel } from './nav-links'

// Cierre de contacto, con la estructura del borrador de la landing
// (sección 7 del guion): un bloque en el azul de la marca con una luz arriba
// a la derecha (.cta-luz en globals.css). A la izquierda, el título y la
// bajada; a la derecha, el logo en versión clara y debajo un único botón.
// Lo usan la home y las páginas de producto.
//
// Con `cinta` (solo en la home), por detrás del contenido va la cinta de
// fibras del hero en blanco, para que la página cierre con la pieza con la
// que abre. Es una imagen fija con transparencia (una captura de GhostFibers,
// procedimiento en docs/landing/BITACORA.md, fase 6), sin contexto WebGL: una
// para escritorio (apaisada) y otra para el celular (vertical), con la cinta
// atenuada detrás del texto y apagada contra el borde. Deriva apenas con el
// scroll (.cta-cinta, animación ligada al scroll: fuera de pantalla no corre)
// y queda quieta con movimiento reducido.
export function ContactCta({
  id,
  // Con contexto (p. ej. ?producto=<slug>) el formulario llega precargado.
  href = contactHref,
  title = '¿Tenés un caso para resolver?',
  text = 'Enviános los estudios del paciente y coordinamos la planificación quirúrgica junto a tu equipo.',
  cinta = false,
}: {
  id?: string
  cinta?: boolean
  href?: string
  title?: string
  text?: string
}) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-titulo` : undefined}
      className="page-container py-[clamp(5.5rem,13vh,9.375rem)]"
    >
      <div className="cta-luz relative isolate grid items-end gap-xl overflow-hidden rounded-xl p-[clamp(2.25rem,6vw,5rem)] text-on-primary md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        {cinta && (
          <div aria-hidden className="absolute inset-0 -z-10">
            <div className="cta-cinta absolute inset-0">
              <Image
                src="/img/cinta-contacto.webp"
                alt=""
                fill
                sizes="(min-width: 80rem) 80rem, 100vw"
                className="hidden object-cover md:block"
              />
              <Image
                src="/img/cinta-contacto-movil.webp"
                alt=""
                fill
                sizes="100vw"
                className="object-cover md:hidden"
              />
            </div>
          </div>
        )}
        <div>
          <h2
            id={id ? `${id}-titulo` : undefined}
            className="max-w-[16ch] text-balance font-display-lg text-[clamp(2.25rem,1.4rem+3.2vw,4.25rem)] leading-none tracking-[-0.04em]"
          >
            {title}
          </h2>
          <p className="mt-[1.125rem] max-w-[44ch] text-body-lg text-on-primary/85">{text}</p>
        </div>
        <div className="flex flex-col items-start gap-lg md:items-end">
          {/* Versión clara del logo: el mismo archivo, llevado a blanco */}
          <Image
            src="/logo.png"
            alt="Innercare"
            width={1200}
            height={466}
            sizes="12rem"
            className="h-[clamp(3.5rem,2.5rem+2.5vw,4.75rem)] w-auto brightness-0 invert"
          />
          <Link href={href} className="boton boton-claro">
            {contactLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
