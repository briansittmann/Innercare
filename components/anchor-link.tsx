'use client'

import Link from 'next/link'
import type { ComponentProps, MouseEvent } from 'react'

// Anclas a secciones de la home (/#id o #id). Link de Next no vuelve a bajar
// si el ancla ya es la de la URL (se tocó "Fabricación", se subió y se tocó
// de nuevo): estando en la misma página, bajamos nosotros. scrollIntoView
// respeta el scroll suave y el hueco del header de globals.css. Desde otra
// página, o con una tecla modificadora, sigue el Link normal.
export function scrollToAnchor(event: MouseEvent<HTMLElement>, href: string) {
  if (event.defaultPrevented || event.button !== 0) return
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const url = new URL(href, window.location.href)
  if (url.pathname !== window.location.pathname || !url.hash) return
  const target = document.getElementById(decodeURIComponent(url.hash.slice(1)))
  if (!target) return
  event.preventDefault()
  target.scrollIntoView()
  if (window.location.hash !== url.hash) window.history.pushState(null, '', url.hash)
}

type AnchorLinkProps = ComponentProps<typeof Link> & { href: string }

export function AnchorLink({ href, onClick, ...props }: AnchorLinkProps) {
  return (
    <Link
      {...props}
      href={href}
      onClick={(event) => {
        onClick?.(event)
        scrollToAnchor(event, href)
      }}
    />
  )
}
