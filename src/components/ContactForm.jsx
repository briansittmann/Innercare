import { useState } from 'react'

const initialFormState = {
  name: '',
  email: '',
  phone: '',
  message: '',
}

export default function ContactForm() {
  const [form, setForm] = useState(initialFormState)
  const [submitted, setSubmitted] = useState(false)

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  function handleSubmit(event) {
    event.preventDefault()
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg md:p-xl text-center">
        <span className="material-symbols-outlined fill-icon text-primary text-[48px] mb-md">
          check_circle
        </span>
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-sm">
          ¡Gracias por tu consulta!
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Recibimos tu mensaje. Un especialista de Innercare se pondrá en contacto a la brevedad.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-surface-container-lowest border border-outline-variant rounded-lg p-lg md:p-xl shadow-sm">
      <h2 className="font-headline-sm text-headline-sm text-on-surface mb-lg">Enviar un Mensaje</h2>
      <form className="space-y-md" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="name">
              Nombre Completo
            </label>
            <input
              className="w-full h-12 px-sm border border-outline-variant rounded font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
              id="name"
              name="name"
              placeholder="Dra. Juana Pérez"
              required
              type="text"
              value={form.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="email">
              Email Profesional
            </label>
            <input
              className="w-full h-12 px-sm border border-outline-variant rounded font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
              id="email"
              name="email"
              placeholder="juana.perez@hospital.com.ar"
              required
              type="email"
              value={form.email}
              onChange={handleChange}
            />
          </div>
        </div>
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="phone">
            Teléfono
          </label>
          <input
            className="w-full h-12 px-sm border border-outline-variant rounded font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
            id="phone"
            name="phone"
            placeholder="+54 9 11 1234-5678"
            type="tel"
            value={form.phone}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block font-label-md text-label-md text-on-surface mb-xs" htmlFor="message">
            Mensaje
          </label>
          <textarea
            className="w-full p-sm border border-outline-variant rounded font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all resize-y"
            id="message"
            name="message"
            placeholder="Contanos en detalle tu consulta..."
            required
            rows={5}
            value={form.message}
            onChange={handleChange}
          />
        </div>
        <div className="pt-sm">
          <button
            className="w-full md:w-auto px-xl h-12 bg-primary-container text-on-primary font-label-md text-label-md rounded hover:bg-surface-tint transition-colors cursor-pointer"
            type="submit"
          >
            Enviar Consulta
          </button>
        </div>
      </form>
    </div>
  )
}
