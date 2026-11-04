import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRightIcon, DownloadSimpleIcon } from '@phosphor-icons/react/ssr'
import { AnchorLink } from '@/components/anchor-link'
import AnimatedContent from '@/components/animated-content'
import { ContactCta } from '@/components/contact-cta'
import { ContactLink } from '@/components/contact-link'
import { FondoMalla } from '@/components/fondo-malla'
import { contactLabel } from '@/components/nav-links'
import { proceso } from '@/content/customCases'
import { getProductBySlug, getProducts } from '@/content/products'
import { paradas } from '@/content/recorrido'
import type { Image as ContentImage } from '@/content/types'

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({ slug: product.slug }))
}

export async function generateMetadata({
  params,
}: PageProps<'/productos/[slug]'>): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return {}
  const [portada] = product.images
  return {
    title: product.shortName,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [{ url: portada.src, alt: portada.alt }],
    },
  }
}

// Ficha de producto con el estilo de la landing: la primera pantalla entra
// entera (título, datos clave, botones y la foto sobre un escenario de luz de
// la marca), después la planificación sobre el estudio del paciente, las
// especificaciones, los demás implantes y el cierre de contacto. Las entradas
// van con AnimatedContent: al montar en el hero y al llegar con el scroll en
// el resto.
export default async function ProductPage({ params }: PageProps<'/productos/[slug]'>) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const otherProducts = (await getProducts()).filter((p) => p.slug !== product.slug)
  const [portada, ...planificacion] = product.images
  const planificacionTexto = proceso[1]?.description
  const contactoHref = `/contacto?producto=${product.slug}`

  return (
    <>
      <section className="page-container pt-md pb-xl md:pt-lg lg:grid lg:min-h-[min(calc(100dvh-72px),52rem)] lg:content-center">
        <nav aria-label="Ruta de navegación" className="text-body-sm text-on-surface-variant">
          <ol className="flex flex-wrap items-center gap-xs">
            <li>
              {/* La landing hace de catálogo: la miga vuelve al recorrido */}
              <AnchorLink href="/#recorrido" className="transition-colors hover:text-primary">
                Implantes
              </AnchorLink>
            </li>
            <li aria-hidden>/</li>
            <li aria-current="page" className="text-on-surface">
              {product.shortName}
            </li>
          </ol>
        </nav>

        {/* Dos bloques de texto y el escenario en el medio: así el orden del
            DOM es el del celular (título, foto, datos) y en escritorio la
            grilla pone la foto a la derecha ocupando las dos filas. */}
        <div className="mt-lg grid gap-y-lg lg:grid-cols-12 lg:gap-x-xl lg:gap-y-md">
          <AnimatedContent
            trigger="mount"
            stagger={0.08}
            distance={24}
            blur={6}
            className="lg:col-span-6 lg:self-end"
          >
            <p className="font-label-md text-label-md text-primary-container">
              {product.manufacturing} · {product.category}
            </p>
            <h1 className="mt-sm text-balance font-display-lg text-display-lg text-on-surface">
              {product.name}
            </h1>
            <p className="mt-md max-w-[52ch] text-body-lg text-on-surface-variant">
              {product.shortDescription}
            </p>
          </AnimatedContent>

          <AnimatedContent
            trigger="mount"
            scale={0.96}
            blur={8}
            distance={0}
            delay={0.15}
            className="lg:col-span-6 lg:col-start-7 lg:row-span-2 lg:row-start-1 lg:self-center"
          >
            <div className="ficha-escenario relative h-[44dvh] min-h-[16rem] overflow-hidden rounded-xl lg:h-[clamp(22rem,62dvh,38rem)]">
              <Image
                src={portada.src}
                alt={portada.alt}
                fill
                preload
                sizes="(min-width: 1024px) 44vw, 100vw"
                className="mini-imagen ficha-imagen-hero object-contain"
              />
            </div>
          </AnimatedContent>

          <AnimatedContent
            trigger="mount"
            stagger={0.08}
            distance={24}
            blur={6}
            delay={0.24}
            className="lg:col-span-6 lg:self-start"
          >
            {/* Los datos opcionales que la fuente no declara no se muestran. */}
            <dl className="grid gap-sm sm:grid-cols-2">
              <div className="rounded-xl bg-surface-container-low px-md py-sm">
                <dt className="text-body-sm text-on-surface-variant">Material</dt>
                <dd className="mt-xs font-data-mono text-body-md font-medium tabular-nums text-on-surface">
                  {product.material}
                </dd>
              </div>
              <div className="rounded-xl bg-surface-container-low px-md py-sm">
                <dt className="text-body-sm text-on-surface-variant">Técnica de fabricación</dt>
                <dd className="mt-xs font-data-mono text-body-md font-medium tabular-nums text-on-surface">
                  {product.technique}
                </dd>
              </div>
              <div className="px-md pt-xs sm:col-span-2">
                <dt className="text-body-sm text-on-surface-variant">Indicaciones</dt>
                <dd className="mt-xs text-body-md text-on-surface">{product.indications}</dd>
              </div>
              {product.compatibility && (
                <div className="px-md sm:col-span-2">
                  <dt className="text-body-sm text-on-surface-variant">Compatibilidad</dt>
                  <dd className="mt-xs text-body-md text-on-surface">{product.compatibility}</dd>
                </div>
              )}
            </dl>

            <div className="mt-lg flex flex-wrap gap-md">
              <ContactLink href={contactoHref} className="boton boton-primario">
                {contactLabel}
              </ContactLink>
              {product.datasheetUrl && (
                <a
                  href={product.datasheetUrl}
                  download={`${product.slug}-ficha-tecnica.pdf`}
                  className="boton boton-claro"
                >
                  <DownloadSimpleIcon size={20} aria-hidden />
                  Ficha técnica (PDF)
                </a>
              )}
            </div>
          </AnimatedContent>
        </div>
      </section>

      {planificacion.length > 0 && (
        <section aria-labelledby="estudio" className="page-container py-section">
          <div className="grid gap-xl lg:grid-cols-12">
            <AnimatedContent
              trigger="scroll"
              threshold={0.15}
              stagger={0.08}
              distance={20}
              className="lg:col-span-4"
            >
              <h2 id="estudio" className="font-headline-lg text-headline-lg text-on-surface">
                Del estudio del paciente al implante
              </h2>
              {planificacionTexto && (
                <p className="mt-md max-w-[36ch] text-body-md text-on-surface-variant">
                  {planificacionTexto}
                </p>
              )}
            </AnimatedContent>

            {/* Cada imagen con su pie debajo (el alt), nunca encima. */}
            <AnimatedContent
              as="ul"
              trigger="scroll"
              threshold={0.15}
              stagger={0.1}
              distance={24}
              className="grid gap-lg sm:grid-cols-2 lg:col-span-8 lg:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]"
            >
              {planificacion.map((image) => (
                <li key={image.src}>
                  <figure>
                    <div className="ficha-escenario relative aspect-[4/3] max-h-[30rem] overflow-hidden rounded-xl">
                      <Image
                        src={image.src}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 100vw"
                        className="mini-imagen object-contain"
                      />
                    </div>
                    <figcaption className="mt-sm text-body-sm text-on-surface-variant">
                      {image.alt}
                    </figcaption>
                  </figure>
                </li>
              ))}
            </AnimatedContent>
          </div>
        </section>
      )}

      <section
        aria-labelledby="especificaciones"
        className="border-t border-outline-variant/60 bg-surface-container-low"
      >
        <div className="page-container grid gap-xl py-section lg:grid-cols-12">
          <h2
            id="especificaciones"
            className="font-headline-lg text-headline-lg text-on-surface lg:col-span-4"
          >
            Especificaciones
          </h2>
          <div className="lg:col-span-8">
            <AnimatedContent
              as="ul"
              trigger="scroll"
              threshold={0.15}
              stagger={0.06}
              distance={20}
              className="grid gap-x-xl gap-y-lg sm:grid-cols-2"
            >
              {product.specifications.map((spec) => (
                <li
                  key={spec}
                  className="border-t border-outline-variant pt-md text-body-md text-on-surface"
                >
                  {spec}
                </li>
              ))}
            </AnimatedContent>

            {product.availableSizes && (
              <div className="mt-section">
                <h3 className="font-headline-sm text-headline-sm text-on-surface">
                  Medidas disponibles
                </h3>
                <AnimatedContent
                  as="ul"
                  trigger="scroll"
                  threshold={0.1}
                  stagger={0.03}
                  distance={12}
                  className="mt-md flex flex-wrap gap-sm"
                >
                  {product.availableSizes.map((size) => (
                    <li
                      key={size}
                      className="relieve relieve-claro rounded-full px-md py-xs font-data-mono text-data-mono tabular-nums text-on-surface"
                    >
                      {size}
                    </li>
                  ))}
                </AnimatedContent>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Desde "Más implantes" hasta el cierre, la malla hexagonal de fondo
          (components/fondo-malla.tsx), como en la home. */}
      <FondoMalla>
        <section aria-labelledby="mas-implantes" className="page-container py-section">
          <h2 id="mas-implantes" className="font-headline-lg text-headline-lg text-on-surface">
            Más implantes
          </h2>
          <AnimatedContent
            as="ul"
            trigger="scroll"
            threshold={0.15}
            stagger={0.1}
            distance={24}
            className="mt-xl grid gap-lg md:grid-cols-2"
          >
            {otherProducts.map((other) => (
              <li key={other.slug}>
                <TarjetaEnlace
                  href={`/productos/${other.slug}`}
                  imagen={other.images[0]}
                  titulo={other.shortName}
                  texto={other.shortDescription}
                />
              </li>
            ))}
            <li>
              <TarjetaEnlace
                ancla
                href="/#recorrido"
                imagen={{ src: '/img/cuerpo-entero.webp', alt: '' }}
                titulo="Volver al recorrido"
                texto={`${paradas.length} implantes sobre el cuerpo entero, del cráneo al fémur.`}
              />
            </li>
          </AnimatedContent>
        </section>

        <ContactCta
          href={contactoHref}
          title="¿Necesitás este producto a medida?"
          text="Nuestros sistemas modulares son customizables y se fabrican a pedido. Contactanos para coordinar las especificaciones exactas que necesita tu paciente."
        />
      </FondoMalla>
    </>
  )
}

