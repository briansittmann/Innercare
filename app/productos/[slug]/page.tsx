import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { DownloadSimpleIcon } from '@phosphor-icons/react/ssr'
import { ContactCta } from '@/components/contact-cta'
import { ProductGallery } from '@/components/product-gallery'
import { ProductTile } from '@/components/product-tile'
import { getProductBySlug, getProducts } from '@/content/products'

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/productos/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  return { title: product.shortName, description: product.shortDescription }
}

export default async function ProductPage({ params }: PageProps<'/productos/[slug]'>) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const otherProducts = (await getProducts()).filter((p) => p.slug !== product.slug)

  // Los datos opcionales que la fuente no declara no se muestran.
  const facts = [
    { label: 'Material', value: product.material },
    { label: 'Técnica de fabricación', value: product.technique },
    { label: 'Indicaciones', value: product.indications },
    ...(product.compatibility
      ? [{ label: 'Compatibilidad', value: product.compatibility }]
      : []),
  ]

  return (
    <>
      <section className="page-container pb-section pt-lg md:pt-xl">
        <nav aria-label="Ruta de navegación" className="text-body-sm text-on-surface-variant">
          <ol className="flex flex-wrap items-center gap-xs">
            <li>
              <Link href="/productos" className="transition-colors hover:text-primary">
                Productos
              </Link>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-on-surface">
              {product.shortName}
            </li>
          </ol>
        </nav>

        <div className="mt-lg grid gap-xl lg:grid-cols-12">
          <div className="lg:col-span-6">
            <ProductGallery images={product.images} />
          </div>

          <div className="lg:sticky lg:top-28 lg:col-span-5 lg:col-start-8 lg:self-start">
            <p className="font-label-md text-label-md text-primary-container">
              {product.manufacturing} · {product.category}
            </p>
            <h1 className="mt-sm text-balance font-display-lg text-display-lg text-on-surface">
              {product.name}
            </h1>
            <p className="mt-md text-body-lg text-on-surface-variant">
              {product.shortDescription}
            </p>

            <dl className="mt-xl divide-y divide-outline-variant/60 border-y border-outline-variant/60">
              {facts.map((fact) => (
                <div key={fact.label} className="grid gap-xs py-md sm:grid-cols-[11rem_1fr] sm:gap-md">
                  <dt className="text-body-sm text-on-surface-variant">{fact.label}</dt>
                  <dd className="text-body-md text-on-surface">{fact.value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-xl flex flex-wrap gap-md">
              <Link href={`/contacto?producto=${product.slug}`} className="boton boton-primario">
                Contactar
              </Link>
              {product.datasheetUrl && (
                <a href={product.datasheetUrl} download className="boton boton-claro">
                  <DownloadSimpleIcon size={20} aria-hidden />
                  Ficha técnica (PDF)
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      <section
        aria-labelledby="especificaciones"
        className="border-t border-outline-variant/60 bg-surface-container-low"
      >
        <div className="page-container grid gap-xl py-section lg:grid-cols-12">
          <h2
            id="especificaciones"
            className="font-headline-lg text-headline-lg text-on-surface lg:col-span-4"
          >
            Especificaciones
          </h2>
          <div className="lg:col-span-8">
            <ul className="grid gap-x-xl gap-y-lg sm:grid-cols-2">
              {product.specifications.map((spec) => (
                <li
                  key={spec}
                  className="border-t border-outline-variant pt-md text-body-md text-on-surface"
                >
                  {spec}
                </li>
              ))}
            </ul>

            {product.availableSizes && (
              <div className="mt-section">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Medidas disponibles
                </h3>
                <ul className="mt-md flex flex-wrap gap-sm">
                  {product.availableSizes.map((size) => (
                    <li
                      key={size}
                      className="relieve relieve-claro rounded-full px-md py-xs font-data-mono text-data-mono tabular-nums text-on-surface"
                    >
                      {size}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </section>

      {otherProducts.length > 0 && (
        <section aria-labelledby="otros-productos" className="page-container py-section">
          <h2
            id="otros-productos"
            className="font-headline-lg text-headline-lg text-on-surface"
          >
            Otros productos
          </h2>
          <ul className="mt-xl grid gap-x-lg gap-y-xl md:grid-cols-2 lg:grid-cols-3">
            {otherProducts.map((other) => (
              <li key={other.slug} className="reveal">
                <ProductTile
                  product={other}
                  sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <ContactCta
        href={`/contacto?producto=${product.slug}`}
        title="¿Necesitás este producto a medida?"
        text="Nuestros sistemas modulares son customizables y se fabrican a pedido. Contactanos para coordinar las especificaciones exactas que necesita tu paciente."
      />
    </>
  )
}
