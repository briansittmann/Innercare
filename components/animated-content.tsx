'use client';

// AnimatedContent de React Bits (@react-bits/AnimatedContent-TS-TW). Copiado
// del registro a mano: `shadcn add` corrompe las cadenas de sombras y
// colores. Conserva el estilo de código original. Cambios propios:
// - Sin ScrollTrigger: el disparo `scroll` usa un IntersectionObserver que
//   dispara una sola vez (mismo criterio que FoldText), para no sumar el
//   plugin. Se quitan `container`, `scrub`, `once` (siempre una vez),
//   `rotate`, `tilt`, `wipe` y la desaparición (`disappear*`).
// - El HTML del servidor no trae el bloque oculto (nada de `invisible`): sin
//   JS se ve entero. Con JS, `.contenido-animado` en globals.css lo oculta
//   hasta que el efecto toma el control (data-contenido-listo), y si el JS no
//   llega aparece solo.
// - `as`: etiqueta del contenedor. Con `stagger`, lo que entra escalonado
//   son los HIJOS DIRECTOS del componente, así que para escalonar <li> el
//   componente tiene que ser el <ul>.
// - `targets`: selector de las piezas que entran, en lugar de los hijos
//   directos o del bloque; entran en el orden del documento (con `stagger`,
//   una tras otra). Sirve cuando están en columnas distintas.
// - La entrada se reproduce una vez por montaje: si la ruta se oculta y
//   vuelve (Cache Components la conserva con <Activity> y repite los
//   efectos), el contenido queda en su estado final.
// - Con `prefers-reduced-motion`, nada se oculta ni se mueve.
import { useEffect, useLayoutEffect, useRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react';
import { gsap } from 'gsap';

export type AnimatedContentStaggerFrom = 'start' | 'end' | 'center' | 'edges' | 'random';

export interface AnimatedContentProps extends Omit<HTMLAttributes<HTMLElement>, 'onAnimationStart'> {
  children?: ReactNode;
  as?: 'div' | 'ul' | 'section' | 'figure' | 'h2' | 'p';
  distance?: number;
  direction?: 'vertical' | 'horizontal';
  reverse?: boolean;
  duration?: number;
  ease?: string;
  initialOpacity?: number;
  animateOpacity?: boolean;
  scale?: number;
  blur?: number;
  threshold?: number;
  delay?: number;
  stagger?: number;
  staggerFrom?: AnimatedContentStaggerFrom;
  targets?: string;
  trigger?: 'scroll' | 'mount';
  onStart?: () => void;
  onComplete?: () => void;
  className?: string;
  style?: CSSProperties;
}

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const AnimatedContent = ({
  children,
  as = 'div',
  distance = 100,
  direction = 'vertical',
  reverse = false,
  duration = 0.8,
  ease = 'power3.out',
  initialOpacity = 0,
  animateOpacity = true,
  scale = 1,
  blur = 0,
  threshold = 0.1,
  delay = 0,
  stagger = 0,
  staggerFrom = 'start',
  targets: selector,
  trigger = 'scroll',
  onStart,
  onComplete,
  className = '',
  style,
  ...props
}: AnimatedContentProps) => {
  // La etiqueta es dinámica (`as`); para TypeScript, un div.
  const ref = useRef<HTMLDivElement>(null);
  const playedRef = useRef(false);
  const callbacksRef = useRef({ onStart, onComplete });

  useIsomorphicLayoutEffect(() => {
    callbacksRef.current = { onStart, onComplete };
  });

  useIsomorphicLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;

    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

    // Ya entró en este montaje (la ruta volvió a mostrarse) o no hay que
    // animar: el bloque queda visible y quieto.
    if (reduce || playedRef.current) {
      el.setAttribute('data-contenido-listo', '');
      callbacksRef.current.onComplete?.();
      return undefined;
    }

    let observer: IntersectionObserver | null = null;

    const ctx = gsap.context(() => {
      const elegidas = selector ? Array.from(el.querySelectorAll(selector)) : [];
      const targets: Element[] = elegidas.length
        ? elegidas
        : stagger > 0 && el.children.length
          ? Array.from(el.children)
          : [el];
      const axis = direction === 'horizontal' ? 'x' : 'y';
      const sign = reverse ? -1 : 1;

      const from: gsap.TweenVars = {
        [axis]: distance * sign,
        scale,
        opacity: animateOpacity ? initialOpacity : 1
      };
      const to: gsap.TweenVars = {
        [axis]: 0,
        scale: 1,
        opacity: 1,
        duration,
        ease
      };

      if (blur > 0) {
        from.filter = `blur(${blur}px)`;
        to.filter = 'blur(0px)';
      }
      if (stagger > 0) to.stagger = { each: stagger, from: staggerFrom };

      const tl = gsap.timeline({
        paused: true,
        onStart: () => callbacksRef.current.onStart?.(),
        onComplete: () => {
          playedRef.current = true;
          // Sin restos de transform ni filter: cambiarían el :active de los
          // botones y el multiply de las imágenes.
          gsap.set(targets, { clearProps: 'filter,transform' });
          callbacksRef.current.onComplete?.();
        }
      });
      // fromTo escribe el estado inicial en línea, de forma síncrona.
      tl.fromTo(targets, from, to, Math.max(delay, 0));

      // Desde acá el estado lo maneja gsap, no el CSS. Siempre DESPUÉS del
      // fromTo: al revés, el bloque aparece entero un cuadro y se apaga.
      el.setAttribute('data-contenido-listo', '');

      if (trigger === 'mount') {
        tl.play();
        return;
      }

      // Equivale al `start: 'top (1 - threshold)%'` de ScrollTrigger: dispara
      // cuando el borde superior cruza ese alto de la ventana.
      observer = new IntersectionObserver(
        entries => {
          if (!entries.some(entry => entry.isIntersecting)) return;
          observer?.disconnect();
          tl.play();
        },
        { rootMargin: `0px 0px -${Math.round(threshold * 100)}% 0px` }
      );
      observer.observe(el);
    }, el);

    return () => {
      observer?.disconnect();
      ctx.revert();
    };
  }, [
    distance,
    direction,
    reverse,
    duration,
    ease,
    initialOpacity,
    animateOpacity,
    scale,
    blur,
    threshold,
    delay,
    stagger,
    staggerFrom,
    selector,
    trigger
  ]);

  const Tag = as as 'div';

  return (
    <Tag ref={ref} className={['contenido-animado', className].filter(Boolean).join(' ')} style={style} {...props}>
      {children}
    </Tag>
  );
};

export default AnimatedContent;
