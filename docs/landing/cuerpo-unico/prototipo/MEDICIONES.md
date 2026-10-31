# Prototipo de paridad del cuerpo único (fase 1)

La compuerta del plan (paso 0): el hero dibujado con la escena del recorrido y el cuerpo entero, contra la línea de base del hero actual (`../base/MEDICIONES.md`). Rama `cuerpo-unico`, build de producción, 2026-10-31.

## Cómo se activa

- **`/?cuerpo-unico`** en la home. Sin el parámetro, la home es la de siempre: se comprobó cuadro a cuadro (hero y seis tomas del recorrido, movimiento reducido) que el build nuevo sin el parámetro da la misma imagen que `6492345`, salvo la miniatura de partículas de la tarjeta, que cambia sola entre corridas.
- Con el parámetro:
  - **Hero:** el texto, las fibras, el degradé, los botones y la entrada son los de siempre, pero en lugar del busto (`components/hero-3d/body-scene.tsx`, `cabeza.glb`) se monta la escena del recorrido en modo hero (`components/recorrido-3d/escena.tsx`, `cuerpo.glb`), en la toma 0 del guion (`HERO` en `camara.ts`). El canvas no es la caja del busto (840 × 900) sino la pantalla entera al pie del hero, de borde a borde (1440 × 900 en escritorio, 390 × 844 en el celular), como la escena fija que va a tener el cuerpo único. `hero-3d.tsx` mide en el DOM dónde caería la cabeza del busto y le pasa a la escena ese encuadre (ancla, alto, estiramiento y distancia).
  - **Recorrido:** la toma 0 pasa a ser la del hero (sin el título "Recorrido por los implantes"), sobre el degradé del hero, y de ahí sigue a la craneoplastía y las demás paradas. El aspecto pasa del busto al del recorrido con el peso del hero (`pesoHero` en `camara.ts`).
- Las capturas y medidas usan `medir.mjs` con la opción nueva `--param cuerpo-unico`, sin otros cambios (el selector de "3D listo" sigue sirviendo).

## Capturas (`capturas/`) y hoja de comparación

Mismos nombres, momentos y condiciones que la base (`../base/MEDICIONES.md`, "Capturas"). `capturas.json` registra el instante real de cada una.

La hoja de comparación es **`../comparacion.html`** (se abre como archivo): por captura, base, prototipo y diferencia × 4, con tres medidas sobre la zona del 3D. Las diferencias están en `diferencias/` y las medidas en `diferencias.json`; se regeneran con `node docs/landing/cuerpo-unico/comparar.mjs`.

### Resultado

Medidas de `comparar.mjs` sobre la zona del 3D (escritorio: la caja del busto, x ≥ 600; celular: debajo de la línea de habilitaciones, y ≥ 330, o la pantalla entera en `hero-abajo`). **Media**: diferencia media del canal que más cambia, de 0 a 255. **>24**: porcentaje de píxeles que cambian más de 24/255 (≈ 10 %). **Corrimiento**: el desplazamiento entero (dx, dy) que mejor alinea la zona; 0, 0 es que la silueta cae en el mismo píxel.

