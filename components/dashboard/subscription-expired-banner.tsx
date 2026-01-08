"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Sparkles } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ToastMessage } from "@/components/ui/toast-message"
import { getFriendlyErrorMessage } from "@/lib/user-messages"

export function SubscriptionExpiredBanner() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubscribe() {
    if (!user?.uid) return

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email || user.uid + "@agendfy.com",
          businessName: user.businessName || "Meu Negócio",
          role: user.role || "professional",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "checkout_failed")
      }

      const data = await response.json()

      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer")
        setLoading(false)
      } else {
        throw new Error("checkout_failed")
      }
    } catch (error) {
      setError(getFriendlyErrorMessage(error))
      setLoading(false)
    }
  }

  if (
    user?.role !== "professional" ||
    user?.subscriptionStatus === "premium" ||
    user?.subscriptionStatus === "premium_trial"
  ) {
    return null
  }

  return (
    <Card className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border-orange-500/30 p-4 md:p-6 mb-4 md:mb-6">
      <div className="flex flex-col sm:flex-row items-start gap-3 md:gap-4">
        <div className="p-2 bg-orange-500/20 rounded-lg">
          <AlertTriangle className="w-5 h-5 md:w-6 md:h-6 text-orange-400" />
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-orange-400 text-base md:text-lg mb-2">Seu período de teste terminou</h3>
          <p className="text-sm md:text-base text-gray-300 mb-4">
            Assine o plano Premium por apenas <span className="font-bold text-white">R$ 9,90/mês</span> para continuar
            aproveitando todas as funcionalidades do AgendFy e gerenciar seu negócio sem limites.
          </p>
          {error && <ToastMessage type="error" message={error} className="mb-4" />}
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 h-12 md:h-10 w-full sm:w-auto"
          >
            <Sparkles className="w-4 h-4 mr-2" />
            {loading ? "Processando..." : "Assinar Premium"}
          </Button>
        </div>
      </div>
    </Card>
  )
}
