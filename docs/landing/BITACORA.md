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
