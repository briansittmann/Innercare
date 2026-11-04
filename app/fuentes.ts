import { Hanken_Grotesk, Source_Sans_3 } from 'next/font/google'

// Fuentes variables auto-hospedadas por next/font: sin peticiones a Google.
// Las variables CSS las consumen los tokens --font-* de globals.css. Están
// en un módulo aparte porque las usan dos raíces: el layout del sitio
// (app/(sitio)/layout.tsx) y la página 404 global (app/global-not-found.tsx),
// que no pasa por ningún layout.
export const hankenGrotesk = Hanken_Grotesk({
  variable: '--font-hanken-grotesk',
  subsets: ['latin'],
})

export const sourceSans3 = Source_Sans_3({
  variable: '--font-source-sans-3',
  subsets: ['latin'],
})

export const claseFuentes = `${hankenGrotesk.variable} ${sourceSans3.variable}`
