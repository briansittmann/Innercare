import { Link } from 'react-router-dom'
import products from '../data/products.js'
import { sedePrincipal, tagline } from '../data/company.js'

// El logo es azul sobre transparente y no contrasta contra `bg-inverse-surface`,
// así que acá la marca va como texto.
export default function Footer() {
  return (
    <footer className="bg-inverse-surface">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter py-xl px-gutter max-w-container-max mx-auto">
        <div className="space-y-md">
          <span className="font-headline-sm text-headline-sm font-bold text-surface">
            Innercare
          </span>
          <p className="font-body-sm text-body-sm text-surface-variant max-w-[20rem]">
            {tagline}. Fabricación de implantes ortopédicos modulares y a medida del paciente.
          </p>
          <p className="font-body-sm text-body-sm text-surface-variant mt-lg">
            © {new Date().getFullYear()} Innercare. Todos los derechos reservados.
          </p>
        </div>

        <FooterColumn title="Productos">
          <FooterLink to="/productos">Catálogo de productos</FooterLink>
          {products.map((product) => (
            <FooterLink key={product.slug} to={`/productos/${product.slug}`}>
              {product.shortName}
            </FooterLink>
          ))}
          <FooterLink to="/casos-a-medida">Casos a medida</FooterLink>
        </FooterColumn>

        <FooterColumn title="Empresa">
          <FooterLink to="/nosotros">Sobre nosotros</FooterLink>
          <FooterLink to="/nosotros#habilitaciones">Habilitaciones ANMAT</FooterLink>
          <FooterLink to="/nosotros#fabricacion">Fabricación</FooterLink>
        </FooterColumn>

        <div className="space-y-md">
          <h4 className="font-label-md text-label-md text-surface tracking-wider uppercase">
            Contacto
          </h4>
          <address className="not-italic font-body-sm text-body-sm text-surface-variant space-y-xs">
            <p>{sedePrincipal.calle}</p>
            <p>
              {sedePrincipal.localidad}
              <br />
              {sedePrincipal.provincia}
            </p>
            <p>
              <a
                href={`tel:${sedePrincipal.phones[0].replace(/\D/g, '')}`}
                className="hover:text-primary-fixed-dim transition-colors"
              >
                {sedePrincipal.phones[0]}
              </a>
            </p>
          </address>
          <ul className="space-y-sm font-body-sm text-body-sm">
            <FooterLink to="/contacto">Contactar</FooterLink>
          </ul>
        </div>
      </div>
    </footer>
  )
}

function FooterColumn({ title, children }) {
  return (
    <div className="space-y-md">
      <h4 className="font-label-md text-label-md text-surface tracking-wider uppercase">
        {title}
      </h4>
      <ul className="space-y-sm font-body-sm text-body-sm">{children}</ul>
    </div>
  )
}

function FooterLink({ to, children }) {
  return (
    <li>
      <Link
        to={to}
        className="text-surface-variant hover:text-primary-fixed-dim transition-colors"
      >
        {children}
      </Link>
    </li>
  )
}
