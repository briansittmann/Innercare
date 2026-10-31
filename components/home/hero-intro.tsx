'use client'

import { useSyncExternalStore, type ComponentProps } from 'react'
import FoldText from '@/components/fold-text'
import GhostFibers, { type GhostFibersProps } from '@/components/ghost-fibers'
import { INTRO_AT, useIntroPhase } from '@/components/intro'

// Las piezas del hero que siguen la entrada de la home (components/intro.ts).
// El hero es de servidor: estas le pasan la fase a cada una.

// La sección lleva la fase en data-intro: el CSS anima lo que hay adentro
// (.intro-in, .intro-3d).
export function IntroSection(props: ComponentProps<'section'>) {
  const phase = useIntroPhase()
  return <section {...props} data-intro={phase} />
}

// Resolución de las fibras: 2x en escritorio y 1x en el celular, donde la
// placa rinde menos y en pantalla chica casi no se nota.
function readFiberDpr() {
  return window.matchMedia('(min-width: 48rem)').matches ? 2 : 1
}

const noSubscribe = () => () => {}

// Las fibras entran con el header y el busto. Se montan recién en el cliente
// (-1 en el servidor), porque GhostFibers lee dpr una sola vez al montarse;
// no se pierde nada: hasta la entrada no dibujan.
export function HeroFibers(props: Omit<GhostFibersProps, 'dpr' | 'introStart'>) {
  const phase = useIntroPhase()
  const dpr = useSyncExternalStore(noSubscribe, readFiberDpr, () => -1)
  if (dpr <= 0) return null
  return <GhostFibers {...props} dpr={dpr} introStart={phase !== 'waiting'} />
}

// El titular se despliega letra por letra desde arriba, como papel que se
// abre, y después queda quieto: sin repliegue con el mouse. Peso 500 en vez
// del 400 de los titulares, para que el pliegue tenga trazo donde marcarse.
// Si la entrada ya terminó (se volvió a la home), sin espera.
export function HeroTitle({ text }: { text: string }) {
  const phase = useIntroPhase()
  return (
    <FoldText
      text={text}
      stagger={0.025}
      fontWeight={500}
      paused={phase === 'waiting'}
      delay={phase === 'done' ? 0 : INTRO_AT.title / 1000}
    />
  )
}
