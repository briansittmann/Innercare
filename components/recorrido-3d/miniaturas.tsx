'use client'

import { useEffect, useMemo, useRef, type RefObject } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, View } from '@react-three/drei'
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler.js'
import {
  AlwaysDepth,
  BufferAttribute,
  BufferGeometry,
  DoubleSide,
  Euler,
  Matrix3,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Quaternion,
  ShaderMaterial,
  Vector3,
  type WebGLRenderer,
  type Group,
  type Object3D,
  type PerspectiveCamera as Camara,
  type Scene,
} from 'three'
import { ANCHO_CELULAR, ORDEN_PARADAS, TOMAS_PARADA, clamp, pesoTarjeta } from './camara'
import { estadoRecorrido } from './estado'
import { IMPLANTES, IMPLANTES_GLB, IMPLANTES_RECORRIDO_GLB, type Implante } from './implantes'
import { useModelo } from './modelos'

// Miniaturas de las tarjetas del recorrido: el ensamble de partículas del
// guion (docs/landing/LANDING_SPEC.md, sección 4, y drawMini del borrador).
// Las partículas salen de la superficie de cada implante real
// (MeshSurfaceSampler sobre implantes-recorrido.glb y la craneoplastía de
// implantes.glb), viajan desde una nube hasta la pieza con un retraso por
// partícula (0 a 0,4) y, pasado el 82 % del ensamble, aparece el modelo
// sólido en titanio; las partículas quedan tenues encima. Después la pieza
// se mece despacio (borrador: ±0,5 rad, sin(t × 0,6)).
//
// El ensamble se dispara cuando la tarjeta se activa (su peso pasa de 0,5) y
// queda sólido mientras la tarjeta se ve; al irse, vuelve a la nube para la
// próxima vez. Con movimiento reducido, sólido y quieto directamente.
//
// Todas las miniaturas son vistas (View de drei, con `track` sobre el lugar
// [data-miniatura-3d] de cada tarjeta) del MISMO canvas del recorrido: no hay
// otro contexto WebGL. El canvas está debajo de las tarjetas; con la escena
// lista (data-listo), la tarjeta pasa a fondo transparente y su miniatura
// pinta el fondo de la tarjeta alrededor con una sombra extendida
// (globals.css, .mini-parada): queda un hueco por el que se ve el canvas.
// Cada vista dibuja primero el fondo de la miniatura (el color de la tarjeta
// y la luz azul del borrador) con la opacidad de la tarjeta, así se funde
// igual que ella.

const DURACION_ENSAMBLE = 1700 // ms
const PARTICULAS_ESCRITORIO = 2400
const PARTICULAS_CELULAR = 1500
const FOV = 20
const ORDEN_VISTA = 2 // después de las pasadas del cuerpo (prioridad 1)

// Colores sRGB tal cual (los shaders propios no convierten espacio de color)
const AZUL = [0x22 / 255, 0x60 / 255, 0xa1 / 255] as const // --color-hueso
const TARJETA = [0xfc / 255, 0xfd / 255, 0xfe / 255] as const // --color-surface-container-lowest

function mallasDe(root: Object3D) {
  const mallas: Mesh[] = []
  root.traverse((nodo) => {
    if ((nodo as Mesh).isMesh) mallas.push(nodo as Mesh)
  })
  return mallas
}

type Datos = {
  puntos: BufferGeometry
  geometria: BufferGeometry
  // Lleva la malla del archivo al espacio normalizado (centrada, radio 1)
  normalizar: Matrix4
  alargada: boolean
  // Medio largo (en el eje vertical del cuerpo) y radio alrededor de ese
  // eje, en el espacio normalizado: para encuadrar la pieza justa
  largo: number
  ancho: number
}

