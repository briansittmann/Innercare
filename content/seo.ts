// Metadatos de la home y de /contacto, y la tarjeta para redes
// (content/datos/seo.json, singleton "SEO y redes"). El título de Open Graph
// se arma con la marca y el titular del hero (company.ts).
import datos from './datos/seo.json'
import { Lector } from './leer'

const seoDatos = new Lector(datos, 'SEO y redes')
const contacto = seoDatos.hijo('contacto', 'Página de contacto')

export const seo = {
  titulo: seoDatos.texto('titulo', 'Título de la home'),
  plantillaTitulo: seoDatos.texto('plantillaTitulo', 'Plantilla del título'),
  descripcion: seoDatos.texto('descripcion', 'Descripción'),
  ogDescripcion: seoDatos.texto('ogDescripcion', 'Descripción para redes'),
  ogImagenAlt: seoDatos.texto('ogImagenAlt', 'Descripción de la imagen para redes'),
  contacto: {
    titulo: contacto.texto('titulo', 'Título'),
    descripcion: contacto.texto('descripcion', 'Descripción'),
  },
}
