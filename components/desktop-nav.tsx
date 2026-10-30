'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { CSSProperties } from 'react'
import { scrollToAnchor } from './anchor-link'
import PillNav from './pill-nav'
import { navLinks, sectionIdOf } from './nav-links'
import { useActiveSection } from './use-active-section'

// Texto a 16 px como el resto del cuerpo (PillNav trae 14 px).
const pillVars = { '--pn-font': 'var(--text-body-md)' } as CSSProperties

const sectionIds = navLinks.map((link) => sectionIdOf(link.href))

export function DesktopNav({ className }: { className?: string }) {
  const pathname = usePathname()
  // Son anclas de la home: en la home se marca la sección que está a la
  // vista; en otras páginas, ninguna. PillNav compara el href exacto, y un
  // string vacío deja todo inactivo.
  const active = useActiveSection(sectionIds, pathname === '/')
  const activeHref = navLinks.find((link) => sectionIdOf(link.href) === active)?.href ?? ''

  return (
    <PillNav
      items={[...navLinks]}
      activeHref={activeHref}
      linkComponent={Link}
      onItemClick={(item, _index, event) => {
        if (item.href) scrollToAnchor(event, item.href)
      }}
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