// Muestrea la superficie de la pieza y arma la nube de partida
function prepararPieza(malla: Mesh, n: number): Datos {
  malla.updateWorldMatrix(true, false)
  const m = malla.matrixWorld.clone()
  const nm = new Matrix3().getNormalMatrix(m)
  const muestreador = new MeshSurfaceSampler(new Mesh(malla.geometry)).build()
  const p = new Vector3()
  const nrm = new Vector3()
  const pos = new Float32Array(n * 3)
  const normales = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) {
    muestreador.sample(p, nrm)
    p.applyMatrix4(m)
    nrm.applyMatrix3(nm).normalize()
    pos.set([p.x, p.y, p.z], i * 3)
    normales.set([nrm.x, nrm.y, nrm.z], i * 3)
  }
  // Centro (de la caja) y radio
  const min = new Vector3(Infinity, Infinity, Infinity)
  const max = new Vector3(-Infinity, -Infinity, -Infinity)
  for (let i = 0; i < n; i++) {
    p.fromArray(pos, i * 3)
    min.min(p)
    max.max(p)
  }
  const centro = min.clone().add(max).multiplyScalar(0.5)
  let radio = 0
  for (let i = 0; i < n; i++) radio = Math.max(radio, p.fromArray(pos, i * 3).distanceTo(centro))
  for (let i = 0; i < n; i++) {
    p.fromArray(pos, i * 3).sub(centro).divideScalar(radio)
    pos.set([p.x, p.y, p.z], i * 3)
  }
  const tam = max.clone().sub(min)
  const alargada = tam.y > 1.6 * Math.max(tam.x, tam.z)
  let largo = 0
  let ancho = 0
  for (let i = 0; i < n; i++) {
    p.fromArray(pos, i * 3)
    largo = Math.max(largo, Math.abs(p.y))
    ancho = Math.max(ancho, Math.hypot(p.x, p.z))
  }

  // Nube de partida (borrador: radio de 0,73 a 1,53 del tamaño de la pieza)
  const inicio = new Float32Array(n * 3)
  const retraso = new Float32Array(n)
  const fase = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    p.randomDirection().multiplyScalar(0.73 + Math.random() * 0.8)
    inicio.set([p.x, p.y * 0.7, p.z], i * 3)
    retraso[i] = Math.random() * 0.4
    fase[i] = Math.random() * Math.PI * 2
  }
  const puntos = new BufferGeometry()
  puntos.setAttribute('position', new BufferAttribute(pos, 3))
  puntos.setAttribute('normal', new BufferAttribute(normales, 3))
  puntos.setAttribute('aInicio', new BufferAttribute(inicio, 3))
  puntos.setAttribute('aRetraso', new BufferAttribute(retraso, 1))
  puntos.setAttribute('aFase', new BufferAttribute(fase, 1))
  // La nube y la pieza ocupan la esfera unidad
  puntos.boundingSphere = null
  puntos.computeBoundingSphere()

  const normalizar = new Matrix4()
    .makeScale(1 / radio, 1 / radio, 1 / radio)
    .multiply(new Matrix4().makeTranslation(-centro.x, -centro.y, -centro.z))
    .multiply(m)
  return { puntos, geometria: malla.geometry, normalizar, alargada, largo, ancho }
}

function materialPuntos() {
  return new ShaderMaterial({
    uniforms: {
      uA: { value: 0 },
      uTiempo: { value: 0 },
      uSolido: { value: 0 },
      uPeso: { value: 0 },
      uPx: { value: 1 },
      uColor: { value: new Vector3(...AZUL) },
    },
    vertexShader: /* glsl */ `
      attribute vec3 aInicio;
      attribute float aRetraso;
      attribute float aFase;
      uniform float uA;
      uniform float uTiempo;
      uniform float uSolido;
      uniform float uPeso;
      uniform float uPx;
      varying float vAlfa;
      void main() {
        // Cada partícula sale con su retraso y viaja el 60 % del ensamble
        float a = clamp((uA - aRetraso) / 0.6, 0.0, 1.0);
        a = a * a * (3.0 - 2.0 * a);
        vec3 p = mix(aInicio, position, a);
        // Flotan mientras están sueltas
        p.y += sin(uTiempo * 1.2 + aFase) * 0.04 * (1.0 - a);
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        // Contorno: las partículas donde la superficie se pone de canto,
        // más grandes (las de borde del borrador)
        vec3 n = normalize(normalMatrix * normal);
        float canto = 1.0 - abs(dot(n, normalize(-mv.xyz)));
        float borde = smoothstep(0.55, 0.85, canto) * a;
        gl_PointSize = mix(1.7, 2.6, borde) * uPx;
        gl_Position = projectionMatrix * mv;
        // Con la pieza sólida se apagan casi del todo: contorno limpio
        vAlfa = (0.9 - uSolido * 0.84) * uPeso * mix(0.75, 1.0, borde);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      varying float vAlfa;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        gl_FragColor = vec4(uColor, vAlfa * smoothstep(0.5, 0.25, d));
      }
    `,
    transparent: true,
    depthWrite: false,
  })
}

