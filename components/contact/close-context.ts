'use client'

import { createContext } from 'react'

// El panel de contacto expone su cierre animado. Fuera del panel (página
// /contacto) vale null y el formulario ofrece volver al inicio.
export const CloseContactContext = createContext<(() => void) | null>(null)
