# Línea de base del hero (cuerpo único, fase 0)

Referencia de paridad para la compuerta de la fase 1: cómo se ve y cuánto rinde el hero **antes** de unirlo con el recorrido. Rama `cuerpo-unico` en `a0dcbbf` (igual a `rediseno`), build de producción, 2026-10-31.

La fase 1 repite exactamente estas capturas y mediciones sobre el prototipo con `medir.mjs` (abajo, "Cómo repetirlo") y compara archivo por archivo.

## Cómo se tomó

- **Servidor:** `npm run build` y `npx next start -p 3400` (el 3000 lo usa el `next dev` del usuario). URL `http://localhost:3400/`, sin parámetros salvo donde se indica.
- **Navegador:** Google Chrome 156 del sistema, sin interfaz, manejado con patchright 1.63 (fork de Playwright; sale de la extensión CodeGPT de VS Code). Flags: `--use-angle=metal --ignore-gpu-blocklist` (GPU real del M1). Sin tope de cuadros, además `--disable-gpu-vsync --disable-frame-rate-limit`. Sin WebGL: `--disable-webgl --disable-webgl2 --disable-3d-apis`.
- **Ventanas:**
  - Escritorio: 1440 × 900, `deviceScaleFactor` 2.
  - Celular: 390 × 844, `deviceScaleFactor` 3, `isMobile` y `hasTouch`.
  - El 3D del hero limita su resolución a 1,5x (`MAX_DPR`): el canvas sale a 1260 × 1350 px en escritorio y 585 × 784 en el celular.
- **Movimiento reducido:** `reducedMotion: 'reduce'` del contexto de Playwright (emula `prefers-reduced-motion`).
- **Sonda:** como `addInitScript` no corre en localhost con patchright, el script intercepta el HTML de `/` y le inyecta al principio del `<head>` un `<script>` que:
  - anota en `<html>` el `performance.now()` (ms desde la navegación) en que algún `[data-intro]` pasa a `running` (`data-sonda-running`) y a `done` (`data-sonda-done`), y en que aparece el selector de "3D listo" (`data-sonda-listo`);
  - envuelve `getContext` y las llamadas de dibujo de WebGL para contar contextos (creación, primer dibujo, dibujos, si siguen vivos y si su canvas está en el DOM).
  - "3D listo" es hoy `[role="img"] > div.duration-700.opacity-100`: el `onReady` de `Hero3D` (dos cuadros dibujados), que es cuando arranca el fundido de 700 ms del canvas y, si la intro esperaba, la intro.
- **Cómo se fija el momento:** en la página, con `requestAnimationFrame`, se espera a que `performance.now()` pase el instante buscado (relativo a `running` o a `done`) y se toma la captura. `capturas.json` guarda, por captura, los ms reales desde la referencia al empezar y al terminar la captura (una captura tarda 40 a 430 ms) y si en ese momento se veía el canvas (`canvasVisible`) y la opacidad del respaldo (`respaldoOpacidad`).
- **Capturas:** solo la ventana (no la página entera), `scale: 'css'` (1440 × 900 y 390 × 844 px; el render es a la resolución real), WebP con `cwebp -q 80 -m 6`. Las `*-reducido-detalle` van a la resolución del dispositivo (2880 × 1800 y 1170 × 2532) con `-q 85`, para comparar detalle de vidrio y titanio.
- **Cuadros por segundo:** tiempo entre `requestAnimationFrame` en la página (promedio → fps; percentiles 50 y 95 en ms). Con tope, el techo es 60.

## Capturas (`capturas/`)

Nombre: `<tamaño>-<movimiento>-<momento>.webp`, con tamaño `escritorio` o `celular` y movimiento `movimiento` o `reducido`.

| Momento | Cuándo |
|---|---|
| `intro-0000` | En cuanto `data-intro` pasa a `running` (+10 a 35 ms). |
| `intro-2000` | 2 s después de `running` (título a medio plegar). |
| `intro-fin` | En cuanto pasa a `done` (4 s después de `running`). |
| `vaiven-00`, `-05`, `-11`, `-16` | 0,3 s, 5, 11 y 16 s después de `done`. |
| `hero-abajo` (solo celular) | Después de `vaiven-16`, con el borde inferior del hero al pie de la pantalla: en el celular el busto queda casi entero debajo de la primera pantalla. |
| `reducido-detalle` | Movimiento reducido, 16 s después de `done`, a resolución completa. |
| `respaldo-sin-webgl` | Chrome sin WebGL, 1 s después de `done`: la imagen fija (`cuerpo-inicio*.webp`). |

