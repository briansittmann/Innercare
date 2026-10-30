#!/bin/sh
# Implantes, prototipo de cabeza, cuerpo entero y optimización para la web.
# Parte de la piel y del esqueleto ya generados (piel.py y anatomia.py, que
# tardan más).
# Blender: la ruta se puede cambiar con la variable BLENDER.
set -e
cd "$(dirname "$0")/../.."
B=${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}
S=3d/salida
"$B" -b -P 3d/scripts/implantes.py -- $S/piel.glb $S/esqueleto.glb $S
"$B" -b -P 3d/scripts/cabeza.py -- $S/anatomia.glb $S/cabeza.glb
# Meshopt sin unir mallas: la escena asigna los materiales por nombre.
# cabeza.glb e implantes.glb son el hero; cuerpo.glb (piel y esqueleto con
# los recortes de los seis implantes) e implantes-recorrido.glb (los otros
# cinco implantes), el recorrido de la home (components/recorrido-3d/).
mkdir -p public/modelos
optimize() {
  npx -y @gltf-transform/cli@4 optimize "$1" "$2" \
    --compress meshopt --join false --palette false --instance false --texture-compress false
}
for m in cabeza implantes cuerpo implantes-recorrido; do
  optimize $S/$m.glb public/modelos/$m.glb
done
