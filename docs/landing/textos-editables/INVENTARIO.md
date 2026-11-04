# Inventario de textos visibles de la landing

Relevamiento de todo el texto que ve (o escucha, con lector de pantalla) quien entra a la home (`app/page.tsx` y lo que monta) y al panel de contacto que se abre desde ella, para decidir qué pasa a un CMS (Keystatic). Fecha: 2026-11-04, rama `cuerpo-unico`.

Fuera del inventario: las fichas `/productos/[slug]`, `/productos` y el enlace "Ver ficha del producto" del recorrido (anotado en su tabla como "fuera de alcance").

Convenciones de las tablas:

- **Texto**: literal, tal cual está en el código (los largos, cortados a unos 80 caracteres con "…").
- **Dónde está hoy**: `archivo:línea` donde está escrito el texto; cuando el texto se lee en otro lado, se indica también dónde se renderiza.
- **Origen**: `content/` (ya tipado en `content/*.ts`), `componente` (escrito dentro de un `.tsx`/`.ts` de `components/` o `app/`), `metadata` (objeto `metadata` de Next) u `otro`.
- **Afecta el diseño**: empieza con `sí` o `no`; después, por qué.
- **Observaciones**: dato regulado, derivaciones, duplicados y pendientes.

## Resumen de conteo

Se cuenta como "texto" cada cadena distinta que llega a la pantalla o al árbol de accesibilidad (una fila por texto; las plantillas con variable, como "Faltan N campos obligatorios", cuentan una vez). Las anclas, slugs, rutas, ids y colores no cuentan (ver "Lo que NO es texto"). Las filas que solo anotan un segundo uso de un texto ya contado (el índice anatómico en la sección 4, las dos de "Imagen OG" en la 12) no suman.

| Medida | Cantidad |
|---|---|
| Textos en total | **235** |
| Ya en `content/*.ts` | **158** (67 %) |
| Escritos dentro de componentes (`components/`, `app/`, incluido `nav-links.ts`) | **68** |
| Metadata de Next (`app/layout.tsx`, `app/contacto/page.tsx`) y el `alt` de la imagen OG | **9** |
| Afectan el diseño (`sí`) | **161** |
| No se renderizan hoy aunque estén en `content/` (alts de `escena` y de los pasos del proceso) | 9 |
| Fuera de alcance (anotados igual) | 1 |

Por sección (textos / de los cuales afectan el diseño):

| Sección | Textos | Afectan el diseño |
|---|---|---|
| Pantalla de carga | 10 | 10 |
| Menú y barra | 8 | 4 |
| Hero (propios; los compartidos van aparte) | 3 | 3 |
| Recorrido, textos generales | 9 (1 fuera de alcance) | 6 |
| Recorrido, paradas (6) | 62 (6 sin renderizar) | 50 |
| Cómo trabajamos | 16 (3 sin renderizar) | 13 |
| Fabricación (con la tira de fotos) | 35 | 23 |
| Habilitaciones | 12 | 12 |
| Distribución | 25 | 20 |
| Contacto (sección de la home) | 4 | 4 |
| Footer | 1 | 0 |
| SEO y redes | 9 | 2 |
| Panel de contacto `/contacto` (formulario) | 37 | 11 |
| Compartidos (aparecen en más de una sección) | 4 | 3 |

## 1. Pantalla de carga

`components/pantalla-carga.tsx`. El HTML del servidor trae "Cargando", "0 %" y la primera palabra; sin JS la pantalla no existe.

| Texto | Dónde está hoy | Origen | Afecta el diseño | Observaciones |
|---|---|---|---|---|
| Estudio del paciente | `components/pantalla-carga.tsx:41` (`PALABRAS[0]`); se renderiza en `:205` y `:209` | componente | sí: `text-headline-lg`, centrada, `text-wrap: balance`, `min-height: 1.2em` (`app/globals.css:1456-1462`), pensada para una línea; la anterior se va hacia arriba. `PALABRAS.length` define las franjas del progreso (`:159`) y cada palabra dura al menos 450 ms (`MINIMO_PALABRA`, `:59`): cambiar la cantidad cambia el ritmo | Las ocho son las etapas del proceso real (comentario `:39`). Repite el título del paso 01 de Cómo trabajamos (`content/customCases.ts:14`) sin importarlo |
| Segmentación 3D | `components/pantalla-carga.tsx:42` | componente | sí: ídem | |
| Planificación quirúrgica | `components/pantalla-carga.tsx:43` | componente | sí: ídem | |
| Diseño del implante | `components/pantalla-carga.tsx:44` | componente | sí: ídem | |
| Titanio biocompatible | `components/pantalla-carga.tsx:45` | componente | sí: ídem | Mismo valor que la spec "Material" del hombro (`content/recorrido.ts:93`) y que `products.ts:69` |
| Mecanizado CNC | `components/pantalla-carga.tsx:46` | componente | sí: ídem | Repite `manufactura[0].nombre` (`content/company.ts:101`) y la spec "Técnica" del hombro (`recorrido.ts:94`) sin importarlos |
| Impresión 3D | `components/pantalla-carga.tsx:47` | componente | sí: ídem | Repite la spec "Técnica" del cráneo y del acetábulo (`recorrido.ts:60`, `:116`) |
| Trazabilidad | `components/pantalla-carga.tsx:48` | componente | sí: ídem | Coincide con `organismo: 'Trazabilidad'` (`company.ts:41`), que es una clave de tipo, no un texto |
| Cargando | `components/pantalla-carga.tsx:215` (`label` de `LatticeLoader`); se renderiza en `components/lattice-loader.tsx:123` y, para lectores, como "Cargando, en curso" (`:132`) | componente | sí: `text-body-sm` a la izquierda del Lattice Loader; el sufijo ", en curso" lo arma el componente | |
| Listo | `components/pantalla-carga.tsx:216` (`doneLabel`); `lattice-loader.tsx:129` y `:132` | componente | sí: ocupa el lugar de "Cargando" al llegar a 100 (los dos van superpuestos, `lattice-loader.tsx:118-130`); una palabra más larga que "Cargando" corre el porcentaje | Se ve apenas, en el último cuadro antes de la salida |

No es texto editable: el número (`<span>0</span>`, `:222`) y el signo `%` (`:223`), con ancho fijo de 3,3 ch en cifras tabulares (`app/globals.css:1520-1527`).

## 2. Menú y barra

`components/nav-links.ts` (etiquetas), `components/site-header.tsx`, `components/desktop-nav.tsx`, `components/mobile-nav.tsx`. Las anclas (`/#recorrido`, etc.) quedan en código.

| Texto | Dónde está hoy | Origen | Afecta el diseño | Observaciones |
|---|---|---|---|---|
| Implantes | `components/nav-links.ts:7` (`navLinks[0].label`); escritorio `desktop-nav.tsx:26` (PillNav), celular `mobile-nav.tsx:125` | componente | sí: la barra mide el 62 % del viewport (mínimo 46 rem) y reparte `1fr_auto_1fr` entre logo, enlaces y botón (`site-header.tsx:88`); si los enlaces crecen, la columna del logo baja de 94 px y pasa al ícono (`.logo-barra`). PillNav con `collapse="never"` (`desktop-nav.tsx:39`): nunca se pliega. En el celular, `--n` = cantidad de enlaces (`mobile-nav.tsx:112`) marca los tiempos del menú | Ancla `/#recorrido`, en código |
| Cómo trabajamos | `components/nav-links.ts:8` | componente | sí: ídem (es la etiqueta más larga) | Ancla `/#proceso`. Distinto del título de la sección ("Cómo trabajamos cada caso", `process.tsx:28`) |
| Fabricación | `components/nav-links.ts:9` | componente | sí: ídem | Ancla `/#fabricacion` |
| Habilitaciones | `components/nav-links.ts:10` | componente | sí: ídem | Ancla `/#habilitaciones`. Distinto del título de la sección ("Habilitados por ANMAT") |
| Innercare, inicio | `components/site-header.tsx:29` (`aria-label` del logo) | componente | no: solo lectores de pantalla | |
| Abrir menú | `components/mobile-nav.tsx:92` (`aria-label` del botón, estado cerrado) | componente | no: solo lectores de pantalla (el botón muestra un ícono) | |
| Cerrar menú | `components/mobile-nav.tsx:92` (estado abierto) | componente | no | |
| Principal | `components/desktop-nav.tsx:32` (`ariaLabel` de PillNav, va a `pill-nav.tsx:832`) y `components/mobile-nav.tsx:116` (`aria-label` del `nav`) | componente | no | Escrito dos veces |

Compartido con otras secciones: "Plantear un caso" (`site-header.tsx:96`, `mobile-nav.tsx:136`) y el `alt="Innercare"` del logo (`site-header.tsx:32` y `:41`), ver "Compartidos". Código muerto: `pill-nav.tsx:906` trae `'Close menu'`/`'Open menu'` en inglés para el burger de React Bits, que con `collapse="never"` no se renderiza.

## 3. Hero

`components/home/hero.tsx` (texto) dentro de la escena de `tour-scroll.tsx`. El titular y la línea ANMAT son compartidos (ver sección 14); acá van los textos propios.

| Texto | Dónde está hoy | Origen | Afecta el diseño | Observaciones |
|---|---|---|---|---|
| Implantes ortopédicos modulares y a medida del paciente, fabricados en titanio en planta propia. | `components/home/hero.tsx:59-60` (texto suelto en el `<p>`) | componente | sí: `max-w-[36ch]`, `text-body-lg`, columna de 6/12 en escritorio. En el celular, el pie del texto del hero (`data-pie-hero`, `hero.tsx:86`) se mide para ubicar la cabeza (`anclaHeroCelular`, `tour-scroll.tsx:135-154`): más líneas bajan el busto. Entra a los 2300 ms (`INTRO_AT.subtitle`) | Comparte idea con la descripción OG (`layout.tsx:38`), que está escrita aparte |
| Recorrer los implantes | `components/home/hero.tsx:80` (hijo de `BotonVidrio`) | componente | sí: `BotonVidrio` exige `children: string` (`boton-vidrio.tsx:19`) y parte el texto letra por letra para el efecto de rodar (`:36`); mismo tamaño que "Plantear un caso" y los dos en una fila de 48 px en el celular (`hero.tsx:62-82`, `flex-wrap`: si no entran, pasan a dos filas) | Lleva a `#recorrido` (la craneoplastía) |
| Deslizá para recorrer el cuerpo | `components/home/hero.tsx:120` (`ScrollCue`) | componente | sí: `aria-hidden`; en el celular `max-w-[10rem]` y `text-balance`, pensado para dos líneas a la altura del cuello (`:117`); en escritorio, una línea abajo a la izquierda, con el riel `.aviso-deslizar`. Se apaga con el desliz (`--desliz-t`) | Decorativo para lectores de pantalla |

