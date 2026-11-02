'use client'

import { gsap } from 'gsap'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ajustar, clamp, lerp, smooth } from '@/components/animaciones/lienzo'
import { PiezaManos, type Puntero, type Tarjeta } from '@/components/animaciones/manos'
import ShapeGrid from '@/components/shape-grid'

// Escenario fijo del cierre de contacto (components/home/contacto.tsx), con
// la estructura y los tiempos de la sección "touch" del borrador de la
// landing: la sección mide 2,8 pantallas y, mientras se recorre, las manos de
// partículas (components/animaciones/manos.ts) se acercan, se tocan y se
// dispersan, y la tarjeta aparece al final. El texto de intro y la tarjeta
// llegan del servidor (`intro`, `tarjeta`): la animación solo los revela.
//
// Una sola fuente: el progreso q del scroll de la sección. El lienzo se
// dibuja a cada cuadro mientras hay algo que se mueve por tiempo (las
// partículas sueltas flotan hasta armarse, la esfera gira) y, después, solo
// cuando cambia q; fuera de pantalla, nada. La tarjeta recibe opacidad, transform y
// pointer-events por q; la intro arranca en el centro del escenario y con el
// scroll se desplaza hacia arriba hasta salir (y se apaga al final), mientras
// las manos se arman alrededor.
//
// Dos entradas por tiempo, una vez cada una (gsap, como AnimatedContent):
// - La intro, cuando el escenario asoma al 60 %: la línea chica aparece en
//   el centro del bloque, sube a su lugar y el titular entra palabra por
//   palabra (data-intro: espera, entrando, lista). Si se llega con q más
//   allá de 0,34, nada: la intro ya se fue.
// - Las piezas de la tarjeta (data-entra), de a una, cuando la tarjeta ya
//   pasó la mitad de su opacidad (antes entraban escondidas detrás del
//   fundido de la tarjeta y no se percibían); el botón (data-rebote) llega
//   último, con un rebote chico (back.out, el equivalente de
//   --spring-bouncy del menú del celular). Si la tarjeta vuelve a
//   esconderse (scroll hacia arriba), la entrada se rearma y vuelve a correr
//   la próxima vez (data-tarjeta: espera, entrando, lista).
// El CSS oculta lo que espera, solo con JS y sin movimiento reducido.
//
// Estados en data-manos: `espera` (HTML del servidor; el CSS oculta la
// tarjeta y la intro), `animando` y `quieta` (movimiento reducido, foco de
// teclado en la tarjeta o secuencia terminada: la tarjeta directa y entera,
// sin intro ni lienzo). Con movimiento reducido ni se pide la imagen. Si la
// imagen no carga, `data-sin-manos`: la tarjeta sola.
//
// Hover (solo mouse o trackpad, sin movimiento reducido): como en "Cómo
// trabajamos", el puntero con su velocidad se pasa al lienzo en cada cuadro
// y las partículas de las manos armadas se apartan y vuelven (manos.ts).
//
// Detrás, la malla hexagonal de las fichas y de Distribución (ShapeGrid,
// canvas 2D) en variante oscura. En el celular se pausa mientras el lienzo
// de las manos dibuja a cada cuadro (hasta que la esfera se apaga).
const CELULAR = 820
// Con el escenario asomado hasta acá arranca la entrada de la intro
const UMBRAL_INTRO = 0.6
// La tarjeta ya se ve lo suficiente para que entren sus piezas, y por
// debajo de esto volvió a esconderse: la entrada se rearma
const UMBRAL_TARJETA = 0.5
const REARME_TARJETA = 0.15
// Entrada de las piezas de la tarjeta
const PIEZA_DISTANCIA = 28
const PIEZA_DURACION = 0.7
const PIEZA_ESCALON = 0.18
// Más allá de acá la intro ya se fue: no hay entrada que mostrar
const FIN_INTRO = 0.34
// Alto de la barra fija (scroll-padding-top en globals.css): la intro no
// sube más allá de su borde de abajo
const ALTO_BARRA = 72

type Estado = 'espera' | 'animando' | 'quieta'

