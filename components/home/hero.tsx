import Link from 'next/link'
import { Hero3D } from '@/components/hero-3d/hero-3d'
import { tagline } from '@/content/company'

export function Hero() {
  return (
    <section id="inicio" className="relative overflow-hidden">
      <div className="page-container relative z-10 grid md:min-h-[calc(100dvh-72px)] md:grid-cols-12">
        <div className="flex flex-col justify-center pb-lg pt-xl md:col-span-6 md:py-section">
          <h1 className="rise-in text-balance font-display-xl text-display-xl text-on-surface">
            {tagline}
          </h1>
          <p className="rise-in mt-lg max-w-[36ch] text-body-lg text-on-surface-variant [--rise-order:1]">
            Implantes ortopédicos modulares y a medida del paciente, fabricados en
            titanio en planta propia.
          </p>
          <div className="rise-in mt-xl flex flex-wrap items-center gap-x-xl gap-y-md [--rise-order:2]">
            <Link href="/productos" className="boton boton-primario">
              Ver catálogo
            </Link>
            <Link
              href="/casos-a-medida"
              className="text-body-md text-on-surface underline decoration-outline underline-offset-[6px] transition-colors hover:decoration-on-surface"
            >
              Ver casos a medida
            </Link>
          </div>
        </div>
      </div>

      {/* El 3D va en un panel propio, con el fondo de color de la escena */}
      <Hero3D className="rise-in mx-4 h-[62vh] overflow-hidden rounded-xl [--rise-order:2] md:absolute md:inset-y-4 md:right-4 md:mx-0 md:h-auto md:w-[44%]" />
    </section>
  )
}
