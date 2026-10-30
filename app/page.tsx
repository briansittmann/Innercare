import { ContactCta } from '@/components/contact-cta'
import { Credentials } from '@/components/home/credentials'
import { Hero } from '@/components/home/hero'
import { Locations } from '@/components/home/locations'
import { Manufacturing } from '@/components/home/manufacturing'
import { Process } from '@/components/home/process'
import { Tour } from '@/components/home/tour'

// Secciones de la landing, en el orden del guion (docs/landing/LANDING_SPEC.md,
// sección 3). Los ids de #recorrido, #proceso, #fabricacion y #habilitaciones
// coinciden con las anclas del menú de la barra (components/nav-links.ts).
export default function Home() {
  return (
    <>
      <Hero />
      <Tour />
      <Process />
      <Manufacturing />
      <Credentials />
      <Locations />
      <ContactCta id="contacto" />
    </>
  )
}
