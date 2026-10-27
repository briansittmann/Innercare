import { ContactCta } from '@/components/contact-cta'
import { CustomCasesTeaser } from '@/components/home/custom-cases'
import { Hero } from '@/components/home/hero'
import { OwnManufacturing } from '@/components/home/own-manufacturing'
import { Statement } from '@/components/home/statement'

export default function Home() {
  return (
    <>
      <Hero />
      <Statement />
      <OwnManufacturing />
      <CustomCasesTeaser />
      <ContactCta />
    </>
  )
}
