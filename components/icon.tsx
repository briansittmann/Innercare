import {
  BarcodeIcon,
  CubeFocusIcon,
  CubeIcon,
  FactoryIcon,
  PencilRulerIcon,
  TreeStructureIcon,
  TruckIcon,
} from '@phosphor-icons/react/ssr'
import type { Icon } from '@phosphor-icons/react'
import type { IconKey } from '@/content/types'

// Única traducción de las claves de content/ a iconos de Phosphor.
const icons: Record<IconKey, Icon> = {
  distribucion: TruckIcon,
  trazabilidad: BarcodeIcon,
  'a-medida': CubeIcon,
  'gestion-digital': TreeStructureIcon,
  planificacion: CubeFocusIcon,
  diseno: PencilRulerIcon,
  fabricacion: FactoryIcon,
}

export function ContentIcon({
  name,
  size = 22,
  className,
}: {
  name: IconKey
  size?: number
  className?: string
}) {
  const Glyph = icons[name]
  return <Glyph size={size} weight="light" aria-hidden className={className} />
}
