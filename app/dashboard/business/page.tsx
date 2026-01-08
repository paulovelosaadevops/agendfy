"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { PageHeaderEnhanced } from "@/components/dashboard/page-header-enhanced"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { Save, Store, Info, MapPin, Phone, Building2 } from "lucide-react"
import { getBusinessByProfessional, updateBusiness, createBusiness } from "@/lib/firestore/business"
import type { Business, BusinessHours } from "@/types/firestore"
import { cn } from "@/lib/utils"
import { userMessages, getFriendlyErrorMessage } from "@/lib/user-messages"
import { ToastMessage } from "@/components/ui/toast-message"

const daysLabels: Record<string, string> = {
  monday: "Segunda-feira",
  tuesday: "Terça-feira",
  wednesday: "Quarta-feira",
  thursday: "Quinta-feira",
  friday: "Sexta-feira",
  saturday: "Sábado",
  sunday: "Domingo",
}

function BusinessContent() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [business, setBusiness] = useState<Business | null>(null)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [formData, setFormData] = useState({
    businessName: "",
    businessType: "",
    whatsapp: "",
    address: "",
    businessHours: [] as BusinessHours[],
  })

  useEffect(() => {
    if (user?.uid) {
      loadBusiness()
    }
  }, [user])

  async function loadBusiness() {
    if (!user?.uid) return
    setLoading(true)

    const defaultHours: BusinessHours[] = [
      { day: "monday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      { day: "tuesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      { day: "wednesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      { day: "thursday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      { day: "friday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
      { day: "saturday", isOpen: false, openTime: "09:00", closeTime: "18:00" },
      { day: "sunday", isOpen: false, openTime: "09:00", closeTime: "18:00" },
    ]

    try {
      const data = await getBusinessByProfessional(user.uid)

      if (data) {
        setBusiness(data)
        setFormData({
          businessName: data.businessName,
          businessType: data.businessType,
          whatsapp: data.whatsapp,
          address: data.address || "",
          businessHours: data.businessHours,
        })
      } else {
        setFormData({
          businessName: user.businessName || "",
          businessType: user.businessType || "",
          whatsapp: user.whatsapp || "",
          address: "",
          businessHours: defaultHours,
        })
      }
    } catch (error) {
      console.error("Erro ao carregar negócio:", error)
      setFormData({
        businessName: user.businessName || "",
        businessType: user.businessType || "",
        whatsapp: user.whatsapp || "",
        address: "",
        businessHours: defaultHours,
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.uid) return

    setSaving(true)
    setMessage(null)
    try {
      if (business) {
        await updateBusiness(user.uid, formData)
      } else {
        await createBusiness(user.uid, formData)
      }
      await loadBusiness()
      setMessage({ type: "success", text: userMessages.success.businessUpdated })
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      setMessage({ type: "error", text: getFriendlyErrorMessage(error) })
    } finally {
      setSaving(false)
    }
  }

  function updateBusinessHour(index: number, field: keyof BusinessHours, value: string | boolean) {
    const updatedHours = [...formData.businessHours]
    updatedHours[index] = { ...updatedHours[index], [field]: value }
    setFormData({ ...formData, businessHours: updatedHours })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {message && <ToastMessage type={message.type} message={message.text} className="animate-in slide-in-from-top" />}

      <PageHeaderEnhanced
        title="Meu Negócio"
        description="Configure as informações e horários de funcionamento"
        icon={Store}
        badge={
          business ? (
            <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
              Configurado
            </Badge>
          ) : (
            <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
              Incompleto
            </Badge>
          )
        }
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="glass-effect border-border shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Building2 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-xl font-semibold text-foreground">Informações do Negócio</h2>
            </div>
          </div>

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-sm font-medium flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" />
                  Nome do negócio
                </Label>
                <Input
                  id="businessName"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Ex: Studio Beauty"
                  required
                  className="bg-secondary border-border h-11 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessType" className="text-sm font-medium flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Tipo de serviço
                </Label>
                <Input
                  id="businessType"
                  value={formData.businessType}
                  onChange={(e) => setFormData({ ...formData, businessType: e.target.value })}
                  placeholder="Ex: Salão de beleza"
                  required
                  className="bg-secondary border-border h-11 focus:border-primary transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-2">
                <Label htmlFor="whatsapp" className="text-sm font-medium flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary" />
                  WhatsApp
                </Label>
                <Input
                  id="whatsapp"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                  placeholder="11999999999"
                  required
                  className="bg-secondary border-border h-11 focus:border-primary transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address" className="text-sm font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  Endereço
                  <span className="text-xs text-muted-foreground font-normal">(opcional)</span>
                </Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Rua Example, 123"
                  className="bg-secondary border-border h-11 focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass-effect border-border shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 border-b border-border">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Store className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">Horário de Funcionamento</h2>
                <p className="text-sm text-muted-foreground mt-1">Configure quando seu negócio está aberto</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {formData.businessHours.map((hours, index) => (
                <Card
                  key={hours.day}
                  className={cn(
                    "p-4 transition-all duration-200 border",
                    hours.isOpen ? "bg-secondary border-border hover:border-primary/30" : "bg-muted/30 border-muted",
                  )}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    {/* Day name and toggle */}
                    <div className="flex items-center justify-between sm:w-48">
                      <Label className="text-sm font-semibold text-foreground cursor-pointer">
                        {daysLabels[hours.day]}
                      </Label>
                      <Switch
                        checked={hours.isOpen}
                        onCheckedChange={(checked) => updateBusinessHour(index, "isOpen", checked)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>

                    {/* Time inputs */}
                    {hours.isOpen ? (
                      <div className="flex items-center gap-3 flex-1">
                        <div className="flex-1">
                          <Input
                            type="time"
                            value={hours.openTime}
                            onChange={(e) => updateBusinessHour(index, "openTime", e.target.value)}
                            className="bg-background border-border h-10 text-center font-medium"
                          />
                        </div>
                        <span className="text-muted-foreground text-sm font-medium px-2">até</span>
                        <div className="flex-1">
                          <Input
                            type="time"
                            value={hours.closeTime}
                            onChange={(e) => updateBusinessHour(index, "closeTime", e.target.value)}
                            className="bg-background border-border h-10 text-center font-medium"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-center sm:justify-start">
                        <Badge variant="secondary" className="bg-muted text-muted-foreground border-0">
                          Fechado
                        </Badge>
                      </div>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving}
            className="bg-primary hover:bg-primary/90 min-w-[200px] h-12 shadow-lg shadow-primary/20 font-semibold"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent mr-2"></div>
                Salvando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </form>

      <Card className="glass-effect border-info/20 shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-info/10 via-info/5 to-transparent p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-info/10 rounded-xl shrink-0">
              <Info className="w-5 h-5 text-info" />
            </div>
            <div className="flex-1 space-y-2">
              <h4 className="text-lg font-semibold text-foreground">Dica Importante</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Configure seu horário de funcionamento para que seus clientes saibam quando você está disponível. Essas
                informações serão visíveis no seu perfil público e ajudam a melhorar a experiência de agendamento.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default function BusinessPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <BusinessContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
