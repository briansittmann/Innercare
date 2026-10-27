import Image from 'next/image'
import Link from 'next/link'
import { SiteNav } from './site-nav'

// Capas: el header es la única capa fija (z-40); el menú móvil vive dentro.
export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md">
      <div className="page-container flex h-16 items-center justify-between gap-lg md:grid md:h-[72px] md:grid-cols-[1fr_auto_1fr]">
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
