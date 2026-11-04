'use client'

import { useRouter } from 'next/navigation'
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type ReactNode,
} from 'react'
import { DotsSixVerticalIcon, XIcon } from '@phosphor-icons/react/ssr'
import { CloseContactContext } from './close-context'

// Panel lateral de contacto. Lo abre la ruta interceptada app/(sitio)/@modal/(.)contacto
// al navegar dentro del sitio; con un enlace directo o al recargar, /contacto
// se ve como página completa.
//
// <dialog> nativo con showModal(): foco atrapado, Escape y resto de la página
// inerte sin código propio. Entrada y salida con CSS (.contact-panel en
// globals.css). Al cerrar, primero anima la salida y después vuelve atrás en
// el historial, que es lo que desmonta el panel.
//
// En escritorio el ancho se ajusta con el tirador del borde izquierdo, desde
// el de siempre (36rem) hasta el 60 % de la pantalla.
const PASO_TECLADO = 0.1

// Pasa un ancho en px a la fracción entre el ancho de siempre (36rem) y el
// 60 % de la pantalla, los dos extremos de .contact-panel en globals.css.
function fraccionDeAncho(px: number) {
  const rem = parseFloat(getComputedStyle(document.documentElement).fontSize)
  const min = 36 * rem
  const max = window.innerWidth * 0.6
  if (max <= min) return 0
  return Math.min(1, Math.max(0, (px - min) / (max - min)))
}

export function ContactModal({ children }: { children: ReactNode }) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const closingRef = useRef(false)
  // 0 es el ancho de siempre y 1, el máximo (la cuenta, en globals.css).
  const [ancho, setAncho] = useState(0)
  const resizingRef = useRef(false)
  // Distancia del puntero al borde izquierdo al agarrar: así el borde no
  // salta hasta el puntero en el primer movimiento.
  const agarreRef = useRef(0)

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
      delete dialog.dataset.resizing
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
    if (event.target !== event.currentTarget || resizingRef.current) return
    const fields = event.currentTarget.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>(
      'input:not([type="radio"]), textarea',
    )
    if ([...fields].some((field) => field.value.trim())) return
    void close()
  }

  const onResizeStart = (event: PointerEvent<HTMLDivElement>) => {
    const dialog = dialogRef.current
    if (!dialog || event.button !== 0) return
    // Sin esto, arrastrar selecciona el texto del formulario.
    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    agarreRef.current = event.clientX - dialog.getBoundingClientRect().left
    resizingRef.current = true
    dialog.dataset.resizing = ''
  }

  const onResize = (event: PointerEvent<HTMLDivElement>) => {
    const dialog = dialogRef.current
    if (!dialog || !event.currentTarget.hasPointerCapture(event.pointerId)) return
    const derecha = dialog.getBoundingClientRect().right
    setAncho(fraccionDeAncho(derecha - (event.clientX - agarreRef.current)))
  }

  const onResizeEnd = () => {
    if (dialogRef.current) delete dialogRef.current.dataset.resizing
    // El clic que sigue al soltar puede caer en el fondo y cerraría el panel:
    // se ignora hasta que termine este evento.
    setTimeout(() => {
      resizingRef.current = false
    })
  }

  const onResizeKey = (event: KeyboardEvent<HTMLDivElement>) => {
    // El tirador está a la izquierda: hacia la izquierda, más ancho.
    const siguiente = { ArrowLeft: ancho + PASO_TECLADO, ArrowRight: ancho - PASO_TECLADO, Home: 0, End: 1 }[event.key]
    if (siguiente === undefined) return
    event.preventDefault()
    setAncho(Math.min(1, Math.max(0, siguiente)))
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
      style={{ '--panel-ancho': ancho } as CSSProperties}
      className="contact-panel fixed inset-0 outline-none m-0 h-dvh max-h-none w-full max-w-none overflow-hidden border-0 bg-surface p-0 text-on-surface shadow-panel md:inset-y-2 md:right-2 md:left-auto md:h-[calc(100dvh-1rem)] md:w-[min(36rem,calc(100vw-1rem))] md:rounded-xl"
    >
      <CloseContactContext value={close}>
        <div className="relative flex h-full flex-col">
          {children}
          {/* Tirador del ancho, solo en escritorio (desde lg, donde el 60 % ya
              es más que el ancho de siempre). Doble clic: del mínimo al
              máximo y vuelta. */}
          <div
            role="separator"
            aria-orientation="vertical"
            aria-label="Ancho del panel"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(ancho * 100)}
            aria-valuetext={ancho === 0 ? 'Ancho mínimo' : ancho === 1 ? 'Ancho máximo' : `${Math.round(ancho * 100)} %`}
            tabIndex={0}
            title="Arrastrá para cambiar el ancho"
            onPointerDown={onResizeStart}
            onPointerMove={onResize}
            onLostPointerCapture={onResizeEnd}
            onKeyDown={onResizeKey}
            onDoubleClick={() => setAncho((actual) => (actual < 0.5 ? 1 : 0))}
            style={{ '--i': 11.5 } as CSSProperties}
            className="field-in group absolute inset-y-0 left-0 z-10 hidden w-6 cursor-ew-resize touch-none items-center justify-center outline-none lg:flex"
          >
            <span className="flex h-12 w-5 items-center justify-center rounded-full bg-surface-container-low text-outline transition-colors duration-[160ms] ease-out group-hover:bg-surface-container group-hover:text-primary group-focus-visible:text-primary group-focus-visible:outline-2 group-focus-visible:outline-solid group-focus-visible:outline-primary in-data-resizing:bg-surface-container in-data-resizing:text-primary">
              <DotsSixVerticalIcon size={18} weight="bold" aria-hidden />
            </span>
          </div>
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
