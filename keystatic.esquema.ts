// Esquema de los contenidos editables de la landing (Keystatic): qué campos
// tiene cada sección, con sus etiquetas, límites y validaciones, en el
// vocabulario de Innercare. Sin JSX ni dependencias de React para que lo
// pueda importar Node tal cual (scripts/contenido.mjs, la compuerta del
// build) además de keystatic.config.tsx, que le suma el almacenamiento y la
// marca del panel.
//
// Cada singleton se guarda en content/datos/<nombre>.json y lo lee el
// content/*.ts correspondiente a través de content/leer.ts. Lo que no está
// acá queda en código (anclas, ids, cámara, rutas de imágenes, íconos): ver
// CLAUDE.md, "Textos editables".
import { fields, singleton } from '@keystatic/core'
import { provincias } from './content/mapa-argentina.ts'

// Límites de largo, en caracteres, de los textos que afectan el diseño.
// Medidos en 1440×900 y 390×844 (90 % del menor con margen): el detalle y
// las reglas están en docs/landing/textos-editables/LIMITES.md. Las claves
// `suma*` y `direccionCard` son combinaciones que un tope por campo no
// cubre; las comprueba scripts/contenido.mjs.
export const LIMITES = {
  heroTitular: 50,
  heroBajada: 100,
  heroBoton: 23,
  heroLinea: 93,
  heroAviso: 38,
  avisoContinuar: 22,
  menuEnlace: 15,
  plantearCaso: 18,
  marca: 20,
  cargaPalabra: 32,
  cargaEtiqueta: 20,
  cierreTitulo: 63,
  cierreTexto: 88,
  etiquetaTarjeta: 20,
  paradaZona: 36,
  paradaTitulo: 47,
  paradaDescripcion: 180,
  specEtiqueta: 16,
  specValor: 36,
  procesoTitulo: 32,
  pasoTitulo: 32,
  pasoDescripcion: 90,
  leyenda: 16,
  fabricacionTitulo: 44,
  fabricacionBajada: 110,
  tarjetaNombre: 23,
  tarjetaTexto: 140,
  volverAVer: 20,
  fotoTitulo: 48,
  fotoSubtitulo: 28,
  habilitacionesTitulo: 35,
  habilitacionesBajada: 152,
  habilitacionDetalle: 60,
  // Cada parte separada por " · " va en una línea
  habilitacionReferenciaParte: 25,
  habilitacionReferencia: 55,
  distribucionTitulo: 35,
  distribucionBajada: 119,
  sedeTipo: 45,
  // La card muestra "{calle}, {localidad}" en hasta 61 caracteres
  // (direccionCard); la dirección de Alberti ya mide 52
  sedeCalle: 59,
  sedeLocalidad: 25,
  contactoKicker: 40,
  contactoIntro: 50,
  contactoTitulo: 31,
  contactoBajada: 95,
  panelTitulo: 18,
  panelBajada: 120,
  panelBoton: 24,
  motivo: 26,
  otrosCanales: 40,
  seoTitulo: 60,
  // Google corta cerca de los 160; la descripción actual mide 223 y no se toca
  seoDescripcion: 240,
  seoDescripcionContacto: 160,
  ogDescripcion: 160,
  // "{marca} | {titular del hero}"
  ogTitulo: 60,
  // Combinaciones
  sumaMenu: 52,
  sumaBotonesHero: 41,
  sumaLeyenda: 40,
  direccionCard: 61,
  sumaSedeCard: 78,
  // Textos que no afectan el diseño (alt, lectores de pantalla, mensajes)
  alt: 160,
  largo: 300,
} as const

// Un texto de una línea, obligatorio salvo que se diga lo contrario
function texto(
  label: string,
  max: number,
  description?: string,
  opciones: { opcional?: boolean; multilinea?: boolean } = {},
) {
  return fields.text({
    label,
    description,
    multiline: opciones.multilinea,
    validation: { isRequired: !opciones.opcional, length: { max } },
  })
}

