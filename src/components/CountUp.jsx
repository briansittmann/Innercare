import { useEffect, useMemo, useRef, useState } from 'react'
import useInView, { prefersReducedMotion } from '../hooks/useInView.js'

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3)

/** Parse "98%" / "25+" / "1,200" into { prefix, target, suffix, decimals, useGroup }. */
function parse(value) {
  const match = String(value).match(/^(\D*)([\d.,]+)(\D*)$/)
  if (!match) return null
  const [, prefix, rawNumber, suffix] = match
  const useGroup = rawNumber.includes(',')
  const normalized = rawNumber.replace(/,/g, '')
  const dot = normalized.indexOf('.')
  const decimals = dot === -1 ? 0 : normalized.length - dot - 1
  const target = parseFloat(normalized)
  if (Number.isNaN(target)) return null
  return { prefix, target, suffix, decimals, useGroup }
}

function format(n, { decimals, useGroup }) {
  return n.toLocaleString('es-AR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: useGroup,
  })
}

export default function CountUp({ value, duration = 1600, className = '' }) {
  const parsed = useMemo(() => parse(value), [value])
  const [ref, inView] = useInView()
  const [display, setDisplay] = useState(() =>
    parsed && !prefersReducedMotion() ? format(0, parsed) : null,
  )
  const rafRef = useRef(0)

  useEffect(() => {
    if (!parsed || prefersReducedMotion() || !inView) return

    const start = performance.now()
    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1)
      const current = parsed.target * easeOutCubic(progress)
      setDisplay(format(progress === 1 ? parsed.target : current, parsed))
      if (progress < 1) rafRef.current = requestAnimationFrame(tick)
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [inView, duration, parsed])

  if (!parsed) return <span className={className}>{value}</span>

  const shown =
    display === null
      ? `${parsed.prefix}${format(parsed.target, parsed)}${parsed.suffix}`
      : `${parsed.prefix}${display}${parsed.suffix}`

  return (
    <span ref={ref} className={className}>
      {shown}
    </span>
  )
}
