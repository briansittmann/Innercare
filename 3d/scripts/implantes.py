# Implantes del cuerpo de vidrio, generados sobre el esqueleto ajustado
# (salida de anatomia.py), y recorte de los huesos que reemplazan. Son
# bocetos hechos desde las fotos de content/: cuando Innercare pase los 3D
# originales, reemplazan a estos respetando el nombre de malla.
#
# Los seis implantes del recorrido de la home, en su orden: craneoplastía,
# maxilar, hombro reverso, acetábulo, endoprótesis de fémur e intercalar de
# fémur (cada uno con su sección más abajo).
#
# Craneoplastía (implante_craneoplastia): parche parieto-temporal derecho en
# titanio trabecular, de 2 mm, con malla triangular, borde macizo y pestañas
# con agujeros para tornillos.
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
# Exporta:
# - implantes.glb: la craneoplastía sola, y anatomia.glb: la piel y el
#   esqueleto con el recorte del cráneo. Son el prototipo de cabeza del hero
#   (cabeza.py parte de anatomia.glb): no cambian con los otros implantes.
# - implantes-recorrido.glb: los otros cinco (implante_<parada>), y
#   cuerpo.glb: la piel y el esqueleto con todos los recortes. Son los del
#   recorrido de la home (components/recorrido-3d/implantes.ts).
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

# Exportar el prototipo de cabeza (el hero): la craneoplastía sola y la
# anatomía con el recorte del cráneo. cabeza.py parte de anatomia.glb, así
# que el busto del hero no cambia con los implantes del recorrido.
salida.mkdir(parents=True, exist_ok=True)


def exportar(objs, ruta):
    bpy.ops.object.select_all(action='DESELECT')
    for o in objs:
        o.select_set(True)
        o.data.name = o.name  # la malla toma el nombre del objeto, sin sufijos .001
    bpy.ops.export_scene.gltf(filepath=str(ruta), export_format='GLB', use_selection=True)


exportar([parche], salida / 'implantes.glb')
anatomia = [o for o in bpy.context.scene.objects if o.type == 'MESH' and o is not parche]
exportar(anatomia, salida / 'anatomia.glb')


# =============================================================================
# Implantes del recorrido de la home (components/recorrido-3d/implantes.ts):
# maxilar, hombro reverso, acetábulo, endoprótesis de fémur e intercalar de
# fémur, en ese orden. Cada uno se arma con partes (sólidos de revolución,
# placas caladas, celosías) a partir de las fotos y fichas de content/, y
# recorta los huesos que reemplaza. Salen en implantes-recorrido.glb y la
# anatomía con todos los recortes, en cuerpo.glb.
#
# Las medidas que no están en content/ (diámetros de cuerpos y cabezas,
# glenosfera, ángulos de los tornillos) son estimadas desde las fotos: es un
# boceto creíble, no un plano. Lo reemplaza el CAD de Innercare.
# =============================================================================


# --- Ayudas -------------------------------------------------------------------

def unitario(v):
    v = np.asarray(v, float)
    return v / np.linalg.norm(v)


def base_eje(eje, ref=(1, 0, 0)):
    # Matriz (por columnas x, y, z) con z a lo largo del eje y x lo más
    # parecida posible a `ref`
    z = unitario(eje)
    r = np.asarray(ref, float)
    if abs(unitario(r) @ z) > 0.95:
        r = np.array([0, 0, 1.0]) if abs(z[2]) < 0.9 else np.array([1.0, 0, 0])
    x = unitario(r - (r @ z) * z)
    return np.stack([x, np.cross(z, x), z], 1)


class Pieza:
    # Geometría acumulada en arreglos (vértices y caras): cada implante se
    # arma sumando partes y se convierte en una sola malla al final.
    def __init__(self):
        self.co = np.zeros((0, 3))
        self.caras = []

    def sumar(self, co, caras, origen=(0, 0, 0), eje=None, ref=(1, 0, 0)):
        co = np.asarray(co, float).reshape(-1, 3)
        if eje is not None:
            co = co @ base_eje(eje, ref).T
        co = co + np.asarray(origen, float)
        n = len(self.co)
        self.co = np.vstack([self.co, co])
        self.caras += [[i + n for i in c] for c in caras]
        return self

    def sumar_pieza(self, otra, **kw):
        return self.sumar(otra.co, otra.caras, **kw)

    def sumar_bm(self, bm):
        bm.verts.index_update()
        co = np.array([v.co[:] for v in bm.verts])
        return self.sumar(co, [[v.index for v in f.verts] for f in bm.faces])

    def bm(self):
        bm = bmesh.new()
        verts = [bm.verts.new(p) for p in self.co.tolist()]
        for c in self.caras:
            try:
                bm.faces.new([verts[i] for i in c])
            except ValueError:
                pass  # cara repetida
        return bm

    def objeto(self, nombre, angulo_vivo=35):
        obj = malla(nombre, self.co, self.caras)
        normales_afuera(obj)
        obj.data.shade_smooth()
        obj.data.set_sharp_from_angle(angle=math.radians(angulo_vivo))
        return obj


def revolver(perfil, lados=32, cerrado=False, modular=None):
    # Sólido de revolución alrededor de Z. `perfil`: puntos (r, z); r = 0
    # cierra en un vértice. Con `cerrado`, el último punto se une con el
    # primero (un anillo). `modular(theta, z)` multiplica el radio (estrías).
    th = np.linspace(0, 2 * math.pi, lados, endpoint=False)
    co, anillos = [], []
    for r, z in perfil:
        if r <= 0:
            anillos.append([len(co)])
            co.append((0, 0, z))
            continue
        rr = r * (modular(th, z) if modular else np.ones(lados))
        anillos.append(list(range(len(co), len(co) + lados)))
        co += list(zip(rr * np.cos(th), rr * np.sin(th), np.full(lados, z)))
    pares = list(zip(anillos, anillos[1:]))
    if cerrado:
        pares.append((anillos[-1], anillos[0]))
    caras = []
    for a, b in pares:
        if len(a) == 1 and len(b) == 1:
            continue
        if len(a) == 1:
            caras += [[a[0], b[(k + 1) % lados], b[k]] for k in range(lados)]
        elif len(b) == 1:
            caras += [[a[k], a[(k + 1) % lados], b[0]] for k in range(lados)]
        else:
            caras += [[a[k], a[(k + 1) % lados], b[(k + 1) % lados], b[k]] for k in range(lados)]
    if not cerrado:
        if len(anillos[0]) > 1:
            caras.append(anillos[0][::-1])
        if len(anillos[-1]) > 1:
            caras.append(anillos[-1])
    return np.array(co), caras


def arco(radio, desde, hasta, pasos, centro_z=0.0):
    # Puntos (r, z) de un arco de circunferencia en el plano del perfil;
    # el ángulo se mide desde el eje Z
    a = np.linspace(math.radians(desde), math.radians(hasta), pasos)
    return list(zip(radio * np.sin(a), centro_z + radio * np.cos(a)))


