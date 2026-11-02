'use client'

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import {
  Environment,
  Lightformer,
  MeshTransmissionMaterial,
  PerformanceMonitor,
  useGLTF,
} from '@react-three/drei'
import {
  AdditiveBlending,
  BackSide,
  Box3,
  Color,
  DoubleSide,
  FrontSide,
  ShaderMaterial,
  Euler,
  MathUtils,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Vector3,
  type BufferGeometry,
  type Camera,
  type Group,
  type Mesh,
  type MeshPhysicalMaterial,
  type Object3D,
  type PerspectiveCamera,
  type Texture,
} from 'three'
import { Bone, useGlassBuffer, type Quality } from './materiales'
import {
  ALTO_HERO,
  ANCHO_CELULAR,
  GIRO_ENTRADA,
  GIRO_PERFIL,
  ORDEN_PARADAS,
  SEGUNDOS_ENTRADA,
  SUBIDA_ENTRADA,
  camaraPara,
  deslizHero,
  giroVaiven,
  opacidadBase,
  pesoHero,
  pesoMaxilar,
  pesoTarjeta,
  segCuerpo,
} from './camara'
import {
  CORTE_HUESO,
  CORTE_PIEL,
  ESPESOR_HERO_MUNDO,
  HUESOS_BUSTO,
  OPACIDAD_HUESO_HERO,
  TITANIO_HERO,
  VIDRIO_HERO,
  VIDRIO_RECORRIDO,
  aplicarCorte,
  pintarDegrade,
  uniformesCorte,
  useTexturaDegrade,
} from './aspecto-hero'
import { estadoRecorrido } from './estado'
import { CUERPO, IMPLANTES, IMPLANTES_GLB, esPiel, type Implante } from './implantes'
import { Miniaturas, useArchivosImplantes } from './miniaturas'
import { useIntroPhase } from '../intro'

// Escena 3D única de la home: el cuerpo de vidrio entero, del hero al cierre
// del recorrido, en un solo canvas (la escena fija de tour-scroll.tsx). La
// cámara sale del progreso del scroll (camara.ts, el guion del borrador) y no
// se mueve sola salvo en la toma del hero (entrada girando y vaivén): el
// canvas dibuja solo cuando hace falta (frameloop "demand").
//
// Toma 0, el hero (HERO en camara.ts), con el aspecto del busto de vidrio de
// antes (aspecto-hero.ts): su vidrio, su titanio dentro del vidrio, el hueso
// del busto, el corte bajo el cuello y el degradé de fondo. Con el scroll,
// ese aspecto pasa al de las paradas con el peso del hero (pesoHero)
// mientras la cámara va a la craneoplastía.

// Lo que se ve en el hero (CUERPO.hero) y la craneoplastía se piden al
// cargar el módulo; el resto del cuerpo y los otros cinco implantes, cuando
// terminó la entrada de la home (Escena).
useGLTF.preload(CUERPO.hero, false, true)
useGLTF.preload(IMPLANTES_GLB, false, true)

// Recorte del hero: mientras se ve
// la toma del hero entera (peso del hero 1), la escena dibuja solo en la caja
// del busto de hoy, aunque el canvas ocupe la pantalla entera. Lo calcula la
// cámara en cada cuadro (origen de WebGL, píxeles CSS); null: canvas entero.
const recorteHero: { current: readonly [number, number, number, number] | null } = { current: null }

// Peso del aspecto del hero en este cuadro, según el progreso
function pesoHeroActual() {
  const { seg, celular, reducido } = estadoRecorrido
  return pesoHero(segCuerpo(seg, celular && !reducido), reducido)
}

// Corte por altura: en la toma del hero, la piel y el hueso a 1,22 m,
// rectos y debajo de la pantalla; con el scroll bajan hasta debajo de los pies, con una
// banda cada vez más ancha.
const corteDe = (corte: number, h: number) => MathUtils.lerp(-0.4, corte, h)
const bandaDe = (h: number) => MathUtils.lerp(0.4, 0.004, h)

const FOV = 30
// Celular (< 768 px, la maqueta del hero de antes): el degradé del hero se
// estira al alto que tenía la sección (140,2 % de la pantalla)
const ANCHO_DEGRADE_ALTO = 768
const TRAMO_DEGRADE_CELULAR = [0, 1 / 1.402] as const
// Hueso un poco más tenue que en el busto: con el cuerpo entero hay mucho
// más esqueleto a la vista y competía con los implantes.
const OPACIDAD_HUESO = 0.34

// Brillo del implante activo: un azul de la marca, claro, sumado al metal,
// bajo para que la pieza se siga leyendo como titanio.
const BRILLO = new Color('#a9cdf5')
const INTENSIDAD_BRILLO = 0.2

// Barrido del implante activo (reemplaza al anillo y al resplandor del
// borrador): al llegar a su parada, un plano de luz horizontal baja por la
// pieza una sola vez, como un corte de tomografía, y la retícula de HTML
// (.recorrido-reticula) se cierra sobre ella con la misma línea. Después
// queda quieto un borde de luz suave en el contorno del titanio.
// La línea y el borde van mezclados sobre el color final y no sumados como
// emisión: el titanio pulido ya está casi blanco y la luz sumada no se veía.
// Lo que el corte todavía no pasó queda atenuado hacia el azul del hueso.
const LUZ_BARRIDO = new Color('#5fa2ff')
const TINTA_PENDIENTE = new Color('#2260a1')
const DURACION_BARRIDO = 1500 // ms
const ANCHO_BARRIDO = 0.004 // m: medio ancho de la línea de luz
const MEZCLA_LINEA = 0.9
const MEZCLA_PENDIENTE = 0.55
const MEZCLA_BORDE = 0.4
const MARGEN_RETICULA = 16 // px alrededor de la caja del implante en pantalla
const CIERRE_RETICULA = 560 // ms
const BORDE_RETICULA = 8 // px: distancia mínima a los bordes de la pantalla
const TECHO_RETICULA = 76 // px: debajo del header

