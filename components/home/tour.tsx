import Image from 'next/image'
import Link from 'next/link'
import { contactHref, contactLabel } from '@/components/nav-links'
import { cierreRecorrido, paradas, type Parada } from '@/content/recorrido'
import { TourScroll } from './tour-scroll'

const ancla = (parada: Parada) => `parada-${parada.id}`

// Recorrido por el cuerpo: las seis paradas del guion, de la cabeza al
// fémur, y el cierre. Cada tarjeta hace de ficha resumida (la landing es
// también el catálogo y la galería de casos, AJUSTES.md): las de catálogo
// llevan a su ficha; las a medida cuentan el caso y llevan al contacto.
export function Tour() {
  const escenas = [
    ...paradas.map((parada) => <VistaParada key={parada.id} parada={parada} />),
    <VistaCierre key="cierre" />,
  ]

  return (
    <section id="recorrido" aria-labelledby="recorrido-titulo" className="relative bg-surface">
      <TourScroll
        paradas={paradas.map((parada) => ({ ancla: ancla(parada), zona: parada.zona }))}
        escenas={escenas}
      >
        <div className="page-container pt-section lg:pt-0">
          <h2
            id="recorrido-titulo"
            className="max-w-[16ch] text-balance font-display-lg text-display-lg text-on-surface lg:sr-only"
          >
            Recorrido por los implantes
          </h2>

          <ol className="mt-xl flex flex-col gap-lg lg:mt-0 lg:gap-0">
            {paradas.map((parada, i) => (
              // Desde lg, cada parada ocupa una pantalla y su tarjeta queda
              // centrada a la derecha de la escena.
              <li
                key={parada.id}
                id={ancla(parada)}
                data-parada={i}
                className="lg:flex lg:min-h-dvh lg:items-center lg:justify-end lg:py-[96px]"
              >
                <TarjetaParada parada={parada} />
              </li>
            ))}
          </ol>

          {/* Cierre: el cuerpo entero (k = 7 del guion) */}
          <div
            data-parada={paradas.length}
            className="flex py-section lg:min-h-dvh lg:items-center lg:justify-end lg:py-[96px]"
          >
            <div className="pointer-events-auto w-full lg:max-w-[31rem]">
              <p className="text-balance font-headline-lg text-statement text-on-surface">
                {cierreRecorrido.titulo}
              </p>
              <p className="mt-md max-w-[44ch] text-body-lg text-on-surface-variant">
                {cierreRecorrido.texto}
              </p>
              <Link href={contactHref} className="boton boton-primario mt-xl">
                {contactLabel}
              </Link>
            </div>
          </div>
        </div>
      </TourScroll>
    </section>
  )
}

function TarjetaParada({ parada }: { parada: Parada }) {
  const aMedida = parada.tipo === 'a-medida'

  return (
    <article
      aria-labelledby={`${ancla(parada)}-titulo`}
      className="tarjeta-parada pointer-events-auto w-full rounded-xl bg-surface-container-lowest p-lg ring-1 ring-outline-variant/70 sm:p-xl lg:max-w-[31rem]"
    >
      <div className="flex items-center justify-between gap-md">
        <span
          className={`rounded-full px-[0.75rem] py-[0.2rem] text-body-sm font-semibold ${
            aMedida
              ? 'text-primary ring-1 ring-primary/45 ring-inset'
              : 'bg-primary text-on-primary'
          }`}
        >
          {aMedida ? 'A medida' : 'Catálogo'}
        </span>
        <span className="font-data-mono text-data-mono text-on-surface-variant">{parada.zona}</span>
      </div>

      <h3
        id={`${ancla(parada)}-titulo`}
        className="mt-md text-balance font-headline-lg text-headline-lg text-on-surface"
      >
        {parada.titulo}
      </h3>

      <figure className="mt-lg">
        {/* Lugar de la miniatura 3D (ensamble de partículas, fase 3): por
            ahora, la foto de la pieza. Alto fijo para que el cambio no
            mueva la tarjeta. */}
        <div
          data-miniatura-3d={parada.id}
          className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface-container-low lg:aspect-[2/1]"
        >
          <Image
            src={parada.miniatura.src}
            alt={parada.miniatura.alt}
            fill
            sizes="(min-width: 1024px) 31rem, 100vw"
            className="object-contain p-sm mix-blend-multiply"
          />
        </div>
        {parada.caso && (
          <figcaption className="mt-sm text-body-sm text-on-surface-variant">
            <span className="font-semibold text-on-surface">{parada.caso.titulo}.</span>{' '}
            {parada.caso.texto}
          </figcaption>
        )}
      </figure>

      <p className="mt-lg text-body-md text-on-surface-variant">{parada.descripcion}</p>

      <dl className="mt-lg grid grid-cols-[auto_1fr] gap-x-lg gap-y-sm rounded-xl bg-surface-container-low px-md py-md">
        {parada.specs.map((spec) => (
          <div key={spec.label} className="col-span-2 grid grid-cols-subgrid">
            <dt className="text-body-sm text-on-surface-variant">{spec.label}</dt>
            <dd className="font-data-mono text-data-mono tabular-nums text-on-surface">
              {spec.valor}
            </dd>
          </div>
        ))}
      </dl>

      <div className="mt-lg flex flex-wrap items-center gap-x-lg gap-y-md">
        {parada.productoSlug ? (
          <Link href={`/productos/${parada.productoSlug}`} className="boton boton-relleno">
            Ver ficha del producto
          </Link>
        ) : (
          <Link href={contactHref} className="boton boton-relleno">
            {contactLabel}
          </Link>
        )}
        {parada.datasheetUrl && (
          <a href={parada.datasheetUrl} download className="enlace text-body-md font-semibold">
            Ficha técnica (PDF)
          </a>
        )}
      </div>
    </article>
  )
}

// Vista de la escena para una parada: la planificación sobre la anatomía
// del paciente, con el nombre de la zona abajo. Decorativa (la escena va
// con aria-hidden): la información está en la tarjeta.
function VistaParada({ parada }: { parada: Parada }) {
  return (
    <div className="flex size-full flex-col items-center justify-center gap-lg">
      <div className="relative min-h-0 w-full max-w-[34rem] flex-1">
        <Image
          src={parada.escena.src}
          alt=""
          fill
          sizes="(min-width: 1024px) 34rem, 1px"
          className="object-contain mix-blend-multiply"
        />
      </div>
      <p className="font-data-mono text-data-mono text-on-surface-variant">
        {parada.zona}
        <span className="mx-sm text-outline">/</span>
        {parada.tipo === 'a-medida' ? 'A medida' : 'Catálogo'}
      </p>
    </div>
  )
}

// Vista del cierre: las seis piezas juntas, en el orden del recorrido,
// como el cuerpo entero del guion.
function VistaCierre() {
  return (
    <div className="flex size-full items-center justify-center">
      <ul className="grid w-full max-w-[27rem] grid-cols-3 gap-md">
        {paradas.map((parada) => (
          <li key={parada.id}>
            <div className="relative aspect-square overflow-hidden rounded-xl bg-surface-container-lowest ring-1 ring-outline-variant/60">
              <Image
                src={parada.miniatura.src}
                alt=""
                fill
                sizes="(min-width: 1024px) 9rem, 1px"
                className="object-contain p-sm mix-blend-multiply"
              />
            </div>
            <p className="mt-sm font-data-mono text-data-mono text-on-surface-variant">
              {parada.zona}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
