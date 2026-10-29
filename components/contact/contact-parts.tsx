import type { CSSProperties, ReactNode } from 'react'
import { PhoneIcon, WhatsappLogoIcon } from '@phosphor-icons/react/ssr'
import { sedePrincipal, whatsappDisplay, whatsappNumber } from '@/content/company'
import { contactoTextos, isMotivoContacto } from '@/content/contact'
import { getProducts } from '@/content/products'
import { ContactForm, type ContactLayout } from './contact-form'

type SearchParams = Promise<Record<string, string | string[] | undefined>>

const order = (index: number) => ({ '--i': index }) as CSSProperties
const telHref = (phone: string) => `tel:+${phone.replace(/\D/g, '')}`

// Lee el contexto de la URL y precarga el formulario: /contacto?producto=<slug>
// marca "Consulta sobre un producto" con ese producto elegido, y
// ?motivo=<id> marca el motivo. Lee searchParams, así que va dentro de
// <Suspense> (Cache Components).
export async function ContactFormLoader({
  layout,
  searchParams,
  heading,
  aside,
}: {
  layout: ContactLayout
  searchParams: SearchParams
  heading?: ReactNode
  aside?: ReactNode
}) {
  const [params, products] = await Promise.all([searchParams, getProducts()])
  const product = products.find((item) => item.slug === params.producto)
  const motivo = product ? 'producto' : isMotivoContacto(params.motivo) ? params.motivo : undefined

  return (
    <ContactForm
      layout={layout}
      products={products.map((item) => ({ slug: item.slug, name: item.shortName }))}
      initialMotivo={motivo}
      initialProducto={product?.slug}
      heading={heading}
      aside={aside}
    />
  )
}

export function ContactHeading() {
  return (
    <div className="field-in pr-12 pt-lg" style={order(0)}>
      <h2 id="contacto-titulo" className="font-headline-lg text-headline-lg text-on-surface">
        {contactoTextos.titulo}
      </h2>
      <p className="mt-sm max-w-[44ch] text-body-md text-on-surface-variant">{contactoTextos.bajada}</p>
    </div>
  )
}

export function ContactChannels({ index, className = '' }: { index: number; className?: string }) {
  const phones = sedePrincipal.phones.filter((phone) => phone !== whatsappDisplay)
  return (
    <div className={`field-in ${className}`} style={order(index)}>
      <p className="text-body-sm text-on-surface-variant">{contactoTextos.otrosCanales}</p>
      <ul className="mt-sm flex flex-wrap gap-x-lg gap-y-sm text-body-md">
        <li>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-sm text-on-surface underline decoration-outline underline-offset-[6px] transition-colors hover:decoration-on-surface"
          >
            <WhatsappLogoIcon size={20} weight="light" aria-hidden />
            WhatsApp {whatsappDisplay}
          </a>
        </li>
        {phones.map((phone) => (
          <li key={phone}>
            <a
              href={telHref(phone)}
              className="inline-flex items-center gap-sm text-on-surface underline decoration-outline underline-offset-[6px] transition-colors hover:decoration-on-surface"
            >
              <PhoneIcon size={20} weight="light" aria-hidden />
              {phone}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Esqueleto con la forma del formulario mientras llega el contexto de la URL.
export function ContactFormSkeleton({ layout, heading }: { layout: ContactLayout; heading?: ReactNode }) {
  return (
    <div aria-hidden className={layout === 'panel' ? 'flex min-h-0 flex-1 flex-col' : 'flex flex-col'}>
      <div className="h-1 w-full bg-surface-container-high" />
      <div className={layout === 'panel' ? 'px-lg md:px-xl' : 'p-lg md:p-xl'}>
        {heading}
        <div className="mt-lg flex flex-col gap-lg">
          <div className="grid gap-sm sm:grid-cols-2">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-12 animate-pulse rounded-control bg-surface-container" />
            ))}
          </div>
          {[0, 1].map((item) => (
            <div key={item} className="h-12 animate-pulse rounded-xl bg-surface-container" />
          ))}
          <div className="h-32 animate-pulse rounded-xl bg-surface-container" />
        </div>
      </div>
    </div>
  )
}
