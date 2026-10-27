import Image from 'next/image'
import Link from 'next/link'
import { habilitaciones, sedePrincipal, tagline } from '@/content/company'
import { products } from '@/content/products'

// Con Cache Components, `new Date()` no puede ir en el shell estático sin
// decidir cuándo se calcula: 'use cache' lo fija y lo renueva según cacheLife.
async function CopyrightYear() {
  'use cache'
  return new Date().getFullYear()
}

const telHref = (phone: string) => `tel:+${phone.replace(/\D/g, '')}`

const empresa = [
  { href: '/casos-a-medida', label: 'Casos a medida' },
  { href: '/nosotros', label: 'Nosotros' },
  { href: '/contacto', label: 'Contacto' },
] as const

const fabricacion = habilitaciones.find((h) => h.id === 'anmat-fabricacion')

export function SiteFooter() {
  return (
    <footer className="border-t border-outline-variant/60 bg-surface-container-low">
      <div className="page-container grid gap-xl py-xl md:grid-cols-12 md:py-section">
        <div className="md:col-span-4">
          <Image
            src="/logo.png"
            alt="Innercare"
            width={1200}
            height={466}
            sizes="96px"
            className="h-9 w-auto"
          />
          <p className="mt-md max-w-[36ch] text-body-sm text-on-surface-variant">
            {tagline}. Fabricación de implantes ortopédicos modulares y a medida
            del paciente.
          </p>
        </div>

        <nav aria-label="Productos" className="md:col-span-3">
          <h2 className="font-label-md text-label-md text-on-surface">Productos</h2>
          <ul className="mt-md flex flex-col gap-sm text-body-sm">
            {products.map((product) => (
              <li key={product.slug}>
                <Link
                  href={`/productos/${product.slug}`}
                  className="text-on-surface-variant transition-colors hover:text-primary"
                >
                  {product.shortName}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/productos"
                className="text-on-surface-variant transition-colors hover:text-primary"
              >
                Catálogo completo
              </Link>
            </li>
          </ul>
        </nav>

        <nav aria-label="Empresa" className="md:col-span-2">
          <h2 className="font-label-md text-label-md text-on-surface">Empresa</h2>
          <ul className="mt-md flex flex-col gap-sm text-body-sm">
            {empresa.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="text-on-surface-variant transition-colors hover:text-primary"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="md:col-span-3">
          <h2 className="font-label-md text-label-md text-on-surface">Laboratorio</h2>
          <address className="mt-md text-body-sm not-italic text-on-surface-variant">
            {sedePrincipal.calle}
            <br />
            {sedePrincipal.localidad}
            <br />
            {sedePrincipal.provincia}
          </address>
          <ul className="mt-md flex flex-col gap-xs font-data-mono text-data-mono tabular-nums">
            {sedePrincipal.phones.map((phone) => (
              <li key={phone}>
                <a
                  href={telHref(phone)}
                  className="text-on-surface transition-colors hover:text-primary"
                >
                  {phone}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="page-container flex flex-col gap-xs border-t border-outline-variant/60 py-lg text-body-sm text-on-surface-variant md:flex-row md:justify-between">
        <p>
          © <CopyrightYear /> Innercare. Todos los derechos reservados.
        </p>
        {fabricacion && (
          <p>
            Habilitado por {fabricacion.organismo}, {fabricacion.referencia}
          </p>
        )}
      </div>
    </footer>
  )
}
