'use client'

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, MeshTransmissionMaterial, useGLTF } from '@react-three/drei'
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
  type Object3D,
  type PerspectiveCamera,
  type Texture,
} from 'three'
import { Bone, useGlassBuffer, type Quality } from '../hero-3d/materials'
import {
  ORDEN_PARADAS,
  TOMAS_PARADA,
  camaraPara,
  opacidadBase,
  pesoTarjeta,
} from './camara'
import { estadoRecorrido } from './estado'
import { IMPLANTES, type Implante } from './implantes'
import { Miniaturas } from './miniaturas'

// Escena 3D del recorrido (#recorrido): el cuerpo de vidrio entero con el
// esqueleto tenue y los seis implantes. La cámara sale del progreso del
// scroll (camara.ts, el guion del borrador) y no se mueve sola: el canvas
// dibuja solo cuando cambia el scroll (frameloop "demand").
//
// Mismo lenguaje que el busto del hero (components/hero-3d/): el vidrio, el
// hueso y el estudio de luz son los mismos.

const CUERPO_URL = '/modelos/cuerpo.glb'

useGLTF.preload(CUERPO_URL, false, true)
for (const url of new Set(IMPLANTES.flatMap((i) => (i.fuente.tipo === 'glb' ? [i.fuente.url] : [])))) {
  useGLTF.preload(url, false, true)
}

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

function Vidrio({ calidad, buffer }: { calidad: Quality; buffer: Texture }) {
  return (
    <MeshTransmissionMaterial
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

function Cuerpo({ calidad, fondo }: { calidad: Quality; fondo: Texture }) {
  const cuerpo = useGLTF(CUERPO_URL, false, true)
  const mallas = useMemo(() => mallasDe(cuerpo.scene), [cuerpo.scene])
  const [piel, buffer] = useGlassBuffer(fondo)
  const borde = useMemo(() => materialBorde(), [])
  useEffect(() => () => borde.dispose(), [borde])
  const geometriaPiel = mallas.find((m) => m.name === 'piel')
  return (
    <group>
      {mallas.map((malla) => (
        <mesh
          key={malla.uuid}
          ref={malla.name === 'piel' ? piel : undefined}
          name={malla.name}
          geometry={malla.geometry}
          position={malla.position}
          quaternion={malla.quaternion}
          scale={malla.scale}
          // El vidrio se dibuja sobre el hueso
          renderOrder={malla.name === 'piel' ? 1 : 0}
        >
          {malla.name === 'piel' ? (
            <Vidrio calidad={calidad} buffer={buffer} />
          ) : (
            <Bone opacity={OPACIDAD_HUESO} />
          )}
        </mesh>
      ))}
      {geometriaPiel && (
        <mesh
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

function Implantes() {
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

  useFrame(() => {
    const { seg, reducido } = estadoRecorrido
    const base = opacidadBase(seg, reducido)
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
      material.opacity = Math.max(base * apagado, w)
      material.emissiveIntensity = INTENSIDAD_BRILLO * w
      material.depthWrite = material.opacity > 0.9
      const resplandor = resplandores.current[i]
      if (resplandor) {
        resplandor.material.opacity = 0.85 * w
        resplandor.visible = w > 0.01
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
function CamaraRecorrido() {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    estadoRecorrido.invalidar = invalidate
    invalidate()
    return () => {
      estadoRecorrido.invalidar = null
    }
  }, [invalidate])

  // Vaivén leve del cuerpo (borrador: sin(t × 0,5)), solo con la escena fija
  // en pantalla y sin movimiento reducido. A 30 cuadros por segundo: el giro
  // es tan lento que no se nota la diferencia y cuesta la mitad.
  const tiempo = useRef(0)
  useEffect(() => {
    let cuadro = 0
    let par = false
    const latir = () => {
      par = !par
      if (par && estadoRecorrido.fijo && !estadoRecorrido.reducido) invalidate()
      cuadro = requestAnimationFrame(latir)
    }
    cuadro = requestAnimationFrame(latir)
    return () => cancelAnimationFrame(cuadro)
  }, [invalidate])

  useFrame(({ camera, size }, delta) => {
    const { width: W, height: H } = size
    if (W === 0 || H === 0) return
    const cam = camera as PerspectiveCamera & { manual?: boolean }
    const { seg, reducido, fijo } = estadoRecorrido
    if (fijo && !reducido) tiempo.current += Math.min(delta, 0.1)
    const c = camaraPara(seg, W, H, reducido)
    if (!reducido) c.azimut += Math.sin(tiempo.current * 0.5) * 0.026
    const [ax, ay] = c.ancla
    const fullW = W * (1 + 2 * Math.abs(ax - 0.5))
    const fullH = H * (1 + 2 * Math.abs(ay - 0.5))
    const tan = Math.tan(MathUtils.degToRad(FOV / 2))
    const distancia = (c.alto * (fullH / H)) / (2 * tan)
    const [tx, ty, tz] = c.objetivo
    const horizontal = distancia * Math.cos(c.elevacion)
    cam.manual = true
    cam.fov = FOV
    cam.aspect = fullW / fullH
    cam.position.set(
      tx + horizontal * Math.sin(c.azimut),
      ty + distancia * Math.sin(c.elevacion),
      tz + horizontal * Math.cos(c.azimut),
    )
    cam.lookAt(tx, ty, tz)
    cam.setViewOffset(fullW, fullH, fullW / 2 - ax * W, fullH / 2 - ay * H, W, H)
    cam.updateMatrixWorld()

    const escena = estadoRecorrido.escena
    if (!escena) return
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

function Escena({ calidad, alListo }: { calidad: Quality; alListo: () => void }) {
  const ancho = useThree((s) => s.size.width)
  const alto = useThree((s) => s.size.height)
  const fondo = useFondoEscena(ancho, alto)
  const invalidate = useThree((s) => s.invalidate)
  useLayoutEffect(() => invalidate(), [ancho, alto, invalidate])
  return (
    <>
      <CamaraRecorrido />
      <Pasadas />
      <LuzImplantes />
      <Suspense fallback={null}>
        <Cuerpo calidad={calidad} fondo={fondo} />
        <Implantes />
        <Miniaturas />
        <Listo alListo={alListo} />
      </Suspense>
    </>
  )
}

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
  return (
    <Canvas
      frameloop={activa ? 'demand' : 'never'}
      dpr={dpr}
      camera={{ position: [0, 0.85, 4], fov: FOV, near: 0.05, far: 20 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
      <Escena calidad={calidad} alListo={alListo} />
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
