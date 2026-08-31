import { Link } from 'react-router-dom'
import Reveal from '../components/Reveal.jsx'
import WordReveal from '../components/WordReveal.jsx'
import { step } from '../lib/motion.js'
import customCases, { featuredCase, proceso } from '../data/customCases.js'

export default function CustomCases() {
  return (
    <main className="flex-grow">
      <section className="py-section px-gutter bg-surface-container-low border-b border-outline-variant">
        <div className="max-w-container-max mx-auto grid md:grid-cols-12 gap-lg items-center">
          <div className="md:col-span-7">
            <Reveal
              as="span"
              className="inline-block px-md py-xs bg-surface-container-high text-primary font-label-md text-label-md rounded-full tracking-widest uppercase mb-md"
            >
              Casos a Medida
            </Reveal>
            <WordReveal
              as="h1"
              text="Implantes personalizados a medida del paciente"
              delay={0.12}
              stagger={0.06}
              className="font-display-lg text-display-lg text-primary mb-md"
            />
            <Reveal delay={step(2)}>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                Planificación quirúrgica virtual 3D. Biomodelos, guías y accesorios
                desarrollados a pedido médico, fabricados en titanio biocompatible y PMMA.
              </p>
            </Reveal>
          </div>
          <Reveal
            delay={step(3)}
            x={48}
            y={0}
            className="md:col-span-5 rounded-lg overflow-hidden border border-outline-variant/30 shadow-sm bg-surface"
          >
            <img
              className="w-full h-[320px] object-cover"
              alt="Segmentación 3D de pelvis para planificación quirúrgica virtual"
              src="/img/caso-planificacion-3d.jpg"
            />
          </Reveal>
        </div>
      </section>

      <section className="py-section px-gutter">
        <div className="max-w-container-max mx-auto">
          <Reveal className="mb-xl">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">
              Cómo trabajamos cada caso
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
              Cada implante se desarrolla junto al equipo quirúrgico, desde el estudio del
              paciente hasta la entrega de la pieza y su instrumental.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
            {proceso.map((item, i) => (
              <Reveal
                key={item.step}
                delay={step(i)}
                className="bg-surface border border-outline-variant rounded-lg p-lg shadow-sm"
              >
                <div className="flex items-center gap-sm mb-md">
                  <div className="w-12 h-12 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center">
                    <span className="material-symbols-outlined fill-icon">{item.icon}</span>
                  </div>
                  <span className="font-data-mono text-data-mono text-on-surface-variant">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">
                  {item.title}
                </h3>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {item.description}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-section px-gutter bg-surface-container-lowest border-y border-outline-variant">
        <div className="max-w-container-max mx-auto">
          <Reveal className="mb-lg">
            <span className="font-label-md text-label-md text-primary uppercase tracking-widest">
              {featuredCase.kicker}
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-sm mb-sm">
              {featuredCase.title}
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
              {featuredCase.summary}
            </p>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-md mb-xl">
            {featuredCase.images.map((image, i) => (
              <Reveal
                key={image.src}
                delay={step(i)}
                className="bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm"
              >
                <img
                  className="w-full h-[260px] object-cover bg-surface"
                  alt={image.alt}
                  src={image.src}
                />
                <p className="font-label-md text-label-md text-on-surface-variant p-md border-t border-outline-variant">
                  {image.caption}
                </p>
              </Reveal>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            <Reveal className="bg-surface border border-outline-variant rounded-lg p-lg shadow-sm">
              <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">
                Guías de resección
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {featuredCase.guias}
              </p>
            </Reveal>
            <Reveal
              delay={step(1)}
              className="bg-surface border border-outline-variant rounded-lg p-lg shadow-sm"
            >
              <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">Diseño</h3>
              <ul className="space-y-sm">
                {featuredCase.diseno.map((item) => (
                  <li key={item} className="flex gap-sm">
                    <span className="material-symbols-outlined text-primary text-[18px] mt-[2px] shrink-0">
                      check_small
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-section px-gutter">
        <div className="max-w-container-max mx-auto">
          <Reveal className="mb-xl">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">
              Casos desarrollados
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
              Una selección de implantes, guías y espaciadores diseñados y fabricados a pedido
              médico.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {customCases.map((item, i) => (
              <Reveal
                key={item.id}
                delay={step(i % 3)}
                className="bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm hover:border-primary-container hover:shadow-md transition-all duration-300 flex flex-col"
              >
                <div className="aspect-[4/3] bg-surface-container-lowest border-b border-outline-variant overflow-hidden">
                  <img
                    className="w-full h-full object-cover"
                    alt={item.imageAlt}
                    src={item.image}
                    loading="lazy"
                  />
                </div>
                <div className="p-lg flex flex-col flex-grow">
                  <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">
                    {item.title}
                  </h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {item.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-section px-gutter bg-primary text-on-primary text-center">
        <Reveal className="max-w-container-max mx-auto">
          <h2 className="font-headline-lg text-headline-lg mb-sm">
            ¿Tenés un caso para resolver?
          </h2>
          <p className="font-body-md text-body-md mb-lg max-w-2xl mx-auto opacity-90">
            Enviános los estudios del paciente y coordinamos la planificación quirúrgica junto a
            tu equipo.
          </p>
          <Link
            to="/contacto"
            className="inline-flex items-center gap-sm bg-surface text-primary px-xl py-md rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors"
          >
            Plantear un caso
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </Reveal>
      </section>
    </main>
  )
}
