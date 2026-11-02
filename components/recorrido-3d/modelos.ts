import { useLoader } from '@react-three/fiber'
import { LoadingManager } from 'three'
import { GLTFLoader, MeshoptDecoder } from 'three-stdlib'
import { avanzar, completar } from '../carga'

// Los .glb del cuerpo y de los implantes, con el progreso de su descarga
// para la pantalla de carga (components/carga.ts). Es lo mismo que
// useGLTF(url, false, true) de drei (sin Draco, con meshopt: ver
// node_modules/@react-three/drei/core/Gltf.js), pero useGLTF no expone el
// onProgress de useLoader. La clave de caché sigue siendo [GLTFLoader, url],
// y cada archivo se pide una sola vez (la caché es por pedido: pedirlos como
// lista los volvía a descargar).
//
// El avance en bytes llega por onProgress (three FileLoader lo saca del
// Content-Length); el final, por el gestor de carga, cuando el archivo
// terminó de bajar (antes de decodificarlo: el primer cuadro dibujado es otra
// tarea).

const gestor = new LoadingManager(undefined, (url) => completar(url))

let decodificador: ReturnType<typeof MeshoptDecoder> | undefined

function extensiones(loader: GLTFLoader) {
  loader.manager = gestor
  decodificador ??= MeshoptDecoder()
  loader.setMeshoptDecoder(decodificador)
}

function progreso(url: string) {
  return (e: ProgressEvent) => {
    if (e.lengthComputable && e.total > 0) avanzar(url, e.loaded / e.total)
  }
}

export function useModelo(url: string) {
  return useLoader(GLTFLoader, url, extensiones, progreso(url))
}
