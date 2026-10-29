# Implantes del cuerpo de vidrio, generados sobre el esqueleto ajustado
# (salida de anatomia.py), y recorte de los huesos que reemplazan. Son
# bocetos hechos desde las fotos de content/: cuando Innercare pase los 3D
# originales, reemplazan a estos respetando el nombre de malla.
#
# Por ahora, solo la craneoplastía (implante_craneoplastia): parche
# parieto-temporal derecho en titanio trabecular, de 2 mm, con malla
# triangular, borde macizo y pestañas con agujeros para tornillos.
# 1. Se arma plano, en un sistema (u, v, w) en metros: u hacia adelante, v
#    hacia arriba y w el espesor. Borde y pestañas salen de una curva polar;
#    la malla, de una red triangular con el modificador Wireframe, recortada
#    con un booleano.
# 2. Se dobla sobre el cráneo: (u, v) se lleva a una dirección desde el
#    centro del cráneo (mapa exponencial de una esfera) y el radio sale de
#    proyectar esa dirección sobre la superficie del hueso, suavizado.
# 3. El cráneo se recorta debajo del parche: el defecto es el contorno del
#    parche achicado, para que el borde apoye sobre el hueso.
#
# Exporta implantes.glb (los implantes) y anatomia.glb (la piel y el
# esqueleto con los recortes).
#
# Uso:
#   blender -b -P 3d/scripts/implantes.py -- <piel.glb> <esqueleto.glb> <carpeta_salida>

import math
import sys
from pathlib import Path

import bmesh
import bpy
import numpy as np
from mathutils.bvhtree import BVHTree

MM = 0.001

# Craneoplastía. La foto del caso (public/img/caso-craneoplastia-titanio.jpg)
# no trae escala: las medidas se estiman con el largo del cráneo (unos 190 mm
# en este esqueleto) y las proporciones de la foto. El parche cubre algo más
# de la mitad del largo del cráneo, es un poco más ancho que alto y se angosta
# abajo; el borde ocupa un 6 % del ancho y hay unas 13 celdas de lado a lado.
DIRECCION = (-1, 0.02, 0.36)  # centro del parche desde el centro del cráneo: derecha, algo atrás y arriba
SEMIEJE_U = 58 * MM  # medio largo, de adelante hacia atrás (medido sobre la superficie)
SEMIEJE_V = 47 * MM  # medio alto
EXPONENTE = 2.6  # superelipse: entre una elipse (2) y un rectángulo redondeado
ANGOSTA_ABAJO = 0.12  # cuánto se angosta la mitad inferior
ESPESOR = 2 * MM
BORDE = 7 * MM  # ancho del borde macizo
APOYO = 4 * MM  # parte del borde que apoya sobre el hueso (el resto cubre el defecto)
CELDA = 9 * MM  # lado de cada triángulo de la malla
BARRA = 1.6 * MM  # ancho de las barras de la malla
SEPARACION = 0.4 * MM  # entre el hueso y la cara interna del parche
TORNILLO = 2 * MM  # diámetro de los agujeros
# Pestañas: ángulo en el plano (u, v) desde adelante, en grados (90 es
# arriba), y cantidad de agujeros. Salen de la foto: dos arriba, una adelante
# y una atrás. Abajo no lleva: el borde inferior de la foto es liso, y una
# pestaña ahí quedaría detrás de la oreja.
PESTANAS = [(55, 3), (128, 2), (182, 2), (330, 2)]
PESTANA_ALTO = 9 * MM  # cuánto sobresale del contorno
PESTANA_PASO = 5.5 * MM  # entre agujeros

args = sys.argv[sys.argv.index('--') + 1:]
ruta_piel, ruta_esqueleto, salida = (Path(a).resolve() for a in args[:3])

bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=str(ruta_piel))
bpy.ops.import_scene.gltf(filepath=str(ruta_esqueleto))
objetos = {o.name: o for o in bpy.context.scene.objects if o.type == 'MESH'}
craneo = objetos['hueso_craneo']
piel = objetos['piel']


def vertices(obj):
    co = np.empty(len(obj.data.vertices) * 3)
    obj.data.vertices.foreach_get('co', co)
    return co.reshape(-1, 3)


