"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Loader2 } from "lucide-react"
import { getFriendlyErrorMessage } from "@/lib/user-messages"
import { ToastMessage } from "@/components/ui/toast-message"
import Image from "next/image"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { login, user } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const from = searchParams.get("from") || "professional"
  const registerLink = from === "client" ? "/register/cliente" : "/register/profissional"
  const backLink = from === "client" ? "/cliente" : "/"

  useEffect(() => {
    if (user) {
      const redirectAfterLogin = sessionStorage.getItem("redirectAfterLogin")
      if (redirectAfterLogin) {
        sessionStorage.removeItem("redirectAfterLogin")
        router.push(redirectAfterLogin)
      } else {
        router.push("/dashboard")
      }
    }
  }, [user, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      await login(email, password)
    } catch (err: unknown) {
      setError(getFriendlyErrorMessage(err))
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8">
          <Link
            href={backLink}
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
          <h2 className="text-3xl font-bold text-foreground mt-4">Bem-vindo de volta</h2>
          <p className="text-muted-foreground mt-2">Entre na sua conta para continuar</p>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Senha</Label>
              <Link href="/reset-password" className="text-xs text-primary hover:underline">
                Esqueceu a senha?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {error && <ToastMessage type="error" message={error} />}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Entrando...
              </>
            ) : (
              "Entrar"
            )}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            Não tem uma conta?{" "}
            <Link href={registerLink} className="text-primary hover:underline font-medium">
              Cadastre-se
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
