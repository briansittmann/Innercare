// Textos y opciones del formulario de contacto. El envío de casos con
// estudios adjuntos queda para una segunda etapa (docs/DECISIONES.md).

export const motivosContacto = [
  { id: 'producto', label: 'Consulta sobre un producto' },
  { id: 'caso', label: 'Caso a medida' },
  { id: 'compras', label: 'Compras y licitaciones' },
  { id: 'otro', label: 'Otra consulta' },
] as const

export type MotivoContacto = (typeof motivosContacto)[number]['id']

export const isMotivoContacto = (value: unknown): value is MotivoContacto =>
  motivosContacto.some((motivo) => motivo.id === value)

// La misma regla en el navegador y en el servidor (la de `type="email"`
// acepta direcciones sin dominio, como "ana@hospital").
export const isEmailValido = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

// Mismos mensajes en el navegador y en el servidor.
export const erroresContacto = {
  motivo: 'Elegí un motivo.',
  nombre: 'Completá tu nombre.',
  institucion: 'Completá la institución.',
  email: 'Ingresá un email válido.',
  mensaje: 'Contanos tu consulta.',
} as const

export const contactoTextos = {
  titulo: 'Contacto',
  bajada:
    'Contanos qué necesitás y te respondemos. Para casos a medida, coordinamos la planificación quirúrgica junto a tu equipo.',
  enviar: 'Enviar consulta',
  enviando: 'Enviando…',
  exitoTitulo: 'Consulta enviada',
  exitoTexto: 'Gracias. Te vamos a responder al email que nos dejaste.',
  otrosCanales: '¿Preferís otro canal?',
}
