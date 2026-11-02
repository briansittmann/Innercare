# Renders de las piezas finales de las animaciones de Fabricación (home,
# components/animaciones/fabricacion.ts): la endoprótesis de fémur (CNC) y la
# copa acetabular trabecular (impresión 3D), las mismas mallas del recorrido
# (salida/implantes-recorrido.glb), en Cycles con titanio, luz de estudio y
# sombra de contacto sobre fondo transparente. La animación de partículas se
# funde en estas imágenes y toma la silueta de su alfa, así que el encuadre
# (margen para el bloque del CNC, tamaño de cada pieza) se decide acá y no en
# el código: la imagen ocupa la escena 4:3 de la tarjeta entera.
#
# Uso:
#   blender -b -P 3d/scripts/render-fabricacion.py -- <implantes-recorrido.glb> <carpeta_salida>
#       [--pieza femur|acetabulo]... [--rapido] [--set clave=valor]... [--sufijo nombre]
# --rapido: la mitad de resolución y pocas muestras, para ajustar pose y luz.
# --set: pisa un valor de PIEZAS para probar (p. ej. --set giro=150); --sufijo
# agrega un sufijo al archivo, para comparar pruebas lado a lado.
# Después, scripts/fabricacion-imagenes.mjs pasa los PNG a WebP (npm run fabricacion).

import math
import sys
from pathlib import Path

import bpy
from bpy_extras.object_utils import world_to_camera_view
from mathutils import Matrix, Vector

args = sys.argv[sys.argv.index('--') + 1:]
posicionales, piezas, ajustes, rapido, sufijo = [], [], {}, False, ''
while args:
    a = args.pop(0)
    if a == '--rapido':
        rapido = True
    elif a == '--pieza':
        piezas.append(args.pop(0))
    elif a == '--set':
        clave, valor = args.pop(0).split('=', 1)
        ajustes[clave] = float(valor)
    elif a == '--sufijo':
        sufijo = '-' + args.pop(0)
    else:
        posicionales.append(a)
modelo = Path(posicionales[0]).resolve()
salida = Path(posicionales[1]).resolve()
salida.mkdir(parents=True, exist_ok=True)

HDRI = Path(bpy.utils.resource_path('LOCAL')) / 'datafiles' / 'studiolights' / 'world' / 'studio.exr'

# Titanio del recorrido (components/recorrido-3d/escena.tsx): pulido de CNC y
# gris mate de impresión 3D.
TITANIO = {
    'pulido': {'color': (0.74, 0.77, 0.81, 1), 'rugosidad': 0.24, 'anisotropia': 0.5},
    'trabecular': {'color': (0.58, 0.60, 0.63, 1), 'rugosidad': 0.46, 'anisotropia': 0.0},
}

# Pose y encuadre de cada pieza. `arriba` es el eje de la pieza (en las
# coordenadas del cuerpo, Z arriba) que queda vertical; `giro` la gira sobre
# ese eje para la toma de tres cuartos; `elevacion` y `azimut` son la cámara;
# `llenado` es la fracción del alto (o del ancho, lo que limite) que ocupa la
# pieza en el cuadro 4:3; `desplaza` corre la pieza en el cuadro (fracción del
# ancho y del alto) para dejar aire donde hace falta.
PIEZAS = {
    'femur': {
        'malla': 'implante_femur',
        'acabado': 'pulido',
        'arriba': (0, 0, 1),
        'giro': 25,
        'elevacion': 8,
        'azimut': 0,
        'llenado': 0.86,
        'desplaza': (0, 0),
        # De pie sobre la punta del vástago la sombra se leía como un apoyo
        # imposible: la pieza flota, como en las fotos de producto
        'sombra': False,
        'tornillos': True,
    },
    'acetabulo': {
        'malla': 'implante_acetabulo',
        'acabado': 'trabecular',
        # El polo de la copa (-ACE_ABERTURA en implantes.py) apunta arriba
        'arriba': (0.62, 0.25, 0.70),
        # Con el ala (la lengüeta con dos agujeros) adelante a la derecha
        'giro': 120,
        'elevacion': 30,
        'azimut': 0,
        'llenado': 0.58,
        # Un poco a la izquierda y arriba del centro: aire para el ala a la
        # derecha y para la sombra abajo
        'desplaza': (-0.02, 0.04),
        'sombra': True,
        # Lado del plano de la sombra, en altos de la pieza
        'plano': 12,
        # Los tornillos del caso van dentro del hueso; la pieza sola va sin ellos
        'tornillos': False,
    },
}
if not piezas:
    piezas = list(PIEZAS)


