import { Suspense } from 'react'
import { ContactModal } from '@/components/contact/contact-modal'
import {
  ContactChannels,
  ContactFormLoader,
  ContactFormSkeleton,
  ContactHeading,
} from '@/components/contact/contact-parts'

// Intercepta /contacto al navegar dentro del sitio y lo abre como panel sobre
// la página actual. La URL cambia igual, así que se puede compartir, y "atrás"
// lo cierra.
export default function ContactoPanel(props: PageProps<'/contacto'>) {
  return (
    <ContactModal>
      <Suspense fallback={<ContactFormSkeleton layout="panel" heading={<ContactHeading />} />}>
        <ContactFormLoader
          layout="panel"
          searchParams={props.searchParams}
          heading={<ContactHeading />}
          aside={<ContactChannels index={8.5} className="mt-xl border-t border-outline-variant pt-lg" />}
        />
      </Suspense>
    </ContactModal>
  )
}
