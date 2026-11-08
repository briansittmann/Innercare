# Prompt: capturas del panel y PDF del tutorial

Para pegar en un chat nuevo de Claude Code abierto en el repo de Innercare, cuando el video esté subido a YouTube: pedile la tanda 2. La tanda 1 (las capturas) ya está hecha.

---

Vas a armar el PDF del tutorial para los editores de Innercare; las capturas ya existen (tanda 1). El tutorial tiene dos capas: `docs/tutorial-editores/GUION.md` es la voz, común a todos los clientes que usan Keystatic, y `docs/tutorial-editores/ESCENAS-INNERCARE.md` es lo que se ve en cada paso con el panel de Innercare. Las capturas salieron de las escenas; la voz no se toca. Leé los dos enteros antes de empezar, junto con `docs/EDITORES.md` (manda sobre las escenas si no coinciden), la sección "Textos editables (Keystatic)" de `CLAUDE.md` y la memoria del proyecto sobre patchright (`headless-qa-patchright`). El script de capturas que ya existe, `docs/landing/textos-editables/capturas/capturar.mjs`, muestra cómo se importa patchright y cómo se usa el Chrome del sistema: copiá ese patrón, no instales navegadores.

## Tanda 1: capturas (hecha el 2026-11-05)

Las saca `docs/tutorial-editores/capturar-tutorial.mjs`, sin intervención de Brian. No hace falta repetirla salvo que cambien el panel, las escenas o la web. Para rehacerla:

```
npx next dev -p 3200        # el modo local del panel; otro puerto si el 3000 está ocupado
node docs/tutorial-editores/capturar-tutorial.mjs [--url http://localhost:3200] [--solo 04-tablero,...]
```

- El panel sale del modo local de Keystatic sobre `next dev`: sin inicio de sesión, sin cuenta a la vista y sin commits. El paso que guarda escribe `content/datos/hero.json` y el script lo devuelve a su contenido original al terminar, falle o no. Comprobá igual con `git status` que no quedó cambiado.
- La pantalla de inicio de sesión (02 y 03) sale de producción sin sesión. El selector de ramas solo existe en Cloud: la escena 16 es una tarjeta dibujada.
- Salen en `capturas/` (no se versiona) con `escenas.json`: tipo, rótulo, archivos, tamaño y las cajas en píxeles de la imagen (`cursor` con `clic` y, en el tablero, `recorrido`; `resaltado` con margen; `campo` en la escena de escritura; `siguienteClic` en la lista; `barraNavegador` en la 02).
- Panel y web de escritorio a 1440 × 810 a 2x; celular a 402 × 870 a 3x con agente de Safari. Chrome sin barras de scroll.
- El panel muestra "Save", "Edit item" y "Done" en inglés aunque está en `es-ES`: los rótulos lo traducen.
- Después de rehacerla, copiá al proyecto del video `GUION.md` a `base/GUION.md`, `ESCENAS-INNERCARE.md` a `clientes/innercare/ESCENAS.md`, `capturas/` a `clientes/innercare/capturas/` y `public/logo.png` a `clientes/innercare/logo.png`.

## Tanda 2: el PDF (hecha el 2026-11-06)

El video está en `https://youtu.be/30xwIKv05i8`. El PDF sale de `pdf/tutorial.html` (14 hojas A4 fijas; recortes y resaltados en píxeles de la imagen, en `data-recorte` y `data-caja`) con:

```
node docs/tutorial-editores/pdf/generar-pdf.mjs
```

El script falla si una hoja se pasa de su alto o pisa el pie, si falta una imagen o una fuente, si una hoja ocupa dos páginas o si el PDF pesa 10 MB o más, y lista los enlaces. `pdf/miniatura-pdf.png` y `pdf/capitulos.json` son copias de `out/innercare/` del proyecto del video. Los `?t=` de cada capítulo son los de `capitulos.json` y los de las preguntas, el inicio de su paso (4 s de apertura más la voz de cada paso anterior con su medio segundo, de `base/voz.json`). Si el video se vuelve a renderizar con otros tiempos, se corrigen a mano en el HTML.

Lo que pedía la tanda, para rehacerla desde cero: empieza cuando tengas tres cosas del proyecto del video: la URL del video en YouTube, `capitulos.json` (id del capítulo y segundo de inicio) y `miniatura-pdf.png`.

- Armá `docs/tutorial-editores/pdf/tutorial.html` y generá el PDF con Chrome (`page.pdf`, A4, fondos impresos). Va a `docs/tutorial-editores/salida/Innercare - Cómo editar la web.pdf`.
- Diseño: los tokens de la marca de `app/globals.css` (primario `#003c6f`, Hanken Grotesk para títulos y Source Sans 3 para texto, desde `node_modules` o Google Fonts), fondo blanco, márgenes generosos, sin degradés ni adornos. Usá la skill `design-taste-frontend`.
- Estructura:
  1. Tapa: el logo, "Cómo editar los textos de la web" y la miniatura del video a todo el ancho, enlazada a YouTube. Es lo que se ve como vista previa al mandarlo por WhatsApp.
  2. Índice de capítulos, cada uno enlazado al minuto del video con `?t=<segundos>`.
  3. Una página o media por capítulo: sus capturas, con el resaltado de la escena dibujado encima, y el texto de `EDITORES.md` que corresponde. Al pie, "Ver este paso en el video" con su enlace `?t=`.
  4. "Dónde se ve cada sección": la tabla de `EDITORES.md`.
  5. "Los límites de largo" y "Qué pasa al guardar", de `EDITORES.md`.
  6. "Preguntas rápidas", cada una enlazada a su minuto: ¿Cómo entro? ¿Cómo cambio un texto? ¿Cuánto tarda en verse? ¿Qué hago si no entra? ¿Cómo subo una ficha PDF? ¿Qué pasa si me equivoco?
- Comprobá que los enlaces funcionan en el PDF (abrilo y listá sus anotaciones de enlace) y que pesa menos de 10 MB, así viaja por WhatsApp sin comprimirse. Si pesa más, bajá las capturas a JPG de calidad 85 solo para el PDF.
- Copy: voseo, sin guiones largos, rangos en palabras.

Al terminar: `npm run lint` y un resumen de qué quedó, dónde, y qué no se pudo hacer.
