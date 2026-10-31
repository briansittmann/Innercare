# Cuerpo único: estado de la corrida nocturna (2026-10-31)

Archivo de respaldo del orquestador, por si la Mac se apaga antes del informe final (la batería estaba al 6 % al escribirlo). Si el informe final no llegó, esto es lo que hay.

- **Compuerta (fase 1): PASA**, en la segunda pasada del verificador, tras corregir el filo blanco del corte bajo el hombro (`8228f5d`). Comparación lado a lado: `comparacion.html`; recortes del verificador: `verificacion/`.
- **Fase 0** (línea de base): hecha, `6492345`. `base/MEDICIONES.md`.
- **Fase 1** (prototipo detrás de `?cuerpo-unico`): hecha, `0aeedd0` a `8228f5d`. `prototipo/MEDICIONES.md`.
- **Fase 2** (Blender: piel por zonas, maxilar entero, cuerpo en dos archivos): hecha, `2a40c70`, `b2309cf`, `b9d566a`. `fase2/`.
- **Fase 3** (unir secciones, mudar el hero a la escena única): hecha, `61a7b1b` a `5f24d06`. Paridad del hero en escritorio; 2 contextos WebGL; fps sin medir (batería). `fase3/` y la bitácora.
- **Fase 4** (maxilar y fibras): se lanza a continuación con la batería al 3 %. Si esta línea no cambió, mirá `git log` y la bitácora para saber hasta dónde llegó.
- **Fase 5** (limpieza y documentación): sin empezar al momento de escribir esto. `components/hero-3d/`, `cabeza.glb` y el CSS muerto siguen en el repo.

**Cómo verlo:** `git switch cuerpo-unico`, `npm run dev`, http://localhost:3000. Para volver: `git switch rediseno`. Qué mirar primero: la toma hero contra la base (`comparacion.html`), la transición hero → craneoplastía (`fase3/recorrido/`, seg 0,1 a 0,35) y el hero en el celular (las fibras caen más arriba que en la base).

Pendientes acumulados: medir fps enchufado (toda la noche en batería; las mediciones de la fase 1 son las únicas comparadas alternando), comparar el recorrido antes y después de la fase 2 (cambió el orden de dibujo de las piezas transparentes), y la caída de 4,6 % del hero en escritorio con el canvas a pantalla completa (se resuelve con el canvas al tamaño de la caja del hero, pendiente de la fase 3).
