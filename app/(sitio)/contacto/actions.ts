'use server'

import { erroresContacto, isEmailValido, isMotivoContacto } from '@/content/contact'

export type ContactField = 'motivo' | 'producto' | 'nombre' | 'institucion' | 'email' | 'telefono' | 'mensaje'

export type ContactState = {
  status: 'idle' | 'ok' | 'error'
  errors?: Partial<Record<ContactField, string>>
  // React vacía el formulario al terminar la acción: devolvemos lo enviado
  // para que los campos lo recuperen como valor por defecto si hay errores.
  values?: Partial<Record<ContactField, string>>
}

// Vuelve a validar en el servidor: la validación del navegador se puede
// saltear.
export async function sendContact(_prev: ContactState, formData: FormData): Promise<ContactState> {
  const read = (field: ContactField) => String(formData.get(field) ?? '').trim()
  const values = {
    motivo: read('motivo'),
    producto: read('producto'),
    nombre: read('nombre'),
    institucion: read('institucion'),
    email: read('email'),
    telefono: read('telefono'),
    mensaje: read('mensaje'),
  }

  const errors: ContactState['errors'] = {}
  if (!isMotivoContacto(values.motivo)) errors.motivo = erroresContacto.motivo
  if (!values.nombre) errors.nombre = erroresContacto.nombre
  if (!values.institucion) errors.institucion = erroresContacto.institucion
  if (!isEmailValido(values.email)) errors.email = erroresContacto.email
  if (!values.mensaje) errors.mensaje = erroresContacto.mensaje

  if (Object.keys(errors).length > 0) return { status: 'error', errors, values }

  // Pendiente: envío real (CLAUDE.md, "Pendiente para fases siguientes").
  // Hasta conectarlo, la consulta solo queda validada; no sale a ningún lado.
  return { status: 'ok' }
}
