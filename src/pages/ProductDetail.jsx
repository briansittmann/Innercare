import { Link, useParams } from 'react-router-dom'
import { getProductBySlug } from '../data/products.js'
import Reveal from '../components/Reveal.jsx'
import { step } from '../lib/motion.js'

export default function ProductDetail() {
  const { slug } = useParams()
  const product = getProductBySlug(slug)

  if (!product) {
    return (
      <main className="flex-grow py-section px-gutter max-w-container-max mx-auto w-full text-center">
        <h1 className="font-headline-lg text-headline-lg text-primary mb-md">
          Producto no encontrado
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
          El producto que buscás no existe o fue movido de nuestro catálogo.
        </p>
        <Link
          to="/productos"
          className="inline-flex items-center gap-sm bg-primary-container text-on-primary px-lg py-sm rounded font-label-md text-label-md hover:bg-surface-tint transition-colors"
        >
          Volver al Catálogo
        </Link>
      </main>
    )
  }

  return (
    <main className="w-full flex-grow">
      <section className="max-w-container-max mx-auto px-gutter py-section grid grid-cols-1 md:grid-cols-12 gap-gutter items-center">
        <div className="md:col-span-5 flex flex-col gap-md">
          <Reveal
            as="span"
            className="bg-surface-container-high text-primary font-label-md text-label-md px-sm py-xs rounded w-fit"
          >
            Sistemas Ortopédicos
          </Reveal>
          <Reveal as="h1" delay={step(1)} className="font-display-lg text-display-lg text-primary">
            {product.name}
          </Reveal>
          <Reveal
            as="p"
            delay={step(2)}
            className="font-body-lg text-body-lg text-on-surface-variant"
          >
            {product.shortDescription}
          </Reveal>
          <Reveal delay={step(3)} className="flex gap-md mt-sm flex-wrap">
            <Link
              to="/contacto"
              className="bg-primary text-on-primary font-label-md text-label-md px-lg py-md rounded hover:bg-primary-container transition-colors"
            >
              Solicitar Este Producto a Medida
            </Link>
          </Reveal>
        </div>
        <Reveal delay={step(4)} className="md:col-span-7">
          <div className="rounded-xl overflow-hidden shadow-sm border border-outline-variant/30">
            <img
              alt={product.name}
              className="w-full h-auto object-cover"
              src={product.images[0]}
            />
          </div>
        </Reveal>
      </section>

      <section className="bg-surface-container-lowest py-section border-t border-outline-variant/30">
        <div className="max-w-container-max mx-auto px-gutter">
          <h2 className="font-headline-lg text-headline-lg text-primary mb-lg">
            Especificaciones Técnicas
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-gutter mb-section">
            <Reveal className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm">
              <span className="material-symbols-outlined text-primary mb-sm text-[32px]">
                science
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">Material</h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {product.material}
              </p>
            </Reveal>
            <Reveal
              delay={step(1)}
              className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm"
            >
              <span className="material-symbols-outlined text-primary mb-sm text-[32px]">
                precision_manufacturing
              </span>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">
                Compatibilidad
              </h3>
              <p className="font-body-md text-body-md text-on-surface-variant">
                {product.compatibility}
              </p>
            </Reveal>
          </div>

          <Reveal className="overflow-x-auto rounded-lg border border-outline-variant shadow-sm mb-lg">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="p-md font-label-md text-label-md text-on-surface border-b border-outline-variant">
                    Detalle Técnico
                  </th>
                </tr>
              </thead>
              <tbody className="bg-surface-container-lowest">
                {product.specifications.map((spec) => (
                  <tr key={spec} className="hover:bg-primary/5 transition-colors">
                    <td className="p-md font-body-md text-body-md border-b border-outline-variant">
                      {spec}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Reveal>

          <Reveal>
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">
              Medidas Disponibles
            </h3>
            <div className="flex flex-wrap gap-sm">
              {product.availableSizes.map((size) => (
                <span
                  key={size}
                  className="font-data-mono text-data-mono bg-surface-container-low text-on-surface px-sm py-xs rounded border border-outline-variant"
                >
                  {size}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-section px-gutter bg-primary text-on-primary text-center">
        <Reveal className="max-w-container-max mx-auto">
          <h2 className="font-headline-lg text-headline-lg mb-sm">
            ¿Necesitás este producto a medida?
          </h2>
          <p className="font-body-md text-body-md mb-lg max-w-2xl mx-auto opacity-90">
            Todos nuestros productos son customizables y se fabrican a pedido. Contactanos para
            coordinar las especificaciones exactas que necesita tu paciente.
          </p>
          <Link
            to="/contacto"
            className="inline-flex items-center gap-sm bg-surface text-primary px-xl py-md rounded-lg font-label-md text-label-md hover:bg-surface-container transition-colors"
          >
            Contactar a InnerCare
            <span className="material-symbols-outlined">arrow_forward</span>
          </Link>
        </Reveal>
      </section>
    </main>
  )
}