Compartidos que se ven acá: "Innovación tecnológica en beneficio del paciente" (`hero.tsx:53`, `FoldText` letra por letra), "Plantear un caso" (`:72`) y "Habilitados por ANMAT para fabricar, importar y distribuir…" (`:91`).

## 4. Recorrido: textos generales

`components/home/tour.tsx`, `components/home/tour-scroll.tsx`, `content/recorrido.ts` (cierre). Índice anatómico, retícula, cierre y avisos.

| Texto | Dónde está hoy | Origen | Afecta el diseño | Observaciones |
|---|---|---|---|---|
| Cuerpo de vidrio con el esqueleto a la vista y seis implantes de titanio: craneoplastía, reconstrucción maxilar, prótesis reversa de hombro, reconstrucción acetabular, endoprótesis de fémur proximal e implante intercalar de fémur | `components/home/tour-scroll.tsx:404` (`aria-label` del `role="img"` del canvas) | componente | no: solo lectores de pantalla | Enumera a mano las seis paradas: si cambia una parada en `recorrido.ts`, hay que corregirlo a mano |
| Implantes del recorrido | `components/home/tour-scroll.tsx:421` (`aria-label` del `nav` del índice) | componente | no | |
| Índice anatómico: Cráneo · Maxilar · Hombro · Acetábulo · Fémur proximal · Diáfisis femoral | `components/home/tour-scroll.tsx:430` (`parada.zona`); el texto vive en `content/recorrido.ts:53`, `:70`, `:87`, `:109`, `:126`, `:150` | content/ | sí: columna izquierda fija desde 1100 px (`.recorrido-indice`, `app/globals.css:1896-1904`), `text-body-sm`; con el hover de proximidad cada nombre se corre hasta 0,875 rem (`:1658-1661`); nombres más largos ensanchan la columna sobre la escena. El mismo `zona` va en la cabecera de la tarjeta (`tour.tsx:87`) | Contados en la tabla de paradas (fila `zona`); acá solo se anota el uso |
| A medida | `components/home/tour.tsx:85` (etiqueta de la tarjeta cuando `parada.tipo === 'a-medida'`) | componente | sí: píldora de `0.8125rem` semibold con anillo del primario, en la cabecera junto a `zona` | Derivada de `tipo` (clave de código); decide también el enlace de abajo (contacto) |
| Catálogo | `components/home/tour.tsx:85` (`tipo === 'catalogo'`) | componente | sí: píldora rellena del primario | Decide "Ver ficha del producto" |
| Ver ficha del producto | `components/home/tour.tsx:135` (solo si hay `productoSlug`: hombro y fémur) | componente | fuera de alcance: enlace a las fichas (`/productos/<slug>`); `.enlace-marca` | **Fuera de alcance** (fichas) |
| Ficha técnica (PDF) | `components/home/tour.tsx:144` (solo si hay `datasheetUrl`: fémur) | componente | sí: segundo enlace `.enlace-marca` en la misma fila (`flex-wrap`) | El archivo es `/endoprotesis-modular-femur-innercare.pdf` (`recorrido.ts:146`, duplicado en `products.ts:47`) |
| Lo que está en el catálogo y lo que no, lo fabricamos nosotros. | `content/recorrido.ts:167` (`cierreRecorrido.titulo`); se renderiza en `components/home/tour.tsx:47` | content/ | sí: `h3` `display-lg`, `max-w-[18ch]`, `text-balance`, en la columna izquierda de `min(37.5rem, 46vw)` (`app/globals.css:1923-1929`) al lado del cuerpo entero; entra con gsap (`data-entra`) cada vez que aparece el cierre | |
| Sistemas modulares listos para pedir y piezas únicas diseñadas con tu equipo quirúrgico. | `content/recorrido.ts:168` (`cierreRecorrido.texto`); `tour.tsx:50` | content/ | sí: `max-w-[46ch]`, `text-body-lg`; misma columna | |
| Deslizá para continuar | `components/home/tour-scroll.tsx:450` (aviso del cierre) | componente | sí: `aria-hidden`; `max-w-[6rem]` en el celular (dos líneas, abajo a la izquierda) y una línea abajo a la derecha en escritorio, con el riel `.aviso-deslizar`; entra último (`data-entra`) | Hermano de "Deslizá para recorrer el cuerpo" del hero |

La retícula del implante activo (`tour-scroll.tsx:412-415`) no tiene texto. El botón "Plantear un caso" del cierre (`tour.tsx:54`) va en "Compartidos". Las vistas de respaldo (`VistaParada`, `VistaCuerpo`, `VistaHero`, `tour.tsx:166`, `:188`, `:226`) llevan `alt=""`: decorativas.

## 5. Recorrido: paradas

`content/recorrido.ts` (`paradas`), renderizado por `TarjetaParada` en `components/home/tour.tsx:68-150`. Los campos son homogéneos en las seis paradas; se lista una fila por campo y parada.

Cómo se renderiza cada campo (vale para las seis):

- `zona`: cabecera de la tarjeta (`tour.tsx:87`, `text-body-sm`) y el índice anatómico (`tour-scroll.tsx:430`).
- `titulo`: `h3` `text-headline-lg` con `text-balance` (`tour.tsx:94`); la tarjeta mide `min(27.5rem, 38vw)` en escritorio (`app/globals.css:1931-1938`) y es una hoja inferior en el celular, abajo de la escena; cuanto más alto el texto, menos escena se ve.
- `descripcion`: `<p>` de `0.9375rem` (`tour.tsx:115`), siempre visible (también en la hoja del celular).
- `specs[].label` / `specs[].valor`: `<dl>` oculto en el celular (`tour.tsx:120`, `hidden min-[820px]:block`); la columna de etiquetas es fija, `7.375rem` (`:124`); el valor va en `font-data-mono tabular-nums` (`:127`).
- `miniatura.alt`: `alt` de la foto que se ve sin WebGL o mientras carga (`tour.tsx:107`); con el 3D, la foto queda tapada por la miniatura de partículas.
- `escena.alt`: **no se renderiza**: la vista de la escena va con `alt=""` (`tour.tsx:166`). El texto existe en `content/` pero nadie lo lee.

