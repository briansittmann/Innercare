# Verificación de la migración a Keystatic

Fecha: 2026-11-04, rama `textos-editables`. Objetivo: que todos los textos de la landing se editen desde el panel (`/keystatic`) **sin un solo cambio visible en el sitio**. Acá quedan los resultados exactos de las tres comparaciones (volcado del contenido, HTML servido y panel) y lo que se probó de la compuerta del build.

## 1. Volcado del contenido (`scripts/volcar-contenido.mjs`)

El script importa todos los exports de `content/*.ts` (con los ganchos de `scripts/cargador-ts.mjs`: Node 24 saca los tipos solo, pero no resuelve imports sin extensión ni JSON sin atributo) y los vuelca a un JSON con las claves ordenadas. Se corrió sobre el commit `d4b24eb` (antes) y sobre el árbol migrado (después), y se compararon clave por clave.

Resultado: **todos los valores que existían antes son idénticos**, salvo:

| Diferencia | Dónde | Por qué |
|---|---|---|
| `datasheetUrl`: `/endoprotesis-modular-femur-innercare.pdf` → `/fichas/femur/ficha.pdf` | `recorrido.paradas[4]` y `products.getProducts[0]` | Pedido: el PDF pasa a `public/fichas/femur/ficha.pdf`, donde lo guarda el panel, y la ficha del producto lo toma de la parada |
| Clave nueva `rol` (`laboratorio`, `planta`, `sucursal`) | `company.sedes[*]` y `company.sedePrincipal` | El tipo de sede pasó a un desplegable del panel (pedido); la vista deriva de ahí los rótulos «Sucursal» y «Laboratorio» que antes sacaba del prefijo de `tipo`. No cambia el HTML |

Exports nuevos (solo después, sin equivalente antes): `company.fabricacionTextos`, `company.distribucionTextos`, `contact.contactoHome`, `customCases.procesoTextos`, `recorrido.recorridoTextos` y los módulos `hero`, `menu`, `carga` y `seo`: son los textos que antes estaban escritos dentro de componentes.

Volcados en el scratchpad de la sesión (`contenido-antes.json`, `contenido-despues.json`, `diff-volcado.txt`).

## 2. HTML servido (`next build && next start -p 3200`)

Antes (commit `d4b24eb`, árbol limpio) y después, se bajaron con `curl` `/`, `/contacto` y `/productos/endoprotesis-modular-femur-customizable`, y se extrajo el texto visible más los atributos que leen los lectores de pantalla y las redes (`alt`, `aria-label`, `title`, `download`, `<title>` y las `<meta>` de descripción y Open Graph), una entrada por línea y sin hashes de chunks ni ids de React (`qa/texto.mjs` del scratchpad). `diff` de los tres:

- `/` (377 líneas en los dos): dos diferencias, las dos intencionales.
  - `download=` → `download=endoprotesis-modular-femur-customizable-ficha-tecnica.pdf` (el archivo ahora se llama `ficha.pdf`; el atributo le da un nombre que diga qué es).
  - `twitter:image=http://localhost:3000/opengraph-image?…` → `…/opengraph-image-1whei1?…`: al mover `opengraph-image.tsx` al grupo `(sitio)`, Next le pone un sufijo a la ruta de la imagen (las rutas de metadatos dentro de un grupo llevan un hash). La imagen se bajó de la ruta nueva y es **idéntica byte a byte** a la de antes (281 676 bytes). El `og:image` apunta a la ruta nueva.
- `/contacto` (66 líneas): solo la ruta de la imagen OG, como arriba.
- `/productos/endoprotesis-modular-femur-customizable` (91 líneas): **sin diferencias**.

El id renombrado del contacto (`contacto-titulo` → `contacto-cierre-titulo`) no aparece en el diff porque los ids no son texto visible; se comprobó en el código que el panel conserva `contacto-titulo` y `contact-modal.tsx` lo sigue referenciando.

Códigos de respuesta después del cambio (`next start` sin `NEXT_PUBLIC_KEYSTATIC_PROYECTO`, es decir, producción sin Cloud):

| Ruta | Código |
|---|---|
| `/`, `/contacto`, `/productos/endoprotesis-modular-femur-customizable` | 200 |
| `/opengraph-image-1whei1` | 200, `image/png` |
| `/fichas/femur/ficha.pdf` | 200, `application/pdf` |
| `/no-existe` | 404 con `app/global-not-found.tsx` («Página no encontrada \| Innercare») |
| `/keystatic` | 404, pero con la 404 genérica de Next («404: This page could not be found.»), no la de marca: el `notFound()` estaba en el layout raíz del panel. Corregido en la sección 8 |
| `/api/keystatic/tree` | 404, `Not found` |

