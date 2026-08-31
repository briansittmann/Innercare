import { Fragment, useLayoutEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { prefersReducedMotion } from '../hooks/useInView.js'

/**
 * Reveals a line of text one word at a time (fade + rise + soft blur).
 * Respects prefers-reduced-motion (renders the text plainly, no tween).
 */
export default function WordReveal({
  as: Tag = 'span',
  text,
  className = '',
  delay = 0.25,
  stagger = 0.08,
  duration = 0.7,
  ...rest
}) {
  const ref = useRef(null)
  const words = text.split(' ')

  useLayoutEffect(() => {
    if (prefersReducedMotion() || !ref.current) return
    const ctx = gsap.context(() => {
      gsap.from('[data-word]', {
        opacity: 0,
        yPercent: 60,
        filter: 'blur(8px)',
        duration,
        ease: 'power3.out',
        stagger,
        delay,
      })
    }, ref)
    return () => ctx.revert()
  }, [text, delay, stagger, duration])

  return (
    <Tag ref={ref} className={className} {...rest}>
      {words.map((word, i) => (
        <Fragment key={`${word}-${i}`}>
          {/* The space below must be a text node BETWEEN the spans, so the
              browser still has a line-break opportunity between words. */}
          <span data-word className="inline-block">
            {word}
          </span>
          {i < words.length - 1 ? ' ' : null}
        </Fragment>
      ))}
    </Tag>
  )
}
