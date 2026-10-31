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

---

## Fase 7 · Cierre (2026-10-30)

**Commits:** el de esta entrada (solo documentación: `CLAUDE.md`, `docs/DECISIONES.md` y esta bitácora). No se tocó código de la aplicación.

**Qué se hizo.**
- **`docs/DECISIONES.md`:** ocho entradas nuevas, a partir de esta bitácora y sin repetir las que ya habían sumado las fases 1, 2, 3, 5 y 6: "Prioridad visual: React Bits y movimiento sin tope de acento" (AJUSTES, con lo que de verdad quedó), "Hero y navegación: detalles de la landing" (fase 1), "Datos de la landing" (fase 2), "Tomas, anclas y respaldos del recorrido" (fases 3 y 4), "Implantes del recorrido generados en Blender" (fase 4, que no tenía entrada), "Piezas de partículas: detalles de ejecución" (fase 5) y "Contextos WebGL de la home" y "Logo claro y lema en el footer" (fases 2 a 6). Se marcaron como **provisionales** el recorrido como sección propia con el busto en el hero, el aviso de deslizar fuera del centro, los implantes generados y sus medidas estimadas, las tres specs a confirmar y el logo. "Pendientes abiertos" remite a `CLAUDE.md` y a esta bitácora.
- **`CLAUDE.md`:** reescrito para describir el proyecto como quedó. Estructura (`content/recorrido.ts`, `components/recorrido-3d/` con el contrato de `implantes.ts`, `components/animaciones/`, los cuatro modelos de `public/modelos/` y `npm run modelos`); dirección visual con la prioridad visual y la regla de fidelidad al borrador; hero, secciones, vidrio, navegación de una sola página, movimiento y una sección nueva de rendimiento (tres contextos WebGL, carga diferida del recorrido después de la intro, pausa fuera de pantalla); estado por fases de la landing y pendientes; `docs/landing/` en "Referencias". Salieron `section-index`, Nosotros, Casos a medida, "Ver catálogo", "Ver casos a medida", "Contactar", "React Bits solo como acento puntual" y el dial "motion 4".

**Decidido sin preguntar.**
- **Marcar provisionales con una línea en las entradas existentes** ("Recorrido 3D de la home" y el aviso de "Una sola página con menú de anclas"), como se hace con "Reemplazada por": no cambia su contenido.
- **Agrupar por tema** en lugar de una entrada por cada viñeta de la bitácora: los detalles chicos de ejecución (opacidades, tamaños) quedan solo en la bitácora.
- **`AJUSTES.md` manda sobre `CLAUDE.md`**, y así quedó escrito en "Referencias", con la salvedad del stack que ya hacía `AJUSTES.md`.
- **Rama `rediseno` en "Situación"**: el texto viejo la describía en un bloque aparte; ahora es una rama más en la lista y el resto del archivo describe lo que hay en ella.

**Comprobado.** `npm run build`, `npm run lint` y `npx tsc --noEmit` sin errores (sigue el aviso de `metadataBase`).

**Pendiente.** Lo que lista `CLAUDE.md` en "Estado › Pendiente", sin cambios respecto de las fases anteriores.

---

## Cuerpo único, fase 0 · Línea de base del hero (2026-10-31)

**Commits:** uno solo, el de esta entrada (`docs/landing/cuerpo-unico/base/` y esta bitácora). No se tocó código de la aplicación.

**Qué se hizo.** Referencia de paridad del hero actual (rama `cuerpo-unico` en `a0dcbbf`) para la compuerta de la fase 1, con build de producción en el puerto 3400 y Chrome sin interfaz con la GPU del M1 (patchright). Todo en `docs/landing/cuerpo-unico/base/`:
- `MEDICIONES.md`: método exacto (flags, ventanas, DPR, cómo se fija cada momento), lectura de las capturas, mediciones y los valores de cámara, pose, materiales, luz y encuadre del hero sacados del código, con su equivalente calculado en las coordenadas del guion del recorrido (`objetivo` [0, 1,56, 0], `azimut` −1,082, `elevacion` 0,0217, `alto` 0,493 m y `ancla` [0,740, 0,5] en escritorio).
- `medir.mjs`: script reutilizable con los modos `capturas`, `respaldo`, `encuadre`, `medidas` y `resumen`, y opciones para apuntar a otro DOM (`--listo`, `--hero`, `--recorrido`, `--primera`, `--tramos`) sin editarlo. La fase 1 lo corre con `--out` a otra carpeta y compara archivo por archivo.
- `capturas/` (34 WebP, 1,3 MB): 1440 × 900 y 390 × 844, con y sin movimiento reducido, en `intro-0000`, `intro-2000`, `intro-fin` y `vaiven-00/05/11/16`; `hero-abajo` en el celular (el busto queda debajo de la primera pantalla), `reducido-detalle` a resolución completa y `respaldo-sin-webgl` por tamaño. `capturas.json` registra el instante real de cada una y si se veía el 3D o el respaldo.
- `medidas/*.json`, `encuadre.json`, `respaldo.json`: datos crudos.

