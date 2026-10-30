import Image from 'next/image'
import Link from 'next/link'
import { contactHref, contactLabel } from '@/components/nav-links'
import { cierreRecorrido, paradas, type Parada } from '@/content/recorrido'
import { TourScroll } from './tour-scroll'

const ancla = (parada: Parada) => `parada-${parada.id}`

// Recorrido por el cuerpo, con la composición del borrador de la landing
// (docs/landing/landing-borrador.html): las seis paradas, de la cabeza al
// fémur, y el cierre. Cada tarjeta hace de ficha resumida (la landing es
// también el catálogo y la galería de casos, AJUSTES.md): las de catálogo
// llevan a su ficha; las a medida cuentan el caso y llevan al contacto.
//
// El hero del borrador vive dentro de esta escena; acá queda aparte (AJUSTES:
// el hero de `rediseno` se mantiene), así que la sección lleva su título.
export function Tour() {
  const escenas = [
    ...paradas.map((parada) => <VistaParada key={parada.id} parada={parada} />),
    <VistaCierre key="cierre" />,
  ]

  return (
    <section id="recorrido" aria-labelledby="recorrido-titulo" className="relative bg-surface">
      <div className="page-container pt-section pb-xl">
        <h2
          id="recorrido-titulo"
          className="max-w-[16ch] text-balance font-display-lg text-display-lg text-on-surface"
        >
          Recorrido por los implantes
        </h2>
      </div>

      <TourScroll
        paradas={paradas.map((parada) => ({ ancla: ancla(parada), zona: parada.zona }))}
        escenas={escenas}
      >
        <ol>
          {paradas.map((parada, i) => (
            // Cada parada ocupa una pantalla. Tarjeta a la derecha, centrada
            // (en el celular, abajo, como hoja inferior).
            <li
              key={parada.id}
              id={ancla(parada)}
              data-parada={i}
              className="flex min-h-dvh items-end justify-center px-[0.75rem] pt-[5.5rem] pb-[0.75rem] md:items-center md:justify-end md:pr-[clamp(1.25rem,5vw,5rem)] md:pb-[2.5rem] md:pl-0"
            >
              <TarjetaParada parada={parada} />
            </li>
          ))}
        </ol>

        {/* Cierre (k = 7 del guion: el cuerpo entero): el texto a la
            izquierda, donde estaba el del hero en el borrador. */}
        <div
          data-parada={paradas.length}
          className="flex min-h-dvh items-start px-[1.25rem] pt-[calc(4rem+1.375rem)] md:items-center md:pt-0 md:pl-[clamp(1.25rem,6vw,6rem)]"
        >
          <div className="pointer-events-auto w-full md:w-[min(37.5rem,46vw)]">
            <h3 className="text-balance font-display-lg text-display-lg text-on-surface">
              {cierreRecorrido.titulo}
            </h3>
            <p className="mt-md max-w-[46ch] text-body-lg text-on-surface-variant md:mt-lg">
              {cierreRecorrido.texto}
            </p>
            <div className="mt-lg flex flex-wrap gap-sm md:mt-xl">
              <Link href={contactHref} className="boton boton-primario">
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
      className="pointer-events-auto w-full rounded-xl bg-surface-container-lowest px-[1.125rem] py-md shadow-escena ring-1 ring-outline-variant/70 md:w-[min(27.5rem,38vw)] md:px-lg md:py-[1.375rem]"
    >
      <div className="mb-[0.75rem] flex items-center justify-between gap-[0.625rem]">
        <span
          className={`rounded-full px-[0.6875rem] py-xs text-[0.8125rem] font-semibold leading-none ${
            aMedida
              ? 'text-primary ring-1 ring-primary/50 ring-inset'
              : 'bg-primary text-on-primary'
          }`}
        >
          {aMedida ? 'A medida' : 'Catálogo'}
        </span>
        <span className="text-body-sm text-on-surface-variant">{parada.zona}</span>
      </div>

      <h3
        id={`${ancla(parada)}-titulo`}
        className="text-balance font-headline-lg text-headline-lg text-on-surface"
      >
        {parada.titulo}
      </h3>

      {/* Lugar de la miniatura 3D (ensamble de partículas, fase 3): por
          ahora, la foto de la pieza sobre la luz del borrador, con los bordes
          desvanecidos. Alto fijo para que el cambio no mueva la tarjeta. */}
      <div
        data-miniatura-3d={parada.id}
        className="mini-parada relative my-[0.75rem] h-[6.5rem] overflow-hidden rounded-xl md:mt-md md:mb-[0.875rem] md:h-auto md:aspect-[16/10]"
      >
        <Image
          src={parada.miniatura.src}
          alt={parada.miniatura.alt}
          fill
          sizes="(min-width: 768px) 27.5rem, 100vw"
          className="mini-imagen object-contain"
        />
      </div>

      <p className="mb-[0.625rem] text-[0.9375rem] leading-normal text-on-surface-variant md:mb-[0.875rem]">
        {parada.descripcion}
      </p>

      {/* Specs: ocultas en el celular, donde la tarjeta es una hoja inferior
          (borrador). La ficha completa está en la página del producto. */}
      <dl className="mb-md hidden border-t border-outline-variant md:block">
        {parada.specs.map((spec) => (
          <div
            key={spec.label}
            className="grid grid-cols-[7.375rem_1fr] gap-[0.75rem] border-b border-outline-variant py-sm text-[0.90625rem]"
          >
            <dt className="text-on-surface-variant">{spec.label}</dt>
            <dd className="font-data-mono tabular-nums text-on-surface">{spec.valor}</dd>
          </div>
        ))}
      </dl>

      <div className="flex flex-wrap gap-x-md gap-y-sm">
        {parada.productoSlug ? (
          <Link href={`/productos/${parada.productoSlug}`} className="enlace-marca">
            Ver ficha del producto
          </Link>
        ) : (
          <Link href={contactHref} className="enlace-marca">
            {contactLabel}
          </Link>
        )}
        {parada.datasheetUrl && (
          <a href={parada.datasheetUrl} download className="enlace-marca">
            Ficha técnica (PDF)
          </a>
        )}
      </div>
    </article>
  )
}

