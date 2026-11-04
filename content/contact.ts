// Textos y opciones del formulario de contacto y del cierre de contacto de la
// home (content/datos/contacto.json, singleton "Contacto"). El envío de casos
// con estudios adjuntos queda para una segunda etapa (docs/DECISIONES.md).
import datos from './datos/contacto.json'
import { Lector } from './leer'

const contacto = new Lector(datos, 'Contacto')
const panel = contacto.hijo('panel', 'Panel de contacto')
const motivos = panel.hijo('motivos', 'Motivos de la consulta')

// Los ids son código (?motivo=<id> y el campo del formulario); las etiquetas
// se editan en el panel.
export const motivosContacto = [
  { id: 'producto', label: motivos.texto('producto', 'Consulta sobre un producto') },
  { id: 'caso', label: motivos.texto('caso', 'Caso a medida') },
  { id: 'compras', label: motivos.texto('compras', 'Compras y licitaciones') },
  { id: 'otro', label: motivos.texto('otro', 'Otra consulta') },
] as const

export type MotivoContacto = (typeof motivosContacto)[number]['id']

export const isMotivoContacto = (value: unknown): value is MotivoContacto =>
  motivosContacto.some((motivo) => motivo.id === value)

// La misma regla en el navegador y en el servidor (la de `type="email"`
// acepta direcciones sin dominio, como "ana@hospital").
export const isEmailValido = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)

// Mismos mensajes en el navegador y en el servidor. Quedan en código: son
// parte del formulario, no del contenido de la landing.
export const erroresContacto = {
  motivo: 'Elegí un motivo.',
  nombre: 'Completá tu nombre.',
  institucion: 'Completá la institución.',
  email: 'Ingresá un email válido.',
  mensaje: 'Contanos tu consulta.',
} as const

export const contactoTextos = {
  titulo: panel.texto('titulo', 'Título'),
  bajada: panel.texto('bajada', 'Bajada'),
  enviar: panel.texto('enviar', 'Botón de enviar'),
  enviando: panel.texto('enviando', 'Botón mientras envía'),
  exitoTitulo: panel.texto('exitoTitulo', 'Título de la confirmación'),
  exitoTexto: panel.texto('exitoTexto', 'Texto de la confirmación'),
  otrosCanales: panel.texto('otrosCanales', 'Otros canales'),
}

// El cierre de contacto de la home (components/home/contacto.tsx): la intro
// con las manos y la tarjeta final.
export const contactoHome = {
  kicker: contacto.texto('kicker', 'Línea chica de la intro'),
  titularIntro: contacto.texto('titularIntro', 'Titular de la intro'),
  titulo: contacto.texto('titulo', 'Título de la tarjeta'),
  bajada: contacto.texto('bajada', 'Bajada de la tarjeta'),
}
