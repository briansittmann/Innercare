const products = [
  {
    id: 1,
    slug: 'endoprotesis-modular-femur-customizable',
    name: 'Endoprótesis no convencional modular para fémur customizable',
    shortDescription:
      'Sistema modular customizable a medida para adaptarse a patologías específicas de cada paciente.',
    category: 'Reconstrucción Oncológica',
    material: 'Titanio Ti-6Al-4V',
    compatibility: 'Cabezas de Cerámica Biolox o Cr-Co con cono morse 12-14',
    specifications: [
      'Cuerpo principal de 40mm y 60mm x 135°, con y sin alas para sutura',
      'Vástagos cementados de Ø10, 11 y 12mm x 120, 140 y 160mm',
      'Suplementos modulares de 40mm a 90mm',
      'Tornillo de cierre',
      'Vástagos curvos disponibles a pedido',
    ],
    availableSizes: [
      '40mm x 135°',
      '60mm x 135°',
      'Ø10 x 120mm',
      'Ø10 x 140mm',
      'Ø10 x 160mm',
      'Ø11 x 120mm',
      'Ø11 x 140mm',
      'Ø11 x 160mm',
      'Ø12 x 120mm',
      'Ø12 x 140mm',
      'Ø12 x 160mm',
    ],
    images: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA_cq3pUPccjk_gW8wdbTa-p0H0i5SJ-yb-SFU3z3rji7nEYKKn_mCYyS2T1UipzA4YhRJayuX5Xb6EDZteUg2QS9rEwGn6gVes-JwHXsF26ed3lsTHVijieIcbwn9qyS-TcqaeQphSDlMMxUdNxMpXAUrdLPNYB0sHgBdODZ5eaYF17BU1DjeV9GDhzxP88F7I-ZFiv03Wtj9_ggUv5avYXD1rOv9dDjpUn-3iodseAtKk_CS5cOt0vA',
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDpN-Z_hVvV35rK11qqWqVoO5j8gtG7bvZFR9sXx8dwjD5z137jC_fIT0QuZ8yt5I3vFCyuEOKKGBnStJjPFURfLRcTF3XZOJkgE505zYJ5dqpSv8bmigL6t1CQ-5ql9BQaquSK_SCSWKyqD4hRdztrkFdyDuIzQm-9Tg4XuJjbrHQxv0s8DhwgBPEARMG4zE3ZMhHdcOYcky-HlXsm5TotJ2sIDXd41QP_NPvl5HeTRcEY_c-AsbNZQA',
    ],
  },
]

export default products

export function getProductBySlug(slug) {
  return products.find((product) => product.slug === slug)
}
