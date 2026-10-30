# Bitácora de la landing

Memoria compartida entre las fases de la landing: cada fase deja acá qué hizo, qué decidió sin preguntar y qué quedó pendiente, para que la siguiente arranque sabiendo dónde está parada. Las entradas se suman al final y no se reescriben.

---

## Fase 1 · Páginas, navegación y hero (2026-10-30)

**Commits:** `6f3ea17` Make the home a single page with an anchor menu · `0ae95a0` Add the ANMAT line and the scroll cue to the hero · y el commit de esta entrada (docs).

**Qué se hizo.**
- Borrados `app/nosotros/`, `components/home/section-index.tsx` (y su lista de secciones en `app/page.tsx`) y `components/home/custom-cases.tsx` (la sección "Casos a medida" de la home: quitarla era trivial). No existía `app/casos-a-medida/`.
- Sin enlaces a `/nosotros`, `/casos-a-medida` ni `/productos`: barra, menú móvil, footer, hero, "Fabricación propia" (salió "Ver catálogo") y el texto del catálogo. El código de `/productos` sigue y compila.
- Fichas: la miga de pan dice "Implantes" y va a `/#recorrido`.
- Menú de anclas en `components/nav-links.ts`: Implantes (`/#recorrido`), Cómo trabajamos (`/#proceso`), Fabricación (`/#fabricacion`), Habilitaciones (`/#habilitaciones`). Funciona desde las fichas (probado: lleva a la home y baja a la sección, con el hueco del header). En la home, PillNav marca con el punto la sección que cruza la mitad de la pantalla (`components/use-active-section.ts`); arriba de todo, ninguna. El footer tiene las mismas anclas en la columna "Sitio".
- `components/anchor-link.tsx`: `scrollToAnchor` y `AnchorLink`. `Link` de Next no vuelve a bajar si el ancla ya es la de la URL (probado); estando en la home, bajamos nosotros. Lo usan la barra (vía `onItemClick` de PillNav), el menú móvil, el footer y `BotonVidrio`. **Cualquier ancla nueva a la home, con `AnchorLink`.** El menú móvil se cierra al tocar un ancla.
- "Plantear un caso" es la única etiqueta de contacto (barra, menú móvil, hero, CTA de contacto, fichas, footer). `contactHref` y `contactLabel` en `nav-links.ts`.
- Hero: "Plantear un caso" (principal) y "Recorrer los implantes" (vidrio, `#recorrido`). Debajo, la línea de habilitaciones con un sello Phosphor (`habilitacionesResumen` en `content/company.ts`) y el aviso "Deslizá para recorrer el cuerpo" con un riel por el que cae un tramo del primario (`.aviso-deslizar` en `globals.css`; quieto con movimiento reducido). Las dos entran con `.intro-in`: `INTRO_AT.credentials` (3000 ms) y `INTRO_AT.scrollCue` (3200 ms); el fin de la entrada pasó a 4000 ms. Sin JS se ven (el CSS solo oculta con `scripting: enabled`).
- Entrada de la barra: se sumó el retraso del cuarto enlace (`nth-child(4)`).
- Entrada en `docs/DECISIONES.md` ("Una sola página con menú de anclas"), que marca como reemplazada la de páginas separadas e índice lateral.

**Decidido sin preguntar.**
- **"Plantear un caso" genérico va con `?motivo=caso`** ("Caso a medida" marcado): la etiqueta habla de un caso clínico. En las fichas va `?producto=<slug>`. Quien venga por otra cosa cambia el motivo en el formulario.
- **El aviso de deslizar no va centrado en escritorio.** Centrado pisa la espalda del busto en cualquier pantalla de proporción menor a ≈ 1,8:1 (probado a 1440×900 y 1280×720). En escritorio va abajo a la izquierda, alineado con el texto, con el riel a la izquierda; en el celular, centrado entre la línea ANMAT y el busto. Si el usuario lo quiere centrado sí o sí, la salida es mover el busto, y eso es tocar el hero.
- **Línea ANMAT con sello y no con filete**, como en el borrador: el filete a la izquierda se repetía con el riel del aviso y parecían dos piezas iguales.
- **`aria-current="location"` en PillNav** (antes `page`): son secciones de una página. Es el único cambio de lógica en el componente de React Bits, anotado en su cabecera.
- La Taste Skill desaconseja avisos de scroll y líneas chicas bajo los botones; mandan AJUSTES.md y el usuario.
- **No toqué `CLAUDE.md`**: este subagente no tiene autorización del usuario para editarlo. Quedó desactualizado (ver pendientes).

**Comprobado en el navegador** (build de producción, Chrome sin interfaz): hero a 1440×900, 1280×720 y 390×844 sin choques; anclas desde una ficha, desde la barra, repetidas y desde el menú móvil; el botón del hero abre el panel con "Caso a medida" marcado; con movimiento reducido todo visible y el riel quieto. Sin errores de consola.

