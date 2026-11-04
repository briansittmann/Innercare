import { PaginaNoEncontrada } from '@/components/pagina-no-encontrada'
import '../../globals.css'

// 404 de marca de /keystatic cuando el panel no está habilitado (producción
// sin Keystatic Cloud): la dispara el notFound() de [[...params]]/page.tsx.
// globals.css se importa acá y no en el layout: Next carga el CSS de un
// not-found solo cuando lo renderiza, así que con el panel habilitado el
// preflight de Tailwind no toca la interfaz de Keystatic.
export default function PanelNoEncontrado() {
  return <PaginaNoEncontrada />
}