// Capas: los implantes (1) y el borde de luz del vidrio (2)
// se dibujan en pasadas propias, después de la escena (ver Pasadas).
const CAPA_IMPLANTES = 1
const CAPA_BORDE = 2

function mallasDe(root: Object3D) {
  const mallas: Mesh[] = []
  root.traverse((nodo) => {
    if ((nodo as Mesh).isMesh) mallas.push(nodo as Mesh)
  })
  return mallas
}

// Vidrio del cuerpo en las paradas: el del busto, más claro y con más
// profundidad (VIDRIO_RECORRIDO en aspecto-hero.ts; en la toma del hero,
// Cuerpo lo lleva a VIDRIO_HERO). El cuerpo entero se ve más chico: con el
// tono del busto quedaba azul sobre azul, sin contraste. Más claro en los
// bordes finos y más azul donde es grueso.
const MUESTRAS: Record<Quality, number> = { alta: 10, media: 4, baja: 3 }

function Vidrio({ calidad, buffer, alCrear }: {
  calidad: Quality
  buffer: Texture
  alCrear: (material: MeshPhysicalMaterial | null) => void
}) {
  return (
    <MeshTransmissionMaterial
      ref={(m) => alCrear(m as unknown as MeshPhysicalMaterial | null)}
      // Transparente mientras el corte por altura se funde (Cuerpo lo cambia
      // cuadro a cuadro)
      transparent
      buffer={buffer}
      // Con `buffer`, los buffers propios de drei no se usan: de 1 px, así
      // los tres trozos de la piel no reservan seis del tamaño del canvas
      resolution={1}
      backsideResolution={1}
      samples={MUESTRAS[calidad]}
      thickness={0.06}
      roughness={0.05}
      ior={1.28}
      chromaticAberration={0}
      anisotropicBlur={0.1}
      color="#eaf3fd"
      attenuationColor="#3f86d6"
      attenuationDistance={0.22}
      clearcoat={1}
      clearcoatRoughness={0.08}
      envMapIntensity={1.4}
    />
  )
}

