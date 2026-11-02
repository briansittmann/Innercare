'use client'

import { useSyncExternalStore } from 'react'
import { ribbonScreenPoint } from '@/components/ghost-fibers'
import { HeroFibers } from './hero-intro'

// La cinta de fibras de la escena fija del recorrido (tour-scroll.tsx). Es
// un solo GhostFibers (un solo contexto WebGL) con dos tomas:
// - 'hero': detrás del texto y del cuerpo en la toma del hero, bajando en
//   diagonal desde arriba a la izquierda hacia el cuello. Se funde con el
//   texto de la entrada (camara.ts, opacidadEntrada).
// - 'cierre': detrás del cuerpo entero. Entra por el costado izquierdo a
//   media altura (ENTRADA_CIERRE), cruza el torso y sale por arriba a la
//   derecha (SALIDA_CIERRE). Aparece con la última toma
//   (opacidadFondoCierre) y vuelve a crecer desde el costado izquierdo cada
//   vez (introKey): es su comienzo, el lado que el usuario quería ver primero.
// GhostFibers lee sus ajustes en cada cuadro, así que alcanza con cambiarle
// las props: la toma la escribe tour-scroll.tsx con el progreso
// (fijarTomaFibras) y cambia mientras la cinta no se ve.

export type TomaFibras = 'hero' | 'cierre'

let toma: TomaFibras = 'hero'
// Cuántas veces se pasó al cierre: cada vez, la intro de la cinta corre de
// nuevo (la cinta crece desde el costado izquierdo); al volver al hero, no
let vecesCierre = 0
const oyentes = new Set<() => void>()

export function fijarTomaFibras(nueva: TomaFibras) {
  if (nueva === toma) return
  toma = nueva
  if (nueva === 'cierre') vecesCierre += 1
  oyentes.forEach((avisar) => avisar())
}

const suscribirToma = (avisar: () => void) => {
  oyentes.add(avisar)
  return () => {
    oyentes.delete(avisar)
  }
}

const leerToma = () => toma
const tomaServidor = (): TomaFibras => 'hero'
const leerVecesCierre = () => vecesCierre
const vecesServidor = () => 0

// Ubicación de cada cinta en la toma del hero: [desplazamiento, profundidad,
// pendiente, fase]. La principal es la de fábrica. La segunda, más atrás
// (misma profundidad que la de fábrica), entra por arriba a la altura de la
// barra, pasa por encima de la cabeza y sale por la derecha a un 44 % del
// alto. Hoy se dibuja solo la principal (layers={1}): la segunda queda por si
// vuelve.
const UBICACION_HERO = [
  [0, 0, 0, 0],
  [2.1, -4.6, 0.29, 2.4],
]

// Giro de la cinta del hero, en grados: negativo baja hacia la derecha
const GIRO_HERO = -39

// Cierre: por dónde entra y por dónde sale el centro de la cinta, en
// fracciones del alto de la pantalla (desde arriba): entra por el borde
// izquierdo al 70 % y sale por la esquina de arriba a la derecha, con lo
// que cruza el cuerpo (al 68 % del ancho en escritorio) por los hombros.
// Las ondas la mueven alrededor de esa línea.
const ENTRADA_CIERRE = 0.7
const SALIDA_CIERRE = 0.04

type Cinta = { rotation: number; placements: number[][] }

// Giro y desplazamiento de la cinta del cierre para que su centro, visto por
// la cámara de GhostFibers (en perspectiva: el extremo izquierdo está más
// cerca), cruce los bordes donde dice ENTRADA_CIERRE y SALIDA_CIERRE.
// Newton con jacobiano numérico sobre (giro, desplazamiento); converge en
// pocas vueltas porque el giro mueve la pendiente y el desplazamiento, la
// altura.
function cintaCierre(ancho: number, alto: number): Cinta {
  const bordes = (giro: number, desplazamiento: number) => {
    const place = [desplazamiento, 0, 0, 0]
    const a = ribbonScreenPoint(ancho, alto, { rotation: giro }, place, -0.15)
    const b = ribbonScreenPoint(ancho, alto, { rotation: giro }, place, 0.15)
    const pendiente = (b.y - a.y) / (b.x - a.x || 1e-6)
    return [
      (a.y + (0 - a.x) * pendiente) / alto - ENTRADA_CIERRE,
      (a.y + (ancho - a.x) * pendiente) / alto - SALIDA_CIERRE,
    ] as const
  }
  let giro = (Math.atan2((ENTRADA_CIERRE - SALIDA_CIERRE) * alto, ancho) * 180) / Math.PI
  let desplazamiento = 0
  for (let i = 0; i < 12; i += 1) {
    const [e0, e1] = bordes(giro, desplazamiento)
    if (Math.abs(e0) < 1e-4 && Math.abs(e1) < 1e-4) break
    const dg = 0.5
    const dd = 0.05
    const [g0, g1] = bordes(giro + dg, desplazamiento)
    const [d0, d1] = bordes(giro, desplazamiento + dd)
    const j00 = (g0 - e0) / dg
    const j01 = (d0 - e0) / dd
    const j10 = (g1 - e1) / dg
    const j11 = (d1 - e1) / dd
    const det = j00 * j11 - j01 * j10
    if (!det) break
    giro -= (j11 * e0 - j01 * e1) / det
    desplazamiento -= (-j10 * e0 + j00 * e1) / det
  }
  return { rotation: giro, placements: [[desplazamiento, 0, 0, 0]] }
}

// La cinta del cierre depende del tamaño de la pantalla: se recalcula al
// redimensionar (cacheada por tamaño, porque useSyncExternalStore pide el
// mismo valor para el mismo estado)
let cintaCache: { clave: string; cinta: Cinta } | null = null
const suscribirTamano = (avisar: () => void) => {
  window.addEventListener('resize', avisar)
  return () => window.removeEventListener('resize', avisar)
}
const leerCintaCierre = () => {
  const clave = `${window.innerWidth}x${window.innerHeight}`
  if (cintaCache?.clave !== clave) {
    cintaCache = { clave, cinta: cintaCierre(window.innerWidth, window.innerHeight) }
  }
  return cintaCache.cinta
}
const CINTA_SERVIDOR: Cinta = { rotation: 28, placements: [[0.7, 0, 0, 0]] }
const leerCintaServidor = () => CINTA_SERVIDOR

export function FibrasEscena() {
  const actual = useSyncExternalStore(suscribirToma, leerToma, tomaServidor)
  const cinta = useSyncExternalStore(suscribirTamano, leerCintaCierre, leerCintaServidor)
  const veces = useSyncExternalStore(suscribirToma, leerVecesCierre, vecesServidor)
  const cierre = actual === 'cierre'
  return (
    <HeroFibers
      lightMode
      glowColor="#003c6f"
      secondaryColor="#2260a1"
      lineColor="#ffffff"
      rotation={cierre ? cinta.rotation : GIRO_HERO}
      fiberStyle="strands"
      threads={96}
      layers={1}
      placements={cierre ? cinta.placements : UBICACION_HERO}
      introKey={veces}
      depthOfField={0.3}
      brightness={0.75}
      particles={0.3}
      sparkle={0.6}
      grain={0}
      vignette={0}
    />
  )
}
