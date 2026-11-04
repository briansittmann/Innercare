// Las seis paradas del recorrido, por id, con el nombre que ve el editor: las
// etiquetas del panel (keystatic.esquema.ts, los objetos de cada parada y las
// fichas PDF) y los marcadores "[pendiente: …]" de content/recorrido.ts salen
// de acá, así dicen lo mismo. El orden es el del guion de cámara
// (components/recorrido-3d/camara.ts). Sin dependencias: lo importa Node tal
// cual (la compuerta del build) y el bundle del sitio.
export const NOMBRES_PARADAS = {
  craneo: 'Cráneo',
  maxilar: 'Maxilar',
  hombro: 'Hombro',
  acetabulo: 'Acetábulo',
  femur: 'Fémur proximal',
  intercalar: 'Diáfisis femoral',
} as const

export type ParadaId = keyof typeof NOMBRES_PARADAS
