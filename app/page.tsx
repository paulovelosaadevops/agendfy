import { Navbar } from "@/components/navbar"
import { Hero } from "@/components/hero"
import { About } from "@/components/about"
import { Benefits } from "@/components/benefits"
import { Pricing } from "@/components/pricing"
import { ForWho } from "@/components/for-who"
import { CTA } from "@/components/cta"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen">
        <Hero />
        <div id="about">
          <About />
        </div>
        <Benefits />
        <Pricing />
        <ForWho />
        <CTA />
        <Footer />
      </main>
    </>
  )
}