def cilindro(radio, largo, lados=24, z0=0.0):
    return revolver([(0, z0), (radio, z0), (radio, z0 + largo), (0, z0 + largo)], lados)


def tornillo(largo, diametro, paso=None, cabeza=None, lados=10):
    # Tornillo de punta en z = 0 y cabeza arriba, con la rosca como dientes
    # de sierra (anillos: a esta escala se lee igual que una hélice).
    # `cabeza`: (diámetro, alto), con forma de cúpula baja.
    r = diametro / 2
    nucleo = r * 0.7
    paso = paso or max(diametro * 0.55, 1.4 * MM)
    perfil = [(0, 0), (nucleo * 0.5, paso * 0.3)]
    z = paso * 0.6
    while z < largo - paso * 1.2:
        perfil += [(nucleo, z), (r, z + paso * 0.5)]
        z += paso
    perfil += [(nucleo, z), (nucleo, largo)]
    if cabeza:
        dc, hc = cabeza
        perfil += [(dc / 2, largo), (dc / 2, largo + hc * 0.45)]
        perfil += [(dc / 2 * math.sin(a), largo + hc * 0.45 + hc * 0.55 * math.cos(a))
                   for a in np.linspace(1.2, 0.0, 4)]
    else:
        perfil += [(0, largo)]
    return revolver(perfil, lados)


def placa(nodos, enlaces, radio, ancho, espesor, lados=14):
    # Placa calada en el plano (a, b), de espesor w de 0 a `espesor`: un
    # anillo por nodo (o un disco, si su agujero es 0) y barras entre nodos.
    # nodos: [((a, b), agujero)]; enlaces: [(i, j)]. Las partes se superponen
    # sin booleanos: el metal es opaco y no se nota.
    p = Pieza()
    for (a, b), agujero in nodos:
        if agujero > 0:
            perfil = [(agujero, 0), (radio, 0), (radio, espesor), (agujero, espesor)]
            co, caras = revolver(perfil, lados, cerrado=True)
        else:
            co, caras = cilindro(radio, espesor, lados)
        p.sumar(co, caras, origen=(a, b, 0))
    for i, j in enlaces:
        pa, pb = np.array(nodos[i][0]), np.array(nodos[j][0])
        largo = np.linalg.norm(pb - pa)
        t = (pb - pa) / largo
        n = np.array([-t[1], t[0]]) * ancho / 2
        tramos = max(1, int(largo / (1.5 * MM)))
        co, caras = [], []
        for k in range(tramos + 1):
            c = pa + t * largo * k / tramos
            for s in (-1, 1):
                for w in (0, espesor):
                    co.append((*(c + s * n), w))
        for k in range(tramos):
            a0, b0 = 4 * k, 4 * (k + 1)
            # vértices de cada sección: (-n, 0), (-n, e), (+n, 0), (+n, e)
            caras += [[a0 + 0, a0 + 2, b0 + 2, b0 + 0], [a0 + 1, b0 + 1, b0 + 3, a0 + 3],
                      [a0 + 0, b0 + 0, b0 + 1, a0 + 1], [a0 + 2, a0 + 3, b0 + 3, b0 + 2]]
        caras += [[0, 1, 3, 2], [4 * tramos + 0, 4 * tramos + 2, 4 * tramos + 3, 4 * tramos + 1]]
        p.sumar(co, caras)
    return p


def barrido(puntos, radio, lados=16, tapas=True):
    # Tubo a lo largo de una polilínea (marcos de transporte paralelo), con
    # radio fijo o uno por punto; las tapas son cúpulas bajas
    puntos = np.asarray(puntos, float)
    radios = np.broadcast_to(np.asarray(radio, float), (len(puntos),))
    tangentes = np.gradient(puntos, axis=0)
    tangentes /= np.linalg.norm(tangentes, axis=1, keepdims=True)
    x = base_eje(tangentes[0])[:, 0]
    th = np.linspace(0, 2 * math.pi, lados, endpoint=False)
    co, caras = [], []
    for k, (p, t, r) in enumerate(zip(puntos, tangentes, radios)):
        x = unitario(x - (x @ t) * t)
        y = np.cross(t, x)
        co += list(p + r * (np.cos(th)[:, None] * x + np.sin(th)[:, None] * y))
        if k:
            a, b = (k - 1) * lados, k * lados
            caras += [[a + i, a + (i + 1) % lados, b + (i + 1) % lados, b + i] for i in range(lados)]
    if tapas:
        for k, signo in ((0, -1), (len(puntos) - 1, 1)):
            centro = len(co)
            co.append(puntos[k] + signo * tangentes[k] * radios[k] * 0.5)
            anillo = k * lados
            caras += [[anillo + i, anillo + (i + 1) % lados, centro] for i in range(lados)]
    return np.array(co), caras


def perforar(bm, semillas, borde, permitido=lambda v: True):
    # Celosía: se eligen vértices cuyas estrellas (caras alrededor) no se
    # tocan, creciendo desde una semilla hacia los vértices que comparten dos
    # vecinos con uno ya elegido (en una red triangular, eso da la red de
    # hexágonos perfecta). Cada estrella se disuelve en un polígono, se le
    # hace un borde (inset) y se borra el centro.
    usadas, estrellas = set(), []

    def libre(v):
        return (permitido(v) and not v.is_boundary and len(v.link_faces) >= 5
                and not any(f in usadas for f in v.link_faces))

    def vecinos(v):
        return {e.other_vert(v) for e in v.link_edges}

    for semilla in semillas:
        cola = [semilla]
        while cola:
            v = cola.pop(0)
            if not libre(v):
                continue
            usadas.update(v.link_faces)
            estrellas.append(list(v.link_faces))
            cerca = vecinos(v)
            for w in cerca:
                for x in vecinos(w):
                    if x is not v and x not in cerca and len(vecinos(x) & cerca) == 2:
                        cola.append(x)
    poligonos = []
    for caras in estrellas:
        poligonos += bmesh.ops.dissolve_faces(bm, faces=caras)['region']
    bmesh.ops.inset_individual(bm, faces=poligonos, thickness=borde, use_even_offset=True)
    bmesh.ops.delete(bm, geom=poligonos, context='FACES')
    return len(poligonos)


def vertices_mundo(obj):
    co = vertices(obj)
    m = np.array(obj.matrix_world)
    return co @ m[:3, :3].T + m[:3, 3]


def componentes(obj):
    # Índices de vértices de cada pieza suelta de la malla
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    pendientes = set(range(len(bm.verts)))
    piezas = []
    while pendientes:
        frente = [pendientes.pop()]
        pieza = set(frente)
        while frente:
            v = bm.verts[frente.pop()]
            for e in v.link_edges:
                w = e.other_vert(v).index
                if w in pendientes:
                    pendientes.remove(w)
                    pieza.add(w)
                    frente.append(w)
        piezas.append(np.array(sorted(pieza)))
    bm.free()
    return piezas


def ajustar_esfera(p):
    a = np.c_[2 * p, np.ones(len(p))]
    s = np.linalg.lstsq(a, (p ** 2).sum(1), rcond=None)[0]
    return s[:3], math.sqrt(s[3] + s[:3] @ s[:3])


