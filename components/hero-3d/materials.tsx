'use client'

import { MeshTransmissionMaterial } from '@react-three/drei'
import { Color } from 'three'

// Materiales del cuerpo de vidrio, asignados por nombre de malla
// (body-model.tsx). Ver docs/ARQUITECTURA_MODELO_3D.md, "Capas".

export type Quality = 'alta' | 'media' | 'baja'

// El canvas es transparente: el vidrio refracta lo que hay "detrás" en su
// propio buffer, y le damos el fondo de la página (--color-surface).
const PAGE_BACKGROUND = new Color('#f5f7f9')

// La piel es el único material caro: renderiza la escena en un buffer propio
// cada cuadro (y otra vez para la cara trasera, con backside). No usa
// transmissionSampler porque ese buffer no ve objetos transparentes, y el
// hueso lo es. Sin resolution, el buffer es del tamaño del canvas: con uno
// fijo de 512 px, la malla de la craneoplastía se pixela.
const GLASS_QUALITY = {
  alta: { samples: 10, backside: true, chromaticAberration: 0.03 },
  media: { samples: 6, backside: false, chromaticAberration: 0.02 },
  baja: { samples: 3, resolution: 512, backside: false, chromaticAberration: 0 },
} as const

export function Glass({ quality }: { quality: Quality }) {
  return (
    <MeshTransmissionMaterial
      {...GLASS_QUALITY[quality]}
      backsideThickness={0.04}
      thickness={0.05}
      roughness={0.07}
      ior={1.22}
      anisotropicBlur={0.1}
      color="#e3edf6"
      background={PAGE_BACKGROUND}
    />
  )
}

// Hueso blanco lechoso y tenue, sin transmisión: se lee como anatomía a
// través del vidrio sin competir con el implante.
export function Bone({ opacity }: { opacity: number }) {
  return (
    <meshPhysicalMaterial
      color="#f4f1ea"
      roughness={0.55}
      sheen={0.4}
      sheenColor="#ffffff"
      transparent
      opacity={opacity}
      depthWrite={false}
    />
  )
}

// Titanio de impresión 3D: gris oscuro y mate. El de CNC (pulido) va con
// roughness bajo, cuando estén esos implantes.
export function TrabecularTitanium() {
  return <meshStandardMaterial color="#9aa1aa" metalness={1} roughness={0.5} />
}
