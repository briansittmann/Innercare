'use client'

import Link from 'next/link'
import type { ComponentProps, CSSProperties, PointerEvent } from 'react'
import { scrollToAnchor } from './anchor-link'

// Botón de vidrio (.boton-vidrio en globals.css), como "Ver la demo" de Mango:
// con el puntero encima sube 2 px, un brillo y un borde del primario siguen al
// puntero y las letras ruedan hacia arriba. Es la única pieza de vidrio fuera
// de la navegación, pedida por el usuario (docs/DECISIONES.md).

// El brillo y el borde siguen al puntero (--x, --y)
function followPointer(event: PointerEvent<HTMLElement>) {
  const { left, top } = event.currentTarget.getBoundingClientRect()
  event.currentTarget.style.setProperty('--x', `${event.clientX - left}px`)
  event.currentTarget.style.setProperty('--y', `${event.clientY - top}px`)
}

type BotonVidrioProps = Omit<ComponentProps<typeof Link>, 'children'> & { children: string }

export function BotonVidrio({ children, className = '', onClick, ...props }: BotonVidrioProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        onClick?.(event)
        if (typeof props.href === 'string') scrollToAnchor(event, props.href)
      }}
      onPointerMove={followPointer}
      className={`boton-vidrio ${className}`}
    >
      <span className="sr-only">{children}</span>
      {/* Cada letra lleva su copia debajo (text-shadow) y sube con un
          escalonado de --i */}
      <span aria-hidden className="texto-rueda">
        {[...children].map((char, index) => (
          <span key={index} style={{ '--i': index } as CSSProperties}>
            {char === ' ' ? ' ' : char}
          </span>
        ))}
      </span>
    </Link>
  )
}