| Captura | Media | >24 (%) | Corrimiento |
|---|---|---|---|
| celular-movimiento-hero-abajo | 2.1 | 0.48 | 0, 0 |
| celular-movimiento-intro-0000 | 0.09 | 0 | 0, 0 |
| celular-movimiento-intro-2000 | 2.31 | 0.43 | 0, 0 |
| celular-movimiento-intro-fin | 1.99 | 0.33 | 0, 0 |
| celular-movimiento-vaiven-00 | 1.87 | 0.3 | 0, 0 |
| celular-movimiento-vaiven-05 | 1.49 | 0.12 | 0, 0 |
| celular-movimiento-vaiven-11 | 1.82 | 0.35 | 0, 0 |
| celular-movimiento-vaiven-16 | 2.13 | 0.32 | 0, 0 |
| celular-reducido-detalle | 0.26 | 0.14 | 0, 0 |
| celular-reducido-hero-abajo | 1.63 | 0.38 | 0, 0 |
| celular-reducido-intro-0000 | 0.83 | 0 | 0, 0 |
| celular-reducido-intro-2000 | 1.11 | 0.17 | 0, 0 |
| celular-reducido-intro-fin | 1.11 | 0.17 | 0, 0 |
| celular-reducido-vaiven-00 | 1.11 | 0.17 | 0, 0 |
| celular-reducido-vaiven-05 | 1.11 | 0.17 | 0, 0 |
| celular-reducido-vaiven-11 | 1.11 | 0.17 | 0, 0 |
| celular-reducido-vaiven-16 | 1.11 | 0.17 | 0, 0 |
| celular-respaldo-sin-webgl | 0 | 0 | 0, 0 |
| escritorio-movimiento-intro-0000 | 0.57 | 0 | 0, 0 |
| escritorio-movimiento-intro-2000 | 1.64 | 0.51 | 0, 0 |
| escritorio-movimiento-intro-fin | 1.48 | 0.43 | 0, 0 |
| escritorio-movimiento-vaiven-00 | 1.65 | 0.55 | 0, 0 |
| escritorio-movimiento-vaiven-05 | 1.47 | 0.5 | 0, 0 |
| escritorio-movimiento-vaiven-11 | 1.3 | 0.45 | 0, 0 |
| escritorio-movimiento-vaiven-16 | 1.6 | 0.52 | 0, 0 |
| escritorio-reducido-detalle | 0.98 | 0.34 | 0, 0 |
| escritorio-reducido-intro-0000 | 0.46 | 0 | 0, 0 |
| escritorio-reducido-intro-2000 | 1.3 | 0.33 | 0, 0 |
| escritorio-reducido-intro-fin | 1.3 | 0.33 | 0, 0 |
| escritorio-reducido-vaiven-00 | 1.3 | 0.33 | 0, 0 |
| escritorio-reducido-vaiven-05 | 1.3 | 0.33 | 0, 0 |
| escritorio-reducido-vaiven-11 | 1.3 | 0.33 | 0, 0 |
| escritorio-reducido-vaiven-16 | 1.3 | 0.33 | 0, 0 |
| escritorio-respaldo-sin-webgl | 0.33 | 0.01 | 0, 0 |

Lectura:
- **Silueta, encuadre y pose:** corrimiento 0, 0 en las 34 capturas, en escritorio y en el celular, quietas y en movimiento. La entrada (`intro-2000`, a medio girar) y el vaivén (`vaiven-11`, casi de frente) caen en el mismo cuadro que la base: el giro corre igual, cuadro a cuadro.
- **Vidrio, color, brillo del titanio:** diferencia media de 1,1 a 2,3 sobre 255 y menos del 0,6 % de los píxeles cambia más de 24/255. Con movimiento, parte de eso son las fibras, que se mueven solas y cambian entre corridas. Quietas (movimiento reducido), 1,1 (celular) y 1,3 (escritorio); las de detalle a resolución completa, 0,26 y 0,98. No se midió cuánto difieren dos corridas de la misma base (quedó sin tiempo: ver "Rendimiento").
- **`intro-0000` y `respaldo-sin-webgl`:** prácticamente 0: en el primer cuadro de la intro y sin WebGL se ve la misma imagen fija del busto (`cuerpo-inicio*.webp`). Con el cuerpo único, esas imágenes siguen sirviendo tal cual.
- **Lo que queda distinto** (visible solo ampliando, en `diferencias/`): el contorno de la oreja dentro del vidrio tiene un brillo un poco más marcado; algunas vértebras del fondo del cuello se ven apenas más tenues; y en el borde inferior, donde el busto tiene la tapa del corte, el cuerpo tiene un corte abierto (queda contra el borde del hero y no se distingue). Las tres vienen de que la piel y el hueso del cuerpo no son exactamente las mallas del busto (otra cuantización y sin la tapa).


## Mediciones

Mismo método que la base (`../base/MEDICIONES.md`, "Mediciones"), **alternando base y prototipo en la misma sesión y con el mismo build** (la base es la home sin el parámetro, que da la misma imagen que `6492345`). La máquina estuvo cargada todo el tiempo (Safari con su proceso de GPU al 26 %, Teléfono, Contactos, `BTLEServer` al 100 %; carga 3,5 a 7): no se cerraron apps del usuario. **Hacia el final la Mac pasó a batería (14 %)** y Chrome bajó a 30 cuadros con tope en base y prototipo por igual: lo medido desde ahí no se usó.