// Borde de luz (fresnel): un brillo blanco donde la superficie se pone de
// canto, como el contraluz de la referencia de vidrio. Se suma encima del
// vidrio, en su propia pasada.
function materialBorde() {
  return new ShaderMaterial({
    uniforms: {
      uColor: { value: new Color('#ffffff') },
      uTinte: { value: new Color('#9fc8f5') },
      uFuerza: { value: 0.85 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vVista;
      void main() {
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vNormal = normalize(normalMatrix * normal);
        vVista = normalize(-mv.xyz);
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform vec3 uTinte;
      uniform float uFuerza;
      varying vec3 vNormal;
      varying vec3 vVista;
      void main() {
        float f = 1.0 - abs(dot(normalize(vNormal), normalize(vVista)));
        float borde = pow(f, 3.2);
        float halo = pow(f, 1.4) * 0.18;
        vec3 color = uColor * borde + uTinte * halo;
        gl_FragColor = vec4(color * uFuerza, 1.0);
      }
    `,
    blending: AdditiveBlending,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    side: FrontSide,
  })
}

type PropsCuerpo = {
  calidad: Quality
  fondo: Texture
}

// El cuerpo sale de dos archivos (CUERPO en implantes.ts): el hero carga solo
// el suyo; el recorrido, los dos. Cada uno con su useGLTF (la caché es por
// archivo: pedirlos como lista los volvía a descargar).
function CuerpoHero(props: PropsCuerpo) {
  const hero = useGLTF(CUERPO.hero, false, true)
  const escenas = useMemo(() => [hero.scene], [hero.scene])
  return <Cuerpo {...props} escenas={escenas} />
}

function CuerpoEntero(props: PropsCuerpo) {
  const hero = useGLTF(CUERPO.hero, false, true)
  const resto = useGLTF(CUERPO.resto, false, true)
  const escenas = useMemo(() => [hero.scene, resto.scene], [hero.scene, resto.scene])
  return <Cuerpo {...props} escenas={escenas} />
}

function Cuerpo({ calidad, fondo, escenas }: PropsCuerpo & { escenas: Object3D[] }) {
  const { pieles, huesosCuerpo, topes } = useMemo(() => {
    const mallas = escenas.flatMap(mallasDe)
    const pieles = mallas.filter((m) => esPiel(m.name))
    // Altura del punto más alto de cada trozo de piel, en el mundo: debajo
    // del corte, el trozo entero se oculta
    const topes = new Map(pieles.map((m) => [m.name, new Box3().setFromObject(m).max.y]))
    return { pieles, huesosCuerpo: mallas.filter((m) => !esPiel(m.name)), topes }
  }, [escenas])
  // El buffer del vidrio oculta la piel entera (el grupo de sus trozos); en
  // la toma del hero, solo en la caja del busto
  const [piel, buffer] = useGlassBuffer<Group>(fondo, recorteHero)
  const borde = useMemo(() => materialBorde(), [])
  useEffect(() => () => borde.dispose(), [borde])
  // Los trozos de la piel comparten el nodo (la escala de la cuantización)
  const escalaPiel = pieles[0]?.scale.x ?? 1

  // El vidrio, el hueso, el borde y el corte pasan del aspecto del busto al
  // del recorrido con el peso del hero.
  const vidrios = useRef(new Map<string, MeshPhysicalMaterial>())
  const trozos = useRef(new Map<string, Mesh>())
  const bordes = useRef(new Map<string, Mesh>())
  const huesos = useRef(new Map<string, Mesh>())
  const cortes = useRef({ piel: uniformesCorte(CORTE_PIEL), hueso: uniformesCorte(CORTE_HUESO) })
  useFrame(() => {
    const h = pesoHeroActual()
    const corte = cortes.current
    corte.piel.corteY.value = corteDe(CORTE_PIEL, h)
    corte.hueso.corteY.value = corteDe(CORTE_HUESO, h)
    corte.piel.corteBanda.value = corte.hueso.corteBanda.value = bandaDe(h)
    // Lo que el corte descarta entero no se dibuja (en el hero, solo queda
    // piel_cabeza: los mismos triángulos que el busto)
    const visible = (nombre: string) => (topes.get(nombre) ?? Infinity) > corte.piel.corteY.value
    for (const [nombre, m] of trozos.current) m.visible = visible(nombre)
    for (const v of vidrios.current.values()) {
      aplicarCorte(v, corte.piel)
      // Opaco con el aspecto del hero entero, como el busto (la banda del
      // corte mide 4 mm y no necesita fundirse); transparente solo mientras
      // el corte baja. Con el corte ya debajo de los pies (h = 0, desde la
      // craneoplastía) vuelve a ser opaco, como el vidrio del recorrido
      // original: transparente, el esqueleto se dibujaba entero debajo del
      // vidrio en cada cuadro (el vidrio lo tapa igual; opaco, la prueba de
      // profundidad lo descarta) y el recorrido de escritorio caía a 52 fps
      const transparente = h > 0.001 && h < 0.999
      if (v.transparent !== transparente) {
        v.transparent = transparente
        v.needsUpdate = true
      }
      const a = VIDRIO_RECORRIDO
      const b = VIDRIO_HERO
      // Propiedades del vidrio de drei (uniformes con getters y setters)
      const m = v as MeshPhysicalMaterial & { thickness: number; attenuationDistance: number }
      m.thickness = MathUtils.lerp(a.thickness, ESPESOR_HERO_MUNDO / escalaPiel, h)
      m.roughness = MathUtils.lerp(a.roughness, b.roughness, h)
      m.ior = MathUtils.lerp(a.ior, b.ior, h)
      m.color.lerpColors(a.color, b.color, h)
      m.attenuationColor.lerpColors(a.attenuationColor, b.attenuationColor, h)
      m.attenuationDistance = MathUtils.lerp(a.attenuationDistance, b.attenuationDistance, h)
      m.clearcoatRoughness = MathUtils.lerp(a.clearcoatRoughness, b.clearcoatRoughness, h)
      m.envMapIntensity = MathUtils.lerp(a.envMapIntensity, b.envMapIntensity, h)
    }
    const opacidad = MathUtils.lerp(OPACIDAD_HUESO, OPACIDAD_HUESO_HERO, h)
    // Maxilar: entero hasta acercarse a su parada, después el recortado
    const m = pesoMaxilar(estadoRecorrido.seg, estadoRecorrido.reducido)
    for (const [nombre, malla] of huesos.current) {
      const material = malla.material as MeshPhysicalMaterial
      // Las vértebras del busto van enteras, sin corte
      if (nombre !== 'hueso_columna_alta') aplicarCorte(material, corte.hueso)
      const peso =
        nombre === 'hueso_maxilar_entero'
          ? 1 - m
          : nombre === 'hueso_maxilar'
            ? (1 - h) * m
            : HUESOS_BUSTO.has(nombre)
              ? 1
              : 1 - h
      material.opacity = opacidad * peso
      malla.visible = material.opacity > 0.002
    }
    for (const [nombre, mb] of bordes.current) {
      // El material del borde es uno solo, compartido por los trozos
      const materialBorde = mb.material as ShaderMaterial
      aplicarCorte(materialBorde, corte.piel)
      const fuerza = materialBorde.uniforms.uFuerza
      if (fuerza) fuerza.value = 0.85 * (1 - h)
      mb.visible = h < 0.999 && visible(nombre)
    }
  }, -1)

  return (
    <group>
      {huesosCuerpo.map((malla) => (
        <mesh
          key={malla.uuid}
          ref={(m: Mesh | null) => {
            if (m) huesos.current.set(malla.name, m)
            else huesos.current.delete(malla.name)
          }}
          name={malla.name}
          geometry={malla.geometry}
          position={malla.position}
          quaternion={malla.quaternion}
          scale={malla.scale}
        >
          <Bone opacity={OPACIDAD_HUESO} />
        </mesh>
      ))}
      <group ref={piel}>
        {pieles.map((malla) => (
          <mesh
            key={malla.uuid}
            ref={(m: Mesh | null) => {
            if (m) trozos.current.set(malla.name, m)
            else trozos.current.delete(malla.name)
          }}
            name={malla.name}
            geometry={malla.geometry}
            position={malla.position}
            quaternion={malla.quaternion}
            scale={malla.scale}
            // El vidrio se dibuja sobre el hueso
            renderOrder={1}
          >
            <Vidrio
              calidad={calidad}
              buffer={buffer}
              alCrear={(m) => {
                if (m) vidrios.current.set(malla.name, m)
                else vidrios.current.delete(malla.name)
              }}
            />
          </mesh>
        ))}
      </group>
      {pieles.map((malla) => (
        <mesh
          key={malla.uuid}
          ref={(m: Mesh | null) => {
            if (m) bordes.current.set(malla.name, m)
            else bordes.current.delete(malla.name)
          }}
          geometry={malla.geometry}
          position={malla.position}
          quaternion={malla.quaternion}
          scale={malla.scale}
          material={borde}
          layers={CAPA_BORDE}
        />
      ))}
    </group>
  )
}

// La craneoplastía con el titanio del busto, en la capa del
// vidrio (0), así que se ve refractada a través de él como en el hero. Le
// cede el lugar a la de la capa de implantes en un cruce corto (peso del hero
// de 0,56 a 0,44, unos 2 % de pantalla de scroll): la refracción las corre y,
// con un fundido largo, se veían dos craneoplastías desalineadas.
const cruceCraneo = (h: number) => MathUtils.smoothstep(h, 0.44, 0.56)

function CraneoHero() {
  const archivo = useGLTF(IMPLANTES_GLB, false, true)
  const malla = useMemo(
    () => mallasDe(archivo.scene).find((m) => m.name === 'implante_craneoplastia'),
    [archivo.scene],
  )
  const material = useMemo(
    () => new MeshStandardMaterial({ ...TITANIO_HERO, transparent: true }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])
  const ref = useRef<Mesh>(null)
  useFrame(() => {
    const m = ref.current
    if (!m) return
    const a = cruceCraneo(pesoHeroActual())
    ;(m.material as MeshStandardMaterial).opacity = a
    m.visible = a > 0.001
  }, -1)
  if (!malla) return null
  return (
    <mesh
      ref={ref}
      geometry={malla.geometry}
      position={malla.position}
      quaternion={malla.quaternion}
      scale={malla.scale}
      material={material}
    />
  )
}

// Geometría y transformación de cada implante, según su fuente
// (implantes.ts). Las de .glb salen del archivo, con la transformación del
// nodo multiplicada por la de la entrada.
type PiezaLista = {
  implante: Implante
  geometria: BufferGeometry
  matriz: Matrix4
  centro: Vector3
  radio: number
  // Caja en el cuerpo: la que encierra la retícula y la altura del barrido
  caja: Box3
}

function matrizDe(implante: Implante) {
  return new Matrix4().compose(
    new Vector3(...implante.posicion),
    new Quaternion().setFromEuler(new Euler(...implante.rotacion)),
    new Vector3(implante.escala, implante.escala, implante.escala),
  )
}

function usePiezas(): PiezaLista[] {
  const archivos = useArchivosImplantes()
  const piezas = useMemo(() => {
    return IMPLANTES.map((implante) => {
      const matriz = matrizDe(implante)
      const fuente = implante.fuente
      let geometria: BufferGeometry
      let propia = true
      if (fuente.tipo === 'primitiva') {
        geometria = fuente.crear()
      } else {
        const archivo = archivos.get(fuente.url)
        const malla = archivo ? mallasDe(archivo.scene).find((m) => m.name === fuente.malla) : undefined
        if (!malla) throw new Error(`Falta la malla ${fuente.malla} en ${fuente.url}`)
        malla.updateWorldMatrix(true, false)
        matriz.multiply(malla.matrixWorld)
        geometria = malla.geometry
        propia = false
      }
      // Centro y radio en el cuerpo: cuánto se apagan los implantes vecinos
      // al activo
      if (!geometria.boundingSphere) geometria.computeBoundingSphere()
      if (!geometria.boundingBox) geometria.computeBoundingBox()
      const esfera = geometria.boundingSphere
      const centro = (esfera?.center.clone() ?? new Vector3()).applyMatrix4(matriz)
      const radio = (esfera?.radius ?? 0.02) * matriz.getMaxScaleOnAxis()
      const caja = (geometria.boundingBox?.clone() ?? new Box3()).applyMatrix4(matriz)
      return { implante, geometria, matriz, propia, centro, radio, caja }
    })
  }, [archivos])
  // Las primitivas se crean acá: se liberan al desmontar
  useEffect(
    () => () => {
      for (const p of piezas) if (p.propia) p.geometria.dispose()
    },
    [piezas],
  )
  return piezas
}

// Luz propia del titanio: la línea del barrido (a la altura uBarridoY del
// cuerpo, con fuerza uBarrido, de 0 a 1), la parte de la pieza que todavía
// no pasó y el borde de luz del contorno (uBorde), mezclados sobre el color
// que sale de la iluminación del material estándar.
type UniformesLuz = {
  uBarridoY: { value: number }
  uBarrido: { value: number }
  uBorde: { value: number }
  uLuz: { value: Color }
  uPendiente: { value: Color }
}

function conLuz(material: MeshStandardMaterial): UniformesLuz {
  const uniformes = {
    uBarridoY: { value: 0 },
    uBarrido: { value: 0 },
    uBorde: { value: 0 },
    uLuz: { value: LUZ_BARRIDO },
    uPendiente: { value: TINTA_PENDIENTE },
  }
  material.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, uniformes)
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', '#include <common>\nvarying float vAltura;')
      .replace(
        '#include <begin_vertex>',
        '#include <begin_vertex>\nvAltura = (modelMatrix * vec4(transformed, 1.0)).y;',
      )
    shader.fragmentShader = shader.fragmentShader
      .replace(
        '#include <common>',
        /* glsl */ `#include <common>
        varying float vAltura;
        uniform float uBarridoY;
        uniform float uBarrido;
        uniform float uBorde;
        uniform vec3 uLuz;
        uniform vec3 uPendiente;`,
      )
      .replace(
        '#include <opaque_fragment>',
        /* glsl */ `{
          float d = (vAltura - uBarridoY) / ${ANCHO_BARRIDO.toFixed(4)};
          float linea = exp(-d * d) * uBarrido;
          float pendiente = (1.0 - smoothstep(-1.5, 0.0, d)) * uBarrido;
          float canto = 1.0 - abs(dot(normal, normalize(vViewPosition)));
          outgoingLight = mix(outgoingLight, uPendiente * 0.6, pendiente * ${MEZCLA_PENDIENTE.toFixed(2)});
          outgoingLight = mix(outgoingLight, uLuz, pow(canto, 3.0) * uBorde * ${MEZCLA_BORDE.toFixed(2)});
          outgoingLight = mix(outgoingLight, uLuz * 1.6, linea * ${MEZCLA_LINEA.toFixed(2)});
        }
        #include <opaque_fragment>`,
      )
  }
  return uniformes
}

const esquina = new Vector3()

// Retícula (HTML encima del canvas): la caja del implante activo en
// pantalla, más un margen, con la línea del barrido a la altura de la
// banda de luz
function escribirReticula(
  el: HTMLElement,
  pieza: PiezaLista | undefined,
  luz: UniformesLuz | undefined,
  peso: number,
  llegada: boolean,
  camara: Camera,
  { width: W, height: H }: { width: number; height: number },
) {
  if (!pieza || !luz) {
    el.style.setProperty('--ret-o', '0')
    return
  }
  const { min, max } = pieza.caja
  let x0 = Infinity
  let y0 = Infinity
  let x1 = -Infinity
  let y1 = -Infinity
  for (let k = 0; k < 8; k++) {
    esquina
      .set(k & 1 ? max.x : min.x, k & 2 ? max.y : min.y, k & 4 ? max.z : min.z)
      .project(camara)
    const x = ((esquina.x + 1) / 2) * W
    const y = ((1 - esquina.y) / 2) * H
    x0 = Math.min(x0, x)
    x1 = Math.max(x1, x)
    y0 = Math.min(y0, y)
    y1 = Math.max(y1, y)
  }
  // Con el margen y dentro de lo visible (debajo del header): en el celular
  // el clavo del intercalar sale por arriba y quedaban dos esquinas afuera
  x0 = Math.max(x0 - MARGEN_RETICULA, BORDE_RETICULA)
  y0 = Math.max(y0 - MARGEN_RETICULA, TECHO_RETICULA)
  x1 = Math.min(x1 + MARGEN_RETICULA, W - BORDE_RETICULA)
  y1 = Math.min(y1 + MARGEN_RETICULA, H - BORDE_RETICULA)
  esquina.set(pieza.centro.x, luz.uBarridoY.value, pieza.centro.z).project(camara)
  const yBarrido = ((1 - esquina.y) / 2) * H
  const s = el.style
  s.setProperty('--ret-x', `${x0.toFixed(1)}px`)
  s.setProperty('--ret-y', `${y0.toFixed(1)}px`)
  s.setProperty('--ret-w', `${(x1 - x0).toFixed(1)}px`)
  s.setProperty('--ret-h', `${(y1 - y0).toFixed(1)}px`)
  s.setProperty('--ret-o', peso.toFixed(3))
  s.setProperty('--ret-barrido', `${(yBarrido - y0).toFixed(1)}px`)
  s.setProperty(
    '--ret-barrido-o',
    (luz.uBarrido.value / Math.max(peso, 0.001)).toFixed(3),
  )
  // Al llegar a la parada, las esquinas se cierran sobre la pieza (una vez)
  const marco = el.firstElementChild
  if (llegada && !estadoRecorrido.reducido && marco) {
    marco.animate(
      [
        { transform: 'scale(1.22)', opacity: 0 },
        { transform: 'scale(1)', opacity: 1 },
      ],
      { duration: CIERRE_RETICULA, easing: 'cubic-bezier(0.2, 0.8, 0.2, 1)' },
    )
  }
}

function Implantes() {
  const piezas = usePiezas()
  const invalidate = useThree((s) => s.invalidate)
  // Un material por pieza: la opacidad y el brillo cambian con el recorrido.
  // Titanio de impresión 3D gris y mate (el del busto) y de CNC, pulido.
  // Cada material nace con sus uniformes de luz (en el mismo useMemo: si no,
  // el doble llamado del modo estricto deja el shader con otros uniformes).
  const materialesYLuces = useMemo(
    () =>
      piezas.map(({ implante }) => {
        const material = new MeshStandardMaterial({
          color: implante.acabado === 'pulido' ? '#e6e9ee' : '#c4cad2',
          // Un poco menos que metal puro: así toma también la luz propia de
          // los implantes (LuzImplantes) y no queda gris oscuro donde el
          // estudio no le da reflejo
          metalness: implante.acabado === 'pulido' ? 0.94 : 0.88,
          roughness: implante.acabado === 'pulido' ? 0.12 : 0.3,
          // Más reflejo del estudio que en el busto: chicos y sobre el
          // vidrio, con el reflejo del busto se veían gris oscuro y planos.
          envMapIntensity: 3.2,
          emissive: BRILLO,
          emissiveIntensity: 0,
          transparent: true,
          side: DoubleSide,
        })
        return { material, luz: conLuz(material) }
      }),
    [piezas],
  )
  const materiales = materialesYLuces.map((m) => m.material)
  const luces = materialesYLuces.map((m) => m.luz)
  useEffect(
    () => () => materialesYLuces.forEach(({ material }) => material.dispose()),
    [materialesYLuces],
  )

  const mallas = useRef<(Mesh | null)[]>([])
  // Barrido de cada pieza: arranca cuando su tarjeta pasa de 0,8 (casi
  // llegando a la parada) y se rearma cuando la tarjeta se va
  const barridos = useRef(piezas.map(() => ({ armado: true, inicio: -Infinity })))
  const reticula = useRef<HTMLElement | null>(null)

  useFrame(({ camera, size }) => {
    const { seg, reducido } = estadoRecorrido
    const ahora = performance.now()
    const base = opacidadBase(seg, reducido)
    // En la toma del hero no hay implantes encima del vidrio
    const h = pesoHeroActual()
    const visibles = 1 - h
    const visibleCraneo = 1 - cruceCraneo(h)
    const pesos = piezas.map(({ implante }) =>
      pesoTarjeta(seg, ORDEN_PARADAS.indexOf(implante.parada), reducido),
    )
    // La pieza activa: la de la tarjeta con más peso
    let activa = -1
    let pesoActiva = 0.05
    let llegada = false
    let barriendo = false
    piezas.forEach((pieza, i) => {
      const material = materiales[i]
      const luz = luces[i]
      const w = pesos[i] ?? 0
      if (!material || !luz) return
      // Los inactivos cercanos al activo se apagan más, para que no lo
      // tapen (en el acetábulo, el clavo del intercalar y la endoprótesis)
      let apagado = 1
      piezas.forEach((otra, j) => {
        const wj = pesos[j] ?? 0
        if (j === i || wj <= 0) return
        const distancia = Math.max(0, pieza.centro.distanceTo(otra.centro) - pieza.radio)
        const cercania = MathUtils.clamp(distancia / 0.2, 0.25, 1)
        apagado = Math.min(apagado, MathUtils.lerp(1, cercania, wj))
      })
      // El implante maxilar entra con el hueso recortado
      const maxilar = pieza.implante.parada === 'maxilar' ? pesoMaxilar(seg, reducido) : 1
      const enVista = pieza.implante.parada === 'craneo' ? visibleCraneo : visibles
      const presente = w * enVista * maxilar
      material.opacity = Math.max(base * apagado, w) * enVista * maxilar
      material.emissiveIntensity = INTENSIDAD_BRILLO * w * maxilar
      material.depthWrite = material.opacity > 0.9
      const malla = mallas.current[i]
      if (malla) malla.visible = material.opacity > 0.002

      const barrido = barridos.current[i]
      if (barrido) {
        if (w > 0.8 && barrido.armado) {
          barrido.armado = false
          barrido.inicio = ahora
          llegada = true
        } else if (w < 0.1) {
          barrido.armado = true
        }
        // Avance (0 a 1) con entrada y salida suaves; la fuerza sube y baja
        // en los extremos para que la banda no aparezca ni corte de golpe
        // (acotado: una pieza que nunca barrió tiene inicio -Infinity, y un
        // infinito en el shader da NaN y la pinta de negro)
        const t = reducido ? 1 : MathUtils.clamp((ahora - barrido.inicio) / DURACION_BARRIDO, 0, 1)
        const corriendo = t < 1
        if (corriendo) barriendo = true
        const avance = t * t * (3 - 2 * t)
        const margen = ANCHO_BARRIDO * 2
        luz.uBarridoY.value = MathUtils.lerp(pieza.caja.max.y + margen, pieza.caja.min.y - margen, avance)
        luz.uBarrido.value = corriendo
          ? Math.min(1, t / 0.12, (1 - t) / 0.12) * presente
          : 0
      }
      luz.uBorde.value = presente
      if (presente > pesoActiva) {
        pesoActiva = presente
        activa = i
      }
    })
    if (barriendo) invalidate()
    const escena = estadoRecorrido.escena
    if (!escena) return
    if (!reticula.current || !escena.contains(reticula.current)) {
      reticula.current = escena.querySelector<HTMLElement>('.recorrido-reticula')
    }
    if (!reticula.current) return
    escribirReticula(reticula.current, piezas[activa], luces[activa], pesoActiva, llegada, camera, size)
  })

  return (
    <group>
      {piezas.map(({ implante, geometria, matriz }, i) => (
        <mesh
          key={implante.parada}
          ref={(m) => {
            mallas.current[i] = m
          }}
          name={`implante_${implante.parada}`}
          geometry={geometria}
          matrix={matriz}
          matrixAutoUpdate={false}
          material={materiales[i]}
          layers={CAPA_IMPLANTES}
        />
      ))}
    </group>
  )
}

// Pasadas: la escena (vidrio y hueso); encima, el borde de luz del vidrio;
// y al final los implantes con la profundidad limpia. Los implantes no se ven
// a través del vidrio sino encima: no entran en el buffer que refracta la
// piel. Refractados y teñidos por el vidrio, el titanio se veía azul oscuro y
// sin brillo; así se lee como metal y el implante es lo más nítido de la
// escena. El hueso queda adentro del vidrio, tenue, como en el busto del hero.
function Pasadas() {
  useFrame(({ gl, scene, camera, size }) => {
    // Las miniaturas (miniaturas.tsx) dibujan después, cada una recortada a
    // su lugar: el cuadro arranca con el canvas entero
    gl.setScissorTest(false)
    gl.setViewport(0, 0, size.width, size.height)
    // Toma del hero entera: solo la capa del vidrio y solo en la caja del
    // busto, como el busto de hoy (sin borde ni implantes encima). El resto
    // del canvas queda transparente: se limpia entero y se dibuja recortado.
    const r = recorteHero.current
    if (r) {
      gl.clear()
      const autoClear = gl.autoClear
      gl.autoClear = false
      gl.setScissorTest(true)
      gl.setScissor(r[0], r[1], r[2], r[3])
      gl.render(scene, camera)
      gl.setScissorTest(false)
      gl.autoClear = autoClear
      return
    }
    gl.render(scene, camera)
    const autoClear = gl.autoClear
    gl.autoClear = false
    camera.layers.set(CAPA_BORDE)
    gl.render(scene, camera)
    gl.clearDepth()
    camera.layers.set(CAPA_IMPLANTES)
    gl.render(scene, camera)
    camera.layers.set(0)
    gl.autoClear = autoClear
  }, 1)
  return null
}

// Luz solo para los implantes (en su capa: la pasada principal no la ve, y
// el vidrio y el hueso quedan como en el busto). Una luz de cielo blanca y
// una principal desde arriba y adelante, que da el brillo del titanio.
function LuzImplantes() {
  return (
    <>
      <hemisphereLight layers={CAPA_IMPLANTES} args={['#ffffff', '#9fb6d3', 0.9]} />
      <directionalLight layers={CAPA_IMPLANTES} position={[1.5, 3, 4]} intensity={2.4} />
      <directionalLight layers={CAPA_IMPLANTES} position={[-3, 1, -2]} intensity={1.2} color="#dbe9fb" />
    </>
  )
}

// Cámara del guion: mira al objetivo desde su azimut y elevación, a la
// distancia que hace entrar `alto` metros en la pantalla, y con
// setViewOffset deja el objetivo en el ancla (la pantalla es un recorte de
// una vista más grande centrada en él: la perspectiva no cambia).
function CamaraRecorrido() {
  const invalidate = useThree((s) => s.invalidate)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    estadoRecorrido.invalidar = invalidate
    invalidate()
    return () => {
      estadoRecorrido.invalidar = null
    }
  }, [invalidate])

  // Giro del busto en la toma del hero, igual cuadro a cuadro que el hero de
  // antes: la entrada (estadoRecorrido.entrada: hold, quieto en la pose de
  // partida; play, corre; skip, sin entrada) y después el vaivén, con el
  // tiempo acumulado solo mientras se dibuja.
  const giro = useRef({ entrada: 0, tiempo: 0 })

  // Vaivén leve del cuerpo (borrador: sin(t × 0,5)), solo con la escena fija
  // en pantalla y sin movimiento reducido. A 30 cuadros por segundo: el giro
  // es tan lento que no se nota la diferencia y cuesta la mitad.
  const tiempo = useRef(0)
  useEffect(() => {
    let cuadro = 0
    let par = false
    const latir = () => {
      par = !par
      // En la toma del hero el vaivén va a todos los cuadros, como en el
      // hero de antes
      const cadaCuadro = pesoHeroActual() > 0.01
      if ((par || cadaCuadro) && estadoRecorrido.fijo && !estadoRecorrido.reducido) invalidate()
      cuadro = requestAnimationFrame(latir)
    }
    cuadro = requestAnimationFrame(latir)
    return () => cancelAnimationFrame(cuadro)
  }, [invalidate])

  useFrame(({ camera, size }, delta) => {
    const { width: W, height: H } = size
    if (W === 0 || H === 0) return
    const cam = camera as PerspectiveCamera & { manual?: boolean }
    const { fijo, seg, reducido } = estadoRecorrido
    const paso = Math.min(delta, 0.1)
    if (fijo && !reducido) tiempo.current += paso
    const celular = W < ANCHO_CELULAR
    const c = camaraPara(segCuerpo(seg, celular && !reducido), W, reducido, {
      desliz: deslizHero(seg, celular),
      anclaHero: estadoRecorrido.anclaHero,
    })
    if (!reducido) {
      // Entrada del hero (hold, play, skip) y después su vaivén en la toma 0,
      // y el del recorrido en las paradas. Los dos del hero se amortiguan a
      // cero con el peso del hero al empezar el scroll.
      const h = pesoHeroActual()
      const g = giro.current
      const modoEntrada = estadoRecorrido.entrada
      let extra = 0
      let subida = 0
      if (g.entrada < 1) {
        if (modoEntrada === 'hold' && g.entrada === 0) {
          extra = GIRO_ENTRADA
          subida = SUBIDA_ENTRADA
        } else {
          g.entrada =
            modoEntrada === 'skip' && g.entrada === 0
              ? 1
              : Math.min(1, g.entrada + paso / SEGUNDOS_ENTRADA)
          const resto = (1 - g.entrada) ** 3
          extra = GIRO_ENTRADA * resto
          subida = SUBIDA_ENTRADA * resto
        }
      } else {
        g.tiempo += paso
        extra = giroVaiven(g.tiempo) - GIRO_PERFIL
      }
      // El busto giraba con la cámara quieta: acá gira la cámara alrededor de
      // la cabeza, y sube el objetivo donde el busto bajaba
      c.azimut -= extra * h
      c.objetivo = [c.objetivo[0], c.objetivo[1] + subida * h, c.objetivo[2]]
      c.azimut += Math.sin(tiempo.current * 0.5) * 0.026 * (1 - h)
    }
    // El estudio de luz gira con la cámara. En el hero de antes la luz
    // quedaba quieta respecto de la cámara y giraba el busto; con la cámara
    // girando alrededor del cuerpo, es la misma imagen.
    scene.environmentRotation.set(0, c.azimut, 0)
    const [ax, ay] = c.ancla
    const fullW = W * (1 + 2 * Math.abs(ax - 0.5))
    const fullH = H * (1 + 2 * Math.abs(ay - 0.5))
    let tan = Math.tan(MathUtils.degToRad(FOV / 2))
    let distancia = (c.alto * (fullH / H)) / (2 * tan)
    // La toma del hero fija la distancia y el fov sale de ella
    if (c.distancia !== null) {
      distancia = c.distancia
      tan = (c.alto * (fullH / H)) / (2 * distancia)
    }
    const [tx, ty, tz] = c.objetivo
    const horizontal = distancia * Math.cos(c.elevacion)
    cam.manual = true
    cam.fov = c.distancia !== null ? MathUtils.radToDeg(2 * Math.atan(tan)) : FOV
    cam.aspect = fullW / fullH / c.estiramiento
    cam.position.set(
      tx + horizontal * Math.sin(c.azimut),
      ty + distancia * Math.sin(c.elevacion),
      tz + horizontal * Math.cos(c.azimut),
    )
    cam.lookAt(tx, ty, tz)
    cam.setViewOffset(fullW, fullH, fullW / 2 - ax * W, fullH / 2 - ay * H, W, H)
    cam.updateMatrixWorld()
    // Caja del busto de antes (el hero como sección propia): en escritorio,
    // 14:15 a todo el alto de ALTO_HERO metros, con la cabeza al 55,5 % de su
    // ancho; en el celular, a todo el ancho. Solo con la toma del hero entera
    // y sin las miniaturas a la vista.
    if (pesoHeroActual() >= 0.9999 && !estadoRecorrido.minis) {
      const altoCaja = (H * ALTO_HERO) / c.alto
      const anchoCaja = celular ? W : (altoCaja * 14) / 15
      const x = celular ? 0 : ax * W - 0.555 * anchoCaja
      const yArriba = ay * H - altoCaja / 2
      const x0 = Math.max(0, Math.floor(x))
      const x1 = Math.min(W, Math.ceil(x + anchoCaja))
      const y0 = Math.max(0, Math.floor(yArriba))
      const y1 = Math.min(H, Math.ceil(yArriba + altoCaja))
      recorteHero.current = x1 > x0 && y1 > y0 ? [x0, H - y1, x1 - x0, y1 - y0] : null
    } else {
      recorteHero.current = null
    }
  }, -1)

  return null
}

// Avisa cuando el modelo ya se dibujó (dos cuadros: el primero llena el
// buffer del vidrio)
function Listo({ alListo }: { alListo: () => void }) {
  const cuadros = useRef(0)
  const invalidate = useThree((s) => s.invalidate)
  useFrame(() => {
    cuadros.current += 1
    if (cuadros.current === 2) alListo()
    if (cuadros.current < 2) invalidate()
  })
  return null
}

function Escena({ calidad, alListo }: { calidad: Quality; alListo: () => void }) {
  const ancho = useThree((s) => s.size.width)
  const alto = useThree((s) => s.size.height)
  // El vidrio refracta el degradé del hero, el de la escena fija entera (en
  // el celular, el degradé mide 140,2 % de la escena, como el hero alto de
  // antes: .recorrido-escena en globals.css)
  const fondo = useTexturaDegrade(ancho < ANCHO_DEGRADE_ALTO ? TRAMO_DEGRADE_CELULAR : null)
  // Celular: el degradé sube con el desliz del hero (tour-scroll.tsx mueve el
  // de CSS con --desliz), y el vidrio refracta el mismo tramo
  const deslizPintado = useRef(0)
  // Textura nueva (otro tamaño): se repinta en el próximo cuadro
  useLayoutEffect(() => {
    deslizPintado.current = -1
  }, [fondo])
  useFrame(() => {
    if (ancho >= ANCHO_DEGRADE_ALTO) return
    const d = deslizHero(estadoRecorrido.seg, true)
    if (Math.abs(d - deslizPintado.current) < 0.0005) return
    deslizPintado.current = d
    const [arriba, abajo] = TRAMO_DEGRADE_CELULAR
    pintarDegrade(fondo, arriba + d * abajo, abajo + d * abajo)
  }, -2)
  const invalidate = useThree((s) => s.invalidate)
  useLayoutEffect(() => invalidate(), [ancho, alto, invalidate])
  // El resto del cuerpo y los otros cinco implantes se piden cuando terminó
  // la entrada de la home: el hero carga solo lo suyo (CUERPO.hero y la
  // craneoplastía)
  const resto = useIntroPhase() === 'done'
  return (
    <>
      <CamaraRecorrido />
      <Pasadas />
      <LuzImplantes />
      <Suspense fallback={null}>
        {!resto ? (
          <CuerpoHero calidad={calidad} fondo={fondo} />
        ) : (
          // Mientras llega el resto del cuerpo (después de la intro), sigue
          // el del hero: lo que falta queda debajo del corte de la toma hero
          <Suspense
            fallback={<CuerpoHero calidad={calidad} fondo={fondo} />}
          >
            <CuerpoEntero calidad={calidad} fondo={fondo} />
          </Suspense>
        )}
        <CraneoHero />
        <Listo alListo={alListo} />
      </Suspense>
      {resto && (
        <Suspense fallback={null}>
          <Implantes />
          <Miniaturas />
        </Suspense>
      )}
    </>
  )
}

// Resolución, como el hero de antes: arranca en la de la pantalla, hasta
// 1,5x (y el tope de `dpr`), y si faltan cuadros mientras el hero anima baja
// de a 0,25 hasta 1x y después pasa el vidrio a calidad baja. Nunca vuelve a
// subir.
const DPR_MAX_HERO = 1.5
const DPR_MIN_HERO = 1

export default function EscenaRecorrido({
  activa,
  calidad,
  dpr,
  alListo,
}: {
  activa: boolean
  calidad: Quality
  dpr: number
  alListo: () => void
}) {
  const [dprHero, setDprHero] = useState(() =>
    MathUtils.clamp(window.devicePixelRatio, DPR_MIN_HERO, DPR_MAX_HERO),
  )
  const [calidadHero, setCalidadHero] = useState<Quality>('media')
  const bajar = () => {
    if (dprHero > DPR_MIN_HERO) setDprHero(Math.max(DPR_MIN_HERO, dprHero - 0.25))
    else setCalidadHero('baja')
  }
  return (
    <Canvas
      frameloop={activa ? 'demand' : 'never'}
      dpr={Math.min(dpr, dprHero)}
      camera={{ position: [0, 0.85, 4], fov: FOV, near: 0.05, far: 20 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      {/* Mide mientras se ve el hero (vaivén a cada cuadro); con frameloop
          "demand" y quieto no recibe cuadros */}
      <PerformanceMonitor onDecline={bajar} />
      <Escena
        calidad={calidadHero === 'baja' ? 'baja' : calidad}
        alListo={alListo}
      />
      {/* El mismo estudio de luz del busto del hero de antes */}
      <Environment resolution={256}>
        <mesh scale={50}>
          <sphereGeometry args={[1, 32, 16]} />
          <meshBasicMaterial color="#5f666e" side={BackSide} />
        </mesh>
        <Lightformer form="rect" intensity={3} position={[0, 5, -2]} scale={[10, 2, 1]} />
        <Lightformer form="rect" intensity={2} position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="rect" intensity={1.2} color="#9ec5f0" position={[5, 0, 1]} rotation-y={-Math.PI / 2} scale={[8, 3, 1]} />
        <Lightformer form="ring" intensity={1.5} color="#003c6f" position={[0, -1, -6]} scale={4} />
        <Lightformer form="rect" intensity={4} position={[-2, 2, -5]} scale={[3, 6, 1]} />
      </Environment>
    </Canvas>
  )
}
