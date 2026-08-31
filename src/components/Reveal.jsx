import useInView, { prefersReducedMotion } from '../hooks/useInView.js'

/**
 * Fades + slides its children into view the first time they are scrolled near.
 * Respects prefers-reduced-motion (renders final state, no transition).
 */
export default function Reveal({
  as: Tag = 'div',
  delay = 0,
  x = 0,
  y = 24,
  duration = 900,
  className = '',
  children,
  ...rest
}) {
  const reduced = prefersReducedMotion()
  const [ref, inView] = useInView()
  const revealed = reduced || inView

  const style = reduced
    ? undefined
    : {
        transitionProperty: 'opacity, transform, filter',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        transitionDelay: `${delay}ms`,
        opacity: revealed ? 1 : 0,
        transform: revealed ? 'none' : `translate3d(${x}px, ${y}px, 0)`,
        filter: revealed ? 'blur(0px)' : 'blur(6px)',
        willChange: 'opacity, transform, filter',
      }

  return (
    <Tag ref={ref} className={className} style={style} {...rest}>
      {children}
    </Tag>
  )
}
