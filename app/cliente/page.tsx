"use client"

import { useSearchParams } from "next/navigation"
import { Suspense } from "react"
import { ClientNavbar } from "@/components/client/client-navbar"
import { ClientHero } from "@/components/client/client-hero"
import { ClientFeatures } from "@/components/client/client-features"
import { ClientHowItWorks } from "@/components/client/client-how-it-works"
import { ClientCTA } from "@/components/client/client-cta"
import { Footer } from "@/components/footer"
import { ProfessionalBooking } from "@/components/client/professional-booking"

function ClientPageContent() {
  const searchParams = useSearchParams()
  const professionalId = searchParams.get("professional")

  if (professionalId) {
    return (
      <>
        <ClientNavbar />
        <main className="min-h-screen pt-16">
          <ProfessionalBooking professionalId={professionalId} />
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <ClientNavbar />
      <main className="min-h-screen">
        <ClientHero />
        <ClientFeatures />
        <ClientHowItWorks />
        <ClientCTA />
      </main>
      <Footer />
    </>
  )
}

export default function ClientLandingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <ClientPageContent />
    </Suspense>
  )
}
