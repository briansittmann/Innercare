import { ContactCta } from '@/components/contact-cta'
import { FondoMalla } from '@/components/fondo-malla'
import { Credentials } from '@/components/home/credentials'
import { Locations } from '@/components/home/locations'
import { Manufacturing } from '@/components/home/manufacturing'
import { Process } from '@/components/home/process'
import { Tour } from '@/components/home/tour'

// Secciones de la landing (el hero va dentro del recorrido: cuerpo único), en el orden del guion (docs/landing/LANDING_SPEC.md,
// sección 3). Los ids de #recorrido, #proceso, #fabricacion y #habilitaciones
// coinciden con las anclas del menú de la barra (components/nav-links.ts).
export default function Home() {
  return (
    <>
      <Tour />
      <Process />
      <Manufacturing />
      <Credentials />
      {/* De Distribución al contacto, la malla hexagonal de fondo, como al
          cierre de las fichas */}
      <FondoMalla>
        <Locations />
        <ContactCta id="contacto" />
      </FondoMalla>
    </>
  )
}
