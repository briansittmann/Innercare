'use client'

import dynamic from 'next/dynamic'
import { useEffect, useRef, useState, useSyncExternalStore } from 'react'

// three.js solo existe en el navegador: la escena se carga aparte y sin SSR,
// para que no pese en el HTML ni en el bundle inicial.
const ImplantScene = dynamic(() => import('./implant-scene'), { ssr: false })

const reducedMotionQuery = '(prefers-reduced-motion: reduce)'

function subscribeReducedMotion(onChange: () => void) {
  const media = window.matchMedia(reducedMotionQuery)
  media.addEventListener('change', onChange)
  return () => media.removeEventListener('change', onChange)
}

function usePrefersReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(reducedMotionQuery).matches,
    () => false,
  )
}

export function Hero3D({ className = '' }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = usePrefersReducedMotion()
  // Fuera de pantalla no se renderiza: ahorra GPU y batería.
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry) setVisible(entry.isIntersecting)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      role="img"
      aria-label="Modelo 3D de una endoprótesis modular de fémur en titanio sobre un fémur translúcido"
      className={className}
    >
      <ImplantScene animate={!reducedMotion} active={visible} />
    </div>
  )
}
