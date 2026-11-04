import Image from 'next/image'
import { sedePrincipal, tagline } from '@/content/company'
import { menuTextos } from '@/content/menu'

// Con Cache Components, `new Date()` no puede ir en el shell estático sin
// decidir cuándo se calcula: 'use cache' lo fija y lo renueva según cacheLife.
async function CopyrightYear() {
  'use cache'
  return new Date().getFullYear()
}

const telHref = (phone: string) => `tel:+${phone.replace(/\D/g, '')}`

// Footer del borrador de la landing (sección 3 del guion): marca, dirección
// y teléfono, en tres bloques sobre un filete. El mismo en todo el sitio.
export function SiteFooter() {
  return (
    <footer className="page-container pt-[2.5rem] pb-[3rem] text-[0.90625rem] text-on-surface-variant">
      <div className="flex flex-wrap justify-between gap-x-[2.5rem] gap-y-[0.75rem] border-t border-outline-variant pt-[1.75rem]">
        <div>
          <Image
            src="/logo.png"
            alt={menuTextos.marca}
            width={1200}
            height={466}
            sizes="96px"
            className="h-9 w-auto"
          />
          <p className="mt-sm">{tagline}.</p>
        </div>
        <address className="not-italic">
          {sedePrincipal.calle}, {sedePrincipal.localidad}
          <br />
          {sedePrincipal.provincia}
        </address>
        <div>
          <ul className="font-data-mono tabular-nums">
            {sedePrincipal.phones.map((phone, i) => (
              <li key={i}>
                <a href={telHref(phone)} className="text-on-surface transition-colors hover:text-primary">
                  {phone}
                </a>
              </li>
            ))}
          </ul>
          {/* El espacio y la marca en un solo nodo de texto: en dos nodos,
              Chrome les da forma por separado y la «I» se corre un subpíxel */}
          <p>
            © <CopyrightYear />
            {` ${menuTextos.marca}`}
          </p>
        </div>
      </div>
    </footer>
  )
}
