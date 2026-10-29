import Link from 'next/link'
import { ProductTile } from '@/components/product-tile'
import { getProducts } from '@/content/products'

export async function OwnManufacturing() {
  const products = await getProducts()

  return (
    <section id="fabricacion" className="page-container pb-section md:pb-[120px]">
      <div className="reveal flex flex-col gap-md md:flex-row md:items-end md:justify-between">
        <h2 className="font-display-lg text-display-lg text-on-surface">Fabricación propia</h2>
        <Link
          href="/productos"
          className="text-body-md text-on-surface underline decoration-outline underline-offset-[6px] transition-colors hover:decoration-on-surface"
        >
          Ver catálogo
        </Link>
      </div>

      <ul className="mt-xl grid gap-x-lg gap-y-xl md:grid-cols-2">
        {products.map((product) => (
          <li key={product.slug} className="reveal">
            <ProductTile product={product} sizes="(min-width: 768px) 50vw, 100vw" />
          </li>
        ))}
      </ul>
    </section>
  )
}
