'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'
import PillNav from './pill-nav'
import { isNavActive, navLinks } from './nav-links'

// Texto a 16 px como el resto del cuerpo (PillNav trae 14 px).
const pillVars = { '--pn-font': 'var(--text-body-md)' } as CSSProperties

export function DesktopNav({ className }: { className?: string }) {
  const pathname = usePathname()
  // PillNav compara el href exacto: le pasamos el del enlace que contiene la
  // ruta actual. Un string vacío deja todo inactivo (en la home, por ejemplo).
  const activeHref = navLinks.find((link) => isNavActive(pathname, link.href))?.href ?? ''

  return (
    <PillNav
      items={[...navLinks]}
      activeHref={activeHref}
      linkComponent={Link}
      ariaLabel="Principal"
      theme="light"
      layout="joined"
      surface="none"
      itemStyle="plain"
      hoverEffect="fill"
      indicator="dot"
      collapse="never"
      intro={false}
      textColor="var(--color-on-surface)"
      highlightColor="var(--color-primary)"
      highlightTextColor="var(--color-on-primary)"
      style={pillVars}
      className={className}
    />
  )
}
