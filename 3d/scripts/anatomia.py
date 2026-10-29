# Esqueleto del cuerpo de vidrio: los huesos de BodyParts3D, ajustados dentro
# de la piel (salida de piel.py), simplificados y agrupados por zona.
#
# El atlas trae también su propia piel (FJ2810): un hombre de 1,72 m en
# posición anatómica, con las palmas hacia adelante. El ajuste se calcula
# entre las dos pieles y se lleva a los huesos:
# 1. Lee los OBJ, pasa de milímetros a metros y simplifica cada hueso.
# 2. Ajuste articulado: el tronco y la cabeza se alinean con escala por eje;
#    cada segmento de los miembros gira y escala alrededor de su
#    articulación, en cadena, para que las articulaciones no se separen. La
#    mano se orienta por sus ejes principales (la piel tiene las palmas hacia
#    los muslos) y el radio la acompaña en la pronación.
# 3. Ajuste fino: la diferencia que queda entre las dos pieles se suaviza y
#    cada hueso la sigue según la piel más cercana de su zona. La cabeza y
#    las manos quedan fuera.
# 4. Lo que todavía asome de la piel se mete adentro: primero cada hueso
#    entero (se traslada y, si hace falta, se achica) y después, lo poco que
#    quede, vértice por vértice.
# 5. Une los huesos por zona (hueso_<zona>_<lado>) y exporta.
#
# Uso:
#   blender -b -P 3d/scripts/anatomia.py -- <carpeta_obj> <piel.glb> <salida.glb>

import math
import re
import sys
from pathlib import Path

import bpy
import numpy as np
from mathutils import Matrix
from mathutils.bvhtree import BVHTree
from mathutils.kdtree import KDTree

CARAS_FINALES = 110_000  # todo el esqueleto: con el vidrio delante, el detalle fino no se ve
CARAS_MINIMAS = 80  # por hueso, para que falanges y huesecillos no se deshagan
# Zonas que se exportan enteras, sin separar lados
SIN_LADO = {'craneo', 'maxilar', 'mandibula', 'columna', 'torax'}
# Peso de cada hueso en el reparto de caras, además de su superficie. Los
# huesos con detalle fino se rompen en astillas si se simplifican tanto como
# una costilla; los de la cara, que son láminas, no se simplifican (None).
DETALLE = [
    (r'maxilla|zygomatic|sphenoid|palatine|lacrimal|nasal|temporal', None),
    (r'intervertebral', 0.5),
    (r'mandible|vertebra|atlas|axis|sacrum', 4),
    (r'tooth|frontal|parietal|occipital', 2),
]
# Huesos internos del cráneo: no se ven desde afuera
DESCARTADOS = r'ethmoid|vomer|concha'
MARGEN = 0.003  # distancia mínima de un hueso a la piel, en metros
TOLERANCIA = 0.05  # fracción de un hueso que puede asomar sin moverlo entero
PULPEJO = 0.006  # de la punta de la falange distal a la punta del dedo
CIERRE = 0.85  # cuánto se juntan los dedos del atlas (1 = paralelos al medio)

args = sys.argv[sys.argv.index('--') + 1:]
carpeta, ruta_piel, ruta_salida = (Path(a).resolve() for a in args[:3])

