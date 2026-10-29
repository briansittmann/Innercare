'use client'

import { useRouter } from 'next/navigation'
import {
  useCallback,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { XIcon } from '@phosphor-icons/react/ssr'
import { CloseContactContext } from './close-context'

// Panel lateral de contacto. Lo abre la ruta interceptada app/@modal/(.)contacto
// al navegar dentro del sitio; con un enlace directo o al recargar, /contacto
// se ve como página completa.
//
// <dialog> nativo con showModal(): foco atrapado, Escape y resto de la página
// inerte sin código propio. Entrada y salida con CSS (.contact-panel en
// globals.css). Al cerrar, primero anima la salida y después vuelve atrás en
// el historial, que es lo que desmonta el panel.
export function ContactModal({ children }: { children: ReactNode }) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closingRef = useRef(false)

  // Con Cache Components, Next no desmonta la ruta al salir: la oculta con
  // <Activity> y ejecuta esta limpieza. Hay que cerrar el diálogo a mano (si
  // no, sigue abierto, invisible y dejando la página inerte) y destrabar el
  // scroll. Al volver a mostrarse, se abre otra vez con su entrada.
  // Ver node_modules/next/dist/docs/01-app/02-guides/preserving-ui-state.md.
  useLayoutEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (!dialog.open) dialog.showModal()
    // El foco va al panel (lo anuncia por su título), no al primer control:
    // si no, la X arrancaba con el anillo de foco pintado.
    dialog.focus()
    document.documentElement.dataset.contactOpen = ''
    return () => {
      dialog.close()
      delete dialog.dataset.closing
      closingRef.current = false
      delete document.documentElement.dataset.contactOpen
    }
  }, [])

  const close = useCallback(async () => {
    const dialog = dialogRef.current
    if (!dialog || closingRef.current) return
    closingRef.current = true
    dialog.dataset.closing = ''
    // getAnimations() recalcula estilos, así que ya incluye la salida.
    await Promise.allSettled(dialog.getAnimations({ subtree: true }).map((animation) => animation.finished))
    router.back()
  }, [router])

  // Un clic en el fondo cierra solo si no hay nada escrito: así no se pierde
  // una consulta a medio hacer por un clic fuera de lugar.
  const onClick = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target !== event.currentTarget) return
    const fields = event.currentTarget.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input:not([type="radio"]), textarea',
    )
    if ([...fields].some((field) => field.value.trim())) return
    void close()
  }

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="contacto-titulo"
      tabIndex={-1}
      onCancel={(event) => {
        event.preventDefault()
        void close()
      }}
      onClick={onClick}
      className="contact-panel fixed inset-0 outline-none m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-surface p-0 text-on-surface shadow-panel md:inset-y-2 md:right-2 md:left-auto md:h-[calc(100dvh-1rem)] md:w-[min(36rem,calc(100vw-1rem))] md:rounded-xl"
    >
      <CloseContactContext value={close}>
        <div className="relative flex h-full flex-col">
          {children}
          {/* Último en el DOM y en la cascada de entrada (--i después del
              botón de enviar): se tabula al final y aparece al final. */}
          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => void close()}
            style={{ '--i': 12 } as CSSProperties}
            className="field-in group absolute right-3 top-4 z-10 inline-flex size-12 items-center justify-center rounded-full text-on-surface transition-colors duration-[160ms] ease-out hover:bg-surface-container focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-primary"
          >
            {/* Gira un cuarto de vuelta con el puntero o el foco (se gira el
                ícono, no el botón, que usa transform para su entrada). */}
            <XIcon
              size={22}
              className="transition-transform duration-[280ms] ease-out group-hover:rotate-90 group-focus-visible:rotate-90"
            />
          </button>
        </div>
      </CloseContactContext>
    </dialog>
  )
}
