// Etiquetas del menú, del botón de contacto y del footer (content/datos/
// menu.json, singleton "Menú y footer"). Las anclas quedan en
// components/nav-links.ts, que toma de acá las etiquetas.
import datos from './datos/menu.json'
import { Lector } from './leer'

const menu = new Lector(datos, 'Menú y footer')
const enlaces = menu.hijo('enlaces', 'Enlaces del menú')
const accesibilidad = menu.hijo('accesibilidad', 'Lectores de pantalla')

export const menuTextos = {
  // Nombre de la marca: alt de los logos y línea de copyright
  marca: menu.texto('marca', 'Nombre de la marca'),
  enlaces: {
    implantes: enlaces.texto('implantes', 'Implantes'),
    proceso: enlaces.texto('proceso', 'Cómo trabajamos'),
    fabricacion: enlaces.texto('fabricacion', 'Fabricación'),
    habilitaciones: enlaces.texto('habilitaciones', 'Habilitaciones'),
  },
  // "Plantear un caso": la única etiqueta de contacto del sitio
  plantearCaso: menu.texto('plantearCaso', 'Botón de contacto'),
  accesibilidad: {
    logo: accesibilidad.texto('logo', 'Logo'),
    abrirMenu: accesibilidad.texto('abrirMenu', 'Abrir el menú'),
    cerrarMenu: accesibilidad.texto('cerrarMenu', 'Cerrar el menú'),
    menuPrincipal: accesibilidad.texto('menuPrincipal', 'Nombre del menú'),
  },
}