def preparar_cycles(escena):
    escena.render.engine = 'CYCLES'
    prefs = bpy.context.preferences.addons['cycles'].preferences
    try:
        prefs.compute_device_type = 'METAL'
        prefs.get_devices()
        for d in prefs.devices:
            d.use = d.type == 'METAL'
        escena.cycles.device = 'GPU' if any(d.use for d in prefs.devices) else 'CPU'
    except Exception:  # sin Metal: CPU
        escena.cycles.device = 'CPU'
    escena.cycles.samples = 48 if rapido else 256
    escena.cycles.use_denoising = True
    escena.cycles.denoiser = 'OPENIMAGEDENOISE'
    escena.cycles.use_adaptive_sampling = True
    escena.cycles.transparent_max_bounces = 12
    escena.render.film_transparent = True
    escena.render.resolution_x = 800 if rapido else 1600
    escena.render.resolution_y = 600 if rapido else 1200
    escena.render.resolution_percentage = 100
    escena.render.image_settings.file_format = 'PNG'
    escena.render.image_settings.color_mode = 'RGBA'
    escena.render.image_settings.color_depth = '8'
    escena.view_settings.view_transform = 'AgX'
    escena.view_settings.look = 'AgX - Medium High Contrast'
    escena.view_settings.exposure = 0.0
    print(f'[fabricacion] Cycles en {escena.cycles.device}, {escena.cycles.samples} muestras')


def mundo(escena):
    w = bpy.data.worlds.new('estudio')
    w.use_nodes = True
    nodos = w.node_tree.nodes
    enlaces = w.node_tree.links
    fondo = nodos['Background']
    fondo.inputs['Strength'].default_value = 0.55
    if HDRI.exists():
        tex = nodos.new('ShaderNodeTexEnvironment')
        tex.image = bpy.data.images.load(str(HDRI))
        mapeo = nodos.new('ShaderNodeMapping')
        coord = nodos.new('ShaderNodeTexCoord')
        mapeo.inputs['Rotation'].default_value = (0, 0, math.radians(-60))
        enlaces.new(coord.outputs['Generated'], mapeo.inputs['Vector'])
        enlaces.new(mapeo.outputs['Vector'], tex.inputs['Vector'])
        enlaces.new(tex.outputs['Color'], fondo.inputs['Color'])
    else:
        fondo.inputs['Color'].default_value = (0.9, 0.9, 0.92, 1)
    escena.world = w


def luz(nombre, posicion, objetivo, tamano, energia, sombra=True):
    datos = bpy.data.lights.new(nombre, 'AREA')
    datos.use_shadow = sombra
    datos.shape = 'RECTANGLE'
    datos.size = tamano[0]
    datos.size_y = tamano[1]
    datos.energy = energia
    obj = bpy.data.objects.new(nombre, datos)
    bpy.context.scene.collection.objects.link(obj)
    obj.location = posicion
    obj.rotation_euler = (Vector(objetivo) - Vector(posicion)).to_track_quat('-Z', 'Y').to_euler()
    return obj


