"use client"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { PageHeaderEnhanced } from "@/components/dashboard/page-header-enhanced"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Sparkles,
  CreditCard,
  Calendar,
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Crown,
  Shield,
} from "lucide-react"
import { formatDate } from "@/lib/utils/format"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { SupportButton } from "@/components/dashboard/support-button"

function SubscriptionContent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const isPremium = user?.subscriptionStatus === "premium" && user?.subscription?.active
  const isTrial = user?.subscriptionStatus === "premium_trial" && user?.trial?.active
  const isFree = user?.subscriptionStatus === "free" || (!isPremium && !isTrial)

  const canUpgrade = !isPremium // Both free AND trial users can upgrade

  async function handleUpgrade() {
    if (!user?.uid || !user?.email) {
      setMessage({ type: "error", text: "Erro ao processar solicitação. Faça login novamente." })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.uid,
          email: user.email,
          businessName: user.businessName || "Sem nome",
          role: user.role || "professional",
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao criar sessão de checkout")
      }

      const data = await response.json()

      if (data.url) {
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent)

        if (isMobile) {
          window.location.href = data.url
        } else {
          window.open(data.url, "_blank")
          setMessage({
            type: "success",
            text: "Abrindo checkout do Stripe. Complete o pagamento para ativar o Premium.",
          })
        }
      }
    } catch (error) {
      console.error("Erro ao criar checkout:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao processar pagamento. Tente novamente.",
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelSubscription() {
    if (!user?.subscription?.stripeSubscriptionId) {
      setMessage({ type: "error", text: "Assinatura não encontrada." })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/cancel-subscription", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subscriptionId: user.subscription.stripeSubscriptionId,
          userId: user.uid,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Erro ao cancelar assinatura")
      }

      setMessage({
        type: "success",
        text: "Assinatura cancelada. Você terá acesso Premium até o final do período pago atual.",
      })

      setTimeout(() => {
        window.location.reload()
      }, 2000)
    } catch (error) {
      console.error("Erro ao cancelar assinatura:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Erro ao cancelar assinatura. Tente novamente.",
      })
    } finally {
      setLoading(false)
      setShowCancelDialog(false)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeaderEnhanced
        title="Minha Assinatura"
        description="Gerencie sua assinatura e planos do AgendFy"
        icon={Sparkles}
        badge={
          isPremium ? (
            <Badge className="bg-blue-600 text-white border-blue-500">
              <Crown className="w-3 h-3 mr-1" />
              Premium Ativo
            </Badge>
          ) : isTrial ? (
            <Badge className="bg-blue-600 text-white border-blue-500">Período de Teste</Badge>
          ) : (
            <Badge variant="secondary">Plano Gratuito</Badge>
          )
        }
      />

      <Card className="border-border shadow-lg overflow-hidden bg-card">
        <div className="bg-gradient-to-r from-blue-500/10 via-blue-600/5 to-transparent p-6 border-b border-border">
          <h3 className="text-lg font-semibold text-foreground">Precisa de ajuda?</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {isPremium || isTrial
              ? "Fale diretamente com nosso especialista via WhatsApp"
              : "Entre em contato conosco por e-mail"}
          </p>
        </div>
        <div className="p-6">
          <SupportButton />
        </div>
      </Card>

      {message && (
        <Card
          className={`p-4 border ${
            message.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-600 dark:text-green-400"
              : "bg-red-500/10 border-red-500/20 text-red-600 dark:text-red-400"
          }`}
        >
          <div className="flex items-center gap-3">
            {message.type === "success" ? <CheckCircle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            <p className="font-medium">{message.text}</p>
          </div>
        </Card>
      )}

      {/* Current Plan Card - Fixed for light mode */}
      <Card className="border-border shadow-lg overflow-hidden bg-card">
        <div
          className={`p-6 border-b ${
            isPremium
              ? "bg-gradient-to-r from-blue-500/20 via-blue-600/10 to-transparent border-blue-500/20"
              : isTrial
                ? "bg-gradient-to-r from-blue-500/20 via-blue-600/10 to-transparent border-blue-500/20"
                : "bg-gradient-to-r from-gray-500/10 via-gray-600/5 to-transparent border-border"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div
                className={`p-3 rounded-xl ${isPremium ? "bg-blue-500/20" : isTrial ? "bg-blue-500/20" : "bg-muted"}`}
              >
                {isPremium || isTrial ? (
                  <Crown className="w-6 h-6 text-primary" />
                ) : (
                  <Shield className="w-6 h-6 text-muted-foreground" />
                )}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground">
                  {isPremium ? "Plano Premium" : isTrial ? "Período de Teste Premium" : "Plano Gratuito"}
                </h2>
                <p className="text-muted-foreground mt-1">
                  {isPremium
                    ? "Acesso ilimitado a todas as funcionalidades"
                    : isTrial
                      ? "Experimente todos os recursos por tempo limitado"
                      : "Recursos básicos disponíveis"}
                </p>
              </div>
            </div>
            {isPremium && (
              <Badge className="bg-green-500/20 text-green-600 dark:text-green-400 border-green-500/30">
                <CheckCircle className="w-3 h-3 mr-1" />
                Ativo
              </Badge>
            )}
          </div>
        </div>

        <div className="p-6 space-y-4">
          {/* Subscription Details */}
          {isPremium && user?.subscription && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Início da assinatura</p>
                    <p className="text-sm font-semibold text-foreground">{formatDate(user.subscription.startedAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-xs text-muted-foreground">Valor mensal</p>
                    <p className="text-sm font-semibold text-foreground">R$ 9,90/mês</p>
                  </div>
                </div>
              </div>

              {user.subscription.cancelAtPeriodEnd && (
                <Card className="p-4 bg-orange-500/10 border-orange-500/20">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-orange-500 dark:text-orange-400 mt-0.5" />
                    <div>
                      <p className="font-semibold text-orange-600 dark:text-orange-400">
                        Assinatura programada para cancelamento
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Você terá acesso Premium até o final do período pago atual.
                      </p>
                    </div>
                  </div>
                </Card>
              )}
            </>
          )}

          {/* Trial Details - with upgrade option */}
          {isTrial && user?.trial && (
            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-500 dark:text-blue-400 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-600 dark:text-blue-400">Período de teste ativo</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Seu teste termina em {formatDate(user.trial.endsAt)}. Assine o Premium agora para continuar sem
                    interrupções e garantir seu acesso!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Free Plan Details */}
          {isFree && (
            <div className="p-4 bg-muted border border-border rounded-lg">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-semibold text-foreground">Limitações do plano gratuito</p>
                  <ul className="text-sm text-muted-foreground mt-2 space-y-1">
                    <li>• Máximo de 3 serviços cadastrados</li>
                    <li>• Máximo de 15 clientes</li>
                    <li>• Máximo de 30 agendamentos por mês</li>
                    <li>• Visualização de agenda limitada ao modo Dia</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons - canUpgrade includes trial users */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            {canUpgrade && (
              <Button
                onClick={handleUpgrade}
                disabled={loading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 font-semibold"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2" />
                    Processando...
                  </>
                ) : (
                  <>
                    <Crown className="w-4 h-4 mr-2" />
                    {isTrial ? "Assinar Premium Agora - R$ 9,90/mês" : "Assinar Premium - R$ 9,90/mês"}
                  </>
                )}
              </Button>
            )}

            {isPremium && !user?.subscription?.cancelAtPeriodEnd && (
              <Button
                variant="destructive"
                onClick={() => setShowCancelDialog(true)}
                disabled={loading}
                className="flex-1 h-12 font-semibold"
              >
                <XCircle className="w-4 h-4 mr-2" />
                Cancelar Assinatura
              </Button>
            )}

            {isPremium && user?.subscription?.stripeCustomerId && (
              <Button
                variant="outline"
                onClick={() => window.open(`https://billing.stripe.com/p/login/test_00000000000000`, "_blank")}
                className="h-12 font-semibold"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Portal de Cobrança
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Premium Benefits - Fixed for light mode */}
      <Card className="border-border shadow-lg overflow-hidden bg-card">
        <div className="bg-gradient-to-r from-blue-500/10 via-blue-600/5 to-transparent p-6 border-b border-border">
          <h3 className="text-xl font-semibold text-foreground">Benefícios do Plano Premium</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Serviços ilimitados</p>
                <p className="text-sm text-muted-foreground">Cadastre quantos serviços precisar</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Clientes ilimitados</p>
                <p className="text-sm text-muted-foreground">Sem limite de cadastros</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Agendamentos ilimitados</p>
                <p className="text-sm text-muted-foreground">Quantos agendamentos precisar por mês</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Todas as visualizações</p>
                <p className="text-sm text-muted-foreground">Dia, Semana e Mês</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Relatórios avançados</p>
                <p className="text-sm text-muted-foreground">Análises completas do seu negócio</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 dark:text-green-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-foreground">Suporte prioritário</p>
                <p className="text-sm text-muted-foreground">Atendimento preferencial</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Cancel Subscription Dialog */}
      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-500" />
              Cancelar Assinatura Premium
            </AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Tem certeza que deseja cancelar sua assinatura? Você perderá acesso aos seguintes benefícios:
              <ul className="mt-3 space-y-2">
                <li>• Serviços, clientes e agendamentos ilimitados</li>
                <li>• Visualização de agenda em Semana e Mês</li>
                <li>• Relatórios avançados</li>
                <li>• Suporte prioritário</li>
              </ul>
              <p className="mt-3 font-semibold text-foreground">
                Você manterá o acesso Premium até o final do período pago atual.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-muted hover:bg-muted/80 text-foreground border-border">
              Manter Premium
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSubscription}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              {loading ? "Cancelando..." : "Confirmar Cancelamento"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default function SubscriptionPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SubscriptionContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
