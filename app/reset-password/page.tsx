"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Calendar, ArrowLeft, Loader2, CheckCircle2, Mail, AlertTriangle } from "lucide-react"

export default function ResetPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setLoading(true)

    try {
      console.log("[v0] Attempting to send password reset email to:", email)
      await resetPassword(email)
      console.log("[v0] Password reset email sent successfully")
      setSuccess(true)
      setEmail("")
    } catch (err: unknown) {
      console.error("[v0] Password reset error:", err)
      if (err instanceof Error) {
        const errorMessage = err.message.toLowerCase()
        if (errorMessage.includes("user-not-found") || errorMessage.includes("no user record")) {
          setError("Nenhuma conta encontrada com este email. Verifique se digitou corretamente.")
        } else if (errorMessage.includes("invalid-email")) {
          setError("Formato de email inválido. Por favor, verifique.")
        } else if (errorMessage.includes("too-many-requests")) {
          setError("Muitas tentativas. Aguarde alguns minutos e tente novamente.")
        } else if (errorMessage.includes("network")) {
          setError("Erro de conexão. Verifique sua internet e tente novamente.")
        } else {
          setError(`Erro ao enviar email: ${err.message}`)
        }
      } else {
        setError("Erro inesperado ao enviar email. Tente novamente.")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar para login
          </Link>

          <div className="flex items-center gap-3 mb-2">
            <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">AgendFy</h1>
          </div>
          <h2 className="text-3xl font-bold text-foreground mt-4">Recuperar senha</h2>
          <p className="text-muted-foreground mt-2">
            Digite seu email e enviaremos instruções para redefinir sua senha
          </p>
        </div>

        {success ? (
          <div className="space-y-4">
            <div className="p-5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Email enviado com sucesso!</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enviamos as instruções de recuperação para seu email.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-background/50 border border-border/50 space-y-2">
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <Mail className="h-4 w-4 flex-shrink-0 mt-0.5 text-primary" />
                  <span>
                    Verifique sua <strong className="text-foreground">caixa de entrada</strong> e também a pasta de{" "}
                    <strong className="text-foreground">spam</strong>.
                  </span>
                </p>
                <p className="text-sm text-muted-foreground flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5 text-amber-500" />
                  <span>
                    O link expira em <strong className="text-foreground">1 hora</strong>.
                  </span>
                </p>
              </div>
            </div>

            <Link href="/login" className="block">
              <Button className="w-full bg-transparent" variant="outline">
                Voltar para login
              </Button>
            </Link>

            <Button variant="ghost" className="w-full text-muted-foreground" onClick={() => setSuccess(false)}>
              Não recebeu? Tentar novamente
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email cadastrado</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">Use o mesmo email que você cadastrou na sua conta.</p>
            </div>

            {error && (
              <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-destructive font-medium">Erro ao enviar</p>
                  <p className="text-sm text-destructive/80 mt-0.5">{error}</p>
                </div>
              </div>
            )}

            <Button type="submit" className="w-full h-12" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Enviando email...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Enviar instruções
                </>
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              Lembrou a senha?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Fazer login
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
