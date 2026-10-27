import type { Metadata } from 'next'
import Link from 'next/link'
import { ContactCta } from '@/components/contact-cta'
import { ProductTile } from '@/components/product-tile'
import { getProducts } from '@/content/products'
import type { Product } from '@/content/types'

export const metadata: Metadata = {
  title: 'Productos',
  description:
    'Sistemas modulares de fabricación propia en titanio biocompatible, customizables para adaptarse a la patología de cada paciente.',
}

// Agrupa por categoría manteniendo el orden de aparición en el catálogo.
function byCategory(products: readonly Product[]) {
  const groups = new Map<string, Product[]>()
  for (const product of products) {
    const group = groups.get(product.category)
    if (group) group.push(product)
    else groups.set(product.category, [product])
  }
  return [...groups]
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <>
      <section className="page-container pb-xl pt-xl md:pt-section">
        <h1 className="rise-in font-display-lg text-display-lg text-on-surface">
          Catálogo de productos
        </h1>
        <p className="rise-in mt-md max-w-[60ch] text-body-lg text-on-surface-variant [--rise-order:1]">
          Sistemas modulares de fabricación propia en titanio biocompatible,
          customizables para adaptarse a la patología de cada paciente. Para
          reconstrucciones que requieren una pieza única, trabajamos por{' '}
          <Link
            href="/casos-a-medida"
            className="text-primary underline underline-offset-4 hover:no-underline"
          >
            caso a medida
          </Link>
          .
        </p>
      </section>

      {byCategory(products).map(([category, items]) => (
        <section key={category} aria-label={category} className="page-container pb-section">
          <div className="flex items-baseline justify-between gap-md border-t border-outline-variant/60 pt-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface">{category}</h2>
            <p className="font-data-mono text-data-mono tabular-nums text-on-surface-variant">
              {items.length} {items.length === 1 ? 'producto' : 'productos'}
            </p>
          </div>
          <ul className="mt-xl grid gap-x-lg gap-y-xl md:grid-cols-2 lg:grid-cols-3">
            {items.map((product) => (
              <li key={product.slug} className="reveal">
                <ProductTile
                  product={product}
                  sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw"
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <ContactCta />
    </>
  )
}