Qué se ve (revisado a ojo):

- **Con movimiento, `intro-0000`:** el busto apenas asoma, desenfocado (`.intro-3d` arranca en opacidad 0, escala 0,94 y desenfoque de 14 px) y el canvas empezando su fundido de 700 ms; la barra es una píldora vacía. La imagen de respaldo sigue debajo con opacidad 1 hasta 700 ms después del `onReady` (`respaldoOpacidad` 1 en `capturas.json`), tapada por el canvas que aparece. Desde `intro-2000`, solo el 3D (`respaldoOpacidad` 0).
- **Con movimiento, `intro-2000`:** busto ya en pose, fibras entrando, título plegándose ("beneficio del pa…"); sin subtítulo ni botones.
- **Vaivén:** `vaiven-11` es la pose más de frente (≈ 22°); `-00` y `-16`, cerca del perfil. Las fibras se mueven solas, así que entre corridas cambian: comparar la zona del busto.
- **Movimiento reducido:** la intro arranca al montar, antes de que el 3D esté listo, así que `reducido-intro-0000` es **la imagen de respaldo**, no el 3D (`canvasVisible` false). Desde `intro-2000` es el 3D, y `intro-2000`, `intro-fin` y los cuatro `vaiven-*` son idénticos byte a byte (todo quieto, también las fibras). Observación para la fase 1, sin tocar acá: con movimiento reducido el título igual entra letra por letra (`celular-reducido-intro-0000` muestra "Innov").
- **Celular:** en la primera pantalla solo se ve la coronilla del busto, con la craneoplastía; el busto entero está en `celular-*-hero-abajo`.
- **Respaldo sin WebGL:** el `<picture>` con `cuerpo-inicio.webp` / `cuerpo-inicio-movil.webp`, sin fibras (son WebGL) y sin ningún contexto creado (`respaldo.json`). Coincide en pose y encuadre con `*-reducido-vaiven-*`.

## Mediciones

Datos crudos en `medidas/medidas-<con|sin>-tope-<vuelta>.json`; tabla con `node medir.mjs resumen`. Cuatro corridas con tope en escritorio (la máquina estaba cargada; ver "Ruido") y dos en el resto. Los modelos se sirven desde localhost, así que los tiempos de red son casi nulos: en un servidor real, la intro arranca más tarde.

### Cuadros por segundo

Hero quieto: arriba de todo, 1 s después de `done`, 6 s quieto (con movimiento: vaivén y fibras corriendo). Paso hero → recorrido: con el recorrido ya cargado (se lo precarga bajando hasta su borde y se vuelve arriba), scroll lineal de 0 a 0,3 pantallas en 4 s (el que midieron las fases 3 y 6) y de 0 a la primera parada (`seg` = 1 de 7 del contenedor `.recorrido`, la craneoplastía) en 5 s. Recorrido: de su borde superior al inferior (las ocho pantallas) en 12 s.

| | Hero quieto | Paso 0,3 pantallas | Paso a la 1.ª parada | Recorrido |
|---|---|---|---|---|
| Escritorio, con tope, vuelta 1 (carga 2,4) | 60 (p95 16,7) | 60 (16,8) | 59,6 (16,7) | 59,9 (16,8) |
| Escritorio, con tope, vuelta 2 (carga 4,7) | 50,5 (33,3) | 48 (33,4) | 28,3 (66,7) | 43,8 (33,4) |
| Escritorio, con tope, vuelta 3 (carga 4,4) | 24,4 (66,6) | 32,2 (50) | 34,1 (50) | 57,4 (16,8) |
| Escritorio, con tope, vuelta 4 (carga 4,7) | 46,3 (33,4) | 39,3 (33,4) | 52,2 (33,4) | 59,4 (16,8) |
| Escritorio, sin tope, vuelta 1 | 74,4 (24,9) | 68,7 (29,2) | 36,3 (30,4) | 97,2 (25,8) |
| Escritorio, sin tope, vuelta 2 | 70,7 (18,1) | 66,4 (29,1) | 35,6 (30,3) | 94,6 (26) |
| Celular, con tope, vuelta 1 | 60 (16,7) | 60 (16,7) | 59,6 (16,7) | 60 (16,7) |
| Celular, con tope, vuelta 2 | 60 (16,8) | 60 (16,8) | 59,8 (16,8) | 60 (16,8) |
| Celular, sin tope, vuelta 1 | 160,1 (11,7) | 156,3 (12,4) | 104,6 (12,7) | 177,4 (10,7) |
| Celular, sin tope, vuelta 2 | 196,4 (10) | 187,7 (10,6) | 149,9 (10,3) | 227,5 (8) |