**Resultados.**
- Con la máquina tranquila (vuelta 1, con tope): hero quieto, paso hero → recorrido (0,3 pantallas y hasta la primera parada) y recorrido a 60 fps en escritorio y en el celular. Sin tope, hero en escritorio ≈ 71 a 74 y en el celular emulado 160 a 196.
- Contextos WebGL: 2 en el DOM en el hero (fibras y busto) y 3 al pie (más el del recorrido), más 2 canvas de prueba sueltos (`hasWebGL()` del hero y del recorrido) que nadie libera. Al pie no dibuja ninguno.
- La intro arranca con el `onReady` del 3D a 0,83 a 1,28 s de la navegación con la máquina normal (2,68 s en la corrida más cargada); el 3D tarda ≈ 0,4 s desde que se piden los modelos.
- Primer pantallazo: `cabeza.glb` + `implantes.glb` = 498 248 bytes (397 413 transferidos). Recorrido: `cuerpo.glb` 902 244 (699 221) e `implantes-recorrido.glb` 313 036 (194 799).

**Decidido sin preguntar.**
- **Capturas a escala CSS** (1440 × 900 y 390 × 844 px) con el render a la resolución real (DPR 2 y 3), para que pesen poco; más una por tamaño a resolución completa (`reducido-detalle`) para comparar el detalle del vidrio y el titanio.
- **`intro-fin` en `done` y `vaiven-00` 0,3 s después**, para no duplicar nombres; los tiempos del vaivén son desde `done` (el vaivén ya lleva 1,4 s ahí).
- **Una captura extra del celular con el borde del hero al pie** (`hero-abajo`): en la primera pantalla solo se ve la coronilla, y la paridad del busto no se puede juzgar con eso.
- **Cuatro corridas con tope en escritorio** en lugar de dos, porque las vueltas 2 a 4 salieron con Safari usando la GPU (carga 4,4 a 5,3) y bajaron a 24 a 52 fps; se anotaron todas y se marcó la vuelta 1 como la referencia limpia. El script ahora guarda la carga de la máquina en cada resultado.
- **Sonda inyectada en el HTML** (interceptando `/`) y no con `addInitScript`, que con patchright no corre en localhost (memoria del proyecto).

**Hallazgos (no se tocaron, por consigna).**
- Al cargarse el recorrido, `implantes.glb` e `implantes-recorrido.glb` se descargan otra vez enteros (≈ 250 KB de más), probablemente por pedirlos como lista con `useGLTF(urls)` en `escena.tsx` y `miniaturas.tsx`.
- Con movimiento reducido, la primera captura de la intro es la imagen de respaldo (la intro arranca antes que el 3D) y el título igual entra letra por letra.
- Sin tope, el paso a la primera parada en escritorio cae a ≈ 36 fps aunque con tope dé 59,6 (dos canvas sin sincronía vertical): ese número solo sirve contra otro sin tope.

**Pendiente.** Nada de esta fase. Para la fase 1: repetir con `medir.mjs` (receta al final de `MEDICIONES.md`), alternando base y prototipo con carga parecida.

**Capturas:** `docs/landing/cuerpo-unico/base/capturas/` (en el repo).

---

## Cuerpo único, fase 1 · Prototipo de paridad (2026-10-31)

**Commits:** `0aeedd0` (maxilar entero en `cuerpo.glb`), `98f8555` (modo hero de la escena del recorrido detrás de `?cuerpo-unico`), `0f79d41` (recorte a la caja del busto, piel solo arriba del corte, vidrio opaco en el hero), `ac5f85f` (piel ordenada solo en el hero; capturas, diferencias, medidas y hoja de comparación) y el de esta entrada (mediciones y bitácora).

**Cómo verlo.** `/?cuerpo-unico` en la home (build de producción). Sin el parámetro, la home es la de antes: el build nuevo sin parámetro da, cuadro a cuadro, la misma imagen que `6492345` en el hero y en seis tomas del recorrido (con movimiento reducido; solo cambia la miniatura de partículas, que varía sola entre corridas). `?cuerpo-unico=entero` dibuja el hero en el canvas entero, sin recorte, para medir.

