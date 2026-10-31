'use client'

import { useRef, type RefObject } from 'react'
import { useFrame } from '@react-three/fiber'
import { useFBO } from '@react-three/drei'
import { NoToneMapping, UnsignedByteType, type Mesh, type Object3D, type Texture } from 'three'

// Piezas del cuerpo de vidrio que venían del busto del hero (el antiguo
// components/hero-3d/materials.tsx), hoy solo de la escena única
// (escena.tsx). Ver docs/ARQUITECTURA_MODELO_3D.md, "Capas".

export type Quality = 'alta' | 'media' | 'baja'

// Lo que se ve a través del vidrio: la escena sin la piel, dibujada en un
// buffer propio cada cuadro. El de Drei no tiene antialiasing, y las barras
// finas de la craneoplastía se dentaban; este usa MSAA. No sirve
// transmissionSampler: ese buffer no ve objetos transparentes, y el hueso lo
// es. El canvas es transparente (el fondo es CSS), así que el buffer lleva
// como fondo `background`: el tramo del degradé que queda detrás del canvas.
// Devuelve el ref para la malla de vidrio (o el grupo de mallas de vidrio)
// y la textura para su material.
// `clip` (opcional): si tiene un rectángulo (x, y, ancho, alto en píxeles
// CSS del canvas, origen abajo a la izquierda, como gl.setScissor), el
// buffer se dibuja solo ahí (la caja del busto en la toma del hero).
export function useGlassBuffer<T extends Object3D = Mesh>(
  background: Texture,
  clip?: RefObject<readonly [number, number, number, number] | null>,
) {
  const glass = useRef<T>(null)
  const target = useFBO({ samples: 2, type: UnsignedByteType })
  useFrame(({ gl, scene, camera }) => {
    const mesh = glass.current
    if (!mesh) return
    const rect = clip?.current
    // Sin tone mapping: se aplica una sola vez, al dibujar el vidrio
    const toneMapping = gl.toneMapping
    const visibleBackground = scene.background
    gl.toneMapping = NoToneMapping
    scene.background = background
    mesh.visible = false
    gl.setRenderTarget(target)
    if (rect) {
      gl.setScissor(...rect)
      gl.setScissorTest(true)
    }
    gl.render(scene, camera)
    if (rect) gl.setScissorTest(false)
    gl.setRenderTarget(null)
    mesh.visible = true
    scene.background = visibleBackground
    gl.toneMapping = toneMapping
  })
  return [glass, target.texture as Texture] as const
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
