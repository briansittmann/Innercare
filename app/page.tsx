import { ContactCta } from '@/components/contact-cta'
import { Hero } from '@/components/home/hero'
import { OwnManufacturing } from '@/components/home/own-manufacturing'
import { Statement } from '@/components/home/statement'

// Los ids de las secciones coinciden con las anclas del menú de la barra
// superior (components/nav-links.ts). Faltan #recorrido y #proceso: los suma
// la fase 2 de la landing (docs/landing/BITACORA.md).
export default function Home() {
  return (
    <>
      <Hero />
      <Statement />
      <OwnManufacturing />
      <ContactCta id="contacto" />
    </>
  )
}
