'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { AnchorLink } from '@/components/anchor-link'
import {
  TRAMOS,
  clamp,
  indiceVisible,
  opacidadCierre,
  opacidadEntrada,
  pesoTarjeta,
} from '@/components/recorrido-3d/camara'
import { estadoRecorrido } from '@/components/recorrido-3d/estado'
import { Recorrido3D } from '@/components/recorrido-3d/recorrido-3d'
import { useIntroPhase } from '@/components/intro'

// Armazón del recorrido por el cuerpo (#recorrido), con el comportamiento del
// borrador (docs/landing/landing-borrador.html, updateTour): un contenedor de
// ocho pantallas con una escena fija (sticky). El progreso del scroll mueve
// la cámara del cuerpo 3D (components/recorrido-3d/) y, con el mismo guion
// (camara.ts), funde las tarjetas, el texto de entrada, el del cierre y el
// índice anatómico. Todo sale de una sola fuente: el progreso, amortiguado
// apenas para que la rueda del mouse no dé saltos.
//
// Entrada (k = 0): el cuerpo entero a la derecha y el título a la izquierda.
// Paradas (k = 1…6): el implante al 34 % del ancho y la tarjeta a la
// derecha (en el celular, arriba, y la tarjeta como hoja inferior). Cierre
// (k = 7): el cuerpo entero y el texto final.
//
// Sin JS (`scripting: none` en globals.css), la escena deja de ser fija y
// todo se lee en orden: título, tarjetas y cierre. Con JS, lo que la escena
// oculta lo oculta el CSS bajo `scripting: enabled`, nunca el HTML.
//
// Sin WebGL, o mientras carga, la escena muestra el lugar reservado: una
// vista de planificación por parada (`vistas`).
export function TourScroll({
  paradas,
  vistas,
  entrada,
  cierre,
  children,
}: {
  // Índice anatómico: id del ancla de cada parada y su nombre
  paradas: readonly { ancla: string; zona: string }[]
  // Lugar reservado: una vista por parada, más la del cuerpo entero al final
  vistas: readonly ReactNode[]
  entrada: ReactNode
  cierre: ReactNode
  // Las tarjetas, cada una con data-tarjeta="<índice>"
  children: ReactNode
}) {
  const contenedor = useRef<HTMLDivElement>(null)
  const escena = useRef<HTMLDivElement>(null)
  const capaEntrada = useRef<HTMLDivElement>(null)
  const capaCierre = useRef<HTMLDivElement>(null)
  const indice = useRef<HTMLElement>(null)
  const riel = useRef<HTMLOListElement>(null)
  // Parada marcada en el índice (-1: ninguna) y vista del lugar reservado
  const [actual, setActual] = useState(-1)
  const [vista, setVista] = useState(paradas.length)
  const [alcanzado, setAlcanzado] = useState(false)
  const [enVista, setEnVista] = useState(false)
  const [listo, setListo] = useState(false)
  // El 3D no compite con la entrada del hero (components/intro.ts): ni el
  // modelo (918 KB) ni el contexto WebGL se piden hasta que la entrada
  // termina y el recorrido asoma en pantalla. Mientras tanto se ve el lugar
  // reservado.
  const fase = useIntroPhase()
  const cerca = alcanzado && fase === 'done'

  // Se dibuja solo mientras el recorrido está en pantalla
  useEffect(() => {
    const nodo = contenedor.current
    if (!nodo) return
    const visible = new IntersectionObserver(([e]) => setEnVista(Boolean(e?.isIntersecting)))
    // "Se acerca": el recorrido ya asoma un 5 % de la pantalla. Con margen 0,
    // un borde que apenas toca el de la pantalla ya cuenta como visible, y el
    // recorrido empieza justo debajo del hero.
    const asoma = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setAlcanzado(true)
      },
      { rootMargin: '0px 0px -5% 0px' },
    )
    visible.observe(nodo)
    asoma.observe(nodo)
    return () => {
      visible.disconnect()
      asoma.disconnect()
      // Cache Components conserva la ruta oculta: el canvas deja de dibujar
      setEnVista(false)
    }
  }, [])

  useEffect(() => {
    const nodo = contenedor.current
    const fijo = escena.current
    if (!nodo || !fijo) return
    estadoRecorrido.escena = fijo
    const tarjetas = [...nodo.querySelectorAll<HTMLElement>('[data-tarjeta]')]
    const movimiento = window.matchMedia('(prefers-reduced-motion: reduce)')

    let objetivo = 0
    let seg = -1
    let cuadro = 0
    let antes = 0
    let ultimaMarca = -2
    let ultimaVista = -1
    let ultimoDibujo = Number.NaN

    const leer = () => {
      const r = nodo.getBoundingClientRect()
      const recorrido = r.height - window.innerHeight
      objetivo = recorrido > 0 ? clamp(-r.top / recorrido) * TRAMOS : 0
      estadoRecorrido.fijo = r.top <= 0 && r.bottom >= window.innerHeight
    }

    const mostrar = (el: HTMLElement | null, opacidad: number) => {
      if (!el) return
      el.style.opacity = opacidad.toFixed(3)
      el.style.visibility = opacidad < 0.02 ? 'hidden' : 'visible'
    }

    const pintar = (s: number) => {
      const reducido = movimiento.matches
      estadoRecorrido.seg = s
      estadoRecorrido.reducido = reducido
      let mejor = -1
      let peso = 0
      tarjetas.forEach((tarjeta, i) => {
        const w = pesoTarjeta(s, i, reducido)
        if (w > peso) {
          peso = w
          mejor = i
        }
        mostrar(tarjeta, w)
        // ±22 px según de qué lado viene (borrador)
        const y = reducido ? 0 : (1 - w) * 22 * (s < i + 1 ? 1 : -1)
        tarjeta.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0)`
      })
      mostrar(capaEntrada.current, opacidadEntrada(s, reducido))
      mostrar(capaCierre.current, opacidadCierre(s, reducido))
      const nav = indice.current
      if (nav) {
        const v = indiceVisible(s)
        nav.style.opacity = v ? '1' : '0'
        nav.style.visibility = s > 0.4 && s < 6.6 ? 'visible' : 'hidden'
      }
      // Riel del índice: se llena de forma continua de la primera parada
      // (seg 1) a la última (seg 6)
      riel.current?.style.setProperty(
        '--avance',
        clamp((s - 1) / Math.max(1, tarjetas.length - 1)).toFixed(4),
      )
      const marca = peso > 0.5 ? mejor : -1
      if (marca !== ultimaMarca) {
        ultimaMarca = marca
        setActual(marca)
      }
      // Lugar reservado: la parada más cercana; en la entrada y el cierre,
      // el cuerpo entero (la última vista)
      const k = Math.round(s)
      const nuevaVista = k >= 1 && k <= tarjetas.length ? k - 1 : tarjetas.length
      if (nuevaVista !== ultimaVista) {
        ultimaVista = nuevaVista
        setVista(nuevaVista)
      }
      // El canvas dibuja solo si cambió el progreso. Mientras el recorrido
      // entra en pantalla (seg = 0) no dibuja nada: el hero, que todavía se
      // ve, es el único que anima. Una vez fija la escena, el hero ya salió
      // de pantalla y se detiene solo.
      if (s !== ultimoDibujo) {
        ultimoDibujo = s
        estadoRecorrido.invalidar?.()
      }
    }

    // Amortiguación exponencial hacia el progreso real, independiente de los
    // cuadros por segundo. Con movimiento reducido, sin amortiguar.
    const paso = (ahora: number) => {
      const dt = Math.min(0.1, (ahora - antes) / 1000)
      antes = ahora
      if (movimiento.matches || seg < 0) seg = objetivo
      else seg += (objetivo - seg) * (1 - Math.exp(-11 * dt))
      if (Math.abs(objetivo - seg) < 0.0005) seg = objetivo
      pintar(seg)
      cuadro = seg === objetivo ? 0 : requestAnimationFrame(paso)
    }

    const alMover = () => {
      leer()
      if (cuadro) return
      antes = performance.now()
      cuadro = requestAnimationFrame(paso)
    }

    const alRedimensionar = () => {
      ultimoDibujo = Number.NaN
      alMover()
    }

    alMover()
    window.addEventListener('scroll', alMover, { passive: true })
    window.addEventListener('resize', alRedimensionar)
    movimiento.addEventListener('change', alMover)
    return () => {
      window.removeEventListener('scroll', alMover)
      window.removeEventListener('resize', alRedimensionar)
      movimiento.removeEventListener('change', alMover)
      cancelAnimationFrame(cuadro)
      if (estadoRecorrido.escena === fijo) estadoRecorrido.escena = null
    }
  }, [])

  return (
    <div
      ref={contenedor}
      className="recorrido"
      style={{ '--tramos': TRAMOS + 1 } as CSSProperties}
    >
      {/* Anclas de cada parada, a la altura de scroll donde la cámara llega a
          ella (k pantallas desde el principio del recorrido) */}
      {paradas.map((parada, i) => (
        <span
          key={parada.ancla}
          id={parada.ancla}
          aria-hidden
          className="recorrido-ancla"
          style={{ '--k': i + 1 } as CSSProperties}
        />
      ))}

      <div ref={escena} data-escena-3d data-listo={listo || undefined} className="recorrido-escena escenario">
        <div aria-hidden className="recorrido-luz" />

        {/* Lugar reservado del 3D (sin WebGL o mientras carga) */}
        <div aria-hidden className="recorrido-vistas">
          {vistas.map((v, i) => (
            <div
              key={i}
              data-visible={i === vista || undefined}
              className="escena-vista escenario absolute inset-0"
            >
              {v}
            </div>
          ))}
        </div>

        <div
          role="img"
          aria-label="Cuerpo de vidrio con el esqueleto a la vista y seis implantes de titanio: craneoplastía, reconstrucción maxilar, prótesis reversa de hombro, reconstrucción acetabular, endoprótesis de fémur proximal e implante intercalar de fémur"
          className="recorrido-lienzo"
        >
          <Recorrido3D cerca={cerca} enVista={enVista} alListo={() => setListo(true)} />
        </div>

        <div aria-hidden className="recorrido-halo" />

        <div ref={capaEntrada} className="recorrido-texto recorrido-entrada">
          {entrada}
        </div>

        <nav ref={indice} aria-label="Implantes del recorrido" className="recorrido-indice">
          <ol ref={riel} className="indice-riel relative flex flex-col gap-[2px]">
            {paradas.map((parada, i) => (
              <li key={parada.ancla}>
                <AnchorLink
                  href={`#${parada.ancla}`}
                  aria-current={i === actual ? 'location' : undefined}
                  className="indice-enlace relative block px-[0.875rem] py-[0.375rem] text-body-sm text-on-surface-variant transition-colors duration-200 hover:text-primary aria-[current]:font-semibold aria-[current]:text-on-surface"
                >
                  {parada.zona}
                </AnchorLink>
              </li>
            ))}
          </ol>
        </nav>

        <div className="recorrido-riel">{children}</div>

        <div ref={capaCierre} className="recorrido-texto recorrido-cierre">
          {cierre}
        </div>
      </div>
    </div>
  )
}
