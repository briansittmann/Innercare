# Bitácora de la landing

Memoria compartida entre las fases de la landing: cada fase deja acá qué hizo, qué decidió sin preguntar y qué quedó pendiente, para que la siguiente arranque sabiendo dónde está parada. Las entradas se suman al final y no se reescriben.


> **CRITERIO VIGENTE PARA TODAS LAS FASES (usuario, 2026-10-30).** La home tiene que quedar **fiel a `docs/landing/landing-borrador.html`**: composición, orden, lado de cada elemento, elementos y presentación de cada sección, salvo las excepciones de `AJUSTES.md` (hero de `rediseno`, etiquetas de botones, etc.). La mejora visual va en la **ejecución** (calidad, detalle, tokens de marca), **no en reinventar el diseño**. Antes de cambiar una composición del borrador, no lo hagas.
>
> **Animaciones de la fase 5:** al usuario le encanta la de "Mecanizado e impresión 3D" del borrador (la pieza que se va esculpiendo y la que crece capa por capa). La fase 5 tiene que **replicarla fielmente desde el borrador**, mejorando solo la ejecución; lo mismo la pieza que se transforma de "Cómo trabajamos".

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

---

## Fase 2 · Correcciones: vuelta al borrador (2026-10-30)

**Commits:** `7266175` Restore the landing draft composition in every home section · y el commit de esta entrada (docs).

**Cambio de criterio (usuario).** Un verificador pidió más variedad visual y la fase empezó a recomponer secciones (proceso apilado, sedes invertidas, paneles con degradé, filas de ejemplos). El usuario lo rechazó: **la home sigue el borrador** y la mejora va en la ejecución (ver el aviso al principio de este archivo). Esta entrada reemplaza lo que la anterior decía sobre la composición del recorrido, el proceso, la fabricación, las habilitaciones, las sedes, el contacto y el footer.

**Qué quedó, sección por sección (todo con la estructura del borrador).**
- **Recorrido** (`tour.tsx`, `tour-scroll.tsx`): título visible "Recorrido por los implantes" (en el borrador el hero vive en la escena; acá el hero va aparte, así que la sección lleva su título). Escena fija a toda la pantalla con la luz del borrador (`.escenario`: radial azul al 68 % que se funde con el gris, y arriba se funde con el gris bajo el título); índice anatómico a la izquierda desde 1100 px, oculto en el cierre; tarjetas a la derecha (`min(27.5rem, 38vw)`), centradas, una por pantalla; en el celular, hoja inferior sin specs y con miniatura de 104 px. Tarjeta del borrador: chip y zona, título, miniatura 16:10 sobre la luz del borrador, **una sola descripción** (la del borrador, que ya cuenta el caso con los datos de `customCases.ts`; salió el pie de caso repetido y la spec "Guías" agregada), specs con filetes (columna de 118 px) y enlaces de texto en el primario (`.enlace-marca`, el `.tlink` del borrador). Cierre: título, bajada y "Plantear un caso" a la izquierda; el cuerpo a la derecha (por ahora, la captura del busto del hero, `cuerpo-inicio.webp`). Cada parada mide una pantalla (unos 6300 px con el cierre a 900 px de alto): es lo que pide el guion (≈ 8 pantallas con el hero) y lo que va a necesitar la cámara de la fase 3.
- **Lugar reservado del 3D** (digno, no roto): la vista de planificación de cada parada, ubicada donde el guion ancla el implante (34 % del ancho), en escala de grises, mezclada con la luz y con los bordes desvanecidos (`.visor-imagen`). Ubicada con `left`/`top` calculados y no con `translate`: un transform aísla la mezcla y aparecen los rectángulos de las fotos. Miniaturas: la foto de la pieza en color, mezclada con la luz y con bordes desvanecidos (`.mini-parada`, `.mini-imagen`).
- **Cómo trabajamos** (`process.tsx`, `process-scroll.tsx`): sección de 340vh con el contenido fijo; a la izquierda (5fr) título y tres pasos con número tabular en el color del hueso, el activo resaltado y los otros al 45 %; a la derecha (7fr, `min(74vh, 700px)`) la pieza con la leyenda Hueso / Zona a resecar / Implante y guías (tokens `--color-hueso`, `--color-resecar`, `--color-metal`). En el celular, la pieza arriba (38vh) y el texto solo del paso activo. Paso activo con tres marcadores y IntersectionObserver; sin JS, los tres pasos enteros. Mientras no exista la pieza, una vista por paso con `.visor-imagen` (TC de miembros inferiores, plano de resección de escápula, implante poroso). **Salió "Otros desarrollos a medida"**: no está en el borrador (AJUSTES dice que esos casos "pueden" ir, no que deban).
- **Fabricación** (`manufacturing.tsx`): título, bajada y dos tarjetas iguales (foto de planta 4:3 en el lugar de cada animación, título de 26 px, texto). Salieron la dirección de la planta y los rótulos "Manufactura sustractiva/aditiva" (no están en el borrador y además eran eyebrows). **Falta "Volver a ver"**: sin animación no tiene qué repetir; lo suma la fase 5 con las animaciones (`[data-animacion-fabricacion="sustractiva|aditiva"]`).
- **Habilitaciones** (`credentials.tsx`): título y bajada a la izquierda (5fr); a la derecha (7fr), la tabla del borrador (detalle con "ANMAT" o "Inscripción" debajo, en chico, y la referencia a la derecha en el primario y en cifras tabulares; GLN y Sub-GLN en dos líneas). El rótulo de organismo ya no va arriba del título: no cuenta como eyebrow.
- **Distribución** (`locations.tsx`): título y bajada a la izquierda, eje a la derecha, como en el borrador (460 px, Norte y Sur en los extremos, línea que se intensifica en el medio). **Cada sede tiene su punto en su latitud exacta** (escala 22° a 55° S). Como Caseros y Alberti están a 0,4° (≈ 6 px) y Comodoro y Caleta a 0,6°, las etiquetas de cada par se separan y una guía une cada punto con la suya; cada etiqueta muestra su latitud. Salieron las marcas de grados, el panel y el relleno con el scroll.
- **Contacto** (`contact-cta.tsx`): bloque azul con la luz del borrador (`.cta-luz`), título y bajada a la izquierda, logo claro y un único botón a la derecha; el logo, más grande que antes para que su bajada se lea mejor.
- **Footer** (`site-footer.tsx`): el del borrador, en todo el sitio: marca y lema, dirección, teléfonos y ©, sobre un filete. Salieron las columnas de productos y de anclas.
- Fondo único gris (`surface`) en todas las secciones, como el borrador.

**Decidido sin preguntar.**
- Título de la sección del recorrido arriba de la escena y no adentro: el borrador no lo tiene (lo hace el hero) y así no tapa la escena.
- Tarjetas opacas y no de vidrio: `CLAUDE.md` reserva el vidrio a la navegación.
- Lo que no tenía función sin las animaciones (pieza que se transforma, "Volver a ver", halo del implante, ensamble de partículas) queda para las fases 3 y 5, con su lugar reservado.

**Comprobado en el navegador** (build de producción): 1440×900, 390×844 y 360×740 sin desborde ni errores de consola; las vistas de la escena se mezclan con la luz sin rectángulos; los puntos de las sedes caen en su latitud.

**Pendiente.**
- **Fase 3:** canvas en `[data-escena-3d]` (toda la escena fija), miniaturas en `[data-miniatura-3d]`, tarjetas fundidas por peso y halo según el guion (hoy pasan con el scroll), cuerpo entero en el cierre (hoy la captura del busto).
- **Fase 5:** replicar fielmente las animaciones del borrador en `[data-pieza-proceso]` y `[data-animacion-fabricacion]`, con "Volver a ver".
- Los puntos de Caseros y Alberti quedan casi encimados (6 px a la escala del borrador): se leen como dos por el borde, pero si molesta, la salida es agrandar el eje.
- Siguen los pendientes de la entrada anterior: confirmar specs con Innercare, fotos chicas, `CLAUDE.md` desactualizado (ahora además: footer nuevo y fondos).

---

## Fase 3 · Recorrido 3D (2026-10-30)