// Fondo de la miniatura: el de la tarjeta con la luz azul del borrador, que
// se desvanece del todo antes de los bordes (si no, queda un corte recto
// arriba y abajo). Se dibuja primero, en el plano lejano y siempre (limpia la
// profundidad de la vista).
function materialFondo() {
  return new ShaderMaterial({
    uniforms: {
      uPeso: { value: 0 },
      uTarjeta: { value: new Vector3(...TARJETA) },
      uAzul: { value: new Vector3(...AZUL) },
    },
    vertexShader: /* glsl */ `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position.xy * 2.0, 1.0, 1.0);
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uPeso;
      uniform vec3 uTarjeta;
      uniform vec3 uAzul;
      varying vec2 vUv;
      void main() {
        float d = length((vUv - 0.5) / 0.5);
        float luz = 0.14 * (1.0 - smoothstep(0.0, 0.96, d));
        gl_FragColor = vec4(mix(uTarjeta, uAzul, luz), uPeso);
      }
    `,
    transparent: true,
    depthFunc: AlwaysDepth,
    depthWrite: true,
  })
}

const Z = new Vector3(0, 0, 1)
const eje = new Vector3()
const q1 = new Quaternion()
const q2 = new Quaternion()

// Qué miniaturas se están ensamblando. Mientras alguna lo hace, pide un
// cuadro por refresco (el canvas dibuja a demanda); cuando ninguna, el bucle
// se detiene. También si el canvas dejó de dibujar (el recorrido salió de
// pantalla en pleno ensamble): sin cuadros, nadie actualiza `activos`.
class Latido {
  private activos: boolean[] = []
  private cuadro = 0
  private ultimo = 0
  private invalidar: (() => void) | null = null

  conectar(invalidar: (() => void) | null) {
    this.invalidar = invalidar
    if (!invalidar) {
      cancelAnimationFrame(this.cuadro)
      this.cuadro = 0
    }
  }

  marcar(i: number, v: boolean) {
    this.activos[i] = v
    this.ultimo = performance.now()
    if (v && !this.cuadro && this.invalidar) this.cuadro = requestAnimationFrame(this.latir)
  }

  private latir = () => {
    this.cuadro = 0
    const parado = performance.now() - this.ultimo > 400
    if (parado || !this.activos.some(Boolean) || !this.invalidar) return
    this.invalidar()
    this.cuadro = requestAnimationFrame(this.latir)
  }
}

// Materiales y estado de una miniatura, actualizados en cada cuadro
class EstadoMiniatura {
  readonly puntos = materialPuntos()
  readonly fondo = materialFondo()
  readonly metal: MeshStandardMaterial
  private inicio: number | null = null
  private calentado = false
  private base: Quaternion

  constructor(
    implante: Implante,
    private readonly indice: number,
    private readonly datos: Datos,
    private readonly elemento: RefObject<HTMLElement | null>,
  ) {
    // El titanio de los implantes del recorrido (escena.tsx)
    this.metal = new MeshStandardMaterial({
      // Metal pleno: sobre el blanco de la tarjeta, el titanio del cuerpo
      // (con luz de relleno) quedaba blanco sobre blanco. Así toma el
      // contraste del estudio de luz: reflejos oscuros y brillos netos.
      color: implante.acabado === 'pulido' ? '#e4e8ee' : '#cfd5dd',
      metalness: 1,
      roughness: implante.acabado === 'pulido' ? 0.16 : 0.3,
      envMapIntensity: 2.4,
      transparent: true,
      side: DoubleSide,
    })
    // Orientación de base: la pieza vista desde donde la mira su parada
    const toma = TOMAS_PARADA[implante.parada]
    this.base = new Quaternion().setFromEuler(new Euler(toma.elevacion, -toma.azimut, 0, 'XYZ'))
  }

  liberar() {
    this.puntos.dispose()
    this.fondo.dispose()
    this.metal.dispose()
  }

  // Compila los programas de la vista una sola vez, en el primer cuadro con
  // el estudio de luz listo (ver Miniatura)
  calentar(gl: WebGLRenderer, escena: Scene, raiz: Scene, grupo: Group | null, cam: Camara | null) {
    if (this.calentado || !raiz.environment || !grupo || !cam) return
    this.calentado = true
    this.metal.envMap = raiz.environment
    escena.environment = raiz.environment
    grupo.visible = true
    gl.compileAsync(escena, cam).catch(() => {})
    grupo.visible = false
  }

