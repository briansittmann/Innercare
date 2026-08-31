import { useLayoutEffect, useRef } from 'react'
import { useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import products from '../data/products.js'
import ProductCard from '../components/ProductCard.jsx'
import Reveal from '../components/Reveal.jsx'
import { step } from '../lib/motion.js'
import { prefersReducedMotion } from '../hooks/useInView.js'

export default function Products() {
  const location = useLocation()
  const mainRef = useRef(null)

  useLayoutEffect(() => {
    if (!location.state?.slideIn || prefersReducedMotion() || !mainRef.current) return
    const ctx = gsap.context(() => {
      gsap.fromTo(
        mainRef.current,
        { xPercent: 100 },
        { xPercent: 0, duration: 0.6, ease: 'power3.out' },
      )
    }, mainRef)
    return () => ctx.revert()
  }, [location.state])

  return (
    <main
      ref={mainRef}
      className="flex-grow py-section px-gutter max-w-container-max mx-auto w-full"
    >
      <div className="mb-xl text-center md:text-left">
        <Reveal as="h1" className="font-display-lg text-display-lg text-primary mb-sm">
          Catálogo Clínico de Productos
        </Reveal>
        <Reveal
          as="p"
          delay={step(1)}
          className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl"
        >
          Dispositivos médicos de precisión para cuidado ortopédico y traumatológico avanzado.
          Todos nuestros productos se fabrican a medida: contactanos para coordinar tu pedido
          customizado.
        </Reveal>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {products.map((product, i) => (
          <Reveal key={product.id} delay={step(2 + (i % 3))} className="h-full">
            <ProductCard product={product} />
          </Reveal>
        ))}
      </div>
    </main>
  )
}
