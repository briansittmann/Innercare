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
