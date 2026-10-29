'use client'

import Link from 'next/link'
import {
  useActionState,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  type CSSProperties,
  type FocusEvent,
  type FormEvent,
  type ReactNode,
} from 'react'
import { CaretDownIcon, CheckCircleIcon } from '@phosphor-icons/react/ssr'
import { sendContact, type ContactField, type ContactState } from '@/app/contacto/actions'
import {
  contactoTextos,
  erroresContacto,
  isEmailValido,
  motivosContacto,
  type MotivoContacto,
} from '@/content/contact'
import { CloseContactContext } from './close-context'

export type ContactLayout = 'panel' | 'page'
export type ProductOption = { slug: string; name: string }

// Campos que cuentan para la barra de progreso.
const REQUIRED = ['motivo', 'nombre', 'institucion', 'email', 'mensaje'] as const
type RequiredField = (typeof REQUIRED)[number]

const initialState: ContactState = { status: 'idle' }

// Entrada escalonada: cada pieza entra un poco después de la anterior
// (.field-in y .pop-in en globals.css; 40 ms por paso). Orden: encabezado 0,
// motivo 1 a 3 (cada opción por separado), campos 4 a 7, otros canales 8.5,
// pie 9.5, botón de enviar 10 y la X del panel 12, al final.
const order = (index: number) => ({ '--i': index }) as CSSProperties

const INPUT =
  'w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 text-body-md text-on-surface transition-[border-color] duration-[160ms] ease-out hover:border-outline focus:border-primary focus:outline-2 focus:outline-solid focus:outline-offset-0 focus:outline-primary/20 aria-[invalid=true]:border-error'

function errorOf(form: HTMLFormElement, field: RequiredField): string | undefined {
  if (field === 'motivo') {
    return form.querySelector('input[name="motivo"]:checked') ? undefined : erroresContacto.motivo
  }
  const element = form.elements.namedItem(field)
  const value = element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement ? element.value.trim() : ''
  if (!value) return erroresContacto[field]
  if (field === 'email' && !isEmailValido(value)) return erroresContacto.email
  return undefined
}

const countDone = (form: HTMLFormElement) => REQUIRED.filter((field) => !errorOf(form, field)).length

const isRequired = (name: string): name is RequiredField => (REQUIRED as readonly string[]).includes(name)

type ContactFormProps = {
  layout: ContactLayout
  products: readonly ProductOption[]
  initialMotivo?: MotivoContacto
  initialProducto?: string
  heading?: ReactNode
  aside?: ReactNode
}

// Next conserva la ruta oculta (<Activity>) al salir, así que lo escrito
// sobrevive si se cierra el panel sin enviar: al reabrirlo sigue ahí. Se
// empieza de cero (nueva `key`) si cambia el contexto, p. ej. otro
// producto, o si se oculta después de un envío exitoso.
export function ContactForm(props: ContactFormProps) {
  const [round, setRound] = useState(0)
  const nextRound = useCallback(() => setRound((value) => value + 1), [])
  return (
    <ContactFormBody
      key={`${round}-${props.initialMotivo ?? ''}-${props.initialProducto ?? ''}`}
      {...props}
      onSentHidden={nextRound}
    />
  )
}

