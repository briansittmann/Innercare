import { Link } from 'react-router-dom'

export default function ProductCard({ product }) {
  return (
    <article className="bg-surface border border-outline-variant rounded-lg overflow-hidden hover:border-primary-container transition-all duration-300 group flex flex-col h-full shadow-sm">
      <div className="aspect-square bg-surface-container-lowest p-md flex items-center justify-center relative overflow-hidden border-b border-outline-variant">
        <img
          className="object-contain w-full h-full transform group-hover:scale-105 transition-transform duration-500"
          alt={product.images[0].alt}
          src={product.images[0].src}
          loading="lazy"
        />
        <span className="absolute top-sm left-sm bg-surface/90 backdrop-blur-sm text-primary font-label-md text-[10px] uppercase tracking-wider px-sm py-xs rounded border border-outline-variant">
          {product.manufacturing}
        </span>
      </div>
      <div className="p-lg flex flex-col flex-grow">
        <h3 className="font-headline-sm text-headline-sm text-primary mb-xs">{product.name}</h3>
        <p className="font-body-sm text-body-sm text-on-surface-variant mb-md flex-grow">
          {product.shortDescription}
        </p>
        <div className="bg-surface-container-low p-sm rounded border border-outline-variant mb-md">
          <h4 className="font-label-md text-[10px] text-on-surface-variant uppercase tracking-wider mb-xs">
            Datos Técnicos
          </h4>
          <div className="grid grid-cols-2 gap-x-sm gap-y-xs">
            <span className="font-body-sm text-[12px] text-on-surface-variant">Material:</span>
            <span className="font-data-mono text-[12px] text-on-surface text-right">
              {product.material}
            </span>
            <span className="font-body-sm text-[12px] text-on-surface-variant">Técnica:</span>
            <span className="font-data-mono text-[12px] text-on-surface text-right">
              {product.technique}
            </span>
          </div>
        </div>
        <Link
          to={`/productos/${product.slug}`}
          className="w-full bg-surface-container border border-primary-container text-primary-container font-label-md text-label-md h-12 rounded-lg hover:bg-primary-container hover:text-on-primary transition-colors flex items-center justify-center gap-sm"
        >
          Ver Detalle
          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
        </Link>
      </div>
    </article>
  )
}