**Commits:** `1579df3` Optimize the full body model for the home tour · `e3f5cbf` Drive the home tour with a scroll-bound 3D body scene · `7c89ecf` Draw the tour implants as bright titanium over the glass body · y el commit de esta entrada (glow del implante activo y docs).

**Qué se hizo.**
- **Modelo:** `3d/scripts/modelos.sh` optimiza también `3d/salida/anatomia.glb` a `public/modelos/cuerpo.glb`, con los mismos parámetros (meshopt, sin unir mallas). Pesa 918 KB (695 KB transferidos con gzip) y tiene unos 177 000 triángulos: piel, 25 mallas de hueso y el recorte de la craneoplastía. Dentro del presupuesto de `ARQUITECTURA_MODELO_3D.md` (≤ 2 MB). No hizo falta volver a correr Blender: `anatomia.glb` ya existía.
- **Estructura** (`components/home/tour.tsx`, `tour-scroll.tsx`): se reestructuró como el borrador. `#recorrido` mide ocho pantallas (`.recorrido`, `--tramos`) con una escena fija (`.recorrido-escena`) que contiene todo: el canvas, el lugar reservado, el texto de entrada (k = 0, el título de la sección con una bajada contada desde `content/recorrido.ts`), el índice anatómico, las seis tarjetas apiladas en una celda (`.recorrido-riel`) y el cierre (k = 7). Salió el título suelto arriba de la escena y el IntersectionObserver de la parada activa: todo sale del progreso del scroll.
- **Guion** (`components/recorrido-3d/camara.ts`, sin three): `updateTour` y `camFor` del borrador pasados a 3D. `seg = p × 7`; `e = smoothstep((u − 0,22) / 0,56)`; alto visible en escala logarítmica; pesos `w = 1 − clamp((|seg − i| − 0,22) / 0,24)` con ±22 px; implantes al 62 % en la entrada, 26 % inactivos, 100 % el activo y 95 % en el cierre; entrada que se va entre 0 y 0,35, cierre entre 6,55 y 6,85 e índice entre 0,5 y 6,5 (desde 1100 px). Escritorio: cuerpo al 68 % en entrada y cierre, implante al 34 % en las paradas. Celular (< 820 px): cuerpo centrado y abajo, implante al 25 % del alto y tarjeta como hoja inferior sin specs. Los `vis` del borrador están pasados a metros (una unidad del borrador ≈ 1,8 mm). Cada parada tiene además un azimut y una elevación (el 3D deja girar alrededor del cuerpo): la cabeza de tres cuartos y desde arriba, para ver la craneoplastía.
- **Progreso** (`tour-scroll.tsx`): se lee de la posición del contenedor en cada scroll y se amortigua apenas (exponencial, λ = 11) para que la rueda no dé saltos; un solo objeto compartido (`components/recorrido-3d/estado.ts`) lo pasa a la escena. El HTML (opacidad y desplazamiento de tarjetas, entrada, cierre, índice) se actualiza por estilos, sin re-renderizar React; solo cambian por estado la marca del índice y la vista del lugar reservado.
- **Escena** (`components/recorrido-3d/escena.tsx`): un canvas, cargado con `next/dynamic` sin SSR cuando el recorrido está a una pantalla (`recorrido-3d.tsx`, con `requestIdleCallback`), con detección de WebGL y límite de errores. Reutiliza `Glass`, `Bone` y `useGlassBuffer` del hero (sin tocarlos) y el mismo estudio de luz. El vidrio refracta una textura con el mismo fondo que `.escenario`. La cámara usa `setViewOffset` (como el hero) para dejar el objetivo en el ancla sin cambiar la perspectiva. `frameloop="demand"`: dibuja solo cuando cambia el scroll; fuera de pantalla, `never`.
- **Implantes**: en su propia capa, dibujados al final con la profundidad limpia, encima del vidrio. Refractados se veían azul oscuro, casi negros; ahora se leen como titanio (pulido en CNC, mate en impresión 3D) y son lo más nítido de la escena. El activo suma un brillo azul bajo. El hueso sigue adentro del vidrio, tenue (opacidad 0,34).
- **Halo** (`.recorrido-halo`): anillo HTML que crece de 0,16 a 0,38 del tramo visible mientras se apaga (1,43 s), más un resplandor quieto. La escena proyecta el objetivo de la parada y escribe `--halo-x|y|r|o`; también mueve la luz azul que acompaña al cuerpo (`.recorrido-luz`, `--luz-x|y`).
- **Lugar reservado**: las vistas de planificación de la fase 2 siguen (sin WebGL, mientras carga o si la escena falla) y se van con un fundido cuando el cuerpo está listo (`data-listo`). En la entrada y el cierre, la captura del busto.
- **Anclas**: `#parada-<id>` son marcas a k pantallas del principio del contenedor (más 74 px por el `scroll-padding-top`), así el índice lleva a la toma exacta (probado: Acetábulo cae en seg 4,002). `#recorrido` tiene `scroll-margin-top: −72px`: "Recorrer los implantes" y el menú dejan la escena entera, en seg 0.
- **Sin JS** (`scripting: none`): la escena deja de ser fija y se lee en orden título, seis tarjetas y cierre (probado con JS apagado). Con JS, tarjetas, cierre e índice se ocultan por CSS bajo `scripting: enabled`.
- **Movimiento reducido:** sin amortiguación ni interpolación; cada parada muestra su toma y su tarjeta enteras y cambia en la mitad del tramo; sin halo ni desplazamiento de tarjetas.

**Contrato de los implantes (para la fase 4).** `components/recorrido-3d/implantes.ts` es el único archivo que dice de dónde sale cada pieza y dónde va. Cada entrada tiene `parada`, `fuente`, `posicion`, `rotacion`, `escala` y `acabado`. `fuente` es `{ tipo: 'glb', url, malla }` (la malla con ese nombre dentro del .glb; se respeta la transformación del nodo y encima va la de la entrada) o `{ tipo: 'primitiva', crear }`. La craneoplastía ya usa la real (`implantes.glb`, `implante_craneoplastia`); las otras cinco son primitivas con proporciones de la ficha o de la foto, ubicadas sobre puntos medidos en el esqueleto (cabezas femoral y humeral, canal del fémur). Para reemplazar una: exportarla como `implante_<parada>` en `implantes.glb` (`npm run modelos`), cambiar su `fuente` y poner la transformación en cero. La cámara (`camara.ts`), la escena y las tarjetas no dependen de la forma.

**Decidido sin preguntar.**
- **Lados de `ARQUITECTURA_MODELO_3D.md`, no los del borrador.** El borrador 2D dibuja el acetábulo y el intercalar a la izquierda de la figura y la endoprótesis a la derecha; la arquitectura (con sus restricciones: el intercalar y el acetábulo conviven, la endoprótesis ocupa la diáfisis del otro lado) los pone al revés, y la fase 4 va a generar las piezas con ese documento. El encuadre de cada parada es el del borrador igual (el implante al 34 %).
- **Implantes encima del vidrio, sin refracción.** Es menos "físico", pero en el borrador el implante activo es lo más nítido y brillante de la escena; refractado quedaba azul oscuro. Se probó también quitar la profundidad del vidrio: el hueso pasaba a dibujarse encima, blanco y fuerte, y competía con los implantes.
- **Azimut por parada.** El borrador es de frente (2D); en 3D cada parada mira el implante desde donde mejor se ve. La composición (anclas, escalas, pausas) es la del borrador.
- **Texto de la entrada:** "Seis implantes en su lugar, de la cabeza al fémur: cuatro a medida y dos de catálogo." Los números salen de `content/recorrido.ts`. En el borrador ahí va el hero; acá el hero es aparte.
- **Sin `PerformanceMonitor`:** con dibujo a demanda los cuadros llegan solo al hacer scroll y mediría caídas falsas. Resolución fija: hasta 1,5x; en el celular, vidrio en calidad baja (4 muestras en escritorio, 3 en el celular: se ve igual).
- **Un canvas activo a la vez, en la práctica:** el del hero se detiene fuera de pantalla (ya lo hacía) y el del recorrido no dibuja si no hay scroll. Mientras se pasa del hero al recorrido se ven los dos, pero el del recorrido dibuja solo los cuadros del scroll.
- **Miniaturas (fase 5):** sin tocar; siguen las fotos en `[data-miniatura-3d]`, con el alto acotado (`max-h: 24dvh`) en escritorio para que la tarjeta de acetábulo entre en 720 px de alto.
- Breakpoint de la tarjeta móvil a 820 px (el del borrador), no `md` (768 px).

