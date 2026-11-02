# Cuerpo único: índice y estado final

Un solo cuerpo de vidrio, del hero al cierre del recorrido, en un solo canvas (rama `cuerpo-unico`, 2026-10-31). Esta carpeta guarda la línea de base, las capturas y las mediciones de las cinco fases y de las dos verificaciones. El plan, las decisiones y el detalle de cada fase están en `docs/landing/BITACORA.md` (entradas "Cuerpo único"), `docs/DECISIONES.md` ("Un solo cuerpo del hero al recorrido") y `docs/ARQUITECTURA_MODELO_3D.md` (sección 3, "Cuerpo único").

**Cómo verlo:** `git switch cuerpo-unico`, `npm run dev`, http://localhost:3000. Para volver: `git switch rediseno`. Qué mirar primero: la toma hero contra la base (`comparacion.html`), la transición hero → craneoplastía (`fase4/correcciones/transicion/`) y el hero en el celular con su desliz.

## Veredicto

- **Compuerta de paridad (fase 1): PASA**, en la segunda pasada del verificador (`8228f5d`, corregido el filo blanco del corte bajo el hombro). Recortes en `verificacion/`.
- **Paridad final** (fase 5, después de la limpieza), hero contra la base en la zona del busto, diferencia media sobre 255: escritorio 1,0 a 2,0 y celular 0,3 a 2,6, sin corrimiento (`hero-abajo` ya no aplica: el hero no es más una sección). Con movimiento reducido, la limpieza no cambió ni un píxel del hero (0,00 contra el código de antes); en las paradas solo cambia la miniatura de partículas, que varía sola entre corridas.
- **Rendimiento:** recorrido otra vez a 60 fps con tope en escritorio y celular; hero quieto con mucho más margen que la base; un contexto WebGL menos. Queda más justo el tramo corto del hero (abajo).

## Mediciones finales: base contra cuerpo único

Chrome del sistema sin interfaz con la GPU del M1 (`base/medir.mjs medidas`), 1440 × 900 a 2x y 390 × 844 a 3x, alternando con la base (`6492345`, el hero de antes) en un worktree. Fps, entre paréntesis p95 en ms. Cuerpo único en `a6b88c5`, después de las correcciones del verificador de la fase 4 (`fase4/MEDICIONES.md`, "Después de las correcciones"); la limpieza de la fase 5 no cambia el código que corre y se comprobó con una vuelta más, sin alternar y con la máquina más tranquila (carga 2, contra 6 a 17), así que esa fila no se compara cifra por cifra con las otras (`fase5/medidas/`).

| Sin tope | Hero quieto | Paso 0,3 pantallas | Paso a la craneoplastía | Recorrido |
|---|---|---|---|---|
| Escritorio, base | 71,1 / 72 | 67,8 / 67,4 | 35,5 / 35,1 | 94,1 / 93,9 |
| Escritorio, cuerpo único | 118,7 / 109,2 | 46,1 / 45,6 | 46,1 / 42,9 | 89,6 / 90,2 |
| Escritorio, fase 5 | 133,6 (13,5) | 50,1 (15,3) | 54,8 (30,8) | 96,6 (25,6) |
| Celular, base | 193,6 / 192,9 | 186,6 / 186,1 | 143,6 / 146,3 | 223,2 / 224,5 |
| Celular, cuerpo único | 429,5 / 422,7 | 229,5 / 221,2 | 235 / 227,8 | 254,8 / 256,1 |
| Celular, fase 5 | 405,5 (4) | 234,8 (4,8) | 204,9 (10,2) | 260 (7,8) |

| Con tope (60) | Hero quieto | Paso 0,3 pantallas | Paso a la craneoplastía | Recorrido |
|---|---|---|---|---|
| Escritorio, base | 60 | 59,8 | 59,8 | 59,8 (16,7) |
| Escritorio, cuerpo único | 60 | 58,3 (16,8) | 59,4 | 60 (16,8) |
| Escritorio, fase 5 | 60 (16,8) | 58 (16,8) | 59,2 (16,8) | 60 (16,7) |
| Celular, base | 60 | 60 | 59,4 | 60 |
| Celular, cuerpo único | 60 | 60 | 59,8 | 60 |
| Celular, fase 5 | 60 (16,7) | 60 (16,7) | 59,6 (16,8) | 59,9 (16,7) |