| Texto | Dónde está hoy | Origen | Afecta el diseño | Observaciones |
|---|---|---|---|---|
| **Cráneo** (`id: 'craneo'`) | | | | |
| Cráneo | `content/recorrido.ts:53` (`zona`) | content/ | sí: índice y cabecera (ver arriba) | |
| Craneoplastía a medida | `content/recorrido.ts:55` (`titulo`) | content/ | sí: `headline-lg`, ancho de tarjeta | |
| A partir de la tomografía reconstruimos el defecto en 3D y fabricamos la pieza en PMMA o en titanio impreso con estructura trabecular. | `content/recorrido.ts:57` (`descripcion`) | content/ | sí: alto de la tarjeta y de la hoja del celular | Resume `customCases.ts:132` y `:140` |
| Material | `content/recorrido.ts:59` (`specs[0].label`) | content/ | sí: columna fija de 7.375rem | |
| PMMA o titanio trabecular | `content/recorrido.ts:59` (`specs[0].valor`) | content/ | sí: `font-data-mono tabular-nums` | Dato técnico |
| Técnica | `content/recorrido.ts:60` (`specs[1].label`) | content/ | sí: columna fija | |
| Impresión 3D | `content/recorrido.ts:60` (`specs[1].valor`) | content/ | sí: mono | **[pendiente: confirmar con Innercare]** (CLAUDE.md, Pendiente) |
| Craneoplastía a medida en titanio trabecular sobre el biomodelo del cráneo | `content/customCases.ts:142` (`imageAlt` del caso `craneoplastia-titanio`), tomado en `recorrido.ts:40` y `:62` (`miniatura.alt`); `alt` en `tour.tsx:107` | content/ | no: `alt` de la foto de respaldo | Derivado: `caso('craneoplastia-titanio')` lanza error si el id falta (`recorrido.ts:34-38`) |
| Reconstrucción 3D del cráneo con el defecto a cubrir | `content/recorrido.ts:65` (`escena.alt`) | content/ | no | **No se renderiza** (`tour.tsx:166` usa `alt=""`) |
| **Maxilar** (`id: 'maxilar'`) | | | | |
| Maxilar | `content/recorrido.ts:70` (`zona`) | content/ | sí | |
| Reconstrucción para anclaje dentario | `content/recorrido.ts:72` (`titulo`) | content/ | sí | |
| Planificamos la cirugía y fabricamos una estructura de reconstrucción que sirve de base para los implantes dentarios. | `content/recorrido.ts:74` (`descripcion`) | content/ | sí | Resume `customCases.ts:100` |
| Planificación | `content/recorrido.ts:76` (`specs[0].label`) | content/ | sí: columna fija | |
| Quirúrgica virtual 3D | `content/recorrido.ts:76` (`specs[0].valor`) | content/ | sí: mono | |
| Desarrollo | `content/recorrido.ts:77` (`specs[1].label`) | content/ | sí | |
| A pedido médico | `content/recorrido.ts:77` (`specs[1].valor`) | content/ | sí: mono | **[pendiente: confirmar con Innercare]** |
| Biomodelo maxilofacial con la estructura de anclaje para implantes dentarios | `content/customCases.ts:102` (`imageAlt` de `anclaje-dentario`) → `recorrido.ts:41`, `:79` | content/ | no: `alt` de respaldo | Derivado de `customCases.ts` |
| Planificación 3D de la estructura de anclaje sobre el cráneo del paciente | `content/recorrido.ts:82` (`escena.alt`) | content/ | no | **No se renderiza** |
| **Hombro** (`id: 'hombro'`, catálogo) | | | | |
| Hombro | `content/recorrido.ts:87` (`zona`) | content/ | sí | |
| Prótesis modular reversa de hombro | `content/recorrido.ts:89` (`titulo`) | content/ | sí | Igual a `products.ts:62` (`name`) y a `planta.ts:43` (caption), escritos tres veces |
| Un implante que no se fabricaba en el país. Da mayor estabilidad articular y suple la falta de hueso con suplementos combinables. | `content/recorrido.ts:91` (`descripcion`) | content/ | sí | Reescritura de `products.ts:65` (`shortDescription`) |
| Material | `content/recorrido.ts:93` (`specs[0].label`) | content/ | sí | |
| Titanio biocompatible | `content/recorrido.ts:93` (`specs[0].valor`) | content/ | sí: mono | Igual a `products.ts:69` (`material`) |
| Técnica | `content/recorrido.ts:94` (`specs[1].label`) | content/ | sí | |
| Mecanizado CNC | `content/recorrido.ts:94` (`specs[1].valor`) | content/ | sí: mono | Igual a `products.ts:68` (`technique`) |
| Indicación | `content/recorrido.ts:95` (`specs[2].label`) | content/ | sí | |
| Reemplazo de hombro con déficit óseo | `content/recorrido.ts:95` (`specs[2].valor`) | content/ | sí: mono; el más largo de la parada, una línea en la tarjeta de escritorio | Resume `products.ts:71` (`indications`) |
| Prótesis modular reversa de hombro fabricada por Innercare | `content/recorrido.ts:99` (`miniatura.alt`) | content/ | no: `alt` de respaldo | **Duplicado literal** en `products.ts:81` y `planta.ts:42` |
| Implante de hombro posicionado sobre el modelo 3D del paciente | `content/recorrido.ts:103` (`escena.alt`) | content/ | no | **No se renderiza**; duplicado en `products.ts:89` |
| **Acetábulo** (`id: 'acetabulo'`) | | | | |
| Acetábulo | `content/recorrido.ts:109` (`zona`) | content/ | sí | |
| Reconstrucción acetabular en titanio trabecular | `content/recorrido.ts:111` (`titulo`) | content/ | sí: título de dos líneas en la tarjeta | Cerca de `customCases.ts:122` |
| Diseñamos el implante y los alojamientos para tornillos sobre la segmentación 3D de la cadera del paciente. También fabricamos espaciadores en PMMA con alojamiento para cotilo. | `content/recorrido.ts:113` (`descripcion`) | content/ | sí: la descripción más larga de las seis (dos oraciones) | Une `customCases.ts:124` y `:84` |
| Material | `content/recorrido.ts:115` (`specs[0].label`) | content/ | sí | |
| Titanio trabecular | `content/recorrido.ts:115` (`specs[0].valor`) | content/ | sí: mono | |
| Técnica | `content/recorrido.ts:116` (`specs[1].label`) | content/ | sí | |
| Impresión 3D | `content/recorrido.ts:116` (`specs[1].valor`) | content/ | sí: mono | **[pendiente: confirmar con Innercare]** |
| Diseño del implante acetabular con los alojamientos para tornillos | `content/customCases.ts:126` (`imageAlt` de `reconstruccion-acetabular`) → `recorrido.ts:42`, `:118` | content/ | no | Derivado de `customCases.ts` |
| Segmentación 3D de la cadera con la prótesis primaria | `content/recorrido.ts:121` (`escena.alt`) | content/ | no | **No se renderiza** |
| **Fémur proximal** (`id: 'femur'`, catálogo) | | | | |
| Fémur proximal | `content/recorrido.ts:126` (`zona`) | content/ | sí: el nombre más largo del índice junto con "Diáfisis femoral" | |
| Endoprótesis modular de fémur | `content/recorrido.ts:128` (`titulo`) | content/ | sí | Versión corta de `products.ts:17` (`name`) y distinta de `products.ts:18` (`shortName`, "Endoprótesis femoral", que se ve en el select del panel) |
| Sistema modular customizable para pérdida de hueso femoral por trauma o resección. | `content/recorrido.ts:130` (`descripcion`) | content/ | sí | Une `products.ts:20` y `:25` |
| Material | `content/recorrido.ts:132` (`specs[0].label`) | content/ | sí | |
| Titanio Ti-6Al-4V | `content/recorrido.ts:132` (`specs[0].valor`) | content/ | sí: mono | Igual a `products.ts:24` |
| Cuerpo | `content/recorrido.ts:133` (`specs[1].label`) | content/ | sí | |
| 40 y 60 mm × 135° | `content/recorrido.ts:133` (`specs[1].valor`) | content/ | sí: mono, tabular | Spec técnica; resume `products.ts:28`. Cuatro specs: la tarjeta más alta de las seis |
| Vástagos | `content/recorrido.ts:134` (`specs[2].label`) | content/ | sí | |
| Ø10 a 12 mm × 120 a 160 mm | `content/recorrido.ts:134` (`specs[2].valor`) | content/ | sí: mono | Resume `products.ts:29` y `availableSizes` (`:34-46`) |
| Cabezas | `content/recorrido.ts:135` (`specs[3].label`) | content/ | sí | |
| Biolox o Cr-Co, cono morse 12-14 | `content/recorrido.ts:135` (`specs[3].valor`) | content/ | sí: mono | Resume `products.ts:26` (`compatibility`) |
| Componentes modulares de titanio de la endoprótesis femoral | `content/recorrido.ts:139` (`miniatura.alt`) | content/ | no | **Duplicado literal** en `products.ts:51` y `planta.ts:28` |
| Planificación quirúrgica 3D con el plano de resección femoral sugerido | `content/recorrido.ts:143` (`escena.alt`) | content/ | no | **No se renderiza**; duplicado en `products.ts:55` |
| **Diáfisis femoral** (`id: 'intercalar'`) | | | | |
| Diáfisis femoral | `content/recorrido.ts:150` (`zona`) | content/ | sí | |
| Implante intercalar de fémur | `content/recorrido.ts:152` (`titulo`) | content/ | sí | Versión corta de `customCases.ts:47` (`featuredCase.title`) |
| Reconstrucción de un segmento femoral con implante y guías de resección diseñados desde la tomografía del paciente. | `content/recorrido.ts:154` (`descripcion`) | content/ | sí | Reescritura de `customCases.ts:49` (`summary`) |
| Material | `content/recorrido.ts:156` (`specs[0].label`) | content/ | sí | |
| Titanio Ti-6Al-4V | `content/recorrido.ts:156` (`specs[0].valor`) | content/ | sí: mono | De `customCases.ts:71` |
| Contacto óseo | `content/recorrido.ts:157` (`specs[1].label`) | content/ | sí: la etiqueta más larga; entra en los 7.375rem | |
| Estructura trabecular porosa | `content/recorrido.ts:157` (`specs[1].valor`) | content/ | sí: mono | De `customCases.ts:73` |
| Clavo | `content/recorrido.ts:158` (`specs[2].label`) | content/ | sí | |
| Endomedular Ø10 × 360 mm | `content/recorrido.ts:158` (`specs[2].valor`) | content/ | sí: mono | De `customCases.ts:75` |
| Implante intercalar de fémur junto a las guías de resección fabricadas | `content/customCases.ts:63` (`featuredCase.images[2].alt`) → `recorrido.ts:44-48`, `:160` (`imagenIntercalar(2)`) | content/ | no | Derivado; lanza error si falta la imagen (`recorrido.ts:46`). **Duplicado literal** en `planta.ts:22` |
| Guías de resección a medida montadas sobre el modelo del fémur | `content/customCases.ts:58` (`featuredCase.images[1].alt`) → `recorrido.ts:161` (`escena`) | content/ | no | **No se renderiza** |

## 6. Cómo trabajamos

`components/home/process.tsx`, `components/home/process-scroll.tsx`, `content/customCases.ts` (`proceso`).

| Texto | Dónde está hoy | Origen | Afecta el diseño | Observaciones |
|---|---|---|---|---|
| Cómo trabajamos cada caso | `components/home/process.tsx:28` (texto suelto en el `h2`) | componente | sí: `max-w-[16ch]`, `display-lg` (1,875 rem en el celular), `text-balance`; entra con `data-entra` | El único título de sección que no está en `content/` |
| 01 | `content/customCases.ts:13` (`proceso[0].step`); `process-scroll.tsx:217` | content/ | sí: `font-data-mono tabular-nums` en una columna fija de `2.75rem` (`process-scroll.tsx:209`) | Es un número de orden; la pieza de partículas tiene tres formas (`pasoActivo`, `components/animaciones/proceso.ts:365-368`): la cantidad de pasos no puede cambiar sin tocar la animación |
| Estudio del paciente | `content/customCases.ts:14` (`proceso[0].title`); `process-scroll.tsx:226` | content/ | sí: el título del paso activo crece de 1,125 a 1,375 rem (escritorio: 1,3125 a 1,75) con transición de `font-size` (`:220-223`); todo el bloque va fijo (`sticky`, `h-dvh`) junto a la pieza | Repetido a mano en `PALABRAS[0]` de la pantalla de carga |
| Sobre la tomografía segmentamos la anatomía en 3D. | `content/customCases.ts:15` (`proceso[0].description`); `process-scroll.tsx:233` | content/ | sí: en el celular solo se ve la del paso activo (`hidden` en las otras, `:229-230`); el conjunto tiene que entrar en una pantalla fija | |
| 02 | `content/customCases.ts:22` (`proceso[1].step`) | content/ | sí: ídem 01 | |
| Planificación quirúrgica virtual | `content/customCases.ts:23` (`proceso[1].title`) | content/ | sí: el más largo de los tres; a 1,75 rem puede pasar a dos líneas | |
| Definimos con el equipo quirúrgico el plano de resección y la estrategia. | `content/customCases.ts:24-25` (`proceso[1].description`) | content/ | sí | También la usa la ficha (`app/productos/[slug]/page.tsx:53`, fuera de alcance) |
| 03 | `content/customCases.ts:32` (`proceso[2].step`) | content/ | sí | |
| Diseño y fabricación | `content/customCases.ts:33` (`proceso[2].title`) | content/ | sí | |
| Diseñamos el implante y las guías de resección, y los fabricamos en titanio biocompatible. | `content/customCases.ts:34-35` (`proceso[2].description`) | content/ | sí | |
| Hueso | `components/home/process.tsx:7` (`LEYENDA[0].label`); `:48` | componente | sí: leyenda centrada bajo la pieza, `0.84375rem`, con el punto de color `bg-hueso` | El color está atado al material de la pieza (`proceso.ts`) |
| Zona a resecar | `components/home/process.tsx:8` (`LEYENDA[1].label`) | componente | sí: ídem (`bg-resecar`) | |
| Implante y guías | `components/home/process.tsx:9` (`LEYENDA[2].label`) | componente | sí: ídem (`bg-metal`) | |
| Estudio tomográfico de los miembros inferiores del paciente | `content/customCases.ts:18` (`proceso[0].image.alt`) | content/ | no | **No se renderiza**: la imagen del primer paso es el respaldo sin JS con `alt=""` (`process.tsx:36`). Duplicado en `customCases.ts:53` y `planta.ts:62` |
| Segmentación de la escápula con el plano de resección sugerido | `content/customCases.ts:28` (`proceso[1].image.alt`) | content/ | no | **No se renderiza**; duplicado en `products.ts:85` |
| Implante a medida en titanio con estructura porosa | `content/customCases.ts:38` (`proceso[2].image.alt`) | content/ | no | **No se renderiza** |

