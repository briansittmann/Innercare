import type { Metadata } from 'next'
import { ArrowUpRightIcon, MapPinIcon } from '@phosphor-icons/react/ssr'
import { ContactCta } from '@/components/contact-cta'
import { ContentIcon } from '@/components/icon'
import { PlantPhoto } from '@/components/plant-photo'
import {
  capacidades,
  direccionCompleta,
  habilitaciones,
  manufactura,
  sedes,
  trayectoria,
} from '@/content/company'

export const metadata: Metadata = {
  title: 'Nosotros',
  description: trayectoria,
}

const telHref = (phone: string) => `tel:+${phone.replace(/\D/g, '')}`

const mapsHref = (query: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`

export default function AboutPage() {
  return (
    <>
      <section className="page-container grid items-center gap-xl pb-section pt-xl md:grid-cols-12 md:pt-section">
        <div className="md:col-span-6">
          <p className="rise-in font-label-md text-label-md uppercase text-primary-container">
            Sobre Innercare
          </p>
          <h1 className="rise-in mt-md text-balance font-display-xl text-display-xl text-on-surface [--rise-order:1]">
            Impulsando la ortopedia a través de la precisión
          </h1>
          <p className="rise-in mt-lg max-w-[48ch] text-body-lg text-on-surface-variant [--rise-order:2]">
            {trayectoria}
          </p>
        </div>
        <PlantPhoto
          src="/img/fabricacion-cnc-maquina.jpg"
          alt="Centro de mecanizado CNC en la planta industrial de Innercare"
          sizes="(min-width: 768px) 45vw, 100vw"
          preload
          className="rise-in aspect-[4/3] [--rise-order:2] md:col-span-6"
        />
      </section>

      <section id="fabricacion" className="page-container scroll-mt-24 pb-section">
        <div className="reveal max-w-[60ch]">
          <h2 className="font-display-lg text-display-lg text-on-surface">
            Fabricación propia
          </h2>
          <p className="mt-md text-body-lg text-on-surface-variant">
            Producimos implantes en titanio biocompatible con las dos tecnologías,
            lo que nos permite resolver tanto series modulares como piezas únicas
            para un paciente.
          </p>
        </div>
        <ul className="mt-xl grid gap-xl md:grid-cols-12 md:gap-lg">
          {manufactura.map((tecnica, index) => (
            <li
              key={tecnica.id}
              className={index === 0 ? 'reveal md:col-span-7' : 'reveal md:col-span-5'}
            >
              <PlantPhoto
                src={tecnica.image}
                alt={tecnica.imageAlt}
                sizes={index === 0 ? '(min-width: 768px) 55vw, 100vw' : '(min-width: 768px) 40vw, 100vw'}
                className="aspect-[4/3] md:aspect-auto md:h-[22rem]"
              />
              <p className="mt-md text-body-sm text-on-surface-variant">{tecnica.kicker}</p>
              <h3 className="mt-xs font-headline-sm text-headline-sm text-on-surface">
                {tecnica.title}
              </h3>
            </li>
          ))}
        </ul>
      </section>

      <section className="bg-surface-container-low">
        <div className="page-container py-section">
          <div className="reveal max-w-[60ch]">
            <h2 className="font-display-lg text-display-lg text-on-surface">Capacidades</h2>
            <p className="mt-md text-body-lg text-on-surface-variant">
              Cubrimos el circuito completo: desde la planificación del caso hasta
              la entrega trazada del producto en cualquier punto del país.
            </p>
          </div>
          <ul className="mt-xl grid gap-x-xl gap-y-xl sm:grid-cols-2">
            {capacidades.map((capacidad) => (
              <li
                key={capacidad.title}
                className="reveal grid grid-cols-[auto_1fr] gap-x-lg border-t border-outline-variant pt-lg"
              >
                <span className="flex size-12 items-center justify-center rounded-full bg-surface-container-lowest text-primary ring-1 ring-outline-variant/60">
                  <ContentIcon name={capacidad.icon} size={24} />
                </span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface">
                    {capacidad.title}
                  </h3>
                  <p className="mt-sm max-w-[44ch] text-body-md text-on-surface-variant">
                    {capacidad.description}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        id="habilitaciones"
        className="page-container grid scroll-mt-24 gap-xl py-section lg:grid-cols-12"
      >
        <div className="reveal lg:col-span-5">
          <h2 className="font-display-lg text-display-lg text-on-surface">Habilitaciones</h2>
          <p className="mt-md max-w-[48ch] text-body-lg text-on-surface-variant">
            Operamos bajo habilitación de la ANMAT para fabricar, importar y
            distribuir productos médicos, y cada unidad se registra en el Sistema
            Nacional de Trazabilidad.
          </p>
        </div>
        <dl className="reveal divide-y divide-outline-variant/60 border-y border-outline-variant/60 lg:col-span-7">
          {habilitaciones.map((habilitacion) => (
            <div
              key={habilitacion.id}
              className="grid gap-xs py-lg sm:grid-cols-[7rem_1fr] sm:gap-md"
            >
              <dt className="font-label-md text-label-md text-primary">
                {habilitacion.organismo}
              </dt>
              <dd>
                <p className="text-body-md text-on-surface">{habilitacion.detalle}</p>
                <p className="mt-xs font-data-mono text-data-mono tabular-nums text-on-surface-variant">
                  {habilitacion.referencia}
                </p>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="sedes" className="page-container pb-section">
        <h2 id="sedes" className="reveal font-display-lg text-display-lg text-on-surface">
          Dónde estamos
        </h2>
        <ul className="mt-xl grid gap-lg sm:grid-cols-2 lg:grid-cols-4">
          {sedes.map((sede) => (
            <li
              key={sede.id}
              className="reveal flex flex-col rounded-xl bg-surface-container-lowest p-lg ring-1 ring-outline-variant/50"
            >
              <MapPinIcon size={24} weight="light" aria-hidden className="text-primary" />
              <h3 className="mt-md font-headline-sm text-headline-sm text-on-surface">
                {sede.tipo}
              </h3>
              <address className="mt-sm text-body-sm not-italic text-on-surface-variant">
                {sede.calle}
                <br />
                {sede.localidad}
                <br />
                {sede.provincia}
              </address>
              {sede.phones.length > 0 && (
                <ul className="mt-md flex flex-col gap-xs font-data-mono text-data-mono tabular-nums">
                  {sede.phones.map((phone) => (
                    <li key={phone}>
                      <a href={telHref(phone)} className="text-on-surface hover:text-primary">
                        {phone}
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              <a
                href={mapsHref(direccionCompleta(sede))}
                target="_blank"
                rel="noreferrer"
                className="mt-auto inline-flex items-center gap-xs pt-lg font-label-md text-label-md text-primary underline-offset-4 hover:underline"
              >
                Ver en el mapa
                <ArrowUpRightIcon size={16} aria-hidden />
              </a>
            </li>
          ))}
        </ul>
      </section>

      <ContactCta />
    </>
  )
}