Hero quieto sin tope con el vidrio fijo en calidad media (`?calidad=media`, el método de la memoria del proyecto): escritorio 58,9 y 72,7; celular 155,6 y 194,5. Por defecto la calidad ya es media y en ninguna corrida bajó la resolución (el canvas siguió en 1260 × 1350 / 585 × 784 al pie), así que la diferencia con la fila de arriba es ruido.

Lectura:
- **La referencia limpia es la vuelta 1 con tope:** con la máquina tranquila, todo a 60 en escritorio y en el celular, incluido el paso hero → recorrido (las fases 3 y 6 midieron 51 en ese paso, con otra carga).
- **Sin tope**, el paso a la primera parada en escritorio cae a ≈ 36 en las dos vueltas aunque con tope dé 59,6: con dos canvas dibujando sin sincronía vertical, la GPU se encola. Ese número sirve solo para comparar sin tope contra sin tope. El hero solo sin tope (≈ 71 a 74) coincide con lo que anotó `ARQUITECTURA_MODELO_3D.md` (≈ 70).
- El celular emulado usa la GPU del M1 con un canvas mucho más chico: no predice un teléfono real (pendiente de siempre).

**Ruido.** Durante las vueltas 2 a 4 Safari y su proceso de GPU estaban activos (carga 4,4 a 5,3) y el escritorio con tope bajó a 24 a 52 fps en el hero. Para la compuerta, comparar el prototipo contra esta base **alternando** corridas con carga parecida (desde ahora el script guarda `cargaMaquina` en cada resultado), y no contra los números de esta tabla sin más.

### Contextos WebGL

Contados con la sonda (todos `webgl2`):

| Momento | En el DOM y vivos | Sueltos y vivos |
|---|---|---|
| Hero, después de la intro | **2**: fibras (2400 × 1500 en escritorio, 390 × 1183 en el celular) y busto (1260 × 1350 / 585 × 784) | 2 |
| Al pie, después de recorrer toda la página | **3**: fibras, busto y recorrido (2160 × 1350 / 585 × 1266) | 2 |

- Los dos "sueltos" son canvas de 300 × 150 que nunca se agregan al DOM ni dibujan: las pruebas de soporte de WebGL (`hasWebGL()` de `hero-3d.tsx` y la del recorrido). Nadie los libera; quedan hasta que el recolector los junte. Son los mismos en las 12 corridas.
- Al pie, ninguno dibuja (0 dibujos en 2 s en los cinco), pero los dos del hero siguen vivos, como anota `CLAUDE.md`.
- Igual en todas las corridas, con y sin tope.

### Tiempos de la intro y del 3D del hero

Desde la navegación (`performance.now()`), con tope:

| | Escritorio v1 | v2 | v3 | v4 | Celular v1 | v2 |
|---|---|---|---|---|---|---|
| Se piden `cabeza.glb` e `implantes.glb` | 444 ms | 847 | 2113 | 616 | 392 | 625 |
| Llegan | 471 | 889 | 2396 | 654 | 417 | 658 |
| Se crea el contexto del busto | 710 | 1094 | 2190 | 847 | 701 | 878 |
| Primer dibujo del busto | 781 | 1165 | 2292 | 910 | 750 | 925 |
| 3D listo (`onReady`) = **arranca la intro** (`running`) | **865** | **1276** | **2676** | **1022** | **828** | **1015** |
| `done` | 4866 | 5277 | 6680 | 5022 | 4828 | 5016 |

