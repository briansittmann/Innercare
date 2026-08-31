import { Link } from 'react-router-dom'
import Reveal from './Reveal.jsx'
import { step } from '../lib/motion.js'
import WordReveal from './WordReveal.jsx'

const headline = 'Innovación tecnológica para el beneficio del paciente'

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
            text={headline}
            delay={0.12}
            stagger={0.06}
            className="font-display-lg text-display-lg text-primary max-w-[32rem]"
          />
          <Reveal
            as="p"
            delay={step(2)}
            className="font-body-lg text-body-lg text-on-surface-variant max-w-[34rem]"
          >
            Innercare desarrolla endoprótesis modulares avanzadas e instrumental
            quirúrgico de precisión. Trabajamos junto a cirujanos ortopédicos para
            restaurar la movilidad y mejorar los resultados de cada paciente con
            excelencia clínica inclaudicable.
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
            to="/nosotros"
            className="bg-surface text-primary border border-outline px-xl py-md rounded-lg font-label-md text-label-md hover:bg-surface-container hover:border-primary transition-colors flex items-center gap-sm w-fit"
          >
            Especificaciones Técnicas
          </Link>
        </Reveal>
      </div>
      <Reveal
        delay={step(4)}
        className="relative w-full aspect-[1.79] rounded-xl overflow-hidden border border-outline-variant/30 shadow-sm bg-surface-container-lowest"
      >
        <img
          alt="Endoprótesis femoral modular"
          className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuA_cq3pUPccjk_gW8wdbTa-p0H0i5SJ-yb-SFU3z3rji7nEYKKn_mCYyS2T1UipzA4YhRJayuX5Xb6EDZteUg2QS9rEwGn6gVes-JwHXsF26ed3lsTHVijieIcbwn9qyS-TcqaeQphSDlMMxUdNxMpXAUrdLPNYB0sHgBdODZ5eaYF17BU1DjeV9GDhzxP88F7I-ZFiv03Wtj9_ggUv5avYXD1rOv9dDjpUn-3iodseAtKk_CS5cOt0vA"
        />
        <div className="absolute bottom-md left-md bg-surface/90 backdrop-blur-sm p-md rounded-lg border border-outline-variant shadow-sm">
          <p className="font-label-md text-label-md text-primary mb-xs">Sistema IC-Femoral</p>
          <p className="font-body-sm text-body-sm text-on-surface-variant">
            Aleación de Titanio Ti-6Al-4V
          </p>
        </div>
      </Reveal>
    </section>
  )
}
