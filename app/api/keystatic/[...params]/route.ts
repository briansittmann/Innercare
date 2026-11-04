import { makeRouteHandler } from '@keystatic/next/route-handler'
import config, { panelHabilitado } from '@/keystatic.config'

// API del panel en modo local (lee y escribe content/datos/*.json y
// public/fichas/). En modo Cloud Keystatic no la usa (responde 404 sola).
// En producción sin Cloud no se expone: la API local no autentica.
const manejador = makeRouteHandler({ config })
const noEncontrado = () => new Response('Not found', { status: 404 })

export const GET = panelHabilitado ? manejador.GET : noEncontrado
export const POST = panelHabilitado ? manejador.POST : noEncontrado
