// Genera public/img/manos.webp, la imagen de la que salen las manos de
// partículas del cierre de contacto (components/animaciones/manos.ts), a
// partir del original imagenes/manos-original.png (material fuente local,
// fuera de git y de public/: la página no lo usa y sus derechos están sin
// confirmar): dos manos en gris sobre negro puro, ya en diagonal. La página nunca la muestra: el canvas la dibuja
// oculta, lee sus píxeles y pone partículas según el brillo (umbral 40 de
// 255; el ruido del WebP queda muy por debajo). Las yemas y el punto de
// contacto están en manos.ts como fracciones del ancho y del alto, así que
// el tamaño de salida no les cambia nada. `npm run manos`.
import path from 'node:path'
import sharp from 'sharp'

const ENTRADA = 'imagenes/manos-original.png'
const SALIDA = 'public/img/manos.webp'
const ANCHO = 960

const info = await sharp(ENTRADA).resize(ANCHO).grayscale().webp({ quality: 82 }).toFile(SALIDA)
console.log(`${path.normalize(SALIDA)}: ${info.width}×${info.height}, ${Math.round(info.size / 1024)} KB`)
