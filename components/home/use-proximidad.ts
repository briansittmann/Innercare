import { useEffect, type RefObject } from 'react'

// Efecto de proximidad del índice anatómico, tomado de LineSidebar de React
// Bits (reactbits.dev/components/line-sidebar): cada enlace recibe
// --efecto (0 a 1) según qué tan cerca pasa el cursor de su centro, con
// caída suave, así el más cercano se corre más y los vecinos lo siguen
// escalonados. El CSS (.indice-enlace en globals.css) traduce --efecto en
// desplazamiento y color. Un solo rAF amortigua todos los valores juntos y
// se detiene cuando se asentaron.
//
// Solo con mouse (el índice existe desde 1100 px y no tiene hover táctil).
// Con prefers-reduced-motion, el valor llega sin amortiguar y el CSS deja
// solo el color.

// Radio de influencia (px desde el centro del enlace) y amortiguación (ms)
const RADIO = 80
const SUAVIZADO = 100

const suave = (p: number) => p * p * (3 - 2 * p)

export function useProximidad(lista: RefObject<HTMLElement | null>, selector: string) {
  useEffect(() => {
    const nodo = lista.current
    if (!nodo) return
    const movimiento = window.matchMedia('(prefers-reduced-motion: reduce)')
    const items = [...nodo.querySelectorAll<HTMLElement>(selector)]
    const objetivo = items.map(() => 0)
    const actual = items.map(() => 0)
    let cuadro = 0
    let antes = 0

    const paso = (ahora: number) => {
      const dt = Math.min((ahora - antes) / 1000, 0.05)
      antes = ahora
      const k = movimiento.matches ? 1 : 1 - Math.exp(-dt / (SUAVIZADO / 1000))
      let moviendo = false
      items.forEach((el, i) => {
        const meta = objetivo[i] ?? 0
        const previo = actual[i] ?? 0
        const siguiente = previo + (meta - previo) * k
        const quieto = Math.abs(meta - siguiente) < 0.0015
        const valor = quieto ? meta : siguiente
        actual[i] = valor
        el.style.setProperty('--efecto', valor.toFixed(4))
        if (!quieto) moviendo = true
      })
      cuadro = moviendo ? requestAnimationFrame(paso) : 0
    }

    const arrancar = () => {
      if (cuadro) return
      antes = performance.now()
      cuadro = requestAnimationFrame(paso)
    }

    const mover = (e: PointerEvent) => {
      if (e.pointerType !== 'mouse') return
      const y = e.clientY
      items.forEach((el, i) => {
        const r = el.getBoundingClientRect()
        const distancia = Math.abs(y - (r.top + r.height / 2))
        objetivo[i] = suave(Math.max(0, 1 - distancia / RADIO))
      })
      arrancar()
    }

    const salir = () => {
      objetivo.fill(0)
      arrancar()
    }

    nodo.addEventListener('pointermove', mover)
    nodo.addEventListener('pointerleave', salir)
    return () => {
      nodo.removeEventListener('pointermove', mover)
      nodo.removeEventListener('pointerleave', salir)
      cancelAnimationFrame(cuadro)
    }
  }, [lista, selector])
}
