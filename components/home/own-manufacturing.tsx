import Link from 'next/link'
import { ArrowRightIcon } from '@phosphor-icons/react/ssr'
import { ProductTile } from '@/components/product-tile'
import { products } from '@/content/products'

export function OwnManufacturing() {
  return (
    <section className="page-container py-section">
      <div className="reveal max-w-[60ch]">
        <h2 className="font-display-lg text-display-lg text-on-surface">
          Fabricación propia
        </h2>
        <p className="mt-md text-body-lg text-on-surface-variant">
          Sistemas modulares en titanio, customizables para adaptarse a la
          patología de cada paciente.
        </p>
      </div>

      {/* Dos productos en columnas desfasadas: la segunda baja una sección. */}
      <div className="mt-xl grid gap-xl md:grid-cols-12 md:gap-lg">
        {products.map((product, index) => (
          <div
            key={product.slug}
            className={
              index % 2 === 0
                ? 'reveal md:col-span-5'
                : 'reveal md:col-span-5 md:col-start-7 md:mt-section'
            }
          >
            <ProductTile product={product} sizes="(min-width: 768px) 40vw, 100vw" />
          </div>
        ))}
      </div>

      <Link
        href="/productos"
        className="mt-xl inline-flex items-center gap-sm font-label-md text-label-md text-primary underline-offset-4 hover:underline"
      >
        Ver catálogo
        <ArrowRightIcon size={16} aria-hidden />
      </Link>
    </section>
  )
}