  cuadro(
    escena: Scene,
    raiz: Scene,
    pixeles: number,
    grupo: Group | null,
    cam: Camara | null,
    latido: Latido,
  ) {
    if (!grupo || !cam) return
    // El estudio de luz del cuerpo (Environment de la escena principal): la
    // escena de la vista es otra y no lo hereda
    if (escena.environment !== raiz.environment) escena.environment = raiz.environment
    if (this.metal.envMap !== raiz.environment) {
      this.metal.envMap = raiz.environment
      this.metal.needsUpdate = true
    }
    const { seg, reducido, minis } = estadoRecorrido
    const w = pesoTarjeta(seg, this.indice, reducido)
    const ahora = performance.now()
    if (w < 0.02 || !minis) this.inicio = null
    else if (w > 0.5 && this.inicio === null) this.inicio = ahora
    const A = reducido ? 1 : this.inicio === null ? 0 : clamp((ahora - this.inicio) / DURACION_ENSAMBLE)
    latido.marcar(this.indice, !reducido && w > 0.02 && this.inicio !== null && A < 1)
    const solido = clamp((A - 0.82) / 0.18)
    grupo.visible = w > 0.01
    this.fondo.uniforms.uPeso!.value = w
    if (!grupo.visible) return

    const u = this.puntos.uniforms
    u.uA!.value = A
    u.uTiempo!.value = reducido ? 0 : ahora / 1000
    u.uSolido!.value = solido
    u.uPeso!.value = w
    u.uPx!.value = pixeles
    this.metal.opacity = solido * w
    this.metal.depthWrite = this.metal.opacity > 0.5

    // Encuadre: las piezas largas (hombro, fémur, intercalar) se giran en
    // el plano de la pantalla hasta el ángulo en que más llenan la
    // miniatura (paradas en una cuadrada, acostadas en la hoja del celular,
    // en diagonal entre las dos). El vaivén gira alrededor del eje largo.
    const rect = this.elemento.current?.getBoundingClientRect()
    const aspecto = rect && rect.height > 0 ? rect.width / rect.height : 1.6
    const { largo, ancho, alargada } = this.datos
    let angulo = 0
    let escala = 0
    const pasos = alargada ? 18 : 0
    for (let k = 0; k <= pasos; k++) {
      const a = (k / 18) * (Math.PI / 2)
      const w = largo * Math.sin(a) + ancho * Math.cos(a)
      const h = largo * Math.cos(a) + ancho * Math.sin(a)
      const e = Math.min(aspecto / w, 1 / h)
      if (e > escala * 1.01) {
        escala = e
        angulo = a
      }
    }
    const vaiven = reducido ? 0 : Math.sin((ahora / 1000) * 0.6) * 0.5
    eje.set(-Math.sin(angulo), Math.cos(angulo), 0)
    q1.setFromAxisAngle(eje, vaiven)
    q2.setFromAxisAngle(Z, angulo)
    grupo.quaternion.copy(q1).multiply(q2).multiply(this.base)

    // Distancia para que entre la pieza con un margen (borrador: 92 %). La
    // vista de la parada la inclina un poco: un 6 % más de aire.
    const t = Math.tan(((FOV / 2) * Math.PI) / 180)
    const medioAncho = (largo * Math.sin(angulo) + ancho * Math.cos(angulo)) * 1.06
    const medioAlto = (largo * Math.cos(angulo) + ancho * Math.sin(angulo)) * 1.06
    const d = Math.max(medioAlto / t, medioAncho / (t * aspecto)) / 0.92 + ancho * 0.5
    cam.position.set(0, 0, d)
    cam.near = Math.max(0.01, d - 2)
    cam.far = d + 2
    cam.updateProjectionMatrix()
  }
}

