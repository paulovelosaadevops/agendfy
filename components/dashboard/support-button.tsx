"use client"

import { useState } from "react"
import { MessageCircle, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAuth } from "@/contexts/auth-context"

export function SupportButton() {
  const { user } = useAuth()
  const [showFreeModal, setShowFreeModal] = useState(false)

  const isPremium = user?.subscriptionStatus === "premium" || user?.subscriptionStatus === "premium_trial"

  const handleSupportClick = () => {
    if (isPremium) {
      const message = encodeURIComponent(
        `Olá! Sou ${user?.name || "um usuário"} do AgendFy e preciso de suporte.\n\nMeu e-mail: ${user?.email || "não informado"}`,
      )
      window.open(`https://wa.me/5511966107578?text=${message}`, "_blank")
    } else {
      setShowFreeModal(true)
    }
  }

  return (
    <>
      <Button
        onClick={handleSupportClick}
        className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-500/20"
      >
        <MessageCircle className="w-4 h-4" />
        Falar com especialista
      </Button>

      <Dialog open={showFreeModal} onOpenChange={setShowFreeModal}>
        <DialogContent className="sm:max-w-md bg-card border border-border">
          <DialogHeader>
            <DialogTitle className="text-foreground flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Suporte por E-mail
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">Estamos aqui para ajudar você!</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="p-4 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
              <p className="text-sm text-foreground mb-3">
                Para suporte via WhatsApp, considere fazer upgrade para o{" "}
                <span className="font-semibold text-primary">plano Premium</span>.
              </p>
              <p className="text-sm text-muted-foreground">
                Por enquanto, envie um e-mail detalhando seu problema para:
              </p>
            </div>

            <div className="p-3 bg-muted rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground mb-1">E-mail de suporte</p>
                  <p className="text-sm font-mono text-primary">appagendfy@gmail.com</p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText("appagendfy@gmail.com")
                  }}
                  className="text-xs"
                >
                  Copiar
                </Button>
              </div>
            </div>

            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-semibold text-foreground">Ao enviar seu e-mail, inclua:</p>
              <ul className="list-disc list-inside space-y-1 pl-2">
                <li>Descrição detalhada do problema</li>
                <li>Prints de tela (se aplicável)</li>
                <li>Seu nome e e-mail cadastrado no AgendFy</li>
              </ul>
            </div>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              onClick={() => {
                const subject = encodeURIComponent("Suporte AgendFy - " + (user?.name || "Usuário"))
                const body = encodeURIComponent(
                  `Olá,\n\nPreciso de ajuda com o AgendFy.\n\nMeu e-mail cadastrado: ${user?.email || "não informado"}\nMeu nome: ${user?.name || "não informado"}\n\nDescrição do problema:\n[Descreva seu problema aqui]\n\nObrigado!`,
                )
                window.open(`mailto:appagendfy@gmail.com?subject=${subject}&body=${body}`, "_blank")
                setShowFreeModal(false)
              }}
            >
              <Mail className="w-4 h-4 mr-2" />
              Abrir cliente de e-mail
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