**Pendiente.**
- **Fase 2:** las secciones `#recorrido` y `#proceso` no existen todavía; los enlaces están puestos y no hacen nada hasta entonces (desde una ficha, llevan al inicio de la home). Al crearlas, el punto activo de la barra las toma solo (lee los ids de `nav-links.ts`). `#habilitaciones` (`Statement`) y `#fabricacion` (`OwnManufacturing`) son las secciones viejas, que la fase 2 reemplaza: los ids tienen que mantenerse.
- `components/home/process.tsx` ya estaba sin usar antes de esta fase, y `components/plant-photo.tsx` quedó sin usar al borrar Nosotros. Se dejaron para la fase 2 ("Cómo trabajamos" y "Fabricación").
- En el celular, entre el aviso y la cabeza del busto queda un hueco de unos 80 px (el canvas trae aire arriba del busto). Se podría ajustar con el `-mt` de `Hero3D` en el celular, pero eso es tocar el hero: no lo hice.
- **`CLAUDE.md` desactualizado**, para que lo actualice el usuario o una fase autorizada: nombra el índice lateral (`section-index.tsx`, "Navegación", la entrada de la home y la excepción de vidrio), "Ver casos a medida" como `BotonVidrio`, las etiquetas de CTA ("Ver catálogo", "Ver casos a medida", "Contactar") y las páginas Casos a medida y Nosotros en "Estado".
- La advertencia de `metadataBase` en el build es anterior y sigue (pendiente de `CLAUDE.md`).

---

## Fase 2 · Secciones (2026-10-30)

**Commits:** `e7e0bf7` Add the body tour and the case process sections to the home · `08a4d6c` Rebuild manufacturing, credentials, locations and contact sections · y el commit de esta entrada (docs).

**Qué se hizo.**
- Home en el orden del guion: hero, `#recorrido`, `#proceso`, `#fabricacion`, `#habilitaciones`, `#sedes` y `#contacto`. Todo en Server Components salvo `TourScroll` (hoja cliente del recorrido). Textos del borrador, con los cambios de AJUSTES (sin "Ver el caso", "Ver catálogo" ni "Ver casos a medida"; "Plantear un caso" como único contacto).
- **Recorrido** (`components/home/tour.tsx`, `tour-scroll.tsx`; datos en `content/recorrido.ts`, que pasa a ser la fuente de las seis paradas). Desde `lg`: escena fija (`sticky`, `h-dvh`, a todo el ancho) y las tarjetas pasan por encima, a la derecha (`lg:-mt-[100dvh]`), una por pantalla; el cierre es una séptima "parada". La escena muestra la vista de planificación de la parada activa (fundido corto, `.escena-vista`) y, en el cierre, un mosaico de las seis piezas. Índice anatómico desde 1100 px con riel que se llena (`.indice-riel`), enlaces `AnchorLink` a `#parada-<id>` y `aria-current`. En el celular no hay escena: tarjetas apiladas con su foto. Tarjetas: chip Catálogo/A medida, zona, título, foto de la pieza (lugar de la miniatura), descripción, specs en cifras tabulares y enlaces según AJUSTES (fichas y PDF en las de catálogo; "Plantear un caso" con `?motivo=caso` en las a medida, que cuentan el caso de `customCases.ts` como pie de foto; el intercalar, con `featuredCase.guias`).
- **Cómo trabajamos** (`process.tsx`, reutilizado y reescrito): título, los tres pasos del borrador (reemplazan los de `proceso` en `content/customCases.ts`) y un marco 4:3 con una lámina por paso en escalera. Debajo, "Otros desarrollos a medida": biomodelos, corrección de desvío, estructura porosa y craneoplastía en PMMA (`ejemplosProceso`).
- **Fabricación** (`manufacturing.tsx`, reemplaza `own-manufacturing.tsx`): composición encastrada (título arriba a la izquierda, impresión 3D a la derecha centrada en dos filas, CNC más grande debajo del título), fotos con `PlantPhoto` (ahora acepta atributos `data-*`) y la dirección de la planta.
- **Habilitaciones** (`credentials.tsx`, reemplaza `statement.tsx`): las cuatro de `company.ts`, con el número de cada disposición grande y tabular.
- **Distribución** (`locations.tsx`, sección `#sedes`): las cuatro sedes sobre un eje norte-sur a escala de latitud (22° S a 55° S, marcas cada 5°); la línea se llena con el scroll (`.eje-relleno`, scroll-driven, solo CSS).
- **Contacto** (`contact-cta.tsx`, compartido con las fichas y `/productos`): bloque en el primario, logo en blanco, un botón claro "Plantear un caso" y anillos tenues en CSS (`.cta-cortes`).
- Tokens nuevos: `--shadow-tarjeta` (la de reposo de BOTONES.md, sección 6) y `--shadow-lamina`.
- Borrados `components/home/statement.tsx` y `own-manufacturing.tsx`. `PlantPhoto` y `process.tsx` se reutilizaron. `ProductTile` sigue (lo usa `/productos`).

