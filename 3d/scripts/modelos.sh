#!/bin/sh
# Implantes, prototipo de cabeza y optimización para la web. Parte de la piel
# y del esqueleto ya generados (piel.py y anatomia.py, que tardan más).
# Blender: la ruta se puede cambiar con la variable BLENDER.
set -e
cd "$(dirname "$0")/../.."
B=${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}
S=3d/salida
"$B" -b -P 3d/scripts/implantes.py -- $S/piel.glb $S/esqueleto.glb $S
"$B" -b -P 3d/scripts/cabeza.py -- $S/anatomia.glb $S/cabeza.glb
# Meshopt sin unir mallas: la escena asigna los materiales por nombre
mkdir -p public/modelos
for m in cabeza implantes; do
  npx -y @gltf-transform/cli@4 optimize $S/$m.glb public/modelos/$m.glb \
    --compress meshopt --join false --palette false --instance false --texture-compress false
done
