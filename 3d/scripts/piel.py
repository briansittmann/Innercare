# Piel del cuerpo de vidrio: parte de las dos mallas de Tripo (cuerpo entero y
# busto) y deja un maniquí liso, a escala real y liviano para la web.
#
# 1. Escala el cuerpo a ALTURA, con los pies en z = 0.
# 2. Alinea el busto con la cabeza del cuerpo (ICP con escala) y une las dos
#    mallas por el cuello: la cabeza sale del busto, que tiene la cara limpia.
# 3. Remalla por vóxeles: une las piezas y deja una malla uniforme.
# 4. Suaviza el cuerpo, borra pezones y vulva y disimula la costura del cuello.
# 5. Simplifica y exporta.
#
# Uso:
#   blender -b -P 3d/scripts/piel.py -- <cuerpo.glb> <busto.glb> <salida.glb>

import sys
from pathlib import Path

import bmesh
import bpy
import numpy as np
from mathutils import Matrix
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree

ALTURA = 1.70
VOXEL = 0.002  # 2 mm: conserva párpados y labios
CARAS_FINALES = 60_000

# Proporciones del cuerpo de Tripo, medidas en los renders de control
# (fracción de la altura, desde los pies)
MENTON = 0.877
CORTE_CUERPO = 0.865  # el cuerpo se conserva por debajo
CORTE_BUSTO = 0.845  # el busto se conserva por encima: 3,4 cm de solape

args = sys.argv[sys.argv.index('--') + 1:]
ruta_cuerpo, ruta_busto, ruta_salida = (Path(a).resolve() for a in args[:3])


def importar(ruta):
    antes = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=str(ruta))
    mallas = [o for o in set(bpy.data.objects) - antes if o.type == 'MESH']
    obj = mallas[0]
    # Hornea la transformación en los vértices
    obj.data.transform(obj.matrix_world)
    obj.matrix_world = Matrix.Identity(4)
    obj.parent = None
    return obj


def vertices(obj):
    co = np.empty(len(obj.data.vertices) * 3)
    obj.data.vertices.foreach_get('co', co)
    return co.reshape(-1, 3)


def fijar_vertices(obj, co):
    obj.data.vertices.foreach_set('co', co.ravel())
    obj.data.update()


def aplicar_modificador(obj, tipo, **opciones):
    mod = obj.modifiers.new(tipo.lower(), tipo)
    for clave, valor in opciones.items():
        setattr(mod, clave, valor)
    evaluado = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    viejo = obj.data
    obj.data = bpy.data.meshes.new_from_object(evaluado)
    obj.modifiers.remove(mod)
    bpy.data.meshes.remove(viejo)


def cortar(obj, altura, conservar_abajo):
    # Corta por un plano horizontal y tapa el agujero, para que la malla quede
    # cerrada y el remallado la una sin fugas.
    bm = bmesh.new()
    bm.from_mesh(obj.data)
    geom = bm.verts[:] + bm.edges[:] + bm.faces[:]
    bmesh.ops.bisect_plane(
        bm, geom=geom, plane_co=(0, 0, altura), plane_no=(0, 0, 1),
        clear_outer=conservar_abajo, clear_inner=not conservar_abajo,
    )
    borde = [e for e in bm.edges if e.is_boundary]
    bmesh.ops.holes_fill(bm, edges=borde, sides=0)
    bm.to_mesh(obj.data)
    bm.free()


def similitud(origen, destino):
    # Umeyama: escala, rotación y traslación que llevan origen a destino
    mu_o, mu_d = origen.mean(0), destino.mean(0)
    o, d = origen - mu_o, destino - mu_d
    u, s, vt = np.linalg.svd(d.T @ o / len(o))
    signo = np.diag([1, 1, np.sign(np.linalg.det(u @ vt))])
    r = u @ signo @ vt
    escala = np.trace(np.diag(s) @ signo) / (o ** 2).sum(1).mean()
    return escala, r, mu_d - escala * r @ mu_o


