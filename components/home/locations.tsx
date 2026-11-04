import AnimatedContent from '@/components/animated-content'
import { distribucionTextos, sedes, textosHome } from '@/content/company'
import { MAPA, provincias } from '@/content/mapa-argentina'
import type { Sede } from '@/content/types'
import { proyectar } from './mapa-proyeccion'
import { MapaArgentina } from './mapa-argentina'
import type { SedeEnMapa, Tramo } from './mapa-layout'
import { MapaSedes } from './mapa-sedes'

// Distribución a todo el país (#sedes), con la disposición del borrador de
// la landing: a la izquierda el título y la bajada, que entran palabra por
// palabra con un desenfoque que se aclara (AnimatedContent); a la derecha
// (desde 1024 px: en una tablet a dos columnas las etiquetas no entran), un
// mapa de Argentina con las cuatro sedes, la línea que las une de norte a
// sur y una card con la miniatura de cada una (docs/DECISIONES.md). Acá se
// proyectan las sedes, se reparten las etiquetas y se arman los tramos con
// los tiempos de la entrada; el dibujo es de MapaArgentina (estático) y
// MapaSedes (interactivo). Sin fondo propio: va dentro de FondoMalla
// (app/page.tsx), que pinta el de la página y la malla hexagonal.

// Dos sedes a menos de esta fracción del alto comparten grupo: sus etiquetas
// se reparten a --paso (CSS) de la media del grupo
const CERCANIA = 0.08
// Entrada (ms): el mapa se dibuja primero (globals.css, .mapa-contorno);
// después cada pin aparece de a uno, de norte a sur, y recién entonces los
// tramos se dibujan uno tras otro, cada uno en proporción a su largo.
const INICIO_PINES = 1000
const PASO_PINES = 220
const DURACION_TRAMOS = 1300
const TRAMO_MINIMO = 260
// La luz que recorre la línea arranca cuando el último tramo terminó
const PAUSA_LUZ = 250

const ciudad = (sede: Sede) => sede.localidad.replace(/^[A-Z]\d{4}[A-Z]{3}\s+/, '')
const provincia = (sede: Sede) => sede.provincia.replace(/^Provincia de\s+/, '')
// Rol corto para la etiqueta, según el tipo de sede elegido en el panel; el
// globo lleva el nombre completo, sin repetir la ciudad ("Sucursal Comodoro
// Rivadavia" ya la dice la dirección)
const rol = (sede: Sede) => {
  if (sede.rol === 'sucursal') return 'Sucursal'
  if (sede.rol === 'laboratorio') return 'Laboratorio'
  return sede.tipo
}
const tipo = (sede: Sede) => (sede.rol === 'sucursal' ? 'Sucursal' : sede.tipo)

// La provincia de la sede en el mapa, por nombre (Natural Earth los trae en
// castellano, sin "Provincia de")
const provinciaDe = (sede: Sede) => provincias.find((p) => p.nombre === provincia(sede))?.id ?? ''

// De norte a sur: el orden de los pines y de la línea
const deNorteASur = (lista: readonly Sede[]) => [...lista].sort((a, b) => b.latitud - a.latitud)

// Pin de cada sede: x en fracción del ancho del lienzo, y en fracción de
// su alto (que es el alto de la columna)
const pinDe = (sede: Sede) => {
  const { x, y } = proyectar(sede.latitud, sede.longitud, MAPA)
  return { x: x / MAPA.ancho, y: y / MAPA.alto }
}

// Etiquetas: cada una a la altura de su pin, salvo que choque con la
// anterior (Caseros y Alberti están a 0,4° entre sí; Comodoro Rivadavia y
// Caleta Olivia, a 0,6°). Las que chocan se reparten, parejas, alrededor de
// la altura media del grupo (k = -0,5 y 0,5 pasos), y la guía une cada pin
// con su etiqueta.
function ubicar(ordenadas: readonly Sede[]) {
  const grupos: { sede: Sede; y: number }[][] = []
  for (const sede of ordenadas) {
    const { y } = pinDe(sede)
    const ultimo = grupos.at(-1)
    const previa = ultimo?.at(-1)
    if (ultimo && previa && y - previa.y < CERCANIA) ultimo.push({ sede, y })
    else grupos.push([{ sede, y }])
  }
  return grupos.flatMap((grupo) => {
    const yGrupo = grupo.reduce((suma, { y }) => suma + y, 0) / grupo.length
    const extremo = (grupo.length - 1) / 2
    return grupo.map(({ sede }, i) => ({ sede, yGrupo, k: i - extremo }))
  })
}