# Zona de exportación y segmento del ajuste de cada hueso, por su nombre en
# inglés en el atlas. El orden importa: gana la primera regla que coincide.
REGLAS = [
    (r'upper .*tooth', 'maxilar', 'cabeza'),
    (r'lower .*tooth', 'mandibula', 'cabeza'),
    (r'maxilla', 'maxilar', 'cabeza'),
    (r'mandible', 'mandibula', 'cabeza'),
    (r'frontal|parietal|temporal|occipital|sphenoid|nasal|lacrimal|zygomatic|palatine',
     'craneo', 'cabeza'),
    (r'vertebra|atlas|axis|sacrum|intervertebral', 'columna', 'tronco'),
    (r'rib|costal|sternum|manubrium|xiphoid|hyoid', 'torax', 'tronco'),
    (r'clavicle', 'clavicula', 'tronco'),
    (r'scapula', 'escapula', 'tronco'),
    (r'hip bone', 'coxal', 'tronco'),
    (r'humerus', 'humero', 'brazo'),
    (r'ulna', 'antebrazo', 'antebrazo'),
    (r'radius', 'antebrazo', 'radio'),
    (r'carp|scaphoid|lunate|triquetral|pisiform|trapez|capitate|hamate|finger|thumb', 'mano', 'mano'),
    (r'femur', 'femur', 'muslo'),
    (r'patella', 'rotula', 'muslo'),
    (r'tibia|fibula', 'pierna', 'pierna'),
    (r'talus|calcaneus|cuboid|cuneiform|navicular|metatarsal|toe', 'pie', 'pie'),
]
# Cadena del ajuste: cada segmento gira alrededor de su articulación con el padre
PADRE = {'cabeza': 'tronco', 'brazo': 'tronco', 'antebrazo': 'brazo', 'radio': 'antebrazo',
         'mano': 'radio', 'muslo': 'tronco', 'pierna': 'muslo', 'pie': 'pierna'}


def clasificar(nombre):
    n = nombre.lower()
    lado = '_der' if re.search(r'\bright\b', n) else '_izq' if re.search(r'\bleft\b', n) else ''
    for patron, zona, segmento in REGLAS:
        if re.search(patron, n):
            return (zona if zona in SIN_LADO else zona + lado,
                    segmento if segmento in ('tronco', 'cabeza') else segmento + lado)
    raise ValueError(f'hueso sin zona: {nombre}')


def tipo(segmento):
    return segmento.removesuffix('_der').removesuffix('_izq')


def padre(segmento):
    lado = segmento[len(tipo(segmento)):]
    p = PADRE[tipo(segmento)]
    return p if p in ('tronco', 'cabeza') else p + lado


def leer_obj(ruta):
    nombre, co, caras = '', [], []
    for linea in open(ruta):
        if linea.startswith('v '):
            co.append(linea.split()[1:4])
        elif linea.startswith('f '):
            caras.append([int(t.split('/')[0]) - 1 for t in linea.split()[1:]])
        elif linea.startswith('# English name'):
            nombre = linea.split(':', 1)[1].strip()
    return nombre, np.array(co, float) / 1000, np.array(caras)


def malla(nombre, co, caras):
    datos = bpy.data.meshes.new(nombre)
    datos.from_pydata(co.tolist(), [], caras.tolist())
    obj = bpy.data.objects.new(nombre, datos)
    bpy.context.scene.collection.objects.link(obj)
    return obj


def vertices(obj):
    co = np.empty(len(obj.data.vertices) * 3)
    obj.data.vertices.foreach_get('co', co)
    return co.reshape(-1, 3)


def triangulos(obj):
    obj.data.calc_loop_triangles()
    tri = np.empty(len(obj.data.loop_triangles) * 3, dtype=np.int64)
    obj.data.loop_triangles.foreach_get('vertices', tri)
    return tri.reshape(-1, 3)


def simplificar(co, caras, ratio):
    obj = malla('tmp', co, caras)
    mod = obj.modifiers.new('decimate', 'DECIMATE')
    mod.ratio = ratio
    evaluado = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    simple = bpy.data.meshes.new_from_object(evaluado)
    viejo = obj.data
    obj.data = simple
    bpy.data.meshes.remove(viejo)
    resultado = vertices(obj), triangulos(obj)
    bpy.data.objects.remove(obj)
    bpy.data.meshes.remove(simple)
    return resultado


def aplicar(m, co):
    return co @ m[:3, :3].T + m[:3, 3]


def afin(a, t):
    m = np.eye(4)
    m[:3, :3], m[:3, 3] = a, t
    return m


def alrededor(c, a):
    # Transformación lineal `a` alrededor del punto c
    return afin(a, c - a @ c)


