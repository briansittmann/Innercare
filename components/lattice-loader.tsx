'use client'

import { type CSSProperties } from 'react'

// LatticeLoader de React Bits (@react-bits/LatticeLoader-TS-TW), copiado a
// mano y recortado para la pantalla de carga (components/pantalla-carga.tsx):
// una grilla de celdas que se encienden en ola junto a una etiqueta. Sin el
// cronómetro (el porcentaje va aparte) ni el estado de error; en `done` la
// ola se apaga y queda la marca de listo. Colores: siempre currentColor
// (nada de colores propios: la pantalla lo pone en el primario). Respeta
// prefers-reduced-motion (las celdas encendidas quedan quietas).

export type LatticeStatus = 'working' | 'done'
type LatticeGrid = 3 | 4
type Pattern = { cells: (number | null)[]; loop: number; scale: number; lit: number }

const PATTERNS: Record<LatticeGrid, Record<string, Pattern>> = {
  3: {
    orbit: { cells: [0, 1, 2, 7, null, 3, 6, 5, 4], loop: 8, scale: 1.2, lit: 0.62 },
    ripple: { cells: [2, 1, 2, 1, 0, 1, 2, 1, 2], loop: 4.8, scale: 1.5, lit: 0.62 },
  },
  4: {
    sweep: { cells: [0, 1, 2, 3, 1, 2, 3, 4, 2, 3, 4, 5, 3, 4, 5, 6], loop: 5, scale: 1, lit: 0.45 },
    rain: { cells: [0, 2, 1, 3, 1, 3, 2, 4, 2, 4, 3, 5, 3, 5, 4, 6], loop: 4, scale: 1.2, lit: 0.35 },
  },
}
const MARKS: Record<LatticeGrid, number[]> = { 3: [2, 3, 5, 7], 4: [7, 8, 10, 13] }

const CELL =
  'h-[var(--ll-cell)] w-[var(--ll-cell)] [border-radius:max(1px,calc(var(--ll-cell)*0.25))] [background:currentColor] group-data-[shape=round]:rounded-full'
const LIT: Record<number, string> = {
  62: 'animate-[lattice-on_var(--ll-cycle)_infinite]',
  45: 'animate-[lattice-on-45_var(--ll-cycle)_infinite]',
  35: 'animate-[lattice-on-35_var(--ll-cycle)_infinite]',
}
const STYLE = `
@keyframes lattice-on { 0%, 100% { opacity: var(--ll-idle); } 18%, 42% { opacity: 1; } 62% { opacity: var(--ll-idle); } }
@keyframes lattice-on-45 { 0%, 100% { opacity: var(--ll-idle); } 13%, 31% { opacity: 1; } 45% { opacity: var(--ll-idle); } }
@keyframes lattice-on-35 { 0%, 100% { opacity: var(--ll-idle); } 10%, 24% { opacity: 1; } 35% { opacity: var(--ll-idle); } }
@media (prefers-reduced-motion: reduce) {
  .ll-run > span { animation: none !important; opacity: 0.6 !important; }
  .ll-mark { transform: none !important; }
}
`

export function LatticeLoader({
  label,
  doneLabel = label,
  status = 'working',
  pattern,
  grid = 4,
  shape = 'round',
  cellSize = 6,
  gap = 2,
  step = 90,
  idleOpacity = 0.18,
  className = '',
}: {
  label: string
  doneLabel?: string
  status?: LatticeStatus
  pattern?: string
  grid?: LatticeGrid
  shape?: 'square' | 'round'
  cellSize?: number
  gap?: number
  step?: number
  idleOpacity?: number
  className?: string
}) {
  const patrones = PATTERNS[grid]
  const pat = (pattern && patrones[pattern]) || (Object.values(patrones)[0] as Pattern)
  const d = step * pat.scale
  const cycle = Math.round(pat.loop * d)
  const lit = LIT[Math.round(pat.lit * 100)] ?? LIT[62]

  return (
    <span
      role="status"
      className={`group relative inline-flex items-center gap-[0.75em] leading-none${className ? ` ${className}` : ''}`}
      data-status={status}
      data-shape={shape}
      style={
        {
          '--ll-n': grid,
          '--ll-cell': `${cellSize}px`,
          '--ll-gap': `${gap}px`,
          '--ll-idle': idleOpacity,
          '--ll-cycle': `${cycle}ms`,
        } as CSSProperties
      }
    >
      <style>{STYLE}</style>
      <span className="grid shrink-0" aria-hidden="true">
        <span className="ll-run [grid-area:1/1] grid [grid-template-columns:repeat(var(--ll-n),var(--ll-cell))] [gap:var(--ll-gap)] [transition:opacity_200ms_ease] group-data-[status=done]:opacity-0 group-data-[status=done]:[&>span]:[animation-play-state:paused]">
          {pat.cells.map((unit, i) => (
            <span
              key={i}
              className={
                unit == null
                  ? `${CELL} [opacity:calc(var(--ll-idle)*0.47)]`
                  : `${CELL} [opacity:var(--ll-idle)] ${lit} [animation-timing-function:var(--ease-in-out)]`
              }
              style={unit == null ? undefined : { animationDelay: `${Math.round(unit * d)}ms` }}
            />
          ))}
        </span>
        <span className="ll-mark [grid-area:1/1] grid [grid-template-columns:repeat(var(--ll-n),var(--ll-cell))] [gap:var(--ll-gap)] origin-center opacity-0 [transform:scale(0.9)] [transition:opacity_160ms_var(--ease-out),transform_160ms_var(--ease-out)] group-data-[status=done]:opacity-100 group-data-[status=done]:[transform:none] group-data-[status=done]:[transition:opacity_200ms_ease,transform_200ms_var(--ease-out)]">
          {pat.cells.map((_, i) => (
            <span
              key={i}
              className={`${CELL} [opacity:var(--ll-idle)] [transition:opacity_200ms_ease] data-[on]:opacity-100`}
              data-on={MARKS[grid].includes(i) ? '' : undefined}
            />
          ))}
        </span>
      </span>
      <span className="relative inline-block" aria-hidden="true">
        <span
          className="absolute top-0 left-0 whitespace-nowrap opacity-0 [filter:blur(2px)] [transition:opacity_200ms_ease,filter_200ms_ease] data-[active]:static data-[active]:opacity-100 data-[active]:[filter:blur(0)]"
          data-active={status === 'working' ? '' : undefined}
        >
          {label}
        </span>
        <span
          className="absolute top-0 left-0 whitespace-nowrap opacity-0 [filter:blur(2px)] [transition:opacity_200ms_ease,filter_200ms_ease] data-[active]:static data-[active]:opacity-100 data-[active]:[filter:blur(0)]"
          data-active={status === 'done' ? '' : undefined}
        >
          {doneLabel}
        </span>
      </span>
      <span className="sr-only">{status === 'working' ? `${label}, en curso` : doneLabel}</span>
    </span>
  )
}
