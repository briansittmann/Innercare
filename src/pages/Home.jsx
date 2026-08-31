import { Link } from 'react-router-dom'
import Hero from '../components/Hero.jsx'
import Reveal from '../components/Reveal.jsx'
import ProductCard from '../components/ProductCard.jsx'
import { step } from '../lib/motion.js'
import products from '../data/products.js'
import { habilitaciones } from '../data/company.js'

const commitments = [
  {
    icon: 'precision_manufacturing',
    title: 'Fabricación propia',
    description:
      'Mecanizado CNC e impresión 3D en titanio biocompatible, en planta propia y con sistema de gestión de calidad.',
  },
  {
    icon: '3d_rotation',
    title: 'Implantes a medida',
    description:
      'Planificación quirúrgica virtual 3D, biomodelos y guías de resección desarrollados a pedido médico para cada paciente.',
  },
  {
    icon: 'verified',
    title: 'Habilitación y trazabilidad',
    description:
      'Habilitados por ANMAT para fabricar, importar y distribuir productos médicos, con trazabilidad de cada unidad.',
  },
]

export default function Home() {
  return (
    <main className="flex-grow">
      <Hero />

      <section className="bg-surface-container-low py-section">
        <div className="max-w-container-max mx-auto px-gutter grid md:grid-cols-3 gap-lg">
          {commitments.map((item, i) => (
            <Reveal
              key={item.title}
              delay={step(i)}
              className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary-fixed text-on-primary-fixed rounded-lg flex items-center justify-center mb-md">
                <span className="material-symbols-outlined fill-icon">{item.icon}</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">{item.title}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                {item.description}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-section px-gutter">
        <div className="max-w-container-max mx-auto">
          <Reveal className="mb-xl flex flex-wrap items-end justify-between gap-md">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">
                Fabricación propia
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl">
                Sistemas modulares en titanio, customizables para adaptarse a la patología de
                cada paciente.
              </p>
            </div>
            <Link
              to="/productos"
              className="inline-flex items-center gap-sm font-label-md text-label-md text-primary hover:gap-md transition-all"
            >
              Ver catálogo completo
              <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            </Link>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
            {products.map((product, i) => (
              <Reveal key={product.id} delay={step(i)} className="h-full">
                <ProductCard product={product} />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-surface-container-lowest border-y border-outline-variant py-section px-gutter">
        <div className="max-w-container-max mx-auto grid md:grid-cols-12 gap-xl items-center">
          <Reveal className="md:col-span-6">
            <span className="font-label-md text-label-md text-primary uppercase tracking-widest">
              Casos a medida
            </span>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mt-sm mb-md">
              Cuando el caso no entra en un catálogo
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
              Reconstrucciones acetabulares en titanio trabecular, craneoplastías a medida,
              implantes intercalares de fémur y espaciadores: diseñamos y fabricamos la pieza
              junto al equipo quirúrgico, a partir de los estudios del paciente.
            </p>
            <Link
              to="/casos-a-medida"
              className="inline-flex items-center gap-sm bg-primary-container text-on-primary px-xl py-md rounded-lg font-label-md text-label-md hover:bg-surface-tint transition-colors shadow-sm"
            >
              Ver casos desarrollados
              <span className="material-symbols-outlined">arrow_forward</span>
            </Link>
          </Reveal>
          <Reveal delay={step(2)} x={48} y={0} className="md:col-span-6 grid grid-cols-2 gap-md">
            <img
              className="w-full h-[200px] object-cover rounded-lg border border-outline-variant shadow-sm"
              alt="Craneoplastía a medida en titanio trabecular"
              src="/img/caso-craneoplastia-titanio.jpg"
              loading="lazy"
            />
            <img
              className="w-full h-[200px] object-cover rounded-lg border border-outline-variant shadow-sm"
              alt="Implante acetabular poroso sobre biomodelo del defecto"
              src="/img/caso-porosa-implante.jpg"
              loading="lazy"
            />
            <img
              className="w-full h-[200px] object-cover rounded-lg border border-outline-variant shadow-sm col-span-2"
              alt="Implante intercalar de fémur junto a las guías de resección"
              src="/img/caso-intercalar-implante.jpg"
              loading="lazy"
            />
          </Reveal>
        </div>
      </section>

      <section className="py-section px-gutter">
        <div className="max-w-container-max mx-auto">
          <Reveal className="mb-lg text-center">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">
              Habilitaciones
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-2xl mx-auto">
              Fabricamos, importamos y distribuimos bajo habilitación de la ANMAT.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md">
            {habilitaciones.map((item, i) => (
              <Reveal
                key={item.id}
                delay={step(i)}
                className="bg-surface border border-outline-variant rounded-lg p-md shadow-sm text-center flex flex-col"
              >
                <span className="font-label-md text-label-md text-primary uppercase tracking-widest mb-sm">
                  {item.organismo}
                </span>
                <p className="font-body-sm text-body-sm text-on-surface-variant flex-grow mb-sm">
                  {item.detalle}
                </p>
                <p className="font-data-mono text-[12px] text-on-surface">{item.referencia}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