def similitud(origen, destino):
    # Umeyama: escala, rotación y traslación que llevan origen a destino
    mu_o, mu_d = origen.mean(0), destino.mean(0)
    o, d = origen - mu_o, destino - mu_d
    u, s, vt = np.linalg.svd(d.T @ o / len(o))
    signo = np.diag([1, 1, np.sign(np.linalg.det(u @ vt))])
    r = u @ signo @ vt
    escala = np.trace(np.diag(s) @ signo) / (o ** 2).sum(1).mean()
    return afin(escala * r, mu_d - escala * r @ mu_o)


def escala_por_eje(origen, destino):
    # Después de la similitud: escala independiente en x, y, z
    mu_o, mu_d = origen.mean(0), destino.mean(0)
    o, d = origen - mu_o, destino - mu_d
    s = np.diag((o * d).sum(0) / (o * o).sum(0))
    return afin(s, mu_d - s @ mu_o)


def giro(origen, destino, c):
    # Kabsch alrededor de un punto fijo c, con escala uniforme
    o, d = origen - c, destino - c
    u, _, vt = np.linalg.svd(d.T @ o)
    r = u @ np.diag([1, 1, np.sign(np.linalg.det(u @ vt))]) @ vt
    escala = (d * (o @ r.T)).sum() / (o * o).sum()
    return alrededor(c, escala * r)


def rotacion_eje(eje, angulo):
    return np.array(Matrix.Rotation(angulo, 3, eje.tolist()))


def arbol_kd(co):
    arbol = KDTree(len(co))
    for i, p in enumerate(co):
        arbol.insert(p, i)
    arbol.balance()
    return arbol


def cercanos(arbol, puntos):
    pares = [arbol.find(p) for p in puntos]
    return np.array([p[0] for p in pares]), np.array([p[2] for p in pares])


def icp(puntos, arbol, paso, pasos=30):
    # Ajuste iterativo de `puntos` contra la piel de destino; `paso` calcula
    # la transformación de cada iteración. Devuelve la acumulada.
    total = np.eye(4)
    for _ in range(pasos):
        actual = aplicar(total, puntos)
        destino, distancia = cercanos(arbol, actual)
        validos = distancia < np.percentile(distancia, 80)
        total = paso(actual[validos], destino[validos]) @ total
    _, distancia = cercanos(arbol, aplicar(total, puntos))
    return total, np.median(distancia)


def suavizar(valores, aristas, iteraciones, fijos=None):
    # Promedio con los vecinos. Con `fijos`, solo cambian los demás (relleno).
    a, b = aristas[:, 0], aristas[:, 1]
    n = len(valores)
    grado = np.maximum(np.bincount(a, minlength=n) + np.bincount(b, minlength=n), 1)[:, None]
    for _ in range(iteraciones):
        vecinos = np.stack([
            np.bincount(a, valores[b, i], n) + np.bincount(b, valores[a, i], n)
            for i in range(valores.shape[1])
        ], 1) / grado
        valores = vecinos if fijos is None else np.where(fijos[:, None], valores, vecinos)
    return valores


bpy.ops.wm.read_factory_settings(use_empty=True)
rng = np.random.default_rng(0)

# 1. Huesos y piel del atlas
huesos = []
piel_atlas = None
for ruta in sorted(carpeta.glob('*.obj')):
    nombre, co, caras = leer_obj(ruta)
    if nombre == 'Skin':
        piel_atlas = co, caras
        continue
    if re.search(DESCARTADOS, nombre.lower()):
        continue
    zona, segmento = clasificar(nombre)
    huesos.append({'nombre': nombre, 'zona': zona, 'segmento': segmento, 'co': co, 'caras': caras})

# Las caras se reparten por superficie: los OBJ del atlas vienen con
# densidades muy distintas (el fémur trae menos caras que una escápula)
def superficie(co, caras):
    a, b, c = co[caras[:, 0]], co[caras[:, 1]], co[caras[:, 2]]
    return np.linalg.norm(np.cross(b - a, c - a), axis=1).sum() / 2


