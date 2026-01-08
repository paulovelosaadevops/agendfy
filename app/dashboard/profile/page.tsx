"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PageHeaderEnhanced } from "@/components/dashboard/page-header-enhanced"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { UserCircle, Mail, Phone, Save, Info } from "lucide-react"
import { doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { formatWhatsApp } from "@/lib/utils/whatsapp"
import { userMessages, getFriendlyErrorMessage } from "@/lib/user-messages"
import { ToastMessage } from "@/components/ui/toast-message"

function ProfileContent() {
  const { user } = useAuth()
  const [name, setName] = useState("")
  const [whatsapp, setWhatsapp] = useState("")
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setWhatsapp(user.whatsapp || "")
    }
  }, [user])

  async function handleSave() {
    if (!user?.uid) return

    setSaving(true)
    setMessage(null)

    try {
      const userRef = doc(db, "users", user.uid)
      await updateDoc(userRef, {
        name,
        whatsapp: formatWhatsApp(whatsapp),
      })

      setMessage({ type: "success", text: userMessages.success.profileUpdated })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: getFriendlyErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {message && <ToastMessage type={message.type} message={message.text} className="animate-in slide-in-from-top" />}

      <PageHeaderEnhanced title="Meu Perfil" description="Gerencie suas informações pessoais" icon={UserCircle} />

      <Card className="bg-card-elevated p-6 shadow-lg">
        <div className="flex items-center gap-4 mb-6 pb-6 border-b border-border">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg">
            <UserCircle className="w-10 h-10 text-primary-foreground" />
          </div>
          <div className="space-y-1">
            <h3 className="text-xl font-semibold text-foreground">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            {user?.role && (
              <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                {user.role === "professional" ? "Profissional" : user.role === "client" ? "Cliente" : "CEO"}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm font-medium text-foreground">
              Nome completo
            </Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome completo"
              className="bg-secondary border-border h-11"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-medium text-foreground">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={user?.email || ""}
                disabled
                className="pl-10 bg-muted border-border text-muted-foreground cursor-not-allowed h-11"
              />
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1.5">
              <Info className="w-3 h-3" />O email não pode ser alterado
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="whatsapp" className="text-sm font-medium text-foreground">
              WhatsApp
            </Label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
              <Input
                id="whatsapp"
                type="tel"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="(11) 99999-9999"
                className="pl-10 bg-secondary border-border h-11"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Mantenha atualizado para receber confirmações dos profissionais
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={saving}
            className="w-full bg-primary hover:bg-primary/90 h-12 shadow-lg shadow-primary/20"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar alterações
              </>
            )}
          </Button>
        </div>
      </Card>

      <Card className="glass-effect border-info/20 p-6 shadow-lg">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-info/10 rounded-xl">
            <Info className="w-6 h-6 text-info" />
          </div>
          <div className="flex-1 space-y-2">
            <h4 className="text-lg font-semibold text-foreground">Dica de Segurança</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Mantenha suas informações atualizadas para garantir uma melhor comunicação com os profissionais e receber
              confirmações de agendamentos.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ProfileContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