## 7. Fabricación

`components/home/manufacturing.tsx`, `components/home/animacion-fabricacion.tsx`, `components/home/carrusel-planta.tsx` (+ `components/flex-carousel.tsx`), `content/company.ts` (`textosHome.fabricacion`, `manufactura`), `content/planta.ts` (`fotosPlanta`).

| Texto | Dónde está hoy | Origen | Afecta el diseño | Observaciones |
|---|---|---|---|---|
| Mecanizado e impresión 3D en la misma planta | `content/company.ts:78` (`textosHome.fabricacion.titulo`); `manufacturing.tsx:46` | content/ | sí: `h2` `display-lg`, `max-w-[22ch]`, `text-balance` | |
| Con las dos tecnologías resolvemos tanto series modulares como piezas únicas para un paciente. | `content/company.ts:80` (`textosHome.fabricacion.texto`); `manufacturing.tsx:58` | content/ | sí: `max-w-[56ch]`, `text-body-lg`; entra con `AnimatedContent` (sube 24 px, desenfoque) | |
| Mecanizado CNC | `content/company.ts:101` (`manufactura[0].nombre`); `manufacturing.tsx:86` | content/ | sí: `h3` de `1.625rem` en la tarjeta izquierda | Repetido a mano en `PALABRAS[5]` y en `recorrido.ts:94` |
| Partimos de un bloque de titanio y retiramos material hasta la forma final. Así fabricamos los sistemas modulares, con medidas repetibles. | `content/company.ts:103` (`manufactura[0].texto`); `manufacturing.tsx:89` | content/ | sí: `max-w-[58ch]`, `text-body-md`; las dos tarjetas son una grilla de dos columnas al 90 % y "Volver a ver" se alinea abajo con `flex-1` (`animacion-fabricacion.tsx:122-130`): textos de distinto largo no desalinean los botones | |
| Impresión 3D en titanio | `content/company.ts:111` (`manufactura[1].nombre`) | content/ | sí: `h3` de la tarjeta derecha | |
| Construimos la pieza capa por capa. Permite estructura trabecular porosa donde el implante toca hueso y piezas únicas para un solo paciente. | `content/company.ts:113` (`manufactura[1].texto`) | content/ | sí: ídem | |
| Centro de mecanizado CNC en la planta de Innercare | `components/home/manufacturing.tsx:16` (`fotos.sustractiva.alt`); `PlantPhoto` en `:76` | componente | no: `alt` de la foto de planta que se ve solo sin JS o si no carga el render (`data-sin-pieza`) | `planta.ts:33-34` avisa que la máquina parece de electroerosión, no un centro CNC: **[pendiente: confirmar]** |
| Equipo de impresión 3D en metal para implantes de titanio | `components/home/manufacturing.tsx:21` (`fotos.aditiva.alt`) | componente | no: ídem | **Duplicado literal** en `company.ts:115` (`manufactura[1].imageAlt`, no usado en la landing) y `planta.ts:56` |
| Volver a ver | `components/home/animacion-fabricacion.tsx:137` (botón con ícono) | componente | sí: `.boton .boton-claro` con ícono a la izquierda, al pie de las dos tarjetas a la misma altura; oculto con movimiento reducido | |
| Fotos de la planta y de los implantes | `components/home/carrusel-planta.tsx:179` (`ariaLabel` del Flex Carousel; `flex-carousel.tsx:1421`) | componente | no: solo lectores de pantalla (solo con la tira WebGL de escritorio) | El valor por defecto del componente, `'Carrusel de imágenes'` (`flex-carousel.tsx:408`), no se usa |
| {título o alt}, {n} de {total} | `components/flex-carousel.tsx:1446` (región `aria-live` del carrusel); `label` en `:1406` con el respaldo `Foto {n}` | componente | no: `sr-only` | Plantilla; "de" es la única palabra |
| Centros de mecanizado CNC en la planta industrial de Innercare | `content/planta.ts:16` (`fotosPlanta[0].alt`); `carrusel-planta.tsx:151` (canvas) y `:187` (tira clásica) | content/ | no: `alt` | **Duplicado literal** en `company.ts:105` (`manufactura[0].imageAlt`). Si el `title` del carrusel estuviera vacío, el `alt` haría de caption (`flex-carousel.tsx:1440`) |
| Centros de mecanizado CNC | `content/planta.ts:17` (`fotosPlanta[0].titulo`); caption en `flex-carousel.tsx:1440` y en la tira clásica `carrusel-planta.tsx:190` | content/ | sí: caption centrada bajo la foto señalada (`text-body-md`, una línea; cambia con animación) y, en la tira clásica, `text-body-sm` bajo cada tarjeta de `min(78vw, 26rem)` | |
| Planta de Alberti | `content/planta.ts:18` (`fotosPlanta[0].subtitulo`); `flex-carousel.tsx:1441`, `carrusel-planta.tsx:191` | content/ | sí: segunda línea de la caption (`font-normal`, `text-on-surface-variant`) | Repite la localidad de la sede `planta` (`company.ts:142`) sin derivarla |
| Implante intercalar de fémur junto a las guías de resección fabricadas | `content/planta.ts:22` (`[1].alt`) | content/ | no | **Duplicado literal** en `customCases.ts:63` (que a su vez es la miniatura de la parada intercalar) |
| Implante intercalar de fémur con sus guías | `content/planta.ts:23` (`[1].titulo`) | content/ | sí: caption, la más larga de las ocho | |
| Pieza a medida en titanio | `content/planta.ts:24` (`[1].subtitulo`) | content/ | sí | |
| Componentes modulares de titanio de la endoprótesis femoral | `content/planta.ts:28` (`[2].alt`) | content/ | no | **Duplicado literal** en `products.ts:51` y `recorrido.ts:139` |
| Componentes modulares de la endoprótesis femoral | `content/planta.ts:29` (`[2].titulo`) | content/ | sí: caption | |
| Mecanizado CNC | `content/planta.ts:30` (`[2].subtitulo`) | content/ | sí | Tercera escritura de "Mecanizado CNC" en `content/` |
| Sector de mecanizado de la planta de Innercare | `content/planta.ts:36` (`[3].alt`) | content/ | no | **[pendiente: confirmar qué máquina es]** (`planta.ts:33-34`) |
| Sector de mecanizado | `content/planta.ts:37` (`[3].titulo`) | content/ | sí | |
| Planta de Alberti | `content/planta.ts:38` (`[3].subtitulo`) | content/ | sí | Segunda vez |
| Prótesis modular reversa de hombro fabricada por Innercare | `content/planta.ts:42` (`[4].alt`) | content/ | no | **Duplicado literal** en `products.ts:81` y `recorrido.ts:99` |
| Prótesis modular reversa de hombro | `content/planta.ts:43` (`[4].titulo`) | content/ | sí | Igual a `recorrido.ts:89` y `products.ts:62` |
| Mecanizado CNC | `content/planta.ts:44` (`[4].subtitulo`) | content/ | sí | |
| Espaciador a medida en PMMA sobre una mesa de acero | `content/planta.ts:48` (`[5].alt`) | content/ | no | |
| Espaciador a medida en PMMA | `content/planta.ts:49` (`[5].titulo`) | content/ | sí | |
| Guías y espaciadores | `content/planta.ts:50` (`[5].subtitulo`) | content/ | sí | |
| Equipo de impresión 3D en metal para implantes de titanio | `content/planta.ts:56` (`[6].alt`) | content/ | no | **Duplicado** (`company.ts:115`, `manufacturing.tsx:21`). **[pendiente: confirmar que la foto es de la planta]** (`planta.ts:53-54`) |
| Impresión 3D en metal | `content/planta.ts:57` (`[6].titulo`) | content/ | sí | |
| Manufactura aditiva | `content/planta.ts:58` (`[6].subtitulo`) | content/ | sí | Igual a `company.ts:109` (`manufactura[1].kicker`, no usado en la landing) |
| Estudio tomográfico de los miembros inferiores del paciente | `content/planta.ts:62` (`[7].alt`) | content/ | no | **Duplicado literal** en `customCases.ts:18` y `:53` |
| Estudio tomográfico del caso | `content/planta.ts:63` (`[7].titulo`) | content/ | sí | |
| Planificación | `content/planta.ts:64` (`[7].subtitulo`) | content/ | sí | |

En `content/company.ts` quedan sin usar en la landing `manufactura[].kicker` (`:98`, `:109`), `.title` (`:100`, `:110`), `.image` e `.imageAlt` (`:104-105`, `:114-115`): el grep de `tecnica.*` en `components/` y `app/` solo encuentra `nombre` y `texto`.

## 8. Habilitaciones

`components/home/credentials.tsx`, `components/home/lectura-habilitaciones.tsx`, `content/company.ts` (`textosHome.habilitaciones`, `habilitaciones`). Todo lo de la tabla es **dato regulado** (disposiciones ANMAT, certificado, GLN): sale de la carpeta institucional, pág. 4.