Tabla de rutas del build: `/` ○, `/_not-found` ○, `/(.)contacto` ◐, `/api/keystatic/[...params]` ƒ, `/contacto` ◐, `/keystatic/[[...params]]` ◐, `/opengraph-image-1whei1` ○, `/productos` ○, `/productos/[slug]` ◐ con las dos fichas ○.

## 3. Compuerta del build (`npm run contenido`)

Sobre el contenido real: `Contenido OK: 10 secciones validadas.` Después, cada caso se provocó a mano en `content/datos/*.json` y se volvió atrás (los archivos quedaron byte a byte como antes):

| Caso | Mensaje |
|---|---|
| JSON roto en `hero.json` | `Hero: content/datos/hero.json no es un JSON válido (Expected double-quoted property name in JSON at position 18 …)` |
| Clave que el esquema no conoce | `Distribución: la clave «viejo» no existe en el esquema (¿quedó de una versión anterior?)` |
| Calle vacía, latitud fuera de rango, teléfono mal escrito, provincia inventada | `Distribución: Sedes › 2 › Calle y número: no puede quedar vacío` · `Sedes › 2 › Latitud: tiene que ser como máximo -21` · `Sedes › 3 › Teléfonos › 1: Formato: +54 9 11 2066-5434 (con el código de país y el guion).` · `Sedes › 4 › Provincia: no es una de las opciones del desplegable` |
| Parada sin datos técnicos, título vacío, descripción de 250 caracteres | `Recorrido de implantes: Cráneo › Datos técnicos: tiene que tener al menos 1 elemento` · `Maxilar › Título: no puede quedar vacío` · `Acetábulo › Descripción: no puede tener más de 190 caracteres` |
| Referencia ANMAT sin número, organismo inventado, id repetido, dos palabras en la pantalla de carga | `Habilitaciones: Filas de la tabla › 1 › Disposición o número: Escribí la referencia con su número, como «Disposición 0999/17» o «N° 298-2023-R».` · `Filas de la tabla › 2 › Quién la otorga: no es una de las opciones del desplegable` · `Filas de la tabla: el identificador «anmat-fabricacion» está repetido` · `Pantalla de carga: Etapas del proceso: tiene que tener al menos 3 elementos` |
| Sin sede principal, id de sede repetido, PDF `.gif`, PDF que no está en `public/` | `Distribución: tiene que haber exactamente una sede principal marcada (hay 0): es la del footer y el contacto` · `Distribución: Sedes: el identificador «planta» está repetido` · `Recorrido de implantes: Fémur proximal › Ficha técnica (PDF): el archivo «/fichas/femur/ficha.gif» no es un PDF` · `Hombro › Ficha técnica (PDF): no está el archivo public/fichas/hombro/ficha.pdf` |

Las comprobaciones propias (sede principal, PDF, ids, combinaciones) corren por sección, sobre las secciones cuyo esquema pasó: Keystatic corta la lectura de una sección al primer grupo de errores de esquema, pero las demás secciones se leen y se comprueban igual. En todos los casos el script termina con código 1 y `npm run build` no llega a `next build`.

La compuerta también atrapó un límite real: la descripción para buscadores mide 223 caracteres y el límite provisional era 220; quedó en 240 (`LIMITES.seoDescripcion`).

## 4. Panel en local (`next dev -p 3200`, Chrome sin ventana con patchright)

Script `qa/panel-innercare.mjs` del scratchpad; capturas en `docs/landing/textos-editables/capturas/panel-*.png` (ignoradas por git).

