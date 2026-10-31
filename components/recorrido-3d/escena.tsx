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
  CanvasTexture,
  Color,
  DoubleSide,
  FrontSide,
  ShaderMaterial,
  Sprite,
  SpriteMaterial,
  Euler,
  MathUtils,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  SRGBColorSpace,
  Vector3,
  type BufferGeometry,
  type Mesh,
  type MeshPhysicalMaterial,
  type Object3D,
  type PerspectiveCamera,
  type Texture,
} from 'three'
import { Bone, useGlassBuffer, type Quality } from '../hero-3d/materials'
import {
  GIRO_ENTRADA,
  GIRO_PERFIL,
  ORDEN_PARADAS,
  SEGUNDOS_ENTRADA,
  SUBIDA_ENTRADA,
  TOMAS_PARADA,
  camaraPara,
  giroVaiven,
  opacidadBase,
  pesoHero,
  pesoTarjeta,
  type Encuadre,
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
  ordenarPorAltura,
  partirColumna,
  uniformesCorte,
  useTexturaDegrade,
} from './cuerpo-unico'
import { cuerpoUnicoActivo, estadoRecorrido } from './estado'
import { IMPLANTES, IMPLANTES_GLB, IMPLANTES_RECORRIDO_GLB, type Implante } from './implantes'
import { Miniaturas } from './miniaturas'

// Escena 3D del recorrido (#recorrido): el cuerpo de vidrio entero con el
// esqueleto tenue y los seis implantes. La cámara sale del progreso del
// scroll (camara.ts, el guion del borrador) y no se mueve sola: el canvas
// dibuja solo cuando cambia el scroll (frameloop "demand").
//
// Mismo lenguaje que el busto del hero (components/hero-3d/): el vidrio, el
// hueso y el estudio de luz son los mismos.

const CUERPO_URL = '/modelos/cuerpo.glb'

// El cuerpo y la craneoplastía se piden al cargar el módulo (también los usa
// el hero del cuerpo único); los otros cinco implantes, al montar la escena
// del recorrido (EscenaRecorrido).
useGLTF.preload(CUERPO_URL, false, true)
useGLTF.preload(IMPLANTES_GLB, false, true)

// --- Cuerpo único (prototipo, ?cuerpo-unico) --------------------------------
// La misma escena dibuja también el hero (modo 'hero', desde
// components/hero-3d/hero-3d.tsx) en la toma 0 del guion (HERO en
// camara.ts), con el aspecto del busto: su vidrio, su titanio dentro del
// vidrio, el hueso del busto, el corte bajo el cuello, el degradé de fondo,
// la entrada girando y el vaivén. En el recorrido, ese aspecto pasa al de
// las paradas con el peso del hero (pesoHero) mientras la cámara va a la
// craneoplastía. Sin el parámetro, nada de esto corre.
export type Entrada = 'hold' | 'play' | 'skip'

export type AjustesHero = {
  // Sin movimiento reducido: entrada y vaivén
  animar: boolean
  entrada: Entrada
  // Encuadre de la toma medido en el DOM del hero
  encuadre: Encuadre
  // Tramo del degradé de la sección detrás del canvas
  tramo: readonly [number, number]
  // Caja del busto de hoy dentro del canvas (píxeles CSS, origen arriba a la
  // izquierda): con ella, la escena dibuja solo ahí, con el mismo costo por
  // píxel que el busto, aunque el canvas ocupe toda la pantalla
  recorte?: { x: number; y: number; width: number; height: number }
}

// El recorte del hero con el origen de WebGL (abajo a la izquierda), en
// píxeles CSS como pide gl.setScissor; null sin recorte
function recorteGL(hero: AjustesHero | undefined, alto: number) {
  const r = hero?.recorte
  if (!r) return null
  return [r.x, alto - r.y - r.height, r.width, r.height] as const
}

type Modo = 'recorrido' | 'hero'