def seccion(obj, punto, normal):
    # Centro y radio medio del corte del hueso con un plano
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    res = bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:],
                                 plane_co=punto, plane_no=normal)
    p = np.array([v.co[:] for v in res['geom_cut'] if isinstance(v, bmesh.types.BMVert)])
    bm.free()
    if len(p) < 3:
        return None, None
    # Solo el contorno más cercano al punto (un plano puede cortar otras partes)
    p = p[np.linalg.norm(p - punto, axis=1) < 0.04]
    c = p.mean(0)
    return c, np.linalg.norm(p - c, axis=1).mean()


def borrar_caras(obj, dentro):
    # Borra las caras con algún vértice marcado y los vértices sueltos
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    borrar = [f for f in bm.faces if any(dentro[v.index] for v in f.verts)]
    bmesh.ops.delete(bm, geom=borrar, context='FACES')
    sueltos = [v for v in bm.verts if not v.link_faces]
    bmesh.ops.delete(bm, geom=sueltos, context='VERTS')
    bm.to_mesh(obj.data)
    bm.free()
    return len(borrar)


def tapar_corte(bm, bordes):
    tapa = bmesh.ops.triangle_fill(bm, use_beauty=True, use_dissolve=False, edges=bordes)
    for f in tapa['geom']:
        if isinstance(f, bmesh.types.BMFace):
            f.smooth = False
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)


def cortar(obj, punto, normal):
    # Borra la parte del hueso del lado de la normal y tapa el corte
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    caras = len(bm.faces)
    res = bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:],
                                 plane_co=punto, plane_no=normal, clear_outer=True)
    tapar_corte(bm, [e for e in res['geom_cut'] if isinstance(e, bmesh.types.BMEdge)])
    bm.to_mesh(obj.data)
    print(f'[implantes] {obj.name}: corte, {caras} -> {len(bm.faces)} caras')
    bm.free()


def cortar_tramo(obj, p0, p1):
    # Borra el tramo del hueso entre dos planos perpendiculares a p0 -> p1
    # y tapa los dos cortes
    eje = unitario(np.asarray(p1) - p0)
    largo = np.linalg.norm(np.asarray(p1) - p0)
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    for p in (p0, p1):
        bmesh.ops.bisect_plane(bm, geom=bm.verts[:] + bm.edges[:] + bm.faces[:],
                               plane_co=p, plane_no=eje)
    t = lambda co: (np.array(co) - p0) @ eje  # noqa: E731
    borrar = [f for f in bm.faces if 0 < t(f.calc_center_median()) < largo]
    bmesh.ops.delete(bm, geom=borrar, context='FACES')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    for extremo in (0, largo):
        bordes = [e for e in bm.edges if e.is_boundary
                  and all(abs(t(v.co) - extremo) < 1e-5 for v in e.verts)]
        tapar_corte(bm, bordes)
    bm.to_mesh(obj.data)
    print(f'[implantes] {obj.name}: tramo de {largo * 1000:.0f} mm, {len(borrar)} caras borradas')
    bm.free()


def suavizar(grilla, sigma, paso, ejes=(0, 1), periodico=()):
    radio = int(math.ceil(3 * sigma / paso))
    nucleo = np.exp(-0.5 * (np.arange(-radio, radio + 1) * paso / sigma) ** 2)
    nucleo /= nucleo.sum()
    for eje in ejes:
        modo = 'wrap' if eje in periodico else 'edge'
        grilla = np.apply_along_axis(
            lambda f: np.convolve(np.pad(f, radio, mode=modo), nucleo, 'valid'), eje, grilla)
    return grilla


class Envoltura:
    # Superficie de un hueso en coordenadas (a, b), para apoyar placas y
    # celosías: por cada (a, b), un rayo desde afuera (`origen`) hacia el
    # hueso (`direccion`, unitaria). La distancia hasta el hueso se muestrea
    # en una grilla y se suaviza (el atlas tiene escalones); `punto` devuelve
    # la superficie corrida `w` hacia afuera.
    def __init__(self, bvh, origen, direccion, a, b, paso=1 * MM, sigma=2.5 * MM,
                 periodo_a=None, alcance=0.3):
        self.origen, self.direccion, self.paso = origen, direccion, paso
        self.periodo_a = periodo_a
        self.ga = np.arange(a[0], a[1] + paso / 2, paso)
        self.gb = np.arange(b[0], b[1] + paso / 2, paso)
        ab = np.stack(np.meshgrid(self.ga, self.gb, indexing='ij'), -1).reshape(-1, 2)
        o, d = origen(ab), direccion(ab)
        t = np.full(len(ab), np.nan)
        for k in range(len(ab)):
            # `alcance`: más lejos no cuenta (un rayo que pasa por un hueco,
            # como la apertura nasal, toca hueso del fondo)
            hit = bvh.ray_cast(o[k].tolist(), d[k].tolist(), alcance)
            if hit[0] is not None:
                t[k] = hit[3]
        t = t.reshape(len(self.ga), len(self.gb))
        self.huecos = np.isnan(t).mean()
        # Huecos (el rayo no tocó hueso): el promedio de los vecinos
        for _ in range(200):
            faltan = np.isnan(t)
            if not faltan.any():
                break
            relleno = np.pad(t, 1, mode='edge')
            vecinos = np.stack([relleno[:-2, 1:-1], relleno[2:, 1:-1], relleno[1:-1, :-2], relleno[1:-1, 2:]])
            media = np.nanmean(np.where(np.isnan(vecinos), np.nan, vecinos), 0)
            t[faltan] = media[faltan]
        self.t = suavizar(t, sigma, paso, periodico=(0,) if periodo_a else ())

    def distancia(self, ab):
        fa = np.clip((ab[:, 0] - self.ga[0]) / self.paso, 0, len(self.ga) - 1.001)
        fb = np.clip((ab[:, 1] - self.gb[0]) / self.paso, 0, len(self.gb) - 1.001)
        i, j = fa.astype(int), fb.astype(int)
        ta, tb = fa - i, fb - j
        t = self.t
        return (t[i, j] * (1 - ta) * (1 - tb) + t[i + 1, j] * ta * (1 - tb)
                + t[i, j + 1] * (1 - ta) * tb + t[i + 1, j + 1] * ta * tb)

    def punto(self, ab, w=0.0):
        ab = np.asarray(ab, float).reshape(-1, 2)
        t = self.distancia(ab) - w
        return self.origen(ab) + self.direccion(ab) * t[:, None]


def envolver(pieza, envoltura, holgura=0.4 * MM):
    # Lleva una pieza armada en el plano (a, b, w) a la superficie del hueso
    co = pieza.co.copy()
    pieza.co = envoltura.punto(co[:, :2], co[:, 2] + holgura)
    return pieza


def bvh_de(obj):
    return BVHTree.FromObject(obj, bpy.context.evaluated_depsgraph_get())


def resumen(obj):
    tri = sum(len(p.vertices) - 2 for p in obj.data.polygons)
    print(f'[implantes] {obj.name}: {tri} triángulos')
    return obj


