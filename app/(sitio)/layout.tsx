import type { Metadata, Viewport } from 'next'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { tagline } from '@/content/company'
import { menuTextos } from '@/content/menu'
import { seo } from '@/content/seo'
import { claseFuentes } from '../fuentes'
import '../globals.css'

// Raíz del sitio. Es un grupo de rutas, (sitio), porque el panel de edición
// de contenidos (app/(panel)/keystatic) tiene su propia raíz: sin header,
// sin pantalla de carga ni globals.css. Pasar de uno a otro es una carga
// completa de página (route-groups.md de la doc de Next).

// Pendiente: `metadataBase` con el dominio definitivo, para que og:image
// sea una URL absoluta. La imagen es app/opengraph-image.tsx.
// Los textos se editan en el panel (content/seo.ts); el título de Open Graph
// es la marca y el titular del hero.
export const metadata: Metadata = {
  title: {
    default: seo.titulo,
    template: seo.plantillaTitulo,
  },
  description: seo.descripcion,
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    siteName: menuTextos.marca,
    locale: 'es_AR',
    title: `${menuTextos.marca} | ${tagline}`,
    description: seo.ogDescripcion,
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export const viewport: Viewport = {
  themeColor: '#003c6f',
}

// `modal`: slot app/(sitio)/@modal. Hoy solo lo usa el panel de contacto.
export default function RootLayout({ children, modal }: LayoutProps<'/'>) {
  return (
    <html
      lang="es-AR"
      data-scroll-behavior="smooth"
      className={`${claseFuentes} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        <SiteHeader />
        <main className="flex-1">{children}</main>
        <SiteFooter />
        {modal}
      </body>
    </html>
  )
}
