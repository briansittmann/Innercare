import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { ImageResponse } from 'next/og'
import sharp from 'sharp'
import { habilitacionesResumen, tagline } from '@/content/company'

// Miniatura para compartir en redes (og:image; X y WhatsApp la toman de ahí).
// Es el primer pantallazo de la home: el degradé del hero, el busto de vidrio
// con la craneoplastía a la derecha (la captura de respaldo del hero) y, a la
// izquierda, el logo, el titular y la línea de habilitaciones (la bajada no:
// la tarjeta de la red ya muestra la descripción debajo). Se genera en
// el build; si cambian el hero o su captura, sale sola en el próximo.
// Las fichas siguen con la foto de portada de cada producto (generateMetadata
// de app/productos/[slug]).

export const alt = `Innercare. ${tagline}: cabeza de vidrio con una craneoplastía de titanio.`
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const raiz = process.cwd()

// Satori no lee woff2 ni fuentes variables: los pesos estáticos de
// Fontsource (OFL), latin, en assets/fuentes/
const [hanken, sourceSans] = await Promise.all([
  readFile(join(raiz, 'assets/fuentes/hanken-grotesk-latin-500-normal.woff')),
  readFile(join(raiz, 'assets/fuentes/source-sans-3-latin-400-normal.woff')),
])

// Satori no decodifica WebP: el busto pasa a PNG con sharp (que ya viene con
// Next), y el logo se achica a lo que ocupa
const BUSTO = { ancho: 893, alto: 837 }
const LOGO = { ancho: 220, alto: 75 }
const [busto, logo] = await Promise.all([
  sharp(join(raiz, 'public/img/cuerpo-inicio.webp')).resize(BUSTO.ancho, BUSTO.alto).png().toBuffer(),
  sharp(join(raiz, 'public/logo-header.png')).resize(LOGO.ancho * 2).png().toBuffer(),
])
const dataUrl = (png: Buffer) => `data:image/png;base64,${png.toString('base64')}`

// Tokens de app/globals.css (Satori no lee CSS)
const color = {
  primario: '#003c6f',
  texto: '#0d1b2a',
  textoSecundario: '#4b5866',
  escenarioDesde: '#e6eef8',
  escenarioHasta: '#c3d7ee',
}

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          position: 'relative',
          background: `linear-gradient(${color.escenarioDesde}, ${color.escenarioHasta})`,
          fontFamily: 'Source Sans 3',
        }}
      >
        {/* La cabeza ocupa de x 680 a 1156, con la coronilla a 50 px del
            borde; el corte de la captura queda fuera, debajo del borde */}
        {/* eslint-disable-next-line jsx-a11y/alt-text */}
        <img
          src={dataUrl(busto)}
          width={BUSTO.ancho}
          height={BUSTO.alto}
          style={{ position: 'absolute', left: 521, top: -129 }}
        />
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            width: 620,
            padding: '60px 0 56px 72px',
          }}
        >
          {/* eslint-disable-next-line jsx-a11y/alt-text */}
          <img src={dataUrl(logo)} width={LOGO.ancho} height={LOGO.alto} />
          <div
            style={{
              fontFamily: 'Hanken Grotesk',
              fontWeight: 500,
              fontSize: 72,
              lineHeight: 1,
              letterSpacing: '-0.035em',
              color: color.texto,
            }}
          >
            {tagline}
          </div>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              maxWidth: 500,
              fontSize: 22,
              lineHeight: 1.35,
              color: color.textoSecundario,
            }}
          >
            <div
              style={{
                width: 10,
                height: 10,
                flexShrink: 0,
                marginTop: 10,
                marginRight: 14,
                borderRadius: 999,
                background: color.primario,
              }}
            />
            {habilitacionesResumen}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Hanken Grotesk', data: hanken, weight: 500, style: 'normal' },
        { name: 'Source Sans 3', data: sourceSans, weight: 400, style: 'normal' },
      ],
    },
  )
}