for o in objetos.values():
    assert np.allclose(np.array(o.matrix_world), np.eye(4)), f'{o.name} tiene transformación'

nuevos = []


# --- 2. Maxilar: reconstrucción para anclaje dentario --------------------------
# Estructura subperióstica de titanio impreso sobre la cara vestibular del
# maxilar derecho, con tres postes para los implantes dentarios donde faltan
# las piezas. Foto: public/img/caso-anclaje-dentario.jpg (placa de eslabones
# calados sobre el reborde alveolar, brazos que suben al pilar cigomático y
# al borde de la apertura nasal, una Y debajo de la nariz y tres postes cortos
# hacia abajo). Se borran los dientes del incisivo central al segundo
# premolar derechos y el reborde alveolar debajo de la placa.
#
# La placa se arma en el plano (a, b): a es el ángulo alrededor del arco
# dentario por un radio de referencia (positivo hacia la derecha de la
# figura) y b, la altura sobre la cadena inferior.
MAX_CENTRO = np.array([0.0, -0.050])  # centro del arco dentario en planta (x, y)
MAX_RADIO = 0.035  # a = ángulo × MAX_RADIO
MAX_Z0 = 1.5365  # altura de la cadena inferior, justo arriba del reborde
MAX_REBORDE = 1.534  # el reborde alveolar se reseca debajo de esta altura
MAX_ESLABON = 2.1 * MM  # radio de cada eslabón de la placa
MAX_AGUJERO = 0.8 * MM
MAX_BARRA = 1.4 * MM
MAX_ESPESOR = 1.4 * MM
MAX_POSTE = (3.6 * MM, 9 * MM)  # diámetro y largo de los postes


def maxilar():
    hueso = objetos['hueso_maxilar']
    co = vertices(hueso)
    bvh = bvh_de(hueso)  # el maxilar entero, antes del recorte
    cx, cy = MAX_CENTRO

    def angulo(p):
        # 0 adelante, positivo hacia la derecha de la figura (-X)
        return np.arctan2(-(p[..., 0] - cx), -(p[..., 1] - cy))

    def origen(ab):
        phi = ab[:, 0] / MAX_RADIO
        u = np.stack([-np.sin(phi), -np.cos(phi), np.zeros_like(phi)], 1)
        return np.c_[np.full(len(ab), cx), np.full(len(ab), cy), MAX_Z0 + ab[:, 1]] + u * 0.07

    def direccion(ab):
        phi = ab[:, 0] / MAX_RADIO
        return -np.stack([-np.sin(phi), -np.cos(phi), np.zeros_like(phi)], 1)

    env = Envoltura(bvh, origen, direccion, (-14 * MM, 50 * MM), (-4 * MM, 20 * MM),
                    paso=0.8 * MM, sigma=1.6 * MM, alcance=0.046)
    print(f'[implantes] maxilar: {env.huecos:.0%} de rayos sin hueso')

    # Dientes: las piezas sueltas de 38 a 60 vértices
    piezas = componentes(hueso)
    dientes = [p for p in piezas if 38 <= len(p) <= 60]
    centros = np.array([co[p].mean(0) for p in dientes])
    quitar = [i for i, c in enumerate(centros) if c[0] < 0 and c[1] < -0.066]
    phi_dientes = sorted(float(angulo(centros[i])) for i in quitar)
    phi0, phi1 = phi_dientes[0] - 0.12, phi_dientes[-1] + 0.09
    print(f'[implantes] maxilar: {len(dientes)} dientes, se quitan {len(quitar)}')

    # Placa: cadena inferior, puntal de la apertura nasal, Y central,
    # reticulado triangulado hasta el pilar cigomático
    nodos, enlaces = [], []

    def nodo(a, b, agujero=MAX_AGUJERO):
        nodos.append(((a * MM, b * MM), agujero))
        return len(nodos) - 1

    inferior = {a: nodo(a, 0) for a in range(-8, 43, 5)}
    claves = sorted(inferior)
    enlaces += [(inferior[a], inferior[b]) for a, b in zip(claves, claves[1:])]
    y_central = nodo(0, 5)
    enlaces += [(y_central, inferior[-3]), (y_central, inferior[2])]
    nasal = [nodo(11, 7), nodo(14, 14)]
    enlaces += [(inferior[7], nasal[0]), (nasal[0], nasal[1])]
    pilar = [nodo(41, 6.5), nodo(42.5, 12.5)]
    enlaces += [(inferior[42], pilar[0]), (pilar[0], pilar[1])]
    arriba = [nodo(19, 7), nodo(28, 7), nodo(36, 6.5)]
    enlaces += [(nasal[0], arriba[0]), (arriba[0], arriba[1]), (arriba[1], arriba[2]),
                (arriba[2], pilar[0])]
    enlaces += [(arriba[0], inferior[17]), (arriba[0], inferior[22]), (arriba[1], inferior[27]),
                (arriba[1], inferior[32]), (arriba[2], inferior[37])]
    estructura = envolver(placa(nodos, enlaces, MAX_ESLABON, MAX_BARRA, MAX_ESPESOR), env)

    # Postes: en el lugar del incisivo central, el canino y el segundo
    # premolar, con un puente desde la placa hasta cada uno
    elegidos = sorted(quitar, key=lambda i: angulo(centros[i]))
    elegidos = [elegidos[0], elegidos[2], elegidos[-1]]
    d, largo = MAX_POSTE
    perfil = [(0, 0), (d * 0.32, 0.15 * MM), (d * 0.45, 0.6 * MM), (d / 2, 1.2 * MM),
              (d / 2, largo - 1.6 * MM), (d * 0.62, largo - 1.2 * MM), (d * 0.62, largo),
              (0, largo)]
    co_poste, caras_poste = revolver(perfil, 18)
    for i in elegidos:
        c = centros[i]
        tope = np.array([c[0], c[1], MAX_REBORDE + 0.4 * MM])
        estructura.sumar(co_poste, caras_poste, origen=tope - np.array([0, 0, largo]),
                         eje=(0, 0, 1))
        # Puente: de la cadena (sobre la cara vestibular) al tope del poste
        a = float(angulo(c)) * MAX_RADIO
        pie = env.punto([[a, -0.6 * MM]], MAX_ESPESOR / 2 + 0.4 * MM)[0]
        eje = pie - tope
        co_p, caras_p = cilindro(1.1 * MM, np.linalg.norm(eje), 10)
        co_p[:, 0] *= 1.6  # plano: más ancho que alto
        estructura.sumar(co_p, caras_p, origen=tope, eje=eje, ref=(0, 0, 1))

    obj = resumen(estructura.objeto('implante_maxilar'))

    # Recorte: los dientes y el reborde alveolar entre esos ángulos
    phi = angulo(co)
    dentro = np.zeros(len(co), bool)
    for i in quitar:
        dentro[dientes[i]] = True
    for p in piezas:  # astillas sueltas del atlas en la misma zona
        if len(p) < 38:
            c = co[p].mean(0)
            if phi0 < angulo(c) < phi1 and c[2] < 1.548:
                dentro[p] = True
    dentro |= (phi > phi0) & (phi < phi1) & (co[:, 2] < MAX_REBORDE) & (co[:, 1] < cy)
    print(f'[implantes] maxilar: {borrar_caras(hueso, dentro)} caras recortadas')
    return obj


