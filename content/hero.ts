// Textos propios del hero (content/datos/hero.json, singleton "Hero" del
// panel). El titular y la línea de habilitaciones, que se repiten en el
// footer y en la imagen para redes, salen de company.ts (tagline,
// habilitacionesResumen) del mismo archivo.
import datos from './datos/hero.json'
import { Lector } from './leer'

const hero = new Lector(datos, 'Hero')

export const heroTextos = {
  bajada: hero.texto('bajada', 'Bajada'),
  botonRecorrer: hero.texto('botonRecorrer', 'Botón de vidrio'),
  avisoDeslizar: hero.texto('avisoDeslizar', 'Aviso de deslizar'),
}