**Qué se hizo.**
- **Keyframe `hero` en `camara.ts`** (`HERO`): objetivo [0, 1,56, 0], azimut −62°, elevación 0,0217 rad, distancia 0,920 m, alto 0,493 m; escritorio con ancla [0,740, 0,5] y estiramiento 1,11, celular con ancla [0,5, 1,092] y alto 0,796. Con el parámetro, la toma 0 del recorrido es esta en lugar de la entrada, y `pesoHero(seg)` (la curva de la cámara en el primer tramo) lleva el aspecto del busto al del recorrido. `camaraPara` acepta `{ cuerpoUnico, encuadreHero }`, y el `Encuadre` suma `estiramiento` y `distancia` opcionales.
- **Escena del recorrido en modo hero** (`escena.tsx`, prop `hero`): la monta `hero-3d.tsx` en lugar del busto, sobre un canvas que es la pantalla entera al pie del hero (como la escena fija del cuerpo único), con el encuadre medido en el DOM: la cabeza cae donde la pone el busto. Una sola pasada, `frameloop` como el hero (`always` animando, `demand` con movimiento reducido, `never` fuera de pantalla), `PerformanceMonitor` con la misma bajada de resolución y calidad, y el `onReady` que arranca la intro.
- **Aspecto del busto** (`cuerpo-unico.ts`): el vidrio del hero (color, atenuación, ior, rugosidad, clearcoat, envMap), el hueso a 0,4, solo los huesos del busto (cráneo, maxilar entero, mandíbula y las vértebras de arriba del corte), la craneoplastía con el titanio del hero **dentro** del vidrio (capa 0, refractada como en el hero), sin borde fresnel ni implantes encima. Todo se interpola al del recorrido con el peso del hero.
- **Corte bajo el cuello** (`corteY`): desvanecido por altura inyectado en los materiales (piel, hueso y borde) sin pisar el `onBeforeCompile` del vidrio de drei. En la toma del hero, la piel se corta a 1,33 m y el hueso a 1,35 m con una banda de 4 mm; con el scroll, el corte baja hasta debajo de los pies y la banda se ensancha a 40 cm. La columna se parte como en `cabeza.py` (`partirColumna`: piezas enteras según la altura de su centro).
- **Fondo:** el vidrio refracta el degradé del hero (`useTexturaDegrade`, el tramo de la sección detrás del canvas). En el recorrido, la escena fija lleva el mismo degradé (`[data-cuerpo-unico]` en `globals.css`) y no la luz azul.
- **Giro:** la entrada (+55°, 2,6 s, cúbica de salida, subida de 2,5 cm, estados hold/play/skip) y el vaivén (62° a 22°, 22 s) del busto, cuadro a cuadro, como giro de la cámara alrededor de la cabeza. En el recorrido, el vaivén del hero corre en la toma 0 con el peso del hero (a todos los cuadros) y el leve del recorrido, en las paradas.
- **Blender:** `implantes.py` exporta además `hueso_maxilar_entero` en `cuerpo.glb` (el maxilar antes del recorte; 11 626 triángulos, +68 KB: 970 048 bytes). `cabeza.glb` e `implantes.glb` no cambian.
- **`medir.mjs`:** opción `--param` (p. ej. `--param cuerpo-unico`) sin cambiar el modo base. `comparar.mjs` arma la hoja de comparación.

**Decidido sin preguntar.**
- **Dos instancias de la misma escena** en el prototipo: la del hero (modo hero, en el lugar del busto) y la del recorrido (que arranca en la toma del hero). Es lo más simple que da capturas comparables píxel a píxel sin rearmar todavía las secciones (eso es la fase 2), y mide el costo real del cuerpo entero en el hero. Hay tres contextos, como en la base.
- **Canvas de pantalla entera en el hero**, no de la caja del busto: es el que va a tener el cuerpo único, así que es el que hay que medir. Para no pagar el área de más, la escena dibuja solo en la caja del busto (`recorte`, tijera de WebGL en la pasada principal y en el buffer del vidrio): el mismo costo por píxel que el busto. Además, en el hero se dibujan solo los triángulos de la piel que llegan arriba del corte (la piel ordenada por altura y `drawRange`) y el vidrio es opaco mientras el aspecto del hero está entero. `?cuerpo-unico=entero` (sin recorte) y `?cuerpo-unico=caja` (canvas del tamaño de la caja) quedan para medir.
- **El estudio de luz gira con la cámara** (`scene.environmentRotation`) en todo el cuerpo único: en el hero la luz queda quieta respecto de la cámara y gira el busto, así que es la única forma de que el vidrio y el titanio brillen igual. Se probaron el signo opuesto y sin giro: los dos se alejan de la base (diferencia media 9,4 y 9,0 contra 7,4 en esa prueba). Cambia la luz de las paradas respecto de hoy (ahora también es relativa a la cámara); se revisa en la fase 2.
- **Estiramiento de 1,11 en escritorio:** la cámara del busto toma el aspecto del canvas antes de correr la figura con `setViewOffset` (R3F lo fija al crearla y `manual` lo congela), así que el busto de hoy sale estirado a lo ancho en 1 + 2 × |foco − 0,5|. Es parte de lo que el usuario ve y le gusta: se repite tal cual y se lleva a 1 en la craneoplastía.
- **Distancia fija en la toma del hero:** en el celular la cabeza no queda en el centro del alto del canvas (ancla 0,69) y la cámara del recorrido, con fov 30° sobre la vista agrandada, se alejaba a 2 m y aplanaba la perspectiva (2 a 3 px de corrimiento y otra silueta). La toma fija 0,92 m y el fov sale de ella; entre tomas se interpola la distancia en escala logarítmica. Sin el parámetro no corre.
- **Espesor del vidrio en metros del mundo:** meshopt guarda la cuantización en la escala del nodo (piel del busto 0,2117, del cuerpo 0,8496) y three multiplica el espesor por esa escala: el mismo `thickness` daba un vidrio cuatro veces más grueso, más azul y más oscuro. El del hero va como 0,05 × 0,2117 y se divide por la escala de la piel. (Esto explica también parte de por qué el vidrio del recorrido se ve más azul que el busto.)
- **Huesos fuera del busto ocultos** en la toma del hero (clavículas, escápulas, húmeros, costillas): el busto no los tiene.
- **Sin tapa en el corte:** el busto tiene la tapa de `cabeza.py`; el cuerpo, un corte abierto. Queda en el borde inferior del canvas y no se distingue en las capturas.
- **No se cerraron apps del usuario** para medir (Safari y su proceso de GPU, Teléfono, Contactos): se alternaron base y prototipo en la misma sesión y con el mismo build.

