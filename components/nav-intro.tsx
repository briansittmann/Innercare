'use client'

import { usePathname } from 'next/navigation'
import { useState, type CSSProperties, type ReactNode } from 'react'
import { useIntroPhase } from './intro'
import { INTRO_AT } from './intro-timeline'

// Hace entrar la barra con la entrada de la home (components/intro.ts):
// data-intro lleva la fase y el CSS (.nav-intro en globals.css) la anima.
// Solo si el sitio se carga por la home. Se decide en el primer render y
// queda fija: el header no se desmonta, así que volver a la home no la repite
// y entrar por otra página muestra la barra ya armada. El momento en que la
// barra se estira (--intro-nav) sale de la línea de tiempo (INTRO_AT.nav).
export function NavIntro({ className, children }: { className: string; children: ReactNode }) {
  const pathname = usePathname()
  const [intro] = useState(() => pathname === '/')
  const phase = useIntroPhase()

  return (
    <div
      className={`nav-intro ${className}`}
      data-intro={intro ? phase : undefined}
      style={{ '--intro-nav': `${INTRO_AT.nav}ms` } as CSSProperties}
    >
      {children}
    </div>
  )
}
