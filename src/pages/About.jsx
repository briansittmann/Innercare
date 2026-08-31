import Reveal from '../components/Reveal.jsx'
import WordReveal from '../components/WordReveal.jsx'
import { step } from '../lib/motion.js'
import CountUp from '../components/CountUp.jsx'

const stats = [
  { value: '25+', label: 'Patentes Activas' },
  { value: '15', label: 'Años de Datos Clínicos' },
  { value: '98%', label: 'Tasa de Éxito (10 años)' },
  { value: '40', label: 'Países Atendidos' },
]

export default function About() {
  return (
    <main className="flex-grow">
      <section className="py-section px-gutter bg-surface-container-low border-b border-outline-variant relative overflow-hidden">
        <div className="max-w-container-max mx-auto grid md:grid-cols-12 gap-lg items-center relative z-10">
          <div className="md:col-span-7">
            <WordReveal
              as="h1"
              text="Impulsando la Ortopedia a través de la Precisión"
              delay={0.12}
              stagger={0.06}
              className="font-display-lg text-display-lg text-primary mb-md"
            />
            <Reveal delay={step(2)}>
              <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">
                En Innercare, nuestra misión es mejorar drásticamente los resultados de los
                pacientes desarrollando soluciones ortopédicas de alta precisión y tecnología
                avanzada. Somos el puente entre la necesidad clínica y la excelencia en
                ingeniería.
              </p>
            </Reveal>
          </div>
          <Reveal
            delay={step(3)}
            x={48}
            y={0}
            className="md:col-span-5 h-[400px] rounded-lg overflow-hidden border border-outline-variant/30 shadow-sm bg-surface relative"
          >
            <img
              className="w-full h-full object-cover"
              alt="Implante ortopédico de titanio de precisión"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCqOE9TmfHW8uDBnnWiBS3Bw9qfUclgls3DjAbLrzBTFRn8NhTG21lvOxVzM6r_02mcxkwJbn25EfA7ZdqV8aGyZZqkPapCEEjY9RWoaJUNgHeS6Cwhk2GdNQrffiCUIB6OWYTvRq3MLb5nS8GmCjKm8Gltl3pulHZ4ah12CJluz0-VextgFlNPyekiKiirY-attF_hYoRqr9ZOSCcI274qhwDaUL81JpHn4l9S7I-cBOMLAYbqv5FztQ"
            />
          </Reveal>
        </div>
      </section>

      <section className="py-section px-gutter">
        <div className="max-w-container-max mx-auto">
          <Reveal className="mb-xl text-center">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-sm">
              Nuestra Tecnología
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-3xl mx-auto">
              Aprovechamos la ciencia de materiales de vanguardia y la ingeniería biomecánica
              para crear implantes que se integran perfectamente con el cuerpo humano.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
            <Reveal className="col-span-1 md:col-span-2 bg-surface border border-outline-variant shadow-sm rounded-lg p-lg hover:shadow-md transition-shadow">
              <div className="flex items-start gap-md mb-md">
                <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">biotech</span>
                </div>
                <div>
                  <h3 className="font-headline-md text-headline-md text-on-surface">
                    Materiales Bio-Integrados
                  </h3>
                  <p className="font-body-sm text-body-sm text-primary uppercase tracking-widest mt-1">
                    Aleaciones de Titanio Propietarias
                  </p>
                </div>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant mb-md">
                Nuestras aleaciones a base de titanio propietarias están diseñadas para una
                osteointegración óptima, reduciendo el rechazo y promoviendo tiempos de curación
                más rápidos que los materiales estándar de la industria.
              </p>
              <div className="h-[200px] rounded bg-surface-variant border border-outline-variant/30 overflow-hidden relative">
                <img
                  className="w-full h-full object-cover"
                  alt="Superficie de titanio poroso a nivel microscópico"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBKZI6xI57l5KB040iq7g6obbKhvtIsfl0PhmE7_dOU_bGLHoCX5sj_2OESoEyF80Wml46V8Rmd0BlGHN9Pp5PyujrY-OajZV7WMfa8Jyo6Kp0TK5s8T7xGBoXyPko1h2_YtkHTQhpqna-MUjr2ywCr0GdBtBiaLOnLglIRz4-1Kp_DsuecnCWbv73TMERZJcy-0D8oWq0fMwQUB6hMB374IfT0mErJwl5dS5hyR_Na4_VoSqufIfq9_w"
                />
              </div>
            </Reveal>
            <Reveal
              delay={step(1)}
              className="col-span-1 bg-surface border border-outline-variant shadow-sm rounded-lg p-lg flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-md">
                <span className="material-symbols-outlined">precision_manufacturing</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">
                Precisión Micrónica
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant flex-grow mb-md">
                Cada componente se mecaniza con tolerancias submicrónicas, garantizando una
                articulación perfecta y un desgaste mínimo durante toda la vida útil del
                implante.
              </p>
              <div className="bg-surface-container-lowest p-sm rounded border border-outline-variant/20">
                <div className="font-data-mono text-data-mono text-primary flex justify-between">
                  <span>Tolerancia</span>
                  <span>±0.001mm</span>
                </div>
              </div>
            </Reveal>
            <Reveal
              delay={step(2)}
              className="col-span-1 bg-surface border border-outline-variant shadow-sm rounded-lg p-lg hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-full bg-surface-container-high flex items-center justify-center text-primary mb-md">
                <span className="material-symbols-outlined">3d_rotation</span>
              </div>
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-sm">
                Geometrías Específicas del Paciente
              </h3>
              <p className="font-body-sm text-body-sm text-on-surface-variant">
                Utilizando imágenes avanzadas e impresión 3D, entregamos soluciones a medida
                para reconstrucciones ortopédicas complejas.
              </p>
            </Reveal>
            <Reveal
              delay={step(1)}
              className="col-span-1 md:col-span-2 bg-primary text-on-primary rounded-lg p-lg flex flex-col justify-center items-center text-center shadow-sm"
            >
              <h3 className="font-headline-md text-headline-md mb-sm">Calidad Inclaudicable</h3>
              <div className="flex gap-lg mt-md">
                <div className="flex flex-col items-center">
                  <span className="font-display-lg text-display-lg">ISO</span>
                  <span className="font-label-md text-label-md">Certificado 13485:2016</span>
                </div>
                <div className="w-px bg-on-primary/30 h-full" />
                <div className="flex flex-col items-center">
                  <span className="font-display-lg text-display-lg">CE</span>
                  <span className="font-label-md text-label-md">Cumplimiento MDR</span>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-section px-gutter bg-surface-container-lowest border-t border-outline-variant">
        <div className="max-w-container-max mx-auto grid md:grid-cols-2 gap-xl items-center">
          <Reveal>
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-md">
              Innovación en Ortopedia
            </h2>
            <p className="font-body-md text-body-md text-on-surface-variant mb-md">
              El futuro de la ortopedia exige más que reemplazar articulaciones; requiere
              restaurar el movimiento natural y mejorar la calidad de vida a largo plazo.
              Innercare está dedicada a la investigación y desarrollo continuos.
            </p>
            <p className="font-body-md text-body-md text-on-surface-variant mb-lg">
              Nuestros equipos multidisciplinarios de cirujanos, ingenieros y científicos de
              datos colaboran a diario para expandir los límites de lo posible en cirugía
              reconstructiva y traumatología.
            </p>
          </Reveal>
          <div className="grid grid-cols-2 gap-sm">
            {stats.map((stat, i) => (
              <Reveal
                key={stat.label}
                delay={step(i)}
                className="bg-surface border border-outline-variant p-md rounded text-center shadow-sm"
              >
                <CountUp
                  value={stat.value}
                  className="block font-display-lg text-display-lg text-primary mb-xs"
                />
                <div className="font-label-md text-label-md text-on-surface-variant">
                  {stat.label}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