const PATRON = {
  // "Disposición 0999/17", "N° 298-2023-R", "GLN 7798276610001 · Sub-GLN 7798276610018":
  // cada parte (separadas por " · ", una por línea) de hasta 25 caracteres
  referencia: {
    regex: /^(?=.*\d)[\p{L}\d°º/.\- ]{1,25}( · [\p{L}\d°º/.\- ]{1,25})*$/u,
    message:
      'Escribí la referencia con su número, como «Disposición 0999/17» o «N° 298-2023-R»; cada parte separada por « · » va en una línea y no puede pasar de 25 caracteres.',
  },
  telefono: {
    regex: /^\+54( \d{1,4}){2,3}-\d{4}$/,
    message: 'Formato: +54 9 11 2066-5434 (con el código de país y el guion).',
  },
  codigoPostal: {
    regex: /^$|^[A-Z]\d{4}[A-Z]{3}$/,
    message: 'Código postal argentino de ocho caracteres, como B1678EEC, o vacío.',
  },
  identificador: {
    regex: /^[a-z0-9]+(-[a-z0-9]+)*$/,
    message: 'Solo minúsculas, números y guiones, como «caleta-olivia».',
  },
  plantilla: {
    regex: /%s/,
    message: 'Tiene que incluir %s, que se reemplaza por el título de cada página.',
  },
} as const

// Cada parada del recorrido: los seis objetos van en el primer nivel del
// singleton para que la ficha PDF se guarde en public/fichas/<parada>/ficha.pdf
// (Keystatic arma el nombre del archivo con la ruta del campo: <parada>/ficha).
function parada(nombre: string, nota?: string) {
  return fields.object(
    {
      zona: texto(
        'Zona anatómica',
        LIMITES.paradaZona,
        'Nombre corto en el índice de la izquierda y en la cabecera de la tarjeta, como «Fémur proximal». Una línea.',
      ),
      titulo: texto(
        'Título',
        LIMITES.paradaTitulo,
        'Título de la tarjeta, en dos líneas. El del acetábulo (47) ya está justo en el límite.',
      ),
      descripcion: texto(
        'Descripción',
        LIMITES.paradaDescripcion,
        'Párrafo de la tarjeta, también en la hoja del celular: cuanto más largo, menos cuerpo se ve detrás. Si la parada tiene cuatro datos técnicos, conviene no pasar de 100 caracteres.',
        { multilinea: true },
      ),
      specs: fields.array(
        fields.object({
          etiqueta: texto('Dato', LIMITES.specEtiqueta, 'Columna izquierda, angosta: «Material», «Técnica», «Contacto óseo».'),
          valor: texto('Valor', LIMITES.specValor, 'Columna derecha, en cifras tabulares. Una línea.'),
        }),
        {
          label: 'Datos técnicos',
          description: 'La tabla de la tarjeta (solo en escritorio). Entre uno y cuatro datos: con más, la tarjeta no entra en la pantalla.',
          itemLabel: (props) => props.fields.etiqueta.value || 'Dato',
          validation: { length: { min: 1, max: 4 } },
        },
      ),
      miniaturaAlt: texto(
        'Texto alternativo de la foto',
        LIMITES.alt,
        'Describe la foto de la pieza que se ve sin WebGL o mientras carga el 3D (lectores de pantalla).',
      ),
      ficha: fields.file({
        label: 'Ficha técnica (PDF)',
        description:
          'Opcional. Si hay archivo, la tarjeta muestra el enlace «Ficha técnica (PDF)» y la ficha del producto también lo ofrece. Tiene que ser un PDF.',
        directory: 'public/fichas',
        publicPath: '/fichas/',
      }),
    },
    { label: nombre, description: nota },
  )
}

const provinciasOrdenadas = [...provincias]
  .map((p) => ({ label: p.nombre, value: p.nombre }))
  .sort((a, b) => a.label.localeCompare(b.label, 'es'))