def malla(nombre, co, caras):
    datos = bpy.data.meshes.new(nombre)
    datos.from_pydata(np.asarray(co).tolist(), [], [list(c) for c in caras])
    obj = bpy.data.objects.new(nombre, datos)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def normales_afuera(obj):
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    bm.to_mesh(obj.data)
    bm.free()


def aplicar_modificadores(obj):
    evaluado = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    nueva = bpy.data.meshes.new_from_object(evaluado)
    vieja = obj.data
    obj.modifiers.clear()
    obj.data = nueva
    bpy.data.meshes.remove(vieja)


def booleano(obj, otro, operacion):
    mod = obj.modifiers.new('booleano', 'BOOLEAN')
    mod.operation = operacion
    mod.solver = 'EXACT'
    mod.use_hole_tolerant = True
    mod.object = otro
    aplicar_modificadores(obj)
    bpy.data.objects.remove(otro)


def prisma(nombre, contorno, w0, w1):
    # Sólido de caras laterales verticales sobre un contorno (u, v) cerrado
    n = len(contorno)
    co = [(u, v, w0) for u, v in contorno] + [(u, v, w1) for u, v in contorno]
    caras = [list(range(n))[::-1], list(range(n, 2 * n))]
    caras += [(i, (i + 1) % n, n + (i + 1) % n, n + i) for i in range(n)]
    obj = malla(nombre, co, caras)
    normales_afuera(obj)
    return obj


# 1. El parche plano

angulos = np.linspace(0, 2 * math.pi, 720, endpoint=False)


def radio_base(theta):
    c, s = np.cos(theta), np.sin(theta)
    a = SEMIEJE_U * (1 - ANGOSTA_ABAJO * np.clip(-s, 0, 1))
    return (np.abs(c / a) ** EXPONENTE + np.abs(s / SEMIEJE_V) ** EXPONENTE) ** (-1 / EXPONENTE)


def radio_exterior(theta):
    # Contorno con las pestañas: cada una es un lóbulo redondeado
    r = radio_base(theta)
    for grados, agujeros in PESTANAS:
        ancho = (agujeros - 1) * PESTANA_PASO / 2 + 5.5 * MM
        delta = (theta - math.radians(grados) + math.pi) % (2 * math.pi) - math.pi
        s = delta * r / ancho
        r = r + PESTANA_ALTO * np.clip(1 - s ** 2, 0, None) ** 0.6
    return r


def polar(r, theta):
    return np.stack([r * np.cos(theta), r * np.sin(theta)], 1)


exterior = polar(radio_exterior(angulos), angulos)
interior = polar(radio_base(angulos) - BORDE, angulos)
defecto = polar(radio_base(angulos) - APOYO, angulos)

# Borde macizo: anillo entre el contorno exterior y el interior
n = len(angulos)
co = ([(u, v, 0) for u, v in exterior] + [(u, v, 0) for u, v in interior]
      + [(u, v, ESPESOR) for u, v in exterior] + [(u, v, ESPESOR) for u, v in interior])
caras = []
for i in range(n):
    j = (i + 1) % n
    caras += [(i, j, n + j, n + i),  # abajo
              (2 * n + i, 3 * n + i, 3 * n + j, 2 * n + j),  # arriba
              (i, 2 * n + i, 2 * n + j, j),  # pared exterior
              (n + i, n + j, 3 * n + j, 3 * n + i)]  # pared interior
borde = malla('implante_craneoplastia', co, caras)
normales_afuera(borde)

# Agujeros: en cada pestaña, en fila a lo largo del contorno
bm = bmesh.new()
for grados, agujeros in PESTANAS:
    theta = math.radians(grados)
    r = radio_base(theta) + PESTANA_ALTO * 0.45
    for k in range(agujeros):
        t = theta + (k - (agujeros - 1) / 2) * PESTANA_PASO / r
        cilindro = bmesh.ops.create_cone(bm, cap_ends=True, segments=20, radius1=TORNILLO / 2,
                                         radius2=TORNILLO / 2, depth=ESPESOR * 3)
        bmesh.ops.translate(bm, verts=cilindro['verts'],
                            vec=(r * math.cos(t), r * math.sin(t), ESPESOR / 2))
