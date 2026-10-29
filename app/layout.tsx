import type { Metadata, Viewport } from 'next'
import { Hanken_Grotesk, Source_Sans_3 } from 'next/font/google'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import './globals.css'

// Fuentes variables auto-hospedadas por next/font: sin peticiones a Google.
// Las variables CSS las consumen los tokens --font-* de globals.css.
const hankenGrotesk = Hanken_Grotesk({
  variable: '--font-hanken-grotesk',
  subsets: ['latin'],
})

const sourceSans3 = Source_Sans_3({
  variable: '--font-source-sans-3',
  subsets: ['latin'],
})

// Pendiente: `metadataBase` con el dominio definitivo, para que og:image
// sea una URL absoluta.
export const metadata: Metadata = {
  title: {
    default: 'Innercare | Implantes ortopédicos a medida del paciente',
    template: '%s | Innercare',
  },
  description:
    'Innercare fabrica implantes ortopédicos modulares y a medida del paciente en titanio biocompatible, con planificación quirúrgica 3D. Habilitados por ANMAT para fabricar, importar y distribuir productos médicos en Argentina.',
  icons: {
    icon: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    type: 'website',
    siteName: 'Innercare',
    locale: 'es_AR',
    title: 'Innercare | Innovación tecnológica en beneficio del paciente',
    description:
      'Implantes ortopédicos modulares y a medida del paciente, fabricados en titanio biocompatible por mecanizado CNC e impresión 3D.',
    images: ['/img/fabricacion-cnc-planta.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export const viewport: Viewport = {
  themeColor: '#003c6f',
}

// `modal`: slot app/@modal. Hoy solo lo usa el panel de contacto.
export default function RootLayout({ children, modal }: LayoutProps<'/'>) {
  return (
    <html
      lang="es-AR"
      data-scroll-behavior="smooth"
      className={`${hankenGrotesk.variable} ${sourceSans3.variable} h-full antialiased`}
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
