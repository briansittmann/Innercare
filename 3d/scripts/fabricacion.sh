#!/bin/sh
# Piezas finales de las animaciones de Fabricación: render en Blender de la
# endoprótesis y de la copa acetabular del recorrido (render-fabricacion.py)
# y paso a WebP (scripts/fabricacion-imagenes.mjs). Pide salida/
# implantes-recorrido.glb, que genera `npm run modelos`.
# Blender: la ruta se puede cambiar con la variable BLENDER.
set -e
cd "$(dirname "$0")/../.."
B=${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}
"$B" -b -P 3d/scripts/render-fabricacion.py -- 3d/salida/implantes-recorrido.glb 3d/salida/fabricacion "$@"
node scripts/fabricacion-imagenes.mjs