// Peso del aspecto del hero en este cuadro: 1 en el hero, y en el recorrido
// según el progreso; 0 sin el cuerpo único.
function pesoHeroActual(modo: Modo, cuerpoUnico: boolean) {
  if (modo === 'hero') return 1
  if (!cuerpoUnico) return 0
  return pesoHero(estadoRecorrido.seg, estadoRecorrido.reducido)
}

// Corte por altura: en la toma del hero, la piel a 1,33 m y el hueso a
// 1,35 m, rectos; con el scroll bajan hasta debajo de los pies, con una
// banda cada vez más ancha.
const corteDe = (corte: number, h: number) => MathUtils.lerp(-0.4, corte, h)
const bandaDe = (h: number) => MathUtils.lerp(0.4, 0.004, h)

const FOV = 30
// Hueso un poco más tenue que en el busto: con el cuerpo entero hay mucho
// más esqueleto a la vista y competía con los implantes.
const OPACIDAD_HUESO = 0.34

// Brillo del implante activo: un azul de la marca, claro, sumado al metal,
// bajo para que la pieza se siga leyendo como titanio. El halo azul fuerte
// del borrador (shadowBlur) lo da el resplandor de detrás (Resplandor).
const BRILLO = new Color('#a9cdf5')
const INTENSIDAD_BRILLO = 0.2
const COLOR_RESPLANDOR = '#3d6fe0'

// Capas: los implantes y su resplandor (1) y el borde de luz del vidrio (2)
// se dibujan en pasadas propias, después de la escena (ver Pasadas).
const CAPA_IMPLANTES = 1
const CAPA_BORDE = 2

// Fondo de la escena (.escenario en globals.css), que el vidrio refracta:
// arriba se funde con el gris de la página y, hacia la derecha, una luz azul.
const SUPERFICIE = '#f5f7f9'
const LUZ = '#c3d7ee'

function useFondoEscena(ancho: number, alto: number) {
  const textura = useMemo(() => {
    const w = Math.max(2, Math.round(ancho / 4))
    const h = Math.max(2, Math.round(alto / 4))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    if (ctx) {
      ctx.fillStyle = SUPERFICIE
      ctx.fillRect(0, 0, w, h)
      // radial-gradient(120% 90% at 68% 42%, luz, superficie 68%)
      ctx.save()
      ctx.translate(w * 0.68, h * 0.42)
      ctx.scale(w * 1.2, h * 0.9)
      const radial = ctx.createRadialGradient(0, 0, 0, 0, 0, 1)
      radial.addColorStop(0, LUZ)
      radial.addColorStop(0.68, SUPERFICIE)
      ctx.fillStyle = radial
      ctx.fillRect(-2, -2, 4, 4)
      ctx.restore()
      // linear-gradient(superficie, transparent 7rem)
      const borde = ctx.createLinearGradient(0, 0, 0, 112 / 4)
      borde.addColorStop(0, SUPERFICIE)
      borde.addColorStop(1, 'rgba(245, 247, 249, 0)')
      ctx.fillStyle = borde
      ctx.fillRect(0, 0, w, 112 / 4)
    }
    const map = new CanvasTexture(canvas)
    map.colorSpace = SRGBColorSpace
    return map
  }, [ancho, alto])
  useEffect(() => () => textura.dispose(), [textura])
  return textura
}

function mallasDe(root: Object3D) {
  const mallas: Mesh[] = []
  root.traverse((nodo) => {
    if ((nodo as Mesh).isMesh) mallas.push(nodo as Mesh)
  })
  return mallas
}

// Vidrio del cuerpo: el del busto (components/hero-3d/materials.tsx), más
// claro y con más profundidad. El cuerpo entero se ve más chico y sobre un
// fondo azul claro: con el tono del busto quedaba azul sobre azul, sin
// contraste. Más claro en los bordes finos y más azul donde es grueso.
const MUESTRAS: Record<Quality, number> = { alta: 10, media: 4, baja: 3 }