datos = bpy.data.meshes.new('agujeros')
bm.to_mesh(datos)
bm.free()
agujeros = bpy.data.objects.new('agujeros', datos)
bpy.context.scene.collection.objects.link(agujeros)
booleano(borde, agujeros, 'DIFFERENCE')

# Malla triangular: red de triángulos equiláteros, barras con Wireframe
paso_v = CELDA * math.sqrt(3) / 2
filas = int(SEMIEJE_V * 1.4 / paso_v)
columnas = int(SEMIEJE_U * 1.4 / CELDA)
puntos = {}
for j in range(-filas, filas + 1):
    for i in range(-columnas, columnas + 1):
        puntos[i, j] = (i * CELDA + (j % 2) * CELDA / 2, j * paso_v, ESPESOR / 2)
indice = {k: n for n, k in enumerate(puntos)}
triangulos = []
for j in range(-filas, filas):
    d = j % 2  # las filas impares están corridas media celda
    for i in range(-columnas, columnas):
        triangulos.append((indice[i, j], indice[i + 1, j], indice[i + d, j + 1]))
        if i + d + 1 <= columnas:
            triangulos.append((indice[i + 1, j], indice[i + d + 1, j + 1], indice[i + d, j + 1]))
red = malla('red', list(puntos.values()), triangulos)
mod = red.modifiers.new('barras', 'WIREFRAME')
mod.thickness = BARRA
mod.use_even_offset = True
mod.use_boundary = True
mod.offset = 0
aplicar_modificadores(red)
# El Wireframe da barras de sección cuadrada: se estiran hasta el espesor
co = vertices(red)
co[:, 2] = ESPESOR / 2 + (co[:, 2] - ESPESOR / 2) * ESPESOR / BARRA
red.data.vertices.foreach_set('co', co.ravel())
recorte = prisma('recorte', polar(radio_base(angulos) - BORDE + 1 * MM, angulos),
                 -ESPESOR, 2 * ESPESOR)
booleano(red, recorte, 'INTERSECT')

# Borde y malla en una sola pieza
bpy.ops.object.select_all(action='DESELECT')
for obj in (borde, red):
    obj.select_set(True)
bpy.context.view_layer.objects.active = borde
bpy.ops.object.join()
parche = borde

# 2. Doblar el parche sobre el cráneo

co_craneo = vertices(craneo)
# Centro: esfera ajustada por mínimos cuadrados a la bóveda (la mitad de arriba)
boveda = co_craneo[co_craneo[:, 2] > np.median(co_craneo[:, 2])]
a = np.c_[2 * boveda, np.ones(len(boveda))]
centro = np.linalg.lstsq(a, (boveda ** 2).sum(1), rcond=None)[0][:3]
bvh_craneo = BVHTree.FromObject(craneo, bpy.context.evaluated_depsgraph_get())

d = np.array(DIRECCION, float)
d /= np.linalg.norm(d)
e_v = np.array([0, 0, 1.0]) - d[2] * d
e_v /= np.linalg.norm(e_v)
e_u = np.cross(e_v, d)  # hacia adelante (-Y)


def proyectar(origen, direccion):
    hit = bvh_craneo.ray_cast(origen.tolist(), direccion.tolist())
    return None if hit[0] is None else np.array(hit[0])


radio_medio = np.linalg.norm(proyectar(centro + d * 0.3, -d) - centro)


def direcciones(uv):
    # Mapa exponencial de una esfera del radio del cráneo en ese punto
    largo = np.linalg.norm(uv, axis=1, keepdims=True)
    angulo = largo / radio_medio
    t = (uv[:, :1] * e_u + uv[:, 1:] * e_v) / np.maximum(largo, 1e-12)
    return np.cos(angulo) * d + np.sin(angulo) * t