| Texto | Dónde está hoy | Origen | Afecta el diseño | Observaciones |
|---|---|---|---|---|
| Habilitados por ANMAT | `content/company.ts:83` (`textosHome.habilitaciones.titulo`); `credentials.tsx:31` | content/ | sí: `h2` `display-lg`, `max-w-[16ch]`, entra con `AnimatedContent` | Hermano de `habilitacionesResumen` (hero) |
| Fabricamos, importamos y distribuimos productos médicos bajo habilitación de la ANMAT, y registramos cada unidad en el Sistema Nacional de Trazabilidad. | `content/company.ts:85` (`textosHome.habilitaciones.texto`); `credentials.tsx:33` | content/ | sí: `max-w-[56ch]`, `text-body-lg` | |
| Importación y fabricación de productos médicos | `content/company.ts:24` (`habilitaciones[0].detalle`); `dt` en `lectura-habilitaciones.tsx:88` | content/ | sí: fila de la tabla (`1.09375rem` medium); la línea de luz baja por la tabla y cada fila aparece a su paso, con retraso proporcional a su `offsetTop` (`:60`): más líneas, otro ritmo | Regulado |
| Disposición 0999/17 | `content/company.ts:25` (`habilitaciones[0].referencia`); `dd` en `lectura-habilitaciones.tsx:95-104` (`CifraGenerada`) | content/ | sí: `font-data-mono tabular-nums` semibold en el primario, a la derecha en escritorio; solo los dígitos se "resuelven" desde cifras al azar (`cifra-generada.tsx:21`, `:96`); el ancho no salta porque son tabulares | Regulado. La referencia se parte por `' · '` para ponerla en varias líneas (`:96`) |
| Certificado de Buenas Prácticas de Fabricación | `content/company.ts:30` (`[1].detalle`) | content/ | sí | Regulado |
| N° 298-2023-R | `content/company.ts:31` (`[1].referencia`) | content/ | sí: mono, cifras | Regulado |
| Habilitación de empresa distribuidora de productos médicos | `content/company.ts:36` (`[2].detalle`) | content/ | sí: el `detalle` más largo | Regulado |
| Disposición 9682/16 | `content/company.ts:37` (`[2].referencia`) | content/ | sí | Regulado |
| Inscripción en el Sistema Nacional de Trazabilidad | `content/company.ts:42` (`[3].detalle`) | content/ | sí | Regulado |
| GLN 7798276610001 · Sub-GLN 7798276610018 | `content/company.ts:43` (`[3].referencia`) | content/ | sí: el separador `' · '` es un contrato: la vista lo parte en dos líneas (`lectura-habilitaciones.tsx:96`, `md:whitespace-nowrap`); 13 dígitos por línea, tabulares | Regulado. Si el CMS cambia el separador, las dos partes quedan en una línea |
| ANMAT | `components/home/lectura-habilitaciones.tsx:35` (`otorga`, cuando `organismo === 'ANMAT'`); `small` en `:90` | componente | sí: línea chica bajo cada `detalle` (`text-body-sm`) | Derivado de `organismo` (`company.ts:23`, `:29`, `:35`), que es una clave de tipo (`types.ts:23`) |
| Inscripción | `components/home/lectura-habilitaciones.tsx:35` (cuando `organismo` no es `'ANMAT'`) | componente | sí: ídem | Derivado de `organismo: 'Trazabilidad'` (`company.ts:41`); el valor "Trazabilidad" no se muestra |

## 9. Distribución

`components/home/locations.tsx`, `components/home/mapa-sedes.tsx`, `content/company.ts` (`textosHome.distribucion`, `sedes`, `sedePrincipal`). Direcciones: **dato regulado** (carpeta institucional, pág. 3).

Cómo se arma cada sede en el mapa (`locations.tsx:34-43`, `:137-149`): `ciudad` = `localidad` sin el código postal (regex `^[A-Z]\d{4}[A-Z]{3}\s+`, `:34`); `provincia` = `provincia` sin "Provincia de " (`:35`); `rol` = "Sucursal" si `tipo` empieza con "Sucursal", "Laboratorio" si empieza con "Laboratorio", si no el `tipo` entero (`:38-42`); `tipo` de la card = "Sucursal" o el `tipo` entero (`:43`). La etiqueta muestra `{ciudad}, {provincia}` y debajo `rol` (`mapa-sedes.tsx:270-271`); su `aria-label` es `{rol}, {ciudad}, {provincia}` (`:252`); la card muestra `tipo` y `{calle}, {ciudad}` (`:276-278`) con la foto (`:274`).

| Texto | Dónde está hoy | Origen | Afecta el diseño | Observaciones |
|---|---|---|---|---|
| Distribución a todo el país | `content/company.ts:89` (`textosHome.distribucion.titulo`); `locations.tsx:174` | content/ | sí: `h2` `display-lg` `max-w-[16ch]`; se parte en palabras (`palabras`, `locations.tsx:125-131`) y cada una entra con 0,07 s de escalón: la duración de la entrada crece con la cantidad de palabras | |
| Proveemos a hospitales y clínicas mediante licitaciones y concursos en todo el país, desde nuestra planta y sucursales. | `content/company.ts:91` (`textosHome.distribucion.texto`); `locations.tsx:186` | content/ | sí: `max-w-[56ch]`, palabra por palabra con 0,022 s de escalón | Resume `trayectoria` (`company.ts:9-12`, que no se usa en la landing) |
| Sedes en el mapa de Argentina | `components/home/mapa-sedes.tsx:167` (`aria-label` del `role="group"`) | componente | no | |
| Laboratorio de productos de tecnología médica | `content/company.ts:124` (`sedePrincipal.tipo`); card `mapa-sedes.tsx:276` | content/ | sí: primera línea de la card de `min(10.5rem, …)` (`app/globals.css:1152`; 12 rem desde cierto ancho, `:1196`), `text-body-sm`: a ese ancho ocupa dos o tres líneas | El prefijo "Laboratorio" decide el `rol` corto de la etiqueta (`locations.tsx:40`): si el CMS lo cambia, la etiqueta muestra el `tipo` entero |
| Aráoz de Lamadrid 2741 | `content/company.ts:125` (`sedePrincipal.calle`); card `mapa-sedes.tsx:278`; también en el footer (`site-footer.tsx:31`) | content/ | sí: segunda línea de la card junto a la ciudad | Regulado (dirección). Compartido con el footer |
| B1678EEC Caseros | `content/company.ts:126` (`sedePrincipal.localidad`); mapa `mapa-sedes.tsx:270`, `:278` (sin el código postal, `locations.tsx:34`); footer `site-footer.tsx:31` (entero) | content/ | sí: la etiqueta del mapa (`.mapa-etiqueta`, `0.9375rem`, `max-width: calc(100% - var(--x-etiquetas))`, `app/globals.css:1126-1138`) pasa a dos líneas en columnas angostas (`:1200-1208`) | Regulado. El footer muestra el código postal; el mapa lo quita por regex: el formato `B1678EEC ` es un contrato |
| Provincia de Buenos Aires | `content/company.ts:128` (`sedePrincipal.provincia`); etiqueta `mapa-sedes.tsx:270` (sin "Provincia de "); footer `site-footer.tsx:33` (entero) | content/ | sí: parte de la etiqueta | **Contrato con el mapa**: tras quitar "Provincia de ", el nombre tiene que coincidir con `nombre` de `content/mapa-argentina.ts` (`locations.tsx:47`: `'Buenos Aires'`, `'Santa Cruz'`, `'Chubut'`) para que la provincia se tiña |
| Laboratorio de Innercare en Caseros | `content/company.ts:133` (`sedePrincipal.foto.alt`); `PlantPhoto` en `mapa-sedes.tsx:274` | content/ | no: `alt` de la miniatura de la card | **[pendiente: foto real]** (`company.ts:131`; hoy placeholder "Foto pendiente", que es una imagen) |
| Planta industrial | `content/company.ts:140` (`sedes[1].tipo`) | content/ | sí: etiqueta (`rol`) y card (`tipo`) | Cae en la rama "si no" de `rol` (`locations.tsx:41`): se muestra entero |
| Av. Arquímedes Hernández 192, Parque Industrial N° 1 | `content/company.ts:141` (`sedes[1].calle`) | content/ | sí: la `calle` más larga; en la card de 10,5 rem ocupa tres líneas | Regulado |
| Alberti | `content/company.ts:142` (`sedes[1].localidad`) | content/ | sí | Regulado. Sin código postal (la regex no lo toca) |
| Provincia de Buenos Aires | `content/company.ts:144` (`sedes[1].provincia`) | content/ | sí | Segunda vez; mismo contrato con `mapa-argentina.ts` |
| Centros de mecanizado CNC en la planta industrial de Alberti | `content/company.ts:149` (`sedes[1].foto.alt`) | content/ | no | Casi igual a `company.ts:105` y `planta.ts:16` ("… de Innercare") |
| Sucursal Caleta Olivia | `content/company.ts:154` (`sedes[2].tipo`) | content/ | sí: en la etiqueta y en la card se muestra solo "Sucursal" (`locations.tsx:39`, `:43`) | El prefijo "Sucursal" es un contrato |
| Av. Eva Perón 665 | `content/company.ts:155` (`sedes[2].calle`) | content/ | sí | Regulado |
| Caleta Olivia | `content/company.ts:156` (`sedes[2].localidad`) | content/ | sí | Regulado |
| Provincia de Santa Cruz | `content/company.ts:158` (`sedes[2].provincia`) | content/ | sí | Contrato con `mapa-argentina.ts` (`'Santa Cruz'`) |
| Sucursal de Innercare en Caleta Olivia | `content/company.ts:162` (`sedes[2].foto.alt`) | content/ | no | **[pendiente: foto real]** |
| Sucursal Comodoro Rivadavia | `content/company.ts:166` (`sedes[3].tipo`) | content/ | sí: se muestra "Sucursal" | Contrato del prefijo |
| Viamonte 275 | `content/company.ts:167` (`sedes[3].calle`) | content/ | sí | Regulado |
| Comodoro Rivadavia | `content/company.ts:168` (`sedes[3].localidad`) | content/ | sí: la ciudad más larga: en columna angosta la etiqueta "Comodoro Rivadavia, Chubut" va a dos líneas (comentario `app/globals.css:1200-1201`) | Regulado |
| Provincia de Chubut | `content/company.ts:170` (`sedes[3].provincia`) | content/ | sí | Contrato con `mapa-argentina.ts` (`'Chubut'`) |
| Sucursal de Innercare en Comodoro Rivadavia | `content/company.ts:173` (`sedes[3].foto.alt`) | content/ | no | **[pendiente: foto real]** |
| Sucursal | `components/home/locations.tsx:39` y `:43` (`rol`/`tipo` derivados) | componente | sí: etiqueta y card | Derivado del prefijo del `tipo` |
| Laboratorio | `components/home/locations.tsx:40` (`rol` derivado) | componente | sí: línea chica de la etiqueta de Caseros | Derivado |