function Vidrio({ calidad, buffer, cuerpoUnico, alCrear }: {
  calidad: Quality
  buffer: Texture
  cuerpoUnico: boolean
  alCrear: (material: MeshPhysicalMaterial | null) => void
}) {
  return (
    <MeshTransmissionMaterial
      ref={(m) => alCrear(m as unknown as MeshPhysicalMaterial | null)}
      // Cuerpo único: transparente mientras el corte por altura se funde
      // (Cuerpo lo cambia cuadro a cuadro)
      transparent={cuerpoUnico}
      buffer={buffer}
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

function Cuerpo({ calidad, fondo, modo, cuerpoUnico, hero }: {
  calidad: Quality
  fondo: Texture
  modo: Modo
  cuerpoUnico: boolean
  hero?: AjustesHero
}) {
  const cuerpo = useGLTF(CUERPO_URL, false, true)
  const mallas = useMemo(() => {
    const todas = mallasDe(cuerpo.scene)
    // El maxilar entero es solo del cuerpo único, que además parte la
    // columna como el busto (partirColumna)
    if (!cuerpoUnico) return todas.filter((m) => m.name !== 'hueso_maxilar_entero')
    return todas.flatMap((m) => (m.name === 'hueso_columna' ? partirColumna(m) : [m]))
  }, [cuerpo.scene, cuerpoUnico])
  // Hero del cuerpo único: el buffer del vidrio, solo en la caja del busto
  const recorte = useRef<readonly [number, number, number, number] | null>(null)
  const altoCanvas = useThree((s) => s.size.height)
  useLayoutEffect(() => {
    recorte.current = recorteGL(hero, altoCanvas)
  }, [hero, altoCanvas])
  const [piel, buffer] = useGlassBuffer(fondo, recorte)
  const borde = useMemo(() => materialBorde(), [])
  useEffect(() => () => borde.dispose(), [borde])
  const geometriaPiel = mallas.find((m) => m.name === 'piel')
  // Hero del cuerpo único: la piel ordenada por altura, para dibujar solo lo
  // que queda arriba del corte. Solo en el hero: el orden por altura rompe la
  // localidad de la malla, y con el cuerpo entero a la vista el recorrido
  // bajaba de 60 a 47 cuadros (medido).
  const pielOrdenada = useMemo(
    () => (modo === 'hero' && geometriaPiel ? ordenarPorAltura(geometriaPiel) : null),
    [modo, geometriaPiel],
  )

  // Cuerpo único: el vidrio, el hueso, el borde y el corte pasan del aspecto
  // del busto al del recorrido con el peso del hero.
  const vidrio = useRef<MeshPhysicalMaterial | null>(null)
  const huesos = useRef(new Map<string, Mesh>())
  const mallaBorde = useRef<Mesh>(null)
  const cortes = useRef({ piel: uniformesCorte(CORTE_PIEL), hueso: uniformesCorte(CORTE_HUESO) })
  useFrame(() => {
    if (!cuerpoUnico) return
    const h = pesoHeroActual(modo, cuerpoUnico)
    const corte = cortes.current
    corte.piel.corteY.value = corteDe(CORTE_PIEL, h)
    corte.hueso.corteY.value = corteDe(CORTE_HUESO, h)
    corte.piel.corteBanda.value = corte.hueso.corteBanda.value = bandaDe(h)
    if (pielOrdenada) {
      // Lo que el corte descarta entero no se dibuja (la banda, sí)
      pielOrdenada.geometria.setDrawRange(0, pielOrdenada.indicesSobre(corte.piel.corteY.value))
    }
    const v = vidrio.current
    if (v) {
      aplicarCorte(v, corte.piel)
      // Opaco con el aspecto del hero entero, como el busto (la banda del
      // corte mide 4 mm y no necesita fundirse); transparente en cuanto el
      // corte empieza a bajar
      const transparente = h < 0.999
      if (v.transparent !== transparente) {
        v.transparent = transparente
        v.needsUpdate = true
      }
      const a = VIDRIO_RECORRIDO
      const b = VIDRIO_HERO
      // Propiedades del vidrio de drei (uniformes con getters y setters)
      const m = v as MeshPhysicalMaterial & { thickness: number; attenuationDistance: number }
      const escalaPiel = geometriaPiel?.scale.x ?? 1
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
    for (const [nombre, malla] of huesos.current) {
      const material = malla.material as MeshPhysicalMaterial
      // Las vértebras del busto van enteras, sin corte
      if (nombre !== 'hueso_columna_alta') aplicarCorte(material, corte.hueso)
      const peso = HUESOS_BUSTO.has(nombre) ? (nombre === 'hueso_maxilar_entero' ? h : 1) : 1 - h
      material.opacity = opacidad * peso
      malla.visible = material.opacity > 0.002
    }
    const mb = mallaBorde.current
    if (mb) {
      const materialBorde = mb.material as ShaderMaterial
      aplicarCorte(materialBorde, corte.piel)
      const fuerza = materialBorde.uniforms.uFuerza
      if (fuerza) fuerza.value = 0.85 * (1 - h)
      mb.visible = h < 0.999
    }
  }, -1)

  return (
    <group>
      {mallas.map((malla) => (
        <mesh
          key={malla.uuid}
          ref={
            malla.name === 'piel'
              ? piel
              : (m: Mesh | null) => {
                  if (m) huesos.current.set(malla.name, m)
                  else huesos.current.delete(malla.name)
                }
          }
          name={malla.name}
          geometry={malla.name === 'piel' && pielOrdenada ? pielOrdenada.geometria : malla.geometry}
          position={malla.position}
          quaternion={malla.quaternion}
          scale={malla.scale}
          // El vidrio se dibuja sobre el hueso
          renderOrder={malla.name === 'piel' ? 1 : 0}
        >
          {malla.name === 'piel' ? (
            <Vidrio
              calidad={calidad}
              buffer={buffer}
              cuerpoUnico={cuerpoUnico}
              alCrear={(m) => {
                vidrio.current = m
              }}
            />
          ) : (
            <Bone opacity={OPACIDAD_HUESO} />
          )}
        </mesh>
      ))}
      {geometriaPiel && (
        <mesh
          ref={mallaBorde}
          geometry={geometriaPiel.geometry}
          position={geometriaPiel.position}
          quaternion={geometriaPiel.quaternion}
          scale={geometriaPiel.scale}
          material={borde}
          layers={CAPA_BORDE}
        />
      )}
    </group>
  )
}

// Cuerpo único: la craneoplastía con el titanio del busto, en la capa del
// vidrio (0), así que se ve refractada a través de él como en el hero. Se
// desvanece con el peso del hero, cuando entra la de la capa de implantes.
function CraneoHero({ modo }: { modo: Modo }) {
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
    const h = pesoHeroActual(modo, true)
    ;(m.material as MeshStandardMaterial).opacity = h
    m.visible = h > 0.001
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
}

function matrizDe(implante: Implante) {
  return new Matrix4().compose(
    new Vector3(...implante.posicion),
    new Quaternion().setFromEuler(new Euler(...implante.rotacion)),
    new Vector3(implante.escala, implante.escala, implante.escala),
  )
}

function usePiezas(): PiezaLista[] {
  const urls = useMemo(
    () => [...new Set(IMPLANTES.flatMap((i) => (i.fuente.tipo === 'glb' ? [i.fuente.url] : [])))],
    [],
  )
  const archivos = useGLTF(urls, false, true)
  const piezas = useMemo(() => {
    return IMPLANTES.map((implante) => {
      const matriz = matrizDe(implante)
      const fuente = implante.fuente
      let geometria: BufferGeometry
      let propia = true
      if (fuente.tipo === 'primitiva') {
        geometria = fuente.crear()
      } else {
        const archivo = archivos[urls.indexOf(fuente.url)]
        const malla = archivo ? mallasDe(archivo.scene).find((m) => m.name === fuente.malla) : undefined
        if (!malla) throw new Error(`Falta la malla ${fuente.malla} en ${fuente.url}`)
        malla.updateWorldMatrix(true, false)
        matriz.multiply(malla.matrixWorld)
        geometria = malla.geometry
        propia = false
      }
      // Centro y radio en el cuerpo: dónde va el resplandor y cuánto se
      // apagan los implantes vecinos al activo
      if (!geometria.boundingSphere) geometria.computeBoundingSphere()
      const esfera = geometria.boundingSphere
      const centro = (esfera?.center.clone() ?? new Vector3()).applyMatrix4(matriz)
      const radio = (esfera?.radius ?? 0.02) * matriz.getMaxScaleOnAxis()
      return { implante, geometria, matriz, propia, centro, radio }
    })
  }, [archivos, urls])
  // Las primitivas se crean acá: se liberan al desmontar
  useEffect(
    () => () => {
      for (const p of piezas) if (p.propia) p.geometria.dispose()
    },
    [piezas],
  )
  return piezas
}

// Resplandor azul detrás del implante activo, el halo del borrador
// (shadowBlur azul): un degradé radial que mira siempre a la cámara, en la
// capa de los implantes y dibujado antes que ellos.
let texturaResplandor: CanvasTexture | null = null
function resplandorTextura() {
  if (texturaResplandor) return texturaResplandor
  const canvas = document.createElement('canvas')
  canvas.width = 128
  canvas.height = 128
  const ctx = canvas.getContext('2d')
  if (ctx) {
    const g = ctx.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(255,255,255,1)')
    g.addColorStop(0.35, 'rgba(255,255,255,0.55)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 128, 128)
  }
  texturaResplandor = new CanvasTexture(canvas)
  return texturaResplandor
}

function Resplandor({ ref, centro, tamano }: {
  ref: (sprite: Sprite | null) => void
  centro: Vector3
  tamano: number
}) {
  const material = useMemo(
    () =>
      new SpriteMaterial({
        map: resplandorTextura(),
        color: COLOR_RESPLANDOR,
        transparent: true,
        opacity: 0,
        depthTest: false,
        depthWrite: false,
      }),
    [],
  )
  useEffect(() => () => material.dispose(), [material])
  return (
    <sprite
      ref={ref}
      material={material}
      position={centro}
      scale={[tamano, tamano, 1]}
      layers={CAPA_IMPLANTES}
      renderOrder={-1}
      visible={false}
    />
  )
}

function Implantes({ cuerpoUnico }: { cuerpoUnico: boolean }) {
  const piezas = usePiezas()
  // Un material por pieza: la opacidad y el brillo cambian con el recorrido.
  // Titanio de impresión 3D gris y mate (el del busto) y de CNC, pulido.
  const materiales = useMemo(
    () =>
      piezas.map(
        ({ implante }) =>
          new MeshStandardMaterial({
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
          }),
      ),
    [piezas],
  )
  useEffect(() => () => materiales.forEach((m) => m.dispose()), [materiales])

  const resplandores = useRef<(Sprite | null)[]>([])
  const mallas = useRef<(Mesh | null)[]>([])

  useFrame(() => {
    const { seg, reducido } = estadoRecorrido
    const base = opacidadBase(seg, reducido)
    // Cuerpo único: en la toma del hero no hay implantes encima del vidrio
    const visibles = 1 - pesoHeroActual('recorrido', cuerpoUnico)
    const pesos = piezas.map(({ implante }) =>
      pesoTarjeta(seg, ORDEN_PARADAS.indexOf(implante.parada), reducido),
    )
    piezas.forEach((pieza, i) => {
      const material = materiales[i]
      const w = pesos[i] ?? 0
      if (!material) return
      // Los inactivos cercanos al activo se apagan más, para que no crucen
      // su halo (en el acetábulo, el clavo del intercalar y la endoprótesis)
      let apagado = 1
      piezas.forEach((otra, j) => {
        const wj = pesos[j] ?? 0
        if (j === i || wj <= 0) return
        const distancia = Math.max(0, pieza.centro.distanceTo(otra.centro) - pieza.radio)
        const cercania = MathUtils.clamp(distancia / 0.2, 0.25, 1)
        apagado = Math.min(apagado, MathUtils.lerp(1, cercania, wj))
      })
      material.opacity = Math.max(base * apagado, w) * visibles
      material.emissiveIntensity = INTENSIDAD_BRILLO * w
      material.depthWrite = material.opacity > 0.9
      const malla = mallas.current[i]
      if (malla) malla.visible = material.opacity > 0.002
      const resplandor = resplandores.current[i]
      if (resplandor) {
        resplandor.material.opacity = 0.85 * w * visibles
        resplandor.visible = w * visibles > 0.01
      }
    })
  })

  return (
    <group>
      {piezas.map(({ implante, centro, radio }, i) => (
        <Resplandor
          key={`resplandor-${implante.parada}`}
          ref={(sprite) => {
            resplandores.current[i] = sprite
          }}
          centro={centro}
          tamano={radio * 3.8}
        />
      ))}
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
function Pasadas({ modo, hero }: { modo: Modo; hero?: AjustesHero }) {
  useFrame(({ gl, scene, camera, size }) => {
    // En el hero solo está la capa del vidrio (sin borde ni implantes
    // encima): una sola pasada, como el busto, y con recorte, solo en la
    // caja del busto (el resto del canvas queda transparente)
    if (modo === 'hero') {
      const r = hero?.recorte
      if (r) {
        gl.setScissorTest(true)
        gl.setScissor(r.x, size.height - r.y - r.height, r.width, r.height)
      }
      gl.render(scene, camera)
      gl.setScissorTest(false)
      return
    }
    // Las miniaturas (miniaturas.tsx) dibujan después, cada una recortada a
    // su lugar: el cuadro arranca con el canvas entero
    gl.setScissorTest(false)
    gl.setViewport(0, 0, size.width, size.height)
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

const proyectado = new Vector3()

// Cámara del guion: mira al objetivo desde su azimut y elevación, a la
// distancia que hace entrar `alto` metros en la pantalla, y con
// setViewOffset deja el objetivo en el ancla (la pantalla es un recorte de
// una vista más grande centrada en él: la perspectiva no cambia). Escribe
// además en la escena HTML dónde queda el halo del implante activo y la luz
// que acompaña al cuerpo.
function CamaraRecorrido({ modo, cuerpoUnico, hero }: {
  modo: Modo
  cuerpoUnico: boolean
  hero?: AjustesHero
}) {
  const invalidate = useThree((s) => s.invalidate)
  const scene = useThree((s) => s.scene)
  useEffect(() => {
    // El hero no maneja el estado del recorrido: es otra escena
    if (modo === 'hero') return
    estadoRecorrido.invalidar = invalidate
    invalidate()
    return () => {
      estadoRecorrido.invalidar = null
    }
  }, [invalidate, modo])

  // Giro del busto en el hero (body-scene.tsx, Bust), igual cuadro a cuadro:
  // la entrada (hold: quieto en la pose de partida; play: corre; skip: sin
  // entrada) y después el vaivén, con el tiempo acumulado solo mientras se
  // dibuja. `pose` es el giro y la subida del último cuadro animado.
  const giro = useRef({ entrada: hero?.entrada === 'skip' ? 1 : 0, tiempo: 0 })
  const pose = useRef({ giro: GIRO_PERFIL, subida: 0 })
  const ajustes = useRef(hero)
  useLayoutEffect(() => {
    ajustes.current = hero
  }, [hero])

  // Vaivén leve del cuerpo (borrador: sin(t × 0,5)), solo con la escena fija
  // en pantalla y sin movimiento reducido. A 30 cuadros por segundo: el giro
  // es tan lento que no se nota la diferencia y cuesta la mitad.
  const tiempo = useRef(0)
  useEffect(() => {
    if (modo === 'hero') return
    let cuadro = 0
    let par = false
    const latir = () => {
      par = !par
      // Cuerpo único: en la toma del hero el vaivén va a todos los cuadros,
      // como en el hero
      const cadaCuadro = cuerpoUnico && pesoHeroActual('recorrido', true) > 0.01
      if ((par || cadaCuadro) && estadoRecorrido.fijo && !estadoRecorrido.reducido) invalidate()
      cuadro = requestAnimationFrame(latir)
    }
    cuadro = requestAnimationFrame(latir)
    return () => cancelAnimationFrame(cuadro)
  }, [invalidate, modo, cuerpoUnico])

  useFrame(({ camera, size }, delta) => {
    const { width: W, height: H } = size
    if (W === 0 || H === 0) return
    const cam = camera as PerspectiveCamera & { manual?: boolean }
    const enHero = modo === 'hero'
    const ajustesHero = ajustes.current
    const { fijo } = estadoRecorrido
    const seg = enHero ? 0 : estadoRecorrido.seg
    const reducido = enHero ? !ajustesHero?.animar : estadoRecorrido.reducido
    const paso = Math.min(delta, 0.1)
    if (!enHero && fijo && !reducido) tiempo.current += paso
    const c = camaraPara(seg, W, H, reducido, {
      cuerpoUnico,
      encuadreHero: ajustesHero?.encuadre,
    })
    if (enHero) {
      if (!reducido) {
        const g = giro.current
        let giroY = GIRO_PERFIL
        let subida = 0
        let vaiven = true
        if (g.entrada < 1) {
          if (ajustesHero?.entrada === 'hold' && g.entrada === 0) {
            giroY = GIRO_PERFIL + GIRO_ENTRADA
            subida = SUBIDA_ENTRADA
            vaiven = false
          } else {
            g.entrada =
              ajustesHero?.entrada === 'skip' && g.entrada === 0
                ? 1
                : Math.min(1, g.entrada + paso / SEGUNDOS_ENTRADA)
            const resto = (1 - g.entrada) ** 3
            giroY = GIRO_PERFIL + GIRO_ENTRADA * resto
            subida = SUBIDA_ENTRADA * resto
            vaiven = g.entrada >= 1
          }
        }
        if (vaiven) {
          g.tiempo += paso
          giroY = giroVaiven(g.tiempo)
        }
        pose.current = { giro: giroY, subida }
      }
      // El busto gira +giro con la cámara quieta: acá gira la cámara −giro.
      // El busto baja `subida`: acá sube el objetivo.
      c.azimut = -pose.current.giro
      c.objetivo = [c.objetivo[0], c.objetivo[1] + pose.current.subida, c.objetivo[2]]
    } else if (!reducido) {
      if (cuerpoUnico) {
        // El vaivén del hero en la toma 0, y el del recorrido en las paradas
        const h = pesoHeroActual('recorrido', true)
        c.azimut -= (giroVaiven(tiempo.current) - GIRO_PERFIL) * h
        c.azimut += Math.sin(tiempo.current * 0.5) * 0.026 * (1 - h)
      } else {
        c.azimut += Math.sin(tiempo.current * 0.5) * 0.026
      }
    }
    // Cuerpo único: el estudio de luz gira con la cámara. En el hero la luz
    // queda quieta respecto de la cámara y gira el busto; con la cámara
    // girando alrededor del cuerpo, es la misma imagen.
    if (cuerpoUnico) scene.environmentRotation.set(0, c.azimut, 0)
    const [ax, ay] = c.ancla
    const fullW = W * (1 + 2 * Math.abs(ax - 0.5))
    const fullH = H * (1 + 2 * Math.abs(ay - 0.5))
    let tan = Math.tan(MathUtils.degToRad(FOV / 2))
    let distancia = (c.alto * (fullH / H)) / (2 * tan)
    // Cuerpo único: la toma del hero fija la distancia y el fov sale de ella
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

    const escena = estadoRecorrido.escena
    if (!escena || enHero) return
    // Píxeles por metro a la distancia del objetivo
    const ppm = H / c.alto

    // Halo alrededor del implante activo (borrador: radio de 0,16 a 0,38 del
    // tramo visible de la parada, opacidad según el peso de la tarjeta)
    let mejor = -1
    let peso = 0
    ORDEN_PARADAS.forEach((_, i) => {
      const w = pesoTarjeta(seg, i, reducido)
      if (w > peso) {
        peso = w
        mejor = i
      }
    })
    const id = ORDEN_PARADAS[mejor]
    if (id && peso > 0.05) {
      const toma = TOMAS_PARADA[id]
      proyectado.set(...toma.objetivo).project(cam)
      escena.style.setProperty('--halo-x', `${((proyectado.x + 1) / 2) * W}px`)
      escena.style.setProperty('--halo-y', `${((1 - proyectado.y) / 2) * H}px`)
      escena.style.setProperty('--halo-r', `${toma.vis * 0.38 * ppm}px`)
      escena.style.setProperty('--halo-o', peso.toFixed(3))
    } else {
      escena.style.setProperty('--halo-o', '0')
    }

    // Luz que sigue al cuerpo (borrador: radial en el pecho, 0,6 del lado
    // mayor de la pantalla)
    proyectado.set(0, 1.0, 0).project(cam)
    escena.style.setProperty('--luz-x', `${((proyectado.x + 1) / 2) * W}px`)
    escena.style.setProperty('--luz-y', `${((1 - proyectado.y) / 2) * H}px`)
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

function Escena({ calidad, alListo, modo, cuerpoUnico, hero }: {
  calidad: Quality
  alListo: () => void
  modo: Modo
  cuerpoUnico: boolean
  hero?: AjustesHero
}) {
  const ancho = useThree((s) => s.size.width)
  const alto = useThree((s) => s.size.height)
  const fondoRecorrido = useFondoEscena(ancho, alto)
  // Cuerpo único: el vidrio refracta el degradé del hero (en el recorrido,
  // el de la escena fija entera)
  const degrade = useTexturaDegrade(hero?.tramo ?? null)
  const fondo = cuerpoUnico ? degrade : fondoRecorrido
  const invalidate = useThree((s) => s.invalidate)
  useLayoutEffect(() => invalidate(), [ancho, alto, invalidate])
  return (
    <>
      <CamaraRecorrido modo={modo} cuerpoUnico={cuerpoUnico} hero={hero} />
      <Pasadas modo={modo} hero={hero} />
      {modo === 'recorrido' && <LuzImplantes />}
      <Suspense fallback={null}>
        <Cuerpo calidad={calidad} fondo={fondo} modo={modo} cuerpoUnico={cuerpoUnico} hero={hero} />
        {cuerpoUnico && <CraneoHero modo={modo} />}
        {modo === 'recorrido' && (
          <>
            <Implantes cuerpoUnico={cuerpoUnico} />
            <Miniaturas />
          </>
        )}
        <Listo alListo={alListo} />
      </Suspense>
    </>
  )
}

// Resolución del hero (body-scene.tsx): arranca en la de la pantalla, hasta
// 1,5x, y si faltan cuadros baja de a 0,25 hasta 1x y después pasa el vidrio
// a calidad baja. Nunca vuelve a subir.
const DPR_MAX_HERO = 1.5
const DPR_MIN_HERO = 1

export default function EscenaRecorrido({
  activa,
  calidad,
  dpr,
  alListo,
  hero,
}: {
  activa: boolean
  calidad: Quality
  dpr: number
  alListo: () => void
  // Con esto, la escena dibuja el hero del cuerpo único (modo 'hero')
  hero?: AjustesHero
}) {
  const modo: Modo = hero ? 'hero' : 'recorrido'
  const [cuerpoUnico] = useState(() => modo === 'hero' || cuerpoUnicoActivo())
  // Los otros cinco implantes, solo en el recorrido
  useState(() => {
    if (modo === 'recorrido') useGLTF.preload(IMPLANTES_RECORRIDO_GLB, false, true)
  })
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
      frameloop={!activa ? 'never' : hero?.animar ? 'always' : 'demand'}
      dpr={hero ? dprHero : dpr}
      camera={{ position: [0, 0.85, 4], fov: FOV, near: 0.05, far: 20 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      {hero && <PerformanceMonitor onDecline={bajar} />}
      <Escena
        calidad={hero ? calidadHero : calidad}
        alListo={alListo}
        modo={modo}
        cuerpoUnico={cuerpoUnico}
        hero={hero}
      />
      {/* El mismo estudio de luz del busto (components/hero-3d/body-scene.tsx) */}
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