- En todas las corridas el 3D estuvo listo antes del máximo de 2,5 s, así que la intro la arrancó el 3D (`running` coincide con "listo") y el busto entró girando.
- Carga del 3D del hero, del pedido de los modelos al `onReady`: 0,42 s (escritorio v1), 0,43 s (v2), 0,41 s (v4), 0,44 s (celular v1) y 0,39 s (v2); la v3, con la máquina más cargada, 0,56 s.
- Sin tope, la intro arranca bastante más tarde (2,0 a 2,8 s) y `done` llega 4,1 a 4,4 s después de `running`, porque el bucle sin tope satura el hilo principal: no usar esas corridas para los tiempos.
- Las fibras crean su contexto antes que el busto (≈ 270 a 600 ms) y dibujan desde ahí, aunque se ven recién con la intro.

### Modelos

| Archivo | Bytes sin comprimir | Transferidos (gzip) | Cuándo |
|---|---|---|---|
| `cabeza.glb` | 424 940 | 342 259 | Primer pantallazo |
| `implantes.glb` | 73 308 | 55 154 | Primer pantallazo |
| **Primer pantallazo** | **498 248** | **397 413** | |
| `cuerpo.glb` | 902 244 | 699 221 | Recorrido, después de `done` y al asomar |
| `implantes-recorrido.glb` | 313 036 | 194 799 | Recorrido |

Hallazgo: al cargarse el recorrido se piden `cuerpo.glb` e `implantes-recorrido.glb` y, unos 370 ms después, otra vez `implantes.glb` (que ya había bajado el hero) e `implantes-recorrido.glb`, enteros (no 304: el servidor manda `Cache-Control: public, max-age=0`). Son unos 250 KB de más en cada visita. Causa probable: `escena.tsx` y `miniaturas.tsx` piden los implantes como lista (`useGLTF(urls)`), que la caché de drei guarda con otra clave que los `useGLTF.preload` de a uno. No se tocó (fase sin cambios de código); con el cuerpo único conviene una sola carga por archivo.

## Cámara y pose del hero (del código)

Valores de `components/hero-3d/` y `components/home/hero.tsx` en `a0dcbbf`, para que la fase 1 arme el keyframe `hero` sin redescubrirlos.

- **Cámara** (`body-scene.tsx`): `PerspectiveCamera` en `[0, 0.02, 0.92]` (m), `fov` 30° (vertical), `near` 0,05, `far` 10, `camera.manual = true`. Sin `rotation`, R3F le hace `lookAt(0, 0, 0)` al crearla (`@react-three/fiber`, "Always look at center by default"): mira al centro de la cabeza desde 2 cm más arriba (1,25° hacia abajo).
- **Encuadre horizontal** (`CameraFraming`): `setViewOffset(fullWidth, height, fullWidth/2 − focusX·width, 0, width, height)` con `fullWidth = width + 2·|focusX − 0,5|·width`. La figura queda en `focusX` del ancho del canvas sin cambiar la perspectiva.
- **Equivalente en coordenadas del cuerpo** (calculado, las del guion en `recorrido-3d/camara.ts`): girar la figura +62° es lo mismo que girar la cámara −62°, así que `objetivo` = `[0, 1.56, 0]`, distancia 0,92 m, `azimut` = −62° = **−1,082 rad** (cámara en x = −0,812, z = 0,432 respecto del objetivo), `elevacion` = atan(0,02 / 0,92) = **0,0217 rad**. Alto visible a la distancia del objetivo: 2 · 0,92 · tan 15° = **0,493 m** en el alto del canvas.
  - Escritorio (1440 × 900, canvas de 840 × 900 en x = 600): el canvas ocupa todo el alto de la pantalla, así que `alto` = 0,493 m, y el objetivo cae en x = 600 + 0,555 · 840 = 1066 px: `ancla` = **[0,740, 0,5]**.
  - Celular (390 × 844, canvas de 390 × 523 que empieza a 660 px): 0,493 m son 523 px, o sea `alto` de pantalla = 0,493 · 844 / 523 = **0,796 m**, y el objetivo cae a 660 + 261,6 = 922 px, debajo de la primera pantalla: `ancla` = **[0,5, 1,092]**. Con scroll 0 la cabeza se ve recortada abajo, como en `celular-*-vaiven-*`; en `celular-*-hero-abajo` (scroll de 339 px) el ancla queda en ≈ 0,69.
  - Para comparar, la parada de la craneoplastía: `objetivo` `[-0.047, 1.622, -0.006]`, `azimut` −1,02, `elevacion` 0,38, `alto` 0,306 / 0,62 = 0,494 m en escritorio con `ancla` [0,34, 0,5].
