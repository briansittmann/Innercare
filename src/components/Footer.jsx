import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="bg-inverse-surface">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter py-xl px-gutter max-w-container-max mx-auto">
        <div className="space-y-md">
          <span className="font-headline-sm text-headline-sm font-bold text-surface">Innercare</span>
          <p className="font-body-sm text-body-sm text-surface-variant max-w-[20rem]">
            Innovación tecnológica para el beneficio del paciente. Prótesis ortopédicas
            modulares customizables a medida.
          </p>
          <p className="font-body-sm text-body-sm text-surface-variant mt-lg">
            © {new Date().getFullYear()} Innercare. Todos los derechos reservados.
          </p>
        </div>
        <div className="space-y-md">
          <h4 className="font-label-md text-label-md text-surface tracking-wider uppercase">
            Productos
          </h4>
          <ul className="space-y-sm font-body-sm text-body-sm">
            <li>
              <Link
                to="/productos"
                className="text-surface-variant hover:text-primary-fixed-dim transition-colors"
              >
                Catálogo de Productos
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-md">
          <h4 className="font-label-md text-label-md text-surface tracking-wider uppercase">
            Empresa
          </h4>
          <ul className="space-y-sm font-body-sm text-body-sm">
            <li>
              <Link
                to="/nosotros"
                className="text-surface-variant hover:text-primary-fixed-dim transition-colors"
              >
                Sobre Nosotros
              </Link>
            </li>
          </ul>
        </div>
        <div className="space-y-md">
          <h4 className="font-label-md text-label-md text-surface tracking-wider uppercase">
            Contacto
          </h4>
          <ul className="space-y-sm font-body-sm text-body-sm">
            <li>
              <Link
                to="/contacto"
                className="text-surface-variant hover:text-primary-fixed-dim transition-colors"
              >
                Contactar
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  )
}