Recorrido entero con tope en escritorio (`verificacion-fase4/partes.mjs`, cuatro vueltas alternadas): base 59,7 a 59,8; cuerpo único 59,5 a 59,7 (antes de la corrección del vidrio opaco, 51,5 a 52, con el 17 % de los cuadros perdidos).

| | Base | Cuerpo único |
|---|---|---|
| Contextos WebGL vivos | 3 (busto, fibras y recorrido) | 2 (escena y fibras) |
| Primer pantallazo | `cabeza.glb` + `implantes.glb`: 498 KB (397 KB transferidos) | `cuerpo-cabeza.glb` + `implantes.glb`: 454 KB (362 KB transferidos) |
| Después de la intro | `cuerpo.glb` + `implantes-recorrido.glb`: 1 215 KB | `cuerpo-resto.glb` + `implantes-recorrido.glb`: 908 KB |
| Arranque de la intro (localhost) | 0,83 a 1,28 s | 0,8 a 1,4 s |

## Qué hay en cada carpeta

- `base/`: la línea de base (fase 0), el hero de antes en `a0dcbbf`. `MEDICIONES.md` (método, valores de cámara, materiales y encuadre del busto, y su equivalente en el cuerpo), `medir.mjs` (capturas, respaldo, encuadre, medidas y resumen; para el cuerpo único, con `--listo '.recorrido-escena[data-listo]'`), `capturas/` (34 tomas: 1440 y 390, con y sin movimiento reducido, en la intro y el vaivén), `medidas/`.
- `prototipo/`: fase 1, el hero dibujado por la escena del recorrido detrás de `?cuerpo-unico` (ya no existe). `MEDICIONES.md`, `capturas/` y `diferencias/` (mismos nombres que `base/`), `medidas/`, `caja/` y `sin-recorte/` (variantes de canvas para medir), `base-alternada/`.
- `fase2/`: Blender y partición del cuerpo. `capturas/` (hero del prototipo y `parada-*`), `diferencias/` (contra la fase 1) y `renders/` (la piel por zonas).
- `fase3/`: el hero dentro de la escena fija. `capturas/` y `diferencias/` (hero), `recorrido/` (seg 0,1 a 7) y `recorrido.mjs`.
- `fase4/`: maxilar, fibras y correcciones. `MEDICIONES.md` (fps enchufado, alternando con la base), `capturas/` y `diferencias/` (hero), `recorrido/` (paradas, fundido del maxilar, sin WebGL, sin JS, `informe.json`) con `recorrido.mjs`, `correcciones/transicion/` (seg 0 a 1 en el celular y 0 a 3 en escritorio) y `correcciones/sinjs/`, `medidas/`.
- `fase5/`: limpieza. `medidas/` (la vuelta de control), `paridad/antes/` y `paridad/despues/` (toma hero tras la llegada del resto, seg 1 y seg 4; 1440 y 390 a 1x, con y sin movimiento reducido), `capturas/` (hero con los nombres de `base/capturas/`, después de la limpieza), `paridad.mjs` y `dif.mjs` (las capturas y la comparación).
- `verificacion/`: la compuerta de la fase 1. `antes/` (primera pasada, no pasa: filo blanco), `despues/` (segunda pasada, pasa) y `README.md`.
- `verificacion-fase4/`: el verificador de la fase 4. `ver.mjs` (capturas del recorrido y de la página, base o cuerpo único), `partes.mjs` (fps del recorrido con y sin fibras y miniaturas), `capturas/` y `diferencias/` (hero), `recorrido/` y `base-recorrido/` (las mismas tomas en las dos), `recortes/` (detalles), `pagina/` (secciones y panel de contacto), `medidas/` y `base-alternada/`, `comparacion.html`.
- `comparacion.html`: hoja base, prototipo y diferencia por captura (se abre como archivo). `comparar.mjs` la arma; `--contra <carpeta>` compara otra carpeta de capturas (sobrescribe `comparacion.html` y `prototipo/diferencias.json`).

## Pendientes, con dónde está cada uno