export const singletons = {
  hero: singleton({
    label: 'Hero',
    path: 'content/datos/hero',
    format: { data: 'json' },
    schema: {
      titular: texto(
        'Titular',
        LIMITES.heroTitular,
        'Entra letra por letra en el hero; la entrada está medida para unas 47 letras. Se repite en el footer (con punto final), en la imagen para redes y en el título de Open Graph («Innercare | …», que no puede pasar de 60: el actual está justo).',
      ),
      bajada: texto(
        'Bajada',
        LIMITES.heroBajada,
        'Debajo del titular. Entra en tres líneas de 36 caracteres; en el celular, cada línea de más baja la cabeza del cuerpo.',
        { multilinea: true },
      ),
      botonRecorrer: texto(
        'Botón de vidrio',
        LIMITES.heroBoton,
        'El segundo botón del hero, que baja al recorrido. Va al lado de «Plantear un caso» en una fila de 48 px en el celular: entre los dos no pueden pasar de 41 caracteres, y hoy suman 38.',
      ),
      lineaHabilitaciones: texto(
        'Línea de habilitaciones',
        LIMITES.heroLinea,
        'Debajo de los botones, con el sello. Resumen de las habilitaciones ANMAT acordado con Innercare; también va en la imagen para redes. Dos líneas de 46 caracteres: la actual ya está justo en el límite.',
        { multilinea: true },
      ),
      avisoDeslizar: texto(
        'Aviso de deslizar',
        LIMITES.heroAviso,
        'Junto al riel que invita a deslizar. En el celular va en dos líneas a la izquierda del cuerpo.',
      ),
    },
  }),

  recorrido: singleton({
    label: 'Recorrido de implantes',
    path: 'content/datos/recorrido',
    format: { data: 'json' },
    schema: {
      cierre: fields.object(
        {
          titulo: texto(
            'Título',
            LIMITES.cierreTitulo,
            'Al lado del cuerpo entero, en tres líneas de 18 caracteres. El actual ya está justo en el límite.',
            { multilinea: true },
          ),
          texto: texto('Bajada', LIMITES.cierreTexto, 'Dos líneas de 46 caracteres. La actual ya está justo en el límite.', { multilinea: true }),
        },
        { label: 'Cierre del recorrido', description: 'El texto final, con el cuerpo entero y el botón «Plantear un caso».' },
      ),
      avisoContinuar: texto(
        'Aviso de continuar',
        LIMITES.avisoContinuar,
        'Abajo a la derecha del cierre, con el riel. En el celular, en dos líneas. El actual ya está justo en el límite.',
      ),
      etiquetas: fields.object(
        {
          aMedida: texto('Implante a medida', LIMITES.etiquetaTarjeta, 'Píldora de la tarjeta de los implantes a medida.'),
          catalogo: texto('Implante de catálogo', LIMITES.etiquetaTarjeta, 'Píldora de la tarjeta de los implantes de catálogo.'),
          fichaTecnica: texto('Enlace a la ficha PDF', LIMITES.etiquetaTarjeta, 'Enlace de la tarjeta cuando la parada tiene PDF.'),
        },
        { label: 'Etiquetas de las tarjetas' },
      ),
      accesibilidad: fields.object(
        {
          escena: texto(
            'Descripción del cuerpo 3D',
            LIMITES.largo,
            'Lo que escucha un lector de pantalla en lugar de la escena. Conviene nombrar los seis implantes.',
            { multilinea: true },
          ),
          indice: texto('Nombre del índice', LIMITES.alt, 'Nombre del índice anatómico para lectores de pantalla.'),
        },
        { label: 'Lectores de pantalla' },
      ),
      craneo: parada('Cráneo', 'Craneoplastía. Implante a medida: la tarjeta lleva a «Plantear un caso».'),
      maxilar: parada('Maxilar', 'Implante a medida.'),
      hombro: parada('Hombro', 'Implante de catálogo: la tarjeta lleva a la ficha de la prótesis de hombro.'),
      acetabulo: parada('Acetábulo', 'Implante a medida.'),
      femur: parada('Fémur proximal', 'Implante de catálogo: la tarjeta lleva a la ficha de la endoprótesis de fémur.'),
      intercalar: parada('Diáfisis femoral', 'Implante intercalar, a medida.'),
    },
  }),

  proceso: singleton({
    label: 'Cómo trabajamos',
    path: 'content/datos/proceso',
    format: { data: 'json' },
    schema: {
      titulo: texto('Título', LIMITES.procesoTitulo, 'Título de la sección, en dos líneas de 16 caracteres.'),
      pasos: fields.object(
        {
          uno: paso('Paso 01'),
          dos: paso('Paso 02'),
          tres: paso('Paso 03'),
        },
        {
          label: 'Los tres pasos',
          description: 'Son tres porque la pieza de partículas tiene tres formas (cortes de TC, fémur con la zona a resecar, implante con guías).',
        },
      ),
      leyenda: fields.object(
        {
          hueso: texto('Hueso', LIMITES.leyenda),
          resecar: texto('Zona a resecar', LIMITES.leyenda),
          implante: texto('Implante y guías', LIMITES.leyenda),
        },
        { label: 'Leyenda de la pieza', description: 'Qué es cada color de la pieza, debajo de ella, en una fila. Una o dos palabras cada una: entre las tres no pueden pasar de 40 caracteres.' },
      ),
    },
  }),

  fabricacion: singleton({
    label: 'Fabricación',
    path: 'content/datos/fabricacion',
    format: { data: 'json' },
    schema: {
      titulo: texto('Título', LIMITES.fabricacionTitulo, 'Título de la sección, en dos líneas de 22 caracteres. El actual ya está justo en el límite.'),
      bajada: texto('Bajada', LIMITES.fabricacionBajada, 'Dos líneas de 56 caracteres.', { multilinea: true }),
      tarjetas: fields.object(
        {
          cnc: tarjetaFabricacion('Mecanizado CNC'),
          impresion: tarjetaFabricacion('Impresión 3D'),
        },
        { label: 'Las dos tarjetas', description: 'Cada una con su animación arriba; la pieza final es un render del implante real.' },
      ),
      volverAVer: texto('Botón de repetir', LIMITES.volverAVer, 'Al pie de cada tarjeta, repite la animación.'),
      fotos: fields.object(
        {
          cnc: fotoTira('Foto 1: centros de mecanizado CNC', 'cnc-planta.webp'),
          intercalar: fotoTira('Foto 2: implante intercalar con sus guías', 'intercalar-implante.webp'),
          femur: fotoTira('Foto 3: componentes de la endoprótesis femoral', 'femur-componentes.webp'),
          mecanizado: fotoTira('Foto 4: sector de mecanizado', 'sector-mecanizado.webp'),
          hombro: fotoTira('Foto 5: prótesis reversa de hombro', 'hombro-implante.webp'),
          espaciador: fotoTira('Foto 6: espaciador en PMMA', 'espaciador-pmma.webp'),
          impresion: fotoTira('Foto 7: impresión 3D en metal', 'impresion-3d.webp'),
          tomografia: fotoTira('Foto 8: estudio tomográfico', 'intercalar-tc.webp'),
        },
        {
          label: 'Tira de fotos',
          description: 'Las ocho fotos reales al cierre de la sección. Las imágenes se cambian reemplazando el archivo en public/img/carrusel/; acá van sus textos.',
        },
      ),
      accesibilidad: fields.object(
        {
          tira: texto('Nombre de la tira de fotos', LIMITES.alt, 'Para lectores de pantalla.'),
          fotoCnc: texto(
            'Foto de planta del mecanizado',
            LIMITES.alt,
            'Texto alternativo de la foto que se ve en la tarjeta de CNC sin JavaScript.',
          ),
          fotoImpresion: texto(
            'Foto de planta de la impresión 3D',
            LIMITES.alt,
            'Texto alternativo de la foto que se ve en la tarjeta de impresión 3D sin JavaScript.',
          ),
        },
        { label: 'Lectores de pantalla' },
      ),
    },
  }),

  habilitaciones: singleton({
    label: 'Habilitaciones',
    path: 'content/datos/habilitaciones',
    format: { data: 'json' },
    schema: {
      titulo: texto('Título', LIMITES.habilitacionesTitulo, 'Título de la sección, en dos líneas de 16 caracteres.'),
      bajada: texto('Bajada', LIMITES.habilitacionesBajada, 'Tres líneas de 56 caracteres. La actual ya está justo en el límite.', { multilinea: true }),
      filas: fields.array(
        fields.object({
          id: texto('Identificador', 40, 'Clave interna y estable de la fila, como «anmat-bpf». No se muestra.'),
          organismo: fields.select({
            label: 'Quién la otorga',
            description: 'Debajo del detalle dice «ANMAT» o «Inscripción» según el organismo.',
            options: [
              { label: 'ANMAT', value: 'ANMAT' },
              { label: 'Sistema Nacional de Trazabilidad', value: 'Trazabilidad' },
            ],
            defaultValue: 'ANMAT',
          }),
          detalle: texto('Detalle', LIMITES.habilitacionDetalle, 'Qué habilita, en una línea de la tabla.'),
          referencia: fields.text({
            label: 'Disposición o número',
            description:
              'Dato regulado: la disposición ANMAT, el certificado o el GLN tal cual figuran. Los dígitos se resuelven con una animación. Dos partes separadas por « · » van en dos líneas.',
            validation: { isRequired: true, length: { max: LIMITES.habilitacionReferencia }, pattern: PATRON.referencia },
          }),
        }),
        {
          label: 'Filas de la tabla',
          description: 'Las habilitaciones de la carpeta institucional, en el orden en que se leen.',
          itemLabel: (props) => props.fields.detalle.value || 'Habilitación',
          validation: { length: { min: 1, max: 8 } },
        },
      ),
    },
  }),

  distribucion: singleton({
    label: 'Distribución',
    path: 'content/datos/distribucion',
    format: { data: 'json' },
    schema: {
      titulo: texto('Título', LIMITES.distribucionTitulo, 'Entra palabra por palabra; dos líneas de 16 caracteres.'),
      bajada: texto('Bajada', LIMITES.distribucionBajada, 'Entra palabra por palabra; tres líneas de 56 caracteres. La actual ya está justo en el límite.', { multilinea: true }),
      accesibilidad: fields.object(
        { mapa: texto('Nombre del mapa', LIMITES.alt, 'Para lectores de pantalla.') },
        { label: 'Lectores de pantalla' },
      ),
      sedes: fields.array(
        fields.object({
          id: fields.text({
            label: 'Identificador',
            description: 'Clave interna y estable de la sede, como «caleta-olivia». Elige su foto en public/img/sedes/. No se muestra.',
            validation: { isRequired: true, length: { max: 40 }, pattern: PATRON.identificador },
          }),
          rol: fields.select({
            label: 'Tipo de sede',
            description: 'Decide el rótulo de la etiqueta del mapa: «Laboratorio», «Sucursal» o, para la planta, el nombre completo.',
            options: [
              { label: 'Laboratorio', value: 'laboratorio' },
              { label: 'Planta industrial', value: 'planta' },
              { label: 'Sucursal', value: 'sucursal' },
            ],
            defaultValue: 'sucursal',
          }),
          tipo: texto(
            'Nombre completo',
            LIMITES.sedeTipo,
            'Primera línea de la tarjeta de la sede, como «Laboratorio de productos de tecnología médica». Las sucursales muestran solo «Sucursal». En la tarjeta, nombre + calle + localidad no pueden pasar de 78 caracteres.',
          ),
          calle: texto('Calle y número', LIMITES.sedeCalle, 'Dato regulado (carpeta institucional). En la tarjeta va «calle, localidad», que no puede pasar de 61 caracteres.'),
          codigoPostal: fields.text({
            label: 'Código postal',
            description: 'Opcional. Se muestra solo en el footer, delante de la localidad.',
            validation: { length: { max: 8 }, pattern: PATRON.codigoPostal },
          }),
          localidad: texto('Localidad', LIMITES.sedeLocalidad, 'En la etiqueta del mapa, junto a la provincia. «Comodoro Rivadavia» ya ocupa dos líneas en columnas angostas.'),
          provincia: fields.select({
            label: 'Provincia',
            description: 'La provincia se tiñe en el mapa al señalar la sede.',
            options: provinciasOrdenadas,
            defaultValue: 'Buenos Aires',
          }),
          latitud: fields.number({
            label: 'Latitud',
            description: 'Ubica el pin en el mapa y ordena las sedes de norte a sur. En Argentina, entre -21 y -56.',
            validation: { isRequired: true, min: -56, max: -21 },
          }),
          longitud: fields.number({
            label: 'Longitud',
            description: 'Ubica el pin en el mapa. En Argentina, entre -74 y -53.',
            validation: { isRequired: true, min: -74, max: -53 },
          }),
          telefonos: fields.array(
            fields.text({
              label: 'Teléfono',
              validation: { isRequired: true, length: { max: 24 }, pattern: PATRON.telefono },
            }),
            {
              label: 'Teléfonos',
              description: 'Los de la sede principal van al footer y al panel de contacto (el primero es el WhatsApp).',
              itemLabel: (props) => props.value || 'Teléfono',
              validation: { length: { max: 4 } },
            },
          ),
          principal: fields.checkbox({
            label: 'Sede principal',
            description: 'Una sola: su dirección y sus teléfonos van al footer y al panel de contacto.',
            defaultValue: false,
          }),
          fotoAlt: texto('Texto alternativo de la foto', LIMITES.alt, 'Describe la miniatura de la sede en el mapa (lectores de pantalla).'),
        }),
        {
          label: 'Sedes',
          description: 'Las sedes en el mapa, con su tarjeta. Direcciones: dato regulado de la carpeta institucional.',
          itemLabel: (props) => props.fields.localidad.value || 'Sede',
          validation: { length: { min: 1, max: 8 } },
        },
      ),
    },
  }),

  contacto: singleton({
    label: 'Contacto',
    path: 'content/datos/contacto',
    format: { data: 'json' },
    schema: {
      kicker: texto('Línea chica de la intro', LIMITES.contactoKicker, 'Arriba del titular de la intro, en celeste: «Planificamos, diseñamos, fabricamos.»'),
      titularIntro: texto(
        'Titular de la intro',
        LIMITES.contactoIntro,
        'Entra palabra por palabra mientras las manos se arman. Una oración corta.',
      ),
      titulo: texto('Título de la tarjeta', LIMITES.contactoTitulo, 'La pregunta de la tarjeta final, en dos líneas de 16 caracteres.'),
      bajada: texto('Bajada de la tarjeta', LIMITES.contactoBajada, 'Dos o tres líneas de 44 caracteres. La actual ya está justo en el límite.', { multilinea: true }),
      panel: fields.object(
        {
          titulo: texto('Título', LIMITES.panelTitulo, 'Encabezado del panel y de la página /contacto.'),
          bajada: texto('Bajada', LIMITES.panelBajada, 'Debajo del título, encima del formulario.', { multilinea: true }),
          enviar: texto('Botón de enviar', LIMITES.panelBoton),
          enviando: texto('Botón mientras envía', LIMITES.panelBoton, 'Reemplaza al botón de enviar mientras se manda la consulta.'),
          exitoTitulo: texto('Título de la confirmación', LIMITES.alt, 'Cuando la consulta se envió.'),
          exitoTexto: texto('Texto de la confirmación', LIMITES.largo, undefined, { multilinea: true }),
          otrosCanales: texto('Otros canales', LIMITES.otrosCanales, 'Encima de los enlaces de WhatsApp y teléfono.'),
          motivos: fields.object(
            {
              producto: texto('Consulta sobre un producto', LIMITES.motivo, 'Al elegirlo aparece el selector de producto.'),
              caso: texto('Caso a medida', LIMITES.motivo, 'El que trae precargado «Plantear un caso».'),
              compras: texto('Compras y licitaciones', LIMITES.motivo),
              otro: texto('Otra consulta', LIMITES.motivo),
            },
            {
              label: 'Motivos de la consulta',
              description: 'Las cuatro píldoras del formulario, en dos columnas. Una etiqueta larga pasa a dos líneas.',
            },
          ),
        },
        { label: 'Panel de contacto', description: 'El formulario que abre «Plantear un caso» (y la página /contacto).' },
      ),
    },
  }),

  menu: singleton({
    label: 'Menú y footer',
    path: 'content/datos/menu',
    format: { data: 'json' },
    schema: {
      marca: texto('Nombre de la marca', LIMITES.marca, 'Texto alternativo de los logos y la línea de copyright del footer.'),
      enlaces: fields.object(
        {
          implantes: texto('Implantes', LIMITES.menuEnlace, 'Lleva al recorrido.'),
          proceso: texto('Cómo trabajamos', LIMITES.menuEnlace),
          fabricacion: texto('Fabricación', LIMITES.menuEnlace),
          habilitaciones: texto('Habilitaciones', LIMITES.menuEnlace),
        },
        {
          label: 'Enlaces del menú',
          description:
            'La barra mide el 62 % de la ventana: entre las cuatro no pueden pasar de 52 caracteres (hoy suman 49, justo en el límite); con más, el logo pasa a su ícono y el menú se descentra.',
        },
      ),
      plantearCaso: texto(
        'Botón de contacto',
        LIMITES.plantearCaso,
        'La única etiqueta de contacto del sitio: la barra, el menú del celular, el hero, las tarjetas, el cierre del recorrido y el contacto. Botón de 48 px; en el hero va en la misma fila que el botón de vidrio (entre los dos, hasta 41 caracteres).',
      ),
      accesibilidad: fields.object(
        {
          logo: texto('Logo', LIMITES.alt, 'Qué anuncia el logo de la barra, que vuelve al inicio.'),
          abrirMenu: texto('Abrir el menú', LIMITES.alt, 'Botón del menú del celular, cerrado.'),
          cerrarMenu: texto('Cerrar el menú', LIMITES.alt, 'Botón del menú del celular, abierto.'),
          menuPrincipal: texto('Nombre del menú', LIMITES.alt),
        },
        { label: 'Lectores de pantalla' },
      ),
    },
  }),

  carga: singleton({
    label: 'Pantalla de carga',
    path: 'content/datos/carga',
    format: { data: 'json' },
    schema: {
      palabras: fields.array(
        fields.text({ label: 'Palabra', validation: { isRequired: true, length: { max: LIMITES.cargaPalabra } } }),
        {
          label: 'Etapas del proceso',
          description:
            'Van cambiando debajo de la pieza a medida que avanza la carga, en orden. Cada una dura al menos medio segundo: entre tres y diez. Una línea cada una.',
          itemLabel: (props) => props.value || 'Palabra',
          validation: { length: { min: 3, max: 10 } },
        },
      ),
      cargando: texto('Cargando', LIMITES.cargaEtiqueta, 'A la izquierda del cargador, junto al porcentaje.'),
      listo: texto('Listo', LIMITES.cargaEtiqueta, 'Reemplaza a «Cargando» al llegar al 100 %. Se ve apenas.'),
    },
  }),

  seo: singleton({
    label: 'SEO y redes',
    path: 'content/datos/seo',
    format: { data: 'json' },
    schema: {
      titulo: texto('Título de la home', LIMITES.seoTitulo, 'Título de la pestaña y de los buscadores. Hasta unos 60 caracteres se ve entero en Google.'),
      plantillaTitulo: fields.text({
        label: 'Plantilla del título',
        description: 'Para las demás páginas: %s se reemplaza por el título de cada una («Contacto | Innercare»).',
        validation: { isRequired: true, length: { max: 40 }, pattern: PATRON.plantilla },
      }),
      descripcion: texto(
        'Descripción',
        LIMITES.seoDescripcion,
        'La que muestran los buscadores debajo del título. Google corta cerca de los 160 caracteres (la actual mide 223).',
        { multilinea: true },
      ),
      ogDescripcion: texto(
        'Descripción para redes',
        LIMITES.ogDescripcion,
        'La de la tarjeta al compartir el enlace (WhatsApp, LinkedIn, X). El título de esa tarjeta es la marca y el titular del hero.',
        { multilinea: true },
      ),
      ogImagenAlt: texto(
        'Descripción de la imagen para redes',
        LIMITES.largo,
        'Texto alternativo de la miniatura que acompaña al enlace: el hero con la cabeza de vidrio. Si cambia el titular del hero, conviene actualizarlo.',
        { multilinea: true },
      ),
      contacto: fields.object(
        {
          titulo: texto('Título', LIMITES.panelTitulo, 'Título de la pestaña de /contacto; se completa con la plantilla.'),
          descripcion: texto('Descripción', LIMITES.seoDescripcionContacto, 'Para los buscadores; Google corta cerca de los 160 caracteres.', { multilinea: true }),
        },
        { label: 'Página de contacto' },
      ),
    },
  }),
}

