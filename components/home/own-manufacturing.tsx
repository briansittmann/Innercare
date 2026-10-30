import { ProductTile } from '@/components/product-tile'
import { getProducts } from '@/content/products'

export async function OwnManufacturing() {
  const products = await getProducts()

  return (
    <section id="fabricacion" className="page-container pb-section md:pb-[120px]">
      <h2 className="reveal font-display-lg text-display-lg text-on-surface">Fabricación propia</h2>

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
