import Link from 'next/link'

export function ContactCta({
  id,
  // Con contexto (p. ej. ?producto=<slug>) el formulario llega precargado.
  href = '/contacto',
  title = '¿Tenés un caso para resolver?',
  text = 'Enviános los estudios del paciente y coordinamos la planificación quirúrgica junto a tu equipo.',
}: {
  id?: string
  href?: string
  title?: string
  text?: string
}) {
  return (
    <section id={id} className="page-container pb-section">
      <div className="reveal grid gap-lg border-t border-outline-variant pt-section md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <h2 className="text-balance font-display-lg text-display-lg text-on-surface">
            {title}
          </h2>
          <p className="mt-md max-w-[52ch] text-body-lg text-on-surface-variant">{text}</p>
        </div>
        <div className="md:col-span-4 md:justify-self-end">
          <Link href={href} className="boton boton-primario">
            Contactar
          </Link>
        </div>
      </div>
    </section>
  )
}
