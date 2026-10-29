# Prototipo de cabeza: recorta el busto de la anatomía (salida de
# implantes.py) para validar el aspecto y el rendimiento en la web antes de
# armar el cuerpo entero.
# - Piel: se corta con un plano horizontal debajo de las clavículas, como un
#   busto de escultor, y el corte se tapa para que el vidrio sea un volumen
#   cerrado.
# - Huesos: cráneo, maxilar y mandíbula (con los dientes) enteros; de la
#   columna, solo las vértebras que quedan arriba del corte.
#
# Uso:
#   blender -b -P 3d/scripts/cabeza.py -- <anatomia.glb> <cabeza.glb>

import sys
from pathlib import Path

import bmesh
import bpy
import numpy as np

CORTE = 1.33  # altura del corte, en metros: debajo de las clavículas
HUESOS = ('hueso_craneo', 'hueso_maxilar', 'hueso_mandibula')

args = sys.argv[sys.argv.index('--') + 1:]
ruta_anatomia, ruta_salida = (Path(a).resolve() for a in args[:2])

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ruta_anatomia))
objetos = {o.name: o for o in bpy.context.scene.objects if o.type == 'MESH'}

# Piel: cortar y tapar
piel = objetos['piel']
bm = bmesh.new()
bm.from_mesh(piel.data)
geometria = bm.verts[:] + bm.edges[:] + bm.faces[:]
corte = bmesh.ops.bisect_plane(bm, geom=geometria, plane_co=(0, 0, CORTE),
                               plane_no=(0, 0, 1), clear_inner=True)
borde = [e for e in corte['geom_cut'] if isinstance(e, bmesh.types.BMEdge)]
tapa = bmesh.ops.triangle_fill(bm, use_beauty=True, use_dissolve=False, edges=borde)
for cara in tapa['geom']:
    if isinstance(cara, bmesh.types.BMFace):
        cara.smooth = False
bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
bm.to_mesh(piel.data)
bm.free()
print(f'[cabeza] piel: {len(piel.data.polygons)} caras')

# Columna: solo las piezas sueltas (vértebras y discos) arriba del corte
columna = objetos['hueso_columna']
bm = bmesh.new()
bm.from_mesh(columna.data)
bm.verts.ensure_lookup_table()
pendientes = set(bm.verts)
borrar = []
while pendientes:
    pieza, frente = set(), [pendientes.pop()]
    while frente:
        v = frente.pop()
        pieza.add(v)
        for e in v.link_edges:
            otro = e.other_vert(v)
            if otro in pendientes:
                pendientes.remove(otro)
                frente.append(otro)
    if np.mean([v.co.z for v in pieza]) < CORTE + 0.02:
        borrar.extend(pieza)
bmesh.ops.delete(bm, geom=borrar, context='VERTS')
bm.to_mesh(columna.data)
bm.free()
print(f'[cabeza] columna: {len(columna.data.polygons)} caras')

for nombre, obj in objetos.items():
    if nombre not in ('piel', 'hueso_columna', *HUESOS):
        bpy.data.objects.remove(obj)

ruta_salida.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(ruta_salida), export_format='GLB')