**Comprobado en el navegador** (build de producción, Chrome real con GPU del M1, sin interfaz): 1440 × 900 y 390 × 844, las ocho tomas, tramos intermedios (1,5 y 2,5), con y sin movimiento reducido, sin JS, anclas del índice y del hero. Comparado con el borrador abierto como archivo: misma composición en la entrada, las paradas y el cierre. Sin errores de consola. Rendimiento, recorriendo las ocho pantallas en 12 s: 60 cuadros por segundo con el tope (p95 16,7 ms) a 1440 × 900 y dpr 1,5 (canvas de 2160 × 1350); sin tope, entre 40 y 87 según la máquina (ruidoso, como avisa la memoria del proyecto).

**Pendiente.**
- **Medir en un celular real** (no se pudo acá): `ARQUITECTURA_MODELO_3D.md`, "Siguiente". Si no llega a 60, bajar `DPR_CELULAR` en `recorrido-3d.tsx`.
- **Fase 4:** los cinco implantes reales, cambiando `implantes.ts` según el contrato de arriba. Las primitivas no recortan hueso (la endoprótesis y el intercalar conviven con el fémur entero); `implantes.py` tendrá que recortar los huesos que reemplazan, como hizo con el cráneo.
- **Fase 5:** las miniaturas con partículas en `[data-miniatura-3d]` (sin cambios de lugar). El guion de su ensamble (`A = smoothstep(1 − (|seg − i| − 0,06) / 0,42)`) se puede sumar a `camara.ts` y leer `estadoRecorrido.seg`.
- Imágenes de respaldo por parada (`public/img/cuerpo-<parada>.webp`, como dice la arquitectura): hoy el respaldo son las vistas de planificación de la fase 2 y la captura del busto.
- Sin JS, las vistas de la escena no se ven (solo las tarjetas con su foto) y el fondo `.escenario` se estira a todo el alto: se lee bien, pero se podría pulir.
- `CLAUDE.md` sigue desactualizado (fases 1 y 2) y ahora además: el recorrido 3D en "Dirección visual" y "Estado", y `cuerpo.glb` en `public/modelos/`.

---

## Fase 3 · Correcciones del verificador (2026-10-30)

**Commits:** `4ac4a3b` Defer the tour 3D until the hero intro ends and draw only on progress changes · `9b10419` Give the tour body a light rim, a glowing active implant and a full-body fallback · y el commit de esta entrada (docs).

**Qué se corrigió, en el orden del verificador.**
1. **Rendimiento en el paso del hero al recorrido.** El recorrido pedía un cuadro en cada evento de scroll aunque el progreso no cambiara: mientras entra en pantalla (seg = 0) dibujaba el cuerpo entero junto con el busto y las fibras. Ahora solo dibuja si cambia el progreso (o el tamaño). Mientras entra, anima solo el hero; con la escena fija, el hero ya salió de pantalla y se detiene solo (su IntersectionObserver). Medido en el build de producción (Chrome con GPU del M1, 1440 × 900, dpr 2, bajando del hero al recorrido en 4 s): **antes 42,6 fps, ahora 52,5**. Bloqueando `cuerpo.glb`, 53,3, y bajando solo dentro del hero, 49,5: lo que queda es el costo del hero mismo (busto y fibras), que esta fase no toca. En el recorrido y quieto en una parada, 60. En 390 × 844, 60 en todo el paso.
2. **Carga diferida de verdad.** Ni `cuerpo.glb` ni el contexto WebGL se piden hasta que la entrada del hero termina (`useIntroPhase() === 'done'`) **y** el recorrido asoma un 5 % de la pantalla. Con margen 0, el borde del recorrido, que toca el de la pantalla al cargar, ya contaba como visible. Medido: sin scroll, solo se piden `cabeza.glb` e `implantes.glb`.
3. **Índice.** El riel se llena de forma continua con el progreso (de seg 1 a 6; JS escribe `--avance`, sin transición) en un azul tenue, y la parada activa lleva la barra de 2 px del borrador junto a su nombre (`.indice-enlace[aria-current]`). Ya no vuelve a 0 entre paradas y Cráneo tiene su marca.
4. **El activo se destaca.** Resplandor azul detrás del implante activo (`Resplandor`: un sprite con degradé radial, `#3d6fe0`, opacidad 0,85 × peso, del tamaño de la pieza), como el `shadowBlur` del borrador. El anillo pasa a 2 px con sombra azul. Emisivo a 0,2.
5. **Vecinos.** Los inactivos cercanos al activo se apagan según su distancia (hasta un 25 % de su opacidad de base): en Acetábulo, el clavo del intercalar y la endoprótesis ya no cruzan el halo.
6. **Vidrio.** Vidrio propio del recorrido (el mismo `MeshTransmissionMaterial` del busto, más claro, con más atenuación azul en lo grueso y más reflejo) y un borde de luz fresnel blanco y celeste, sumado en una pasada aparte. La luz azul que sigue al cuerpo, más fuerte. El cuerpo se lee luminoso y con contorno sobre el fondo claro.
7. **Titanio.** Luz propia de los implantes, en su capa (cielo blanco y dos luces direccionales; el vidrio y el hueso no la ven), metalness 0,94 (CNC) y 0,88 (impresión 3D), colores más claros y más reflejo del estudio. Brilla en la entrada, el cierre y las paradas.
8. **Menores.**
   - El canvas se desvanece bajo la barra de navegación (máscara de 1 a 5,5 rem): la barra de vidrio ya no refracta formas raras.
   - Sin WebGL, la entrada y el cierre muestran el cuerpo entero: `public/img/cuerpo-entero.webp` (31 KB, captura del 3D en la toma de la entrada, fondo transparente, 440 × 900 a 1,5x), al alto de la escena y centrada al 68 %; en el celular, a dos tercios y con el centro al 74 % del alto.
   - Desde 1100 px, el canvas también se desvanece hacia el borde izquierdo (1,5 a 15 rem): el cuerpo ya no pasa por encima del índice.
   - Vaivén del borrador: ±1,5° de azimut, `sin(t × 0,5)`, solo con la escena fija en pantalla y sin movimiento reducido, a 30 cuadros por segundo. Con el hero fuera de pantalla no compite con él: 60 fps quieto en una parada.

**Decidido sin preguntar.**
- **Carga: lo más conservador.** Entrada terminada y además el recorrido a la vista, no en un momento ocioso después de la entrada. Si alguien baja muy rápido, ve un instante el lugar reservado (ahora el cuerpo entero) y el 3D entra con el fundido.
- **El paso no llega a 60 en escritorio** porque el hero solo, al hacer scroll, ya está en unos 50 (medido igual con el recorrido bloqueado). Llevarlo a 60 es tocar el hero (por ejemplo, bajar la resolución de las fibras o del busto mientras se hace scroll), y esta fase no lo toca.
- **Vidrio propio del recorrido**, en lugar del `Glass` del hero: el del busto, sobre el fondo claro de la escena y con el cuerpo más chico, quedaba azul sobre azul. Los mismos parámetros de base, solo más claro y con más profundidad, más el borde de luz.
- **El borde de luz va sin prueba de profundidad**: suma también donde un brazo pasa delante del torso, como pasaría en vidrio. Es más barato que una pasada de profundidad aparte.
- **Luces solo para los implantes**, por capa: así el vidrio y el hueso quedan con el lenguaje del busto.

