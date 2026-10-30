'use client'

import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, useGLTF } from '@react-three/drei'
import {
  BackSide,
  CanvasTexture,
  Color,
  DoubleSide,
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
import { Bone, Glass, useGlassBuffer, type Quality } from '../hero-3d/materials'
import {
  ORDEN_PARADAS,
  TOMAS_PARADA,
  camaraPara,
  opacidadBase,
  pesoTarjeta,
} from './camara'
import { estadoRecorrido } from './estado'
import { IMPLANTES, type Implante } from './implantes'

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

// Brillo del implante activo: un azul de la marca, claro, sumado al metal
const BRILLO = new Color('#4d93e0')

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

function Cuerpo({ calidad, fondo }: { calidad: Quality; fondo: Texture }) {
  const cuerpo = useGLTF(CUERPO_URL, false, true)
  const mallas = useMemo(() => mallasDe(cuerpo.scene), [cuerpo.scene])
  const [piel, buffer] = useGlassBuffer(fondo)
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
          // El vidrio se dibuja al final, sobre el hueso y los implantes
          renderOrder={malla.name === 'piel' ? 2 : 0}
        >
          {malla.name === 'piel' ? (
            <Glass quality={calidad} buffer={buffer} />
          ) : (
            <Bone opacity={OPACIDAD_HUESO} />
          )}
        </mesh>
      ))}
    </group>
  )
}

// Geometría y transformación de cada implante, según su fuente
// (implantes.ts). Las de .glb salen del archivo, con la transformación del
// nodo multiplicada por la de la entrada.
type PiezaLista = { implante: Implante; geometria: BufferGeometry; matriz: Matrix4 }

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
      if (fuente.tipo === 'primitiva') return { implante, geometria: fuente.crear(), matriz, propia: true }
      const archivo = archivos[urls.indexOf(fuente.url)]
      const malla = archivo ? mallasDe(archivo.scene).find((m) => m.name === fuente.malla) : undefined
      if (!malla) throw new Error(`Falta la malla ${fuente.malla} en ${fuente.url}`)
      malla.updateWorldMatrix(true, false)
      return { implante, geometria: malla.geometry, matriz: matriz.multiply(malla.matrixWorld), propia: false }
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

function Implantes() {
  const piezas = usePiezas()
  // Un material por pieza: la opacidad y el brillo cambian con el recorrido.
  // Titanio de impresión 3D gris y mate (el del busto) y de CNC, pulido.
  const materiales = useMemo(
    () =>
      piezas.map(
        ({ implante }) =>
          new MeshStandardMaterial({
            color: implante.acabado === 'pulido' ? '#c9ced6' : '#9aa1aa',
            metalness: 1,
            roughness: implante.acabado === 'pulido' ? 0.2 : 0.5,
            emissive: BRILLO,
            emissiveIntensity: 0,
            transparent: true,
            side: DoubleSide,
          }),
      ),
    [piezas],
  )
  useEffect(() => () => materiales.forEach((m) => m.dispose()), [materiales])

  useFrame(() => {
    const { seg, reducido } = estadoRecorrido
    const base = opacidadBase(seg, reducido)
    piezas.forEach(({ implante }, i) => {
      const material = materiales[i]
      if (!material) return
      const w = pesoTarjeta(seg, ORDEN_PARADAS.indexOf(implante.parada), reducido)
      material.opacity = Math.max(base, w)
      material.emissiveIntensity = 0.55 * w
      material.depthWrite = material.opacity > 0.9
    })
  })

  return (
    <group>
      {piezas.map(({ implante, geometria, matriz }, i) => (
        <mesh
          key={implante.parada}
          name={`implante_${implante.parada}`}
          geometry={geometria}
          matrix={matriz}
          matrixAutoUpdate={false}
          material={materiales[i]}
          renderOrder={1}
        />
      ))}
    </group>
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

  useFrame(({ camera, size }) => {
    const { width: W, height: H } = size
    if (W === 0 || H === 0) return
    const cam = camera as PerspectiveCamera & { manual?: boolean }
    const { seg, reducido } = estadoRecorrido
    const c = camaraPara(seg, W, H, reducido)
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
      <Suspense fallback={null}>
        <Cuerpo calidad={calidad} fondo={fondo} />
        <Implantes />
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
