import { ContactCta } from '@/components/contact-cta'
import { Hero } from '@/components/home/hero'
import { OwnManufacturing } from '@/components/home/own-manufacturing'
import { Process } from '@/components/home/process'
import { Statement } from '@/components/home/statement'
import { Tour } from '@/components/home/tour'

// Los ids de las secciones coinciden con las anclas del menú de la barra
// superior (components/nav-links.ts).
export default function Home() {
  return (
    <>
      <Hero />
      <Tour />
      <Process />
      <Statement />
      <OwnManufacturing />
      <ContactCta id="contacto" />
    </>
  )
}