**Pendiente.**
- 60 fps en escritorio en el paso del hero al recorrido: depende del hero (ver arriba).
- Medir en un celular real (sigue).
- La captura `cuerpo-entero.webp` hay que rehacerla si cambian el cuerpo, la cámara de la entrada o el material: `ARQUITECTURA_MODELO_3D.md`, sección 3, explica el procedimiento del busto. Para esta se ocultó todo menos el canvas, con fondos transparentes, en la toma de la entrada a 1440 × 900 y dpr 1,5, recortada centrada al 68 %.

---

## Fase 4 · Implantes en Blender (2026-10-30)

**Commits:** `f83a012` Generate the maxillary reconstruction for the body tour · `59091e8` Generate the reverse shoulder prosthesis for the body tour · `df667c7` Generate the trabecular acetabular reconstruction for the body tour · `a9aad56` Generate the modular femoral endoprosthesis for the body tour · `6ef57ce` Generate the femoral intercalar implant with its nail for the body tour · `0f2fb67` Replace the tour primitives with the generated implant models · y el commit de esta entrada (docs).

**Qué se hizo.**
- `3d/scripts/implantes.py` genera los cinco implantes que faltaban, en el orden del recorrido, sobre el esqueleto ajustado y con el mismo enfoque que la craneoplastía (partes paramétricas, apoyadas sobre el hueso con rayos y suavizado), y recorta los huesos que reemplazan. Ayudas nuevas en el mismo archivo: sólidos de revolución (con estrías), tornillos con rosca, placas caladas de eslabones, celosías de poros hexagonales (`perforar`, que hace crecer la red de hexágonos desde una semilla), tubos por una curva, envolturas sobre el hueso (`Envoltura`) y cortes por plano o por tramo con la tapa.
  - **Maxilar** (titanio impreso, `implante_maxilar`): estructura subperióstica de eslabones calados sobre la cara vestibular del maxilar derecho, con un reticulado triangulado hasta el pilar cigomático, un puntal junto a la apertura nasal, la Y bajo la nariz y tres postes donde estaban el incisivo central, el canino y el segundo premolar (foto `caso-anclaje-dentario.jpg`). Se borran esos cinco dientes (central a segundo premolar) y el reborde alveolar debajo. 3 800 triángulos.
  - **Hombro reverso** (CNC, `implante_hombro`): glenosfera sobre base de respaldo poroso con perno y tornillo central, copa con el escalón del inserto, cuello a 135°, cuerpo con el tornillo de fijación hexagonal y la unión con el suplemento, y vástago estriado en el canal (fotos `hombro-implante.jpg` y `hombro-planificacion-implante.jpg`). Se borra el húmero por encima del cuerpo (unos 9 cm) y la cara de la glenoides bajo la base. 5 100 triángulos.
  - **Acetábulo** (titanio trabecular, `implante_acetabulo`): copa de cara interna maciza y capa externa calada en hexágonos, borde macizo, ala superior con dos agujeros y tornillos, y ocho tornillos en abanico de 25 a 55 mm, los largos de la imagen del caso (`caso-acetabular-tornillos.jpg`, `caso-porosa-implante.jpg`). Va alrededor de la cabeza femoral derecha, que se conserva. Se borra el acetábulo bajo la copa. 14 700 triángulos.
  - **Endoprótesis de fémur** (CNC, `implante_femur`): las piezas de la ficha en PDF: cabeza sobre el cono morse 12-14, cuerpo principal de 60 mm a 135° con alas para sutura (afuera arriba, adentro abajo) y tornillo de cierre, suplemento de 60 mm y vástago cementado de Ø11 × 140 mm estriado, en el fémur izquierdo. Se borra el fémur por encima del suplemento. 5 500 triángulos.
  - **Intercalar de fémur** (titanio impreso, `implante_intercalar`): segmento de 130 mm con la forma del hueso que reemplaza (radio medido con rayos), pared calada en hexágonos con bandas macizas en los extremos, cuatro alojamientos oblicuos con tornillos de Ø3,5 mm y el clavo endomedular anterógrado de Ø10 × 360 mm que sigue el canal desde el trocánter (`featuredCase`, fotos `caso-intercalar-implante.jpg` y `caso-intercalar-guias.jpg`). Se borra ese tramo de la diáfisis derecha y se tapan los dos cortes. 16 000 triángulos.
- **Archivos.** `implantes.py` exporta además `implantes-recorrido.glb` (los cinco) y `cuerpo.glb` (piel y esqueleto con los seis recortes); `modelos.sh` los optimiza a `public/modelos/`. `implantes-recorrido.glb` pesa 304 KB (188 KB con gzip; unos 46 000 triángulos) y `cuerpo.glb`, 902 KB (699 KB con gzip). Con los implantes, el recorrido dibuja unos 228 000 triángulos.
- **`components/recorrido-3d/implantes.ts`**: los seis apuntan a modelos (`{ tipo: 'glb' }`, transformación en cero); salieron las primitivas y sus imports de three. El contrato y el tipo `primitiva` quedan. No hizo falta tocar la escena ni `camara.ts`: los objetivos de cada toma ya encuadran las piezas reales.
- **`3d/scripts/preview.py`**: `--extra` (otro modelo) y `--zona` (primeros planos de una zona desde cuatro lados, implantes en azul, sin la piel). Cada vista sale dos veces: con el hueso tapando y con los implantes encima (`-encima`), como los dibuja el recorrido.
- Docs: `3d/README.md` (scripts y comando de control) y `docs/ARQUITECTURA_MODELO_3D.md` (estado, nombres y archivos).

**Renders de control (para el verificador).** En `3d/salida/preview/implantes/` (fuera de git): `cuerpo-<zona>-<vista>.png` y `-encima.png` para `maxilar`, `hombro`, `acetabulo`, `femur`, `intercalar` e `intercalar-cerca` (vistas `frente`, `costado`, `3-4`, `atras`). Las capturas del navegador, en `3d/salida/preview/implantes/navegador/` (`escritorio-*` a 1440 × 900 y `movil-*` a 390 × 844, de la entrada al cierre).

**Comprobado en el navegador** (build de producción en el puerto 3100, Chrome sin interfaz con la GPU del M1, `ANGLE Metal Renderer: Apple M1`): las seis paradas muestran el implante real en su lugar, con el titanio pulido o mate y el resplandor del activo, en escritorio y en el celular; la entrada y el cierre muestran los seis. Sin errores ni avisos de consola y sin pedidos fallidos. `cabeza.glb` e `implantes.glb` salen idénticos byte a byte a los anteriores (el hero no cambia). Build, lint y `tsc` sin errores.

**Decidido sin preguntar.**
- **Archivos aparte para el recorrido.** El hero carga todas las mallas de `implantes.glb` y `cabeza.py` parte de `anatomia.glb`: sumar ahí los implantes nuevos habría puesto el hombro flotando junto al busto, quitado dientes en el hero y multiplicado su descarga. Por eso `implantes.glb` y `anatomia.glb` siguen como estaban y el recorrido usa `implantes-recorrido.glb` y `cuerpo.glb`. La craneoplastía del recorrido sigue saliendo de `implantes.glb` (ya está en caché por el hero).
- **Nombres por parada** (`implante_acetabulo`, `implante_femur`), como pide el contrato de `implantes.ts`, y no los de la lista vieja de la arquitectura (`implante_acetabular`, `implante_endoprotesis`); la arquitectura quedó actualizada.
- **Un acabado por pieza**, como admite el contrato: la base porosa de la glenosfera y el inserto del hombro van en titanio pulido (no hay polietileno blanco). El inserto se lee por el escalón de la copa.
- **Medidas estimadas** (no están en `content/`; no se publican): glenosfera de 36 mm, copa de 41 mm, cuello del hombro a 135°, cuerpo del hombro de Ø19 mm; cabeza femoral de Ø42 mm (llena el acetábulo del atlas, como en una hemiartroplastia), cuerpo de la endoprótesis de Ø22 mm; copa acetabular de Ø58 mm con 45° de inclinación; segmento intercalar de 130 mm; postes del maxilar de Ø3,6 × 9 mm. Los largos, el ángulo de 135°, el vástago de Ø11 × 140, el cono 12-14, el clavo de Ø10 × 360 y los tornillos de Ø3,5 salen de la ficha y de `customCases.ts`. El suplemento de la endoprótesis es de 60 mm (la ficha da de 40 a 90).
- **Maxilar del lado derecho**, no centrado como dice la tabla de la arquitectura: así es la foto del caso (la estructura y los postes de un lado, con el resto de los dientes) y la parada mira desde la derecha.
- **Celosía en geometría, sin `alphaMap`**: el contrato solo tiene el acabado y la geometría se lee mejor con el implante dibujado encima. Celdas de unos 7 mm en la copa y 4 mm en el intercalar, que a la escala del recorrido se ven como textura sin hacer ruido.
- **Tornillos acetabulares que asoman del lado de adentro de la pelvis:** el hueso del atlas es fino y los largos de la imagen del caso lo atraviesan. En el recorrido no se nota (los implantes van encima del hueso) y el abanico es lo que reconoce el caso.
- **Ala acetabular plana**, en el plano del borde y con los agujeros hacia la abertura (como en la imagen del caso). Apoyada sobre el ilíaco con rayos, se enroscaba sobre el reborde.
- **Presupuesto:** unos 228 000 triángulos en el recorrido, algo arriba de los 200 000 de partida de la arquitectura (que dice que son objetivos a ajustar). Los archivos están dentro del presupuesto (≤ 1 MB y ≤ 2 MB). Lo más pesado son las dos celosías (copa e intercalar, 30 000 entre las dos): si hiciera falta, se agranda la celda.

