import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { gsap } from 'gsap'
import products from '../data/products.js'
import ProductCard from '../components/ProductCard.jsx'
import ProductFilters from '../components/ProductFilters.jsx'
import Reveal from '../components/Reveal.jsx'
import { step } from '../lib/motion.js'
import { prefersReducedMotion } from '../hooks/useInView.js'

const unique = (values) => [...new Set(values.filter(Boolean))].sort()

const toggle = (list, value) =>
  list.includes(value) ? list.filter((item) => item !== value) : [...list, value]

export default function Products() {
  const location = useLocation()
  const mainRef = useRef(null)

  const categories = useMemo(() => unique(products.map((product) => product.category)), [])
  const materials = useMemo(() => unique(products.map((product) => product.material)), [])
  const techniques = useMemo(() => unique(products.map((product) => product.technique)), [])

  const [selectedCategories, setSelectedCategories] = useState([])
  const [selectedMaterials, setSelectedMaterials] = useState([])
  const [selectedTechniques, setSelectedTechniques] = useState([])

  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          (selectedCategories.length === 0 ||
            selectedCategories.includes(product.category)) &&
          (selectedMaterials.length === 0 || selectedMaterials.includes(product.material)) &&
          (selectedTechniques.length === 0 || selectedTechniques.includes(product.technique)),
      ),
    [selectedCategories, selectedMaterials, selectedTechniques],
  )

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
          Sistemas modulares de fabricación propia en titanio biocompatible, customizables para
          adaptarse a la patología de cada paciente. Para reconstrucciones que requieren una
          pieza única, trabajamos por{' '}
          <Link to="/casos-a-medida" className="text-primary underline hover:no-underline">
            caso a medida
          </Link>
          .
        </Reveal>
      </div>
      <div className="flex flex-col md:flex-row gap-xl">
        <ProductFilters
          categories={categories}
          materials={materials}
          techniques={techniques}
          selectedCategories={selectedCategories}
          selectedMaterials={selectedMaterials}
          selectedTechniques={selectedTechniques}
          onToggleCategory={(value) => setSelectedCategories((prev) => toggle(prev, value))}
          onToggleMaterial={(value) => setSelectedMaterials((prev) => toggle(prev, value))}
          onToggleTechnique={(value) => setSelectedTechniques((prev) => toggle(prev, value))}
          onClear={() => {
            setSelectedCategories([])
            setSelectedMaterials([])
            setSelectedTechniques([])
          }}
        />
        <div className="flex-grow">
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg h-fit">
              {filteredProducts.map((product, i) => (
                <Reveal key={product.id} delay={step(2 + (i % 3))} className="h-full">
                  <ProductCard product={product} />
                </Reveal>
              ))}
            </div>
          ) : (
            <p className="font-body-md text-body-md text-on-surface-variant">
              No hay productos que coincidan con los filtros seleccionados.
            </p>
          )}
        </div>
      </div>
    </main>
  )
}
