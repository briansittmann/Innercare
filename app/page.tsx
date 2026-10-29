import { ContactCta } from '@/components/contact-cta'
import { CustomCasesTeaser } from '@/components/home/custom-cases'
import { Hero } from '@/components/home/hero'
import { OwnManufacturing } from '@/components/home/own-manufacturing'
import { SectionIndex } from '@/components/home/section-index'
import { Statement } from '@/components/home/statement'

// Cada id coincide con el de su <section>.
const sections = [
  { id: 'inicio', label: 'Inicio' },
  { id: 'habilitaciones', label: 'Habilitaciones' },
  { id: 'fabricacion', label: 'Fabricación propia' },
  { id: 'casos', label: 'Casos a medida' },
  { id: 'contacto', label: 'Contacto' },
] as const

export default function Home() {
  return (
    <>
      <SectionIndex items={sections} />
      <Hero />
      <Statement />
      <OwnManufacturing />
      <CustomCasesTeaser />
      <ContactCta id="contacto" />
    </>
  )
}