**Pendiente.**
- **Medir el recorrido en un celular real** con los implantes nuevos (sigue de la fase 3).
- **CAD de Innercare:** reemplaza a estos respetando el nombre de malla (`implantes.ts`, contrato).
- **Confirmar con Innercare** las medidas estimadas de arriba, sobre todo las del hombro (la ficha no trae ninguna).
- La captura de respaldo `public/img/cuerpo-entero.webp` muestra las primitivas viejas: rehacerla con el procedimiento de la fase 3 (entrada a 1440 × 900, dpr 1,5).
- Si se quiere el inserto del hombro en blanco o la base de la glenosfera mate, el contrato tendría que admitir más de un acabado por pieza (submallas `_pulido` / `_trabecular`).
- `CLAUDE.md` sigue desactualizado (fases anteriores) y ahora además: `implantes-recorrido.glb` y `cuerpo.glb` en `public/modelos/`.

---

## Fase 4 · Correcciones del verificador (2026-10-30)

**Commits:** `ae2d21d` Keep the acetabular screws inside the pelvis and perforate the cup face · `1fbd558` Correct the intercalar, endoprosthesis, shoulder and maxillary implants · `14f5c0a` Frame the maxillary stop closer so the implant reads · y el commit de esta entrada (respaldo `cuerpo-entero.webp` y docs).

**Qué se corrigió, en el orden del verificador.**
1. **Tornillos acetabulares dentro del hueso.** Ya no hay ángulos ni largos fijos: para cada tornillo se busca, en un cono alrededor de su dirección, la que entra más largo sin salir del coxal (puntos cada 2 mm, del lado de adentro de la superficie más cercana con 0,8 mm de margen), de 20 a 55 mm, separados al menos 20° (`buscar_tornillo`, `dentro_del_hueso`). Quedaron ocho en la copa (cuatro hacia el ilíaco y cuatro hacia abajo, al isquion y al pubis, como en la imagen del caso) y uno en el ala. Las vistas `atras` y `frente` ya no muestran tornillos sueltos.
2. **Clavo al ras del trocánter.** La entrada sale de un rayo desde el canal hacia arriba, donde el clavo sale del hueso (3 mm adentro): 0,887 m. Ya no asoma.
3. **Maxilar legible.** La toma de la parada en `camara.ts` se cerró (`vis` de 150 a 82 unidades, objetivo centrado en la pieza, azimut −0,42): pasó de cerca del 8 % a cerca del 14 % del ancho de la escena. La placa tiene más cuerpo (eslabones de 2,5 mm de radio y 1,8 mm de espesor, barras de 1,9 mm) y postes de Ø4,2 mm.
4. **Acetábulo como en la foto.** Además del abanico hacia abajo (punto 1), la cara interna es una media esfera calada con agujeros chicos, sobre la capa trabecular de poros grandes: ya no es lisa ni espejada. El ala se inclina hasta apoyar en el ilíaco.
5. **Intercalar con la forma del caso.** Se ensancha en los extremos que apoyan en el hueso (16 % el distal, hacia la metáfisis; 8 % el proximal), tiene zonas macizas (cuatro filas en cada extremo y una banda por delante y afuera, la de los alojamientos) y porosas, y el clavo tiene una leve curva anterior (3 mm) y agujeros de bloqueo (uno oblongo y uno redondo arriba, dos abajo). La posición en la diáfisis no cambió.
6. **Sin rendijas.** El tramo de fémur que se borra es 3 mm más corto de cada lado (el hueso queda adentro de los extremos del intercalar) y el fémur de la endoprótesis se corta 2 mm adentro del suplemento.
7. **Maxilar:** la punta del borde lateral era el puntal del pilar cigomático apoyado fuera del hueso; el puntal y el final de la cadena se corrieron hacia adelante (de 42 a 35 mm de arco) y la Y bajo la nariz bajó para que no caiga en la apertura nasal.
8. **Hombro:** vástago más grueso (radio de 7,2 a 5,6 mm a lo largo, antes 5,6 a 4,2), en la proporción de la foto.

**Respaldo sin WebGL.** `public/img/cuerpo-entero.webp` se volvió a capturar con los implantes reales (mismo procedimiento que la fase 3: toma de la entrada a 1440 × 900 y dpr 1,5, todo oculto salvo el canvas, fondo transparente, 440 × 900 centrado al 68 %; `cwebp -q 82 -alpha_q 90`, 32 KB). Comprobado con Chrome sin WebGL: la entrada muestra el cuerpo con los seis implantes.

**Peso y triángulos.** `implantes-recorrido.glb`: 313 KB (195 KB con gzip), unos 40 900 triángulos (antes 46 000): maxilar 3 600, hombro 5 100, acetábulo 12 400, endoprótesis 5 500, intercalar 14 300. `cuerpo.glb`: 902 KB. El recorrido dibuja unos 222 000 triángulos, un 11 % arriba del objetivo de partida (antes un 14 %). Para bajarlo hay que agrandar la celda de las dos celosías o simplificar más el esqueleto. `cabeza.glb` e `implantes.glb` (hero) siguen idénticos byte a byte.

**Comprobado.** Renders de control nuevos en `3d/salida/preview/implantes/` (zonas `maxilar`, `hombro`, `acetabulo`, `femur`, `femur-corte`, `intercalar`, `intercalar-cerca`, `clavo` y `trocanter`, cada una con su `-encima`) y capturas en `navegador/` (`escritorio-*` con WebGL y `sin-*` sin WebGL). Build de producción en el puerto 3100, Chrome con la GPU del M1: las seis paradas bien, sin errores de consola. Build, lint y `tsc` sin errores.

**Decidido sin preguntar.**
- **Tocar `camara.ts`** (solo la toma del maxilar): el pedido era cerrar el encuadre de esa parada, y la toma vive ahí, no en `implantes.ts`.
- **Agujeros del clavo como prismas de estadio de una pieza:** con dos cilindros superpuestos para el oblongo, el booleano exacto borraba el clavo entero (quedaba en 0 caras). El script imprime las caras del clavo antes y después para detectarlo.
- **Un solo tornillo en el ala:** para el segundo no hay hueso en ningún ángulo razonable desde ese agujero (el ilíaco del atlas es fino ahí). El agujero queda libre.

**Pendiente.**
- El optimizador de imágenes del `next dev` del usuario puede seguir sirviendo el `cuerpo-entero.webp` viejo hasta borrar `.next/dev/cache/images`. No lo borré porque la consigna era no tocar `.next/dev`.
- El ala acetabular todavía queda un poco separada del hueso en la vista de frente: apoya de canto y no copia la curva del ilíaco.
- Sigue lo de la entrada anterior: celular real, CAD y medidas con Innercare, y `CLAUDE.md` desactualizado.

---

