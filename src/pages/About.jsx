import Reveal from '../components/Reveal.jsx'
import WordReveal from '../components/WordReveal.jsx'
import { step } from '../lib/motion.js'
import { capacidades, habilitaciones, manufactura, trayectoria } from '../data/company.js'

export default function About() {
  return (
    <main className="flex-grow">
      <section className="py-section px-gutter bg-surface-container-low border-b border-outline-variant relative overflow-hidden">
        <div className="max-w-container-max mx-auto grid md:grid-cols-12 gap-lg items-center relative z-10">
          <div className="md:col-span-7">
            <WordReveal
              as="h1"
              text="Impulsando la Ortopedia a través de la Precisión"
              delay={0.12}
              stagger={0.06}
              className="font-display-lg text-display-lg text-primary mb-md"
            />
            <Reveal delay={step(2)}>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                {trayectoria}
              </p>
            </Reveal>
          </div>
          <Reveal
            delay={step(3)}
            x={48}
            y={0}
            className="md:col-span-5 h-[400px] rounded-lg overflow-hidden border border-outline-variant/30 shadow-sm bg-surface relative"
          >
            <img
              className="w-full h-full object-cover"
              alt="Centro de mecanizado CNC en la planta industrial de Innercare"
              src="/img/fabricacion-cnc-maquina.jpg"
            />
          </Reveal>
        </div>
      </section>

      <section id="fabricacion" className="py-section px-gutter scroll-mt-20">
        <div className="max-w-container-max mx-auto">
          <Reveal className="mb-xl">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">
              Fabricación propia
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
              Producimos implantes en titanio biocompatible con las dos tecnologías, lo que nos
              permite resolver tanto series modulares como piezas únicas para un paciente.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-lg">
            {manufactura.map((item, i) => (
              <Reveal
                key={item.id}
                delay={step(i)}
                className="bg-surface border border-outline-variant rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <img
                  className="w-full h-[260px] object-cover border-b border-outline-variant"
                  alt={item.imageAlt}
                  src={item.image}
                />
                <div className="p-lg">
                  <p className="font-body-sm text-body-sm text-primary uppercase tracking-widest mb-xs">
                    {item.kicker}
                  </p>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    {item.title}
                  </h3>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-section px-gutter bg-surface-container-lowest border-y border-outline-variant">
        <div className="max-w-container-max mx-auto">
          <Reveal className="mb-xl">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">
              Capacidades
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl">
              Cubrimos el circuito completo: desde la planificación del caso hasta la entrega
              trazada del producto en cualquier punto del país.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-lg">
            {capacidades.map((item, i) => (
              <Reveal
                key={item.title}
                delay={step(i)}
                className="bg-surface border border-outline-variant rounded-lg p-lg shadow-sm flex flex-col"
              >
                <div className="w-12 h-12 rounded-lg bg-primary-fixed text-on-primary-fixed flex items-center justify-center mb-md">
                  <span className="material-symbols-outlined fill-icon">{item.icon}</span>
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

      <section id="habilitaciones" className="py-section px-gutter scroll-mt-20">
        <div className="max-w-container-max mx-auto grid md:grid-cols-12 gap-xl">
          <Reveal className="md:col-span-4">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-md">
              Habilitaciones
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant">
              Operamos bajo habilitación de la ANMAT para fabricar, importar y distribuir
              productos médicos, y cada unidad se registra en el Sistema Nacional de
              Trazabilidad.
            </p>
          </Reveal>
          <div className="md:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-md">
            {habilitaciones.map((item, i) => (
              <Reveal
                key={item.id}
                delay={step(i)}
                className="bg-surface border border-outline-variant rounded-lg p-lg shadow-sm flex flex-col"
              >
                <span className="font-label-md text-label-md text-primary uppercase tracking-widest mb-sm">
                  {item.organismo}
                </span>
                <p className="font-body-md text-body-md text-on-surface flex-grow mb-md">
                  {item.detalle}
                </p>
                <p className="font-data-mono text-data-mono text-on-surface-variant bg-surface-container-low border border-outline-variant/60 rounded px-sm py-xs">
                  {item.referencia}
                </p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
