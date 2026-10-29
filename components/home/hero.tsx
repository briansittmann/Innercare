import Link from 'next/link'
import { Hero3D } from '@/components/hero-3d/hero-3d'
import { tagline } from '@/content/company'

// El hero entero tiene el degradé de azules de la marca, de borde a borde, y
// sube por detrás del header (64 px en el celular, 72 en escritorio), que es
// sticky y transparente arriba de todo. Texto y 3D comparten ese fondo: el
// canvas es transparente y el vidrio refracta el mismo degradé. Termina en un
// corte recto contra el gris de la sección siguiente, que coincide con el
// corte del busto.
export function Hero() {
  return (
    <section
      id="inicio"
      className="relative -mt-16 overflow-hidden bg-linear-to-b from-stage-from to-stage-to pt-16 md:-mt-[72px] md:pt-[72px]"
    >
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
              className="text-body-md text-on-surface underline decoration-on-surface-variant underline-offset-[6px] transition-colors hover:decoration-on-surface"
            >
              Ver casos a medida
            </Link>
          </div>
        </div>
      </div>

      {/* Sin bordes propios: en escritorio ocupa todo el alto, desde el 40 %
          del ancho (por detrás del final del texto, que va encima), con la
          figura al 57 %; en el celular va debajo del texto, centrada y un poco
          metida bajo los botones. El canvas es más ancho que el busto para
          que no corte los hombros. */}
      <Hero3D className="rise-in -mt-xl h-[62vh] [--hero-3d-foco:0.5] [--rise-order:2] md:absolute md:right-0 md:bottom-0 md:mt-0 md:aspect-[14/15] md:h-[min(100%,80vw)] md:w-auto md:[--hero-3d-foco:0.555]" />
    </section>
  )
}
