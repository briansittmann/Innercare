import Link from 'next/link'
import type { ComponentProps } from 'react'

// Enlace a /contacto. Dentro del sitio, la ruta interceptada lo abre como panel
// sobre la página actual, pero Next lo trata como una página nueva: como el
// <dialog> es fijo, no encuentra nada visible y sube arriba de todo, así que
// el panel se abría siempre sobre el hero y al cerrarlo se quedaba ahí. Con
// scroll={false} la página de atrás queda donde estaba.
export function ContactLink(props: Omit<ComponentProps<typeof Link>, 'scroll'>) {
  return <Link {...props} scroll={false} />
}
