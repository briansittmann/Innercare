// Páginas del slot que devuelven null para cerrar el panel de contacto al
// navegar a otra ruta (los slots conservan su estado en la navegación del
// lado del cliente): una por ruta real del sitio, en vez de un [...catchAll].
// El catch-all, con el layout del sitio en el grupo (sitio), hacía que
// `next dev` respondiera 404 en /keystatic (docs/landing/textos-editables/
// INVESTIGACION-KEYSTATIC.md, sección 2).
export default function ModalInicio() {
  return null
}