**Decidido sin preguntar.**
- **Escena a todo el ancho con las tarjetas encima**, y no dos columnas: es lo que pide el guion (implante al 34 % del ancho y tarjeta a la derecha) y deja a la fase 3 un solo contenedor (`[data-escena-3d]`) donde montar el canvas. Las miniaturas tienen su lugar en `[data-miniatura-3d="<id>"]`, de alto fijo.
- **Parada activa con IntersectionObserver** (la que cruza la mitad de la pantalla), sin escuchar el scroll. Es provisorio: la fase 3 lo reemplaza por el progreso del scroll, que además mueve la cámara. Sin JS, la escena queda en la primera parada y todo se lee.
- **Escena provisoria con fotos de planificación**, una por parada, distintas de la foto de la tarjeta (la escena muestra la anatomía; la tarjeta, la pieza).
- **Título "Recorrido por los implantes"** visible en el celular (si no, la sección arranca con una tarjeta suelta) y solo para lectores de pantalla desde `lg`, donde orientan la escena y el índice.
- **Rangos sin guiones**: "Ø10 a 12 mm × 120 a 160 mm" en vez de "Ø10–12 mm × 120–160 mm".
- **Textos de habilitaciones de `company.ts`**, no los recortados del borrador ("Certificado de Buenas Prácticas de Fabricación"; GLN y Sub-GLN).
- **Latitudes en `content/company.ts`** (campo `latitud` de `Sede`, marcado como dato geográfico público, no de la carpeta) para ubicar las sedes en el eje. Se muestran con un decimal.
- **Sin animaciones infinitas ni fondos animados nuevos.** El eje se llena con el scroll y el resto está quieto (el guion: "fuera de esto, nada se mueve solo"). Se evaluó `Waves` de React Bits para el contacto: hoy es WebGL2, y AJUSTES pide CSS o canvas 2D antes que otro contexto WebGL. Quedaron anillos fijos en CSS.
- **El contacto en el azul de marca**, aunque `CLAUDE.md` dice que el hero es el único fondo de color: el guion pide "el logo de Innercare en versión clara", que supone fondo oscuro, y AJUSTES manda. No hay logo claro en `public/`: es el mismo PNG llevado a blanco con `brightness-0 invert`. En el celular el logo no se muestra (la barra ya lo tiene a la vista y el bloque se alargaba).
- **"Cómo trabajamos" sin leyenda ni sticky, y Fabricación sin "Volver a ver"**: los tres dependen de las animaciones de la fase 5. Las láminas del proceso son tres casos distintos (TC de cráneo, plano de resección de escápula, implante poroso), cada una ilustra su paso.
- **Footer sin cambios**: ya tiene marca, dirección y teléfonos.
- Entrada en `docs/DECISIONES.md` ("Secciones de la landing").

**Comprobado en el navegador** (build de producción, Chrome sin interfaz): 1440×900, 390×844 y 360×740 sin desborde horizontal ni errores de consola; la escena cambia con la parada; el índice lleva a "Acetábulo" y la marca; "Plantear un caso" de una tarjeta abre el panel con "Caso a medida". El HTML del servidor trae todo el texto y la primera vista de la escena visible (no pude desactivar JS en el navegador de prueba: lo comprobé leyendo ese HTML). Sin `—` en la página.

**Pendiente.**
- **Fase 3:** montar el canvas en `[data-escena-3d]` (`tour-scroll.tsx`) y las vistas de drei en `[data-miniatura-3d]`; pasar la parada activa al progreso del scroll; en el celular, la tarjeta como hoja inferior con las specs ocultas (hoy van apiladas y completas); el índice anatómico solo entre las paradas 1 y 6 (hoy se oculta en el cierre). Algunas tarjetas (acetábulo) miden más de 900 px en escritorio: si la tarjeta pasa a fija sobre la escena, habrá que acortarla.
- **Fase 5:** la pieza animada en `[data-pieza-proceso]` (con su leyenda y el sticky de 3,4 pantallas) y las dos animaciones en `[data-animacion-fabricacion="sustractiva|aditiva"]`, con "Volver a ver".
- **Confirmar con Innercare** tres specs del borrador que la carpeta no dice tal cual: "Técnica: Impresión 3D" de la craneoplastía (la carpeta lo dice para titanio, no para PMMA) y del acetábulo, y "Desarrollo: A pedido médico" del maxilar (en la carpeta aparece en biomodelos).
- Fotos chicas en la escena (`caso-craneo-3d` 442 px, `caso-acetabular-segmentacion` 371 px, `caso-intercalar-guias` 272 px): se ven blandas. Las reemplaza el 3D.
- `CLAUDE.md` sigue desactualizado (además de lo que anotó la fase 1): "el hero es el único fondo de color" (ahora también el contacto) y la lista de secciones de la home en "Estado".
