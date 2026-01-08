"use client"

import { useEffect, use } from "react"
import { useRouter } from "next/navigation"

export default function PublicBookingPage({
  params,
}: {
  params: Promise<{ professionalId: string }>
}) {
  const { professionalId } = use(params)
  const router = useRouter()

  useEffect(() => {
    console.log("[v0] Redirecting to booking page with professional ID:", professionalId)
    // Direct redirect to cliente page with professional parameter
    router.replace(`/cliente?professional=${professionalId}`)
  }, [professionalId, router])

  return (
    <div className="flex h-screen items-center justify-center">
      <div className="text-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
        <p className="text-muted-foreground">Carregando agendamento...</p>
      </div>
    </div>
  )
}
