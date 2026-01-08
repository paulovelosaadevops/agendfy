"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"

export default function BillingSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [recovering, setRecovering] = useState(false)

  useEffect(() => {
    const sessionId = searchParams.get("session_id")
    if (!sessionId) {
      router.push("/dashboard/professional")
      return
    }

    // Wait for webhook to process
    setTimeout(() => {
      setLoading(false)
    }, 5000)
  }, [searchParams, router])

  const handleRecoverSubscription = async () => {
    if (!user?.email) return

    setRecovering(true)
    try {
      const response = await fetch("/api/admin/recover-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email }),
      })

      if (response.ok) {
        // Refresh the page to update user data
        window.location.href = "/dashboard/professional"
      } else {
        const data = await response.json()
        alert(`Erro: ${data.error}`)
      }
    } catch (error) {
      console.error("[v0] Erro ao recuperar assinatura:", error)
      alert("Erro ao processar recuperação. Tente novamente.")
    } finally {
      setRecovering(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="bg-card border-border p-8 max-w-md w-full text-center">
          <Loader2 className="w-12 h-12 text-primary mx-auto mb-4 animate-spin" />
          <h2 className="text-2xl font-bold text-foreground mb-2">Processando pagamento...</h2>
          <p className="text-muted-foreground">Aguarde enquanto confirmamos sua assinatura.</p>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="bg-card border-border p-8 max-w-md w-full text-center">
          <div className="p-3 bg-orange-500/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-orange-400" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Ativação pendente</h2>
          <p className="text-muted-foreground mb-6">
            Seu pagamento foi confirmado, mas a ativação está demorando mais que o esperado. Clique no botão abaixo para
            ativar manualmente.
          </p>
          <Button
            onClick={handleRecoverSubscription}
            disabled={recovering}
            className="w-full bg-primary hover:bg-primary/90 mb-3"
          >
            {recovering ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Ativando...
              </>
            ) : (
              "Ativar Premium agora"
            )}
          </Button>
          <Link href="/dashboard/professional">
            <Button variant="outline" className="w-full bg-transparent">
              Voltar ao Dashboard
            </Button>
          </Link>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="bg-card border-border p-8 max-w-md w-full text-center">
        <div className="p-3 bg-green-500/10 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <CheckCircle className="w-8 h-8 text-green-400" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Pagamento confirmado!</h2>
        <p className="text-muted-foreground mb-6">
          Sua assinatura Premium foi ativada com sucesso. Agora você tem acesso completo a todas as funcionalidades do
          AgendFy!
        </p>
        <Link href="/dashboard/professional">
          <Button className="w-full bg-primary hover:bg-primary/90">Ir para o Dashboard</Button>
        </Link>
      </Card>
    </div>
  )
}