## Fase 5 · Partículas y animaciones (2026-10-30)

**Commits:** `3391061` Animate the manufacturing cards as in the landing draft · `ac58494` Morph the case process piece with the section scroll · `d6e9fc2` Assemble the tour card thumbnails from implant particles · y el commit de esta entrada (docs).

**Qué se hizo.**
- **Fabricación** (`components/animaciones/fabricacion.ts`, `components/home/animacion-fabricacion.tsx`): las dos animaciones del borrador (`drawFab`) con sus reglas y tiempos: arrancan una vez al 45 % en pantalla, duran 3,8 s, la herramienta trabaja hasta el 80 % y la pieza en metal aparece desde el 84 %. CNC: un bloque de partículas que la fresa barre de arriba abajo; el sobrante salta y cae, la pieza queda en azul y la fila recién cortada se ilumina. Impresión 3D: la pieza crece por capas sobre la plataforma, con las partículas que se asientan bajo la línea. Más detalle que el borrador: la endoprótesis tiene cabeza, cono morse, cuerpo con alas para sutura y tornillo de cierre, la unión con el suplemento y el vástago estriado; la copa acetabular, capa porosa en tres filas, cara interna maciza con agujeros, reborde y ala con dos agujeros; el doble de partículas; la fresa y el láser recorren la línea (el láser solo sobre el tramo de pieza de esa capa); el metal tiene degradés de cilindro y esfera y un reflejo lo cruza al aparecer. "Volver a ver" (`.boton .boton-claro` con ícono). Fuera de pantalla no dibuja; al terminar se detiene. Las fotos de planta quedan solo sin JS.
- **Cómo trabajamos** (`components/animaciones/proceso.ts`, `process-scroll.tsx`): la pieza del borrador (`drawProcess`), atada al scroll de la sección con los mismos tramos (dos, con pausa de 0,25 en cada punta) y el mismo cambio de paso (0,62 y 1,62). Es una nube 3D (6 400 partículas en escritorio, 3 800 en el celular) proyectada en canvas 2D, con profundidad y el vaivén del borrador como giro real: (1) 26 cortes axiales de TC con cortical y canal medular, y hueso esponjoso en los extremos; (2) los cortes se juntan en el hueso, con el tramo a resecar en su color y los dos planos de corte punteados; (3) los extremos quedan quietos y el tramo resecado pasa a ser el implante intercalar (collares macizos y celosía en diagonal), con el clavo endomedular y las dos guías de resección (media caña, ranura en el borde y dos vainas para clavijas). El progreso del scroll reemplaza al IntersectionObserver de los pasos. Sin JS, la imagen del primer paso.
- **Miniaturas del recorrido** (`components/recorrido-3d/miniaturas.tsx`): el ensamble del guion con partículas de `MeshSurfaceSampler` sobre los seis implantes reales (2 400 por pieza; 1 500 en el celular). La nube sale con retraso por partícula (0 a 0,4), cada una viaja el 60 % del ensamble, las de contorno van más grandes, y pasado el 82 % aparece el modelo sólido con el titanio del recorrido; las partículas quedan tenues encima y la pieza se mece (±0,5 rad). Cada miniatura mira la pieza desde la toma de su parada; las largas (hombro, fémur, intercalar) van acostadas en miniaturas apaisadas y se encuadran por sus medidas reales. En el celular, la misma miniatura en la hoja inferior (104 px).
- **Un solo contexto WebGL:** las miniaturas son `View` de drei (con `track` sobre `[data-miniatura-3d]`) del canvas del recorrido, dibujadas después de las pasadas del cuerpo (que ahora restablecen viewport y recorte al empezar cada cuadro). Como el canvas está debajo de las tarjetas, con la escena lista (`data-listo`) la tarjeta pasa a fondo transparente y la miniatura pinta el fondo de la tarjeta alrededor con una sombra extendida, recortada por el borde redondeado: queda un hueco por el que se ve el canvas. El contenido de la tarjeta va encima (`z-index`) y un filete interior de 2 px tapa la costura con el recorte del canvas. Cada vista dibuja primero el fondo de la miniatura (color de la tarjeta y luz azul del borrador) con la opacidad de la tarjeta, así se funde igual que ella.

**Decidido sin preguntar.**
- **Miniaturas en el mismo canvas con el "hueco" en la tarjeta**, y no un canvas encima de las tarjetas: sería un segundo contexto WebGL, que AJUSTES y el guion piden evitar. Copiar el canvas a un canvas 2D por tarjeta obligaba a leer píxeles en cada cuadro.
- **`track` de drei, aunque está marcado como obsoleto:** las vistas en línea pondrían drei y three en el bundle de las tarjetas (que son HTML del servidor); con `track`, todo sigue en el bundle diferido de la escena.
- **El ensamble se dispara (1,7 s) al activarse la tarjeta (peso > 0,5)**, como pide la fase, y no atado al scroll como `A = smoothstep(…)` del guion: así nunca queda a medio armar si el scroll se detiene. Al irse la tarjeta vuelve a la nube. Mientras se ensambla, el canvas pide un cuadro por refresco; después, el vaivén va con el del cuerpo (30 por segundo, solo con la escena fija).
- **Proceso en canvas 2D y no 3D:** la idea del borrador es de partículas, y un 3D sumaba otro contexto. Las partículas sí son 3D (proyección propia), para el detalle y el giro.
- **Planos de corte en el color de la zona a resecar** (el borrador los dibuja en azul): delimitan esa zona y se leen mejor. **Partículas del metal un punto más fuertes** en el paso 3, para que el implante se lea sobre el hueso.
- **Celosía del implante solo en la cara visible:** con las dos caras superpuestas no se leía.
- **Sobre el metal final de fabricación, las partículas quedan al 17 %** (el borrador las deja al 25 %): el metal se lee más limpio. Fabricación sin fondo de panel: la luz radial del borrador sobre la tarjeta.
- **"Volver a ver" oculto con movimiento reducido** (no tiene nada que repetir) y sin JS.
- **Formas de fabricación dibujadas en 2D, no capturas del 3D:** son las piezas del borrador con más detalle y las partes de la ficha; las capturas del 3D no permitían muestrear la silueta para las partículas de la misma forma.

**Comprobado en el navegador** (build de producción en el puerto 3100, Chrome con la GPU del M1). Escritorio (1440 × 900) y 390 × 844, con y sin movimiento reducido, y sin JS: las tres piezas en varios momentos; comparadas con el borrador abierto como archivo. Sin errores de consola. Movimiento reducido: fabricación en su estado final sin botón, proceso con la forma del paso activo y quieto, miniaturas sólidas y quietas. Sin JS: fotos de planta y la imagen del primer paso, sin canvas ni botón. **Rendimiento del recorrido** (las ocho pantallas en 12 s): con tope, 60 fps y p95 de 16,7 ms en escritorio (canvas de 2160 × 1350) y 60 en el celular. Sin tope y alternando variantes (memoria del proyecto): sin miniaturas 70,5 / 71,6 / 70,5 fps; con miniaturas 67,8 / 69,5. Cuestan cerca de un 3 %.

**Pendiente.**
- **Medir en un celular real** el recorrido con las miniaturas (sigue de las fases 3 y 4).
- **Costura del hueco:** a algunos zooms puede asomar un borde de 1 px entre el recorte del canvas (píxel entero) y el hueco (fraccionario); el filete de 2 px lo tapa en las pruebas.
- **Caché de Turbopack:** los cambios de `globals.css` no entraban al build hasta borrar `.next/` (salvo `.next/dev`, el del servidor del usuario). Pasó tres veces.
- Las miniaturas no tienen imagen fija propia sin WebGL: queda la foto de la pieza (fase 2), que es real y se lee bien. Si se quiere una captura del 3D, el procedimiento es el de `cuerpo-entero.webp`.
- `CLAUDE.md` sigue desactualizado (fases anteriores) y ahora además: las animaciones de proceso y fabricación (canvas 2D, `components/animaciones/`) y las miniaturas en el canvas del recorrido.

---

## Fase 5 · Correcciones del verificador (2026-10-30)