def detalle(nombre):
    return next((peso for patron, peso in DETALLE if re.search(patron, nombre.lower())), 1)


caras_atlas = sum(len(h['caras']) for h in huesos)
enteros = sum(len(h['caras']) for h in huesos if detalle(h['nombre']) is None)
resto = [h for h in huesos if detalle(h['nombre']) is not None]
areas = np.array([superficie(h['co'], h['caras']) * detalle(h['nombre']) for h in resto])
for h, area in zip(resto, areas):
    objetivo = max(CARAS_MINIMAS, (CARAS_FINALES - enteros) * area / areas.sum())
    h['co'], h['caras'] = simplificar(h['co'], h['caras'], min(1, objetivo / len(h['caras'])))
print(f'[anatomia] {len(huesos)} huesos, {caras_atlas} caras -> {sum(len(h["caras"]) for h in huesos)}')


def huesos_de(texto):
    return np.concatenate([h['co'] for h in huesos if re.search(texto, h['nombre'].lower())])


# Articulaciones, en coordenadas del atlas
def extremo(co, arriba, alto=0.02):
    z = co[:, 2]
    return co[z > z.max() - alto].mean(0) if arriba else co[z < z.min() + alto].mean(0)


articulacion = {'cabeza': huesos_de(r'^atlas$').mean(0)}
for lado, nombre in (('_der', 'right'), ('_izq', 'left')):
    humero = huesos_de(rf'{nombre} humerus')
    radio = huesos_de(rf'{nombre} radius')
    cubito = huesos_de(rf'{nombre} ulna')
    femur = huesos_de(rf'{nombre} femur')
    # Cabeza del fémur: la mitad medial de su extremo superior (la otra es el trocánter)
    tope = femur[femur[:, 2] > femur[:, 2].max() - 0.05]
    cabeza_femur = tope[np.abs(tope[:, 0]) < np.median(np.abs(tope[:, 0]))].mean(0)
    articulacion |= {
        'brazo' + lado: extremo(humero, True, 0.03),
        'antebrazo' + lado: extremo(humero, False),
        'radio' + lado: extremo(radio, True, 0.015),  # cabeza del radio: un extremo del eje de pronación
        'mano' + lado: (extremo(radio, False, 0.015) + extremo(cubito, False, 0.015)) / 2,
        'muslo' + lado: cabeza_femur,
        'pierna' + lado: extremo(femur, False),
        'pie' + lado: huesos_de(rf'{nombre} talus').mean(0),
        'cubito' + lado: extremo(cubito, False, 0.015),  # cabeza del cúbito: el otro extremo
    }

    # Dedos del atlas cerrados, como en la piel: índice, anular y meñique giran
    # sobre su nudillo, en el plano de la palma, hacia la dirección del medio
    def nudillo(ordinal):
        return extremo(huesos_de(rf'{nombre} {ordinal} metacarpal'), False)

    def falanges(dedo):
        return [h for h in huesos if f'phalanx of {nombre} {dedo} finger' in h['nombre'].lower()]

    def direccion(dedo, ordinal):
        d = np.concatenate([h['co'] for h in falanges(dedo)]).mean(0) - nudillo(ordinal)
        return d / np.linalg.norm(d)

    medio = direccion('middle', 'third')
    normal = np.cross(medio, nudillo('second') - nudillo('fifth'))
    normal /= np.linalg.norm(normal)
    for dedo, ordinal in (('index', 'second'), ('ring', 'fourth'), ('little', 'fifth')):
        d = direccion(dedo, ordinal)
        angulo = math.atan2(np.cross(d, medio) @ normal, d @ medio)
        c = nudillo(ordinal)
        for h in falanges(dedo):
            h['co'] = aplicar(alrededor(c, rotacion_eje(normal, angulo * CIERRE)), h['co'])

