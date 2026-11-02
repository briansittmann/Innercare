'use client'

import dynamic from 'next/dynamic'
import Image from 'next/image'
import { useEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from 'react'
import type { FotoPlanta } from '@/content/types'

// Tira de fotos reales al cierre de Fabricación: la planta y piezas
// fabricadas, en color, con el Flex Carousel de React Bits
// (components/flex-carousel.tsx). Todas las tarjetas van bajo un velo azul
// salvo la que se señala (o, sin puntero, la del centro).
//
// Es el tercer contexto WebGL de la home, así que se monta solo cuando la
// sección se acerca (60 % de pantalla de margen) y se desmonta un segundo
// después de alejarse, con lo que libera el contexto. El componente carga
// con `next/dynamic` sin SSR: `ogl` y el carrusel no entran en el bundle
// inicial.
//
// El HTML trae siempre el respaldo (la misma tira con scroll horizontal):
// se ve sin JS (CSS, .carrusel-respaldo) y sin WebGL2 (`data-respaldo`).
const FlexCarousel = dynamic(() => import('@/components/flex-carousel'), { ssr: false })

// El velo: --color-on-primary-fixed (#001c39) en RGB 0..1
const VELO: [number, number, number] = [0, 0.11, 0.224]
const GRACIA_DESMONTE = 1000

// En pantallas angostas la lente curva las tarjetas de los costados hacia
// abajo de la del centro, justo donde va su caption. Ahí la curva lleva tope,
// la caption baja lo que la curva alcanza y la fila sube para que nada se
// corte contra los bordes de la caja (components/flex-carousel.tsx).
const ANGOSTA = '(max-width: 639px)'
const suscribirAngosta = (avisar: () => void) => {
  const mq = window.matchMedia(ANGOSTA)
  mq.addEventListener('change', avisar)
  return () => mq.removeEventListener('change', avisar)
}
const esAngosta = () => window.matchMedia(ANGOSTA).matches

// En escritorio la curva es mucho más grande que la franja de las tarjetas.
// Para que no la corte un borde invisible, el canvas se estira hacia el
// espacio libre: arriba, hasta las tarjetas de Fabricación; abajo, hasta el
// final de la sección (la banda siguiente es de otro color). La fila queda en
// el mismo lugar, solo la franja recibe el puntero y la curva lleva el tope
// de lo que entra en ese espacio. Medidas en px; se recalculan al cambiar el
// tamaño de la sección.
const ALTO_TARJETA = 0.64 // de la franja, como antes de estirar
const RESGUARDO = 10 // px libres entre la curva y lo que sigue
const ALCANCE = 1.2 // desplazamiento máximo de la curva, en múltiplos del tope

type Estiramiento = { arriba: number; abajo: number; alto: number }

function medirEstiramiento(raiz: HTMLElement): Estiramiento | null {
  const caja = raiz.getBoundingClientRect()
  const anterior = raiz.parentElement?.previousElementSibling?.getBoundingClientRect()
  const seccion = raiz.closest('section')?.getBoundingClientRect()
  if (!anterior || !seccion) return null
  return {
    arriba: Math.max(0, Math.round(caja.top - anterior.bottom - RESGUARDO)),
    abajo: Math.max(0, Math.round(seccion.bottom - caja.bottom - RESGUARDO)),
    alto: caja.height,
  }
}

export function CarruselPlanta({ fotos }: { fotos: readonly FotoPlanta[] }) {
  const nodo = useRef<HTMLDivElement>(null)
  const [cerca, setCerca] = useState(false)
  const [respaldo, setRespaldo] = useState(false)
  const angosta = useSyncExternalStore(suscribirAngosta, esAngosta, () => false)
  const [estiramiento, setEstiramiento] = useState<Estiramiento | null>(null)

  useEffect(() => {
    const raiz = nodo.current
    const seccion = raiz?.closest('section')
    if (!raiz || !seccion) return
    const tamano = new ResizeObserver(() => setEstiramiento(medirEstiramiento(raiz)))
    tamano.observe(seccion)
    return () => tamano.disconnect()
  }, [])

  useEffect(() => {
    const el = nodo.current
    if (!el) return
    let temporizador = 0
    const observador = new IntersectionObserver(
      ([e]) => {
        if (!e) return
        window.clearTimeout(temporizador)
        if (!e.isIntersecting) {
          temporizador = window.setTimeout(() => setCerca(false), GRACIA_DESMONTE)
          return
        }
        // Recién al acercarse se comprueba WebGL2: sin soporte, queda el
        // respaldo y no se vuelve a montar nada
        if (!document.createElement('canvas').getContext('webgl2')) {
          setRespaldo(true)
          observador.disconnect()
          return
        }
        setCerca(true)
      },
      { rootMargin: '60% 0px' },
    )
    observador.observe(el)
    return () => {
      observador.disconnect()
      window.clearTimeout(temporizador)
    }
  }, [])

  // Escritorio: el canvas estirado, con la fila y el tope de la curva
  // calculados para que la franja de las tarjetas quede igual que sin estirar
  const estirar = !angosta && estiramiento
  let escritorio: {
    estilo: CSSProperties
    cardHeight: number
    align: number
    maxCurl: number
    hitArea: { top: number; bottom: number }
  } | null = null
  if (estirar) {
    const { arriba, abajo, alto } = estiramiento
    const total = alto + arriba + abajo
    const tarjeta = alto * ALTO_TARJETA
    const libre = (alto - tarjeta) / 2
    escritorio = {
      estilo: { position: 'absolute', insetInline: 0, top: -arriba, height: total },
      cardHeight: tarjeta / total,
      align: (arriba + alto / 2) / total,
      maxCurl: Math.min(arriba + libre, abajo + libre) / ALCANCE,
      hitArea: { top: arriba, bottom: abajo },
    }
  }

  const items = fotos.map((foto) => ({
    src: foto.src,
    alt: foto.alt,
    title: foto.titulo,
    subtitle: foto.subtitulo,
  }))

  return (
    <div
      ref={nodo}
      data-respaldo={respaldo ? '' : undefined}
      className="carrusel-planta relative h-[26rem] sm:h-[clamp(22rem,44vh,28rem)]"
    >
      {cerca && !respaldo && (
        <FlexCarousel
          items={items}
          preset="liquid"
          dispersion={0.15}
          intro="rise"
          cardHeight={escritorio ? escritorio.cardHeight : angosta ? 0.54 : ALTO_TARJETA}
          maxCurl={escritorio ? escritorio.maxCurl : angosta ? 36 : undefined}
          align={escritorio ? escritorio.align : angosta ? 0.42 : 0.5}
          captionBelowCurl={angosta}
          hitArea={escritorio?.hitArea}
          style={escritorio?.estilo}
          gap={14}
          radius={12}
          fit="natural"
          autoplay={false}
          veil
          veilColor={VELO}
          ariaLabel="Fotos de la planta y de los implantes"
          onUnsupported={() => setRespaldo(true)}
        />
      )}
      <ul className="carrusel-respaldo page-container flex h-full snap-x snap-mandatory gap-[14px] overflow-x-auto overscroll-x-contain pb-[0.5rem]">
        {fotos.map((foto) => (
          <li key={foto.src} className="flex h-full w-[min(78vw,26rem)] shrink-0 snap-center flex-col gap-[0.625rem]">
            <div className="relative min-h-0 flex-1 overflow-hidden rounded-xl bg-surface-container ring-1 ring-outline-variant/50">
              <Image src={foto.src} alt={foto.alt} fill sizes="(min-width: 640px) 26rem, 78vw" className="object-cover" />
            </div>
            <p className="text-body-sm text-on-surface">
              {foto.titulo}
              <span className="block text-on-surface-variant">{foto.subtitulo}</span>
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
