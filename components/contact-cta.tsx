import Image from 'next/image'
import Link from 'next/link'
import { contactHref, contactLabel } from './nav-links'

// Cierre de contacto, con la estructura del borrador de la landing
// (sección 7 del guion): un bloque en el azul de la marca con una luz arriba
// a la derecha (.cta-luz en globals.css). A la izquierda, el título y la
// bajada; a la derecha, el logo en versión clara y debajo un único botón.
// Lo usan la home y las páginas de producto.
export function ContactCta({
  id,
  // Con contexto (p. ej. ?producto=<slug>) el formulario llega precargado.
  href = contactHref,
  title = '¿Tenés un caso para resolver?',
  text = 'Enviános los estudios del paciente y coordinamos la planificación quirúrgica junto a tu equipo.',
}: {
  id?: string
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
      <div className="cta-luz grid items-end gap-xl rounded-xl p-[clamp(2.25rem,6vw,5rem)] text-on-primary md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
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
