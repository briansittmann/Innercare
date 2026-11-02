'use client'

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from 'react'
import { PiezaCarga } from '@/components/animaciones/carga'
import { ajustar, clamp } from '@/components/animaciones/lienzo'
import { completar, estaCompleta, fallar, getProgreso, huboFallo } from '@/components/carga'
import { skipIntro, startIntro } from '@/components/intro'
import { LatticeLoader } from '@/components/lattice-loader'
import { ANCHO_CELULAR } from '@/components/recorrido-3d/camara'

// Pantalla de carga de la home. Tapa la página hasta que el 3D entero (el
// cuerpo, los seis implantes, las miniaturas y su primer cuadro: las tareas
// de components/carga.ts) está listo, así ninguna parada ni el hero se ven
// sin su modelo, y al irse arranca la entrada de la home (components/
// intro.ts): startIntro() si el hero está a la vista, skipIntro() si la
// página se recargó con el scroll más abajo.
//
// Qué se ve, sobre el degradé del hero (la salida es continua): la
// endoprótesis de fémur imprimiéndose en partículas con el progreso
// (components/animaciones/carga.ts), debajo una palabra del proceso de la
// empresa que cambia con el avance, y abajo el cargador de React Bits
// (LatticeLoader) con "Cargando" a la izquierda y el porcentaje, grande, a la
// derecha. El número persigue al progreso real con suavizado, nunca
// retrocede, no pasa de 99 hasta que todo terminó y la pantalla dura al menos
// DURACION_MINIMA, para que el armado se lea aunque la caché esté caliente.
// Tope: a los TOPE ms se va igual (quedan las vistas de respaldo).
//
// Aparece siempre que falte 3D: al cargar la página por la home y al llegar
// desde una ficha si los modelos aún no están (una vez por sesión: después
// quedan en la caché de useLoader). El HTML del servidor la trae con
// "Cargando", 0 % y la primera palabra, así se ve antes de hidratar; sin JS
// no existe (CSS, scripting: enabled) y si el JS no llega se oculta sola a
// los 8 s (.pantalla-carga:not([data-js])). Estados en data-carga: cargando,
// saliendo (las partículas se despegan y el conjunto se funde), lista
// (desmontada). Mientras se ve, bloquea el scroll (html[data-cargando]).
// Con movimiento reducido, la pieza quieta armada hasta el progreso y una
// salida corta.

// Las etapas del proceso real (content/customCases.ts, company.ts), en orden
const PALABRAS = [
  'Estudio del paciente',
  'Segmentación 3D',
  'Planificación quirúrgica',
  'Diseño del implante',
  'Titanio biocompatible',
  'Mecanizado CNC',
  'Impresión 3D',
  'Trazabilidad',
] as const

const PIEZA = '/img/fabricacion/femur.webp'
const DURACION_MINIMA = 1600
const DURACION_MINIMA_REDUCIDA = 500
const TOPE = 20_000
// Cuánto dura la salida (las partículas y el fundido del CSS)
const DURACION_SALIDA = 800
const DURACION_SALIDA_REDUCIDA = 300
// Mínimo de cada palabra en pantalla
const MINIMO_PALABRA = 450
// Mientras baja el chunk de la escena no hay bytes que contar: el número
// sube igual hasta ARRANQUE en ARRANQUE_MS, así no queda clavado en 0
const ARRANQUE = 12
const ARRANQUE_MS = 1200
// Más abajo de esto, la página se cargó lejos del hero: sin entrada
const SCROLL_SIN_INTRO = 0.5

type Estado = 'cargando' | 'saliendo' | 'lista'

const sinSuscripcion = () => () => {}

