'use client'

import { usePathname } from 'next/navigation'
import { useState, type ReactNode } from 'react'

// Activa la entrada de la barra (.nav-intro[data-intro] en globals.css) solo
// si el sitio se carga por la home. Se decide en el primer render y queda
// fija: el header no se desmonta, así que volver a la home no la repite y
// entrar por otra página muestra la barra ya armada.
export function NavIntro({ className, children }: { className: string; children: ReactNode }) {
  const pathname = usePathname()
  const [intro] = useState(() => pathname === '/')

  return (
    <div className={`nav-intro ${className}`} data-intro={intro ? '' : undefined}>
      {children}
    </div>
  )
}
