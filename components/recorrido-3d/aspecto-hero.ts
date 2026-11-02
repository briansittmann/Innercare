// Aspecto del hero en la escena única: lo que el cuerpo necesita para verse
// como el busto de vidrio de antes en la toma 0 (vidrio, titanio, hueso,
// corte bajo el cuello y degradé de fondo). Los valores salen del busto que
// había en components/hero-3d/ (borrado en la fase 5 del cuerpo único) y de
// docs/landing/cuerpo-unico/base/MEDICIONES.md.

import { useEffect, useMemo } from 'react'
import { useThree } from '@react-three/fiber'
import { CanvasTexture, Color, SRGBColorSpace, type Material } from 'three'

// Fondo del hero: el degradé de --color-stage-from a --color-stage-to
// (globals.css). Si cambian ahí, cambian acá.
const STAGE_FROM = '#e6eef8'
const STAGE_TO = '#c3d7ee'

// El tramo [arriba, abajo] del degradé (fracciones del alto de la sección)
// que queda detrás del canvas, en una textura de 2 × 512 px: el fondo que
// refracta el vidrio.
export function useTexturaDegrade(tramo: readonly [number, number] | null) {
  const arriba = tramo?.[0] ?? 0
  const abajo = tramo?.[1] ?? 1
  const textura = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 2
    canvas.height = 512
    const map = new CanvasTexture(canvas)
    map.colorSpace = SRGBColorSpace
    pintarDegrade(map, arriba, abajo)
    return map
  }, [arriba, abajo])
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    invalidate()
    return () => textura.dispose()
  }, [textura, invalidate])
  return textura
}

// Repinta la textura del degradé con otro tramo, sin crear otra (el desliz
// del hero en el celular la mueve cuadro a cuadro)
export function pintarDegrade(textura: CanvasTexture, arriba: number, abajo: number) {
  const canvas = textura.image as HTMLCanvasElement
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const tramoAlto = abajo - arriba
  const g = ctx.createLinearGradient(
    0,
    (-arriba / tramoAlto) * canvas.height,
    0,
    ((1 - arriba) / tramoAlto) * canvas.height,
  )
  g.addColorStop(0, STAGE_FROM)
  g.addColorStop(1, STAGE_TO)
  ctx.fillStyle = g
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  textura.needsUpdate = true
}

// Vidrio del busto (el del hero de antes) y del recorrido: la escena pasa de
// uno al otro con el peso del hero (camara.ts, pesoHero).
// El espesor del vidrio de three se multiplica por la escala de la malla, y
// la compresión (meshopt) guarda en la escala del nodo la cuantización de las
// posiciones: depende del tamaño de cada malla. La piel del busto
// (el antiguo cabeza.glb) tenía escala 0,2117 y la del cuerpo (sus tres trozos), 0,8496, así
// que el mismo `thickness` da un vidrio casi cuatro veces más grueso (más
// azul y más oscuro) en el cuerpo. Por eso el del hero va en metros del
// mundo (0,05 × 0,2117) y la escena lo divide por la escala de su piel.
const ESCALA_PIEL_BUSTO = 0.21169155091047287
export const ESPESOR_HERO_MUNDO = 0.05 * ESCALA_PIEL_BUSTO

// (el espesor, aparte: ESPESOR_HERO_MUNDO)
export const VIDRIO_HERO = {
  roughness: 0.06,
  ior: 1.25,
  color: new Color('#c8e1fa'),
  attenuationColor: new Color('#5b9ee0'),
  attenuationDistance: 0.35,
  clearcoatRoughness: 0.1,
  envMapIntensity: 1,
}

export const VIDRIO_RECORRIDO = {
  thickness: 0.06,
  roughness: 0.05,
  ior: 1.28,
  color: new Color('#eaf3fd'),
  attenuationColor: new Color('#3f86d6'),
  attenuationDistance: 0.22,
  clearcoatRoughness: 0.08,
  envMapIntensity: 1.4,
}

// Hueso: 0,4 en el busto y 0,34 en el recorrido
export const OPACIDAD_HUESO_HERO = 0.4