def material(acabado):
    t = TITANIO[acabado]
    m = bpy.data.materials.new(f'titanio_{acabado}')
    m.use_nodes = True
    nodos = m.node_tree.nodes
    bsdf = nodos['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = t['color']
    bsdf.inputs['Metallic'].default_value = 1.0
    bsdf.inputs['Roughness'].default_value = t['rugosidad']
    if t['anisotropia']:
        # Cepillado del torno: tangente radial alrededor del eje de la pieza
        bsdf.inputs['Anisotropic'].default_value = t['anisotropia']
        tangente = nodos.new('ShaderNodeTangent')
        tangente.direction_type = 'RADIAL'
        tangente.axis = 'Z'
        m.node_tree.links.new(tangente.outputs['Tangent'], bsdf.inputs['Tangent'])
    return m


def sin_tornillos(obj, polo):
    # Los tornillos del caso están unidos a la copa y hechos de muchos trozos
    # chicos (las roscas, de 10 lados), así que no se separan como partes
    # sueltas. Se ajusta una esfera a las medias esferas de la copa (las
    # componentes conexas grandes de la malla, que traen también el ala) y se
    # borran las componentes chicas (menos de 9 mm) que asoman fuera de la
    # copa (a más de 30 mm del centro) o que cuelgan por debajo del reborde
    # (hacia -polo): las roscas. Si quedaran trozos por debajo del reborde, la
    # copa no apoyaría en el plano de la sombra. Lo que queda de los
    # tornillos adentro de la copa no se ve desde la cúpula.
    import bmesh
    import numpy as np

    bm = bmesh.new()
    bm.from_mesh(obj.data)
    bm.verts.ensure_lookup_table()
    co = np.array([v.co[:] for v in bm.verts])
    vistos = set()
    componentes = []
    for v in bm.verts:
        if v.index in vistos:
            continue
        pila, comp = [v], []
        vistos.add(v.index)
        while pila:
            w = pila.pop()
            comp.append(w.index)
            for e in w.link_edges:
                o = e.other_vert(w)
                if o.index not in vistos:
                    vistos.add(o.index)
                    pila.append(o)
        componentes.append(comp)
    grandes = [i for comp in componentes if len(comp) > 500 for i in comp]
    p = co[grandes]
    # |v|^2 = 2 c·v + (r^2 - |c|^2): lineal en (c, k)
    A = np.hstack([2 * p, np.ones((len(p), 1))])
    sol = np.linalg.lstsq(A, (p ** 2).sum(1), rcond=None)[0]
    c = sol[:3]
    r = math.sqrt(sol[3] + c @ c)
    eje = np.array(Vector(polo).normalized())
    borrar = []
    for comp in componentes:
        if len(comp) > 500:
            continue
        pts = co[comp]
        tamano = (pts.max(0) - pts.min(0)).max()
        lejos = np.linalg.norm(pts - c, axis=1).max()
        abajo = ((pts - c) @ eje).min()
        if tamano < 0.009 and (lejos > 0.030 or abajo < -0.001):
            borrar.extend(comp)
    print(f'[fabricacion] copa: centro ({c[0]:.4f}, {c[1]:.4f}, {c[2]:.4f}), radio {r * 1000:.1f} mm; '
          f'{len(componentes)} componentes, {len(borrar)} vértices de roscas borrados')
    quitar = set(borrar)
    bmesh.ops.delete(bm, geom=[v for v in bm.verts if v.index in quitar], context='VERTS')
    bm.to_mesh(obj.data)
    bm.free()
    obj.data.update()
    return obj


def caja(obj):
    # Sobre los vértices y no sobre bound_box: después de borrar los
    # tornillos con bmesh, bound_box seguía incluyéndolos y la copa quedaba
    # 34 mm por encima del plano de la sombra
    import numpy as np

    co = np.empty(len(obj.data.vertices) * 3)
    obj.data.vertices.foreach_get('co', co)
    co = co.reshape(-1, 3)
    m = np.array(obj.matrix_world)
    mundo = co @ m[:3, :3].T + m[:3, 3]
    return Vector(mundo.min(0)), Vector(mundo.max(0))


def posar(obj, arriba, giro):
    # La pieza queda centrada en el origen, con `arriba` en +Z y girada `giro`
    # grados sobre ese eje; después se apoya sobre z = 0.
    rot = Vector(arriba).normalized().rotation_difference(Vector((0, 0, 1))).to_matrix().to_4x4()
    rot = Matrix.Rotation(math.radians(giro), 4, 'Z') @ rot
    minimo, maximo = caja(obj)
    centro = (minimo + maximo) / 2
    obj.matrix_world = rot @ Matrix.Translation(-centro)
    bpy.context.view_layer.update()
    minimo, maximo = caja(obj)
    obj.matrix_world = Matrix.Translation((-(minimo.x + maximo.x) / 2, -(minimo.y + maximo.y) / 2, -minimo.z)) @ obj.matrix_world
    bpy.context.view_layer.update()


def encuadrar(escena, camara, obj, elevacion, azimut, llenado, desplaza):
    minimo, maximo = caja(obj)
    centro = (minimo + maximo) / 2
    tamano = max(maximo - minimo)
    direccion = Vector((
        math.sin(math.radians(azimut)) * math.cos(math.radians(elevacion)),
        -math.cos(math.radians(azimut)) * math.cos(math.radians(elevacion)),
        math.sin(math.radians(elevacion)),
    ))
    distancia = tamano * 4
    esquinas = [Vector((x, y, z)) for x in (minimo.x, maximo.x) for y in (minimo.y, maximo.y) for z in (minimo.z, maximo.z)]
    for _ in range(4):
        camara.location = centro + direccion * distancia
        camara.rotation_euler = (centro - camara.location).to_track_quat('-Z', 'Y').to_euler()
        bpy.context.view_layer.update()
        proy = [world_to_camera_view(escena, camara, p) for p in esquinas]
        ancho = max(p.x for p in proy) - min(p.x for p in proy)
        alto = max(p.y for p in proy) - min(p.y for p in proy)
        # La fracción que ocupa hoy en el eje que limita, contra la pedida
        distancia *= max(ancho, alto) / llenado
    camara.location = centro + direccion * distancia
    camara.rotation_euler = (centro - camara.location).to_track_quat('-Z', 'Y').to_euler()
    camara.data.shift_x = -desplaza[0]
    camara.data.shift_y = -desplaza[1]
    bpy.context.view_layer.update()
    return distancia


def render(nombre, cfg):
    bpy.ops.wm.read_factory_settings(use_empty=True)
    escena = bpy.context.scene
    preparar_cycles(escena)
    mundo(escena)
    bpy.ops.import_scene.gltf(filepath=str(modelo))
    pieza = None
    for o in list(escena.objects):
        if o.type == 'MESH' and o.name == cfg['malla']:
            pieza = o
        else:
            bpy.data.objects.remove(o, do_unlink=True)
    if pieza is None:
        raise SystemExit(f'[fabricacion] no está la malla {cfg["malla"]} en {modelo.name}')
    if not cfg['tornillos']:
        pieza = sin_tornillos(pieza, cfg['arriba'])
    pieza.data.materials.clear()
    pieza.data.materials.append(material(cfg['acabado']))
    posar(pieza, cfg['arriba'], cfg['giro'])
    minimo, maximo = caja(pieza)
    print(f'[fabricacion] {nombre}: {(maximo.x - minimo.x) * 1000:.0f} × {(maximo.y - minimo.y) * 1000:.0f} × '
          f'{(maximo.z - minimo.z) * 1000:.0f} mm, apoyada en z = {minimo.z * 1000:.1f}')
    alto = maximo.z - minimo.z
    centro = (minimo + maximo) / 2

    # Cámara: 85 mm, perspectiva
    datos = bpy.data.cameras.new('camara')
    datos.lens = 85
    datos.sensor_width = 36
    camara = bpy.data.objects.new('camara', datos)
    escena.collection.objects.link(camara)
    escena.camera = camara
    distancia = encuadrar(escena, camara, pieza, cfg['elevacion'], cfg['azimut'], cfg['llenado'], cfg['desplaza'])
    datos.clip_end = distancia * 4

    # Estudio: principal arriba a la izquierda, casi cenital y no muy grande,
    # la única que proyecta sombra (queda junto a la pieza, como sombra de
    # contacto, sin extenderse por el cuadro); relleno a la derecha y
    # contraluz atrás y arriba para el canto de la pieza, sin sombra
    escala = alto
    luz('principal', (-0.7 * escala, -0.5 * escala, 2.8 * escala), centro, (1.3 * escala, 1.3 * escala), 60 * escala**2)
    luz('relleno', (2.0 * escala, -1.6 * escala, 0.8 * escala), centro, (2.6 * escala, 2.6 * escala), 18 * escala**2, sombra=False)
    luz('contraluz', (0.8 * escala, 1.8 * escala, 1.6 * escala), centro, (1.2 * escala, 2.4 * escala), 26 * escala**2, sombra=False)

    if cfg['sombra']:
        # Mucho más grande que el cuadro: el borde del plano se veía como un
        # escalón del velo que deja el plano (fabricacion-imagenes.mjs lo resta)
        bpy.ops.mesh.primitive_plane_add(size=alto * cfg.get('plano', 12), location=(0, 0, 0))
        piso = bpy.context.active_object
        piso.name = 'piso'
        piso.is_shadow_catcher = True
        piso.visible_camera = True

    ruta = salida / f'{nombre}{sufijo}.png'
    escena.render.filepath = str(ruta)
    bpy.ops.render.render(write_still=True)
    print(f'[fabricacion] {ruta} ({escena.render.resolution_x}x{escena.render.resolution_y})')


for nombre in piezas:
    if nombre not in PIEZAS:
        raise SystemExit(f'[fabricacion] pieza desconocida: {nombre} (hay {", ".join(PIEZAS)})')
    render(nombre, {**PIEZAS[nombre], **ajustes})
