import Image from 'next/image'
import Link from 'next/link'
import { SiteNav } from './site-nav'

// Capas: el header es la única capa fija (z-40); el menú móvil vive dentro.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-outline-variant/60 bg-surface/90 backdrop-blur-md">
      <div className="page-container flex h-16 items-center justify-between gap-lg md:h-[72px]">
        <Link href="/" aria-label="Innercare, inicio" className="shrink-0">
          <Image
            src="/logo.png"
            alt="Innercare"
            width={1200}
            height={466}
            sizes="96px"
            className="h-8 w-auto md:h-9"
          />
        </Link>
        <SiteNav />
      </div>
    </header>
  )
}
