import Hero from '../components/Hero.jsx'
import Reveal from '../components/Reveal.jsx'
import { step } from '../lib/motion.js'

const commitments = [
  {
    icon: 'precision_manufacturing',
    title: 'Ingeniería de Precisión',
    description:
      'Fabricado con tolerancias a nivel micrónico utilizando materiales de grado aeroespacial que aseguran estabilidad a largo plazo del implante.',
  },
  {
    icon: 'biotech',
    title: 'Eficacia Clínica',
    description:
      'Protocolos rigurosamente testeados respaldados por amplia información clínica, demostrando tasas de supervivencia superiores.',
  },
  {
    icon: 'handshake',
    title: 'Alianza con Cirujanos',
    description:
      'Programas de soporte integral, instrumental especializado y formación médica continua para un éxito procedimental óptimo.',
  },
]

export default function Home() {
  return (
    <main className="flex-grow">
      <Hero />
      <section className="bg-surface-container-low py-section">
        <div className="max-w-container-max mx-auto px-gutter grid md:grid-cols-3 gap-lg">
          {commitments.map((item, i) => (
            <Reveal
              key={item.title}
              delay={step(i)}
              className="bg-surface p-lg rounded-xl border border-outline-variant shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 bg-primary-fixed text-on-primary-fixed rounded-lg flex items-center justify-center mb-md">
                <span className="material-symbols-outlined fill-icon">{item.icon}</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-primary mb-sm">{item.title}</h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">{item.description}</p>
            </Reveal>
          ))}
        </div>
      </section>
    </main>
  )
}