- Tablero (`panel-tablero.png`): marca «Innercare» con el ícono, menú agrupado en Portada (Hero, Recorrido de implantes), Secciones (Cómo trabajamos, Fabricación, Habilitaciones, Distribución, Contacto) y Sitio (Menú y footer, Pantalla de carga, SEO y redes).
- Hero (`panel-hero.png`): se cambió «Aviso de deslizar» por «Deslizá para ver el cuerpo entero» y se guardó: `content/datos/hero.json` cambió y el HTML de `/` servido por `next dev` trajo el texto nuevo y no el viejo. Se volvió atrás desde el panel: JSON y home restaurados. El archivo que escribe Keystatic quedó **byte a byte igual** al que había escrito a mano (mismo orden de claves y formato de dos espacios).
- Validación en el panel (`panel-hero-validacion.png`): con el aviso vacío, «Save» no guarda y muestra «Aviso de deslizar must not be empty» (los mensajes de validación de Keystatic salen en inglés con `locale: 'es-ES'`, issue #1578); el JSON quedó intacto.
- Recorrido (`panel-recorrido.png`): se subió el PDF del fémur a la parada Hombro: Keystatic lo guardó en `public/fichas/hombro/ficha.pdf` y escribió `"ficha": "/fichas/hombro/ficha.pdf"`, lo que confirma el contrato de rutas (`directory: 'public/fichas'` + la ruta del campo `hombro/ficha`). Se quitó un archivo desde el panel y se restauró todo a mano (el clic de «Remove» del script cayó en el fémur en vez del hombro; se repuso el PDF del fémur desde el índice de git y se borró el del hombro).
- Consola del navegador: un `404` de un recurso del panel (sin efecto visible); ningún error de JavaScript.

## 5. Build, lint y tipos

`npm run build` (compuerta + `next build`), `npm run lint` y `npx tsc --noEmit` pasan sin errores sobre el árbol final. Dos avisos conocidos de antes: `metadataBase` sin definir (pendiente de CLAUDE.md). Una vez `next build` falló por tipos generados viejos en `.next/dev/types/validator.ts` (todavía describían `app/layout.tsx`, `app/@modal/[...catchAll]`…): se borró esa carpeta y se regeneró.

## 6. Límites medidos (segunda pasada)

Los límites provisionales de `LIMITES` (`keystatic.esquema.ts`) se reemplazaron por los medidos en 1440×900 y 390×844 (`LIMITES.md`), con estas decisiones:

- `metadata.description` mide 223 y pasa los 160 convencionales: tope 240 y la ayuda del campo avisa que Google corta cerca de los 160. El texto no se tocó.
- `openGraph.title` es `"{marca} | {titular del hero}"` y hoy mide exactamente 60: el tope de 60 lo comprueba la compuerta sobre la combinación (el titular solo tiene 50).
- Las partes de la referencia ANMAT (separadas por « · ») se validan por parte, con el patrón del campo (hasta 25 cada una) más un tope total de 55.
- `sede.calle`: el pedido decía 40 por campo, pero la dirección de Alberti ya mide 52 y la migración tiene que ser idéntica. Se aplicó la regla medida de `LIMITES.md` para la card: `"{calle}, {localidad}"` ≤ 61 (`direccionCard`, comprobado en la compuerta) y nombre mostrado + calle + localidad ≤ 78 (`sumaSedeCard`), con un tope por campo de 59.
- Combinaciones en `scripts/contenido.mjs` (leen `LIMITES`): las cuatro etiquetas del menú ≤ 52; «Plantear un caso» + botón de vidrio ≤ 41 (con los topes por campo de 18 y 23 no puede pasarse: queda como red); las tres leyendas del proceso ≤ 40; por sede, `"{calle}, {localidad}"` ≤ 61 y nombre + calle + localidad ≤ 78; el título para redes ≤ 60.
- Las ayudas de los campos que hoy están justo en el límite lo dicen: línea ANMAT, etiquetas del menú (en conjunto), botones del hero, «Deslizá para continuar», título y bajada del cierre, título del acetábulo (en la ayuda genérica del título de parada), descripción del paso 03, título de Fabricación, bajada de Habilitaciones, bajada de Distribución y bajada del contacto. La descripción de parada avisa que con cuatro datos técnicos conviene no pasar de 100.

Con el contenido real: `Contenido OK: 10 secciones validadas.` Provocados y restaurados: titular de 51 → «no puede tener más de 50 caracteres»; título para redes de 62 → «mide 62 caracteres y no puede pasar de 60»; leyendas de 48 en total → «entre las tres suman 48 … no pueden pasar de 40»; las cuatro etiquetas del menú en 55 → «suman 55 … no pueden pasar de 52»; calle de Alberti con «bis» → «mide 65 caracteres y la tarjeta admite hasta 61» y «suman 80 … no pueden pasar de 78»; parte de referencia de 26 → el mensaje del patrón.

## 7. Comparación visual y navegación

Fecha: 2026-11-04, sobre `d8aaeb7` (`npm run build` con la compuerta: `Contenido OK`, y `next start -p 3100` sin `NEXT_PUBLIC_KEYSTATIC_PROYECTO`). Chrome sin ventana con patchright; scripts de esta pasada en el scratchpad de la sesión (`qa/comparar.mjs`, `qa/navegacion.mjs`, `qa/panel.mjs`, `qa/sonda.mjs`).

### 7.1 Capturas

`capturar.mjs --out capturas/nueva` (prefijo `nueva`, mismos tamaños y esperas que `base/`) y una segunda corrida completa en `capturas/nueva2/` para medir cuánto cambia el sitio entre dos corridas iguales. Comparación con `sharp`: mismo tamaño en los 30 pares, píxel distinto si algún canal difiere más de 24/255; imágenes de diferencia (rojo sobre la base en gris) en `capturas/diff/` (base contra nueva) y `capturas/diff2/` (base contra nueva2), con `resultado.json` en cada una. La columna «entre corridas» compara nueva con nueva2: es el ruido propio del sitio.

| Vista | Tamaño | Base vs nueva | Base vs nueva2 | Entre corridas | Veredicto |
|---|---|---|---|---|---|
| hero | escritorio | 0,837 % | 0,732 % | 0,105 % | Ruido: fibras, craneoplastía y contorno del vidrio; el texto, los botones y la línea ANMAT coinciden. En la barra, «Habilitaciones» y «trabajamos» caen medio píxel corridos según la corrida (también entre nueva y nueva2) |
| hero | celular | 0,162 % | 0,015 % | 0,124 % | Ruido (fibras) |
| parada-craneo | escritorio | 0,784 % | 0,658 % | 0,345 % | Ruido: miniatura de partículas y vidrio |
| parada-craneo | celular | 0,173 % | 0,603 % | 0,604 % | Ruido: miniatura |
| parada-maxilar | escritorio | 0,629 % | 0,611 % | 0,184 % | Ruido: miniatura, vidrio y el texto de la tarjeta con otro antialiasing (ver abajo) |
| parada-maxilar | celular | 0,226 % | 0,114 % | 0,118 % | Ruido |
| parada-hombro | escritorio | 0,888 % | 0,749 % | 0,476 % | Ruido, como el maxilar |
| parada-hombro | celular | 0,440 % | 0,221 % | 0,190 % | Ruido: miniatura y contorno |
| parada-acetabulo | escritorio | 1,161 % | 0,405 % | 1,053 % | Ruido, como el maxilar |
| parada-acetabulo | celular | 0,181 % | 0,245 % | 0,245 % | Ruido |
| parada-femur | escritorio | 0,751 % | 0,376 % | 0,684 % | Ruido, como el maxilar |
| parada-femur | celular | 0,132 % | 0,020 % | 0,126 % | Ruido |
| parada-intercalar | escritorio | 0,350 % | 0,548 % | 0,129 % | Ruido |
| parada-intercalar | celular | 0,256 % | 0,115 % | 0,059 % | Ruido |
| cierre | escritorio | 0,526 % | 0,567 % | 0,043 % | Ruido: la cinta de fibras (otro momento de su entrada), el contorno del cuerpo y el riel del aviso; título, bajada, botón y aviso idénticos |
| cierre | celular | 0,602 % | 0,005 % | 0,441 % | Ruido: fibras |
| proceso | escritorio | 0,965 % | 1,017 % | 0,967 % | Ruido: las partículas del fémur; título, pasos y leyenda idénticos |
| proceso | celular | 0,680 % | 0,648 % | 0,659 % | Ruido: partículas |
| fabricacion | escritorio | 0 | 0,032 % | 0,032 % | Idéntica (en nueva2, «Habilitaciones» de la barra a mitad de su transición de color) |
| fabricacion | celular | 0 | 0 | 0 | Idéntica |
| habilitaciones | escritorio y celular | 0 | 0 | 0 | Idénticas |
| sedes | escritorio | 0,098 % | 0,093 % | 0,098 % | Ruido: la luz que recorre la línea del mapa |
| sedes | celular | 0 | 0 | 0 | Idéntica |
| contacto | escritorio y celular | 0 | 0 | 0 | Idénticas |
| footer | escritorio | 0 | 0 | 0 | Idéntica |
| footer | celular | 0,003 % | 0,003 % | 0 | **Cambio real, imperceptible** (ver abajo) |
| contacto-pagina | escritorio | 0,047 % | 0,007 % | 0,054 % | Ruido: el logo de la barra (nueva) y el del footer (nueva2) con otro remuestreo; no se repite entre corridas |
| contacto-pagina | celular | 0,001 % | 0,001 % | 0 | **El mismo cambio real del footer** |

- **Tarjetas del recorrido en escritorio:** todo el texto de la tarjeta sale en rojo en la diferencia, pero la mejor alineación entre base y nueva es (0, 0) píxeles: la tarjeta está en el mismo lugar y con el mismo tamaño, solo que en una posición vertical fraccionaria distinta, y el antialiasing cambia. Pasa igual entre nueva y nueva2, así que es del sitio y no de la migración.
- **Cambio real (footer, celular):** en «© 2026 Innercare», la «I» se corre menos de un píxel (19 filas de un solo glifo a 2x; en escritorio, a 1x, no cambia ningún píxel). Es determinista: no cambia entre corridas. Motivo: `site-footer.tsx` pasó de `© <CopyrightYear /> Innercare` a `© <CopyrightYear /> {menuTextos.marca}`, y React emite el espacio y la marca como dos nodos de texto (`<!-- --> <!-- -->Innercare`), donde antes era uno (` Innercare`). Chrome da forma a cada nodo por separado y pierde el ajuste entre el espacio y la «I». Arreglo, si se quiere el píxel exacto: ``© <CopyrightYear />{` ${menuTextos.marca}`}`` (un solo nodo, como antes). No se tocó el código.

Fuera de eso no hay ningún cambio de texto ni de maquetación: titulares, bajadas, tarjetas, botones, tablas, mapa y pies coinciden en lugar y tamaño.

### 7.2 Texto

`capturar.mjs` sacó el `body.innerText` con el JS apagado, igual que la base. `diff` de `nueva-texto-*.txt` contra `base-texto-*.txt`: **sin diferencias** en las tres rutas (`/`, 223 líneas; `/contacto`, 26; la ficha del fémur, 75).

### 7.3 Navegación (`next start -p 3100`, escritorio 1440 × 900 y celular 390 × 844)

Para separar lo que trae la migración de lo que ya estaba, las mismas pruebas se corrieron también contra un build de `d4b24eb` (copia en el scratchpad, `next start -p 3102`): **dieron los mismos números en todo** salvo el PDF, que antes estaba en otra ruta.

| Prueba | Resultado |
|---|---|
| «Plantear un caso» de la barra, con la página en Cómo trabajamos (en el celular, desde el menú) | **Falla, igual que antes de la migración.** El panel se abre en `/contacto?motivo=caso`, pero la página sube al hero: `scrollY` 7758 → 0 (celular 7271 → 0) y el hero se ve detrás del fondo desenfocado. Al cerrar, con Escape y con la X, la URL vuelve a `/` y no queda ningún `dialog[open]` (el elemento sigue en el DOM, cerrado, por `<Activity>`), pero la página queda unos 600 px más arriba: 7166 y 7198 (celular 6818 y 6845). En `d4b24eb`: 7758 → 0 → 7207 |
| «Plantear un caso» de la tarjeta de la craneoplastía | **Falla a medias, igual que antes.** Abierto, `scrollY` 0 (el hero detrás del panel); al cerrar vuelve exacto (943 → 943, 902 → 902; celular 881 y 846) |
| «Plantear un caso» del cierre del contacto | **Falla, igual que antes.** Abierto, 0; al cerrar, 15426 → 14151 y 15583 → 14295 (celular 15525 → 14327 y 15606 → 14402): queda 1,3 pantallas más arriba, con la tarjeta todavía sin armar. En `d4b24eb`, 14062 y 14319 |
| Miga «Implantes» de la ficha del fémur | Pasó: va a `/#recorrido`, la pantalla de carga se va y `#recorrido` queda a 72 px del borde (el `scroll-padding-top` de la barra) |
| «Plantear un caso» de la ficha | Pasó: `/contacto?producto=endoprotesis-modular-femur-customizable`, el formulario trae el producto elegido y al cerrar (Escape y X) vuelve a la ficha. En el celular, con el botón a 664 px, la página detrás del panel también sube a 0 y vuelve a 664 al cerrar (no se ve: el panel ocupa la pantalla) |
| PDF de la parada del fémur | Pasó: «Ficha técnica (PDF)», `href="/fichas/femur/ficha.pdf"`, `download="endoprotesis-modular-femur-customizable-ficha-tecnica.pdf"`; la URL responde 200 `application/pdf` (438 593 bytes). El botón de la ficha apunta a la misma URL, con `download` |
| `/keystatic` y `/api/keystatic/tree` | Pasó: 404 los dos (`Not found` en la API). Ojo: `/keystatic` muestra la 404 genérica de Next («404: This page could not be found.», `noindex, nofollow`), no la de marca: el layout del grupo `(panel)` llama a `notFound()` y no hay `not-found` propio ahí. La sección 2 dice «la misma página»: no es así, aunque el código es el correcto |
| `/no-existe` | Pasó: 404 con la página de marca, `<title>Página no encontrada \| Innercare</title>` y h1 «Página no encontrada» |
| Imagen OG | Pasó: el `og:image` del HTML es `/opengraph-image-1whei1?2bfe9298bbc443a4`; responde 200 `image/png`, 281 676 bytes |
| Errores de JavaScript en la home | Ninguno en los dos tamaños |

Por qué sube la página: se instrumentó el clic (`qa/sonda.mjs`). Después de `showModal()` y `focus()` del panel, el `InnerScrollHandler` del layout-router de Next hace `document.documentElement.scrollTop = 0` y luego `dialog.scrollIntoView()` (la pila pasa por `disableSmoothScrollDuringRouteTransition`), a pesar del `scroll={false}` de `ContactLink`, que sí llega al `Link` (está en el payload RSC). Con `html[data-contact-open] { overflow: hidden }` solo, la posición no cambia (se probó aparte). El comentario de `ContactLink` describe justo este síntoma como resuelto: con Next 16.4.3 no lo está, y no es de esta rama.

### 7.4 Panel en local (`next dev -p 3101`)

| Prueba | Resultado |
|---|---|
| Tablero (`capturas/panel-tablero-final.png`) | Pasó: carga, 200, `<title>Innercare · Panel de contenidos</title>` y `<meta name="robots" content="noindex, nofollow">` |
| Navegación | Pasó: PORTADA (Hero, Recorrido de implantes), SECCIONES (Cómo trabajamos, Fabricación, Habilitaciones, Distribución, Contacto), SITIO (Menú y footer, Pantalla de carga, SEO y redes): 10 secciones |
| Recorrido de implantes | Pasó: las seis paradas (Cráneo, Maxilar, Hombro, Acetábulo, Fémur proximal, Diáfisis femoral). El campo «Ficha técnica (PDF)» del fémur muestra el archivo cargado (botones «Remove» y «Download»); los otros cinco, solo «Choose file» |
| Hero, titular de 51 caracteres | Pasó: «Save» no guarda y muestra «Titular must be no longer than 50 characters» (el `next dev` registra `Field validation failed`); ninguna petición de escritura a `/api/keystatic` (además se bloquearon por las dudas). Se volvió al valor original sin guardar |
| Consola | Un 404 de un recurso del panel, como en la sección 4; ningún error de JavaScript |

Al final, `git status`: ningún archivo rastreado cambió por estas pruebas (los Markdown modificados en el árbol son de otra sesión). Las PNG de `capturas/nueva/`, `nueva2/`, `diff/` y `diff2/` quedan ignoradas; los `.txt` y `.json` de esas carpetas (y de `base/`) no están en `.gitignore` y aparecen sin seguimiento.

## 8. Correcciones tras la revisión

Fecha: 2026-11-04, sobre `2b69c5e`. Una revisión del código y la comparación visual de la sección 7 dejaron una lista de correcciones; acá quedan las pruebas. Regla: el sitio tiene que seguir idéntico (texto y HTML) con el contenido actual.

### 8.1 Qué cambió

- **Esquema y compuerta** (`keystatic.esquema.ts`, `scripts/contenido.mjs`): `texto()` suma a todo obligatorio el patrón `NO_VACIO` (`/\S/`), porque Keystatic da por lleno un texto con solo espacios (mide el largo sin recortar); lo mismo las palabras de la pantalla de carga. La compuerta mira el JSON crudo y rechaza las listas con mínimo que faltan o son `null` (el lector las da por vacías sin validar: `array.parse(undefined)` devuelve el valor por defecto), con el mensaje «falta la lista»; esa sección queda como fallida para no sumar mensajes de más. Topes nuevos: `paradaDescripcionCuatroSpecs` (100), `sedeTipoPlanta` (23, el mapa muestra el `tipo` entero cuando el rol es planta) y `etiquetaMapa` (38, «{localidad}, {provincia}»). La sede principal tiene que tener al menos un teléfono y dos sedes no pueden compartir coordenadas. El `id` de las filas de Habilitaciones lleva `PATRON.identificador`. `company.ts` lee la provincia con `opcion()` sobre las 24 jurisdicciones (antes, una provincia ausente mostraba «Provincia de [pendiente…]»). Las ayudas del panel van en voseo y sin rutas de código.
- **Fichas PDF en su singleton** (`fichas`, `content/datos/fichas.json`, un `fields.file` por id de parada, grupo Portada): en Cloud, un documento que mezcla `fields.array` con archivos o imágenes perdió campos hermanos al guardar (issue #1627 de Keystatic). Se verificó en `@keystatic/core` (`serialize` del campo `file`: `suggestedFilenamePrefix + '.' + extension`, con el prefijo igual a la ruta del campo) que con la clave de la parada al primer nivel el archivo queda en `public/fichas/<parada>.pdf`; el PDF del fémur pasó de `public/fichas/femur/ficha.pdf` a `public/fichas/femur.pdf` y el JSON guarda `/fichas/femur.pdf`. El singleton `recorrido` pierde `ficha`. `content/paradas.ts` (`NOMBRES_PARADAS`) da el nombre de cada parada al esquema y a los marcadores «[pendiente: Recorrido de implantes · Cráneo · Título]».
- **`content/jurisdicciones.ts`**, generado por `npm run mapa` junto con `mapa-argentina.ts`: solo los 24 nombres, para que el esquema del panel no cargue los 50 KB de trazados. Se corrió `npm run mapa` (bajó Natural Earth de nuevo): `mapa-argentina.ts` quedó byte a byte igual y apareció el archivo nuevo.
- **Componentes:** `locations.tsx` devuelve tramos vacíos con menos de dos sedes y salta los tramos de largo 0 (antes, `puntos[0]!` lanzaba y `largo = 0` daba `NaN`); `contact-parts.tsx` no renderiza el `<li>` de WhatsApp si la sede principal no tiene teléfono; el footer emite «© 2026 Innercare» en un solo nodo de texto (el subpíxel de la sección 7.1); claves por posición en los teléfonos del footer y las partes de la referencia; el botón de la ficha baja el PDF como `<slug>-ficha-tecnica.pdf`, como la tarjeta; comentarios con las rutas de `app/(sitio)/`.
- **404 de marca** (`components/pagina-no-encontrada.tsx`): `app/(sitio)/not-found.tsx` para los `notFound()` de las fichas (dentro del layout, con header y footer) y `app/(panel)/keystatic/not-found.tsx` para `/keystatic` sin panel. El `notFound()` pasó del layout raíz del panel a `[[...params]]/page.tsx`; el layout renderiza `children` solo con el panel deshabilitado. `not-found.tsx` importa `globals.css` por su cuenta: Next carga el CSS de un `not-found` solo cuando lo renderiza (`create-component-tree.js`, `notFoundStyles`), así que el panel habilitado sigue sin el preflight de Tailwind.

### 8.2 Compuerta

`npm run contenido` con el contenido real: `Contenido OK: 11 secciones validadas.` Cada caso se provocó con una copia alterada del JSON y se restauró byte a byte (`casos-compuerta.mjs`, en el scratchpad de la sesión); al final, `git status` solo muestra los cambios intencionales. Todos terminan con código 1:

| Caso | Mensaje |
|---|---|
| `hero.titular = "   "` | `Hero: Titular: No puede quedar vacío ni con solo espacios.` |
| Palabra de la carga con solo espacios | `Pantalla de carga: Etapas del proceso › 3: No puede quedar vacío ni con solo espacios.` |
| `habilitaciones` sin `filas` | `Habilitaciones: Filas de la tabla: falta la lista (tiene que tener al menos 1 elemento)` |
| `habilitaciones.filas = null` | el mismo mensaje |
| `carga` sin `palabras` | `Pantalla de carga: Etapas del proceso: falta la lista (tiene que tener al menos 3 elementos)` |
| Parada sin `specs` | `Recorrido de implantes: Cráneo › Datos técnicos: falta la lista (tiene que tener al menos 1 elemento)` |
| Parada con `specs: null` | `Recorrido de implantes: Maxilar › Datos técnicos: falta la lista (tiene que tener al menos 1 elemento)` |
| `distribucion` sin `sedes` (antes caía solo por «hay 0 sedes principales») | `Distribución: Sedes: falta la lista (tiene que tener al menos 1 elemento)` |
| Fémur (cuatro specs) con descripción de 105 | `Recorrido de implantes: Fémur proximal › Descripción: con cuatro datos técnicos no puede pasar de 100 caracteres (mide 105)` |
| Planta con `tipo` de 41 | `Distribución: Sedes › 2 › Nombre completo: el mapa muestra el nombre entero de la planta bajo su etiqueta, «Planta industrial de implantes de titanio» mide 41 caracteres y ahí no puede pasar de 23` (y la suma de la tarjeta, 100 > 78) |
| Localidad de 24 con provincia «Santiago del Estero» | `Distribución: Sedes › 4 › Localidad: la etiqueta del mapa «Comodoro Rivadavia Norte, Santiago del Estero» mide 45 caracteres y no puede pasar de 38` |
| Sede principal con `telefonos: []` | `Distribución: Sedes › 1 › Teléfonos: la sede principal tiene que tener al menos un teléfono (es el WhatsApp del footer y del contacto)` |
| Dos sedes con las mismas coordenadas | `Distribución: Sedes › 4 › Latitud y Longitud: coinciden con las de la sede 3; dos sedes no pueden ir en el mismo punto del mapa` |
| `fichas.femur = "/fichas/femur.gif"` y `fichas.hombro = "/fichas/hombro.pdf"` | `Fichas técnicas (PDF): Fémur proximal: ficha técnica: el archivo «/fichas/femur.gif» no es un PDF` · `Hombro: ficha técnica: no está el archivo public/fichas/hombro.pdf` |
| Id de habilitación «ANMAT bpf» | `Habilitaciones: Filas de la tabla › 2 › Identificador: Solo minúsculas, números y guiones, como «caleta-olivia».` |

### 8.3 Contenido, HTML y rutas

- `node scripts/volcar-contenido.mjs` sobre `2b69c5e` (árbol limpio, antes de tocar nada) y sobre el árbol final: **idénticos salvo `datasheetUrl`**, `/fichas/femur/ficha.pdf` → `/fichas/femur.pdf` en `recorrido.paradas[4]` y `products.getProducts[0]` (el cambio de ruta del PDF).
- `npm run build` (compuerta y `next build`), `npm run lint` y `npx tsc --noEmit` pasan sin errores; el único aviso es el de `metadataBase`, pendiente de antes. Tabla de rutas sin cambios (`/keystatic/[[...params]]` sigue ◐).
- `next start -p 3100`, antes (build de `2b69c5e`) y después, texto visible y atributos de `/` (377 líneas), `/contacto` (66) y la ficha del fémur (91) con `qa/texto.mjs`: `/` y `/contacto` difieren solo en el hash de caché de la URL de la imagen OG (cambia con cada build); la ficha, solo en `download=` → `download=endoprotesis-modular-femur-customizable-ficha-tecnica.pdf`. El `href` del PDF (que el extractor no mira) pasa a `/fichas/femur.pdf` en la tarjeta y en la ficha.
- Códigos después del cambio (producción sin Cloud): `/fichas/femur.pdf` 200 `application/pdf` (438 593 bytes); `/fichas/femur/ficha.pdf` 404; `/keystatic` y `/keystatic/singleton/hero` 404; `/api/keystatic/tree` 404 `Not found`; `/no-existe` 404 con la página de marca entera en el HTML; `/productos/no-existe` 200 la primera vez y 404 después (lo de siempre con Cache Components).
- En Chrome sin ventana (`k404.mjs`): `/keystatic` y `/keystatic/singleton/hero` responden 404 con `<title>Página no encontrada | Innercare</title>`, h1 «Página no encontrada», Hanken Grotesk, fondo `surface` y «Volver al inicio»; `/productos/no-existe` muestra la misma página dentro del sitio, con header y footer. Como con todo `notFound()` bajo Cache Components, el HTML que manda el servidor es la cáscara de Next (1227 bytes, `__next_error__`, status 404, `noindex`) y el contenido llega por RSC: `curl` no lo ve, el navegador sí. Prerrenderizar `/keystatic` con `generateStaticParams` no lo cambia (la cáscara sale igual con el payload adentro) y rompe `next dev` con el panel habilitado («all generateStaticParams functions must return at least one result»), así que se descartó. El título de la 404 de las fichas sale del `metadata` de `not-found.tsx` en la primera visita (`<title>Página no encontrada | Innercare</title>` en el HTML); en la visita siguiente, ya cacheada como 404 y completada en el cliente, queda el título por defecto del sitio.
- `next dev -p 3101` (panel habilitado): `/keystatic` 200, `<title>Innercare · Panel de contenidos</title>`, una sola hoja de estilos (la de `next/font`) y sin `globals.css`; `/keystatic/singleton/hero` 200.
