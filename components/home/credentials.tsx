import AnimatedContent from '@/components/animated-content'
import { LecturaHabilitaciones } from '@/components/home/lectura-habilitaciones'
import { habilitaciones, textosHome } from '@/content/company'

// Habilitados por ANMAT (#habilitaciones), con la estructura del borrador de
// la landing: a la izquierda el título y la bajada; a la derecha, la tabla de
// las cuatro habilitaciones de la carpeta, con la referencia en el primario y
// en cifras tabulares. La banda va un tono más oscura que las vecinas
// (surface-container-low), para separar el tramo de datos.
//
// Movimiento, una vez al llegar: el título y la bajada entran como los textos
// del hero (desenfoque que se aclara); la tabla se lee de arriba a abajo con
// una línea de luz que resuelve los números (LecturaHabilitaciones); detrás,
// una luz de la marca se enciende con el scroll (.habilitaciones-luz, CSS).
export function Credentials() {
  const { titulo, texto } = textosHome.habilitaciones

  return (
    <section
      id="habilitaciones"
      aria-labelledby="habilitaciones-titulo"
      className="relative bg-surface-container-low py-[clamp(5.5rem,13vh,9.375rem)]"
    >
      <div aria-hidden className="habilitaciones-luz" />
      <div className="page-container relative grid items-start gap-[clamp(1.75rem,5vw,5rem)] md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <AnimatedContent stagger={0.1} distance={14} blur={6} threshold={0.2}>
          <h2
            id="habilitaciones-titulo"
            className="max-w-[16ch] text-balance font-display-lg text-display-lg text-on-surface"
          >
            {titulo}
          </h2>
          <p className="mt-[1.25rem] max-w-[56ch] text-body-lg text-on-surface-variant">{texto}</p>
        </AnimatedContent>

        <LecturaHabilitaciones habilitaciones={habilitaciones} />
      </div>
    </section>
  )
}
