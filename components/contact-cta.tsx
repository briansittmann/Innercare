import Link from 'next/link'
import { ArrowRightIcon } from '@phosphor-icons/react/ssr'

export function ContactCta({
  title = '¿Tenés un caso para resolver?',
  text = 'Enviános los estudios del paciente y coordinamos la planificación quirúrgica junto a tu equipo.',
}: {
  title?: string
  text?: string
}) {
  return (
    <section className="page-container pb-section">
      <div className="reveal grid gap-lg rounded-xl bg-primary px-lg py-xl md:grid-cols-12 md:items-end md:px-xl md:py-[64px]">
        <div className="md:col-span-8">
          <h2 className="text-balance font-display-lg text-display-lg text-on-primary">
            {title}
          </h2>
          <p className="mt-md max-w-[52ch] text-body-lg text-on-primary-container">
            {text}
          </p>
        </div>
        <div className="md:col-span-4 md:justify-self-end">
          <Link
            href="/contacto"
            className="inline-flex h-12 items-center gap-sm rounded-full bg-surface-container-lowest px-6 font-label-md text-label-md text-primary transition hover:bg-primary-fixed active:scale-[0.98]"
          >
            Contactar
            <ArrowRightIcon size={18} aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  )
}
