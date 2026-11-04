# Largos máximos de los textos editables de la landing

Cuántos caracteres admite cada texto que afecta el diseño (`INVENTARIO.md`, columna "Afecta el diseño") sin que la landing cambie: medido en la página servida, en escritorio y en el celular, para fijar los topes del esquema del CMS (Keystatic). Fecha: 2026-11-04, rama `textos-editables` en `d4b24eb`.

## Método (resumido)

- **Dónde:** el build de producción (`npm run build` y `npm run start -- -p 3100`), en Google Chrome sin interfaz (patchright con `channel: 'chrome'` y la GPU del M1), a **1440 × 900** (escritorio, 1x) y **390 × 844** (celular, 2x, táctil), con `prefers-reduced-motion: reduce` para que nada quede a mitad de una animación. Se espera a que se vaya la pantalla de carga y a `data-intro="done"`.
- **Fuentes:** el build sirve las de verdad. En los dos tamaños `document.fonts.check` da `true` para Hanken Grotesk (500) y Source Sans 3; ninguna captura ni medición usó las de respaldo.
- **Cómo:** en cada nodo se reemplaza el texto por textos de prueba cada vez más largos y, después de cada cambio, se fuerza el layout y se comprueban las reglas del texto. Las palabras son del rubro, en español, con un promedio de 6,3 letras y alguna de 12 a 14 ("planificación", "biocompatible", "reconstrucción"); para specs y referencias, cifras, unidades y siglas ("Ti-6Al-4V", "Ø10", "0999/17"). Los textos copian la forma del original (mayúscula inicial, punto final, signos de pregunta). Primero se avanza de palabra en palabra y después, entre la última que pasó y la primera que falló, de letra en letra. Los textos partidos en spans se rearman con la misma estructura: letra por letra (`FoldText` del titular del hero, el botón de vidrio) o palabra por palabra (título y bajada de Distribución, titular de la intro del contacto). Al terminar se devuelven los nodos originales.
- **Reglas** (la primera que se rompe marca el máximo): que el texto no sume líneas respecto de hoy (o del hermano más largo de hoy, o de un tope fijo cuando el diseño lo pide), que no se salga de su caja ni de la pantalla, que no se superponga con otro elemento y que no empuje algo medido: el pie del texto del hero (`data-pie-hero`, que en el celular ubica la cabeza del 3D), la columna del logo de la barra (≥ 94 px), el centrado de los enlaces, la fila de dos botones del hero, el alto de las tarjetas del recorrido y de las cards del mapa, que los pasos de Cómo trabajamos entren en la pantalla fija.
- **Secuencias:** cada texto se mide con 6 secuencias de palabras distintas, porque dónde corta la línea depende de qué palabras caen al final. **"Máximo"** es la mediana de las 6; entre paréntesis, **"peor"**: la secuencia más desfavorable. El tope de la prueba es el triple del largo de hoy (mínimo 60); "+" indica que no se rompió nada hasta el tope.
- **Límite propuesto:** el 90 % del menor de los dos máximos (escritorio y celular), redondeado hacia abajo: entero hasta 40, múltiplo de 5 hasta 100 y de 10 por encima. Si el texto de hoy ya pasa ese número, se propone el largo de hoy, sin margen, y se marca **al límite**. Unas pocas etiquetas cortas llevan un **tope editorial** más bajo que lo que el diseño admite (se dice en la nota).
- **Imagen OG:** Satori no se puede medir en la página, así que se rearmó su columna en Chrome con los mismos woff de `assets/fuentes/`, el mismo cuerpo, interlineado, tracking y anchos (548 px útiles para el titular a 72 px; 476 px para el resumen a 22 px) y se midió igual. Se comprobó a ojo contra `/opengraph-image` (cuatro líneas de titular, dos de resumen). El ancho medio de glifo del titular, medido con la misma fuente, es 30,5 px: unas 17 letras por línea.
- **Scripts** (en `capturas/`): `medir-limites.mjs` repite la medición (`--tam`, `--solo <ids>`, `--semillas`) y escribe `limites.json` con la línea de base, el motivo de la falla y el texto que falló en cada secuencia; `capturar.mjs` saca las capturas de referencia (ver al final).

### Cómo leer las tablas

- **Largo actual**: caracteres de hoy, con espacios y puntuación. En los campos con varias entradas (seis paradas, cuatro sedes), el de la más larga.
- **Dónde**: `archivo:línea` del texto (del inventario).
- **Máximo escritorio / celular**: mediana (peor caso). "–" si el texto no se ve en ese tamaño.

