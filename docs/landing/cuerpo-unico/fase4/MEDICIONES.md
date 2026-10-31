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