No es texto: `latitud`/`longitud` (`company.ts:127`, `:143`, `:157`, `:169`) ubican el pin, ordenan de norte a sur (`locations.tsx:50`) y agrupan las etiquetas que chocan (`CERCANIA`, `:23`, `:64-78`).

## 10. Contacto (sección de la home)

`components/home/contacto.tsx` dentro de `contacto-manos.tsx`. Texto e intro van en el HTML del servidor.

| Texto | Dónde está hoy | Origen | Afecta el diseño | Observaciones |
|---|---|---|---|---|
| Planificamos, diseñamos, fabricamos. | `components/home/contacto.tsx:41` (`span[data-kicker]`) | componente | sí: línea chica de `0.9375rem` semibold en `on-primary-container`; arranca centrada en el bloque (se mide `parrafo.offsetHeight`, `contacto-manos.tsx:144`) y sube a su lugar | |
| Todo empieza con una conversación. | `components/home/contacto.tsx:19` (`TITULAR_INTRO`); se parte por espacios en `:43-48` (`data-palabra`) | componente | sí: `clamp(1.75rem, 3.6vw, 3.125rem)`, `text-balance`, en un bloque de `min(47.5rem, 100% - 2.5rem)` centrado (`app/globals.css:2440-2449`); entra palabra por palabra (0,09 s de escalón) y sube con el scroll según su propio alto (`contacto-manos.tsx:240-243`) | **Atención**: la `key` de cada palabra es la palabra misma (`contacto.tsx:44`); un titular con una palabra repetida rompe las keys de React |
| ¿Tenés un caso para resolver? | `components/home/contacto.tsx:59` (`h2#contacto-titulo`) | componente | sí: `max-w-[16ch]`, `clamp(2.25rem, 1.4rem + 3.2vw, 4.25rem)`, `text-balance`; tarjeta de `min(80rem, 100vw - 2rem)` a dos columnas 7/5; entra con `data-entra` | **Duplicado literal** del valor por defecto de `ContactCta` (`components/contact-cta.tsx:21`, que usan las fichas). El `id="contacto-titulo"` se repite en el encabezado del panel (`contact-parts.tsx:47`): con el panel abierto sobre la home hay dos elementos con el mismo id |
| Enviános los estudios del paciente y coordinamos la planificación quirúrgica junto a tu equipo. | `components/home/contacto.tsx:62-63` | componente | sí: `max-w-[44ch]`, `text-body-lg` al 85 % | **Duplicado literal** de `contact-cta.tsx:22` |

Compartidos que se ven acá: `alt="Innercare"` del logo (`contacto.tsx:73`) y "Plantear un caso" (`:81`).

## 11. Footer

`components/site-footer.tsx`. El mismo en todo el sitio.

| Texto | Dónde está hoy | Origen | Afecta el diseño | Observaciones |
|---|---|---|---|---|
| © {año} Innercare | `components/site-footer.tsx:46` ("Innercare" y "©" sueltos; el año lo calcula `CopyrightYear`, `:6-9`, con `'use cache'`) | componente | no: `0.90625rem` en el tercer bloque | El año no se edita: Cache Components exige fijar cuándo se calcula |

Compartidos que se ven acá: `alt="Innercare"` (`:22`); `tagline` con un punto agregado por el componente (`:28`: `{tagline}.`); `sedePrincipal.calle`, `localidad` (con el código postal "B1678EEC") y `provincia` (`:31-33`, `<address>`); los dos teléfonos del laboratorio (`:37-41`, `font-data-mono tabular-nums`, con `tel:` derivado por `telHref`, `:11`).

## 12. SEO y redes

`app/layout.tsx` (`metadata`, `viewport`), `app/opengraph-image.tsx`, `app/contacto/page.tsx` (`metadata`).

| Texto | Dónde está hoy | Origen | Afecta el diseño | Observaciones |
|---|---|---|---|---|
| Innercare \| Implantes ortopédicos a medida del paciente | `app/layout.tsx:23` (`metadata.title.default`) | metadata | no: título de la pestaña y de los buscadores | |
| %s \| Innercare | `app/layout.tsx:24` (`metadata.title.template`) | metadata | no | Con "Contacto" da "Contacto \| Innercare" |
| Innercare fabrica implantes ortopédicos modulares y a medida del paciente en titanio biocompatible, con planificación quirúrgica 3D. Habilitados por ANMAT para fabricar, importar y distribuir productos médicos en Argentina. | `app/layout.tsx:27` (`metadata.description`) | metadata | no | Reescribe `habilitacionesResumen` ("en todo el país" vs "en Argentina") sin importarlo |
| Innercare | `app/layout.tsx:34` (`openGraph.siteName`) | metadata | no | |
| Innercare \| Innovación tecnológica en beneficio del paciente | `app/layout.tsx:36` (`openGraph.title`) | metadata | no | Repite el `tagline` (`company.ts:7`) escrito a mano, no importado |
| Implantes ortopédicos modulares y a medida del paciente, fabricados en titanio biocompatible por mecanizado CNC e impresión 3D. | `app/layout.tsx:38` (`openGraph.description`) | metadata | no | Variante del subtítulo del hero (`hero.tsx:59-60`) |
| Innercare. {tagline}: cabeza de vidrio con una craneoplastía de titanio. | `app/opengraph-image.tsx:16` (`alt` de la imagen OG, plantilla con `tagline`) | otro (export de la ruta) | no | Derivado de `tagline` |
| Imagen OG: {tagline} | `app/opengraph-image.tsx:91` (renderiza `tagline` de `company.ts:7`) | content/ (vía `otro`) | sí: 72 px Hanken 500 con `letterSpacing -0.035em` en una columna de 620 px dentro de 1200 × 630, generada en el build; un titular más largo baja de línea o se sale. Las fuentes son woff estáticas latin (`assets/fuentes/`): caracteres fuera de latin no se dibujan | No cuenta como texto aparte (es `tagline`); se anota por el diseño |
| Imagen OG: {habilitacionesResumen} | `app/opengraph-image.tsx:114` (`company.ts:16-17`) | content/ (vía `otro`) | sí: 22 px, `maxWidth: 500`, con un punto del primario; dos líneas hoy | Ídem: es `habilitacionesResumen` |
| Contacto | `app/contacto/page.tsx:11` (`metadata.title`) | metadata | no | Mismo texto que `contactoTextos.titulo` (`contact.ts:30`), escrito aparte |
| Consultas sobre implantes ortopédicos, casos a medida y compras institucionales. Respondemos por email, WhatsApp o teléfono. | `app/contacto/page.tsx:13` (`metadata.description`) | metadata | no | |

No es texto: `locale: 'es_AR'` (`layout.tsx:35`), `twitter.card` (`:41`), `themeColor '#003c6f'` (`:46`), `lang="es-AR"` (`:53`), los íconos (`:28-31`). Pendiente: `metadataBase` (`:19-20`).

## 13. Panel de contacto `/contacto` (formulario)

Aparte, porque el usuario decide si entra al CMS. `content/contact.ts`, `components/contact/contact-form.tsx`, `components/contact/contact-parts.tsx`, `components/contact/contact-modal.tsx`, `app/contacto/page.tsx`, `app/contacto/actions.ts`. El panel (`app/@modal/(.)contacto/page.tsx`) y la página completa muestran lo mismo salvo el encabezado (h2 en el panel, h1 en la página) y el cierre ("Cerrar" / "Volver al inicio").

