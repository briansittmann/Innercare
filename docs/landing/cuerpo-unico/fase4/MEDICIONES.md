# Cuerpo único, fase 4: mediciones

Primeras mediciones de cuadros por segundo del cuerpo único con la Mac enchufada (2026-10-31), alternando con la base.

## Cómo se tomó

- **Base:** commit `6492345` (la línea de base de la fase 0) en un worktree aparte, `npm run build` y `next start -p 3401`. **Fase 4:** la rama `cuerpo-unico` en `788c76f` (build de producción, `next start -p 3400`).
- **Script:** `node docs/landing/cuerpo-unico/base/medir.mjs medidas [--sin-tope] --vuelta N --url U --out DIR`, con `--listo '.recorrido-escena[data-listo]'` para la fase 4. Mismo método que `base/MEDICIONES.md`: Chrome del sistema sin interfaz con la GPU del M1, 1440 × 900 a 2x y 390 × 844 a 3x, fps por `requestAnimationFrame` en la página.
- **Orden:** base, fase 4, base, fase 4; primero sin tope (`--disable-gpu-vsync --disable-frame-rate-limit`), después con tope.
- **Qué mide:** hero quieto (6 s, 1 s después de `done`), paso de 0,3 pantallas (4 s), paso a la primera parada (`seg` 1 del contenedor `.recorrido`, 5 s) y recorrido entero (de arriba abajo del contenedor, 12 s). En la fase 4 el contenedor incluye la toma del hero, así que "paso a la primera parada" es hero → craneoplastía en las dos.
- **Ruido:** carga de la máquina entre 3 y 10 (otras apps abiertas). PerformanceMonitor bajó solo la resolución del canvas de la fase 4 en las corridas sin tope de escritorio (1800 × 1125, 1,25x); con tope quedó en 1,5x.
- Datos crudos: `medidas/base/` y `medidas/fase4/`.

## Resultados (fps, entre paréntesis p95 en ms)

### Sin tope

| | Hero quieto | Paso 0,3 pantallas | Paso a la craneoplastía | Recorrido |
|---|---|---|---|---|
| Escritorio, base (2 vueltas) | 70,7 / 73,6 | 66,5 / 69 | 35,8 / 36,1 | 97,7 / 95 |
| Escritorio, fase 4 | 113,8 / 114,8 | 48,7 / 50 | 57,7 / 59,7 | 55,9 / 54,4 |
| Celular, base | 196,9 / 196,2 | 184,1 / 189 | 150,3 / 150,7 | 230 / 229,2 |
| Celular, fase 4 | 443,7 / 398,3 | 309,3 / 288,7 | 234,4 / 225,4 | 117,1 / 114,9 |

### Con tope (60)

| | Hero quieto | Paso 0,3 pantallas | Paso a la craneoplastía | Recorrido |
|---|---|---|---|---|
| Escritorio, base (2 vueltas) | 58,7 (16,8) / 60 (16,8) | 60 / 60 | 59,6 / 59,8 | 59,8 / 59,9 |
| Escritorio, fase 4 | 60 (16,8) / 60 (16,7) | 58,5 (16,8) / 58,5 | 59,2 / 59,2 | **51,8 (33,4) / 51,8 (33,4)** |
| Celular, base | 60 / 60 | 60 / 60 | 59,6 / 59,6 | 60 / 60 |
| Celular, fase 4 | 60 / 60 | 59,8 / 59,8 | 59,4 / 59,4 | 60 / 60 |

## Lectura

- **Hero quieto:** mucho más holgado que la base (114 contra 72 sin tope en escritorio): un solo canvas que dibuja solo la caja del busto (`recorteHero`) en lugar de dos contextos.
- **Paso hero → craneoplastía:** mejor que la base (58 contra 36 sin tope), porque la base cargaba `cuerpo.glb` y montaba el contexto del recorrido a mitad de camino. El tramo corto de 0,3 pantallas cae de 67 a 49 sin tope en escritorio (el hero entero más el fundido del corte en un solo canvas a pantalla completa), pero con tope sigue en 58,5.
- **Recorrido en escritorio: pérdida real.** Sin tope, 55 contra 96; con tope, 51,8 con p95 de 33 ms (la base, 60). En el celular el margen sin tope también baja a la mitad (116 contra 230), aunque con tope queda en 60. Los dibujos por cuadro son parecidos a los de la base (≈ 79 000 contra 77 500 al pie), así que el costo está en cada pasada y no en la cantidad: candidatos, el vidrio del cuerpo único (transparente, con el corte por altura en el shader de la piel, el hueso y el borde) y el buffer del vidrio a pantalla completa. No se tocó en esta fase: queda para la fase 5, midiendo por partes (`?calidad`, sin borde, vidrio opaco desde la craneoplastía).
- **Contextos WebGL:** 2 vivos en la fase 4 (fibras y escena) contra 3 de la base; al pie, el de las fibras sigue vivo pero sin caja ni dibujos (pausado).
- Sin errores de consola en ninguna corrida.

