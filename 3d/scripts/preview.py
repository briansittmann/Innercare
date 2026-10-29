# Renders de control de un modelo: frente, perfil, espalda y primer plano de
# la cabeza, en arcilla gris y con proyección ortográfica, para revisar la
# forma sin que distraigan materiales ni perspectiva.
#
# Con una piel como tercer argumento, la piel se compone translúcida encima
# del modelo, para revisar cómo encaja adentro (el esqueleto, por ejemplo).
#
# Uso:
#   blender -b -P 3d/scripts/preview.py -- <modelo.glb> <carpeta_salida> [<piel.glb>]

import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Vector

OPACIDAD_PIEL = 0.45

args = sys.argv[sys.argv.index('--') + 1:]
modelo = Path(args[0]).resolve()
salida = Path(args[1]).resolve()
ruta_piel = Path(args[2]).resolve() if len(args) > 2 else None
salida.mkdir(parents=True, exist_ok=True)

# Escena vacía
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(modelo))
mallas = [o for o in bpy.context.scene.objects if o.type == 'MESH']
piel = []
if ruta_piel:
    bpy.ops.import_scene.gltf(filepath=str(ruta_piel))
    piel = [o for o in bpy.context.scene.objects if o.type == 'MESH' and o not in mallas]
vertices = sum(len(o.data.vertices) for o in mallas)
caras = sum(len(o.data.polygons) for o in mallas)

# Caja que envuelve todas las mallas, en coordenadas del mundo
puntos = [o.matrix_world @ Vector(c) for o in mallas + piel for c in o.bound_box]
minimo = Vector((min(p.x for p in puntos), min(p.y for p in puntos), min(p.z for p in puntos)))
maximo = Vector((max(p.x for p in puntos), max(p.y for p in puntos), max(p.z for p in puntos)))
tamano = maximo - minimo
centro = (minimo + maximo) / 2

print(f'[preview] {modelo.name}: {len(mallas)} mallas, {vertices} vértices, {caras} caras')
print(f'[preview] tamaño (x, y, z): {tamano.x:.3f} {tamano.y:.3f} {tamano.z:.3f}')
for o in mallas:
    texturas = [n.image.name for m in o.data.materials if m and m.use_nodes
                for n in m.node_tree.nodes if n.type == 'TEX_IMAGE' and n.image]
    print(f'[preview]   {o.name}: {len(o.data.polygons)} caras, texturas: {texturas}')

escena = bpy.context.scene
escena.render.engine = 'BLENDER_WORKBENCH'
escena.display.shading.light = 'STUDIO'
escena.display.shading.color_type = 'SINGLE'
escena.display.shading.single_color = (0.8, 0.8, 0.8)
escena.display.shading.show_cavity = True
escena.render.resolution_x = 1024
escena.render.resolution_y = 1536
escena.render.film_transparent = False
escena.world = bpy.data.worlds.new('fondo')
escena.world.color = (1, 1, 1)

camara_datos = bpy.data.cameras.new('camara')
camara_datos.type = 'ORTHO'
camara = bpy.data.objects.new('camara', camara_datos)
escena.collection.objects.link(camara)
escena.camera = camara

# El eje vertical es el más largo de la caja (glTF entra con Z arriba en Blender)
alto = tamano.z
distancia = max(tamano) * 3


def pixeles(ruta):
    imagen = bpy.data.images.load(str(ruta))
    datos = np.empty(len(imagen.pixels), dtype=np.float32)
    imagen.pixels.foreach_get(datos)
    bpy.data.images.remove(imagen)
    return datos.reshape(-1, 4)


def ocultar(objetos, oculto):
    for o in objetos:
        o.hide_render = oculto


def render(nombre, direccion, objetivo, escala):
    camara.location = objetivo + direccion * distancia
    camara.rotation_euler = (objetivo - camara.location).to_track_quat('-Z', 'Y').to_euler()
    camara_datos.ortho_scale = escala
    ruta = salida / f'{modelo.stem}-{nombre}.png'
    escena.render.filepath = str(ruta)
    if not piel:
        bpy.ops.render.render(write_still=True)
        return
    # Dos pasadas: el modelo solo y la piel sola con fondo transparente. La
    # piel se mezcla encima según su alfa, como si fuera de vidrio.
    ocultar(piel, True)
    bpy.ops.render.render(write_still=True)
    fondo = pixeles(ruta)
    ocultar(piel, False)
    ocultar(mallas, True)
    escena.render.film_transparent = True
    bpy.ops.render.render(write_still=True)
    vidrio = pixeles(ruta)
    escena.render.film_transparent = False
    ocultar(mallas, False)
    alfa = vidrio[:, 3:] * OPACIDAD_PIEL
    mezcla = fondo * (1 - alfa) + np.concatenate([vidrio[:, :3], np.ones_like(alfa)], 1) * alfa
    mezcla[:, 3] = 1
    imagen = bpy.data.images.new('mezcla', escena.render.resolution_x, escena.render.resolution_y)
    imagen.pixels.foreach_set(mezcla.ravel())
    imagen.filepath_raw = str(ruta)
    imagen.file_format = 'PNG'
    imagen.save()
    bpy.data.images.remove(imagen)


# En glTF el frente mira a +Z, que en Blender queda como -Y
render('frente', Vector((0, -1, 0)), centro, alto * 1.05)
render('perfil', Vector((1, 0, 0)), centro, alto * 1.05)
render('espalda', Vector((0, 1, 0)), centro, alto * 1.05)

# Primer plano: el sexto superior de la altura
cabeza = Vector((centro.x, centro.y, maximo.z - alto * 0.075))
render('cara', Vector((0, -1, 0)), cabeza, alto * 0.2)
render('cara-perfil', Vector((1, 0, 0)), cabeza, alto * 0.2)
render('cara-3-4', Vector((0.7, -0.7, 0)).normalized(), cabeza, alto * 0.2)

# Torso, del cuello a la mitad de los muslos
torso = Vector((centro.x, centro.y, minimo.z + alto * 0.64))
render('torso', Vector((0, -1, 0)), torso, alto * 0.45)
render('torso-3-4', Vector((0.7, -0.7, 0)).normalized(), torso, alto * 0.45)
render('torso-espalda', Vector((0, 1, 0)), torso, alto * 0.45)