# La piel del atlas, repartida por segmentos según el hueso más cercano
co_atlas, caras_piel_atlas = piel_atlas
todos = np.concatenate([h['co'] for h in huesos])
segmento_vertice = np.concatenate([[h['segmento']] * len(h['co']) for h in huesos])
# La piel del antebrazo es una sola: la del radio cuenta como antebrazo
segmento_vertice = np.array([s.replace('radio', 'antebrazo') for s in segmento_vertice])
arbol_huesos = arbol_kd(todos[::3])
indices = np.array([arbol_huesos.find(p)[1] for p in co_atlas])
segmento_piel = segmento_vertice[::3][indices]

# Genitales del atlas: no se usan para el ajuste
H_atlas = co_atlas[:, 2].max() - co_atlas[:, 2].min()
z_rel = (co_atlas[:, 2] - co_atlas[:, 2].min()) / H_atlas
genitales = (np.abs(co_atlas[:, 0]) < 0.06) & (z_rel > 0.40) & (z_rel < 0.51) & (co_atlas[:, 1] < -0.09)

# 2. Piel de destino
bpy.ops.import_scene.gltf(filepath=str(ruta_piel))
piel = next(o for o in bpy.context.scene.objects if o.type == 'MESH')
piel.data.transform(piel.matrix_world)
piel.matrix_world = Matrix.Identity(4)
co_piel = vertices(piel)
tri_piel = triangulos(piel)
H = co_piel[:, 2].max() - co_piel[:, 2].min()

# Escala y posición de partida: misma altura, pies en el suelo, mismo centro
s = H / H_atlas
inicio = afin(np.eye(3) * s, [0, 0, 0])
inicio[:3, 3] = [co_piel[:, 0].mean(), co_piel[:, 1].mean(), co_piel[:, 2].min()] - s * np.array(
    [co_atlas[:, 0].mean(), co_atlas[:, 1].mean(), co_atlas[:, 2].min()])


def muestra(segmento, n=4000):
    # Puntos de la piel del atlas de un segmento (sin genitales)
    idx = np.nonzero((segmento_piel == segmento) & ~genitales)[0]
    return co_atlas[rng.choice(idx, min(n, len(idx)), replace=False)]


# Tronco: similitud y escala por eje, contra toda la piel
arbol_piel = arbol_kd(co_piel)
transformacion = {}
pts = aplicar(inicio, muestra('tronco'))


def paso_libre(o, d):
    m = similitud(o, d)
    return escala_por_eje(aplicar(m, o), d) @ m


m, error = icp(pts, arbol_piel, paso_libre)
transformacion['tronco'] = m @ inicio
print(f'[anatomia] tronco: distancia mediana {error * 1000:.1f} mm, '
      f'escala {np.round(np.linalg.norm(transformacion["tronco"][:3, :3], axis=0), 3).tolist()}')

# Con el tronco alineado, la piel de destino se reparte por segmentos según el
# vértice más cercano de la piel del atlas, movida con el tronco
arbol_atlas = arbol_kd(aplicar(transformacion['tronco'], co_atlas[::2]))
segmento_destino = segmento_piel[::2][[arbol_atlas.find(p)[1] for p in co_piel]]
arboles = {seg: (arbol_kd(co_piel[segmento_destino == seg]), np.nonzero(segmento_destino == seg)[0])
           for seg in np.unique(segmento_destino)}

vecinos_piel = [[] for _ in co_piel]
for a, b in np.concatenate([tri_piel[:, [0, 1]], tri_piel[:, [1, 2]], tri_piel[:, [2, 0]]]):
    vecinos_piel[a].append(b)
    vecinos_piel[b].append(a)


