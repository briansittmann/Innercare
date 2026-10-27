import Image from 'next/image'
import Link from 'next/link'
import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import { tagline } from '@/content/company'

export function Hero() {
  return (
    <section className="page-container grid items-center gap-xl pb-section pt-xl md:min-h-[calc(100dvh-72px)] md:grid-cols-12 md:pb-xl md:pt-lg">
      <div className="md:col-span-7">
        <p className="rise-in font-label-md text-label-md uppercase text-primary-container">
          Fabricante habilitado por ANMAT
        </p>
        <h1 className="rise-in mt-md text-balance font-display-xl text-display-xl text-on-surface [--rise-order:1]">
          {tagline}
        </h1>
        <p className="rise-in mt-lg max-w-[46ch] text-body-lg text-on-surface-variant [--rise-order:2]">
          Fabricamos implantes ortopédicos modulares y a medida del paciente en
          titanio biocompatible, con planificación quirúrgica 3D.
        </p>
        <div className="rise-in mt-xl flex flex-wrap gap-md [--rise-order:3]">
          <Link
            href="/productos"
            className="inline-flex h-12 items-center gap-sm rounded-full bg-primary px-6 font-label-md text-label-md text-on-primary transition hover:bg-primary-container active:scale-[0.98]"
          >
            Ver catálogo
            <ArrowRightIcon size={18} aria-hidden />
          </Link>
          <Link
            href="/casos-a-medida"
            className="inline-flex h-12 items-center rounded-full border border-outline-variant bg-surface-container-lowest px-6 font-label-md text-label-md text-primary transition hover:border-primary active:scale-[0.98]"
          >
            Ver casos a medida
          </Link>
        </div>
      </div>

      {/* Hueco de la pieza 3D: en la fase 3D esta imagen se reemplaza por la escena. */}
      <div className="rise-in relative aspect-square overflow-hidden rounded-xl bg-surface-container-lowest ring-1 ring-outline-variant/50 [--rise-order:2] md:col-span-5">
        <Image
          src="/img/caso-intercalar-implante.jpg"
          alt="Implante intercalar de fémur junto a las guías de resección fabricadas"
          fill
          preload
          sizes="(min-width: 768px) 40vw, 100vw"
          className="scale-[1.04] object-cover"
        />
      </div>
    </section>
  )
}
