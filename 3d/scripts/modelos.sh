#!/bin/sh
# Implantes, prototipo de cabeza, cuerpo entero y optimización para la web.
# Parte de la piel y del esqueleto ya generados (piel.py y anatomia.py, que
# tardan más).
# Blender: la ruta se puede cambiar con la variable BLENDER.
set -e
cd "$(dirname "$0")/../.."
B=${BLENDER:-/Applications/Blender.app/Contents/MacOS/Blender}
S=3d/salida
G="npx -y @gltf-transform/cli@4"
"$B" -b -P 3d/scripts/implantes.py -- $S/piel.glb $S/esqueleto.glb $S
"$B" -b -P 3d/scripts/cabeza.py -- $S/anatomia.glb $S/cabeza.glb
# Meshopt sin unir mallas: la escena asigna los materiales por nombre.
# cabeza.glb e implantes.glb son el hero; implantes-recorrido.glb (los otros
# cinco implantes), el recorrido de la home (components/recorrido-3d/).
mkdir -p public/modelos
OPCIONES="--join false --palette false --instance false --texture-compress false"
for m in cabeza implantes implantes-recorrido; do
  $G optimize $S/$m.glb public/modelos/$m.glb --compress meshopt $OPCIONES
done
# El cuerpo (piel y esqueleto con los recortes de los seis implantes, más el
# maxilar entero) va partido en dos archivos (3d/scripts/partir.mjs):
# cuerpo-cabeza.glb (lo que se ve en el hero) y cuerpo-resto.glb, con la
# piel en tres trozos por altura y la columna en dos. Se optimiza sin
# comprimir y partir.mjs comprime y parte en la misma pasada; verificar
# compara el resultado, valor por valor, con el cuerpo comprimido entero.
$G optimize $S/cuerpo.glb $S/cuerpo-optimizado.glb --compress false $OPCIONES
$G optimize $S/cuerpo.glb $S/cuerpo-entero.glb --compress meshopt $OPCIONES
$G partir $S/cuerpo-optimizado.glb public/modelos/cuerpo-cabeza.glb \
  --resto public/modelos/cuerpo-resto.glb --config 3d/scripts/partir.mjs
$G verificar $S/cuerpo-entero.glb public/modelos/cuerpo-cabeza.glb public/modelos/cuerpo-resto.glb \
  --config 3d/scripts/partir.mjs