def separar_extremo(seg, base, c):
    # La mano y el pie de destino no se reparten por cercanía con el atlas:
    # el atlas tiene la mano abierta y en otra posición, y los dedos de la
    # piel quedarían como muslo. Son la piel que está más allá del plano de
    # la muñeca (o del tobillo) y conectada con ella.
    lado = seg[len(tipo(seg)):]
    anterior = 'antebrazo' if tipo(seg) == 'mano' else 'pierna'
    eje = c - aplicar(base, articulacion[anterior + lado][None])[0]
    eje /= np.linalg.norm(eje)
    distal = (co_piel - c) @ eje > 0
    semilla = np.nonzero(distal)[0][np.argmin(np.linalg.norm(co_piel[distal] - (c + eje * 0.03), axis=1))]
    region, pendientes = {semilla}, [semilla]
    while pendientes:
        for v in vecinos_piel[pendientes.pop()]:
            if distal[v] and v not in region:
                region.add(v)
                pendientes.append(v)
    idx = np.array(sorted(region))
    segmento_destino[idx] = seg
    for s in {seg} | set(np.unique(segmento_destino)):
        marca = segmento_destino == s
        arboles[s] = (arbol_kd(co_piel[marca]), np.nonzero(marca)[0])
    print(f'[anatomia] {seg}: {len(idx)} vértices de piel')
    return arboles[seg][0]


def marco(pts, c, adelante):
    # Ejes principales de una nube de puntos, como filas (largo, ancho y
    # grosor), con el largo alejándose de c y el ancho hacia `adelante`
    _, _, vt = np.linalg.svd(pts - pts.mean(0), full_matrices=False)
    largo = vt[0] * np.sign((pts.mean(0) - c) @ vt[0])
    ancho = vt[1] - (vt[1] @ largo) * largo
    ancho *= np.sign(adelante @ ancho) / np.linalg.norm(ancho)
    return np.stack([largo, ancho, np.cross(largo, ancho)])


def encajar_mano(seg):
    # Sin ICP: la mano del atlas tiene los dedos abiertos y la de la piel,
    # cerrados y algo curvados. Se alinean sus ejes principales desde la
    # muñeca, con el pulgar hacia adelante como en la piel, y se escala por
    # eje: el largo hasta la punta de los dedos; el ancho y el grosor, según
    # los de la piel (la mano del maniquí es más larga que la del atlas, pero
    # no más gruesa).
    lado = seg[len('mano'):]
    nombre = 'right' if lado == '_der' else 'left'
    base = transformacion['antebrazo' + lado]
    c = aplicar(base, articulacion[seg][None])[0]
    separar_extremo(seg, base, c)
    piel_mano = co_piel[arboles[seg][1]]
    mano = aplicar(base, np.concatenate([h['co'] for h in huesos if h['segmento'] == seg]))
    pulgar = aplicar(base, huesos_de(rf'{nombre} thumb|{nombre} first metacarpal')).mean(0)
    origen = marco(mano, c, pulgar - mano.mean(0))
    destino = marco(piel_mano, c, np.array([0., -1, 0]))
    largo = (((piel_mano - c) @ destino[0]).max() - PULPEJO) / ((mano - c) @ origen[0]).max()

    def extension(pts, eje):
        return np.ptp(np.percentile(pts @ eje, [5, 95]))

    escala = [largo] + [np.clip(extension(piel_mano, d) / extension(mano, o), 0.9, 1.2)
                        for d, o in zip(destino[1:], origen[1:])]
    giro_mano = destino.T @ origen
    transformacion[seg] = alrededor(c, destino.T @ np.diag(escala) @ origen) @ base
    # El radio acompaña a la mano: gira sobre el eje de pronación, que va de
    # la cabeza del radio a la del cúbito, lo más parecido al giro de la mano
    a, b = aplicar(base, np.array([articulacion['radio' + lado], articulacion['cubito' + lado]]))
    eje = (b - a) / np.linalg.norm(b - a)
    angulo = min(range(-180, 180, 5),
                 key=lambda g: np.linalg.norm(rotacion_eje(eje, math.radians(g)) - giro_mano))
    transformacion['radio' + lado] = alrededor(a, rotacion_eje(eje, math.radians(angulo))) @ base
    print(f'[anatomia] {seg}: escala {np.round(escala, 3).tolist()} (largo, ancho, grosor), '
          f'pronación del radio {angulo}°')