// Tarjeta que es un enlace entero (.tarjeta-enlace, docs/BOTONES.md sección
// 6): la imagen en un escenario chico a la izquierda y el texto con una
// flecha fija a la derecha. El hover es el de la tarjeta, nada más. Con
// `ancla` va a la home con AnchorLink. El cuerpo del recorrido (WebP con
// fondo transparente, figura 1:2) va sin la máscara de .mini-imagen, que le
// borraría la cabeza y los pies.
function TarjetaEnlace({
  href,
  imagen,
  titulo,
  texto,
  ancla = false,
}: {
  href: string
  imagen: ContentImage
  titulo: string
  texto: string
  ancla?: boolean
}) {
  const Enlace = ancla ? AnchorLink : Link
  return (
    <Enlace
      href={href}
      className="tarjeta-enlace grid grid-cols-[7rem_1fr] items-center gap-md p-md md:grid-cols-[9rem_1fr]"
    >
      <div className="ficha-escenario relative aspect-[4/5] overflow-hidden rounded-lg">
        <Image
          src={imagen.src}
          alt=""
          fill
          sizes="9rem"
          className={ancla ? 'object-contain p-sm mix-blend-multiply' : 'mini-imagen object-contain'}
        />
      </div>
      <div className="flex items-start gap-md">
        <div className="min-w-0 flex-1">
          <h3 className="font-headline-md text-headline-md text-on-surface">{titulo}</h3>
          <p className="mt-sm line-clamp-2 text-body-md text-on-surface-variant">{texto}</p>
        </div>
        <ArrowRightIcon size={22} aria-hidden className="mt-1 shrink-0 text-on-surface" />
      </div>
    </Enlace>
  )
}