Se midieron cuatro versiones del prototipo, en orden:

1. **Sin recorte** (`sin-recorte/`, tres vueltas alternadas, 02:57 a 03:21): el canvas de pantalla entera dibujando todo.
2. **Con recorte** (tres vueltas, 03:22 a 03:47; los JSON no se guardaron, la tabla está abajo): la escena dibuja solo en la caja del busto (tijera en la pasada principal y en el buffer del vidrio).
3. **Con recorte y la piel por encima del corte** (`medidas/`, `caja/`, `base-alternada/`, una vuelta, 03:57 a 04:09): solo se dibujan los triángulos de la piel que llegan por encima del corte y el vidrio es opaco mientras el aspecto del hero está entero. Es la versión final del hero. **Su columna "Recorrido" no vale**: en esta versión la escena del recorrido también usaba la piel ordenada por altura y bajó a 47,5; se corrigió (ahora solo el hero la usa) y el recorrido vuelve al camino de la versión 2, pero no se volvió a medir por la batería.
4. **Banco rápido del hero quieto** (`heroq`, sin tope, tres vueltas alternadas, ≈ 03:50, versión 3): solo el hero quieto, para separar el costo del área del canvas del costo del contenido.

### Hero quieto: lo que pide la compuerta

| | Base | Sin recorte (1) | Con recorte (2) | Final (3 y 4) | Final, canvas de caja (`=caja`) |
|---|---|---|---|---|---|
| Escritorio, con tope | 57,2 a 58,7 | 49,3 a 49,7 | 52,0 a 52,3 | 55,2 | **60** |
| Escritorio, sin tope | 64,5 a 67,1 | 55,9 a 56,2 | 59,0 a 59,4 | 63,6 a 64,5 | **68,8 a 69,8** |
| Celular, con tope | 60 | 60 | 60 | 60 | 60 |
| Celular, sin tope | 179 a 181 | 161 a 162 | 165 a 166 | 178,1 a 179,2 | **191,9 a 193,7** |

- **Con el canvas del tamaño de la caja del busto, el cuerpo entero rinde más que el busto** (+3,6 % en escritorio y +7 % en el celular, sin tope): el contenido ya no cuesta más que el busto (se dibujan unos 21 000 triángulos de piel, como el busto, y las vértebras y el cráneo son los mismos).
- **Con el canvas de pantalla entera (el que va a tener el cuerpo único), el hero queda 4,6 % abajo en escritorio y 1,4 % abajo en el celular** sin tope; con tope, 55,2 contra 58 en escritorio y 60 contra 60 en el celular. Lo que queda es el área del canvas: el canvas tiene antialiasing (el búfer de dibujo es multimuestra y se resuelve entero en cada cuadro) y el compositor mezcla 2160 × 1350 px en lugar de 1260 × 1350, aunque la escena dibuje solo en la caja.
- **Lectura honesta: con el canvas de pantalla entera, la compuerta de rendimiento no se cumple del todo en escritorio** (−4,6 %); en el celular, prácticamente sí. Con el canvas de caja se cumple con margen. Qué hacer en la fase 2: abajo, en "Para la fase 2".

### Tiempos, contextos y modelos

- **La intro arranca igual:** 0,79 a 1,03 s desde la navegación en el prototipo, contra 0,75 a 1,09 s en la base (con tope, todas las vueltas). En localhost la red no cuenta: `cuerpo.glb` (970 048 bytes; ≈ 700 KB con gzip) pesa el doble que `cabeza.glb` + `implantes.glb` (498 248): en un servidor real, la intro puede demorarse. Medirlo en la fase 2 con red simulada.
- **Contextos WebGL:** 2 en el hero y 3 al pie, como la base (el prototipo reemplaza el del busto por el de la escena en modo hero). Sin errores de consola en ninguna corrida.
- **Sin WebGL** (`respaldo.json`): la misma imagen fija que la base, sin contextos.

### Paso al recorrido y recorrido