**Commits:** `0b1e4c2` Open the thumbnail hole only once the tour canvas is visible · `d4e1d27` Restore wide cut planes and boxed guides in the process piece · `6b8ee29` Refine the printed acetabular cup and balance the two pieces · y el commit de esta entrada (docs).

**Qué se corrigió, en el orden del verificador.**
1. **Cuadro vacío y corte de la luz en las miniaturas.** El hueco de la tarjeta se abría con `data-listo`, mientras el canvas todavía hacía su fundido de 700 ms: por un instante se veía la escena vacía. Ahora se abre con `data-minis`, 760 ms después, la foto se funde encima en 360 ms y el ensamble espera a que el hueco esté abierto (`estadoRecorrido.minis`). Probado cuadro a cuadro a 1440 y a 390 px, entrando directo a una parada antes de que cargue el 3D: foto, fundido a la nube y ensamble, sin cuadros vacíos. La luz azul de la miniatura (en el shader y en el respaldo CSS, `closest-side`) se desvanece del todo dentro del recuadro: no quedan cortes rectos.
2. **Planos de corte del proceso:** planos punteados de unas tres veces el ancho del hueso (168 × 104 unidades), en el azul del hueso como en el borrador, en un grupo aparte (categoría 3) para que en el paso 3 pasen a guías y no queden como hueso. Ya no se confunden con la zona a resecar.
3. **Guías:** marcos en caja de 96 unidades de ancho (el rectángulo del borrador; el hueso mide unas 52), con las doce aristas, la ranura de corte en la cara de adelante y dos vainas para clavijas.
4. **Contraste del proceso:** partículas de 2 px como mínimo (antes 1,3) y opacidades de 0,5 a 1 según la profundidad (antes 0,34 a 0,9). Cortes de TC: 20 en lugar de 26, con las partículas concentradas en el contorno de la cortical y el del canal; se leen como anillos dobles.
5. **Fabricación:** la copa se dibuja al 60 % del recuadro y la endoprótesis al 90 % (antes las dos al 84 %): pesos parecidos. El ala de la copa es una lengüeta curva con punta redonda y tres agujeros avellanados, apoyada en la copa. Los poros son trabeculares: unos 110 polígonos irregulares de tamaños distintos, con semilla fija (la máscara de las partículas y el metal coinciden), oscuros y hundidos, y los del borde lo rompen. Secuencia y tiempos sin cambios.
6. **Miniaturas:** titanio de metal pleno (`metalness` 1) con poco relleno y un contraluz: toma los reflejos oscuros y los brillos del estudio y ya no queda blanco sobre blanco. Al quedar sólida, las partículas casi desaparecen (contorno limpio). Encuadre: las piezas largas giran en el plano de la pantalla hasta el ángulo que más llena la miniatura (en diagonal en escritorio, acostadas en la hoja del celular), con el vaivén alrededor de su eje largo, y la distancia sale de sus medidas reales.
7. **Menores:** sin JS se oculta la leyenda Hueso / Zona a resecar / Implante y guías (`.proceso-leyenda`). El bucle de cuadros de las miniaturas ya no corre siempre: arranca cuando una se ensambla y se detiene cuando ninguna lo hace o cuando el canvas deja de dibujar (recorrido fuera de pantalla).

**Comprobado** (build de producción, Chrome con la GPU del M1): 1440 × 900 y 390 × 844, con y sin movimiento reducido y sin JS. Recorrido con tope: 59,6 a 59,8 fps, p95 de 16,7 a 16,8 ms, en escritorio y en el celular. Sin errores de consola. Build, lint y tsc sin errores.

**Decidido sin preguntar.**
- **Planos en el azul del hueso** (como el borrador) y no en otro color de marca: la leyenda tiene tres colores y el borrador los dibuja así. Se distinguen por la forma (planos anchos punteados).
- **El ensamble espera al hueco abierto:** si no, al cargar el 3D en una parada ya activa se perdía detrás de la foto.

**Pendiente.**
- Lo que seguía de la entrada anterior: medir en un celular real, la caché de Turbopack con `globals.css` y `CLAUDE.md` desactualizado.

---

## Fase 6 · Pase visual (2026-10-30)

**Commits:** `b7a1105` Polish section edges, spacing and focus rings across the home · `0320bbc` Close the page with the hero fiber ribbon behind the contact block · y el commit de esta entrada (docs).

**Cómo se revisó.** Build de producción en el puerto 3100, Chrome sin interfaz con la GPU del M1, a 1440 × 900 y 390 × 844, de arriba abajo, con el borrador abierto como archivo al lado (capturas por sección y en los pasos entre secciones). Capturas de partida en `/private/tmp/claude-501/-Users-brianrebagliati-Documents-Work-Innercare/3403dac8-8619-432b-9048-845bab630d50/scratchpad/f6/antes/` (`d-*` escritorio, `m-*` celular, `b-*` borrador, `sd-*`/`sb-*` secciones nuestras y del borrador, `bd-*`/`bm-*` pasos entre secciones) y finales en `/private/tmp/claude-501/-Users-brianrebagliati-Documents-Work-Innercare/3403dac8-8619-432b-9048-845bab630d50/scratchpad/f6/v2/`.

**Lista de lo flojo (frente al borrador y a un nivel de producto actual) y qué se hizo.**
- **Recorrido → Cómo trabajamos:** al soltarse la escena fija, el fondo azul terminaba en un corte recto contra el gris (muy visible en el celular). Ahora `.escenario` y la luz que sigue al cuerpo (`.recorrido-luz`) se funden en el gris en los últimos 7 y 9 rem. La luz lo hace con una capa del mismo fondo y no con una máscara: con máscara el recorrido perdía un 3 % sin tope.
- **Cómo trabajamos:** la pieza flotaba sobre el gris plano. Lleva detrás la misma luz fija de las animaciones de fabricación y las miniaturas (`.proceso-luz`), así las tres piezas de partículas comparten fondo. En el celular, más aire entre la leyenda y el título.
- **Fabricación:** el título caía en tres líneas (Hanken es más ancha que la Instrument Sans condensada del borrador): `max-w-[22ch]` lo deja en dos, como el borrador. El texto de las tarjetas, a 58ch (dejaba media tarjeta vacía). "Volver a ver" queda a la misma altura en las dos tarjetas aunque los textos tengan distinto largo.
- **Habilitaciones:** las referencias se leían más chicas que el detalle; pasan a 15,5 px y semibold, en el primario (el borrador las tiene en semibold).
- **Distribución:** los puntos de cada par se veían como dos puntos sueltos; cada par lleva un halo del primario (el del borrador), centrado entre sus puntos.
- **Foco de teclado:** los enlaces (tarjetas del recorrido, índice anatómico, teléfonos del footer) usaban el anillo del navegador. Regla base `:where(a, button, summary, [tabindex]):focus-visible` con el anillo del primario de los botones; los componentes con el suyo (`.boton`, `.boton-vidrio`, PillNav) ganan porque va en `@layer base`.
- **Contacto:** fondo animado (abajo).
- Revisado sin cambios: hero (no se toca), tarjetas del recorrido, cierre del recorrido, footer y barra.

**Fondos animados probados (React Bits) y elección.** Solo el cierre de contacto los admite sin competir: el recorrido tiene el 3D, el proceso y fabricación tienen sus piezas animadas, y habilitaciones y sedes son tablas de datos donde el movimiento no tiene función. Los fondos de React Bits evaluados (`Waves`, `DotGrid`, `Topography`, `MagnetLines`, `CursorGrid`, `LineWaves`, `Threads`, `PatternWaves`) son hoy WebGL2; el único en canvas 2D es `Noise`. Capturas en `/private/tmp/claude-501/-Users-brianrebagliati-Documents-Work-Innercare/3403dac8-8619-432b-9048-845bab630d50/scratchpad/f6/fondos/`:
- `noise-contacto.png` (`Noise`, canvas 2D, grano en superposición): **descartado**, ensucia el azul de la marca y no aporta nada.
- `topo-contacto.png` (`Topography`, WebGL2, líneas de nivel): **descartado**, 1 600 líneas de código nuevas, parece un mapa de terreno y las líneas cruzan la bajada.
- `fibras-contacto.png` y variantes de ubicación `v-*.png` (escritorio) y `mv-*.png` (celular): **elegido** `GhostFibers`, el componente de las fibras del hero, en blanco sobre el azul. La página cierra con la misma pieza con la que abre; no suma código de terceros ni dependencias (`components/fondo-contacto.tsx` solo lo configura). Escritorio: rotación −30°, desplazamiento 0,5, se desvanece hacia la izquierda entre el 45 y el 75 % del ancho (pasa entre el título y el logo; `v-2.png`). Celular: rotación −40°, desplazamiento −1,2, aparece en el último 45 % del alto, al costado del botón (`mv-3.png`).