// Vista de la escena para una parada, hasta que llegue el 3D: la
// planificación sobre la anatomía del paciente, en el lugar donde el guion
// ancla el implante activo (34 % del ancho en escritorio; en el celular,
// arriba, sobre la hoja). Pasada a escala de grises y mezclada con la luz de
// la escena (.visor-imagen), para que las seis vistas, de fondos y colores
// dispares, se lean como una sola. Decorativa (la escena va con
// aria-hidden): la información está en la tarjeta.
function VistaParada({ parada }: { parada: Parada }) {
  return (
    // Ubicada con left/top calculados y no con translate: un transform
    // aislaría la mezcla de la imagen con la luz de la escena.
    <div className="absolute top-[5.5rem] left-[7vw] h-[38vh] w-[86vw] md:top-[calc(50%-min(34vh,20rem))] md:left-[calc(34%-min(22vw,18rem))] md:h-[min(68vh,40rem)] md:w-[min(44vw,36rem)]">
      <Image
        src={parada.escena.src}
        alt=""
        fill
        sizes="(min-width: 768px) 44vw, 86vw"
        className="visor-imagen object-contain"
      />
    </div>
  )
}

// Vista del cierre: el cuerpo entero, anclado a la derecha como en el hero
// del borrador. Hasta que exista, la captura del busto de vidrio del hero.
function VistaCierre() {
  return (
    <div className="absolute bottom-0 left-1/2 h-[52vh] w-[min(100vw,36rem)] -translate-x-1/2 md:left-[68%] md:h-[88vh] md:w-[min(52vw,52rem)]">
      <Image
        src="/img/cuerpo-inicio.webp"
        alt=""
        fill
        sizes="(min-width: 768px) 52vw, 100vw"
        className="object-contain object-bottom"
      />
    </div>
  )
}