- **Con tope**, el paso de 0,3 pantallas da 54,3 (final) y 48,3 a 51,3 (versiones 1 y 2) contra 55,8 a 56,8 de la base; el paso a la primera parada, 55,8 contra 58,2.
- **Sin tope**, el paso de 0,3 pantallas se desploma en todas las versiones del prototipo (13 a 18 contra 61 a 62), incluida la de canvas de caja, mientras el paso a la primera parada sube (67 a 76 contra 31). Con tope no pasa. Contando dibujos por contexto con tope, el hero del prototipo dibuja lo mismo por cuadro que el busto (12,9) y el recorrido no dibuja; sin tope, el hero del prototipo llega a dibujar unas dos veces por cuadro de la página. No se llegó a aislar la causa (ver "Pendiente" en la bitácora); son los números de dos canvas sin sincronía vertical que la base ya marcaba como poco fiables.
- **Recorrido** (versiones 1 y 2, mismo camino que el final): 59,7 a 59,8 con tope, como la base; sin tope, 58 a 73 contra 84 a 87 (el vidrio del recorrido es transparente en el cuerpo único y la escena fija lleva el degradé).

### Datos crudos

Versión final (3), una vuelta:

| Tamaño | Tope | Vuelta | Variante | Carga | Intro (s) | Hero quieto | Paso 0,3 | Paso 1.ª parada | Recorrido |
|---|---|---|---|---|---|---|---|---|---|
| celular | sin | 1 | base | 4.43 | 2.09 | 181.4 / 181.2 | 176.1 | 132.1 | 203.7 |
| celular | sin | 1 | caja | 6.82 | 1.87 | 193.7 / 191.9 | 184.9 | 181.8 | 102 |
| celular | sin | 1 | prototipo | 5.67 | 1.98 | 179 / 178.3 | 173.8 | 173.8 | 102.3 |
| celular | con | 1 | base | 3.52 | 0.81 | 60 | 60 | 59.6 | 60 |
| celular | con | 1 | caja | 4.36 | 0.83 | 60 | 60 | 59.6 | 60 |
| celular | con | 1 | prototipo | 5.36 | 0.86 | 60 | 60 | 59.6 | 60 |
| escritorio | sin | 1 | base | 3.52 | 2.32 | 67 / 67 | 62 | 31.5 | 85 |
| escritorio | sin | 1 | caja | 4.78 | 2.28 | 69.6 / 69 | 17.4 | 75.9 | 42.5 |
| escritorio | sin | 1 | prototipo | 7.07 | 2.29 | 64.5 / 64.7 | 18.1 | 71.8 | 42.8 |
| escritorio | con | 1 | base | 3.74 | 0.87 | 58 | 55.8 | 58.2 | 59.8 |
| escritorio | con | 1 | caja | 3.99 | 0.86 | 60 | 58.5 | 58.2 | 47.5 |
| escritorio | con | 1 | prototipo | 6.43 | 1.03 | 55.2 | 54.3 | 55.8 | 47.5 |

Versión 1 (sin recorte), tres vueltas:

