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
- **Vidrio, color, brillo del titanio:** diferencia media de 1,1 a 2,3 sobre 255 y menos del 0,6 % de los píxeles cambia más de 24/255. Para comparar, dos corridas de la misma base difieren en las fibras (se mueven solas) y en el ruido del muestreo de la refracción; en las capturas quietas (movimiento reducido, sin fibras en movimiento) la media es 1,1 (celular) y 1,3 (escritorio). Las de detalle a resolución completa, 0,26 y 0,98.
- **`intro-0000` y `respaldo-sin-webgl`:** prácticamente 0: en el primer cuadro de la intro y sin WebGL se ve la misma imagen fija del busto (`cuerpo-inicio*.webp`). Con el cuerpo único, esas imágenes siguen sirviendo tal cual.
- **Lo que queda distinto** (visible solo ampliando, en `diferencias/`): el contorno de la oreja dentro del vidrio tiene un brillo un poco más marcado; algunas vértebras del fondo del cuello se ven apenas más tenues; y en el borde inferior, donde el busto tiene la tapa del corte, el cuerpo tiene un corte abierto (queda contra el borde del hero y no se distingue). Las tres vienen de que la piel y el hueso del cuerpo no son exactamente las mallas del busto (otra cuantización y sin la tapa).


## Mediciones

PENDIENTE_MEDICIONES
