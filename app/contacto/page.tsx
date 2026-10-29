import type { Metadata } from 'next'
import { Suspense } from 'react'
import {
  ContactChannels,
  ContactFormLoader,
  ContactFormSkeleton,
} from '@/components/contact/contact-parts'
import { contactoTextos } from '@/content/contact'

export const metadata: Metadata = {
  title: 'Contacto',
  description:
    'Consultas sobre implantes ortopédicos, casos a medida y compras institucionales. Respondemos por email, WhatsApp o teléfono.',
}

// Página completa: se ve al entrar directo a /contacto o al recargar. Desde
// el resto del sitio, la misma ruta se abre como panel (app/@modal).
export default function ContactoPage(props: PageProps<'/contacto'>) {
  return (
    <section className="page-container py-section">
      <div className="grid gap-xl md:grid-cols-12">
        <div className="md:col-span-5">
          <h1 className="rise-in font-display-lg text-display-lg text-on-surface">{contactoTextos.titulo}</h1>
          <p className="rise-in mt-md max-w-[40ch] text-body-lg text-on-surface-variant [--rise-order:1]">
            {contactoTextos.bajada}
          </p>
          <ContactChannels index={2} className="mt-xl" />
        </div>
        <div className="md:col-span-7">
          <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest">
            <Suspense fallback={<ContactFormSkeleton layout="page" />}>
              <ContactFormLoader layout="page" searchParams={props.searchParams} />
            </Suspense>
          </div>
        </div>
      </div>
    </section>
  )
}
