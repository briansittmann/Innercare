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
// el hero de `rediseno` se mantiene), así que en su lugar (k = 0) va el
// título de la sección, con el cuerpo entero a la derecha. La escena 3D y el
// guion de cámara están en components/recorrido-3d/.
export function Tour() {
  const vistas = [
    ...paradas.map((parada) => <VistaParada key={parada.id} parada={parada} />),
    <VistaCuerpo key="cuerpo" />,
  ]
  const aMedida = paradas.filter((p) => p.tipo === 'a-medida').length
  const catalogo = paradas.length - aMedida

  return (
    <section id="recorrido" aria-labelledby="recorrido-titulo" className="relative bg-surface">
      <TourScroll
        paradas={paradas.map((parada) => ({ ancla: ancla(parada), zona: parada.zona }))}
        vistas={vistas}
        entrada={
          // Entrada (k = 0): donde el borrador tiene el texto del hero
          <>
            <h2
              id="recorrido-titulo"
              className="max-w-[14ch] text-balance font-display-lg text-display-lg text-on-surface"
            >
              Recorrido por los implantes
            </h2>
            <p className="mt-md max-w-[40ch] text-body-lg text-on-surface-variant min-[820px]:mt-lg">
              {`${numero(paradas.length)} implantes en su lugar, de la cabeza al fémur: ${numero(aMedida, true)} a medida y ${numero(catalogo, true)} de catálogo.`}
            </p>
          </>
        }
        cierre={
          // Cierre (k = 7): el cuerpo entero y el texto final a la izquierda
          <>
            <h3 className="max-w-[18ch] text-balance font-display-lg text-display-lg text-on-surface">
              {cierreRecorrido.titulo}
            </h3>
            <p className="mt-md max-w-[46ch] text-body-lg text-on-surface-variant min-[820px]:mt-lg">
              {cierreRecorrido.texto}
            </p>
            <div className="mt-lg flex flex-wrap gap-sm min-[820px]:mt-xl">
              <Link href={contactHref} className="boton boton-primario">
                {contactLabel}
              </Link>
            </div>
          </>
        }
      >
        {paradas.map((parada, i) => (
          <TarjetaParada key={parada.id} parada={parada} indice={i} />
        ))}
      </TourScroll>
    </section>
  )
}

const NUMEROS = ['cero', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve']
function numero(n: number, minuscula = false) {
  const palabra = NUMEROS[n] ?? String(n)
  return minuscula ? palabra : palabra.charAt(0).toUpperCase() + palabra.slice(1)
}

function TarjetaParada({ parada, indice }: { parada: Parada; indice: number }) {
  const aMedida = parada.tipo === 'a-medida'

  return (
    <article
      data-tarjeta={indice}
      aria-labelledby={`${ancla(parada)}-titulo`}
      className="recorrido-tarjeta w-full rounded-xl bg-surface-container-lowest px-[1.125rem] py-md shadow-escena ring-1 ring-outline-variant/70 min-[820px]:px-lg min-[820px]:py-[1.375rem]"
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

      {/* Lugar de la miniatura 3D (ensamble de partículas, fase 5): por
          ahora, la foto de la pieza sobre la luz del borrador, con los bordes
          desvanecidos. Alto fijo para que el cambio no mueva la tarjeta. */}
      <div
        data-miniatura-3d={parada.id}
        className="mini-parada relative my-[0.625rem] h-[6.5rem] overflow-hidden rounded-xl min-[820px]:mt-md min-[820px]:mb-[0.875rem] min-[820px]:aspect-[16/10] min-[820px]:h-auto min-[820px]:max-h-[24dvh]"
      >
        <Image
          src={parada.miniatura.src}
          alt={parada.miniatura.alt}
          fill
          sizes="(min-width: 820px) 27.5rem, 100vw"
          className="mini-imagen object-contain"
        />
      </div>

      <p className="mb-[0.625rem] text-[0.9375rem] leading-normal text-on-surface-variant min-[820px]:mb-[0.875rem]">
        {parada.descripcion}
      </p>

      {/* Specs: ocultas en el celular, donde la tarjeta es una hoja inferior
          (borrador). La ficha completa está en la página del producto. */}
      <dl className="mb-md hidden border-t border-outline-variant min-[820px]:block">
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
    <div className="absolute top-[5.5rem] left-[7vw] h-[38vh] w-[86vw] min-[820px]:top-[calc(50%-min(34vh,20rem))] min-[820px]:left-[calc(34%-min(22vw,18rem))] min-[820px]:h-[min(68vh,40rem)] min-[820px]:w-[min(44vw,36rem)]">
      <Image
        src={parada.escena.src}
        alt=""
        fill
        sizes="(min-width: 820px) 44vw, 86vw"
        className="visor-imagen object-contain"
      />
    </div>
  )
}

// Vista de la entrada y del cierre (lugar reservado del cuerpo entero,
// anclado a la derecha como en el hero del borrador): la captura del busto
// de vidrio del hero.
function VistaCuerpo() {
  return (
    <div className="absolute bottom-0 left-1/2 h-[52vh] w-[min(100vw,36rem)] -translate-x-1/2 min-[820px]:left-[68%] min-[820px]:h-[88vh] min-[820px]:w-[min(52vw,52rem)]">
      <Image
        src="/img/cuerpo-inicio.webp"
        alt=""
        fill
        sizes="(min-width: 820px) 52vw, 100vw"
        className="object-contain object-bottom"
      />
    </div>
  )
}