**Autoevaluación de la paridad.** Detalle y tabla en `prototipo/MEDICIONES.md`; la hoja, en `comparacion.html`.
- **Coincide:** silueta, encuadre, pose, entrada y vaivén caen en el mismo píxel que la base en las 34 capturas (corrimiento 0, 0 en escritorio y celular, con y sin movimiento reducido), y el giro va cuadro a cuadro igual. Vidrio, color, brillo de la craneoplastía y corte bajo el cuello: diferencia media de 1,1 a 2,3 sobre 255 y menos del 0,6 % de los píxeles cambia más de 24/255 (con movimiento, parte es la cinta de fibras, que cambia sola). Sin WebGL y en el primer cuadro de la intro, la misma imagen fija.
- **No coincide (solo ampliando):** el contorno de la oreja dentro del vidrio brilla un poco más; algunas vértebras del fondo del cuello se ven apenas más tenues; y el corte del cuerpo es abierto donde el busto tiene tapa, contra el borde inferior del hero, donde no se distingue. Vienen de que la piel y el hueso del cuerpo no son exactamente las mallas del busto (otra cuantización, sin tapa).
- **Mi lectura:** en lo visual, un usuario que ama el hero no debería notar diferencia. La compuerta se juega en el rendimiento de escritorio (abajo).

**Rendimiento.** Alternando base y prototipo en la misma sesión (máquina cargada; al final, en batería, y eso ya no se usó). Hero quieto, versión final: celular 60 contra 60 con tope y 178,6 contra 181,2 sin tope (−1,4 %); **escritorio 55,2 contra 58 con tope y 63,8 contra 66,9 sin tope (−4,6 %)**. Con el canvas del tamaño de la caja del busto (`=caja`), el cuerpo entero rinde **más** que el busto: 60 con tope y 69,3 sin tope en escritorio, 193 en el celular. O sea, el contenido ya no cuesta; lo que queda es el área de un canvas de pantalla entera con antialiasing. La intro arranca igual (0,8 a 1,0 s, en localhost). Recorrido: 59,8 con tope como la base. **Honestamente, con el canvas de pantalla entera la compuerta de fps no se cumple del todo en escritorio**; con el canvas de caja, sí.

**Pendiente.** 
- **Canvas del hero** (fase 2): que la escena fija tenga el tamaño de la caja del busto mientras se ve el hero y pase a pantalla entera al empezar el scroll, u otra de las opciones de `prototipo/MEDICIONES.md`, "Para la fase 2". Es lo que falta para que el hero no pierda cuadros en escritorio.
- **Partir `piel` en Blender por altura** (fase 2), en lugar del orden por altura en tiempo de ejecución, que solo el hero puede usar.
- **Volver a medir enchufado:** el recorrido con la versión final (debería dar lo de la versión 2: 59,8 con tope) y el ruido entre dos corridas de la misma base, que no llegué a medir por la batería.
- **Paso al recorrido sin tope:** en todas las versiones del prototipo, el paso de 0,3 pantallas sin tope cae a 13 a 18 (base 62), aunque con tope da 54 (base 56). Sin aislar.
- **Peso del primer pantallazo:** `cuerpo.glb` (970 KB) contra 498 KB del busto; medir la intro con red simulada.
- **Colores del degradé** repetidos ahora en tres lugares (`globals.css`, `hero-3d/body-scene.tsx` y `recorrido-3d/cuerpo-unico.ts`); y la luz de las paradas, que cambia con el estudio girando con la cámara.

**Capturas:** `docs/landing/cuerpo-unico/prototipo/capturas/` (mismos nombres que `base/capturas/`), diferencias en `prototipo/diferencias/`, medidas en `prototipo/medidas/`, `prototipo/caja/medidas/`, `prototipo/base-alternada/medidas/` y `prototipo/sin-recorte/`, método y lectura en `prototipo/MEDICIONES.md`, y la hoja de comparación en **`docs/landing/cuerpo-unico/comparacion.html`** (se abre como archivo).