function Miniatura({
  implante,
  indice,
  elemento,
  raiz,
  datos,
  latido,
}: {
  implante: Implante
  indice: number
  elemento: RefObject<HTMLElement | null>
  raiz: Scene
  datos: Datos
  latido: Latido
}) {
  const grupo = useRef<Group>(null)
  const camara = useRef<Camara>(null)
  const estado = useMemo(
    () => new EstadoMiniatura(implante, indice, datos, elemento),
    [implante, indice, datos, elemento],
  )
  useEffect(() => () => estado.liberar(), [estado])

  // Los programas de la vista (fondo, metal con el estudio de luz, puntos)
  // se compilan en paralelo en el primer cuadro, detrás de la pantalla de
  // carga, y no cuando la tarjeta aparece por primera vez (compilarlos ahí
  // frenaba más de 100 ms). El grupo está oculto hasta su parada: se lo
  // muestra solo mientras compile recorre la escena.
  useFrame(({ gl, scene }) => {
    estado.calentar(gl, scene, raiz, grupo.current, camara.current)
    estado.cuadro(scene, raiz, gl.getPixelRatio(), grupo.current, camara.current, latido)
  })

  return (
    <View track={elemento as RefObject<HTMLElement>} index={ORDEN_VISTA}>
      <PerspectiveCamera ref={camara} makeDefault fov={FOV} position={[0, 0, 6]} />
      <mesh material={estado.fondo} frustumCulled={false} renderOrder={-10}>
        <planeGeometry args={[1, 1]} />
      </mesh>
      {/* Poco relleno, la luz principal de los implantes del cuerpo y un
          contraluz que marca el contorno sobre el blanco de la tarjeta */}
      <hemisphereLight args={['#ffffff', '#8aa2c0', 0.4]} />
      <directionalLight position={[1.5, 3, 4]} intensity={2.6} />
      <directionalLight position={[-3, 1, -2]} intensity={1.2} color="#dbe9fb" />
      <directionalLight position={[0, -1, -4]} intensity={1.6} color="#9fc0ea" />
      <group ref={grupo} visible={false}>
        <mesh
          geometry={datos.geometria}
          material={estado.metal}
          matrix={datos.normalizar}
          matrixAutoUpdate={false}
          renderOrder={1}
        />
        <points geometry={datos.puntos} material={estado.puntos} renderOrder={2} frustumCulled={false} />
      </group>
    </View>
  )
}

// Los .glb de los implantes, cada uno con su useModelo (modelos.ts): la
// caché es por pedido, así que pedirlos como lista volvía a descargar
// implantes.glb, que la craneoplastía del hero ya había pedido sola. Si una
// entrada de IMPLANTES apunta a otro archivo, se suma acá.
export function useArchivosImplantes() {
  const craneo = useModelo(IMPLANTES_GLB)
  const resto = useModelo(IMPLANTES_RECORRIDO_GLB)
  return useMemo(
    () => new Map([[IMPLANTES_GLB, craneo], [IMPLANTES_RECORRIDO_GLB, resto]]),
    [craneo, resto],
  )
}

// Las seis miniaturas. Se montan dentro del Suspense de la escena, con los
// mismos archivos que los implantes del cuerpo (ya en caché).
export function Miniaturas() {
  const raiz = useThree((s) => s.scene)
  const invalidate = useThree((s) => s.invalidate)
  const archivos = useArchivosImplantes()
  const celular = typeof window !== 'undefined' && window.innerWidth < ANCHO_CELULAR
  const piezas = useMemo(
    () =>
      IMPLANTES.flatMap((implante) => {
        const fuente = implante.fuente
        if (fuente.tipo !== 'glb') return []
        const archivo = archivos.get(fuente.url)
        const malla = archivo ? mallasDe(archivo.scene).find((m) => m.name === fuente.malla) : undefined
        const nodo = document.querySelector<HTMLElement>(`[data-miniatura-3d="${implante.parada}"]`)
        if (!malla || !nodo) return []
        return [
          {
            implante,
            indice: ORDEN_PARADAS.indexOf(implante.parada),
            elemento: { current: nodo },
            datos: prepararPieza(malla, celular ? PARTICULAS_CELULAR : PARTICULAS_ESCRITORIO),
          },
        ]
      }),
    [archivos, celular],
  )
  useEffect(() => () => piezas.forEach((p) => p.datos.puntos.dispose()), [piezas])

  // Después del ensamble, el vaivén va con el del cuerpo (30 cuadros por
  // segundo, solo con la escena fija en pantalla).
  const latido = useMemo(() => new Latido(), [])
  useEffect(() => {
    latido.conectar(invalidate)
    return () => latido.conectar(null)
  }, [invalidate, latido])

  return (
    <>
      {piezas.map((p) => (
        <Miniatura key={p.implante.parada} raiz={raiz} latido={latido} {...p} />
      ))}
    </>
  )
}
