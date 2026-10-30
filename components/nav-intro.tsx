'use client'

import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'
import { useIntroPhase } from './intro'

// Hace entrar la barra con la entrada de la home (components/intro.ts):
// data-intro lleva la fase y el CSS (.nav-intro en globals.css) la anima.
// Solo si el sitio se carga por la home. Se decide en el primer render y
// queda fija: el header no se desmonta, así que volver a la home no la repite
// y entrar por otra página muestra la barra ya armada.
export function NavIntro({ className, children }: { className: string; children: ReactNode }) {
  const pathname = usePathname()
  const [intro] = useState(() => pathname === '/')
  const phase = useIntroPhase()

  return (
    <div className={`nav-intro ${className}`} data-intro={intro ? phase : undefined}>
      {children}
    </div>
  )
}
