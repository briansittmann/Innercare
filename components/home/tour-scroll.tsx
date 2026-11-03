'use client'

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { AnchorLink } from '@/components/anchor-link'
import {
  ANCHO_CELULAR,
  PAUSA_CIERRE,
  REARME_ENTRADA_CIERRE,
  TRAMOS,
  UMBRAL_ENTRADA_CIERRE,
  clamp,
  DESLIZ_HERO,
  anclaHeroCelular,
  deslizHero,
  fibrasEnCierre,
  indiceVisible,
  opacidadCierre,
  opacidadEntrada,
  opacidadFondoCierre,
  pesoTarjeta,
  segDe,
} from '@/components/recorrido-3d/camara'
import { useIntroPhase } from '@/components/intro'
import { estadoRecorrido } from '@/components/recorrido-3d/estado'
import { Recorrido3D } from '@/components/recorrido-3d/recorrido-3d'
import { fijarTomaFibras } from './fibras-escena'
import { useProximidad } from './use-proximidad'

// Armazón del hero y del recorrido por el cuerpo (#recorrido), con el
// comportamiento del borrador (docs/landing/landing-borrador.html,
// updateTour): un contenedor de nueve pantallas (ocho más la pausa del
// cierre, PAUSA_CIERRE) con una escena fija (sticky)
// y un solo cuerpo 3D (components/recorrido-3d/). El progreso del scroll
// mueve la cámara y, con el mismo guion (camara.ts), funde el texto del
// hero, las fibras, las tarjetas, el texto del cierre y el índice
// anatómico. Todo sale de una sola fuente: el progreso, amortiguado apenas
// para que la rueda del mouse no dé saltos.
//
// Hero (k = 0): la cabeza de perfil, como el busto de antes, con el texto
// del hero encima y las fibras detrás. Paradas (k = 1…6): el implante al
// 34 % del ancho y la tarjeta a la derecha (en el celular, arriba, y la
// tarjeta como hoja inferior). Cierre (k = 7): el cuerpo entero, el texto
// final y, detrás del cuerpo, la misma cinta de fibras con otra diagonal;
// después, una pantalla de pausa con todo quieto, para que el final no se
// pase de largo, con el aviso "Deslizá para continuar" abajo a la derecha.
// Al llegar al cierre (UMBRAL_ENTRADA_CIERRE), una entrada por tiempo con
// gsap, cada vez que aparece: el título, la bajada, el botón (con rebote) y
// el aviso, de a uno (data-entra; estados en data-cierre: espera, entrando,
// lista), mientras la escena barre los implantes de la cabeza a los pies.
//
// Sin JS (`scripting: none` en globals.css), la escena deja de ser fija y
// todo se lee en orden: hero, tarjetas y cierre. Con JS, lo que la escena
// oculta lo oculta el CSS bajo `scripting: enabled`, nunca el HTML.
//
// Sin WebGL, o mientras carga, la escena muestra el lugar reservado: una
// vista de planificación por parada (`vistas`).
export function TourScroll({
  paradas,
  vistas,
  fondo,
  entrada,
  cierre,
  children,
}: {
  // Índice anatómico: id del ancla de cada parada y su nombre
  paradas: readonly { ancla: string; zona: string }[]
  // Lugar reservado: una vista por parada, más la del cuerpo entero al final
  // (y, si hay, la de la toma del hero)
  vistas: readonly ReactNode[]
  // Detrás del cuerpo (la cinta de fibras): en la toma del hero, donde se
  // funde con el texto de la entrada, y en el cierre, detrás del cuerpo
  // entero con otra diagonal (fibras-escena.tsx)
  fondo?: ReactNode
  entrada: ReactNode
  cierre: ReactNode
  // Las tarjetas, cada una con data-tarjeta="<índice>"
  children: ReactNode
}) {
  const contenedor = useRef<HTMLDivElement>(null)
  const escena = useRef<HTMLDivElement>(null)
  const capaEntrada = useRef<HTMLDivElement>(null)
  const capaFondo = useRef<HTMLDivElement>(null)
  const capaFundido = useRef<HTMLDivElement>(null)
  const capaCierre = useRef<HTMLDivElement>(null)
  const capaAviso = useRef<HTMLDivElement>(null)
  const indice = useRef<HTMLElement>(null)
  const riel = useRef<HTMLOListElement>(null)
  // Hover del índice: los enlaces cerca del cursor se corren (LineSidebar)
  useProximidad(riel, '.indice-enlace')
  // Parada marcada en el índice (-1: ninguna) y vista del lugar reservado
  const [actual, setActual] = useState(-1)
  const vistaInicio = vistas.length > paradas.length + 1 ? paradas.length + 1 : paradas.length
  const [vista, setVista] = useState(vistaInicio)
  const [enVista, setEnVista] = useState(false)
  const [listo, setListo] = useState(false)
  // Las miniaturas 3D (components/recorrido-3d/miniaturas.tsx) se ven por un
  // hueco en la tarjeta. Se abre cuando el canvas terminó de aparecer (su
  // fundido dura 700 ms): antes, por el hueco se vería la escena vacía.
  // Y no antes de que termine la entrada de la home: con las miniaturas a la
  // vista la escena deja de recortarse a la caja del busto (recorteHero) y
  // dibuja las seis vistas en cada cuadro, y eso no tiene que pisar la
  // entrada (el cuerpo ya está cargado detrás de la pantalla de carga).
  const [minis, setMinis] = useState(false)
  const fase = useIntroPhase()
  useEffect(() => {
    if (!listo || fase !== 'done') return
    const id = window.setTimeout(() => {
      setMinis(true)
      estadoRecorrido.minis = true
      estadoRecorrido.invalidar?.()
    }, 760)
    return () => {
      window.clearTimeout(id)
      estadoRecorrido.minis = false
    }
  }, [listo, fase])
  // Se dibuja solo mientras el recorrido está en pantalla
  useEffect(() => {
    const nodo = contenedor.current
    if (!nodo) return
    const visible = new IntersectionObserver(([e]) => setEnVista(Boolean(e?.isIntersecting)))
    visible.observe(nodo)
    return () => {
      visible.disconnect()
      // Cache Components conserva la ruta oculta: el canvas deja de dibujar
      setEnVista(false)
    }
  }, [])

  // Celular: dónde termina el texto del hero decide cuánto baja la cabeza en
  // las pantallas bajas (anclaHeroCelular). Se mide al cambiar el alto de la
  // escena o del texto (también cuando cargan las fuentes); --ancla-hero lo
  // pasa al aviso de deslizar y a la captura del busto.
  useEffect(() => {
    const fijo = escena.current
    const pie = capaEntrada.current?.querySelector<HTMLElement>('[data-pie-hero]')
    if (!fijo || !pie) return
    const medir = () => {
      const alto = fijo.clientHeight
      const ancla = anclaHeroCelular(pie.offsetTop + pie.offsetHeight, alto)
      if (ancla === estadoRecorrido.anclaHero) return
      estadoRecorrido.anclaHero = ancla
      fijo.style.setProperty('--ancla-hero', `${(ancla * alto).toFixed(1)}px`)
      estadoRecorrido.invalidar?.()
    }
    const observador = new ResizeObserver(medir)
    observador.observe(fijo)
    observador.observe(pie)
    return () => {
      observador.disconnect()
      estadoRecorrido.anclaHero = null
    }
  }, [])

  useEffect(() => {
    const nodo = contenedor.current
    const fijo = escena.current
    if (!nodo || !fijo) return
    estadoRecorrido.escena = fijo
    const tarjetas = [...nodo.querySelectorAll<HTMLElement>('[data-tarjeta]')]
    const movimiento = window.matchMedia('(prefers-reduced-motion: reduce)')

    // Entrada del cierre (las mismas magnitudes que la tarjeta del contacto)
    const piezas = [
      ...(capaCierre.current?.querySelectorAll<HTMLElement>('[data-entra]') ?? []),
      ...(capaAviso.current?.querySelectorAll<HTMLElement>('[data-entra]') ?? []),
    ]
    let lineaCierre: gsap.core.Timeline | null = null
    const entrarCierre = () => {
      if (fijo.dataset.cierre !== 'espera') return
      if (movimiento.matches) {
        fijo.dataset.cierre = 'lista'
        return
      }
      // En orden: el título y la bajada, el botón (con rebote) y el aviso
      const indiceBoton = piezas.findIndex((p) => p.hasAttribute('data-rebote'))
      const boton = indiceBoton >= 0 ? piezas[indiceBoton] : undefined
      const antes = indiceBoton >= 0 ? piezas.slice(0, indiceBoton) : piezas
      const despues = indiceBoton >= 0 ? piezas.slice(indiceBoton + 1) : []
      const desde = { opacity: 0, y: 28, filter: 'blur(6px)' }
      const hasta = { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', stagger: 0.18 }
      lineaCierre = gsap.timeline({
        onComplete: () => {
          gsap.set(piezas, { clearProps: 'filter,transform' })
          fijo.dataset.cierre = 'lista'
        },
      })
      if (antes.length) lineaCierre.fromTo(antes, desde, hasta)
      if (boton) {
        lineaCierre.fromTo(
          boton,
          { opacity: 0, y: 36, scale: 0.85 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(2.2)' },
          antes.length ? `<${(antes.length * 0.18).toFixed(2)}` : 0,
        )
      }
      if (despues.length) lineaCierre.fromTo(despues, desde, hasta, '<0.18')
      fijo.dataset.cierre = 'entrando'
    }
    // El cierre volvió a esconderse: las piezas vuelven a esperar
    const rearmarCierre = () => {
      if (fijo.dataset.cierre === 'espera') return
      lineaCierre?.kill()
      lineaCierre = null
      gsap.set(piezas, { clearProps: 'all' })
      fijo.dataset.cierre = 'espera'
    }

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
      objetivo = recorrido > 0 ? segDe(-r.top / recorrido) : 0
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
      const celular = window.innerWidth < ANCHO_CELULAR
      estadoRecorrido.celular = celular
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
      const entrada = opacidadEntrada(s, reducido, celular)
      mostrar(capaEntrada.current, entrada)
      // Celular: el texto y las fibras suben con el busto (la cámara usa el
      // mismo desliz), como subía el hero de antes con el scroll
      const pantallas = deslizHero(s, celular)
      const desliz = pantallas * (escena.current?.clientHeight ?? window.innerHeight)
      const subir = desliz ? `translate3d(0, ${(-desliz).toFixed(1)}px, 0)` : ''
      if (capaEntrada.current) capaEntrada.current.style.transform = subir
      escena.current?.style.setProperty('--desliz', `${desliz.toFixed(1)}px`)
      // De 0 a 1 en el desliz: con esto se apaga el aviso de deslizar
      escena.current?.style.setProperty('--desliz-t', (pantallas / DESLIZ_HERO).toFixed(3))
      // La cinta de fibras: con el texto del hero en la primera toma y detrás
      // del cuerpo entero en el cierre (fibras-escena.tsx). Es un solo
      // canvas: cambia de toma a mitad del recorrido, mientras no se ve. En
      // el cierre no sube con el desliz del celular y ocupa la pantalla
      // (data-toma, globals.css). Deja de dibujar cuando termina de irse: sin
      // caja, su IntersectionObserver la pausa; vuelve al aparecer.
      const enCierre = fibrasEnCierre(s)
      fijarTomaFibras(enCierre ? 'cierre' : 'hero')
      const fondo = enCierre ? opacidadFondoCierre(s, reducido) : entrada
      if (capaFondo.current) {
        mostrar(capaFondo.current, fondo)
        capaFondo.current.style.transform = enCierre ? '' : subir
        capaFondo.current.dataset.toma = enCierre ? 'cierre' : 'hero'
        capaFondo.current.style.display = fondo < 0.02 ? 'none' : ''
      }
      const cierre = opacidadCierre(s, reducido)
      mostrar(capaCierre.current, cierre)
      mostrar(capaAviso.current, cierre)
      if (cierre > UMBRAL_ENTRADA_CIERRE) entrarCierre()
      else if (cierre < REARME_ENTRADA_CIERRE) rearmarCierre()
      // Al final del cierre, el degradé se funde en el gris de "Cómo
      // trabajamos", que sigue debajo
      mostrar(capaFundido.current, cierre)
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
      // Lugar reservado: la parada más cercana; en el hero, la captura del
      // busto, y en el cierre, el cuerpo entero (la última vista)
      const k = Math.round(s)
      const nuevaVista =
        k >= 1 && k <= tarjetas.length ? k - 1 : k === 0 ? vistaInicio : tarjetas.length
      if (nuevaVista !== ultimaVista) {
        ultimaVista = nuevaVista
        setVista(nuevaVista)
      }
      // El canvas dibuja solo si cambió el progreso (y, en la toma del hero,
      // con la entrada y el vaivén: escena.tsx)
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
      lineaCierre?.kill()
      if (estadoRecorrido.escena === fijo) estadoRecorrido.escena = null
    }
  }, [vistaInicio])

  return (
    <div
      ref={contenedor}
      className="recorrido"
      style={{ '--tramos': TRAMOS + PAUSA_CIERRE + 1 } as CSSProperties}
    >
      {/* Anclas de cada parada, a la altura de scroll donde la cámara llega a
          ella (k pantallas desde el principio del recorrido) */}
      {/* #recorrido (menú y "Recorrer los implantes"): la craneoplastía */}
      <span id="recorrido" aria-hidden className="recorrido-ancla recorrido-ancla-seccion" style={{ '--k': 1 } as CSSProperties} />
      {paradas.map((parada, i) => (
        <span
          key={parada.ancla}
          id={parada.ancla}
          aria-hidden
          className="recorrido-ancla"
          style={{ '--k': i + 1 } as CSSProperties}
        />
      ))}

      <div ref={escena} data-escena-3d data-listo={listo || undefined} data-minis={minis || undefined} data-cierre="espera" className="recorrido-escena">
        {/* Antes del fundido: al final del cierre, el gris de abajo tapa la
            cinta y no el cuerpo, que va encima */}
        {fondo && (
          <div ref={capaFondo} aria-hidden data-toma="hero" className="recorrido-fondo-hero">
            {fondo}
          </div>
        )}

        <div ref={capaFundido} aria-hidden className="recorrido-fundido" />

        {/* Lugar reservado del 3D (sin WebGL o mientras carga) */}
        <div aria-hidden className="recorrido-vistas">
          {vistas.map((v, i) => (
            <div
              key={i}
              data-visible={i === vista || undefined}
              // La captura del busto va sobre el degradé de la escena y las
              // fibras, como en el hero; las paradas, sobre la luz del borrador
              className={`escena-vista absolute inset-0 ${i === vistaInicio && vistaInicio > paradas.length ? '' : 'escenario'}`}
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
          <div className="intro-3d recorrido-intro-3d">
            <Recorrido3D enVista={enVista} alListo={() => setListo(true)} />
          </div>
        </div>

        <div aria-hidden className="recorrido-reticula">
          <div className="reticula-marco" />
          <div className="reticula-barrido" />
        </div>

        <div ref={capaEntrada} className="recorrido-texto recorrido-entrada recorrido-hero">
          {entrada}
        </div>

        <nav ref={indice} aria-label="Implantes del recorrido" className="recorrido-indice">
          <ol ref={riel} className="indice-riel relative flex flex-col gap-[2px]">
            {paradas.map((parada, i) => (
              <li key={parada.ancla}>
                <AnchorLink
                  href={`#${parada.ancla}`}
                  aria-current={i === actual ? 'location' : undefined}
                  className="indice-enlace relative block px-[0.875rem] py-[0.375rem] text-body-sm aria-[current]:font-semibold"
                >
                  <span className="indice-texto">{parada.zona}</span>
                </AnchorLink>
              </li>
            ))}
          </ol>
        </nav>

        <div className="recorrido-riel">{children}</div>

        <div ref={capaCierre} className="recorrido-texto recorrido-cierre">
          {cierre}
        </div>

        {/* Aviso de deslizar del cierre: abajo a la derecha, a la derecha
            del cuerpo (en el celular, abajo a la izquierda, con el riel a
            su izquierda como en el hero), con el riel del hero
            (.aviso-deslizar). Entra último (data-entra) y sigue la opacidad
            del cierre. */}
        <div ref={capaAviso} aria-hidden className="recorrido-aviso-cierre">
          <p data-entra className="aviso-deslizar flex max-w-[6rem] flex-row-reverse items-center gap-md text-balance text-left text-body-sm text-on-surface-variant md:max-w-none min-[820px]:flex-row">
            Deslizá para continuar
          </p>
        </div>
      </div>
    </div>
  )
}