nuevos.append(maxilar())


# --- 3. Hombro: prótesis modular reversa (catálogo) ----------------------------
# Lo que muestran la foto del producto (public/img/hombro-implante.jpg) y la
# planificación (hombro-planificacion-implante.jpg), pulido de CNC:
# - Lado de la escápula: glenosfera semiesférica sobre una base de respaldo
#   poroso, con un perno corto y un tornillo central largo.
# - Lado del húmero: copa con el inserto (un escalón más angosto) inclinada
#   sobre el cuerpo; el cuerpo, con el tornillo de fijación (hexágono) y la
#   unión con el suplemento, reemplaza el húmero proximal; vástago estriado
#   en el canal.
# Sin medidas en la ficha: todo estimado desde la foto con la cabeza humeral
# del atlas (Ø 40 mm). Se borra el húmero por encima del cuerpo y la cara de
# la glenoides debajo de la base.
HOM_GLENOSFERA = 18 * MM  # radio
HOM_COPA = (20.5 * MM, 20.5 * MM)  # radio exterior y alto desde el centro de la glenosfera
HOM_ANGULO = 135  # cuello-diáfisis, en grados
HOM_CUERPO = (9.5 * MM, 44 * MM)  # radio y largo del cuerpo con el suplemento, bajo el cuello
HOM_VASTAGO = 110 * MM


def hombro():
    humero = objetos['hueso_humero_der']
    escapula = objetos['hueso_escapula_der']
    co_h = vertices(humero)
    cabeza, _ = ajustar_esfera(co_h[co_h[:, 2] > 1.335])
    co_e = vertices(escapula)
    glenoide = co_e[np.argsort(np.linalg.norm(co_e - cabeza, axis=1))[:40]].mean(0)
    n_g = unitario(cabeza - glenoide)  # hacia afuera de la glenoides

    # Eje de la diáfisis: centros de cortes horizontales
    centros = []
    for z in np.arange(1.15, 1.30, 0.02):
        guia = np.array([-0.186, 0.026, 1.13]) + (z - 1.13) / 0.2 * np.array([0.03, -0.012, 0.2])
        c, _ = seccion(humero, guia, (0, 0, 1))
        if c is not None:
            centros.append(c)
    centros = np.array(centros)
    p_eje = centros.mean(0)
    d_s = unitario(np.linalg.svd(centros - p_eje)[2][0])
    if d_s[2] > 0:
        d_s = -d_s  # hacia el codo

    C = glenoide + n_g * 3 * MM  # centro de la glenosfera
    # T: punto del eje del húmero donde apunta la copa, con el ángulo
    # cuello-diáfisis del implante
    q = p_eje + d_s * (d_s @ (C - p_eje))
    desvio = np.linalg.norm(C - q)
    T = q + d_s * desvio / math.tan(math.radians(180 - HOM_ANGULO))
    a_c = unitario(T - C)
    print(f'[implantes] hombro: ángulo cuello-diáfisis {math.degrees(math.acos(a_c @ -d_s)):.0f}°, '
          f'glenosfera a {np.linalg.norm(C - cabeza) * 1000:.0f} mm de la cabeza humeral, '
          f'copa a {np.linalg.norm(T - C) * 1000:.0f} mm del eje')

    pieza = Pieza()
    rugoso = lambda th, z: 1 + 0.06 * np.sign(np.sin(10 * th))  # noqa: E731  respaldo poroso
    # Glenosfera, base, perno y tornillo (eje n_g, origen en C)
    R = HOM_GLENOSFERA
    pieza.sumar(*revolver(arco(R, 0, 90, 16) + [(R * 0.97, -1.5 * MM), (0, -1.5 * MM)], 48),
                origen=C, eje=n_g)
    pieza.sumar(*revolver([(0, -4.5 * MM), (13.5 * MM, -4.5 * MM), (13.5 * MM, -1.5 * MM),
                           (0, -1.5 * MM)], 40, modular=rugoso), origen=C, eje=n_g)
    pieza.sumar(*revolver([(0, -12 * MM), (4.5 * MM, -11.5 * MM), (4.5 * MM, -4.5 * MM),
                           (0, -4.5 * MM)], 20, modular=rugoso), origen=C, eje=n_g)
    pieza.sumar(*tornillo(16 * MM, 4.5 * MM), origen=C - n_g * 28 * MM, eje=n_g)

    # Copa con el inserto (eje a_c, origen en C)
    rc, hc = HOM_COPA
    interior = 18.5 * MM
    alfa = math.degrees(math.acos(8 * MM / interior))
    perfil = arco(interior, 0, alfa, 12)
    perfil += [(18.5 * MM, 8 * MM), (18.5 * MM, 12 * MM), (rc, 12 * MM), (rc, hc), (0, hc)]
    pieza.sumar(*revolver(perfil, 56), origen=C, eje=a_c)

    # Cuerpo y suplemento sobre el eje del húmero (origen abajo, hasta T),
    # con la unión entre los dos y el tornillo de fijación (hexágono); de T
    # sale el cuello inclinado que lleva la copa, como en la foto
    rb, lb = HOM_CUERPO
    abajo = T + d_s * lb
    junta = lb - 24 * MM
    perfil = [(0, -6 * MM), (5.8 * MM, -6 * MM), (rb, 0), (rb, junta - 0.7 * MM),
              (rb - 0.7 * MM, junta), (rb, junta + 0.7 * MM)]
    perfil += [(rb * math.cos(t), lb + rb * math.sin(t)) for t in np.linspace(0, math.pi / 2, 8)]
    cuerpo = Pieza().sumar(*revolver(perfil, 40), origen=abajo, eje=-d_s)
    cuerpo.sumar(*cilindro(rb, np.linalg.norm(T - C) - hc + 1 * MM, 40),
                 origen=C + a_c * (hc - 1 * MM), eje=a_c)
    cuerpo_obj = cuerpo.objeto('cuerpo')
    adelante = unitario(np.array([0, -1.0, 0]) - (d_s @ np.array([0, -1.0, 0])) * d_s)
    hex_co, hex_caras = cilindro(1.7 * MM, 4 * MM, 6, z0=-2 * MM)
    hexagono = Pieza().sumar(hex_co, hex_caras, origen=T + d_s * 12 * MM + adelante * rb,
                             eje=adelante).objeto('hexagono')
    booleano(cuerpo_obj, hexagono, 'DIFFERENCE')
    pieza.sumar(vertices(cuerpo_obj), [list(p.vertices) for p in cuerpo_obj.data.polygons])
    bpy.data.objects.remove(cuerpo_obj)

    # Vástago estriado (eje hacia el codo, origen debajo del cuerpo)
    L = HOM_VASTAGO

    def estrias(th, z):
        f = np.ones_like(th)
        if 14 * MM < z < L - 10 * MM:
            f -= 0.14 * np.clip(np.cos(8 * th), 0, 1) ** 6
        return f

    perfil = [(0, -1 * MM), (6.4 * MM, -1 * MM), (5.8 * MM, 8 * MM), (5.6 * MM, 14 * MM),
              (5.2 * MM, 40 * MM), (4.2 * MM, L - 10 * MM), (3.4 * MM, L - 3 * MM),
              (1.8 * MM, L - 0.5 * MM), (0, L)]
    pieza.sumar(*revolver(perfil, 48, modular=estrias), origen=abajo, eje=d_s)

    obj = resumen(pieza.objeto('implante_hombro'))

    # Recortes: el húmero por encima del cuerpo y la glenoides bajo la base
    cortar(humero, abajo + d_s * 1 * MM, -d_s)
    rel = co_e - C
    a = rel @ n_g
    radial = np.linalg.norm(rel - a[:, None] * n_g, axis=1)
    dentro = (a > -6 * MM) & (a < 30 * MM) & (radial < 15 * MM)
    print(f'[implantes] glenoides: {borrar_caras(escapula, dentro)} caras recortadas')
    return obj