| Tamaño | Tope | Vuelta | Variante | Carga | Intro (s) | Hero quieto | Paso 0,3 | Paso 1.ª parada | Recorrido |
|---|---|---|---|---|---|---|---|---|---|
| celular | sin | 1 | base | 5.14 | 2.14 | 179.2 / 178.4 | 172.8 | 127.1 | 206.1 |
| celular | sin | 1 | prototipo sin recorte | 8.27 | 1.93 | 162.4 / 160.9 | 157.2 | 127.5 | 185.6 |
| celular | sin | 2 | base | 5.98 | 2.07 | 180.2 / 179.7 | 173.8 | 129.1 | 205.1 |
| celular | sin | 2 | prototipo sin recorte | 5.17 | 2.43 | 161.9 / 160.9 | 158.4 | 144 | 183.9 |
| celular | sin | 3 | base | 4.35 | 2.10 | 179.7 / 179.9 | 173.6 | 130.4 | 204.5 |
| celular | sin | 3 | prototipo sin recorte | 5.18 | 1.92 | 161.1 / 162 | 157.1 | 139.2 | 186.6 |
| celular | con | 1 | base | 6.14 | 0.84 | 60 | 60 | 59.6 | 60 |
| celular | con | 1 | prototipo sin recorte | 5.36 | 0.94 | 60 | 60 | 59.4 | 60 |
| celular | con | 2 | base | 5.36 | 0.95 | 60 | 60 | 59.6 | 60 |
| celular | con | 2 | prototipo sin recorte | 3.53 | 0.84 | 60 | 60 | 59.6 | 60 |
| celular | con | 3 | base | 5.51 | 0.85 | 60 | 60 | 59.6 | 60 |
| celular | con | 3 | prototipo sin recorte | 3.62 | 0.78 | 60 | 60 | 59.4 | 60 |
| escritorio | sin | 1 | base | 4.85 | 2.48 | 64.5 / 65.3 | 60.8 | 31 | 84 |
| escritorio | sin | 1 | prototipo sin recorte | 12.81 | 2.85 | 55.9 / 56.4 | 14.7 | 36.5 | 68.3 |
| escritorio | sin | 2 | base | 3.59 | 2.50 | 66.5 / 65.5 | 62.3 | 31.6 | 85.6 |
| escritorio | sin | 2 | prototipo sin recorte | 4.96 | 2.25 | 56.2 / 56.9 | 12.6 | 37.5 | 58 |
| escritorio | sin | 3 | base | 3.58 | 2.37 | 66.4 / 66.9 | 61.4 | 31.7 | 85 |
| escritorio | sin | 3 | prototipo sin recorte | 4.73 | 2.30 | 56 / 56.5 | 13.9 | 37 | 68.8 |
| escritorio | con | 1 | base | 4.28 | 1.09 | 57.2 | 55 | 57.2 | 59.7 |
| escritorio | con | 1 | prototipo sin recorte | 6.53 | 1.04 | 49.3 | 48.5 | 53.4 | 59.8 |
| escritorio | con | 2 | base | 6.72 | 0.84 | 58.5 | 56.8 | 57.6 | 59.7 |
| escritorio | con | 2 | prototipo sin recorte | 4.55 | 0.88 | 49.7 | 48.3 | 53.6 | 59.8 |
| escritorio | con | 3 | base | 6.6 | 0.84 | 57.2 | 56.5 | 57.4 | 59.8 |
| escritorio | con | 3 | prototipo sin recorte | 4.91 | 0.91 | 49.7 | 48.7 | 53.4 | 59.7 |

Versión 2 (con recorte), tres vueltas (JSON no guardados): escritorio con tope, hero 52,2 / 52,3 / 52,0 contra 57,8 / 58,7 / 58,3; sin tope, 59,0 / 59,4 / 59,0 contra 66,4 / 67,1 / 66,4. Celular con tope, 60 en todo; sin tope, hero 165,7 / 165,9 / 165,3 contra 180,5 / 180,4 / 179,1. Recorrido, 59,8 con tope en escritorio y 60 en el celular, como la base.

Banco rápido del hero quieto (4), sin tope, tres vueltas alternadas: escritorio, base 66,6 / 67,1 / 66,9, caja 69,3 / 68,8 / 69,8, prototipo 64,0 / 63,6 / 63,8; celular, base 181,4 / 181,0, prototipo 179,2 / 178,1.

## Para la fase 2

- **Que el canvas no ocupe la pantalla entera mientras se ve el hero.** El costo que queda es el del área del canvas, no el del cuerpo: con el canvas de caja el cuerpo entero rinde más que el busto. Opciones, de la más simple a la más fina: (a) el canvas fijo del recorrido arranca con el tamaño y la posición de la caja del busto y pasa a pantalla entera al empezar el scroll (un cambio de tamaño, que puede costar un cuadro; medirlo); (b) canvas sin antialiasing y la pasada principal en un búfer propio con MSAA del tamaño de lo que se ve, copiado al canvas; (c) aceptar el −5 % en escritorio si el usuario no lo nota con tope (55 contra 58 con la máquina cargada).
- **Piel por zonas en Blender:** no hizo falta. Lo mismo se logró sin reexportar, ordenando la piel por altura y dibujando solo lo que queda arriba del corte, pero ese orden rompe la localidad de la malla y en el recorrido costaba un 20 %. En la fase 2 conviene partir `piel` en Blender en dos o tres mallas por altura (por ejemplo, arriba y abajo de 1,30 m), que da lo mismo en el hero sin tocar el recorrido, y que la escena oculte o recorte por altura las de abajo.
- **El paso al recorrido sin tope** (arriba): aislarlo con una sola escena, que es lo que va a haber.
- **La luz de las paradas** cambia porque el estudio gira con la cámara (necesario para el hero); revisar las tomas.