## Tablas por sección

### 1. Pantalla de carga

| Texto | Dónde | Largo actual | Regla de diseño | Máximo escritorio | Máximo celular | Límite propuesto | Nota |
|---|---|---|---|---|---|---|---|
| Palabra del proceso (ocho) | `components/pantalla-carga.tsx:41-48` (`PALABRAS`) | 24 | Una línea (`min-height: 1.2em`); no más ancha que la pantalla menos 16 px por lado | 72+ (peor 72) | 36 (peor 35) | **32** | Actual: la más larga, "Planificación quirúrgica". En escritorio no hay límite práctico. La cantidad de palabras marca las franjas del progreso y cada una dura al menos 450 ms |
| "Cargando" / "Listo" | `components/pantalla-carga.tsx:215-216` | 8 | Una línea (`nowrap`) a la izquierda del Lattice Loader; no corre el porcentaje | 59+ (peor 59) | 40 (peor 39) | **20** | Tope editorial: el diseño admite 36 en el celular, pero es una etiqueta de estado. "Listo" va superpuesto a "Cargando": vale el mismo límite |

### 2. Menú y barra

| Texto | Dónde | Largo actual | Regla de diseño | Máximo escritorio | Máximo celular | Límite propuesto | Nota |
|---|---|---|---|---|---|---|---|
| Etiqueta del menú (cada una, con las otras como hoy) | `components/nav-links.ts:7-10` | 15 | Escritorio: los enlaces siguen centrados en la barra y la columna del logo no baja de 94 px (si baja, pasa al ícono). Celular: una línea en el panel del menú | 17 (peor 16) | 33 (peor 32) | **15** | Sola, una etiqueta llega a 17-25 sin descentrar los enlaces (según cuál) y a 26-33 sin perder el logo, pero el presupuesto es compartido: ver la fila de abajo. Se propone el largo de la más larga de hoy ("Cómo trabajamos") |
| Las cuatro etiquetas juntas (suma) | `components/nav-links.ts:7-10` | 49 | Con las cuatro creciendo a la vez, el mismo largo cada una: centrado hasta 4 × 14 = 56 (peor 4 × 13 = 52); logo ≥ 94 px hasta 4 × 17 = 68 (peor 4 × 15 = 60) | 14 por etiqueta (peor 13) | – | **52** (suma) | **Al límite**: hoy 49 (9 + 15 + 11 + 14) y sobran 25 px por lado. El centrado se pierde antes que el logo: el botón "Plantear un caso" (154 px) llena su columna de 179 px |

### 3. Hero

| Texto | Dónde | Largo actual | Regla de diseño | Máximo escritorio | Máximo celular | Límite propuesto | Nota |
|---|---|---|---|---|---|---|---|
| Titular (`tagline`, FoldText letra por letra) | `content/company.ts:7`; `components/home/hero.tsx:53` | 48 | Escritorio: 3 líneas; celular: 4 (más líneas bajan el pie del texto y, en el celular, la cabeza del 3D) | 61 (peor 55) | 74 (peor 59) | **50** | Compartido con el footer y la imagen OG (sección 12), que da el mismo 50. Tiempo: 25 ms por letra (`hero-intro.tsx:45`); hoy son 42 letras, la última arranca a los 2125 ms y el subtítulo entra a los 2300 (`intro-timeline.ts`). Con más de unas 49 letras (≈ 56 caracteres), el subtítulo entra con el titular a medio armar |
| Subtítulo | `components/home/hero.tsx:59-60` | 96 | `max-w-[36ch]`: 3 líneas en los dos tamaños; el pie del texto no se mueve | 117 (peor 109) | 117 (peor 109) | **100** | |
| Línea de habilitaciones ANMAT (`habilitacionesResumen`) | `content/company.ts:16-17`; `hero.tsx:91` | 93 | `max-w-[46ch]`, 2 líneas; es el pie del texto (`data-pie-hero`), que ubica la cabeza en el celular | 95 (peor 86) | 95 (peor 86) | **93** | **Al límite**: con el margen serían 85; con otras palabras, 86 ya pasa a tres líneas. Texto regulado y acordado (`AJUSTES.md`). También va en la OG (mismo límite) |
| "Plantear un caso" (`contactLabel`, los siete botones a la vez) | `components/nav-links.ts:17` | 16 | Una línea en todos; en el celular, los dos botones del hero en una fila; en la barra, enlaces centrados, logo ≥ 94 px y el botón dentro de su columna | 20 (peor 18) | 20 (peor 19) | **18** | En escritorio limita el centrado de la barra; en el celular, la fila del hero (hoy sobran unos 16 px). Con "Recorrer los implantes", ver la fila de abajo |
| "Recorrer los implantes" (botón de vidrio, letra por letra) | `components/home/hero.tsx:80` | 22 | Una línea (no se parte: `inline-flex`); la fila de dos botones de 48 px en el celular | 47 (peor 45) | 26 (peor 25) | **23** | Comparte la fila con "Plantear un caso": cada uno crece unos 4 caracteres si el otro queda igual. **Los dos juntos, como mucho 41** (hoy 38) |
| Aviso "Deslizá para recorrer el cuerpo" | `components/home/hero.tsx:120` | 31 | Celular: 2 líneas en `max-w-[10rem]` a la altura del cuello. Escritorio: una línea que no pase de la columna del texto | 93+ (peor 93) | 43 (peor 39) | **38** | En escritorio no hay límite práctico |