Del cuerpo único:
1. **Medir en un celular real** la escena única (hero, recorrido con las miniaturas, contacto). Si no llega a 60, bajar `DPR_CELULAR` en `components/recorrido-3d/recorrido-3d.tsx`. Hasta ahora, todo es emulación en el M1.
2. **Tramo corto del hero** (las primeras 0,3 pantallas): 46 fps sin tope contra 67 de la base en escritorio (58 con tope). Ahí el vidrio es transparente a propósito, porque el corte baja, y el esqueleto se dibuja dos veces. `escena.tsx`, `Cuerpo` (el `transparente` del vidrio) y `fase4/MEDICIONES.md`.
3. **El hombro y su implante asoman bajo el corte** desde seg 0,33 en escritorio (0,55 en el celular). `escena.tsx`, `corteDe` y `bandaDe`; capturas en `fase4/correcciones/transicion/`.
4. **El degradé del cierre se oscurece** antes de fundirse al gris (seg 7). `.recorrido-fundido` en `app/globals.css` y `tour-scroll.tsx`; captura `fase4/recorrido/*-seg-7.webp`.
5. **El contexto de las fibras queda vivo**, pausado y sin dibujar, después del hero. `components/ghost-fibers.tsx` y `.recorrido-fondo-hero`.
6. **La luz de las paradas gira con la cámara** desde la fase 1 (hace falta para que el hero brille como el busto) y cambió respecto del recorrido original: revisarla a ojo, parada por parada, contra `verificacion-fase4/base-recorrido/`. `escena.tsx`, `scene.environmentRotation`.
7. **Recorrido antes y después de la fase 2**, comparado solo a ojo (cambió el orden de dibujo de los trozos de piel y de la columna, objetos transparentes). `fase2/capturas/parada-*`.
8. **Primer pantallazo con red lenta:** pesa menos que el del busto, pero la intro no se midió con red simulada.
9. **Respaldo del cierre:** `public/img/cuerpo-entero.webp` es una captura de la antigua toma de entrada (azimut −0,42; el cierre está a −0,30). `VistaCuerpo` en `components/home/tour.tsx`. Y faltan los respaldos por parada (`cuerpo-<parada>.webp`).
10. **Diferencias menores del hero, solo con zoom:** contorno de oreja y nuca algo más marcado, vértebras bajas, reflejo bajo el borde de la craneoplastía y el corte abierto donde el busto tenía tapa (contra el borde, no se distingue). `verificacion/README.md`.
11. **`npm run modelos` regenera `implantes-recorrido.glb`** con unos bytes distintos (Blender no es determinista en los booleanos): se deja el del repo mientras no cambie un implante. El resto (`implantes.glb`, `cuerpo-cabeza.glb`, `cuerpo-resto.glb`) sale idéntico, comprobado en la fase 5.
12. **Colores del degradé repetidos** en `app/globals.css` y `components/recorrido-3d/aspecto-hero.ts` (antes eran tres lugares).
13. **`medir.mjs`:** su `--listo` por defecto es el del busto de antes; para el cuerpo único, `--listo '.recorrido-escena[data-listo]'`. En `medidas --sin-tope` todavía pide `?calidad=media`, que ya no existe (no hace nada).
14. **Integrar `cuerpo-unico`** a `rediseno` y `main`, cuando el usuario lo apruebe.

Resueltos en el camino (para no buscarlos): la caída del 4,6 % del hero en escritorio con el canvas a pantalla completa (recorte a la caja del busto, fase 3), el paso del hero al recorrido a 51 fps y los contextos del hero que nunca se liberaban (un solo canvas), el recorrido de escritorio a 52 fps (vidrio opaco, fase 4), las fibras del celular fuera de lugar y el degradé estirado (fase 4), `intro-0000`, el punto activo del menú, `implantes.glb` descargado dos veces y la sonda de WebGL sin liberar (fase 4). Las fotos vacías de algunas tarjetas en la captura sin JS de página entera no son de la página: con JS apagado las 14 imágenes del recorrido cargan; es la carga diferida, que no llega a decodificar antes de la captura (fase 5).

De antes del cuerpo único, siguen en `CLAUDE.md` ("Pendiente"): el aviso de deslizar no centrado en escritorio, las miniaturas (costura de 1 px y marco en los fundidos), los datos a confirmar con Innercare, el logo, la ficha de producto, el envío del formulario y los metadatos.
