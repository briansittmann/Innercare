import Link from 'next/link'
import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import { Hero3D } from '@/components/hero-3d/hero-3d'
import { tagline } from '@/content/company'

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="page-container relative z-10 grid md:min-h-[calc(100dvh-72px)] md:grid-cols-12">
        <div className="flex flex-col justify-center pb-lg pt-xl md:col-span-7 md:py-section">
          <h1 className="rise-in text-balance font-display-xl text-display-xl text-on-surface">
            {tagline}
          </h1>
          <p className="rise-in mt-lg max-w-[36ch] text-body-lg text-on-surface-variant [--rise-order:1]">
            Implantes ortopédicos modulares y a medida del paciente, fabricados en
            titanio en planta propia.
          </p>
          <div className="rise-in mt-xl flex flex-wrap items-center gap-x-xl gap-y-md [--rise-order:2]">
            <Link
              href="/productos"
              className="inline-flex h-12 items-center gap-sm rounded-full bg-primary px-6 text-body-md font-medium text-on-primary transition hover:bg-primary-container active:scale-[0.98]"
            >
              Ver catálogo
              <ArrowRightIcon size={18} aria-hidden />
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

      <Hero3D className="rise-in h-[62vh] w-full [--rise-order:2] md:absolute md:inset-y-0 md:right-0 md:h-auto md:w-[56%]" />
    </section>
  )
}