- **`--hero-3d-foco`:** 0,555 en escritorio (`md:`, desde 768 px) y 0,5 en el celular.
- **Caja del canvas** (`hero.tsx`):
  - Escritorio: `absolute right-0 bottom-0`, `aspect-[14/15]`, alto `min(100%, 80vw)` de la sección. A 1440 × 900: caja de 840 × 900 px en x = 600, y = 0 (canvas 1260 × 1350 px).
  - Celular: `h-[62vh]`, `-mt-xl` (48 px metido bajo los botones), ancho completo. A 390 × 844: caja de 390 × 523 px que empieza a 660 px del borde superior de la sección, cuyo alto es 1183 px (canvas 585 × 784 px).
- **Modelo:** el `.glb` está en metros con los pies en 0 y la figura mirando a +Z (su lado derecho es −X). En la escena va bajado `HEAD_HEIGHT` = 1,56 m (`<group position={[0, -1.56, 0]}>`), dentro de un grupo que gira en Y.
- **Giro de la pose:** `TURN_PROFILE` = 62° en +Y (perfil mirando a la derecha de la pantalla, se ve el lado derecho con la craneoplastía).
- **Vaivén:** entre 62° y `TURN_FRONT` = 22°, `k = (1 − cos(2π·t/22))/2`, ciclo de `TURN_PERIOD` = 22 s ida y vuelta. `t` se acumula solo mientras se dibuja (con `step = min(delta, 0,1)`), y arranca al terminar la entrada (2,6 s después de `running`), o sea 1,4 s antes de `done`: `vaiven-00` está en t ≈ 1,7 s, `-05` en ≈ 6,4 s, `-11` en ≈ 12,4 s (casi de frente, el extremo es a los 11 s) y `-16` en ≈ 17,4 s.
- **Entrada:** el grupo arranca en 62° + `ENTRY_TURN` (55°) y `y = −ENTRY_RISE` (0,025 m), y llega a la pose en `ENTRY_SECONDS` = 2,6 s con cúbica de salida (`(1 − p)³`). Solo si el 3D estuvo listo antes de que arrancara la intro (`play`); si no, `skip` (entra la imagen fija). Con movimiento reducido no hay entrada ni vaivén y el canvas pasa a `frameloop="demand"`.
- **CSS de la entrada** (`.intro-3d`, `globals.css`): desde `opacity: 0; scale: 0.94; filter: blur(14px)`, 1600 ms, `cubic-bezier(0.33, 1, 0.68, 1)`, sin retraso. Más el fundido del canvas (`duration-700`) al `onReady`.
- **Corte del busto:** `CORTE` = 1,33 m de altura (`3d/scripts/cabeza.py`, plano horizontal, debajo de las clavículas; tapado con `triangle_fill`). En la escena queda 0,23 m debajo del centro de la cabeza. Coincide con el borde inferior del hero: el canvas llega al pie de la sección.
- **Resolución:** `dpr` = clamp(devicePixelRatio, 1, 1,5); `PerformanceMonitor` la baja de a 0,25 hasta 1 y después pasa el vidrio a `baja`. Nunca vuelve a subir.
- **Vidrio** (`materials.tsx`, `MeshTransmissionMaterial` con buffer propio MSAA ×2): `thickness` 0,05, `roughness` 0,06, `ior` 1,25, `chromaticAberration` 0, `anisotropicBlur` 0,1, `color` #c8e1fa, `attenuationColor` #5b9ee0, `attenuationDistance` 0,35, `clearcoat` 1, `clearcoatRoughness` 0,1. Muestras: alta 10, media 4 (por defecto), baja 3. El buffer se dibuja con `NoToneMapping` y con el tramo del degradé como fondo.
  - Para comparar, el vidrio del recorrido (`recorrido-3d/escena.tsx`): `thickness` 0,06, `roughness` 0,05, `ior` 1,28, `color` #eaf3fd, `attenuationColor` #3f86d6, `attenuationDistance` 0,22; hueso 0,34; mismo `FOV` 30.