### 4. Recorrido: textos generales y cierre

| Texto | Dónde | Largo actual | Regla de diseño | Máximo escritorio | Máximo celular | Límite propuesto | Nota |
|---|---|---|---|---|---|---|---|
| Aviso "Deslizá para continuar" | `components/home/tour-scroll.tsx:450` | 22 | Celular: 2 líneas en `max-w-[6rem]`. Escritorio: una línea a la derecha del cuerpo (borde izquierdo en el 74 % del ancho o más) | 43 (peor 40) | 23 (peor 20) | **22** | **Al límite** en el celular: con otras palabras, 20 ya pasa a tres líneas |
| Zona en el índice anatómico (desde 1100 px) | `content/recorrido.ts` (`zona`, `:53` a `:150`); `tour-scroll.tsx:430` | 16 | Una línea; el nombre más los 14 px del hover no llegan a la retícula del implante más a la izquierda (el cráneo, x = 346 px) | 43 (peor 41) | – | **38** | El mismo `zona` va en la cabecera de la tarjeta (sección 5), que da el límite final (36) |
| Título del cierre | `content/recorrido.ts:167` | 63 | `display-lg`, `max-w-[18ch]`: 3 líneas | 62 (peor 55) | 62 (peor 55) | **63** | **Al límite**: la mediana ya queda por debajo de hoy; entra en tres líneas por cómo caen sus palabras |
| Bajada del cierre | `content/recorrido.ts:168` | 88 | `max-w-[46ch]`: 2 líneas | 104 (peor 100) | 86 (peor 80) | **88** | **Al límite** en el celular (con el margen serían 75) |

### 5. Recorrido: paradas (tarjeta de escritorio y hoja inferior del celular)

Medidas en la tarjeta del acetábulo (la de textos más largos) y en la del fémur (cuatro specs: la más alta en escritorio). La tarjeta no debe crecer: el tope es el alto de la más alta de hoy (escritorio 653 px, el fémur; celular 369 px, el acetábulo). Las specs solo se ven en escritorio.

| Texto | Dónde | Largo actual | Regla de diseño | Máximo escritorio | Máximo celular | Límite propuesto | Nota |
|---|---|---|---|---|---|---|---|
| Zona (cabecera de la tarjeta) | `content/recorrido.ts:53`, `:70`, `:87`, `:109`, `:126`, `:150` | 16 | Una línea junto a la píldora "A medida" / "Catálogo", sin tocarla; la tarjeta no crece; en escritorio, también el índice anatómico (sección 4) | 43 (peor 41) | 40 (peor 39) | **36** | Actual: "Diáfisis femoral" |
| Título | `content/recorrido.ts:55`, `:72`, `:89`, `:111`, `:128`, `:152` | 47 | `headline-lg` con `text-balance`, hasta 2 líneas; la tarjeta no pasa de la más alta de hoy | 53 (peor 44) | 58 (peor 55) | **47** | **Al límite** en escritorio (con el margen serían 45; con otras palabras, 44 ya va a tres líneas). Actual: el acetábulo |
| Descripción | `content/recorrido.ts:57`, `:74`, `:91`, `:113`, `:130`, `:154` | 176 | La tarjeta no pasa del alto de la más alta de hoy | 298 (peor 287) | 202 (peor 184) | **180** | Medida en el acetábulo (dos specs). Con dos o tres specs limita el celular. Tope físico a 900 px de alto: más de 500 caracteres (la tarjeta entra en el riel de 770 px y la hoja no tapa la retícula); el tope de "no crecer" es el que sirve en pantallas más bajas |
| Descripción, parada con cuatro specs | `content/recorrido.ts:130` (fémur) | 82 | Ídem; con cuatro specs, la tarjeta del fémur ya es la más alta en escritorio | 121 (peor 114) | 245 (peor 236) | **100** | Cada fila de spec ocupa lo que unas dos líneas de descripción (≈ 90 caracteres en escritorio). Hoy el hombro (tres specs) tiene 129 y entra |
| Etiqueta de spec | `content/recorrido.ts` (`specs[].label`) | 13 | Una línea en la columna fija de 7,375 rem | 18 (peor 17) | – | **16** | Actual: "Planificación", "Contacto óseo" |
| Valor de spec | `content/recorrido.ts` (`specs[].valor`) | 36 | Una línea, `font-data-mono tabular-nums` (medido con cifras, unidades y siglas) | 41 (peor 40) | – | **36** | **Al límite** (con el margen serían 36: justo). Actual: "Reemplazo de hombro con déficit óseo" |

