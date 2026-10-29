// Al navegar con un enlace a cualquier otra ruta, el slot tiene que coincidir
// con algo que devuelva null para que el panel se cierre (los slots conservan
// su estado en la navegación del lado del cliente).
export default function CatchAll() {
  return null
}
