// Genera las fotos del carrusel de Fabricación (components/home/
// carrusel-planta.tsx) a partir de los JPG originales de public/img/: WebP
// con el lado mayor a 1400 px y la relación de aspecto acotada entre 3:4 y
// 16:9 (recorte centrado), porque el carrusel muestra cada foto con su
// relación natural y las muy verticales salían como una tira finita.
// Cuando lleguen las fotos reales de la planta, se suman a FOTOS y se vuelve a
// correr: `npm run fotos`. La lista de la tira vive en content/planta.ts.
import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ORIGEN = 'public/img'
const DESTINO = 'public/img/carrusel'
const LADO_MAYOR = 1400
const ASPECTO_MIN = 3 / 4
const ASPECTO_MAX = 16 / 9

// nombre de salida → archivo de origen y, si hace falta, un recorte extra
// (fracción del alto a quitar por abajo, para tapar marcas de edición).
const FOTOS = {
  'cnc-planta': { de: 'fabricacion-cnc-planta.jpg' },
  'intercalar-implante': { de: 'caso-intercalar-implante.jpg' },
  'femur-componentes': { de: 'femur-componentes.jpg' },
  'sector-mecanizado': { de: 'fabricacion-cnc-maquina.jpg' },
  'hombro-implante': { de: 'hombro-implante.jpg' },
  'espaciador-pmma': { de: 'caso-espaciador-pmma.jpg', abajo: 0.1 },
  'impresion-3d': { de: 'fabricacion-impresion-3d.jpg' },
  'intercalar-tc': { de: 'caso-intercalar-tc.jpg' },
}

await mkdir(DESTINO, { recursive: true })

for (const [nombre, { de, abajo = 0 }] of Object.entries(FOTOS)) {
  const entrada = path.join(ORIGEN, de)
  const meta = await sharp(entrada).metadata()
  let ancho = meta.width
  let alto = Math.round(meta.height * (1 - abajo))
  // Recorte centrado para acotar la relación de aspecto
  const aspecto = ancho / alto
  let left = 0
  let top = 0
  if (aspecto > ASPECTO_MAX) {
    const nuevo = Math.round(alto * ASPECTO_MAX)
    left = Math.round((ancho - nuevo) / 2)
    ancho = nuevo
  } else if (aspecto < ASPECTO_MIN) {
    const nuevo = Math.round(ancho / ASPECTO_MIN)
    top = Math.round((alto - nuevo) / 2)
    alto = nuevo
  }
  const escala = Math.min(1, LADO_MAYOR / Math.max(ancho, alto))
  const salida = path.join(DESTINO, `${nombre}.webp`)
  const info = await sharp(entrada)
    .extract({ left, top, width: ancho, height: alto })
    .resize(Math.round(ancho * escala), Math.round(alto * escala))
    .webp({ quality: 82 })
    .toFile(salida)
  console.log(`${salida}: ${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB`)
}