### 6. Cómo trabajamos

| Texto | Dónde | Largo actual | Regla de diseño | Máximo escritorio | Máximo celular | Límite propuesto | Nota |
|---|---|---|---|---|---|---|---|
| Título | `components/home/process.tsx:28` | 25 | `display-lg`, `max-w-[16ch]`: 2 líneas | 36 (peor 26) | 39 (peor 29) | **32** | **Al límite** con palabras desfavorables (peor 26) |
| Título de un paso (medido como activo) | `content/customCases.ts:14`, `:23`, `:33` | 32 | Una línea también en el tamaño del activo (28 px en escritorio, 22 en el celular); los pasos entran en la pantalla fija | 32 (peor 31) | 30 (peor 28) | **32** | **Al límite**: "Planificación quirúrgica virtual" entra justo en el celular (con el margen serían 27) |
| Descripción de un paso | `content/customCases.ts:15`, `:24-25`, `:34-35` | 90 | 2 líneas (la más larga de hoy); los pasos entran en la pantalla fija (en el celular solo se ve la del activo) | 128 (peor 124) | 87 (peor 81) | **90** | **Al límite** en el celular (con el margen serían 75). Actual: el paso 3 |
| Etiqueta de la leyenda (las tres a la vez) | `components/home/process.tsx:7-9` | 16 | La leyenda sigue en una fila bajo la pieza | 32 (peor 31) | 15 (peor 14) | **16** | **Al límite** en el celular: medidas las tres con el mismo largo, la fila entra hasta 3 × 15 = 45; hoy son 5 + 14 + 16 = 35. Lo que cuenta es la suma: ver "Combinaciones" |

### 7. Fabricación

| Texto | Dónde | Largo actual | Regla de diseño | Máximo escritorio | Máximo celular | Límite propuesto | Nota |
|---|---|---|---|---|---|---|---|
| Título | `content/company.ts:78` | 44 | `display-lg`, `max-w-[22ch]`: 2 líneas | 55 (peor 45) | 44 (peor 40) | **44** | **Al límite** en el celular (con el margen serían 39) |
| Bajada | `content/company.ts:80` | 94 | `max-w-[56ch]`: 2 líneas en escritorio, 3 en el celular | 129 (peor 124) | 130 (peor 120) | **110** | |
| Nombre de la técnica | `content/company.ts:101`, `:111` | 23 | Una línea en la tarjeta | 43 (peor 42) | 26 (peor 25) | **23** | Actual: "Impresión 3D en titanio" |
| Texto de la técnica | `content/company.ts:103`, `:113` | 140 | Las líneas de la más larga de hoy (3 en escritorio, 4 en el celular); "Volver a ver" sigue alineado en las dos tarjetas (`flex-1`) | 198 (peor 189) | 166 (peor 161) | **140** | Justo en el 90 % del celular |
| "Volver a ver" | `components/home/animacion-fabricacion.tsx:137` | 12 | Una línea; la tarjeta no se ensancha | 59+ (peor 59) | 33 (peor 32) | **20** | Tope editorial (el diseño admite 33 en el celular). Oculto con movimiento reducido |
| Foto de la tira: título (caption) | `content/planta.ts` (`titulo`, `:17` a `:63`) | 48 | Escritorio (Flex Carousel): una línea centrada bajo la foto señalada, idealmente no más ancha que la foto más angosta (228 px a 1440 × 900). Celular (tira clásica de 304 px): hasta 2 líneas, como hoy | 32 (peor 31) | 98 (peor 91) | **48** | **Hoy tres pasan los 228 px en escritorio** (48, 42 y 34 caracteres): van bajo fotos más anchas, no rompe nada, pero ese texto queda más ancho que una foto angosta. Sin WebGL2 en escritorio (tira clásica de 416 px) entra en una línea hasta 69. Se propone el largo de hoy |
| Foto de la tira: subtítulo | `content/planta.ts` (`subtitulo`) | 25 | Una línea; en escritorio, no más ancha que la foto más angosta | 32 (peor 32) | 49 (peor 48) | **28** | |