def suavizar(co, aristas, peso, iteraciones, inflar=True):
    # Taubin: alterna un paso que suaviza y otro que infla, para no encoger.
    # Sin inflar, rellena pliegues (y encoge un poco la zona).
    # `peso` (0 a 1 por vértice) limita el efecto a una zona.
    a, b = aristas[:, 0], aristas[:, 1]
    n = len(co)
    grado = np.bincount(a, minlength=n) + np.bincount(b, minlength=n)
    grado = np.maximum(grado, 1)[:, None]
    for _ in range(iteraciones):
        for factor in ((0.5, -0.53) if inflar else (0.5,)):
            vecinos = np.stack([
                np.bincount(a, co[b, i], n) + np.bincount(b, co[a, i], n)
                for i in range(3)
            ], 1) / grado
            co = co + (peso * factor)[:, None] * (vecinos - co)
    return co


def esfera(co, centro, radio):
    # Peso 1 en el centro que cae suave a 0 en el radio
    d = np.linalg.norm(co - centro, axis=1) / radio
    return np.clip(1 - d, 0, 1) ** 2 * (3 - 2 * np.clip(1 - d, 0, 1))


bpy.ops.wm.read_factory_settings(use_empty=True)

# 1. Cuerpo a escala real
cuerpo = importar(ruta_cuerpo)
co = vertices(cuerpo)
alto = co[:, 2].max() - co[:, 2].min()
co = (co - [co[:, 0].mean(), co[:, 1].mean(), co[:, 2].min()]) * (ALTURA / alto)
fijar_vertices(cuerpo, co)
H = ALTURA
print(f'[piel] cuerpo: {len(co)} vértices, escalado x{ALTURA / alto:.3f}')

# 2. Busto alineado con la cabeza del cuerpo
busto = importar(ruta_busto)
cb = vertices(busto)
alto_busto = cb[:, 2].max() - cb[:, 2].min()
menton_busto = cb[:, 2].max() - 0.495 * alto_busto  # medido en su render
cabeza_cuerpo = co[co[:, 2] > MENTON * H]
cabeza_busto = cb[cb[:, 2] > menton_busto]
escala = (H - MENTON * H) / (cb[:, 2].max() - menton_busto)
cb = (cb - cabeza_busto.mean(0)) * escala + cabeza_cuerpo.mean(0)

# ICP con escala: puntos de la cabeza del busto contra la del cuerpo
rng = np.random.default_rng(0)
arbol = KDTree(len(cabeza_cuerpo))
for i, p in enumerate(cabeza_cuerpo):
    arbol.insert(p, i)
arbol.balance()
for paso in range(40):
    zona = cb[cb[:, 2] > (MENTON + 0.008) * H]
    muestra = zona[rng.choice(len(zona), min(15_000, len(zona)), replace=False)]
    pares = [arbol.find(p) for p in muestra]
    destino = np.array([p[0] for p in pares])
    distancia = np.array([p[2] for p in pares])
    validos = distancia < np.percentile(distancia, 80)
    s, r, t = similitud(muestra[validos], destino[validos])
    cb = s * cb @ r.T + t
print(f'[piel] busto alineado, distancia mediana {np.median(distancia) * 1000:.1f} mm')
fijar_vertices(busto, cb)

# Unión por el cuello
cortar(cuerpo, CORTE_CUERPO * H, conservar_abajo=True)
cortar(busto, CORTE_BUSTO * H, conservar_abajo=False)
bm = bmesh.new()
bm.from_mesh(cuerpo.data)
bm.from_mesh(busto.data)
bm.to_mesh(cuerpo.data)
bm.free()
bpy.data.objects.remove(busto)

# 3. Remallado: une el solape del cuello y uniformiza
aplicar_modificador(cuerpo, 'REMESH', mode='VOXEL', voxel_size=VOXEL, adaptivity=0)
co = vertices(cuerpo)
aristas = np.empty(len(cuerpo.data.edges) * 2, dtype=np.int64)
cuerpo.data.edges.foreach_get('vertices', aristas)
aristas = aristas.reshape(-1, 2)
print(f'[piel] remallado: {len(co)} vértices')

# 4. Suavizado
# Los relieves a borrar (abdominales, costillas, clavículas) miden unos 5 cm:
# sobre la malla fina harían falta miles de pasadas. Se suaviza una copia
# gruesa y la malla fina se proyecta sobre ella, salvo cabeza, manos y pies.
z = co[:, 2]
x = np.abs(co[:, 0])

# Pezones: el punto más adelantado del pecho, a cada lado
pecho = (z > 0.68 * H) & (z < 0.78 * H)
pezones = []
for lado in (-1, 1):
    zona = pecho & (lado * co[:, 0] > 0.02 * H) & (lado * co[:, 0] < 0.12 * H)
    pezones.append(co[zona][np.argmin(co[zona][:, 1])])
