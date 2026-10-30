import { PlantPhoto } from '@/components/plant-photo'
import { manufactura, textosHome } from '@/content/company'

// Foto de cada tecnología: el lugar de su animación (fase 5: la fresa que
// barre el bloque y el material que se desprende; la pieza que crece capa
// por capa). Misma proporción que la del borrador (4:3), para que el cambio
// no mueva nada. Fotos de planta: siempre con PlantPhoto (CLAUDE.md).
const fotos = {
  sustractiva: {
    src: '/img/fabricacion-cnc-maquina.jpg',
    alt: 'Centro de mecanizado CNC en la planta de Innercare',
  },
  aditiva: {
    src: '/img/fabricacion-impresion-3d.jpg',
    alt: 'Equipo de impresión 3D en metal para implantes de titanio',
  },
} as const

// Mecanizado e impresión 3D en la misma planta (#fabricacion), con la
// estructura del borrador de la landing: título y bajada, y dos tarjetas
// iguales, cada una con su animación arriba, su título y su texto. La fase 5
// replica las animaciones del borrador y suma "Volver a ver".
export function Manufacturing() {
  const { titulo, texto } = textosHome.fabricacion

  return (
    <section
      id="fabricacion"
      aria-labelledby="fabricacion-titulo"
      className="bg-surface py-[clamp(5.5rem,13vh,9.375rem)]"
    >
      <div className="page-container">
        <h2
          id="fabricacion-titulo"
          className="max-w-[16ch] text-balance font-display-lg text-display-lg text-on-surface"
        >
          {titulo}
        </h2>
        <p className="mt-[1.25rem] max-w-[56ch] text-body-lg text-on-surface-variant">{texto}</p>

        <div className="mt-[3.5rem] grid gap-[clamp(1.25rem,3vw,2.5rem)] md:grid-cols-2">
          {manufactura.map((tecnica) => (
            <article
              key={tecnica.id}
              aria-labelledby={`fabricacion-${tecnica.id}`}
              className="rounded-xl bg-surface-container-lowest p-[1.125rem] pb-[1.625rem] shadow-escena ring-1 ring-outline-variant/70"
            >
              <PlantPhoto
                src={fotos[tecnica.id].src}
                alt={fotos[tecnica.id].alt}
                sizes="(min-width: 768px) 50vw, 100vw"
                className="aspect-[4/3]"
                data-animacion-fabricacion={tecnica.id}
              />
              <div className="px-sm pt-[1.125rem]">
                <h3
                  id={`fabricacion-${tecnica.id}`}
                  className="font-headline-lg text-[1.625rem] leading-tight tracking-[-0.02em] text-on-surface"
                >
                  {tecnica.nombre}
                </h3>
                <p className="mt-[0.625rem] max-w-[46ch] text-body-md text-on-surface-variant">
                  {tecnica.texto}
                </p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