| Texto | Dónde está hoy | Origen | Afecta el diseño | Observaciones |
|---|---|---|---|---|
| Contacto | `content/contact.ts:30` (`contactoTextos.titulo`); panel `contact-parts.tsx:48` (`h2`), página `app/contacto/page.tsx:23` (`h1`) | content/ | sí: `headline-lg` en el panel, `display-lg` en la página | Repetido a mano en `metadata.title` (`contacto/page.tsx:11`) |
| Contanos qué necesitás y te respondemos. Para casos a medida, coordinamos la planificación quirúrgica junto a tu equipo. | `content/contact.ts:31-32` (`contactoTextos.bajada`); `contact-parts.tsx:50` (`max-w-[44ch]`), `contacto/page.tsx:25` (`max-w-[40ch]`) | content/ | sí: encabezado del panel, encima del formulario | |
| Enviar consulta | `content/contact.ts:33` (`contactoTextos.enviar`); `contact-form.tsx:313` | content/ | sí: `.boton .boton-primario` en el pie fijo del panel | |
| Enviando… | `content/contact.ts:34` (`contactoTextos.enviando`); `contact-form.tsx:313` mientras `pending` | content/ | sí: reemplaza a "Enviar consulta" en el mismo botón; un texto más largo lo ensancha mientras envía | |
| Consulta enviada | `content/contact.ts:35` (`contactoTextos.exitoTitulo`); `contact-form.tsx:167` | content/ | no: `headline-md` en la vista de éxito | |
| Gracias. Te vamos a responder al email que nos dejaste. | `content/contact.ts:36` (`contactoTextos.exitoTexto`); `contact-form.tsx:168` (`max-w-[40ch]`) | content/ | no | Hoy el envío no sale a ningún lado (`actions.ts:38-40`) |
| ¿Preferís otro canal? | `content/contact.ts:37` (`contactoTextos.otrosCanales`); `contact-parts.tsx:59` | content/ | no: `text-body-sm` sobre los enlaces de WhatsApp y teléfono | |
| Consulta sobre un producto | `content/contact.ts:5` (`motivosContacto[0].label`); `contact-form.tsx:239` | content/ | sí: cuatro píldoras `relieve` de `min-h-12` en dos columnas (`:223-241`); una etiqueta larga pasa a dos líneas dentro de la píldora | El `id: 'producto'` es código: muestra el select de producto (`:245`) |
| Caso a medida | `content/contact.ts:6` (`motivosContacto[1].label`) | content/ | sí: ídem | `id: 'caso'`: es el que precarga `contactHref` (`nav-links.ts:16`) |
| Compras y licitaciones | `content/contact.ts:7` (`motivosContacto[2].label`) | content/ | sí | |
| Otra consulta | `content/contact.ts:8` (`motivosContacto[3].label`) | content/ | sí | |
| Elegí un motivo. | `content/contact.ts:22` (`erroresContacto.motivo`); navegador `contact-form.tsx:46`, servidor `app/contacto/actions.ts:30` | content/ | no: `text-body-sm text-error` debajo del campo (`contact-form.tsx:351`) | Misma cadena en el cliente y en el servidor |
| Completá tu nombre. | `content/contact.ts:23` (`erroresContacto.nombre`); `actions.ts:31` | content/ | no | |
| Completá la institución. | `content/contact.ts:24` (`erroresContacto.institucion`); `actions.ts:32` | content/ | no | |
| Ingresá un email válido. | `content/contact.ts:25` (`erroresContacto.email`); `contact-form.tsx:51`, `actions.ts:33` | content/ | no | |
| Contanos tu consulta. | `content/contact.ts:26` (`erroresContacto.mensaje`); `actions.ts:34` | content/ | no | |
| Endoprótesis femoral | `content/products.ts:18` (`shortName`); opción del select en `contact-form.tsx:256` vía `contact-parts.tsx:35` | content/ | no: `<option>` nativo | Solo con motivo "producto". Dato de las fichas que se asoma al panel |
| Prótesis reversa de hombro | `content/products.ts:63` (`shortName`); ídem | content/ | no | |
| Motivo | `components/contact/contact-form.tsx:222` (`legend`) | componente | no: `text-body-sm` medium | |
| Producto | `components/contact/contact-form.tsx:246` (`label` del `Field`) | componente | no | |
| Todavía no lo sé | `components/contact/contact-form.tsx:253` (`<option value="">`) | componente | no | |
| Nombre y apellido | `components/contact/contact-form.tsx:270` | componente | no: etiqueta sobre el campo, dos columnas desde `sm` | |
| Institución | `components/contact/contact-form.tsx:273` | componente | no | |
| Email | `components/contact/contact-form.tsx:279` | componente | no | |
| Teléfono | `components/contact/contact-form.tsx:282` | componente | no | |
| Consulta | `components/contact/contact-form.tsx:287` | componente | no | |
| (opcional) | `components/contact/contact-form.tsx:339` (sufijo de las etiquetas con `optional`) | componente | no | Lo llevan "Producto" y "Teléfono" |
| Listo para enviar | `components/contact/contact-form.tsx:303` | componente | sí: `text-body-sm` a la izquierda del botón en el pie; cambia según `remaining` | |
| Falta 1 campo obligatorio | `components/contact/contact-form.tsx:305` | componente | sí: ídem | |
| Faltan {n} campos obligatorios | `components/contact/contact-form.tsx:306` (plantilla) | componente | sí: ídem; `n` sale de `REQUIRED.length - done` (`:30`, `:159`) | |
| Campos obligatorios completos | `components/contact/contact-form.tsx:196` (`aria-label` de la barra de progreso) | componente | no | `aria-valuetext` "{done} de {5}" en `:200` |
| Cerrar | `components/contact/contact-form.tsx:172` (botón tras el éxito, solo en el panel) y `components/contact/contact-modal.tsx:175` (`aria-label` de la X) | componente | no | Dos usos, mismo texto |
| Volver al inicio | `components/contact/contact-form.tsx:176` (enlace tras el éxito, solo en la página `/contacto`) | componente | no | |
| Ancho del panel | `components/contact/contact-modal.tsx:152` (`aria-label` del tirador) | componente | no | Solo escritorio (`lg`) |
| Ancho mínimo / Ancho máximo / {n} % | `components/contact/contact-modal.tsx:156` (`aria-valuetext`) | componente | no | |
| Arrastrá para cambiar el ancho | `components/contact/contact-modal.tsx:158` (`title` del tirador) | componente | no: tooltip nativo | |
| WhatsApp {+54 9 11 2066-5434} | `components/contact/contact-parts.tsx:69` ("WhatsApp" suelto + `whatsappDisplay`, `company.ts:181`) | componente + content/ | no: enlace `.enlace` con ícono | `whatsappDisplay` es `telefonosLaboratorio[0]` (`company.ts:119`, `:181`); el otro teléfono sale debajo (`:78`). Regulado (teléfono) |

## 14. Compartidos

Textos que aparecen en más de una sección. Se cuentan una vez acá.

| Texto | Dónde está hoy | Origen | Afecta el diseño | Observaciones |
|---|---|---|---|---|
| Plantear un caso | `components/nav-links.ts:17` (`contactLabel`). Se renderiza en: barra `site-header.tsx:96`; menú del celular `mobile-nav.tsx:136`; hero `hero.tsx:72`; tarjetas a medida del recorrido `tour.tsx:139`; cierre del recorrido `tour.tsx:54`; contacto de la home `contacto.tsx:81`; `ContactCta` de las fichas `contact-cta.tsx:74` | componente | sí: la etiqueta de siete botones. En la barra tiene 48 px de alto exactos (`site-header.tsx:57-59`); en el hero va del mismo tamaño que "Recorrer los implantes" y los dos en una fila de 48 px en el celular; en el menú del celular, a todo el ancho con rebote; en el cierre y en el contacto, con rebote (`data-rebote`). `contactHref` (`:16`) precarga `?motivo=caso`, que tiene que existir en `motivosContacto` (`contact.ts:6`) | CLAUDE.md: "es la única etiqueta de contacto" |
| Innovación tecnológica en beneficio del paciente | `content/company.ts:7` (`tagline`). Hero `hero.tsx:53` (`HeroTitle` → `FoldText`); footer `site-footer.tsx:28` (con un "." agregado); imagen OG `opengraph-image.tsx:91` y su `alt` `:16` | content/ | sí: en el hero es el `h1` `display-xl` en una columna de 6/12, en peso 500, que entra letra por letra con `FoldText` a 0,025 s por letra (`hero-intro.tsx:45`): con 47 letras tarda ≈ 1,7 s, y la línea de tiempo de la entrada está medida para eso (subtítulo a los 2300 ms, `intro-timeline.ts:12-16`); un titular más largo se pisa con el subtítulo. En la OG va a 72 px en 620 px de ancho. `FoldText` también lo repite en un `sr-only` (`fold-text.tsx:484`) | `openGraph.title` (`layout.tsx:36`) lo repite escrito a mano |
| Habilitados por ANMAT para fabricar, importar y distribuir productos médicos en todo el país. | `content/company.ts:16-17` (`habilitacionesResumen`). Hero `hero.tsx:91` (con `SealCheckIcon`); imagen OG `opengraph-image.tsx:114` | content/ | sí: en el hero `max-w-[46ch]` `text-body-sm`, y es el pie del texto (`data-pie-hero`) que decide la altura de la cabeza en el celular (`anclaHeroCelular`); en la OG, 22 px con `maxWidth 500` | Regulado: resumen de las tres habilitaciones ANMAT (texto acordado en `docs/landing/AJUSTES.md`, comentario `company.ts:14-15`). No se deriva de `habilitaciones[]`: si cambia una disposición, se corrige a mano |
| Innercare | `alt` del logo en `site-header.tsx:32` y `:41`, `site-footer.tsx:22`, `components/home/contacto.tsx:73`, `components/contact-cta.tsx:66` | componente | no: `alt` | Cinco escrituras del mismo `alt`; el header además dice "Innercare, inicio" (`aria-label`) |

También se repiten entre secciones, pero ya están contados en la suya: la dirección y los teléfonos de `sedePrincipal` (Distribución, footer y canales del panel), "¿Tenés un caso para resolver?" y su bajada (`contacto.tsx` y `contact-cta.tsx`), los `alt` duplicados de las fotos (ver Dependencias) y "Mecanizado CNC" / "Impresión 3D" (specs, pantalla de carga, Fabricación, captions).

## Lo que NO es texto y queda en código

- **Anclas e ids de sección**: `#inicio` (`tour.tsx:32`), `#recorrido` (`tour-scroll.tsx:365`, `--k: 1`), `#parada-<id>` (`tour.tsx:10`, `tour-scroll.tsx:366-374`), `#proceso` (`process.tsx:20`), `#fabricacion` (`manufacturing.tsx:37`), `#habilitaciones` (`credentials.tsx:20`), `#sedes` (`locations.tsx:155`), `#contacto` (`contacto.tsx:33`); los `href` del menú (`nav-links.ts:7-10`) y `contactHref` (`:16`). CLAUDE.md: no cambiarlos.
- **Ids y claves de datos**: `ParadaId` y el orden de las paradas (`recorrido.ts:13`, `:50-163`; lo consumen `camara.ts:16`, `:158`, `:174` y `implantes.ts`), `productoSlug` (`recorrido.ts:105`, `:145`) y `slug` de productos (`products.ts:16`, `:61`), ids de casos (`customCases.ts`) que `recorrido.ts:40-42` busca por nombre, ids de habilitaciones (`company.ts:22`…), `organismo` (`'ANMAT' | 'Trazabilidad'`, `types.ts:23`), ids de sedes (`company.ts:123`…), `manufactura[].id` (`'sustractiva' | 'aditiva'`, ligados a `ModoFabricacion` y al mapa `fotos` de `manufacturing.tsx:12-23`), ids de motivos de contacto (`contact.ts:5-8`) y `ContactField` (`actions.ts:5`), `step` como clave de React (`process-scroll.tsx:203`).
- **Rutas de archivos**: `src` de todas las imágenes y fotos (`content/*.ts`, `manufacturing.tsx:14-20`, `pantalla-carga.tsx:51`, `contacto-manos.tsx:294`), `datasheetUrl` (`recorrido.ts:146`, `products.ts:47`), logos (`/logo.png`, `/logo-header.png`, `/favicon.png`), modelos `.glb`, `assets/fuentes/`.
- **Cámara y escena 3D**: todo `components/recorrido-3d/camara.ts` (tomas, pesos, `TRAMOS`, `PAUSA_CIERRE`, `DESLIZ_HERO`, `UMBRAL_ENTRADA_CIERRE`…), `implantes.ts` (fuente, posición, rotación, escala y acabado de cada implante), `estado.ts`, `aspecto-hero.ts`, `escena.tsx`, `miniaturas.tsx`: no tienen texto visible (verificado con grep).
- **Íconos**: `IconKey` (`types.ts:7-14`) y su traducción en `components/icon.tsx`; en la landing no se usa ninguno (`capacidades` no se renderiza). Los íconos de Phosphor en los componentes (`SealCheckIcon`, `ArrowCounterClockwiseIcon`, `ListIcon`, `XIcon`, `CheckCircleIcon`, `CaretDownIcon`, `WhatsappLogoIcon`, `PhoneIcon`, `DotsSixVerticalIcon`) van con `aria-hidden`.
- **Tiempos y umbrales**: `intro-timeline.ts` (`INTRO_AT`), `pantalla-carga.tsx:52-65` (`DURACION_MINIMA`, `TOPE`, `MINIMO_PALABRA`, `ARRANQUE`…), `lectura-habilitaciones.tsx:26-29`, `locations.tsx:23-32` (`INICIO_PINES`, `PASO_PINES`…), `contacto-manos.tsx:51-66`, `animacion-fabricacion.tsx` (`DURACION_FAB`), `process-scroll.tsx` (`DURACION_ENTRADA`), `carrusel-planta.tsx:28`, `:61-63`.
- **Mapa**: `content/mapa-argentina.ts` entero (generado por `npm run mapa`; los `nombre` de provincia son claves de cruce, no textos visibles), `mapa-proyeccion.ts`, `mapa-layout.ts`, `latitud`/`longitud` de las sedes.
- **Colores y tokens**: `LEYENDA[].color` (`process.tsx:7-9`), colores de las fibras (`fibras-escena.tsx:136-138`), `VELO` (`carrusel-planta.tsx:27`), los tokens de `opengraph-image.tsx:40-46`, `themeColor`.
- **Cálculos y derivaciones** (no se editan, se derivan): `telHref` (`site-footer.tsx:11`, `contact-parts.tsx:11`), `whatsappNumber` (`company.ts:182`), `direccionCompleta` (`company.ts:177-178`, sin uso en la landing), `ciudad`/`provincia`/`rol`/`tipo`/`provinciaDe` (`locations.tsx:34-47`), `otorga` (`lectura-habilitaciones.tsx:35`), `CopyrightYear` (`site-footer.tsx:6-9`), `remaining` (`contact-form.tsx:159`), `aria-valuetext` del progreso (`:200`) y del tirador (`contact-modal.tsx:156`), el porcentaje y el `%` de la pantalla de carga (`pantalla-carga.tsx:222-223`), `Foto {n}` y "{n} de {total}" del carrusel (`flex-carousel.tsx:1406`, `:1446`), `PALABRAS.length` como cantidad de franjas (`pantalla-carga.tsx:159`), `REQUIRED.length` (`contact-form.tsx:30`), `pasoActivo` con tres pasos fijos (`animaciones/proceso.ts:365-368`), `navLinks.length` como `--n` del menú (`mobile-nav.tsx:112`).
- **Metadatos no textuales**: `locale`, `twitter.card`, `lang`, `icons`, `size`/`contentType` de la OG.