# Radio del hueso en una grilla (u, v) cada 2 mm, suavizado para que el
# parche no copie los escalones del atlas ni las suturas
paso = 2 * MM
gu = np.arange(-SEMIEJE_U - 20 * MM, SEMIEJE_U + 20 * MM + paso, paso)
gv = np.arange(-SEMIEJE_V - 20 * MM, SEMIEJE_V + 20 * MM + paso, paso)
uv = np.stack(np.meshgrid(gu, gv, indexing='ij'), -1).reshape(-1, 2)
radios = np.full(len(uv), np.nan)
for k, direccion in enumerate(direcciones(uv)):
    punto = proyectar(centro + direccion * 0.3, -direccion)
    if punto is not None:
        radios[k] = np.linalg.norm(punto - centro)
radios = radios.reshape(len(gu), len(gv))
radios[np.isnan(radios)] = np.nanmedian(radios)
nucleo = np.exp(-0.5 * (np.arange(-6, 7) * paso / (4 * MM)) ** 2)
nucleo /= nucleo.sum()
for eje in (0, 1):
    radios = np.apply_along_axis(lambda f: np.convolve(np.pad(f, 6, mode='edge'), nucleo, 'valid'),
                                 eje, radios)


def radio_hueso(uv):
    # Interpolación bilineal en la grilla
    fu = np.clip((uv[:, 0] - gu[0]) / paso, 0, len(gu) - 1.001)
    fv = np.clip((uv[:, 1] - gv[0]) / paso, 0, len(gv) - 1.001)
    i, j = fu.astype(int), fv.astype(int)
    tu, tv = fu - i, fv - j
    return (radios[i, j] * (1 - tu) * (1 - tv) + radios[i + 1, j] * tu * (1 - tv)
            + radios[i, j + 1] * (1 - tu) * tv + radios[i + 1, j + 1] * tu * tv)


co = vertices(parche)
uv = co[:, :2]
co = centro + direcciones(uv) * (radio_hueso(uv) + SEPARACION + co[:, 2])[:, None]
parche.data.vertices.foreach_set('co', co.ravel())
parche.data.shade_smooth()
parche.data.set_sharp_from_angle(angle=math.radians(40))

# El parche tiene que quedar adentro de la piel (normales hacia afuera)
bvh_piel = BVHTree.FromObject(piel, bpy.context.evaluated_depsgraph_get())
holgura = float('inf')
for p in co:
    punto, normal, _, _ = bvh_piel.find_nearest(p.tolist())
    holgura = min(holgura, -np.dot(p - np.array(punto), np.array(normal)))
print(f'[implantes] craneoplastía: {len(parche.data.polygons)} caras, '
      f'a {holgura * 1000:.1f} mm de la piel como mínimo')

# 3. Defecto en el cráneo: se borran las caras con algún vértice dentro del
# contorno achicado. El borde del hueso queda dentado, pero debajo de la
# parte del borde que apoya. (Un booleano no sirve: el cráneo es la unión de
# los huesos del atlas, que se superponen y no forman una malla cerrada.)
co = vertices(craneo)
radial = co - centro
distancia = np.linalg.norm(radial, axis=1)
q = radial / distancia[:, None]
angulo = np.arccos(np.clip(q @ d, -1, 1))
t = q - (q @ d)[:, None] * d
u, v = t @ e_u, t @ e_v
largo = angulo * radio_medio
theta = np.arctan2(v, u)
# Solo la bóveda: lo que está lejos del centro y del lado del parche
dentro = (largo < radio_base(theta) - APOYO) & (distancia > radio_medio * 0.6) & (angulo < math.pi / 2)
bm = bmesh.new()
bm.from_mesh(craneo.data)
bm.verts.ensure_lookup_table()
borrar = [f for f in bm.faces if any(dentro[v.index] for v in f.verts)]
bmesh.ops.delete(bm, geom=borrar, context='FACES')
bm.to_mesh(craneo.data)
bm.free()
print(f'[implantes] cráneo: {len(borrar)} caras recortadas debajo del parche')

# Exportar
salida.mkdir(parents=True, exist_ok=True)


def exportar(objs, ruta):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
        o.data.name = o.name  # la malla toma el nombre del objeto, sin sufijos .001
    bpy.ops.export_scene.gltf(filepath=str(ruta), export_format='GLB', use_selection=True)


exportar([parche], salida / 'implantes.glb')
exportar([o for o in bpy.context.scene.objects if o.type == 'MESH' and o is not parche],
         salida / 'anatomia.glb')
