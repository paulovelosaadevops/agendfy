"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Link2, Copy, Check, ExternalLink, Share2 } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"

export function PublicBookingLink() {
  const { user } = useAuth()
  const [copied, setCopied] = useState(false)

  if (!user?.uid) return null

  const bookingUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/book/${user.uid}`

  async function copyToClipboard() {
    try {
      await navigator.clipboard.writeText(bookingUrl)
      setCopied(true)
      toast.success("Link copiado para a área de transferência!")
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error("Erro ao copiar link")
    }
  }

  async function shareLink() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Agende comigo - ${user.businessName || user.name}`,
          text: "Clique no link para agendar um horário comigo!",
          url: bookingUrl,
        })
      } catch (error) {
        // User cancelled share or error occurred
      }
    } else {
      copyToClipboard()
    }
  }

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20 shadow-lg">
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-primary/20 rounded-xl">
            <Link2 className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="text-lg font-semibold text-foreground">Seu Link de Agendamento</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Compartilhe este link com seus clientes para que eles possam agendar diretamente com você
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex gap-2">
            <Input
              value={bookingUrl}
              readOnly
              className="bg-background/80 border-border font-mono text-sm"
              onClick={(e) => e.currentTarget.select()}
            />
            <Button
              onClick={copyToClipboard}
              size="icon"
              variant="outline"
              className="shrink-0 border-border hover:bg-primary/10 bg-transparent"
            >
              {copied ? <Check className="w-4 h-4 text-primary" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={shareLink}
              variant="outline"
              className="flex-1 border-primary/30 hover:bg-primary/10 hover:border-primary/50 bg-transparent"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Compartilhar
            </Button>
            <Button
              onClick={() => window.open(bookingUrl, "_blank")}
              variant="outline"
              className="flex-1 border-primary/30 hover:bg-primary/10 hover:border-primary/50"
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Visualizar
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
}
