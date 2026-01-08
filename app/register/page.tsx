"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import { formatWhatsApp, validateWhatsApp } from "@/lib/utils/whatsapp"
import { userMessages, getFriendlyErrorMessage } from "@/lib/user-messages"
import { ToastMessage } from "@/components/ui/toast-message"
import Image from "next/image"

export default function RegisterPage() {
  const router = useRouter()
  const { register } = useAuth()
  const [email, setEmail] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  function handleWhatsAppChange(value: string) {
    const formatted = formatWhatsApp(value)
    setWhatsapp(formatted)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError(userMessages.error.passwordMismatch)
      return
    }

    if (!validateWhatsApp(whatsapp)) {
      setError(userMessages.error.whatsappInvalid)
      return
    }

    if (password.length < 6) {
      setError(userMessages.error.passwordTooShort)
      return
    }

    setLoading(true)

    try {
      await register(email, password, whatsapp)
      router.push("/dashboard")
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Link>

          {/* Logo - Increased size significantly to 450x140 for much better visibility */}
          <div className="flex items-center gap-3 mb-2">
            <div className="relative w-[450px] h-[140px]">
              <Image src="/agendfy-logo.png" alt="AgendFy" fill className="object-contain object-left" priority />
            </div>
          </div>
          <h2 className="text-3xl font-bold text-foreground mt-4">Criar sua conta</h2>
          <p className="text-muted-foreground mt-2">Comece gratuitamente e transforme sua gestão</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp">
              WhatsApp <span className="text-primary">*</span>
            </Label>
            <Input
              id="whatsapp"
              type="tel"
              placeholder="(11) 99999-9999"
              value={whatsapp}
              onChange={(e) => handleWhatsAppChange(e.target.value)}
              required
              disabled={loading}
              maxLength={15}
            />
            <p className="text-xs text-muted-foreground">Usado para notificações e confirmações de agendamento</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirm-password">Confirmar senha</Label>
            <Input
              id="confirm-password"
              type="password"
              placeholder="Digite a senha novamente"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>

          {error && <ToastMessage type="error" message={error} />}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Criando conta...
              </>
            ) : (
              "Criar conta"
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Já tem uma conta?{" "}
          <Link href="/login" className="text-primary hover:underline font-medium">
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  )
}