### 8. Habilitaciones

| Texto | Dónde | Largo actual | Regla de diseño | Máximo escritorio | Máximo celular | Límite propuesto | Nota |
|---|---|---|---|---|---|---|---|
| Título | `content/company.ts:83` | 21 | `display-lg`, `max-w-[16ch]`: 2 líneas | 39 (peor 29) | 39 (peor 29) | **35** | |
| Bajada | `content/company.ts:85` | 152 | `max-w-[56ch]`: 3 líneas en escritorio, 4 en el celular | 191 (peor 186) | 173 (peor 162) | **152** | **Al límite** (con el margen serían 150) |
| Detalle de una fila | `content/company.ts:24`, `:30`, `:36`, `:42` | 58 | Las líneas del más largo de hoy (1 en escritorio, 2 en el celular) | 69 (peor 67) | 89 (peor 81) | **60** | Regulado. Más líneas cambian el ritmo de la lectura (el retraso de cada fila sale de su `offsetTop`) |
| Referencia (cada parte) | `content/company.ts:25`, `:31`, `:37`, `:43` | 21 | Una línea por parte (`' · '` separa las partes, una por línea; `nowrap` en escritorio); en escritorio la columna crece y no debe hacer bajar de línea a ningún detalle | 28 (peor 28) | 44 (peor 43) | **25** | Regulado. Actual: "Sub-GLN 7798276610018". Medido con cifras y siglas |

### 9. Distribución

| Texto | Dónde | Largo actual | Regla de diseño | Máximo escritorio | Máximo celular | Límite propuesto | Nota |
|---|---|---|---|---|---|---|---|
| Título (palabra por palabra) | `content/company.ts:89` | 27 | `display-lg`, `max-w-[16ch]`: 2 líneas | 39 (peor 29) | 39 (peor 29) | **35** | Cada palabra suma 70 ms a la entrada |
| Bajada (palabra por palabra) | `content/company.ts:91` | 119 | `max-w-[56ch]`: 2 líneas en escritorio, 3 en el celular | 129 (peor 124) | 130 (peor 120) | **119** | **Al límite** (con el margen serían 110). Cada palabra suma 22 ms |
| Etiqueta del mapa "{ciudad}, {provincia}" | `content/company.ts` (`localidad` y `provincia`: `:126-128`, `:142-144`, `:156-158`, `:168-170`); `mapa-sedes.tsx:270` | 26 | Escritorio: una línea; celular: hasta 2 (como hoy "Comodoro Rivadavia, Chubut"); dentro del mapa y sin pisar otra etiqueta | 44 (peor 43) | 43 (peor 39) | **38** | Cuenta la ciudad sin el código postal y la provincia sin "Provincia de ". Regulado (dirección); los contratos de formato están en el inventario |
| Rol bajo la etiqueta | `components/home/locations.tsx:38-42` | 17 | Una línea | 54 (peor 53) | 26 (peor 24) | **23** | Es "Laboratorio", "Sucursal" o, si el `tipo` no empieza con ninguna de las dos, el `tipo` entero (hoy "Planta industrial"): para ese `tipo`, vale este límite |
| Tipo en la card (`tipo`) | `content/company.ts:124`, `:140`, `:154`, `:166` | 45 | La card (10,5 rem; 12 rem desde 640 px) no pasa del alto de la más alta de hoy (Caseros) | 57 (peor 53) | 44 (peor 42) | **45** | **Al límite** en el celular. Medido con la dirección de Caseros y de Comodoro; con la de Alberti (52 + ", Alberti"), el tipo no puede pasar de 25. Las sucursales muestran solo "Sucursal". Ver "Combinaciones" |
| "{calle}, {ciudad}" en la card | `content/company.ts:125`, `:141`, `:155`, `:167` (`calle`) | 61 | Ídem | 83 (peor 76) | 64 (peor 59) | **61** | **Al límite** en el celular. Medido con el tipo de Alberti y de Comodoro; con el de Caseros (45), la dirección no pasa de 44. Regulado |

