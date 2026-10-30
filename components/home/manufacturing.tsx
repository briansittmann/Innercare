import { MapPinIcon } from '@phosphor-icons/react/ssr'
import { PlantPhoto } from '@/components/plant-photo'
import { manufactura, sedes, textosHome } from '@/content/company'

const planta = sedes.find((sede) => sede.id === 'planta')

// Foto de cada tecnología: el lugar de su animación (fase 5: la fresa que
// barre el bloque y la pieza que crece capa por capa). Misma proporción que
// tendrá la animación, para que el cambio no mueva nada.
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

// Mecanizado e impresión 3D en la misma planta (#fabricacion). Las dos
// tecnologías, en dos tarjetas de distinto ancho y a distinta altura.
export function Manufacturing() {
  const { titulo, texto } = textosHome.fabricacion

  return (
    <section
      id="fabricacion"
      aria-labelledby="fabricacion-titulo"
      className="bg-surface py-section md:py-[120px]"
    >
      {/* Composición encastrada desde md: el título arriba a la izquierda,
          la impresión 3D (más chica) a su derecha, centrada en el alto de las dos filas, y el
          mecanizado CNC (más grande) debajo del título, de modo que las dos
          tarjetas quedan desfasadas y sin huecos. En el celular, en orden. */}
      <div className="page-container grid gap-xl md:grid-cols-12 md:gap-x-lg md:gap-y-xl">
        <div className="md:col-span-6 md:row-start-1">
          <h2
            id="fabricacion-titulo"
            className="max-w-[18ch] text-balance font-display-lg text-display-lg text-on-surface"
          >
            {titulo}
          </h2>
          <p className="mt-md max-w-[48ch] text-body-lg text-on-surface-variant">{texto}</p>
          {planta && (
            <p className="mt-lg flex items-start gap-sm text-body-sm text-on-surface-variant">
              <MapPinIcon size={20} weight="light" aria-hidden className="shrink-0 text-primary" />
              <span>
                {planta.tipo}, {planta.localidad}.{' '}
                <span className="font-data-mono tabular-nums">{planta.calle}</span>
              </span>
            </p>
          )}
        </div>

        {manufactura.map((tecnica, i) => (
          <article
            key={tecnica.id}
            aria-labelledby={`fabricacion-${tecnica.id}`}
            className={
              i === 0
                ? 'md:col-span-7 md:row-start-2'
                : 'md:col-span-5 md:col-start-8 md:row-span-2 md:row-start-1 md:self-center'
            }
          >
            <PlantPhoto
              src={fotos[tecnica.id].src}
              alt={fotos[tecnica.id].alt}
              sizes={i === 0 ? '(min-width: 768px) 58vw, 100vw' : '(min-width: 768px) 42vw, 100vw'}
              className="aspect-[4/3]"
              data-animacion-fabricacion={tecnica.id}
            />
            <p className="mt-lg font-data-mono text-data-mono text-primary">{tecnica.kicker}</p>
            <h3
              id={`fabricacion-${tecnica.id}`}
              className="mt-xs font-headline-lg text-headline-lg text-on-surface"
            >
              {tecnica.nombre}
            </h3>
            <p className="mt-sm max-w-[46ch] text-body-md text-on-surface-variant">
              {tecnica.texto}
            </p>
          </article>
        ))}
      </div>
    </section>
  )
}