nuevos.append(hombro())


# --- 4. Acetábulo: reconstrucción en titanio trabecular (a medida) -------------
# Del diseño del caso (public/img/caso-acetabular-tornillos.jpg) y del
# implante poroso (caso-porosa-implante.jpg): copa con la cara interna maciza,
# la externa trabecular (celosía), un borde macizo, un ala superior con dos
# agujeros sobre el ilíaco y tornillos de 25 a 55 mm que salen en abanico
# hacia el ilíaco, el isquion y el pubis. Va en la cadera derecha, alrededor
# de la cabeza femoral (que se conserva: el intercalar entra por arriba del
# mismo fémur). Se borra el acetábulo debajo de la copa.
ACE_INTERIOR = 25 * MM  # la cabeza femoral del atlas tiene 23 mm de radio
ACE_CASCARA = 26.5 * MM  # cara interna maciza
ACE_POROSO = 29 * MM  # capa trabecular
ACE_ABERTURA = (-0.62, -0.25, -0.70)  # afuera, adelante y abajo: unos 45° de inclinación
ACE_TORNILLO = 5.5 * MM
# Tornillos: ángulo desde el polo de la copa y azimut desde arriba (0°,
# hacia el ilíaco; 90°, hacia atrás), en grados, y largo en mm (los de la
# imagen del caso)
ACE_TORNILLOS = [(18, 0, 50), (42, 25, 40), (40, -40, 55), (58, 70, 35), (55, -85, 40),
                 (62, 145, 30), (60, -150, 35), (48, 180, 25)]


def acetabulo():
    coxal = objetos['hueso_coxal_der']
    femur = objetos['hueso_femur_der']
    co_f = vertices(femur)
    alto = co_f[co_f[:, 2] > 0.86]
    c, radio_cabeza = ajustar_esfera(alto[alto[:, 0] > np.percentile(alto[:, 0], 60)])
    a = unitario(ACE_ABERTURA)
    polo = -a
    base = base_eje(polo, ref=(0, 0, 1))  # x local: hacia arriba
    print(f'[implantes] acetábulo: cabeza femoral de {radio_cabeza * 1000:.1f} mm de radio')

    pieza = Pieza()
    # Cara interna maciza
    perfil = arco(ACE_CASCARA, 0, 90, 18) + arco(ACE_INTERIOR, 90, 0, 18)
    pieza.sumar(*revolver(perfil, 56), origen=c, eje=polo, ref=(0, 0, 1))
    # Capa trabecular: media icoesfera calada, con espesor hacia adentro
    bm = bmesh.new()
    bmesh.ops.create_icosphere(bm, subdivisions=4, radius=ACE_POROSO)
    bmesh.ops.delete(bm, geom=[f for f in bm.faces if min(v.co.z for v in f.verts) < -0.2 * MM],
                     context='FACES')
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if not v.link_faces], context='VERTS')
    centros = sorted(bm.verts, key=lambda v: -v.co.z)
    huecos = perforar(bm, centros, 0.5 * MM)
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=ACE_POROSO - ACE_CASCARA + 0.3 * MM)
    trabecular = Pieza().sumar_bm(bm)
    bm.free()
    pieza.sumar_pieza(trabecular, origen=c, eje=polo, ref=(0, 0, 1))
    print(f'[implantes] acetábulo: {huecos} poros')
    # Borde macizo
    r_sup = math.sqrt(ACE_INTERIOR ** 2 - (3.5 * MM) ** 2)
    pieza.sumar(*revolver([(ACE_INTERIOR, -0.8 * MM), (ACE_POROSO + 0.4 * MM, -0.8 * MM),
                           (ACE_POROSO + 0.4 * MM, 3.5 * MM), (r_sup, 3.5 * MM)], 56, cerrado=True),
                origen=c, eje=polo, ref=(0, 0, 1))
    # Tornillos en abanico, con la cabeza hundida en la cara interna
    for alfa, beta, largo in ACE_TORNILLOS:
        al, be = math.radians(alfa), math.radians(beta)
        d = base @ np.array([math.sin(al) * math.cos(be), math.sin(al) * math.sin(be), math.cos(al)])
        cabeza = (ACE_TORNILLO * 1.5, 2 * MM)
        pieza.sumar(*tornillo(largo * MM, ACE_TORNILLO, cabeza=cabeza),
                    origen=c + d * (ACE_INTERIOR + 0.3 * MM + largo * MM + cabeza[1]), eje=-d)

    # Ala superior: una lengüeta plana en el plano del borde, hacia el
    # ilíaco, con dos agujeros que miran a la abertura (como en la imagen
    # del caso) y sus tornillos hacia arriba y adentro
    arriba = unitario(np.array([0, 0, 1.0]) - a[2] * a)
    lado = unitario(np.cross(a, arriba))
    borde = c + arriba * (ACE_POROSO - 1 * MM) - a * 1.5 * MM
    agujeros = [(-6.5, 11), (6.5, 11)]
    nodos = [((-8 * MM, -3 * MM), 0), ((0, -4 * MM), 0), ((8 * MM, -3 * MM), 0)]
    nodos += [((x * MM, y * MM), 2.9 * MM) for x, y in agujeros]
    ala = placa(nodos, [(0, 1), (1, 2), (0, 3), (1, 3), (1, 4), (2, 4), (3, 4)],
                5 * MM, 7 * MM, 3 * MM, lados=24)
    marco = np.stack([lado, arriba, a], 1)
    pieza.sumar(ala.co @ marco.T + borde, ala.caras)
    for x, y in agujeros:
        sup = borde + marco @ np.array([x * MM, y * MM, 3 * MM])
        d = unitario(-a + arriba * 0.8)
        largo = 40 * MM
        pieza.sumar(*tornillo(largo, ACE_TORNILLO, cabeza=(ACE_TORNILLO * 1.6, 2.2 * MM)),
                    origen=sup + d * (largo - 0.5 * MM), eje=-d)

    obj = resumen(pieza.objeto('implante_acetabulo'))

    # Recorte: el acetábulo debajo de la copa
    co = vertices(coxal)
    rel = co - c
    dentro = (np.linalg.norm(rel, axis=1) < ACE_POROSO + 0.5 * MM) & (rel @ polo > -2 * MM)
    print(f'[implantes] acetábulo: {borrar_caras(coxal, dentro)} caras recortadas')
    return obj