### 10. Contacto (sección de la home)

| Texto | Dónde | Largo actual | Regla de diseño | Máximo escritorio | Máximo celular | Límite propuesto | Nota |
|---|---|---|---|---|---|---|---|
| Línea chica (kicker) | `components/home/contacto.tsx:41` | 36 | Una línea en el bloque de la intro | 108 (peor 107) | 49 (peor 49) | **40** | Con movimiento reducido la intro no se muestra; se midió mostrándola |
| Titular de la intro (palabra por palabra) | `components/home/contacto.tsx:19` (`TITULAR_INTRO`) | 34 | 2 líneas en el bloque de `min(47.5rem, 100% − 2.5rem)` | 70 (peor 62) | 57 (peor 54) | **50** | Cada palabra suma 90 ms a la entrada. Sin palabras repetidas: la `key` de cada span es la palabra (`contacto.tsx:44`) |
| Título de la tarjeta | `components/home/contacto.tsx:59` | 29 | `max-w-[16ch]`, 2 líneas | 39 (peor 30) | 35 (peor 28) | **31** | **Al límite** con palabras desfavorables (peor 28 en el celular). Duplicado en `contact-cta.tsx:21` (fichas) |
| Bajada de la tarjeta | `components/home/contacto.tsx:62-63` | 95 | `max-w-[44ch]`: 2 líneas en escritorio, 3 en el celular | 100 (peor 92) | 105 (peor 99) | **95** | **Al límite** en escritorio (con el margen serían 90; con otras palabras, 92 ya va a tres líneas). Duplicado en `contact-cta.tsx:22` |

### 11. Footer

Lo único propio del footer es "© {año} Innercare", que no se edita ni afecta el diseño. Lo demás es compartido:

| Texto | Dónde | Largo actual | Regla de diseño | Máximo escritorio | Máximo celular | Límite propuesto | Nota |
|---|---|---|---|---|---|---|---|
| Tagline con punto (compartido) | `components/site-footer.tsx:28` | 49 | Escritorio: los tres bloques del footer en una fila; celular: una línea | 134 (peor 130) | 57 (peor 55) | **50** | Es el `tagline` (con el punto que suma el footer): mandan el hero y la OG, con el mismo 50 |
| Dirección "{calle}, {localidad}" (compartida) | `components/site-footer.tsx:31` | 40 | Escritorio: los tres bloques en una fila; celular: 2 líneas con la provincia | 128 (peor 124) | 111 (peor 106) | **95** | Es `sedePrincipal`: el límite fuerte lo pone la card del mapa (sección 9) |

### 12. SEO y redes

| Texto | Dónde | Largo actual | Regla | Límite propuesto | Nota |
|---|---|---|---|---|---|
| `title` por defecto | `app/layout.tsx:23` | 55 | Convención de buscadores | **60** | |
| `description` | `app/layout.tsx:27` | 223 | Convención de buscadores | **240** | El texto actual mide 223 y la migración no cambia textos; Google corta cerca de los 160 (la ayuda del campo lo dice) |
| `openGraph.title` | `app/layout.tsx:36` | 60 | Convención | **60** | **Al límite**. Repite el `tagline` a mano |
| `openGraph.description` | `app/layout.tsx:38` | 127 | Convención | **160** | |
| `description` de `/contacto` | `app/contacto/page.tsx:13` | 124 | Convención | **160** | El `title` sale de la plantilla: "Contacto \| Innercare" (20) |

Imagen OG (`/opengraph-image`, 1200 × 630), medida como se cuenta en el método:

| Texto | Dónde | Largo actual | Regla de diseño | Máximo | Límite propuesto | Nota |
|---|---|---|---|---|---|---|
| Titular (`tagline`), 72 px en 548 px útiles | `app/opengraph-image.tsx:91` | 48 | 4 líneas, como hoy (con 5, los huecos entre el logo, el titular y el resumen bajan de 46 a unos 10 px) | 59 (peor 55) | **50** | Unas 17 letras por línea (30,5 px de ancho medio de glifo). Con 5 líneas entraría hasta 75 (peor 65), apretado |
| Resumen ANMAT (`habilitacionesResumen`), 22 px en 476 px | `app/opengraph-image.tsx:114` | 93 | 2 líneas, como hoy | 98 (peor 92) | **93** | **Al límite** (con otras palabras, 92 ya va a tres líneas). Una tercera línea entra con el titular en cuatro: hasta 144 (peor 138) |

