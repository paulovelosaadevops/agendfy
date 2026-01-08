"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Check, X, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"

interface UpgradePromptModalProps {
  open: boolean
  onClose: () => void
  feature: string
  currentCount?: number
  limit?: number
}

export function UpgradePromptModal({ open, onClose, feature, currentCount, limit }: UpgradePromptModalProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  async function handleUpgrade() {
    if (!user?.uid) return

    setLoading(true)
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
        throw new Error("Failed to create checkout session")
      }

      const data = await response.json()

      if (data.url) {
        window.open(data.url, "_blank", "noopener,noreferrer")
        setLoading(false)
        onClose()
      } else {
        throw new Error("No checkout URL returned")
      }
    } catch (error) {
      console.error("Error creating checkout session:", error)
      alert("Erro ao criar sessão de pagamento. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border max-w-2xl w-[95vw] md:w-full max-h-[90vh] overflow-y-auto p-0">
        {/* Mobile close header - always visible and easy to tap */}
        <div className="sticky top-0 z-10 bg-card border-b border-border p-4 flex items-center justify-between md:hidden">
          <button
            onClick={onClose}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground active:text-foreground min-h-[44px] min-w-[44px] -ml-2 pl-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </button>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted active:bg-muted rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Fechar"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <div className="p-4 md:p-6">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 md:p-3 bg-primary/10 rounded-lg">
                <Sparkles className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              </div>
              <DialogTitle className="text-xl md:text-2xl text-foreground">Upgrade para Premium</DialogTitle>
            </div>
            <DialogDescription className="text-muted-foreground text-sm md:text-base">
              {limit !== undefined && currentCount !== undefined
                ? `Você atingiu o limite de ${limit} ${feature} do plano Free. Faça upgrade para continuar sem limites!`
                : `Este recurso está disponível apenas no plano Premium.`}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 md:space-y-6 py-4">
            {/* Free vs Premium Comparison */}
            <div className="grid gap-3 md:gap-4 md:grid-cols-2">
              {/* Free Plan */}
              <div className="border border-border rounded-lg p-3 md:p-4 bg-muted">
                <h3 className="font-semibold text-muted-foreground mb-3 text-sm md:text-base">Plano Free</h3>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs md:text-sm">
                    <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Máximo 10 agendamentos</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs md:text-sm">
                    <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Máximo 3 serviços</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs md:text-sm">
                    <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Máximo 5 clientes</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs md:text-sm">
                    <X className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-muted-foreground">Sem relatórios financeiros</span>
                  </div>
                </div>
              </div>

              {/* Premium Plan */}
              <div className="border-2 border-primary/30 rounded-lg p-3 md:p-4 bg-primary/5">
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="font-semibold text-foreground text-sm md:text-base">Plano Premium</h3>
                  <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full">Recomendado</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Agendamentos ilimitados</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Serviços ilimitados</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Clientes ilimitados</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Relatórios financeiros completos</span>
                  </div>
                  <div className="flex items-start gap-2 text-xs md:text-sm">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span className="text-foreground">Suporte prioritário via WhatsApp</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="bg-primary/10 border border-primary/30 rounded-lg p-4 md:p-6 text-center">
              <p className="text-muted-foreground mb-2 text-sm md:text-base">Por apenas</p>
              <p className="text-3xl md:text-4xl font-bold text-foreground mb-1">
                R$ 9,90<span className="text-base md:text-lg text-muted-foreground">/mês</span>
              </p>
              <p className="text-xs md:text-sm text-muted-foreground">Cancele quando quiser, sem burocracia</p>
            </div>

            {/* Action Buttons - larger touch targets on mobile */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 min-h-[48px] md:min-h-[44px] text-base bg-transparent"
                disabled={loading}
              >
                Continuar no Free
              </Button>
              <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90 min-h-[48px] md:min-h-[44px] text-base"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                {loading ? "Processando..." : "Fazer Upgrade Agora"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