- **Hueso:** `meshPhysicalMaterial` #f7f5f0, `roughness` 0,55, `sheen` 0,4 blanco, transparente, opacidad 0,4 (`BONE_OPACITY`), `depthWrite` false.
- **Titanio de la craneoplastía:** `meshStandardMaterial` #9aa1aa, `metalness` 1, `roughness` 0,5.
- **Luz** (`<Environment resolution={256}>`, sin HDRI): esfera interior #5f666e; `Lightformer` rect 3 en `[0, 5, −2]` escala `[10, 2, 1]`; rect 2 en `[−5, 1, 1]` girado π/2 escala `[8, 3, 1]`; rect 1,2 #9ec5f0 en `[5, 0, 1]` girado −π/2 escala `[8, 3, 1]`; anillo 1,5 #003c6f en `[0, −1, −6]` escala 4; contraluz rect 4 en `[−2, 2, −5]` escala `[3, 6, 1]`.
- **Fondo:** degradé vertical `--color-stage-from` #e6eef8 → `--color-stage-to` #c3d7ee en la sección (CSS). El canvas es transparente; el buffer del vidrio dibuja el tramo de ese degradé que tiene detrás (`Framing.stage` = `[offsetTop, offsetTop + alto] / alto de la sección`). Tramo medido: `[0, 1]` en escritorio (el canvas ocupa todo el alto) y `[0,5579, 1]` en el celular (`encuadre.json`).
- **Fibras** (`GhostFibers` en `hero.tsx`): rotación −39°, `strands`, 96 hilos, una capa, `depthOfField` 0,45, `brightness` 0,75, `sparkle` 0,6, sin partículas, grano ni viñeta; colores #003c6f / #2260a1 / blanco. 2x en escritorio, 1x en el celular.

## Cómo repetirlo (fase 1)

```sh
npm run build && npx next start -p 3400        # en otra terminal
node docs/landing/cuerpo-unico/base/medir.mjs capturas --out <dir>
node docs/landing/cuerpo-unico/base/medir.mjs respaldo --out <dir>
node docs/landing/cuerpo-unico/base/medir.mjs encuadre --out <dir>
for v in 1 2; do
  node docs/landing/cuerpo-unico/base/medir.mjs medidas --vuelta $v --out <dir>
  node docs/landing/cuerpo-unico/base/medir.mjs medidas --sin-tope --vuelta $v --out <dir>
done
node docs/landing/cuerpo-unico/base/medir.mjs resumen --out <dir>
```

- Salida: `<dir>/capturas/*.webp` con los mismos nombres, `capturas.json`, `respaldo.json`, `encuadre.json` y `medidas/*.json`. Sin `--out`, escribe acá (no pisar la base: usar `docs/landing/cuerpo-unico/proto/` o el scratchpad).
- Si el prototipo cambia el DOM, se ajusta con opciones en lugar de editar el script: `--listo <selector>` (el elemento que aparece cuando el 3D del hero ya se ve), `--hero <selector>` (la sección del hero; hoy `#inicio`), `--recorrido <selector>` (el contenedor alto del recorrido; hoy `.recorrido`), `--tramos` y `--primera` (hoy 7 y 1: la craneoplastía es `seg` = 1). En el cuerpo único, el paso hero → craneoplastía sería `--primera` con el `seg` de la parada del cráneo dentro del contenedor nuevo, y el hero quieto se mide igual (arriba de todo, 1 s después de `done`).
- La sonda depende solo de `data-intro` (`running`/`done`) en algún elemento y de la API de WebGL: no hay que cambiarla.
- Medir con la máquina en el mismo estado y, si hay dudas, alternar base y prototipo (memoria del proyecto): los valores sin tope varían mucho entre corridas.