### 13. Panel y página `/contacto`

El panel se abrió desde el hero (576 px de ancho en escritorio, la pantalla entera en el celular); la página se cargó directa.

| Texto | Dónde | Largo actual | Regla de diseño | Máximo escritorio | Máximo celular | Límite propuesto | Nota |
|---|---|---|---|---|---|---|---|
| Título (`contactoTextos.titulo`) | `content/contact.ts:30` | 8 | Una línea (`headline-lg` en el panel; `display-lg` en la página) | 20 (peor 19) | 24 (peor 23) | **18** | Limita la página en escritorio (columna de 5/12). Repetido a mano en `metadata.title` (`app/contacto/page.tsx:11`) |
| Bajada (`contactoTextos.bajada`) | `content/contact.ts:31-32` | 120 | 3 líneas (panel: `max-w-[44ch]`; página: `max-w-[40ch]`) | 130 (peor 120) | 120 (peor 110) | **120** | **Al límite**: en la página, con otras palabras, 120 ya va a cuatro líneas, y en el panel del celular, 110 |
| Etiqueta de motivo | `content/contact.ts:5-8` | 26 | Una línea en la píldora (dos columnas desde 640 px) | 29 (peor 28) | 40 (peor 38) | **26** | Limita el panel de escritorio. Actual: "Consulta sobre un producto" |
| "¿Preferís otro canal?" | `content/contact.ts:37` | 21 | Una línea | 63+ (peor 63) | 56 (peor 55) | **40** | Tope editorial (el diseño admite 50) |

## Textos que hoy ya están al límite

Ninguno rompe el diseño hoy (la línea de base pasa todas las reglas), pero estos quedan a menos del 10 % de romperlo, o lo romperían con otras palabras del mismo largo. Para ellos el límite propuesto es el largo de hoy, sin margen: alargarlos cambia el diseño.

- **Hero:** la línea ANMAT (93; con 86 de palabras desfavorables ya va a tres líneas y baja la cabeza en el celular).
- **Barra:** la suma de las cuatro etiquetas del menú (49 de 52) y "Plantear un caso" (16 de 18). Junto con "Recorrer los implantes" (22 de 23), la fila de dos botones del celular tiene unos 16 px de holgura.
- **Recorrido:** "Deslizá para continuar" (22, en el celular), el título del cierre (63) y su bajada (88), el título del acetábulo (47) y el valor de spec del hombro (36).
- **Cómo trabajamos:** "Planificación quirúrgica virtual" (32, como paso activo en el celular), la descripción del paso 3 (90) y la leyenda (16, en el celular).
- **Fabricación:** el título (44, en el celular). Y en escritorio tres captions de la tira pasan el ancho de la foto más angosta.
- **Habilitaciones:** la bajada (152).
- **Distribución:** la bajada (119) y la card de Caseros (tipo de 45 con su dirección), que es la más alta y fija el tope de las otras.
- **Contacto:** la bajada de la tarjeta (95) y el título (29, con palabras desfavorables).
- **Panel `/contacto`:** la bajada (120) y la etiqueta de motivo (26).
- **SEO:** la `description` (223) **ya pasa** los 160 convencionales; el `openGraph.title` está justo en 60.

## Combinaciones (no alcanza con un tope por campo)

- **Menú:** cada etiqueta ≤ 15 y **las cuatro juntas ≤ 52**.
- **Botones del hero:** "Plantear un caso" + "Recorrer los implantes" ≤ 41 (hoy 16 + 22 = 38).
- **Descripción de la parada y cantidad de specs:** ≤ 180 con hasta tres specs; **≤ 100 con cuatro** (cada fila de spec ocupa lo que unas dos líneas de descripción en escritorio).
- **Leyenda de Cómo trabajamos:** cada etiqueta ≤ 16 y **las tres juntas ≤ 40** (hoy 5 + 14 + 16 = 35; en el celular la fila entra hasta 3 × 15 = 45).
- **Card del mapa:** el tipo que se muestra (las sucursales muestran "Sucursal") y "{calle}, {ciudad}" comparten el alto: en el celular entran unas cinco líneas de unos 22 caracteres. Hoy suman 76 en Caseros y 78 en Alberti; como regla, **tipo mostrado + dirección ≤ 78**.

## Resumen: límite propuesto por campo

Listo para copiar a un esquema. Los nombres siguen `content/` donde el texto ya está ahí; los que hoy viven en componentes llevan un nombre descriptivo.