## Después de las correcciones del verificador

Mismo método, con `788c76f` → `a6b88c5` (vidrio opaco desde la craneoplastía y el resto de las correcciones). Base `6492345` en un worktree, alternando: base, corrección, base, corrección (sin tope) y una vuelta con tope de cada una. La máquina estaba más cargada (carga 6 a 17). Datos: `medidas/correcciones-base/` y `medidas/correcciones/`.

**Causa del recorrido lento:** el vidrio del cuerpo único quedaba transparente durante todo el recorrido (`h < 0,999`), aunque desde la craneoplastía el corte ya está debajo de los pies y no hace falta alfa. Transparente, el esqueleto (transparente, con brillo) se dibujaba entero debajo del vidrio en cada cuadro; opaco, como el vidrio del recorrido original, la prueba de profundidad lo descarta y el hueso se ve igual, por el buffer del vidrio. Ahora es transparente solo mientras el corte baja (`0,001 < h < 0,999`). Las otras sospechas (tres trozos de piel, el shader del corte, el degradé del buffer) no hizo falta tocarlas.

`partes.mjs` del verificador (recorrido entero en 12 s, escritorio 2x, con tope), alternando:

| | Vuelta 1 | Vuelta 2 | Vuelta 3 | Vuelta 4 |
|---|---|---|---|---|
| Base | 59,8 (p95 16,8) | 59,8 (16,8) | 59,7 (16,7) | 59,8 (16,8) |
| Corrección | 59,5 (16,7) | 59,7 (16,7) | 59,7 (16,8) | 59,5 (16,8) |
| Antes (verificador) | 51,5 a 52 (33,4), 17 % de cuadros perdidos | | | |

`medir.mjs medidas` (fps; entre paréntesis p95 en ms):

| | Hero quieto | Paso 0,3 pantallas | Paso a la craneoplastía | Recorrido |
|---|---|---|---|---|
| Escritorio sin tope, base | 71,1 / 72 | 67,8 / 67,4 | 35,5 / 35,1 | 94,1 / 93,9 |
| Escritorio sin tope, corrección | 118,7 / 109,2 | 46,1 / 45,6 | 46,1 / 42,9 | **89,6 / 90,2** (antes 55,9 / 54,4) |
| Celular sin tope, base | 193,6 / 192,9 | 186,6 / 186,1 | 143,6 / 146,3 | 223,2 / 224,5 |
| Celular sin tope, corrección | 429,5 / 422,7 | 229,5 / 221,2 | 235 / 227,8 | **254,8 / 256,1** (antes 117,1 / 114,9) |
| Escritorio con tope, base | 60 | 59,8 | 59,8 | 59,8 (16,7) |
| Escritorio con tope, corrección | 60 | 58,3 (16,8) | 59,4 | **60 (16,8)** (antes 51,8 (33,4)) |
| Celular con tope, base | 60 | 60 | 59,4 | 60 |
| Celular con tope, corrección | 60 | 60 | 59,8 | 60 |

- El recorrido vuelve a 60 con tope y queda a la par de la base sin tope en escritorio (90 contra 94) y por encima en el celular.
- Sigue más justo que la base el tramo corto del hero (0,3 pantallas: 46 contra 67 sin tope, 58,3 con tope): ahí el vidrio es transparente a propósito (el corte baja) y el esqueleto se dibuja dos veces. Queda para la fase 5.
- `implantes.glb` se descarga una vez (antes, dos: la craneoplastía del hero lo pedía sola y los implantes, en lista).
