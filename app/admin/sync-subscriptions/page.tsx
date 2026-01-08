"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Loader2 } from "lucide-react"

export default function SyncSubscriptionsPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    details?: any
  } | null>(null)

  const handleSync = async () => {
    if (!email) {
      setResult({
        success: false,
        message: "Por favor, informe o email",
      })
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/admin/sync-stripe-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setResult({
          success: true,
          message: data.message,
          details: data,
        })
      } else {
        setResult({
          success: false,
          message: data.error || "Erro ao sincronizar",
          details: data,
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: "Erro ao conectar com o servidor",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Sincronizar Assinaturas Stripe</CardTitle>
          <CardDescription>
            Ferramenta administrativa para sincronizar assinaturas do Stripe com o Firebase
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">
              Email do usuário
            </label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@exemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />
          </div>

          <Button onClick={handleSync} disabled={loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sincronizando...
              </>
            ) : (
              "Sincronizar Assinatura"
            )}
          </Button>

          {result && (
            <Alert variant={result.success ? "default" : "destructive"}>
              <div className="flex items-start gap-2">
                {result.success ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <XCircle className="h-5 w-5" />}
                <div className="flex-1">
                  <AlertDescription>
                    <p className="font-medium">{result.message}</p>
                    {result.details && (
                      <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                        {JSON.stringify(result.details, null, 2)}
                      </pre>
                    )}
                  </AlertDescription>
                </div>
              </div>
            </Alert>
          )}

          <div className="mt-6 p-4 bg-muted rounded-lg text-sm">
            <p className="font-medium mb-2">O que esta ferramenta faz:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Busca assinaturas ativas no Stripe pelo email</li>
              <li>Cancela assinaturas duplicadas (mantém apenas a mais recente)</li>
              <li>Atualiza o status do usuário no Firebase para Premium</li>
              <li>Sincroniza dados da assinatura (ID, datas, etc.)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