function ContactFormBody({
  layout,
  products,
  initialMotivo,
  initialProducto,
  heading,
  aside,
  onSentHidden,
}: ContactFormProps & { onSentHidden: () => void }) {
  const [state, formAction, pending] = useActionState(sendContact, initialState)
  const sent = state.status === 'ok'

  // La limpieza corre cuando Activity oculta la ruta (y al desmontar).
  useLayoutEffect(() => {
    if (!sent) return
    return onSentHidden
  }, [sent, onSentHidden])
  const close = useContext(CloseContactContext)
  const [motivo, setMotivo] = useState<string | undefined>(initialMotivo)
  const [done, setDone] = useState(initialMotivo ? 1 : 0)
  // Errores vistos en el navegador. Una clave presente (aunque valga
  // undefined) tapa el error que haya devuelto el servidor para ese campo.
  const [errors, setErrors] = useState<Partial<Record<ContactField, string | undefined>>>({})

  const errorFor = (field: ContactField) =>
    Object.hasOwn(errors, field) ? errors[field] : state.errors?.[field]
  const fieldProps = (field: ContactField) => {
    const error = errorFor(field)
    return {
      id: `contacto-${field}`,
      name: field,
      'aria-invalid': error ? true : undefined,
      'aria-describedby': error ? `contacto-${field}-error` : undefined,
      defaultValue: state.values?.[field],
    }
  }

  // Al escribir: actualiza la barra y, si el campo ya mostraba un error,
  // lo revalida para que desaparezca en cuanto se corrige.
  const onInput = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget
    setDone(countDone(form))
    const target = event.target
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return
    const name = target.name
    if (isRequired(name) && errorFor(name)) {
      setErrors((previous) => ({ ...previous, [name]: errorOf(form, name) }))
    }
  }

  // Al salir de un campo con contenido: avisa si el formato no sirve. Los
  // vacíos se señalan recién al enviar, para no retar a quien solo pasa.
  const onBlur = (event: FocusEvent<HTMLFormElement>) => {
    const target: EventTarget = event.target
    if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement)) return
    if (!isRequired(target.name) || target.name === 'motivo' || !target.value.trim()) return
    const error = errorOf(event.currentTarget, target.name)
    setErrors((previous) => ({ ...previous, [target.name]: error }))
  }

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    const form = event.currentTarget
    const found = Object.fromEntries(REQUIRED.map((field) => [field, errorOf(form, field)]))
    const first = REQUIRED.find((field) => found[field])
    if (first) {
      event.preventDefault()
      setErrors(found)
      const target = first === 'motivo' ? form.querySelector<HTMLElement>('input[name="motivo"]') : form.elements.namedItem(first)
      if (target instanceof HTMLElement) target.focus()
      return
    }
    setErrors({})
  }

  const panel = layout === 'panel'
  const remaining = REQUIRED.length - done

  if (sent) {
    return (
      <div role="status" className={panel ? 'flex min-h-0 flex-1 flex-col px-lg pb-lg md:px-xl' : 'p-lg md:p-xl'}>
        {heading}
        <div className="field-in my-auto flex flex-col items-start gap-md py-xl" style={order(1)}>
          <CheckCircleIcon size={40} weight="light" aria-hidden className="text-primary" />
          <h2 className="font-headline-md text-headline-md text-on-surface">{contactoTextos.exitoTitulo}</h2>
          <p className="max-w-[40ch] text-body-md text-on-surface-variant">{contactoTextos.exitoTexto}</p>
          {close ? (
            <button type="button" onClick={close} className="boton boton-claro mt-sm">
              Cerrar
            </button>
          ) : (
            <Link href="/" className="boton boton-claro mt-sm">
              Volver al inicio
            </Link>
          )}
        </div>
      </div>
    )
  }

  return (
    <form
      action={formAction}
      onSubmit={onSubmit}
      onInput={onInput}
      onBlur={onBlur}
      noValidate
      aria-busy={pending}
      className={panel ? 'flex min-h-0 flex-1 flex-col' : 'flex flex-col'}
    >
      {/* Barra de progreso: se llena con cada campo obligatorio completo. */}
      <div
        role="progressbar"
        aria-label="Campos obligatorios completos"
        aria-valuemin={0}
        aria-valuemax={REQUIRED.length}
        aria-valuenow={done}
        aria-valuetext={`${done} de ${REQUIRED.length}`}
        className="h-1 w-full shrink-0 bg-surface-container-high"
      >
        <div
          className="progress-in h-full origin-left bg-primary transition-[scale] duration-300 ease-out"
          style={{ scale: `${done / REQUIRED.length} 1` }}
        />
      </div>

      <div
        className={
          panel
            ? 'min-h-0 flex-1 overflow-y-auto overscroll-contain px-lg pb-lg md:px-xl'
            : 'p-lg md:p-xl'
        }
      >
        {heading}

        <div className={`flex flex-col gap-lg ${heading ? 'mt-lg' : ''}`}>
          <fieldset aria-describedby={errorFor('motivo') ? 'contacto-motivo-error' : undefined}>
            <legend className="field-in text-body-sm font-medium text-on-surface" style={order(1)}>
              Motivo
            </legend>
            <div className="mt-sm grid gap-sm sm:grid-cols-2">
              {motivosContacto.map((item, position) => (
                <label
                  key={item.id}
                  style={order(1.5 + position * 0.5)}
                  className="field-in relieve relieve-claro flex min-h-12 cursor-pointer items-center rounded-control px-4 text-body-md transition-[border-color,background-color,color] duration-[160ms] ease-out hover:border-primary has-checked:border-primary has-checked:bg-primary-faint has-checked:text-primary has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-solid has-focus-visible:outline-primary"
                >
                  <input
                    type="radio"
                    name="motivo"
                    value={item.id}
                    defaultChecked={(state.values?.motivo ?? initialMotivo) === item.id}
                    onChange={() => setMotivo(item.id)}
                    className="sr-only"
                  />
                  {item.label}
                </label>
              ))}
            </div>
            <FieldError field="motivo" error={errorFor('motivo')} />
          </fieldset>

          {motivo === 'producto' && (
            <Field field="producto" label="Producto" optional index={initialMotivo === 'producto' ? 3.5 : 0}>
              <div className="relative">
                <select
                  {...fieldProps('producto')}
                  defaultValue={state.values?.producto ?? initialProducto ?? ''}
                  className={`${INPUT} h-12 appearance-none pr-12`}
                >
                  <option value="">Todavía no lo sé</option>
                  {products.map((product) => (
                    <option key={product.slug} value={product.slug}>
                      {product.name}
                    </option>
                  ))}
                </select>
                <CaretDownIcon
                  size={20}
                  aria-hidden
                  className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant"
                />
              </div>
            </Field>
          )}

          <div className="grid gap-lg sm:grid-cols-2">
            <Field field="nombre" label="Nombre y apellido" error={errorFor('nombre')} index={4}>
              <input {...fieldProps('nombre')} autoComplete="name" className={`${INPUT} h-12`} />
            </Field>
            <Field field="institucion" label="Institución" error={errorFor('institucion')} index={4.5}>
              <input {...fieldProps('institucion')} autoComplete="organization" className={`${INPUT} h-12`} />
            </Field>
          </div>

          <div className="grid gap-lg sm:grid-cols-2">
            <Field field="email" label="Email" error={errorFor('email')} index={5.5}>
              <input {...fieldProps('email')} type="email" autoComplete="email" inputMode="email" className={`${INPUT} h-12`} />
            </Field>
            <Field field="telefono" label="Teléfono" optional index={6}>
              <input {...fieldProps('telefono')} type="tel" autoComplete="tel" className={`${INPUT} h-12`} />
            </Field>
          </div>

          <Field field="mensaje" label="Consulta" error={errorFor('mensaje')} index={7}>
            <textarea {...fieldProps('mensaje')} rows={5} className={`${INPUT} min-h-32 resize-y py-3`} />
          </Field>
        </div>

        {aside}
      </div>

      <div
        className={`flex flex-wrap items-center justify-between gap-md border-t border-outline-variant ${
          panel ? 'bg-surface px-lg py-md md:px-xl' : 'px-lg py-lg md:px-xl'
        }`}
      >
        <p className="field-in text-body-sm text-on-surface-variant" style={order(9.5)}>
          {remaining === 0
            ? 'Listo para enviar'
            : remaining === 1
              ? 'Falta 1 campo obligatorio'
              : `Faltan ${remaining} campos obligatorios`}
        </p>
        <button
          type="submit"
          disabled={pending}
          style={order(10)}
          className="pop-in boton boton-primario disabled:cursor-wait"
        >
          {pending ? contactoTextos.enviando : contactoTextos.enviar}
        </button>
      </div>
    </form>
  )
}

function Field({
  field,
  label,
  optional,
  error,
  index,
  children,
}: {
  field: ContactField
  label: string
  optional?: boolean
  error?: string
  index: number
  children: ReactNode
}) {
  return (
    <div className="field-in flex flex-col gap-sm" style={order(index)}>
      <label htmlFor={`contacto-${field}`} className="text-body-sm font-medium text-on-surface">
        {label}
        {optional && <span className="font-normal text-on-surface-variant"> (opcional)</span>}
      </label>
      {children}
      <FieldError field={field} error={error} />
    </div>
  )
}

function FieldError({ field, error }: { field: ContactField; error?: string }) {
  if (!error) return null
  return (
    <p id={`contacto-${field}-error`} className="error-in mt-xs text-body-sm text-error">
      {error}
    </p>
  )
}
