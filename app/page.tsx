import { FondoMalla } from '@/components/fondo-malla'
import { PantallaCarga } from '@/components/pantalla-carga'
import { Contacto } from '@/components/home/contacto'
import { Credentials } from '@/components/home/credentials'
import { Locations } from '@/components/home/locations'
import { Manufacturing } from '@/components/home/manufacturing'
import { Process } from '@/components/home/process'
import { Tour } from '@/components/home/tour'

// Secciones de la landing (el hero va dentro del recorrido: cuerpo único), en el orden del guion (docs/landing/LANDING_SPEC.md,
// sección 3). Los ids de #recorrido, #proceso, #fabricacion y #habilitaciones
// coinciden con las anclas del menú de la barra (components/nav-links.ts).
// Antes, la pantalla de carga: tapa la página hasta que el 3D entero está
// listo y al irse arranca la entrada de la home.
export default function Home() {
  return (
    <>
      <PantallaCarga />
      <Tour />
      <Process />
      <Manufacturing />
      <Credentials />
      {/* Distribución sobre la malla hexagonal de fondo, como al cierre de
          las fichas; después, el cierre de contacto con las manos de
          partículas, en su escenario oscuro */}
      <FondoMalla hastaFooter={false}>
        <Locations />
      </FondoMalla>
      <Contacto />
    </>
  )
}
