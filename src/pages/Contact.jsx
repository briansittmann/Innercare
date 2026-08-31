import ContactForm from '../components/ContactForm.jsx'
import Reveal from '../components/Reveal.jsx'
import { step } from '../lib/motion.js'

// Single source of truth for the office location — the card text below and the
// map embed both derive from it.
const address = 'Av. Corrientes 1234, Ciudad Autónoma de Buenos Aires, Argentina'
const mapSrc = `https://www.google.com/maps?q=${encodeURIComponent(address)}&hl=es&z=16&output=embed`
const mapLink = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`

export default function Contact() {
  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-gutter py-section">
      <div className="mb-xl text-center md:text-left">
        <Reveal as="h1" className="font-display-lg text-display-lg text-on-surface mb-sm">
          Contactanos
        </Reveal>
        <Reveal
          as="p"
          delay={step(1)}
          className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl"
        >
          Conectate con nuestro equipo médico especializado. Ya sea que necesites
          especificaciones técnicas, consultas comerciales o documentación regulatoria, estamos
          para ayudarte.
        </Reveal>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-xl">
        <Reveal delay={step(2)} className="lg:col-span-7">
          <ContactForm />
        </Reveal>
        <div className="lg:col-span-5 flex flex-col gap-lg">
          <Reveal delay={step(3)} className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg shadow-sm">
            <h3 className="font-headline-sm text-headline-sm text-on-surface mb-md border-b border-outline-variant pb-sm">
              Casa Central
            </h3>
            <div className="space-y-md">
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined fill-icon text-surface-tint">
                  location_on
                </span>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Dirección</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Av. Corrientes 1234
                    <br />
                    Ciudad Autónoma de Buenos Aires
                    <br />
                    Argentina
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined fill-icon text-surface-tint">call</span>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Líneas Directas</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    Ventas: +54 11 4000-0000
                    <br />
                    Soporte: +54 11 4000-0001
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-sm">
                <span className="material-symbols-outlined fill-icon text-surface-tint">mail</span>
                <div>
                  <p className="font-label-md text-label-md text-on-surface">Emails de Contacto</p>
                  <p className="font-body-md text-body-md text-on-surface-variant">
                    ventas@innercare.com.ar
                    <br />
                    soporte@innercare.com.ar
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
          <Reveal
            delay={step(4)}
            className="bg-surface-container-lowest border border-outline-variant rounded-lg overflow-hidden shadow-sm"
          >
            <div className="p-lg pb-md border-b border-outline-variant">
              <h3 className="font-headline-sm text-headline-sm text-on-surface">Cómo Llegar</h3>
            </div>
            <iframe
              title="Ubicación de la casa central de InnerCare"
              src={mapSrc}
              className="w-full h-[320px] block border-0"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
            <a
              href={mapLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center justify-center gap-sm p-md border-t border-outline-variant font-label-md text-label-md text-primary hover:bg-surface-container transition-colors"
            >
              Ver en Google Maps
              <span className="material-symbols-outlined text-[18px]">open_in_new</span>
            </a>
          </Reveal>
        </div>
      </div>
    </main>
  )
}