export function PantallaCarga() {
  const [estado, setEstado] = useState<Estado>(() => (estaCompleta() ? 'lista' : 'cargando'))
  const [palabra, setPalabra] = useState<{ actual: number; previa: number | null }>({ actual: 0, previa: null })
  const [listoLattice, setListoLattice] = useState(false)
  // Hidratada: el respaldo del CSS (ocultarse a los 8 s) deja de correr
  const js = useSyncExternalStore(sinSuscripcion, () => true, () => false)
  const lienzo = useRef<HTMLCanvasElement>(null)
  const numero = useRef<HTMLSpanElement>(null)

  // Mientras se ve, la página no se mueve. Limpieza en useLayoutEffect:
  // Cache Components oculta la home con <Activity> sin desmontarla.
  useLayoutEffect(() => {
    if (estado === 'lista') return
    document.documentElement.setAttribute('data-cargando', '')
    return () => document.documentElement.removeAttribute('data-cargando')
  }, [estado])

  useEffect(() => {
    if (estado !== 'cargando') return
    const reducido = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const celular = window.innerWidth < ANCHO_CELULAR
    const cv = lienzo.current
    const g = cv?.getContext('2d')
    const inicio = performance.now()
    let pieza: PiezaCarga | null = null
    let medida = cv ? ajustar(cv) : null
    let mostrado = 0
    let indicePalabra = 0
    let desdePalabra = inicio
    let salidaDesde = 0
    let cuadro = 0
    let ultimo = 0
    let cancelado = false

    document.fonts.ready.then(() => completar('fuentes'))
    const tope = window.setTimeout(fallar, TOPE)

    const imagen = new Image()
    imagen.decoding = 'async'
    imagen.src = PIEZA
    imagen
      .decode()
      .then(() => {
        if (!cancelado) pieza = new PiezaCarga(imagen, celular)
      })
      .catch(() => {})

    const medir = () => {
      if (cv) medida = ajustar(cv)
    }
    window.addEventListener('resize', medir)

    const salir = () => {
      salidaDesde = performance.now()
      setEstado('saliendo')
      // La entrada de la home arranca con el fundido: el cuerpo entra
      // girando mientras la pantalla se va
      if (window.scrollY > window.innerHeight * SCROLL_SIN_INTRO) skipIntro()
      else startIntro()
      window.setTimeout(() => setEstado('lista'), reducido ? DURACION_SALIDA_REDUCIDA : DURACION_SALIDA)
    }

    const pintar = (ahora: number) => {
      cuadro = 0
      const dt = Math.min(0.1, (ahora - (ultimo || ahora)) / 1000)
      ultimo = ahora
      const t = (ahora - inicio) / 1000
      // Si algo falló (sin WebGL, error de la escena, tope) no hay qué
      // esperar: se va enseguida
      const minima = reducido || huboFallo() ? DURACION_MINIMA_REDUCIDA : DURACION_MINIMA
      const completa = estaCompleta()

      if (!salidaDesde) {
        // Objetivo: el progreso real, acotado por el tiempo mínimo (en una
        // carga rápida el número sube igual a lo largo del mínimo) y por 99
        // hasta que todo terminó
        const porTiempo = clamp((ahora - inicio) / minima)
        const arranque = ARRANQUE * (1 - Math.pow(1 - clamp((ahora - inicio) / ARRANQUE_MS), 2))
        const objetivo = completa ? 100 : Math.min(99, Math.max(getProgreso() * 100, arranque), porTiempo * 100)
        const k = completa ? 7 : 3.5
        mostrado = Math.max(mostrado, mostrado + (objetivo - mostrado) * (1 - Math.exp(-dt * k)))
        if (completa && objetivo - mostrado < 0.6) mostrado = 100
        if (reducido && completa) mostrado = 100
        if (numero.current) numero.current.textContent = String(Math.floor(mostrado))
        if (mostrado >= 100) setListoLattice(true)

        // La palabra: la franja del progreso que cruzó, con un mínimo de
        // tiempo cada una
        const franja = Math.min(PALABRAS.length - 1, Math.floor((mostrado / 100) * PALABRAS.length))
        if (franja > indicePalabra && ahora - desdePalabra >= MINIMO_PALABRA) {
          indicePalabra += 1
          desdePalabra = ahora
          setPalabra({ actual: indicePalabra, previa: indicePalabra - 1 })
        }

        if (completa && mostrado >= 100 && ahora - inicio >= minima && (huboFallo() || ahora - desdePalabra >= MINIMO_PALABRA * 0.6)) {
          salir()
        }
      }

      if (g && medida && pieza) {
        const salida = salidaDesde ? clamp((ahora - salidaDesde) / (reducido ? DURACION_SALIDA_REDUCIDA : DURACION_SALIDA)) : 0
        pieza.dibujar(g, medida.w, medida.h, medida.dpr, t, mostrado / 100, salida, reducido)
      }
      cuadro = requestAnimationFrame(pintar)
    }
    cuadro = requestAnimationFrame(pintar)

    return () => {
      cancelado = true
      window.clearTimeout(tope)
      window.removeEventListener('resize', medir)
      if (cuadro) cancelAnimationFrame(cuadro)
    }
  }, [estado])

  // La palabra anterior se va; cuando terminó de irse, se saca del DOM
  useEffect(() => {
    if (palabra.previa === null) return
    const id = window.setTimeout(() => setPalabra((p) => ({ ...p, previa: null })), 500)
    return () => window.clearTimeout(id)
  }, [palabra])

  if (estado === 'lista') return null

  return (
    <div className="pantalla-carga" data-carga={estado} data-js={js || undefined} aria-busy={estado === 'cargando'}>
      <div className="pantalla-carga-centro">
        <div className="pantalla-carga-pieza" aria-hidden>
          <canvas ref={lienzo} className="block h-full w-full" />
        </div>
        <p className="pantalla-carga-palabra text-headline-lg text-on-surface" aria-hidden>
          {palabra.previa !== null && (
            <span key={`sale-${palabra.previa}`} data-sale>
              {PALABRAS[palabra.previa]}
            </span>
          )}
          <span key={`entra-${palabra.actual}`} data-entra>
            {PALABRAS[palabra.actual]}
          </span>
        </p>
      </div>
      <div className="pantalla-carga-pie page-container">
        <LatticeLoader
          label="Cargando"
          doneLabel="Listo"
          status={listoLattice ? 'done' : 'working'}
          pattern="sweep"
          className="text-body-sm text-primary"
        />
        <p className="pantalla-carga-numero font-data-mono text-display-lg text-on-surface tabular-nums" aria-hidden>
          <span ref={numero}>0</span>
          <span className="pantalla-carga-porciento">%</span>
        </p>
      </div>
    </div>
  )
}