# Vulva: entre las piernas, en el frente
franja = (x < 0.012 * H) & (np.abs(z - 0.49 * H) < 0.01 * H)
vulva = co[franja][np.argmin(co[franja][:, 1])]
print(f'[piel] pezones en {np.round(pezones, 3).tolist()}, vulva en {np.round(vulva, 3)}')

grueso = cuerpo.copy()
grueso.data = cuerpo.data.copy()
bpy.context.scene.collection.objects.link(grueso)
aplicar_modificador(grueso, 'REMESH', mode='VOXEL', voxel_size=0.008, adaptivity=0)
cg = vertices(grueso)
ag = np.empty(len(grueso.data.edges) * 2, dtype=np.int64)
grueso.data.edges.foreach_get('vertices', ag)
ag = ag.reshape(-1, 2)
cg = suavizar(cg, ag, np.ones(len(cg)), 25)
# Pezones y vulva: suavizado sin inflar, que rellena el pliegue
for pezon in pezones:
    cg = suavizar(cg, ag, esfera(cg, pezon, 0.05), 20, inflar=False)
cg = suavizar(cg, ag, esfera(cg, vulva, 0.09), 40, inflar=False)
fijar_vertices(grueso, cg)

# Peso de la proyección: 1 en el cuerpo, 0 en cabeza, manos y pies
def rampa(valor, desde, hasta):
    t = np.clip((valor - desde) / (hasta - desde), 0, 1)
    return t * t * (3 - 2 * t)

# Se apaga en la cabeza; entero en la costura del cuello, que hay que borrar
peso = rampa(z, (MENTON + 0.008) * H, (CORTE_CUERPO + 0.003) * H)
peso *= 1 - rampa(x, 0.12 * H, 0.14 * H) * rampa(z, 0.57 * H, 0.54 * H)  # manos
peso *= rampa(z, 0.05 * H, 0.08 * H)  # pies

polys = [tuple(p.vertices) for p in grueso.data.polygons]
arbol_grueso = BVHTree.FromPolygons(cg.tolist(), polys)
desplazamiento = np.zeros_like(co)
for i in np.nonzero(peso > 0)[0]:
    desplazamiento[i] = np.array(arbol_grueso.find_nearest(co[i])[0]) - co[i]
bpy.data.objects.remove(grueso)

# En pliegues profundos (columna, glúteos, axilas) la copia gruesa los tapa:
# ahí el salto es grande y se respeta la forma original. Pezones, vulva y la
# costura del cuello (donde la tapa del corte asoma como un reborde) no.
salto = np.linalg.norm(desplazamiento, axis=1)
# Cubre los dos cortes (cuerpo y busto) con margen
costura = rampa(np.abs(z - (CORTE_CUERPO + CORTE_BUSTO) / 2 * H), 0.035, 0.025)
pubis = vulva + [0, 0, 0.02]  # el pliegue sube hasta el pubis
borrar = np.maximum.reduce(
    [esfera(co, p, 0.04) for p in pezones] + [esfera(co, pubis, 0.07), costura]
)
peso *= np.maximum(1 - rampa(salto, 0.008, 0.016), borrar)
# El desplazamiento se suaviza antes de aplicarlo: vértices vecinos se mueven
# parecido y no quedan dientes donde la proyección cambia de lado. En las zonas
# a borrar va sin suavizar: el promedio diluye los cambios angostos.
crudo = desplazamiento * peso[:, None]
suave = suavizar(crudo, aristas, np.ones(len(co)), 15, inflar=False)
co = co + suave + borrar[:, None] * (crudo - suave)
# Repaso de la costura sobre la malla fina
co = suavizar(co, aristas, costura, 20, inflar=False)

# Un repaso fino para el ruido de la proyección y la cabeza
co = suavizar(co, aristas, np.maximum(peso, 0.3), 5)
fijar_vertices(cuerpo, co)

# 5. Simplificar y exportar
caras = len(cuerpo.data.polygons)
aplicar_modificador(cuerpo, 'DECIMATE', ratio=min(1, CARAS_FINALES / caras))
for cara in cuerpo.data.polygons:
    cara.use_smooth = True
cuerpo.name = cuerpo.data.name = 'piel'
print(f'[piel] final: {len(cuerpo.data.polygons)} caras')

ruta_salida.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(ruta_salida), export_format='GLB')