function paso(nombre: string) {
  return fields.object(
    {
      titulo: texto(
        'Título',
        LIMITES.pasoTitulo,
        'Crece hasta 28 px cuando el paso está activo; con más de 30 caracteres puede pasar a dos líneas.',
      ),
      descripcion: texto('Descripción', LIMITES.pasoDescripcion, 'Una o dos líneas. En el celular se ve solo la del paso activo. La del paso 03 ya está justo en el límite.', {
        multilinea: true,
      }),
    },
    { label: nombre },
  )
}

function tarjetaFabricacion(nombre: string) {
  return fields.object(
    {
      nombre: texto('Nombre', LIMITES.tarjetaNombre, 'Título de la tarjeta, en una línea.'),
      texto: texto('Texto', LIMITES.tarjetaTexto, 'Tres líneas de 58 caracteres. Los botones de las dos tarjetas se alinean solos.', {
        multilinea: true,
      }),
    },
    { label: nombre },
  )
}

function fotoTira(nombre: string, archivo: string) {
  return fields.object(
    {
      alt: texto('Texto alternativo', LIMITES.alt, 'Describe la foto para lectores de pantalla.'),
      titulo: texto('Pie de foto', LIMITES.fotoTitulo, 'Debajo de la foto señalada, en una línea.'),
      subtitulo: texto('Segunda línea', LIMITES.fotoSubtitulo, 'Más chica, debajo del pie: la planta, la técnica o la pieza.'),
    },
    { label: nombre, description: `Archivo: public/img/carrusel/${archivo}` },
  )
}

// Agrupación del menú lateral del panel
export const navegacion = {
  Portada: ['hero', 'recorrido'],
  Secciones: ['proceso', 'fabricacion', 'habilitaciones', 'distribucion', 'contacto'],
  Sitio: ['menu', 'carga', 'seo'],
} satisfies Record<string, (keyof typeof singletons)[]>