orden = ['cabeza'] + [s + lado for lado in ('_der', '_izq')
                      for s in ('brazo', 'antebrazo', 'radio', 'mano', 'muslo', 'pierna', 'pie')]
for seg in orden:
    if tipo(seg) == 'radio':
        continue  # se resuelve con la mano
    if tipo(seg) == 'mano':
        encajar_mano(seg)
        continue
    base = transformacion[padre(seg)]
    c = aplicar(base, articulacion[seg][None])[0]
    arbol, _ = arboles[seg]
    pts = aplicar(base, muestra(seg))
    if tipo(seg) == 'pie':
        arbol = separar_extremo(seg, base, c)
    # La cabeza, como el tronco, con escala por eje: la del maniquí tiene
    # otras proporciones que la del atlas
    libre = seg == 'cabeza'
    m, error = icp(pts, arbol, paso_libre if libre else lambda o, d: giro(o, d, c))
    transformacion[seg] = m @ base
    print(f'[anatomia] {seg}: distancia mediana {error * 1000:.1f} mm, '
          f'escala {np.round(np.linalg.norm(m[:3, :3], axis=0), 3).tolist()}')

for h in huesos:
    h['co'] = aplicar(transformacion[h['segmento']], h['co'])
segmento_movido = np.array([s.replace('radio', 'antebrazo') for s in segmento_piel])
piel_movida = np.empty_like(co_atlas)
for seg in np.unique(segmento_movido):
    sel = segmento_movido == seg
    # La piel de la mano sigue a la mano (pronada), no al antebrazo
    piel_movida[sel] = aplicar(transformacion[seg], co_atlas[sel])

# 3. Ajuste fino: la diferencia entre la piel del atlas, ya movida, y la de
# destino, buscada en el mismo segmento
bvh = {}
for seg, (_, idx) in arboles.items():
    marca = np.zeros(len(co_piel), bool)
    marca[idx] = True
    caras_seg = tri_piel[marca[tri_piel].all(1)]
    bvh[seg] = BVHTree.FromPolygons(co_piel.tolist(), caras_seg.tolist())
diferencia = np.zeros_like(co_atlas)
for i, p in enumerate(piel_movida):
    if genitales[i]:
        continue
    destino = bvh[segmento_movido[i]].find_nearest(p)[0]
    if destino is not None:
        diferencia[i] = np.array(destino) - p

aristas = np.concatenate([caras_piel_atlas[:, [0, 1]], caras_piel_atlas[:, [1, 2]], caras_piel_atlas[:, [2, 0]]])
# Los genitales se rellenan con lo que los rodea, y después se suaviza todo:
# los huesos siguen la forma general de la piel, no sus detalles
diferencia = suavizar(diferencia, aristas, 200, fijos=~genitales)
diferencia = suavizar(diferencia, aristas, 40)

# Cada vértice de hueso toma la diferencia de la piel cercana de su zona y de
# las vecinas, con peso 1 / distancia⁴: domina la piel más próxima, y un hueso
# en el centro de un miembro promedia los dos lados
def familia(seg):
    f = {seg} | {s for s in orden if padre(s) == seg}
    if seg != 'tronco':
        f.add(padre(seg))
    return {s.replace('radio', 'antebrazo') for s in f if tipo(s) != 'mano'}


paso_piel = 3
# La cabeza queda rígida: sus huesos encajan entre sí por suturas finas, y
# cualquier deformación los separa. La mano también: su piel no se parece a
# la del atlas, que tiene los dedos abiertos.
for seg in ['tronco'] + [s for s in orden[1:] if tipo(s) != 'mano']:
    sel = np.isin(segmento_movido, list(familia(seg))) & ~genitales
    fuente = piel_movida[sel][::paso_piel]
    desplazamiento = diferencia[sel][::paso_piel]
    for h in (h for h in huesos if h['segmento'] == seg):
        co = h['co']
        nuevo = np.empty_like(co)
        for i in range(0, len(co), 200):
            bloque = co[i:i + 200]
            d2 = (bloque ** 2).sum(1)[:, None] + (fuente ** 2).sum(1)[None] - 2 * bloque @ fuente.T
            peso = 1 / (np.maximum(d2, 1e-8) ** 2)
            nuevo[i:i + 200] = bloque + (peso @ desplazamiento) / peso.sum(1, keepdims=True)
        h['co'] = nuevo