nuevos.append(acetabulo())


# --- 5. Fémur proximal: endoprótesis modular (catálogo) ------------------------
# Las piezas de la ficha (public/endoprotesis-modular-femur-innercare.pdf),
# pulidas de CNC, en el fémur izquierdo: cabeza sobre el cono morse 12-14,
# cuerpo principal de 60 mm a 135° con alas para sutura y el tornillo de
# cierre arriba, un suplemento de 60 mm y el vástago cementado de Ø11 ×
# 140 mm, estriado como en la foto de los componentes (femur-componentes.jpg).
# Largos, ángulo y vástago son de la ficha; diámetros del cuerpo y del
# cuello, y la cabeza (que llena el acetábulo del atlas), estimados. Se borra
# el fémur por encima del suplemento (el plano de resección).
END_CABEZA = 21 * MM  # radio
END_CUERPO = (11 * MM, 60 * MM)  # radio y largo
END_SUPLEMENTO = 60 * MM
END_VASTAGO = (5.5 * MM, 140 * MM)  # radio y largo
END_CUELLO = 7 * MM  # radio del brazo del cuello
END_ARRIBA = 12 * MM  # cuánto sube el cuerpo por encima del eje del cuello


def endoprotesis():
    femur = objetos['hueso_femur_izq']
    co = vertices(femur)
    alto = co[co[:, 2] > 0.86]
    F, _ = ajustar_esfera(alto[alto[:, 0] < np.percentile(alto[:, 0], 40)])
    # Eje de la diáfisis: centros de cortes horizontales
    centros = []
    for z in np.arange(0.58, 0.80, 0.02):
        c, _ = seccion(femur, np.array([0.095 + (z - 0.58) / 0.22 * 0.02, 0.0, z]), (0, 0, 1))
        if c is not None:
            centros.append(c)
    centros = np.array(centros)
    p_eje = centros.mean(0)
    u = unitario(np.linalg.svd(centros - p_eje)[2][0])
    if u[2] < 0:
        u = -u  # hacia arriba
    rel = F - p_eje
    largo_eje = rel @ u
    perp = rel - largo_eje * u
    offset = np.linalg.norm(perp)
    m = perp / offset  # hacia la cabeza (medial)
    J = p_eje + u * (largo_eje - offset)  # el cuello sale a 135° de la diáfisis
    n = unitario(m + u)
    k = np.cross(u, m)
    largo_cuello = np.linalg.norm(F - J)
    print(f'[implantes] endoprótesis: offset {offset * 1000:.0f} mm, cuello de {largo_cuello * 1000:.0f} mm')

    pieza = Pieza()
    # Cabeza truncada abajo, donde entra el cono
    rh = END_CABEZA
    base_cabeza = -0.62 * rh
    alfa = math.degrees(math.acos(base_cabeza / rh))
    pieza.sumar(*revolver([(0, base_cabeza)] + arco(rh, alfa, 0, 22), 48), origen=F, eje=n)
    # Brazo del cuello y cono morse (entra en la cabeza)
    cono = largo_cuello + base_cabeza - 7 * MM
    rn = END_CUELLO
    pieza.sumar(*revolver([(0, 0), (rn, 0), (rn, cono - 2 * MM), (7 * MM, cono),
                           (6 * MM, cono + 14 * MM), (0, cono + 14 * MM)], 32), origen=J, eje=n)
    # Cuerpo principal, con el tornillo de cierre arriba
    rb, lb = END_CUERPO
    ch = 0.8 * MM
    abajo_cuerpo = END_ARRIBA - lb
    pieza.sumar(*revolver([(0, abajo_cuerpo), (rb - ch, abajo_cuerpo), (rb, abajo_cuerpo + ch),
                           (rb, END_ARRIBA - ch), (rb - ch, END_ARRIBA), (4.5 * MM, END_ARRIBA),
                           (4.5 * MM, END_ARRIBA + 1.6 * MM), (3.6 * MM, END_ARRIBA + 2.2 * MM),
                           (0, END_ARRIBA + 2.2 * MM)], 48),
                origen=J, eje=u, ref=m)
    # Alas para sutura: arriba del lado de afuera y abajo del lado de adentro
    espesor = 4 * MM

    def ala(lado, alturas):
        nodos = [((z * MM, rb + 3.4 * MM), 1.5 * MM) for z in alturas]
        nodos += [((z * MM, rb - 2 * MM), 0) for z in alturas]
        n_al = len(alturas)
        enlaces = [(i, i + 1) for i in range(n_al - 1)] + [(i, i + n_al) for i in range(n_al)]
        p = placa(nodos, enlaces, 3.3 * MM, 6.6 * MM, espesor, lados=16)
        a_, b_, w_ = p.co[:, 0:1], p.co[:, 1:2], p.co[:, 2:3]
        pieza.sumar(J + a_ * u + b_ * lado + (w_ - espesor / 2) * k, p.caras)

    ala(-m, [7, -0.5, -8, -15.5])
    ala(m, [-22, -29.5, -37, -44.5])
    # Suplemento, con chaflanes que marcan la unión con el cuerpo
    s0 = abajo_cuerpo - END_SUPLEMENTO
    pieza.sumar(*revolver([(0, s0), (rb - ch, s0), (rb, s0 + ch), (rb, abajo_cuerpo - ch),
                           (rb - ch, abajo_cuerpo), (0, abajo_cuerpo)], 48), origen=J, eje=u, ref=m)
    # Vástago cementado estriado (eje hacia abajo)
    rv, lv = END_VASTAGO

    def estrias(th, z):
        f = np.ones_like(th)
        if 18 * MM < z < lv - 12 * MM:
            f -= 0.1 * np.clip(np.cos(10 * th), 0, 1) ** 6
        return f

    perfil = [(0, -1 * MM), (8.2 * MM, -1 * MM), (8 * MM, 4 * MM), (rv + 0.4 * MM, 16 * MM),
              (rv, 22 * MM), (rv * 0.86, lv - 10 * MM), (rv * 0.7, lv - 3 * MM),
              (rv * 0.35, lv - 0.6 * MM), (0, lv)]
    abajo = J + u * s0
    pieza.sumar(*revolver(perfil, 50, modular=estrias), origen=abajo, eje=-u, ref=m)

    obj = resumen(pieza.objeto('implante_femur'))
    # Resección: el fémur por encima del suplemento
    cortar(femur, abajo - u * 1 * MM, u)
    return obj


nuevos.append(endoprotesis())


