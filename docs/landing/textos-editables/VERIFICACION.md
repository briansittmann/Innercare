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
| `/keystatic` | 404 (la misma página) |
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

Las comprobaciones propias (sede principal, PDF, ids) corren solo cuando el esquema pasa: Keystatic corta la lectura al primer grupo de errores de esquema. En todos los casos el script termina con código 1 y `npm run build` no llega a `next build`.

La compuerta también atrapó un límite real: la descripción para buscadores mide 237 caracteres y el límite provisional era 220; quedó en 260 (`LIMITES.seoDescripcion`).

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