// La línea une las sedes de norte a sur, tramo por tramo. Cada tramo es una
// curva suave que se arquea hacia el oeste (el interior del país), en
// proporción a su largo. Devuelve los tramos con sus tiempos y el trazado
// entero, por donde corre la luz.
function linea(ordenadas: readonly Sede[]) {
  const puntos = ordenadas.map((s) => proyectar(s.latitud, s.longitud, MAPA))
  const n = (v: number) => v.toFixed(1)
  const curvas = puntos.slice(1).map((b, i) => {
    const a = puntos[i]!
    const dx = b.x - a.x
    const dy = b.y - a.y
    const largo = Math.hypot(dx, dy)
    // Normal hacia el oeste (x negativa)
    let nx = -dy / largo
    let ny = dx / largo
    if (nx > 0) {
      nx = -nx
      ny = -ny
    }
    const control = { x: (a.x + b.x) / 2 + nx * largo * 0.14, y: (a.y + b.y) / 2 + ny * largo * 0.14 }
    return { a, b, control, largo }
  })
  const total = curvas.reduce((suma, c) => suma + c.largo, 0)
  const inicio = INICIO_PINES + PASO_PINES * ordenadas.length + 150
  let t = inicio
  const tramos: Tramo[] = curvas.map(({ a, b, control, largo }) => {
    const duracion = Math.round(Math.max(TRAMO_MINIMO, (largo / total) * DURACION_TRAMOS))
    const tramo = {
      d: `M${n(a.x)} ${n(a.y)}Q${n(control.x)} ${n(control.y)} ${n(b.x)} ${n(b.y)}`,
      retraso: t,
      duracion,
    }
    t += duracion
    return tramo
  })
  const primero = puntos[0]!
  const entera =
    `M${n(primero.x)} ${n(primero.y)}` +
    curvas.map(({ b, control }) => `Q${n(control.x)} ${n(control.y)} ${n(b.x)} ${n(b.y)}`).join('')
  return { tramos, entera, inicioLuz: t + PAUSA_LUZ }
}

// Palabras sueltas para la entrada escalonada del título y la bajada: cada
// una es un hijo directo de AnimatedContent (inline-block, para que el
// desplazamiento se aplique) y los espacios quedan como texto entre ellas.
const palabras = (texto: string) =>
  texto.split(' ').flatMap((palabra, i) => [
    i > 0 ? ' ' : null,
    <span key={i} className="inline-block">
      {palabra}
    </span>,
  ])

export function Locations() {
  const { titulo, texto } = textosHome.distribucion
  const ordenadas = deNorteASur(sedes)
  const { tramos, entera, inicioLuz } = linea(ordenadas)
  const enMapa: SedeEnMapa[] = ubicar(ordenadas).map(({ sede, ...etiqueta }, i) => ({
    id: sede.id,
    ciudad: ciudad(sede),
    provincia: provincia(sede),
    rol: rol(sede),
    tipo: tipo(sede),
    calle: sede.calle,
    provinciaId: provinciaDe(sede),
    foto: sede.foto,
    ...pinDe(sede),
    ...etiqueta,
    retraso: INICIO_PINES + i * PASO_PINES,
  }))
  const conSede = new Set(enMapa.map((s) => s.provinciaId))
  const provinciasConSede = provincias.filter((p) => conSede.has(p.id)).map(({ id, d }) => ({ id, d }))

  return (
    <section
      id="sedes"
      aria-labelledby="sedes-titulo"
      className="py-[clamp(5.5rem,13vh,9.375rem)]"
    >
      <div className="page-container grid items-center gap-[clamp(1.75rem,5vw,5rem)] lg:grid-cols-2">
        {/* En dos columnas, el texto baja para quedar centrado con las
            sedes (etiquetas y pines), que están 2 rem por debajo del centro
            de la caja del mapa: el norte del país es más alto que el sur */}
        <div className="lg:pt-16">
          <AnimatedContent
            as="h2"
            id="sedes-titulo"
            className="max-w-[16ch] text-balance font-display-lg text-display-lg text-on-surface"
            distance={22}
            blur={10}
            duration={0.9}
            stagger={0.07}
            threshold={0.2}
          >
            {palabras(titulo)}
          </AnimatedContent>
          <AnimatedContent
            as="p"
            className="mt-[1.25rem] max-w-[56ch] text-body-lg text-on-surface-variant"
            distance={10}
            blur={6}
            duration={0.7}
            delay={0.35}
            stagger={0.022}
            threshold={0.2}
          >
            {palabras(texto)}
          </AnimatedContent>
        </div>

        <MapaSedes
          nombre={distribucionTextos.mapaAria}
          sedes={enMapa}
          provinciasConSede={provinciasConSede}
          tramos={tramos}
          linea={entera}
          inicioLuz={inicioLuz}
          viewBox={{ ancho: MAPA.ancho, alto: MAPA.alto }}
        >
          <MapaArgentina />
        </MapaSedes>
      </div>
    </section>
  )
}
