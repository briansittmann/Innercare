import { notFound } from 'next/navigation'
import { panelHabilitado } from '@/keystatic.config'

// Con el panel habilitado, el layout renderiza Keystatic y nunca a esta
// página: existe para que /keystatic y sus subrutas (singleton/…,
// cloud/oauth/callback) respondan 200. Como el layout descarta `children`,
// la validación de navegación instantánea de Cache Components no encuentra
// el segmento y avisa en `next dev` ("Could not validate that a segment in
// your UI has instant navigation… Dropped segment"); `instant = false` saca
// al segmento de esa validación (02-route-segment-config/instant.md: "false:
// Opts the segment out"). Solo vale en Server Components, por eso no va en
// keystatic.tsx.
//
// Sin el panel (producción sin Keystatic Cloud), responde 404 con la página
// de marca de al lado (not-found.tsx); el layout ahí sí renderiza children.
// Como con todo notFound() bajo Cache Components (las fichas, por ejemplo),
// el HTML que manda el servidor es la cáscara de Next con status 404 y
// `noindex`, y el cliente completa la página por RSC; `curl` no la ve, el
// navegador sí. Prerrenderizar /keystatic con generateStaticParams no cambia
// eso (la cáscara sale igual, con el contenido en el payload) y obliga a
// devolver una entrada también con el panel habilitado, así que no se hace.
export const instant = false

export default function PanelPage() {
  if (!panelHabilitado) notFound()
  return null
}