export function ContactoManos({ intro, tarjeta }: { intro: ReactNode; tarjeta: ReactNode }) {
  const raiz = useRef<HTMLDivElement>(null)
  const escenario = useRef<HTMLDivElement>(null)
  const lienzo = useRef<HTMLCanvasElement>(null)
  const introRef = useRef<HTMLDivElement>(null)
  const tarjetaRef = useRef<HTMLDivElement>(null)
  const [estado, setEstado] = useState<Estado>('espera')
  const [mallaPausada, setMallaPausada] = useState(false)

  useEffect(() => {
    const root = raiz.current
    const stage = escenario.current
    const cv = lienzo.current
    const g = cv?.getContext('2d')
    const introEl = introRef.current
    const tarjetaEl = tarjetaRef.current
    if (!root || !stage || !cv || !g || !introEl || !tarjetaEl) return
    const movimiento = window.matchMedia('(prefers-reduced-motion: reduce)')
    const fino = window.matchMedia('(pointer: fine)')
    const esCelular = () => window.innerWidth < CELULAR
    // Puntero en coordenadas de la ventana, con su velocidad suavizada; se
    // pasa al lienzo en cada cuadro (al scrollear bajo el mouse quieto no
    // llega ningún pointermove)
    let puntero: (Puntero & { t: number }) | null = null
    let anterior = 0
    let pieza: PiezaManos | null = null
    let cargando = false
    let cancelado = false
    let medida = ajustar(cv)
    let visible = false
    let cuadro = 0
    let q = 0
    let foco = false
    let ultimoEstado: Estado = 'espera'
    let ultimaPausa = false

    const fijar = (nuevo: Estado) => {
      if (nuevo === ultimoEstado) return
      ultimoEstado = nuevo
      setEstado(nuevo)
    }
    const pausarMalla = (pausa: boolean) => {
      if (pausa === ultimaPausa) return
      ultimaPausa = pausa
      setMallaPausada(pausa)
    }

    // Entradas por tiempo. Cada una corre una vez; `terminar` las deja en
    // su estado final (movimiento reducido o foco de teclado).
    const kicker = introEl.querySelector<HTMLElement>('[data-kicker]')
    const palabras = Array.from(introEl.querySelectorAll<HTMLElement>('[data-palabra]'))
    const piezas = Array.from(tarjetaEl.querySelectorAll<HTMLElement>('[data-entra]'))
    let lineaIntro: gsap.core.Timeline | null = null
    let lineaTarjeta: gsap.core.Timeline | null = null
    const introLista = () => {
      lineaIntro?.kill()
      lineaIntro = null
      gsap.set([kicker, ...palabras].filter(Boolean), { clearProps: 'all' })
      root.setAttribute('data-intro', 'lista')
    }
    const tarjetaLista = () => {
      lineaTarjeta?.kill()
      lineaTarjeta = null
      gsap.set(piezas, { clearProps: 'all' })
      root.setAttribute('data-tarjeta', 'lista')
    }
    const entrarIntro = () => {
      if (root.dataset.intro !== 'espera') return
      if (movimiento.matches || q >= FIN_INTRO || !kicker) {
        introLista()
        return
      }
      const parrafo = kicker.parentElement
      // La línea chica arranca centrada en el bloque y sube a su lugar
      const centro = parrafo ? (parrafo.offsetHeight - kicker.offsetHeight) / 2 : 0
      lineaIntro = gsap.timeline({
        onComplete: () => {
          gsap.set([kicker, ...palabras], { clearProps: 'filter,transform' })
          root.setAttribute('data-intro', 'lista')
        },
      })
      lineaIntro
        .fromTo(
          kicker,
          { opacity: 0, y: centro + 20, filter: 'blur(6px)' },
          { opacity: 1, y: centro, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out' },
        )
        .to(kicker, { y: 0, duration: 0.8, ease: 'power3.inOut' }, '+=0.4')
        .fromTo(
          palabras,
          { opacity: 0, y: 18, filter: 'blur(6px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.7, ease: 'power3.out', stagger: 0.09 },
          '<0.25',
        )
      // Después del fromTo, que ya escribió el estado inicial en línea
      root.setAttribute('data-intro', 'entrando')
    }
    const entrarTarjeta = () => {
      if (root.dataset.tarjeta !== 'espera') return
      if (movimiento.matches || piezas.length === 0) {
        tarjetaLista()
        return
      }
      const boton = piezas.find((p) => p.hasAttribute('data-rebote'))
      const otras = piezas.filter((p) => p !== boton)
      lineaTarjeta = gsap.timeline({
        onComplete: () => {
          gsap.set(piezas, { clearProps: 'filter,transform' })
          root.setAttribute('data-tarjeta', 'lista')
        },
      })
      lineaTarjeta.fromTo(
        otras,
        { opacity: 0, y: PIEZA_DISTANCIA, filter: 'blur(6px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: PIEZA_DURACION,
          ease: 'power3.out',
          stagger: PIEZA_ESCALON,
        },
      )
      // El botón, en su turno del escalonado, con rebote
      if (boton) {
        lineaTarjeta.fromTo(
          boton,
          { opacity: 0, y: 36, scale: 0.85 },
          { opacity: 1, y: 0, scale: 1, duration: 0.9, ease: 'back.out(2.2)' },
          `<${(otras.length * PIEZA_ESCALON).toFixed(2)}`,
        )
      }
      root.setAttribute('data-tarjeta', 'entrando')
    }
    // La tarjeta volvió a esconderse: las piezas vuelven a esperar
    const rearmarTarjeta = () => {
      if (root.dataset.tarjeta === 'espera') return
      lineaTarjeta?.kill()
      lineaTarjeta = null
      gsap.set(piezas, { clearProps: 'all' })
      root.setAttribute('data-tarjeta', 'espera')
    }

    const leer = () => {
      const r = root.getBoundingClientRect()
      const recorrido = r.height - window.innerHeight
      q = recorrido > 0 ? clamp(-r.top / recorrido) : 0
    }

    const pintar = (ahora: number) => {
      cuadro = 0
      const reducido = movimiento.matches
      const dt = anterior ? Math.min(1 / 30, (ahora - anterior) / 1000) : 0
      anterior = ahora
      // Con el puntero quieto, su velocidad se apaga
      if (puntero) {
        const f = Math.exp(-dt * 10)
        puntero.vx *= f
        puntero.vy *= f
      }
      // Tarjeta: aparece entre 0,74 y 0,84 (directa con movimiento reducido
      // o con foco de teclado)
      const o = reducido || foco ? 1 : smooth(clamp((q - 0.74) / 0.1))
      tarjetaEl.style.opacity = o.toFixed(3)
      tarjetaEl.style.transform = `translateY(${((1 - o) * 14).toFixed(1)}px) scale(${(0.94 + 0.06 * o).toFixed(3)})`
      tarjetaEl.style.pointerEvents = o > 0.5 ? 'auto' : 'none'
      // Intro: del centro hacia arriba con el scroll, hasta quedar justo
      // debajo de la barra en 0,34 (nunca detrás de ella); se apaga entre
      // 0,2 y 0,34
      const io = reducido ? 0 : 1 - smooth(clamp((q - 0.2) / 0.14))
      const subida =
        smooth(clamp(q / FIN_INTRO)) * Math.max(0, medida.h / 2 - (ALTO_BARRA + introEl.offsetHeight / 2 + 16))
      introEl.style.opacity = io.toFixed(3)
      introEl.style.transform = `translateY(${(-subida).toFixed(1)}px)`
      if (reducido || foco) {
        fijar('quieta')
        pausarMalla(false)
        introLista()
        tarjetaLista()
        return
      }
      if (q >= FIN_INTRO && root.dataset.intro === 'espera') introLista()
      if (o > UMBRAL_TARJETA) entrarTarjeta()
      else if (o < REARME_TARJETA) rearmarTarjeta()
      fijar(q >= 0.88 ? 'quieta' : 'animando')
      const celular = esCelular()
      pausarMalla(celular && PiezaManos.animaPorTiempo(q))
      if (!pieza) {
        cargar()
        return
      }
      // El rect de la tarjeta solo hace falta mientras la esfera viaja a su borde
      let rect: Tarjeta | null = null
      if (q > 0.6 && q < 0.9) {
        const cb = tarjetaEl.getBoundingClientRect()
        const kb = cv.getBoundingClientRect()
        rect = { x: cb.left - kb.left, y: cb.top - kb.top, w: cb.width, h: cb.height }
      }
      let enLienzo: Puntero | null = null
      if (puntero) {
        const r = cv.getBoundingClientRect()
        const x = puntero.x - r.left
        const y = puntero.y - r.top
        if (x >= 0 && y >= 0 && x <= r.width && y <= r.height)
          enLienzo = { x, y, vx: puntero.vx, vy: puntero.vy }
      }
      pieza.dibujar(g, medida.w, medida.h, medida.dpr, q, ahora / 1000, celular, rect, dt, enLienzo)
      if (visible && (PiezaManos.animaPorTiempo(q) || pieza.desarmada)) cuadro = requestAnimationFrame(pintar)
    }
    const pedir = () => {
      if (!cuadro) cuadro = requestAnimationFrame(pintar)
    }
    const alMover = () => {
      leer()
      if (visible) pedir()
    }

    // La imagen, con prioridad baja, una sola vez; sin movimiento reducido
    const cargar = () => {
      if (cargando || movimiento.matches) return
      cargando = true
      const imagen = new Image()
      imagen.decoding = 'async'
      imagen.fetchPriority = 'low'
      imagen.src = '/img/manos.webp'
      imagen
        .decode()
        .then(() => {
          if (cancelado) return
          pieza = new PiezaManos(imagen, esCelular())
          pedir()
        })
        .catch(() => {
          if (!cancelado) root.setAttribute('data-sin-manos', '')
        })
    }

    const alPuntero = (e: PointerEvent) => {
      if (!visible || !fino.matches || movimiento.matches) return
      const x = e.clientX
      const y = e.clientY
      if (puntero) {
        const dtp = Math.max(8, e.timeStamp - puntero.t) / 1000
        puntero.vx = lerp(puntero.vx, (x - puntero.x) / dtp, 0.5)
        puntero.vy = lerp(puntero.vy, (y - puntero.y) / dtp, 0.5)
        Object.assign(puntero, { x, y, t: e.timeStamp })
      } else puntero = { x, y, vx: 0, vy: 0, t: e.timeStamp }
    }
    // El mouse salió de la ventana
    const alSalir = (e: PointerEvent) => {
      if (!e.relatedTarget) puntero = null
    }

    const alFoco = (conFoco: boolean) => () => {
      foco = conFoco
      pedir()
    }
    const alEnfocar = alFoco(true)
    const alDesenfocar = alFoco(false)

    const observador = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting)
      if (visible) alMover()
    })
    observador.observe(root)
    // La intro entra cuando el escenario asoma al 60 %
    const disparoIntro = new IntersectionObserver(
      ([e]) => {
        if (!e || e.intersectionRatio < UMBRAL_INTRO) return
        leer()
        entrarIntro()
        disparoIntro.disconnect()
      },
      { threshold: UMBRAL_INTRO },
    )
    disparoIntro.observe(stage)
    const tamano = new ResizeObserver(() => {
      medida = ajustar(cv)
      alMover()
    })
    tamano.observe(cv)

    root.setAttribute('data-intro', 'espera')
    root.setAttribute('data-tarjeta', 'espera')
    leer()
    pedir()
    window.addEventListener('scroll', alMover, { passive: true })
    movimiento.addEventListener('change', alMover)
    tarjetaEl.addEventListener('focusin', alEnfocar)
    tarjetaEl.addEventListener('focusout', alDesenfocar)
    window.addEventListener('pointermove', alPuntero, { passive: true })
    document.addEventListener('pointerout', alSalir)
    return () => {
      window.removeEventListener('pointermove', alPuntero)
      document.removeEventListener('pointerout', alSalir)
      cancelado = true
      observador.disconnect()
      disparoIntro.disconnect()
      tamano.disconnect()
      window.removeEventListener('scroll', alMover)
      movimiento.removeEventListener('change', alMover)
      tarjetaEl.removeEventListener('focusin', alEnfocar)
      tarjetaEl.removeEventListener('focusout', alDesenfocar)
      cancelAnimationFrame(cuadro)
      lineaIntro?.kill()
      lineaTarjeta?.kill()
    }
  }, [])

  return (
    <div ref={raiz} data-manos={estado} data-intro="espera" data-tarjeta="espera" className="relative h-full">
      <div
        ref={escenario}
        className="contacto-escenario sticky top-0 isolate h-dvh overflow-hidden text-on-primary"
      >
        <div aria-hidden className="absolute inset-0 -z-10">
          <ShapeGrid
            shape="hexagon"
            cellSize={64}
            lineWidth={1}
            direction="up"
            speed={0.08}
            lineColor="color-mix(in srgb, var(--color-on-primary) 7%, transparent)"
            hoverColor="color-mix(in srgb, var(--color-on-primary) 55%, transparent)"
            hoverFillColor="var(--color-on-primary-container)"
            fillOpacity={0.05}
            radius={1.8}
            trail={0.9}
            glow={0.25}
            fade={0.6}
            intro={false}
            paused={mallaPausada}
          />
        </div>
        <canvas ref={lienzo} aria-hidden className="contacto-lienzo absolute inset-0 size-full" />
        <div ref={introRef} className="contacto-intro">
          {intro}
        </div>
        <div ref={tarjetaRef} className="contacto-tarjeta">
          {tarjeta}
        </div>
      </div>
    </div>
  )
}