// Los huesos del busto de antes: el resto del esqueleto no se
// ve en la toma del hero. El maxilar va entero (hueso_maxilar_entero): el
// recortado y su implante entran en la parada del maxilar.
// De la columna, solo las vértebras de arriba del corte: hueso_columna_alta
// (3d/scripts/partir.mjs la separa al exportar). Son las mallas de
// CUERPO.hero (implantes.ts), salvo la piel.
export const HUESOS_BUSTO = new Set([
  'hueso_craneo',
  'hueso_maxilar_entero',
  'hueso_mandibula',
  'hueso_columna_alta',
])

// Titanio de la craneoplastía en el busto: dentro del vidrio, refractado
export const TITANIO_HERO = { color: '#9aa1aa', metalness: 1, roughness: 0.5 }

// Corte del hero: el cuerpo no se ve cortado nunca, sigue más allá del borde
// de abajo de la pantalla (un cuerpo gigante, no un busto). El busto de antes
// se cortaba a 1,33 m, y en el giro (la entrada desde 117° y el vaivén hasta
// 22°) asomaba el hombro del lado lejano: en la toma del hero llega a verse
// piel desde 1,286 m (vaivén de frente, escritorio y celular, medido sobre la
// malla). El corte va a 1,22 m, con 6 cm de margen; 3d/scripts/partir.mjs
// parte la piel y la columna a la misma altura, así el hero carga lo que
// llega hasta ahí. Se hace con un desvanecido por altura: debajo de `corte`
// todo es transparente y en los `banda` metros de arriba vuelve a ser opaco.
// En la toma del hero la banda es casi nula; con el scroll, el corte baja y la
// banda se ensancha para revelar el cuerpo.
export const CORTE_PIEL = 1.22
export const CORTE_HUESO = 1.22

export type UniformesCorte = {
  corteY: { value: number }
  corteBanda: { value: number }
}

export const uniformesCorte = (corte: number): UniformesCorte => ({
  corteY: { value: corte },
  corteBanda: { value: 0.004 },
})

const conCorte = new WeakSet<Material>()

// Suma el desvanecido por altura a un material ya creado, sin pisar su
// propio onBeforeCompile (el vidrio de drei arma el suyo). La altura es la
// del mundo (Y hacia arriba, pies en 0). El material tiene que ser
// transparente para que la banda se funda; debajo del corte se descarta.
export function aplicarCorte(material: Material, uniformes: UniformesCorte) {
  if (conCorte.has(material)) return
  conCorte.add(material)
  const previo = material.onBeforeCompile.bind(material)
  const clave = material.customProgramCacheKey()
  material.onBeforeCompile = (shader, renderer) => {
    previo(shader, renderer)
    shader.uniforms.corteY = uniformes.corteY
    shader.uniforms.corteBanda = uniformes.corteBanda
    shader.vertexShader =
      'varying float vCorteY;\n' +
      shader.vertexShader.replace(
        'void main() {',
        'void main() {\n  vCorteY = (modelMatrix * vec4(position, 1.0)).y;',
      )
    const final = shader.fragmentShader.lastIndexOf('}')
    shader.fragmentShader =
      'uniform float corteY;\nuniform float corteBanda;\nvarying float vCorteY;\n' +
      shader.fragmentShader.slice(0, final) +
      '  float corteF = smoothstep(corteY, corteY + corteBanda, vCorteY);\n' +
      // Opaco: corte recto, sin tocar el alfa. Con alfa menor que 1 en un
      // material opaco el canvas (premultiplicado) aclaraba el borde del
      // corte hasta el blanco. El busto tampoco tiene banda: su tapa se ve
      // de atrás y no se dibuja, así que el corte se ve abierto y recto.
      '#ifdef OPAQUE\n' +
      '  if (corteF < 0.5) discard;\n' +
      '#else\n' +
      '  if (corteF <= 0.0) discard;\n' +
      '  gl_FragColor.a *= corteF;\n' +
      '#endif\n' +
      shader.fragmentShader.slice(final)
  }
  material.customProgramCacheKey = () => `corte|${clave}`
  material.needsUpdate = true
}
