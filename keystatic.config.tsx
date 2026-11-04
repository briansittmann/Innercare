import { config } from '@keystatic/core'
import { navegacion, singletons } from './keystatic.esquema'

// Panel de edición de contenidos (/keystatic). El esquema está en
// keystatic.esquema.ts (sin JSX, para que lo importe también la compuerta
// del build, scripts/contenido.mjs); acá va lo que necesita React o el
// entorno: el almacenamiento, la marca y el idioma.
//
// Almacenamiento según el entorno (.env.example): con
// NEXT_PUBLIC_KEYSTATIC_PROYECTO ("equipo/proyecto") el panel guarda por
// Keystatic Cloud, con commits en GitHub; sin ella, en los archivos locales.
// Lleva NEXT_PUBLIC_ porque esta configuración se evalúa en el servidor y en
// el navegador (makePage es un componente cliente) y los dos tienen que
// coincidir.
const proyecto = process.env.NEXT_PUBLIC_KEYSTATIC_PROYECTO

// En producción sin Cloud, el panel y su API no existen: la API local no
// autentica y expondría el árbol de archivos (lo comprueban
// app/(panel)/keystatic/layout.tsx y app/api/keystatic/[...params]/route.ts).
export const panelHabilitado = process.env.NODE_ENV !== 'production' || Boolean(proyecto)

export default config({
  storage: proyecto ? { kind: 'cloud' } : { kind: 'local' },
  ...(proyecto ? { cloud: { project: proyecto } } : {}),
  // Único español disponible; traduce solo el cromo del panel (Guardar,
  // Panel…) y en tuteo. Las etiquetas y descripciones de los campos son
  // nuestras y van en rioplatense (keystatic.esquema.ts).
  locale: 'es-ES',
  ui: {
    brand: {
      name: 'Innercare',
      // Keystatic pide un elemento <img>; next/image no aplica acá.
      // eslint-disable-next-line @next/next/no-img-element
      mark: () => <img src="/favicon.png" alt="" height={24} width={24} />,
    },
    navigation: navegacion,
  },
  singletons,
})