| Campo | Límite |
|---|---|
| `carga.palabras[]` | 32 |
| `carga.etiqueta` ("Cargando") y `carga.etiquetaListo` ("Listo") | 20 |
| `menu.marca` ("Innercare": alt de los logos y copyright del footer) | 20 |
| `navLinks[].label` | 15 (las cuatro juntas ≤ 52) |
| `contactLabel` ("Plantear un caso") | 18 |
| `tagline` | 50 |
| `hero.subtitulo` | 100 |
| `habilitacionesResumen` | 93 |
| `hero.recorrer` ("Recorrer los implantes") | 23 (con `contactLabel` ≤ 41) |
| `hero.avisoDeslizar` | 38 |
| `recorrido.avisoContinuar` | 22 |
| `recorrido.etiquetas.*` (píldoras «A medida» y «Catálogo», enlace «Ficha técnica (PDF)») | 20 |
| `paradas[].zona` | 36 |
| `paradas[].titulo` | 47 |
| `paradas[].descripcion` | 180 (100 si la parada tiene cuatro specs) |
| `paradas[].specs[].label` | 16 |
| `paradas[].specs[].valor` | 36 |
| `cierreRecorrido.titulo` | 63 |
| `cierreRecorrido.texto` | 88 |
| `proceso.titulo` ("Cómo trabajamos cada caso") | 32 |
| `proceso[].title` | 32 |
| `proceso[].description` | 90 |
| `proceso.leyenda[]` | 16 (las tres juntas ≤ 40) |
| `textosHome.fabricacion.titulo` | 44 |
| `textosHome.fabricacion.texto` | 110 |
| `manufactura[].nombre` | 23 |
| `manufactura[].texto` | 140 |
| `fabricacion.volverAVer` | 20 |
| `fotosPlanta[].titulo` | 48 |
| `fotosPlanta[].subtitulo` | 28 |
| `textosHome.habilitaciones.titulo` | 35 |
| `textosHome.habilitaciones.texto` | 152 |
| `habilitaciones[].detalle` | 60 |
| `habilitaciones[].referencia` (cada parte separada por " · ") | 25 |
| `textosHome.distribucion.titulo` | 35 |
| `textosHome.distribucion.texto` | 119 |
| `sedes[]`: "{ciudad}, {provincia}" (sin código postal ni "Provincia de ") | 38 |
| `sedes[].tipo` (cuando se muestra entero como rol) | 23 |
| `sedes[].tipo` (en la card) | 45 |
| `sedes[].calle` | 59 |
| `sedes[].localidad` | 25 |
| `sedes[]`: "{calle}, {ciudad}" | 61 (tipo mostrado + dirección ≤ 78) |
| `contacto.kicker` | 40 |
| `contacto.titularIntro` | 50 |
| `contacto.titulo` ("¿Tenés un caso para resolver?") | 31 |
| `contacto.bajada` | 95 |
| `contactoTextos.titulo` | 18 |
| `contactoTextos.bajada` | 120 |
| `motivosContacto[].label` | 26 |
| `contactoTextos.otrosCanales` | 40 |
| `contactoTextos.enviar` y `enviando` (botón del formulario) | 24 |
| `metadata.title` | 60 |
| `metadata.description` | 240 (el texto actual mide 223; Google corta cerca de 160) |
| `openGraph.title` | 60 |
| `openGraph.description` | 160 |
| `contacto.metadata.description` | 160 |

## Capturas de referencia

`capturas/capturar.mjs` saca, contra el mismo servidor, las capturas de la versión de hoy en `capturas/base/` (ignoradas por git): escritorio 1440 × 900 a 1x y celular 390 × 844 a 2x, sin movimiento reducido. Vistas: `hero`, `parada-<id>` (las seis), `cierre`, `proceso`, `fabricacion`, `habilitaciones`, `sedes`, `contacto`, `footer` y `contacto-pagina` (`/contacto` entera), con nombres `base-<vista>-<escritorio|celular>.png`. También guarda `base-texto-<ruta>.txt` (`document.body.innerText` de `/`, `/contacto` y la ficha del fémur, con el JS apagado: el HTML del servidor, entero y en orden) y `base-informe.json` (fuentes y errores de consola). Para comparar después del cambio:

```sh
node docs/landing/textos-editables/capturas/capturar.mjs --url http://localhost:3100 --out docs/landing/textos-editables/capturas/nueva
node docs/landing/textos-editables/capturas/medir-limites.mjs --out docs/landing/textos-editables/capturas/limites-nueva.json
```