### Cuerpo único, fase 1 · Correcciones del verificador (2026-10-31)

El verificador dio "no pasa" por una diferencia grave. Commit: el de este apartado.

- **Grave, corregido: filo blanco en el corte bajo el cuello.** El prototipo agregaba un filo blanco de 2 a 4 px y unos 90 px de largo en el contorno inferior derecho del hombro, visible sin ampliar en escritorio desde `intro-2000`, en el detalle y en `celular-*-hero-abajo`. La causa no era el corte abierto sino mi shader del corte: en la banda de 4 mm multiplicaba el alfa, y con el vidrio opaco (como queda en el hero) eso escribe un alfa menor que 1 sin mezcla en un canvas premultiplicado, que lo muestra aclarado hasta el blanco. Ahora, en materiales opacos el corte es recto (`#ifdef OPAQUE`: descarta debajo del corte y no toca el alfa); en transparentes (cuando el corte baja con el scroll) sigue el fundido. Es lo que hace el busto: su tapa mira hacia abajo, desde arriba no se dibuja, y su corte se ve abierto y recto. El borde queda igual que la base (diferencia en la zona del corte, de 2,21 a 1,68, sin corrimiento).
- **Hallazgo, corregido: recorrido vacío en el celular.** La toma `hero` del celular ponía la cabeza debajo de la pantalla (ancla 1,092, la de la escena fija arriba de todo, como va a ser en la fase 2). En el prototipo el recorrido es otra sección y arrancaba casi vacío; ahora usa la toma del pie del hero (ancla 0,691, el busto entero). En la fase 2, con el hero dentro de la escena fija, volver a 1,092 o decidir. Mientras el hero y el recorrido sean secciones separadas, al pasar de una a otra se ven dos bustos un momento.
- **Menores, quedan:** contorno de oreja y nuca algo más marcado, vértebras bajas y bandas claras del cuello, y el reflejo bajo el borde de la craneoplastía (de las mallas, no del material). No salieron con esta corrección.
- **Capturas repetidas** (la tanda completa con `medir.mjs`, más el respaldo) y `comparacion.html` y `prototipo/MEDICIONES.md` actualizados. Con la Mac en batería, `escritorio-movimiento-vaiven-11` y `-16` quedaron unos grados atrás en el vaivén (Chrome a 30 cuadros y el reloj del vaivén descuenta los cuadros trabados); el código del giro no cambió desde la corrida enchufada, donde coincidían.
- **No se midieron cuadros por segundo** después de la corrección (batería al 12 %).
- Build, lint y `tsc` sin errores.


---

## Cuerpo único, fase 2 · Blender y partición del cuerpo (2026-10-31)

**Commits:** `2a40c70` (cuerpo partido en dos archivos, piel por altura, escena adaptada), `b2309cf` (documentación y capturas) y el de esta entrada (renders, `preview.py --por-malla` y bitácora).

**Qué se hizo.**
- **`hueso_maxilar_entero`:** ya salía del script (`implantes.py`, copia del maxilar antes del recorte, exportada con el cuerpo). Se comprobó que `npm run modelos` lo regenera: el cuerpo optimizado entero sale idéntico, byte por byte, al `cuerpo.glb` del commit `0aeedd0`.
- **Piel partida** en `piel_cabeza` (12 699 triángulos: los que llegan arriba de 1,33 m, el mismo conjunto que dibujaba el `drawRange` de la fase 1), `piel_torso` (30 413, hasta 0,68 m, debajo de la punta de los dedos, que está a 0,686 m) y `piel_piernas` (19 300). Total 62 412, igual que antes. **Columna** partida en `hueso_columna_alta` (7 584, las vértebras del busto) y `hueso_columna_baja` (22 767), con el mismo criterio que usaba la escena.
- **Dos archivos:** `cuerpo-cabeza.glb` (381 KB, 306 KB con gzip: piel_cabeza, cráneo, maxilar entero, mandíbula y columna alta) y `cuerpo-resto.glb` (595 KB, 457 KB con gzip). Reemplazan a `cuerpo.glb` (970 KB, 747 KB con gzip).
- **`3d/scripts/partir.mjs`:** comandos propios de la CLI de gltf-transform (`--config`, sin dependencias nuevas). `partir` toma el cuerpo de `optimize --compress false`, lo cuantiza y comprime con el mismo `meshopt()` que `optimize --compress meshopt` y, antes de escribir, parte copiando los valores ya cuantizados; `verificar` compara el resultado con el cuerpo comprimido entero, triángulo por triángulo (posición, normal y matriz del nodo): 186 114 triángulos, todos iguales. `modelos.sh` corre los dos.
- **Escena** (`escena.tsx`): el hero del cuerpo único carga solo `cuerpo-cabeza.glb`; el recorrido, los dos, cada uno con su `useGLTF` (la caché es por archivo). La piel es un grupo de tres mallas (el buffer del vidrio oculta el grupo); en el cuerpo único, cada trozo se oculta cuando queda entero debajo del corte. Se quitaron `ordenarPorAltura` y `partirColumna` de `cuerpo-unico.ts`: ya no hay trabajo en tiempo de ejecución. Contrato en `implantes.ts` (`CUERPO`: qué archivo es del hero, qué mallas lleva y cuáles son la piel).

