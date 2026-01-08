"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, AlertCircle, RefreshCw } from "lucide-react"

export default function WebhookStatusPage() {
  const [status, setStatus] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const checkStatus = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/stripe-webhook/test")
      const data = await response.json()
      setStatus(data)
    } catch (error) {
      setStatus({ error: "Failed to check webhook status" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto p-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>Status do Webhook do Stripe</CardTitle>
          <CardDescription>Verifique se o webhook está configurado corretamente</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Button onClick={checkStatus} disabled={loading} className="w-full">
            {loading ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              "Verificar Status do Webhook"
            )}
          </Button>

          {status && (
            <div className="space-y-4">
              <Alert variant={status.webhookSecretConfigured ? "default" : "destructive"}>
                {status.webhookSecretConfigured ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertDescription>
                  <strong>Webhook Secret:</strong>{" "}
                  {status.webhookSecretConfigured ? "Configurado ✓" : "NÃO CONFIGURADO ✗"}
                </AlertDescription>
              </Alert>

              {status.webhookSecretConfigured && (
                <div className="rounded-lg border p-4 bg-muted/50">
                  <p className="text-sm font-mono">
                    <strong>Valor:</strong> {status.webhookSecretValue}
                  </p>
                  <p className="text-sm text-muted-foreground mt-2">
                    <strong>Última verificação:</strong> {new Date(status.timestamp).toLocaleString("pt-BR")}
                  </p>
                </div>
              )}

              {!status.webhookSecretConfigured && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Ação necessária:</strong>
                    <ol className="list-decimal ml-5 mt-2 space-y-1">
                      <li>Acesse o Stripe Dashboard</li>
                      <li>Vá em Developers {">"} Webhooks</li>
                      <li>Copie o Signing Secret do webhook</li>
                      <li>Atualize a variável STRIPE_WEBHOOK_SECRET no Vercel</li>
                      <li>Faça redeploy da aplicação</li>
                    </ol>
                  </AlertDescription>
                </Alert>
              )}

              <div className="rounded-lg border p-4 space-y-2">
                <h3 className="font-semibold">URL do Webhook</h3>
                <code className="block p-2 bg-muted rounded text-sm">
                  {typeof window !== "undefined" ? window.location.origin : "https://v0.app-agendfy.vercel.app"}
                  /api/stripe-webhook
                </code>
                <p className="text-sm text-muted-foreground">
                  Use esta URL ao configurar o webhook no Stripe Dashboard
                </p>
              </div>

              <div className="rounded-lg border p-4 space-y-2">
                <h3 className="font-semibold">Eventos Necessários</h3>
                <ul className="list-disc ml-5 text-sm space-y-1">
                  <li>checkout.session.completed</li>
                  <li>invoice.payment_succeeded</li>
                  <li>customer.subscription.updated</li>
                  <li>customer.subscription.deleted</li>
                </ul>
              </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Documentação completa:</strong> Consulte o arquivo{" "}
                  <code className="bg-muted px-1 rounded">STRIPE_WEBHOOK_SETUP.md</code> na raiz do projeto para
                  instruções detalhadas.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
