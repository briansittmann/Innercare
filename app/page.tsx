import { ContactCta } from '@/components/home/contact-cta'
import { Credentials } from '@/components/home/credentials'
import { CustomCasesTeaser } from '@/components/home/custom-cases'
import { Hero } from '@/components/home/hero'
import { OwnManufacturing } from '@/components/home/own-manufacturing'
import { Process } from '@/components/home/process'

export default function Home() {
  return (
    <>
      <Hero />
      <Credentials />
      <OwnManufacturing />
      <Process />
      <CustomCasesTeaser />
      <ContactCta />
    </>
  )
}