**Decidido sin preguntar.**
- **La partición no se hace en Blender sino después de `optimize`**, en la misma pasada que la compresión. Medido: partida en Blender (antes de optimizar), la piel queda en 107 914 triángulos en lugar de 62 412 y el archivo en 1,17 MB, porque `optimize` simplifica cada malla con un error relativo a su tamaño; además cada trozo se cuantiza en su propia grilla y la junta se abre. Partida después, los trozos son los mismos triángulos, vértices, normales y nodo (la escala de la cuantización, que es la del espesor del vidrio, no cambia): la junta es estanca y no hay que recalcular nada. Tampoco se parte el archivo ya comprimido: volver a comprimir pasa otra vez las normales por el filtro octaédrico y corre 3 925 triángulos (sin el filtro queda exacto pero pesa 114 KB más).
- **Partir en dos archivos, sí.** Con el cuerpo único, el primer pantallazo es `cuerpo-cabeza.glb` + `implantes.glb` = 454 KB (361 KB transferidos), contra 498 KB (397 KB) del busto de hoy y 1 049 KB si el cuerpo fuera entero. El resto se pide al montar el recorrido.
- **Corte de la piel en 1,33 m exacto** (el del busto) y no más abajo: en el hero se dibuja justo lo mismo que en la fase 1. **Torso hasta 0,68 m** y no 0,80: a 0,80 la junta cruzaba las manos.
- **`resolution={1}` en el vidrio del recorrido:** con `buffer`, drei igual reserva dos buffers del tamaño del canvas por material; con tres trozos de piel eran seis sin uso.
- **`implantes-recorrido.glb` no se actualizó:** `npm run modelos` lo regenera con los mismos triángulos pero 148 bytes distintos (Blender no es determinista en los booleanos); se dejó el del commit para no tocar lo verificado.
- **`useGlassBuffer` acepta un grupo** (`components/hero-3d/materials.tsx`, solo el tipo; el busto no cambia).

**Comprobado.**
- Build, lint y `tsc` sin errores. Sin errores de consola en la home con y sin `?cuerpo-unico`, en escritorio y celular; cada modelo se descarga una vez.
- **Hero del prototipo contra las capturas de la fase 1** (`medir.mjs capturas --param cuerpo-unico`): con movimiento reducido, las 16 tomas (1440 y 390, incluido el detalle a resolución completa) dan diferencia 0,00, idénticas píxel por píxel. Con movimiento, 1,1 a 1,7 de media (las fibras y el vaivén cambian solos entre corridas), salvo `vaiven-11` y `-16` de escritorio (2,7 y 4,4), el mismo atraso del vaivén en batería que ya anotó la fase 1.
- **Recorrido** (base y prototipo, movimiento reducido): cierre, acetábulo, craneoplastía y el paso del hero a la craneoplastía, revisados a ojo. El cuerpo se ve continuo en las dos juntas (cuello y mitad del muslo) y no faltan piezas.
- **Renders de control** (`preview.py --por-malla`, sobre los `.glb` publicados): las juntas siguen caras enteras, sin huecos ni cortes de sombreado.

**Pendiente.**
- **No se midieron cuadros por segundo:** la Mac estuvo en batería (7 % a 6 %). Falta, enchufada, el hero del prototipo alternado con la base y el recorrido, como pide la memoria del proyecto.
- **Comparación del recorrido antes y después:** solo a ojo. No hubo batería para un segundo build del commit anterior. La geometría es la misma valor por valor; lo que cambia es el orden de dibujo entre los trozos de piel y entre las dos partes de la columna (objetos transparentes), que puede mover algún tono donde se superponen.
- Lo que quedaba de la fase 1 sigue igual: canvas del hero del tamaño de la caja, paso al recorrido sin tope y luz de las paradas.

**Capturas y renders:** `docs/landing/cuerpo-unico/fase2/capturas/` (hero del prototipo con los nombres de `prototipo/capturas/`, y `parada-*`: el recorrido base y con `?cuerpo-unico`), `fase2/diferencias/` (contra la fase 1, × 4) y `fase2/renders/piel-zonas-*.webp`.

---

## Cuerpo único, fase 3 · Unir las secciones y mudar el hero (2026-10-31)

