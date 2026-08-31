import { Link } from 'react-router-dom'
import Reveal from './Reveal.jsx'
import { step } from '../lib/motion.js'
import WordReveal from './WordReveal.jsx'

import { tagline } from '../data/company.js'

export default function Hero() {
  return (
    <section className="py-section px-gutter max-w-container-max mx-auto grid md:grid-cols-2 gap-section items-center">
      <div className="space-y-xl">
        <div className="space-y-md">
          <Reveal
            as="span"
            className="inline-block px-md py-xs bg-surface-container-high text-primary font-label-md text-label-md rounded-full tracking-widest uppercase"
          >
            Innovación Ortopédica
          </Reveal>
          <WordReveal
            as="h1"
            text={tagline}
            delay={0.12}
            stagger={0.06}
            className="font-display-lg text-display-lg text-primary max-w-[32rem]"
          />
          <Reveal
            as="p"
            delay={step(2)}
            className="font-body-lg text-body-lg text-on-surface-variant max-w-[34rem]"
          >
            Fabricamos implantes ortopédicos modulares y a medida del paciente en titanio
            biocompatible, con planificación quirúrgica 3D junto al equipo médico. Habilitados
            por ANMAT para fabricar, importar y distribuir productos médicos en todo el país.
          </Reveal>
        </div>
        <Reveal delay={step(3)} className="flex flex-wrap gap-md">
          <Link
            to="/productos"
            state={{ slideIn: true }}
            className="bg-primary-container text-on-primary px-xl py-md rounded-lg font-label-md text-label-md hover:bg-surface-tint transition-colors flex items-center gap-sm shadow-sm w-fit"
          >
            Explorar Catálogo
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
          <Link
            to="/casos-a-medida"
            className="bg-surface text-primary border border-outline px-xl py-md rounded-lg font-label-md text-label-md hover:bg-surface-container hover:border-primary transition-colors flex items-center gap-sm w-fit"
          >
            Ver Casos a Medida
          </Link>
        </Reveal>
      </div>
      <Reveal
        delay={step(4)}
        className="relative w-full aspect-[1.79] rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm bg-surface-container-lowest"
      >
        <img
          alt="Centros de mecanizado CNC en la planta industrial de Innercare"
          className="w-full h-full object-cover"
          src="/img/fabricacion-cnc-planta.jpg"
        />
        <div className="absolute bottom-md left-md bg-surface/90 backdrop-blur-sm p-md rounded-lg border border-outline-variant shadow-sm">
          <p className="font-label-md text-label-md text-primary mb-xs">Planta industrial</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Mecanizado CNC en titanio biocompatible
          </p>
        </div>
      </Reveal>
    </section>
  )
}