# --- 6. Diáfisis femoral: implante intercalar (a medida) -----------------------
# El caso destacado (content/customCases.ts, featuredCase; fotos
# caso-intercalar-implante.jpg y caso-intercalar-guias.jpg): segmento de
# titanio impreso con la forma del hueso que reemplaza, la pared calada con
# poros hexagonales, bandas macizas en los extremos y alojamientos oblicuos
# arriba y abajo para tornillos de Ø3,5 mm; adentro, el clavo endomedular
# anterógrado de Ø10 × 360 mm, que entra por el trocánter. En el fémur
# derecho; se borra el tramo de diáfisis que ocupa el segmento.
INT_TRAMO = (0.600, 0.730)  # alturas del segmento (largo estimado: 130 mm)
INT_CELDA = 3.8 * MM
INT_BORDE = 0.9 * MM
INT_ESPESOR = 2 * MM
INT_CLAVO = (5 * MM, 360 * MM)  # radio y largo
INT_TORNILLO = 3.5 * MM
INT_ENTRADA = 0.893  # altura de la entrada del clavo, en la fosa del trocánter


def intercalar():
    femur = objetos['hueso_femur_der']
    bvh = bvh_de(femur)  # entero, antes del recorte
    # Canal: centros de cortes horizontales, ajustados con una parábola
    centros = []
    for z in np.arange(0.54, 0.83, 0.02):
        c, _ = seccion(femur, np.array([-(0.095 + (z - 0.58) / 0.22 * 0.02), 0.0, z]), (0, 0, 1))
        if c is not None:
            centros.append(c)
    centros = np.array(centros)
    ajuste_x = np.polyfit(centros[:, 2], centros[:, 0], 2)
    ajuste_y = np.polyfit(centros[:, 2], centros[:, 1], 2)

    def canal(z):
        z = np.asarray(z, float)
        return np.stack([np.polyval(ajuste_x, z), np.polyval(ajuste_y, z), z], -1)

    # Segmento: red triangular sobre el hueso (filas a lo largo, columnas
    # alrededor, cada fila corrida media celda), con el radio de cada punto
    # medido con un rayo desde afuera y suavizado
    z0, z1 = INT_TRAMO
    radio_medio = 15 * MM
    columnas = 3 * round(2 * math.pi * radio_medio / INT_CELDA / 3)
    filas = round((z1 - z0) / (INT_CELDA * math.sqrt(3) / 2)) + 1
    th = 2 * math.pi * (np.arange(columnas)[None, :] + 0.5 * (np.arange(filas)[:, None] % 2)) / columnas
    zz = np.broadcast_to(np.linspace(z0, z1, filas)[:, None], th.shape)
    radial = np.stack([np.cos(th), np.sin(th), np.zeros_like(th)], -1)
    centro = canal(zz)
    radios = np.full(th.shape, np.nan)
    for j in range(filas):
        for i in range(columnas):
            hit = bvh.ray_cast((centro[j, i] + radial[j, i] * 0.06).tolist(), (-radial[j, i]).tolist(), 0.06)
            if hit[0] is not None:
                radios[j, i] = 0.06 - hit[3]
    radios[np.isnan(radios)] = np.nanmedian(radios)
    radios = suavizar(radios, 1.2, 1, ejes=(1, 0), periodico=(1,))
    co = centro + radial * (radios[..., None] + 0.6 * MM)
    caras = []
    for j in range(filas - 1):
        for i in range(columnas):
            a, b = j * columnas + i, j * columnas + (i + 1) % columnas
            if j % 2 == 0:  # la fila de arriba está corrida media celda hacia +i
                c_, d_ = (j + 1) * columnas + i, (j + 1) * columnas + (i + 1) % columnas
                caras += [[a, b, c_], [b, d_, c_]]
            else:
                c_, d_ = (j + 1) * columnas + (i + 1) % columnas, (j + 1) * columnas + i
                caras += [[a, b, c_], [a, c_, d_]]
    tubo = Pieza().sumar(co.reshape(-1, 3), caras)
    bm = tubo.bm()
    bm.verts.ensure_lookup_table()
    bmesh.ops.recalc_face_normals(bm, faces=bm.faces)
    hacia_afuera = radial.reshape(-1, 3)
    if sum(np.dot(f.normal, hacia_afuera[f.verts[0].index]) for f in bm.faces) < 0:
        bmesh.ops.reverse_faces(bm, faces=bm.faces)
    # Poros: se dejan macizas dos filas en cada extremo
    fila = {v: v.index // columnas for v in bm.verts}
    medio = bm.verts[(filas // 2) * columnas]
    poros = perforar(bm, [medio], INT_BORDE, permitido=lambda v: 2 <= fila[v] <= filas - 3)
    bmesh.ops.solidify(bm, geom=bm.faces[:], thickness=INT_ESPESOR)
    pieza = Pieza().sumar_bm(bm)
    bm.free()
    print(f'[implantes] intercalar: {columnas} × {filas} celdas, {poros} poros')

    # Clavo endomedular: sigue el canal desde la entrada, 360 mm
    zs = np.linspace(INT_ENTRADA, INT_ENTRADA - 0.4, 400)
    puntos = canal(zs)
    tramo = np.r_[0, np.cumsum(np.linalg.norm(np.diff(puntos, axis=0), axis=1))]
    rc, lc = INT_CLAVO
    zs_clavo = np.interp(np.linspace(0, lc, 60), tramo, zs)
    puntos = canal(zs_clavo)
    radios_clavo = np.where(np.linspace(0, lc, 60) < 55 * MM, rc * 1.15, rc)
    pieza.sumar(*barrido(puntos, radios_clavo, 20))

    # Alojamientos oblicuos y tornillos: dos arriba (hacia el fragmento
    # proximal) y dos abajo (hacia el distal), por delante
    for z_al, hacia in ((z1 - 6 * MM, 1), (z0 + 6 * MM, -1)):
        for direccion in ((-0.75, -0.66), (0.35, -0.94)):
            r_dir = np.array([*direccion, 0.0]) / np.linalg.norm(direccion)
            c_al = canal(z_al)
            hit = bvh.ray_cast((c_al + r_dir * 0.06).tolist(), (-r_dir).tolist(), 0.06)
            sup = np.array(hit[0]) if hit[0] is not None else c_al + r_dir * radio_medio
            d = unitario(-r_dir * math.cos(math.radians(40)) + np.array([0, 0, hacia]) * math.sin(math.radians(40)))
            pieza.sumar(*cilindro(3.3 * MM, 6 * MM, 18, z0=-3.5 * MM), origen=sup, eje=-d)
            largo = 40 * MM
            pieza.sumar(*tornillo(largo, INT_TORNILLO, cabeza=(5.6 * MM, 1.6 * MM)),
                        origen=sup - d * 2.5 * MM + d * largo, eje=-d)

    obj = resumen(pieza.objeto('implante_intercalar'))
    cortar_tramo(femur, canal(z0), canal(z1))
    return obj


nuevos.append(intercalar())


exportar(nuevos, salida / 'implantes-recorrido.glb')
exportar([o for o in bpy.context.scene.objects if o.type == 'MESH' and o not in nuevos and o is not parche],
         salida / 'cuerpo.glb')