**Commits:** `61a7b1b` (el hero entra en la escena fija del recorrido), `0294e73` (toma hero del celular arriba de todo), `d4d922c` (capturas del hero), `1b41bcb` (script de capturas del recorrido y `comparar.mjs --contra`), `5f24d06` (capturas del recorrido) y el de esta entrada.

**Qué se hizo.**
- **El cuerpo único es el camino normal.** `?cuerpo-unico` ya no hace falta (`cuerpoUnicoActivo()` devuelve siempre `true`, `estado.ts`; se borra en la fase 5). `app/page.tsx` ya no monta `Hero`: `components/home/hero.tsx` exporta `HeroTexto` (título con FoldText, subtítulo, botones, línea ANMAT y aviso de deslizar, con la misma maqueta) y `HeroFondo` (las fibras, sin cambios).
- **La sección** (`tour.tsx`) es la `IntroSection` con `id="inicio"`, arriba de todo y por detrás del header (`-mt-16 md:-mt-[72px]`). El H2 de entrada salió; el texto del hero va en la capa de entrada (`.recorrido-hero`) y las fibras detrás del cuerpo (`.recorrido-fondo-hero`); las dos se funden con `opacidadEntrada` (seg 0 a 0,35). `--tramos` no cambia: la toma 0 es la del hero (antes la entrada) y desde la craneoplastía todo queda como estaba. `#recorrido` pasa a ser un ancla más, en k = 1 (la craneoplastía).
- **Una escena, un canvas.** `Recorrido3D` se monta enseguida (idle, máximo 1,5 s) y arranca la intro con `startIntro()` al estar listo o a los 2,5 s; lleva el estado hold/play/skip en `estadoRecorrido.entrada`. La cámara del recorrido corre el giro de entrada y el vaivén del hero, amortiguados por `pesoHero`. `PerformanceMonitor` siempre (solo recibe cuadros mientras el hero anima). El hero carga `cuerpo-cabeza.glb` y la craneoplastía; `cuerpo-resto.glb`, `implantes-recorrido.glb` y las miniaturas se piden con `useIntroPhase() === 'done'` (mientras tanto sigue el cuerpo del hero como `fallback` del Suspense).
- **Rendimiento del hero:** con el peso del hero entero (seg < 0,22) la escena dibuja solo la caja del busto de hoy (tijera en la pasada principal y en el buffer del vidrio, `recorteHero` en `escena.tsx`), una sola pasada.
- **Respaldo sin WebGL:** vista nueva `VistaHero` (las capturas `cuerpo-inicio*.webp`) en la toma 0; las paradas y el cierre siguen con las suyas. **Fondo:** degradé del hero en toda la escena fija; al final del cierre `.recorrido-fundido` lo apaga en el gris.

**Decidido sin preguntar.**
- **Celular: la cabeza vuelve al ancla 1,092** (la del hero de hoy con scroll 0: asoma la coronilla bajo el aviso). Así el primer pantallazo es el de hoy; `hero-abajo` ya no aplica (no hay más hero que deslizar).
- **El maxilar** no se tocó: la lógica de la fase 1 ya muestra el entero en el hero y el recortado con su implante en las paradas.
- **El código del modo `hero` de `escena.tsx` y `components/hero-3d/` quedan sin uso**, para la limpieza de la fase 5.

**Comprobado** (build de producción en 3400, Chrome con GPU). Build, lint y `tsc` sin errores. Hero contra la base (`comparar.mjs --contra fase3`): escritorio 1,1 a 2,1 de media, desplazamiento 0, 0; celular ≈11, porque la cinta de fibras cae más arriba (ahora la mide contra una pantalla, no contra el hero alto del celular); el busto coincide a ojo. Contextos WebGL vivos: 2 en el hero y 2 al pie, en los cuatro casos. Sin errores de consola.

**Pendiente.**
- **No se midieron cuadros por segundo** (batería al 3 %). Falta, enchufada: hero quieto, paso al recorrido y recorrido contra la base.
- **Fibras en el celular:** posición distinta a la base (fase 4, `components/home/hero.tsx` `HeroFondo`). Siguen dibujando aunque estén ocultas (fase 4).
- **`intro-0000`** difiere (11 a 20 de media): el primer cuadro ya muestra el canvas o la captura en otro momento; revisar.
- **Sin revisar:** sin JS, el índice activo del menú (`use-active-section.ts`: `#recorrido` ahora es un `span`), el salto de "Recorrer los implantes" y el cambio del cuerpo del hero al entero al llegar el resto (un remontaje).
- **Capturas:** `docs/landing/cuerpo-unico/fase3/capturas/` (hero, nombres de `base/capturas/`), `fase3/diferencias/`, `fase3/recorrido/` (seg 0,1 a 7, con y sin movimiento reducido, 1440 y 390) e `informe.json`.

## Cuerpo único, fase 4 · Maxilar, fibras y pendientes de la fase 3 (2026-10-31)

