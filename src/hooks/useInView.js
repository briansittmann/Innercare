import { useEffect, useRef, useState } from 'react'

/**
 * Observe an element and report the first time it enters the viewport.
 * Returns [ref, inView]. One-shot by default (stops observing after reveal).
 */
export default function useInView({
  threshold = 0.15,
  rootMargin = '0px 0px -10% 0px',
  once = true,
} = {}) {
  const ref = useRef(null)
  const [inView, setInView] = useState(
    () => typeof IntersectionObserver === 'undefined',
  )

  useEffect(() => {
    const node = ref.current
    if (!node || typeof IntersectionObserver === 'undefined') return

    // IntersectionObserver's first callback runs asynchronously, so a visitor who
    // scrolls immediately after load can move an element off screen before it ever
    // reports as intersecting — leaving it stuck hidden. Settle anything that is
    // already on screen at mount synchronously instead.
    const rect = node.getBoundingClientRect()
    if (rect.top < window.innerHeight && rect.bottom > 0) {
      setInView(true)
      if (once) return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true)
            if (once) observer.unobserve(entry.target)
          } else if (!once) {
            setInView(false)
          }
        })
      },
      { threshold, rootMargin },
    )

    observer.observe(node)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return [ref, inView]
}

export function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}
