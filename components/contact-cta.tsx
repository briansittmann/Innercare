import Image from 'next/image'
import Link from 'next/link'
import { contactHref, contactLabel } from './nav-links'

// Cierre de contacto: un bloque en el azul de la marca, con el título a la
// izquierda y, a la derecha, el logo en blanco y un único botón (guion de la
// landing, sección 7). De fondo, anillos concéntricos muy tenues, como los
// cortes de una tomografía: solo CSS (.cta-cortes en globals.css), quietos.
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
    <section id={id} aria-labelledby={id ? `${id}-titulo` : undefined} className="page-container py-section">
      <div className="cta-cortes relative isolate grid gap-xl overflow-hidden rounded-xl bg-primary px-lg py-xl text-on-primary sm:px-xl md:grid-cols-12 md:items-end md:px-[4rem] md:py-[5rem]">
        <div className="md:col-span-7">
          <h2
            id={id ? `${id}-titulo` : undefined}
            className="max-w-[16ch] text-balance font-display-lg text-display-lg"
          >
            {title}
          </h2>
          <p className="mt-md max-w-[44ch] text-body-lg text-on-primary/80">{text}</p>
        </div>
        <div className="flex flex-col items-start gap-lg md:col-span-5 md:items-end">
          {/* Versión clara del logo: el mismo archivo, llevado a blanco */}
          <Image
            src="/logo.png"
            alt=""
            width={1200}
            height={466}
            sizes="160px"
            className="hidden h-12 w-auto brightness-0 invert md:block"
          />
          <Link href={href} className="boton boton-claro">
            {contactLabel}
          </Link>
        </div>
      </div>
    </section>
  )
}
