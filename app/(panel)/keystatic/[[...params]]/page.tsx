// El layout del panel renderiza Keystatic y nunca a esta página: existe
// para que /keystatic y sus subrutas (singleton/…, cloud/oauth/callback)
// respondan 200. Como el layout descarta `children`, la validación de
// navegación instantánea de Cache Components no encuentra el segmento y
// avisa en `next dev` ("Could not validate that a segment in your UI has
// instant navigation… Dropped segment"); `instant = false` saca al segmento
// de esa validación (02-route-segment-config/instant.md: "false: Opts the
// segment out"). Solo vale en Server Components, por eso no va en
// keystatic.tsx.
export const instant = false

export default function PanelPage() {
  return null
}