## Dependencias entre datos

1. **`recorrido.ts` toma imágenes y `alt` de `customCases.ts`**: `caso('craneoplastia-titanio')`, `caso('anclaje-dentario')`, `caso('reconstruccion-acetabular')` (`content/recorrido.ts:40-42`) alimentan `miniatura` en `:62`, `:79`, `:118` (`customCases.ts:141-142`, `:101-102`, `:125-126`); la parada intercalar toma `featuredCase.images[2]` y `[1]` (`recorrido.ts:44-48`, `:160-161`; `customCases.ts:56-65`). Si falta el id o la imagen, el build falla (`recorrido.ts:36`, `:46`).
2. **`datasheetUrl` del fémur en dos archivos**: `content/recorrido.ts:146` y `content/products.ts:47`, con el mismo valor escrito dos veces. La tarjeta muestra "Ficha técnica (PDF)" solo si el campo existe (`tour.tsx:142`).
3. **`alt` duplicados literalmente entre archivos**: hombro `recorrido.ts:99` = `products.ts:81` = `planta.ts:42`, y `recorrido.ts:103` = `products.ts:89`; fémur `recorrido.ts:139` = `products.ts:51` = `planta.ts:28`, y `recorrido.ts:143` = `products.ts:55`; `planta.ts:16` = `company.ts:105`; `planta.ts:22` = `customCases.ts:63`; `planta.ts:56` = `company.ts:115` = `manufacturing.tsx:21`; `planta.ts:62` = `customCases.ts:18` = `customCases.ts:53`; `customCases.ts:28` = `products.ts:85`.
4. **`tagline`** (`company.ts:7`) se renderiza en el hero (`hero.tsx:53`), el footer con punto (`site-footer.tsx:28`), la imagen OG y su `alt` (`opengraph-image.tsx:16`, `:91`); `app/layout.tsx:36` lo repite escrito a mano. Su largo fija el ritmo de la entrada (`hero-intro.tsx:45`, `intro-timeline.ts:12-16`).
5. **`habilitacionesResumen`** (`company.ts:16-17`) va al hero (`hero.tsx:91`) y a la OG (`opengraph-image.tsx:114`); es un resumen manual de `habilitaciones[]` (`:20-45`); `layout.tsx:27` lo reescribe en la descripción.
6. **`contactLabel` y `contactHref`** (`nav-links.ts:16-17`): siete botones (ver Compartidos); `?motivo=caso` tiene que coincidir con `motivosContacto[1].id` (`contact.ts:6`) y lo valida `isMotivoContacto` en `contact-parts.tsx:30`.
7. **`sedePrincipal`** (`company.ts:122-133`) alimenta el footer (`site-footer.tsx:31-41`), el mapa (vía `sedes`, `locations.tsx:135`) y los canales del panel (`contact-parts.tsx:56-80`); `whatsappDisplay`/`whatsappNumber` salen de `telefonosLaboratorio[0]` (`company.ts:119`, `:181-182`).
8. **Contratos de formato en las sedes** (`locations.tsx:34-47`): `localidad` con código postal `B1678EEC ` que la regex quita; `provincia` con el prefijo "Provincia de " y, sin él, igual a `nombre` en `content/mapa-argentina.ts` (si no coincide, la provincia no se tiñe al activar la sede); `tipo` con los prefijos "Sucursal" / "Laboratorio" que deciden el rótulo corto. `latitud` ordena de norte a sur (`:50`) y agrupa etiquetas (`:23`, `:64-78`).
9. **Habilitaciones**: `otorga` deriva "ANMAT"/"Inscripción" de `organismo` (`lectura-habilitaciones.tsx:35`); `referencia` se parte por `' · '` (`:96`) y `CifraGenerada` solo anima los dígitos (`cifra-generada.tsx:21`, `:96`).
10. **El `aria-label` del cuerpo 3D** (`tour-scroll.tsx:404`) enumera a mano las seis paradas de `recorrido.ts`; el índice anatómico sí las lee (`:423-433`); `camara.ts:174` (`ORDEN_PARADAS`), `implantes.ts` y las anclas `#parada-<id>` dependen de los mismos ids.
11. **Cómo trabajamos**: tres pasos en `customCases.ts:11-41` y tres formas en la pieza (`animaciones/proceso.ts:365-368`); `proceso[0].image` es el respaldo sin JS (`process.tsx:18`, `:35`); `proceso[1].description` también la usa la ficha (`app/productos/[slug]/page.tsx:53`); los colores de `LEYENDA` (`process.tsx:7-9`) son los de la pieza.
12. **Pantalla de carga**: `PALABRAS.length` = franjas del progreso (`pantalla-carga.tsx:159`); las palabras repiten a mano títulos y specs de `content/` ("Estudio del paciente", "Mecanizado CNC", "Impresión 3D", "Titanio biocompatible").
13. **Formulario**: `erroresContacto` se usa en el navegador (`contact-form.tsx:46-52`) y en el servidor (`actions.ts:30-34`); `REQUIRED` (`contact-form.tsx:30`) da los textos "Falta…"/"Faltan…" y el `aria-valuetext`; el select lista `products[].shortName` (`contact-parts.tsx:35`, `products.ts:18`, `:63`); el panel y la página renderizan `contactoTextos` dos veces (`contact-parts.tsx:48-50`, `contacto/page.tsx:23-25`).
14. **Contacto de la home y `ContactCta`**: título y bajada iguales escritos dos veces (`contacto.tsx:59`, `:62-63` y `contact-cta.tsx:21-22`); el `id="contacto-titulo"` está en `contacto.tsx:56` y en `contact-parts.tsx:47` (lo referencian `contacto.tsx:29` y `contact-modal.tsx:133`): id duplicado cuando el panel se abre sobre la home.
15. **`TITULAR_INTRO`** se parte en palabras con `key={palabra}` (`contacto.tsx:43-48`): no admite palabras repetidas.
16. **Hero y celular**: el pie de `habilitacionesResumen` (`data-pie-hero`, `hero.tsx:86`) se mide en `tour-scroll.tsx:135-154` (`anclaHeroCelular`) y decide la altura de la cabeza, el aviso de deslizar y la captura de respaldo (`--ancla-hero`): el largo del titular, del subtítulo y de la línea ANMAT mueve el 3D.
17. **`manufactura[].id`** une el contenido (`company.ts:98`, `:108`) con `ModoFabricacion` (`animaciones/fabricacion.ts:32`) y el mapa `fotos` (`manufacturing.tsx:12-23`); los campos `kicker`, `title`, `image`, `imageAlt` no se usan en la landing.
18. **Captions del carrusel**: `titulo` y `subtitulo` de `planta.ts` se ven en el canvas (`flex-carousel.tsx:1440-1441`) y en la tira clásica (`carrusel-planta.tsx:190-191`); si `titulo` estuviera vacío, el `alt` ocuparía su lugar (`flex-carousel.tsx:1406`, `:1440`).
19. **Metadata**: `metadata.title.template` (`layout.tsx:24`) compone "Contacto | Innercare" con `contacto/page.tsx:11`; "Contacto" también está en `contact.ts:30`.
20. **Sin uso en la landing** (en `content/` pero nadie los lee desde `app/page.tsx` ni el panel): `trayectoria` (`company.ts:9-12`), `capacidades` (`:48-72`), `direccionCompleta` (`:177-178`), `featuredCase.kicker/title/summary/guias/diseno` y los `caption` de sus imágenes (`customCases.ts:44-77`), los ocho `customCases` salvo los tres que toma `recorrido.ts`, `manufactura[].kicker/title/image/imageAlt`, `proceso[].image.alt` (renderizado con `alt=""`), `paradas[].escena.alt` (ídem) y, de `products.ts`, todo salvo `shortName` (select del panel) y los `alt` que `recorrido.ts` copia a mano.
