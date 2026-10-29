'use client'

import { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import type { Mesh, Object3D } from 'three'
import { Bone, Glass, TrabecularTitanium, type Quality } from './materials'

// Anatomía e implantes van en archivos separados (licencia del atlas: ver
// docs/ARQUITECTURA_MODELO_3D.md, "Archivos"). Por ahora, el prototipo de
// cabeza: el busto y la craneoplastía. Comprimidos con meshopt, que useGLTF
// decodifica sin descargar nada más; Draco queda apagado.
const ANATOMY_URL = '/modelos/cabeza.glb'
const IMPLANTS_URL = '/modelos/implantes.glb'

export function preloadBodyModels() {
  useGLTF.preload(ANATOMY_URL, false, true)
  useGLTF.preload(IMPLANTS_URL, false, true)
}

function meshesOf(root: Object3D) {
  const meshes: Mesh[] = []
  root.traverse((node) => {
    if ((node as Mesh).isMesh) meshes.push(node as Mesh)
  })
  return meshes
}

// El material sale del nombre de la malla: piel, hueso_<zona> o
// implante_<pieza>. Una pieza CAD de Innercare reemplaza a la generada con
// solo respetar el nombre.
function MaterialFor({ name, quality, boneOpacity }: {
  name: string
  quality: Quality
  boneOpacity: number
}) {
  if (name === 'piel') return <Glass quality={quality} />
  if (name.startsWith('hueso_')) return <Bone opacity={boneOpacity} />
  return <TrabecularTitanium />
}

export function BodyModel({ quality, boneOpacity }: { quality: Quality; boneOpacity: number }) {
  const anatomy = useGLTF(ANATOMY_URL, false, true)
  const implants = useGLTF(IMPLANTS_URL, false, true)
  const meshes = useMemo(
    () => [...meshesOf(anatomy.scene), ...meshesOf(implants.scene)],
    [anatomy.scene, implants.scene],
  )

  return (
    <group>
      {meshes.map((mesh) => (
        <mesh
          key={mesh.uuid}
          name={mesh.name}
          geometry={mesh.geometry}
          position={mesh.position}
          quaternion={mesh.quaternion}
          scale={mesh.scale}
        >
          <MaterialFor name={mesh.name} quality={quality} boneOpacity={boneOpacity} />
        </mesh>
      ))}
    </group>
  )
}