**Rendimiento** (Chrome con GPU, 1440 × 900, alternando el build anterior y el nuevo, como pide la memoria del proyecto). Recorrido con tope: 59,7 a 60 fps y p95 de 16,7 ms en escritorio y en el celular. Sin tope: antes 71,1 / 70,3, después 69,3 / 70,5 (con la máscara de la luz eran 68,6 / 68,4; se cambió por la capa de fondo). Paso del hero al recorrido: antes 51,0 / 50,5, después 51,0 / 51,3 (no empeora; el techo sigue siendo el hero, como anotó la fase 3). Contacto con las fibras: 60 fps en escritorio, en el celular y con movimiento reducido; el canvas no existe al cargar la página (se crea a media pantalla de distancia). Sin errores de consola en la home ni en una ficha (que usa el mismo bloque de contacto).

**Decidido sin preguntar.**
- **WebGL para el fondo del contacto**, aunque AJUSTES pide CSS o canvas 2D antes: la única opción 2D (`Noise`) no sumaba, y `GhostFibers` ya está en el proyecto, se crea solo cuando el bloque se acerca, dibuja solo mientras se ve y en ese tramo ni el hero ni el recorrido están a la vista (nunca hay dos fondos animados con el 3D). Sin WebGL2 queda la luz de `.cta-luz`; con movimiento reducido, un cuadro fijo.
- **Las fibras también en las fichas**, porque usan el mismo `ContactCta`: el bloque se ve igual en todo el sitio.
- **La entrada de las fibras no se orquesta:** su intro avanza solo mientras se ven, así que entran cuando aparece el bloque. No es el primer pantallazo, así que no va en la línea de tiempo de `intro.ts`.
- **No se tocaron** el hero, la barra de vidrio (que refracta el texto que pasa debajo; es su diseño) ni la lógica del recorrido, las miniaturas, el proceso o fabricación: solo su entorno (fondos, márgenes, alineación de botones).
- **Footer sin cambios:** el logo trae el lema dentro y además va el lema en texto; en el tamaño del footer el del logo no se lee, así que el texto se queda.

**Pendiente.**
- **Celular real:** medir el contacto con las fibras junto al resto (sigue lo de las fases 3 a 5).
- El lema repetido en el footer (logo y texto) se resuelve con un logo sin lema en `public/`, que hoy no existe.
- `CLAUDE.md` sigue desactualizado (fases anteriores) y ahora además: las fibras del hero también en el cierre de contacto (`components/fondo-contacto.tsx`) y el anillo de foco base.

---

## Fase 6 · Correcciones del verificador (2026-10-30)

**Commits:** `66e67d5` Replace the contact WebGL ribbon with a static fiber image · `c9d3d49` Give the credentials and locations bands more presence · `e3e6507` Let the process section take its natural height without JS · y el commit de esta entrada (docs).

**Qué se corrigió, en el orden del verificador.**
1. **Cinta del contacto sin WebGL.** Ya no hay contexto propio: es una imagen fija con transparencia, `public/img/cinta-contacto.webp` (1920 × 556, 148 KB) para escritorio y `cinta-contacto-movil.webp` (716 × 846, 80 KB) para el celular, con `next/image` diferida (la del otro tamaño no se descarga). A escala completa y en diagonal, como la del hero, sin nudo cortado. Deriva apenas con el scroll (`.cta-cinta`: `animation-timeline: view()`, transform en el compositor; fuera de pantalla o sin scroll no corre). Con movimiento reducido o sin soporte de la línea de tiempo, quieta. Ya no va en las fichas: `ContactCta` la muestra solo con `cinta` (la home). Salió `components/fondo-contacto.tsx`.
   - **Cómo se hizo la imagen** (para rehacerla): `GhostFibers` montado en el bloque en un modo de captura temporal (`glowColor` #a4c9ff, `secondaryColor` #2260a1, `lineColor` blanco, `strands`, 96 hilos, una cinta, `foldGlow` 0,3, `depthOfField` 0,45, `brightness` 0,6, sin viñeta, grano, partículas ni intro, dpr 2). Escritorio: rotación −28°, escala 1,4, a 1440 × 900. Celular: rotación −55°, escala 1,3, a 390 × 844. Captura del bloque con fondo transparente (Chrome con GPU, `omitBackground`). Después, con PIL: el alfa se atenúa al 30 % detrás del texto (escritorio, de izquierda a derecha entre el 25 y el 55 % del ancho; celular, al 45 % arriba, de arriba abajo entre el 20 y el 60 %), se apaga contra el borde de abajo (escritorio) y se multiplica por 1,6; `cwebp -q 76 -alpha_q 75 -m 6`. Capturas de las variantes probadas en `/private/tmp/claude-501/-Users-brianrebagliati-Documents-Work-Innercare/3403dac8-8619-432b-9048-845bab630d50/scratchpad/f6/cinta/` (`a-sheet.png` escritorio, `m-sheet.png` celular; elegidas la tercera y la segunda).
2. **Habilitaciones y distribución.** Habilitaciones va en una banda un tono más oscura (`surface-container-low`), así el tramo de datos se separa de fabricación y de sedes; las referencias pasan a 18 px semibold. Distribución: eje de 2 px con el primario más presente; las sedes que casi coinciden (Caseros y Alberti, Comodoro y Caleta) **comparten un punto** de 11 px con el halo del borrador, en la latitud media del par, y una guía va del punto a cada etiqueta (cada una con su latitud exacta); ciudades a 17 px medium. Composición del borrador intacta (título a la izquierda, eje a la derecha).
3. **Proceso sin JS:** `#proceso` toma su alto natural bajo `@media (scripting: none)` (medido: una pantalla, 900 px, en lugar de 3,4).
4. **Marco de la miniatura en los fundidos: no se corrigió.** Se probó afinar el filete interior de 2 a 1 px: el marco baja pero sigue (capturas `/private/tmp/claude-501/-Users-brianrebagliati-Documents-Work-Innercare/3403dac8-8619-432b-9048-845bab630d50/scratchpad/f6/v3/fade-1.38.png` y `fade1px-1.38.png`, comparadas en `anillo.png`). La causa no es solo el filete: el fondo que la miniatura pinta en el canvas con la opacidad de la tarjeta no compone igual que la sombra de la tarjeta en el DOM con la misma opacidad, y eso no se arregla en CSS. Se dejó en 2 px (con 1 px podría volver la costura a algunos zooms). Arreglarlo es tocar la lógica de las miniaturas (por ejemplo, que el canvas no pinte fondo y la tarjeta conserve el suyo bajo el hueco).

**Medido** (build de producción, Chrome con GPU del M1). Contextos WebGL vivos al pie de la página, después de recorrerla entera: **3** en escritorio y en el celular (los dos del hero y el del recorrido; antes eran 4). Contacto, con scroll de ida y vuelta sobre el bloque: 60 fps, p95 16,8 ms, en escritorio y en el celular. Recorrido con tope: 59,7 fps en escritorio y 59,9 en el celular (p95 16,7); sin tope, 67,8 (dentro del ruido de las mediciones anteriores, 68 a 71). Sin errores de consola. La ficha del hombro ya no carga la cinta.

**Para la mañana (no se hizo, por consigna).**
- Los dos contextos WebGL del hero nunca se liberan (es el hero).
- La ficha de producto con el estilo nuevo.
- Un logo sin el lema (no hay archivo): el lema sale dos veces en el footer.