# 4. Nada fuera de la piel (a menos de MARGEN)
bvh_piel = BVHTree.FromPolygons(co_piel.tolist(), tri_piel.tolist())
centro = np.array([co_piel[:, 0].mean(), co_piel[:, 1].mean(), 0.6 * H])
punto, normal, _, _ = bvh_piel.find_nearest(centro)
signo = 1 if np.dot(centro - np.array(punto), normal) < 0 else -1  # normales hacia afuera


def afuera(co):
    # Para cada vértice: cuánto asoma (positivo = fuera del margen) y hacia dónde entrar
    exceso = np.empty(len(co))
    entrar = np.empty_like(co)
    for i, p in enumerate(co):
        punto, normal, _, _ = bvh_piel.find_nearest(p)
        normal = np.array(normal) * signo
        exceso[i] = np.dot(p - np.array(punto), normal) + MARGEN
        entrar[i] = -normal
    return exceso, entrar


# Cada hueso que asoma bastante se mueve entero hacia adentro, y se achica de
# a 2 % mientras siga asomando. Si asoma poco (la punta de una costilla), se
# deja para el empuje por vértice: moverlo entero lo sacaría de su lugar. Los
# de la cabeza van juntos, para no separarse.
piezas = {}
for h in huesos:
    clave = 'cabeza' if h['segmento'] == 'cabeza' else h['nombre']
    piezas.setdefault(clave, []).append(h)
achicados = []
for clave, partes in piezas.items():
    co = np.concatenate([h['co'] for h in partes])
    escala = 1
    for _ in range(25):
        exceso, entrar = afuera(co)
        fuera = exceso > 0
        if fuera.mean() < TOLERANCIA:
            break
        co = co + (entrar[fuera] * exceso[fuera, None]).mean(0)
        if (afuera(co)[0] > 0).mean() >= TOLERANCIA and escala > 0.8:
            c = co.mean(0)
            co = c + (co - c) * 0.98
            escala *= 0.98
    if escala < 1:
        achicados.append(f'{clave} {escala:.2f}')
    for h, d in zip(partes, np.cumsum([0] + [len(h['co']) for h in partes])):
        h['co'] = co[d:d + len(h['co'])]
print(f'[anatomia] achicados para entrar en la piel: {", ".join(achicados) or "ninguno"}')

empujados = 0
for h in huesos:
    exceso, entrar = afuera(h['co'])
    fuera = exceso > 0
    h['co'][fuera] += entrar[fuera] * exceso[fuera, None]
    empujados += fuera.sum()
print(f'[anatomia] vértices empujados adentro: {empujados} de {sum(len(h["co"]) for h in huesos)}')

# 5. Una malla por zona y exportar
bpy.data.objects.remove(piel)
for zona in sorted({h['zona'] for h in huesos}):
    partes = [h for h in huesos if h['zona'] == zona]
    desfase = np.cumsum([0] + [len(h['co']) for h in partes[:-1]])
    co = np.concatenate([h['co'] for h in partes])
    caras = np.concatenate([h['caras'] + d for h, d in zip(partes, desfase)])
    obj = malla(f'hueso_{zona}', co, caras)
    for cara in obj.data.polygons:
        cara.use_smooth = True
    print(f'[anatomia] hueso_{zona}: {len(partes)} huesos, {len(caras)} caras')

ruta_salida.parent.mkdir(parents=True, exist_ok=True)
bpy.ops.export_scene.gltf(filepath=str(ruta_salida), export_format='GLB')
