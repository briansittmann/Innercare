import AnimatedContent from '@/components/animated-content'
import { PlantPhoto } from '@/components/plant-photo'
import { fabricacionTextos, manufactura, textosHome } from '@/content/company'
import { fotosPlanta } from '@/content/planta'
import { AnimacionFabricacion } from './animacion-fabricacion'
import { CarruselPlanta } from './carrusel-planta'

// Por técnica: la pieza terminada en la que remata su animación (render de
// la malla del recorrido con fondo transparente, public/img/fabricacion/, de
// `npm run fabricacion`) y la foto de planta, que se ve solo sin JS en el
// lugar de la animación. Fotos de planta: siempre con PlantPhoto (CLAUDE.md).
const fotos = {
  sustractiva: {
    pieza: '/img/fabricacion/femur.webp',
    src: '/img/fabricacion-cnc-maquina.jpg',
    alt: fabricacionTextos.fotoCncAlt,
  },
  aditiva: {
    pieza: '/img/fabricacion/acetabulo.webp',
    src: '/img/fabricacion-impresion-3d.jpg',
    alt: fabricacionTextos.fotoImpresionAlt,
  },
} as const

// Mecanizado e impresión 3D en la misma planta (#fabricacion), con la
// estructura del borrador de la landing: título y bajada, y dos tarjetas
// iguales, cada una con su animación arriba (components/animaciones/
// fabricacion.ts), su título, su texto y "Volver a ver". Al cierre, a sangre,
// la tira de fotos reales de la planta y de piezas fabricadas (carrusel-
// planta.tsx, content/planta.ts): lo único de la home que no es 3D ni
// partículas.
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
          className="max-w-[22ch] text-balance font-display-lg text-display-lg text-on-surface"
        >
          {titulo}
        </h2>
        {/* La bajada entra como los bloques de las fichas: sube y se aclara de
            un desenfoque al llegar con el scroll (pedido del usuario) */}
        <AnimatedContent
          as="p"
          trigger="scroll"
          threshold={0.2}
          distance={24}
          blur={6}
          className="mt-[1.25rem] max-w-[56ch] text-body-lg text-on-surface-variant"
        >
          {texto}
        </AnimatedContent>

        {/* Un 10 % más angostas que el contenedor (pedido del usuario, 2026-11-01:
            empezó en 5 % y pidió más), alineadas a la izquierda con el título */}
        <div className="mt-[3.5rem] grid gap-[clamp(1.25rem,3vw,2.5rem)] md:w-[90%] md:grid-cols-2">
          {manufactura.map((tecnica) => (
            <article
              key={tecnica.id}
              aria-labelledby={`fabricacion-${tecnica.id}`}
              className="tarjeta-fabricacion relative rounded-xl bg-surface-container-lowest p-[1.125rem] pb-[1.625rem] shadow-escena ring-1 ring-outline-variant/70"
            >
              <AnimacionFabricacion
                modo={tecnica.id}
                pieza={fotos[tecnica.id].pieza}
                etiquetaVolver={fabricacionTextos.volverAVer}
                respaldo={
                  <PlantPhoto
                    src={fotos[tecnica.id].src}
                    alt={fotos[tecnica.id].alt}
                    sizes="(min-width: 768px) 50vw, 100vw"
                    className="h-full"
                  />
                }
              >
                <h3
                  id={`fabricacion-${tecnica.id}`}
                  className="font-headline-lg text-[1.625rem] leading-tight tracking-[-0.02em] text-on-surface"
                >
                  {tecnica.nombre}
                </h3>
                <p className="mt-[0.625rem] max-w-[58ch] text-body-md text-on-surface-variant">
                  {tecnica.texto}
                </p>
              </AnimacionFabricacion>
            </article>
          ))}
        </div>
      </div>
      <div className="mt-[clamp(3rem,8vh,5.5rem)]">
        <CarruselPlanta fotos={fotosPlanta} nombre={fabricacionTextos.tiraFotos} />
      </div>
    </section>
  )
}