**Commits:** `8e7e236` (maxilar), `9c953ec` (fibras: pausa y posición en el celular), `6f33738` (punto activo del menú), `57b8316`, `d6e3272`, `82a5832` (capturas del hero), `3760653` (degradé desde el primer cuadro), `788c76f` (la captura del busto entra con la intro), `f609253` (script y capturas del recorrido), `cccfcd0` (mediciones) y el de esta entrada.

**Qué se hizo.**
- **Maxilar:** `pesoMaxilar(seg, reducido)` en `camara.ts` (0 hasta seg 1,4; 1 desde 1,78, con `smooth`). En `escena.tsx`, `hueso_maxilar_entero` pesa `1 − m` y `hueso_maxilar` (el recortado) `(1 − h) × m`; el implante maxilar, su brillo y su halo se multiplican por `m`. Con movimiento reducido: entero en el hero y en la craneoplastía, recortado con implante desde la parada 2.
- **Fibras:** la capa `.recorrido-fondo-hero` pasa a `display: none` cuando el fundido de entrada termina (seg ≥ 0,35); su IntersectionObserver deja de ver caja y `GhostFibers` deja de dibujar; al volver arriba, despierta. `resize()` ignora la caja vacía, así que no se realoca nada. En el celular (< 768 px) la capa mide el 140,2 % del alto de la escena, el alto que tenía el hero como sección (1183 px a 390 × 844): la cinta vuelve a caer donde caía (diferencia de 11 a 6,5 de media, el resto es el borde del texto).
- **`intro-0000`:** dos pérdidas visibles. El degradé del hero lo ponía el JS (`data-cuerpo-unico`) y la vista de respaldo del busto llevaba el fondo `.escenario`, que tapaba las fibras y blanqueaba el fondo; además la captura del busto aparecía nítida, fuera de `.intro-3d`. Ahora el degradé es CSS de `.recorrido-escena`, la vista del hero no lleva fondo y entra con `.intro-3d`. Diferencia contra la base: escritorio 0,9 a 1 (antes 11 a 14).
- **Menú:** `#recorrido` medía 1 px y casi nunca cruzaba la mitad de la pantalla. Ahora va de la craneoplastía al pie de la sección (`.recorrido-ancla-seccion`): Implantes se marca desde seg ≈ 0,6 y el hero no marca nada.
- **Comprobado** (build de producción en 3400, Chrome con GPU; `fase4/recorrido.mjs`): "Recorrer los implantes" baja a seg 1,002 en los cuatro casos; la llegada de `cuerpo-resto.glb` e `implantes-recorrido.glb` no cambia la toma hero (diferencia 0 con movimiento reducido); 2 contextos WebGL en el hero (el de las fibras queda vivo y pausado al pie); sin errores de consola; sin WebGL, la captura del busto y las vistas por parada; sin JS, hero y tarjetas en orden y legibles (solo se oculta el índice anatómico, como antes). Build, lint y `tsc` sin errores.
- **Mediciones con la Mac enchufada** (alternando con la base `6492345` en un worktree): `fase4/MEDICIONES.md`.

**Decidido sin preguntar.**
- **Fundido del maxilar entre seg 1,4 y 1,78:** empieza cuando la tarjeta de la craneoplastía se va y termina cuando entra la del maxilar, así el hueso cambia en el tramo de cámara y no con la parada quieta.
- **Pausa de las fibras con `display: none`** en lugar de una señal nueva entre `tour-scroll.tsx` y `GhostFibers`: reutiliza el IntersectionObserver que ya tenían.
- **Alto de las fibras en el celular fijo en 140,2 %** (medido a 390 × 844) en lugar de calcularlo con el alto del texto: la cabeza también se ancla a la pantalla y no al texto.

**Pendiente.**
- **El recorrido en escritorio cae a 51,8 fps con tope** (p95 33 ms; la base, 60) y a la mitad de margen sin tope en los dos tamaños. Viene de la fase 3 (cuerpo único), no de esta. Medir por partes en la fase 5 (`fase4/MEDICIONES.md`, "Lectura"). El hero quieto y el paso a la craneoplastía mejoran.
- Celular contra la base: 6,3 a 7 de media en todas las tomas, con el 0,2 % de píxeles que cambian de verdad (bordes del texto); `hero-abajo` ya no aplica.
- Sin JS, las fotos de algunas tarjetas (hombro, acetábulo, fémur) salen vacías en la captura de página entera: revisar si es la carga diferida de las imágenes.
- El contexto de las fibras sigue vivo aunque pausado (no se libera).

**Capturas:** `docs/landing/cuerpo-unico/fase4/capturas/` (hero, nombres de `base/capturas/`), `fase4/diferencias/`, `fase4/recorrido/` (seg 0,1 a 7 con el fundido del maxilar en 1,3, 1,45, 1,55, 1,65 y 1,78, con y sin movimiento reducido, 1440 y 390; `*-hero-con-resto`, `*-sin-js` y `*-sin-webgl-*`; `informe.json`) y `fase4/medidas/`.
