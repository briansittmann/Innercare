'use client'

import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshTransmissionMaterial, useFBO } from '@react-three/drei'
import { NoToneMapping, UnsignedByteType, type Mesh, type Texture } from 'three'

// Materiales del cuerpo de vidrio, asignados por nombre de malla
// (body-model.tsx). Ver docs/ARQUITECTURA_MODELO_3D.md, "Capas".

export type Quality = 'alta' | 'media' | 'baja'

// La calidad solo cambia cuántas muestras toma la refracción: el aspecto es
// el mismo en las tres, para que un cambio a mitad del giro no se note.
const REFRACTION_SAMPLES: Record<Quality, number> = { alta: 10, media: 4, baja: 3 }

// Lo que se ve a través del vidrio: la escena sin la piel, dibujada en un
// buffer propio cada cuadro. El de Drei no tiene antialiasing, y las barras
// finas de la craneoplastía se dentaban; este usa MSAA. No sirve
// transmissionSampler: ese buffer no ve objetos transparentes, y el hueso lo
// es. El canvas es transparente (el fondo es CSS), así que el buffer lleva
// como fondo `background`: el tramo del degradé que queda detrás del canvas.
// Devuelve el ref para la malla de vidrio y la textura para su material.
export function useGlassBuffer(background: Texture) {
  const glass = useRef<Mesh>(null)
  const target = useFBO({ samples: 2, type: UnsignedByteType })
  useFrame(({ gl, scene, camera }) => {
    const mesh = glass.current
    if (!mesh) return
    // Sin tone mapping: se aplica una sola vez, al dibujar el vidrio
    const toneMapping = gl.toneMapping
    const visibleBackground = scene.background
    gl.toneMapping = NoToneMapping
    scene.background = background
    mesh.visible = false
    gl.setRenderTarget(target)
    gl.render(scene, camera)
    gl.setRenderTarget(null)
    mesh.visible = true
    scene.background = visibleBackground
    gl.toneMapping = toneMapping
  })
  return [glass, target.texture as Texture] as const
}

// Vidrio celeste de la marca: el color tiñe todo, y la atenuación agrega más
// azul donde el vidrio es más grueso (cuello y hombros), así los bordes
// quedan claros, como en la referencia.
export function Glass({ quality, buffer }: { quality: Quality; buffer: Texture }) {
  return (
    <MeshTransmissionMaterial
      buffer={buffer}
      samples={REFRACTION_SAMPLES[quality]}
      thickness={0.05}
      roughness={0.06}
      ior={1.25}
      chromaticAberration={0}
      anisotropicBlur={0.1}
      color="#c8e1fa"
      attenuationColor="#5b9ee0"
      attenuationDistance={0.35}
      clearcoat={1}
      clearcoatRoughness={0.1}
    />
  )
}

// Hueso blanco lechoso y tenue, sin transmisión: se lee como anatomía a
// través del vidrio sin competir con el implante.
export function Bone({ opacity }: { opacity: number }) {
  return (
    <meshPhysicalMaterial
      color="#f7f5f0"
      roughness={0.55}
      sheen={0.4}
      sheenColor="#ffffff"
      transparent
      opacity={opacity}
      depthWrite={false}
    />
  )
}

// Titanio de impresión 3D: gris y mate. El de CNC (pulido) va con roughness
// bajo, cuando estén esos implantes.
export function TrabecularTitanium() {
  return <meshStandardMaterial color="#9aa1aa" metalness={1} roughness={0.5} />
}
