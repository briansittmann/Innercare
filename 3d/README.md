# 3D del hero

Fuentes, licencias, versiones y comandos de los modelos del cuerpo translúcido. El plan completo está en `docs/ARQUITECTURA_MODELO_3D.md`.

## Herramientas

- Blender 5.2.3 LTS, sin interfaz (`Blender -b -P <script> -- <argumentos>`). Hoy en `/Applications/Blender.app/Contents/MacOS/Blender`.

## Fuentes

`fuentes/` no entra en git (los `.glb` y la carpeta del atlas están en `.gitignore`).

### Piel

- `fuentes/CuerpoCompleto.glb` y `fuentes/busto.glb`: generados con Tripo el 2026-10-29 a partir de imágenes de un maniquí hechas con ChatGPT (también en `fuentes/`, en PNG).

### Esqueleto: BodyParts3D 4.0

- Fuente: [BodyParts3D, LSDB Archive (DBCLS)](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/download.html). Descargado el 2026-10-29.
- Archivo: `partof_BP3D_4.0_obj_99.zip` (62 MB, reducción de polígonos del 99 %, la versión más liviana). Es un modelo de hombre adulto en milímetros, con cada hueso por separado.
- En `fuentes/bodyparts3d/` (52 MB) quedan solo los OBJ que usa `anatomia.py`: 239 huesos y la piel del atlas (`FJ2810`, que sirve de referencia para el ajuste). El zip y el resto de las estructuras (órganos, vasos, músculos) se borraron. Cada OBJ trae su nombre en inglés en la cabecera (`# English name`), y el script los clasifica por ese nombre.
- Los dientes (`FJ1254` a `FJ1281`) no están en el árbol PART-OF. Salen del zip del árbol IS-A (`isa_BP3D_4.0_obj_99.zip`, 143 MB), del que se leyeron solo esos 28 archivos (1,2 MB) con pedidos HTTP por rango.
- Para volver a armar la carpeta: descargar `partof_BP3D_4.0_obj_99.zip`, quedarse con los OBJ cuyo nombre sea un hueso, un cartílago costal, un disco intervertebral o la piel, y sumar los dientes.
- **Licencia: CC BY 4.0.** Confirmada en la [página oficial de la licencia](https://dbarchive.biosciencedbc.jp/en/bodyparts3d/lic.html), actualizada el 2025-02-27. Permite uso comercial, modificar y redistribuir, sin la cláusula "compartir igual" que tenían las versiones anteriores (CC BY-SA 2.1 Japón).
  - Atribución exigida, textual: "BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International".
  - Los comentarios dentro de los OBJ pueden citar todavía la licencia vieja: manda la página oficial.
- Se usa BodyParts3D directo y no Z-Anatomy. Z-Anatomy deriva del mismo atlas, pero se distribuye como CC BY-SA 4.0 y solo como un `.blend` o FBX completo, mucho más pesado.

## Scripts

| Script | Qué hace |
|---|---|
| `scripts/piel.py` | Une busto y cuerpo de Tripo, suaviza, borra pezones y vulva, escala a 1,70 m y exporta `salida/piel.glb`. |
| `scripts/anatomia.py` | Importa los huesos del atlas, los ajusta dentro de la piel, los simplifica, los agrupa por zona y exporta `salida/esqueleto.glb`. |
| `scripts/implantes.py` | Genera los implantes sobre el esqueleto (por ahora, la craneoplastía) y recorta los huesos que reemplazan. Exporta `salida/implantes.glb` y `salida/anatomia.glb` (piel y esqueleto recortado). |
| `scripts/cabeza.py` | Prototipo: recorta el busto de `anatomia.glb` (piel tapada debajo de las clavículas, cráneo, maxilar, mandíbula y cervicales) y exporta `salida/cabeza.glb`. |
| `scripts/modelos.sh` | `npm run modelos`: corre los dos anteriores y optimiza con `gltf-transform` (meshopt, con `npx`) a `public/modelos/`. |
| `scripts/preview.py` | Renders de control en PNG. Con una piel como tercer argumento, la compone translúcida encima del modelo. |

## Comandos

```sh
B=/Applications/Blender.app/Contents/MacOS/Blender
$B -b -P 3d/scripts/piel.py -- 3d/fuentes/CuerpoCompleto.glb 3d/fuentes/busto.glb 3d/salida/piel.glb
$B -b -P 3d/scripts/anatomia.py -- 3d/fuentes/bodyparts3d 3d/salida/piel.glb 3d/salida/esqueleto.glb
$B -b -P 3d/scripts/preview.py -- 3d/salida/esqueleto.glb 3d/salida/preview/esqueleto
$B -b -P 3d/scripts/preview.py -- 3d/salida/esqueleto.glb 3d/salida/preview/esqueleto-piel 3d/salida/piel.glb
npm run modelos   # implantes.py, cabeza.py y la optimización a public/modelos/
```

## Optimización

- `@gltf-transform/cli` 4.5 con `npx`, sin instalar: `optimize --compress meshopt --join false --palette false --instance false --texture-compress false`.
- `--join false` es obligatorio: la escena asigna los materiales por nombre de malla, y unirlas los borra.
