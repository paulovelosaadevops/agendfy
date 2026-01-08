"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Plus, Edit2, Trash2, DollarSign, Clock, Package, Sparkles, Lock } from "lucide-react"
import { createService, updateService, deleteService, getServicesByProfessional } from "@/lib/firestore/services"
import type { Service, ServiceInput } from "@/types/firestore"
import { formatCurrency } from "@/lib/utils/format"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { PageHeaderEnhanced } from "@/components/dashboard/page-header-enhanced"
import { EnhancedStatCard } from "@/components/dashboard/enhanced-stat-card"
import { PlanLimitBanner } from "@/components/plan-limit-banner"
import { FREE_PLAN_LIMITS, hasPremiumAccess } from "@/lib/plan-limits"
import { cn } from "@/lib/utils"
import { userMessages, getFriendlyErrorMessage } from "@/lib/user-messages"
import { ToastMessage } from "@/components/ui/toast-message"
import { UpgradePromptModal } from "@/components/dashboard/upgrade-prompt-modal"

function ServicesContent() {
  const { user } = useAuth()
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [formData, setFormData] = useState<ServiceInput>({
    name: "",
    description: "",
    duration: 60,
    price: 0,
    status: "active",
  })
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const userPlan = user?.subscriptionStatus || "free"
  const hasPremium = hasPremiumAccess(userPlan, user?.trial?.active)
  const isFreePlan = !hasPremium
  const activeServicesCount = services.filter((s) => s.status === "active").length
  const canAddService = hasPremium || activeServicesCount < FREE_PLAN_LIMITS.services

  useEffect(() => {
    if (user?.uid) {
      loadServices()
    }
  }, [user])

  async function loadServices() {
    if (!user?.uid) return
    setLoading(true)
    try {
      const data = await getServicesByProfessional(user.uid)
      setServices(data)
    } catch (error) {
      console.error("Erro ao carregar serviços:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.uid) return

    if (!editingService && !canAddService) {
      setShowUpgradeModal(true)
      return
    }

    try {
      if (editingService) {
        await updateService(editingService.id, formData)
        setToastMessage({ type: "success", text: userMessages.success.serviceUpdated })
      } else {
        await createService(user.uid, formData)
        setToastMessage({ type: "success", text: userMessages.success.serviceCreated })
      }

      await loadServices()
      handleCloseDialog()
      setTimeout(() => setToastMessage(null), 3000)
    } catch (error) {
      setToastMessage({ type: "error", text: getFriendlyErrorMessage(error) })
    }
  }

  async function handleDelete(serviceId: string) {
    if (!confirm(userMessages.confirm.deleteService)) return

    try {
      await deleteService(serviceId)
      await loadServices()
      setToastMessage({ type: "success", text: userMessages.success.serviceDeleted })
      setTimeout(() => setToastMessage(null), 3000)
    } catch (error) {
      setToastMessage({ type: "error", text: getFriendlyErrorMessage(error) })
    }
  }

  async function handleToggleStatus(service: Service) {
    try {
      const newStatus = service.status === "active" ? "inactive" : "active"
      await updateService(service.id, { status: newStatus })
      await loadServices()
      setToastMessage({ type: "success", text: "Status atualizado com sucesso!" })
      setTimeout(() => setToastMessage(null), 2000)
    } catch (error) {
      setToastMessage({ type: "error", text: getFriendlyErrorMessage(error) })
    }
  }

  function handleEdit(service: Service) {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      duration: service.duration,
      price: service.price,
      status: service.status,
    })
    setDialogOpen(true)
  }

  function handleCloseDialog() {
    setDialogOpen(false)
    setEditingService(null)
    setFormData({
      name: "",
      description: "",
      duration: 60,
      price: 0,
      status: "active",
    })
  }

  function handleNewService() {
    if (!canAddService) {
      setShowUpgradeModal(true)
      return
    }
    setEditingService(null)
    setDialogOpen(true)
  }

  const activeServices = services.filter((s) => s.status === "active")
  const averagePrice =
    activeServices.length > 0 ? activeServices.reduce((sum, s) => sum + s.price, 0) / activeServices.length : 0

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando serviços...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {toastMessage && (
        <ToastMessage type={toastMessage.type} message={toastMessage.text} className="animate-in slide-in-from-top" />
      )}

      <UpgradePromptModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="adicionar mais serviços"
        description={`Você atingiu o limite de ${FREE_PLAN_LIMITS.services} serviços ativos do plano gratuito. Faça upgrade para Premium e cadastre serviços ilimitados!`}
      />

      <PageHeaderEnhanced
        title="Serviços"
        description="Gerencie o portfólio de serviços e preços do seu negócio"
        icon={Package}
        badge={
          activeServices.length > 0 ? (
            <Badge variant="secondary" className="status-success">
              {activeServices.length} {activeServices.length === 1 ? "ativo" : "ativos"}
            </Badge>
          ) : null
        }
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className={cn(
                  "shadow-lg",
                  canAddService
                    ? "bg-primary hover:bg-primary/90 shadow-primary/20"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
                onClick={handleNewService}
                disabled={!canAddService}
              >
                {canAddService ? (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Serviço
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Limite Atingido
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl">{editingService ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {editingService ? "Atualize as informações do serviço" : "Adicione um novo serviço ao seu negócio"}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    Nome do serviço
                  </Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Corte de cabelo"
                    required
                    className="bg-secondary border-border h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description" className="text-sm font-medium">
                    Descrição
                  </Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o serviço"
                    rows={3}
                    required
                    className="bg-secondary border-border resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="duration" className="text-sm font-medium">
                      Duração (min)
                    </Label>
                    <Input
                      id="duration"
                      type="number"
                      min="15"
                      step="15"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                      required
                      className="bg-secondary border-border h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-sm font-medium">
                      Preço (R$)
                    </Label>
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                      required
                      className="bg-secondary border-border h-11"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 px-4 bg-secondary rounded-xl border border-border">
                  <Label htmlFor="status" className="cursor-pointer font-medium">
                    Serviço ativo
                  </Label>
                  <Switch
                    id="status"
                    checked={formData.status === "active"}
                    onCheckedChange={(checked) => setFormData({ ...formData, status: checked ? "active" : "inactive" })}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCloseDialog}
                    className="flex-1 border-border hover:bg-secondary bg-transparent"
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                    {editingService ? "Atualizar" : "Criar Serviço"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {isFreePlan && (
        <PlanLimitBanner
          currentCount={activeServicesCount}
          maxCount={FREE_PLAN_LIMITS.services}
          resourceName="serviço ativo"
          resourceNamePlural="serviços ativos"
        />
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <EnhancedStatCard title="Total de Serviços" value={services.length} subtitle="Cadastrados" icon={Package} />
        <EnhancedStatCard
          title="Serviços Ativos"
          value={activeServices.length}
          subtitle="Disponíveis"
          icon={Sparkles}
          variant="success"
        />
        <EnhancedStatCard
          title="Ticket Médio"
          value={formatCurrency(averagePrice)}
          subtitle="Preço médio"
          icon={DollarSign}
          variant="primary"
        />
      </div>

      {services.length === 0 ? (
        <Card className="bg-card-elevated p-12 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="p-4 bg-muted rounded-2xl">
              <Package className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                Nenhum serviço cadastrado
              </h3>
              <p className="text-muted-foreground">{userMessages.info.noServices}</p>
            </div>
            <Button onClick={() => setDialogOpen(true)} className="bg-primary hover:bg-primary/90 mt-2">
              <Plus className="w-4 h-4 mr-2" />
              Criar primeiro serviço
            </Button>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <Card
              key={service.id}
              className={cn(
                "group bg-card-interactive p-6 shadow-md hover:shadow-xl transition-all duration-300",
                service.status === "inactive" && "opacity-60",
              )}
            >
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0 space-y-2">
                    <h3 className="text-lg font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                      {service.name}
                    </h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{service.description}</p>
                  </div>
                  <Switch checked={service.status === "active"} onCheckedChange={() => handleToggleStatus(service)} />
                </div>

                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-secondary text-foreground border-border">
                    <Clock className="w-3.5 h-3.5 mr-1.5" />
                    {service.duration} min
                  </Badge>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    <DollarSign className="w-3.5 h-3.5 mr-1" />
                    {formatCurrency(service.price)}
                  </Badge>
                </div>

                <div className="flex gap-2 pt-2 border-t border-border">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(service)}
                    className="flex-1 border-border hover:bg-secondary hover:border-border/60"
                  >
                    <Edit2 className="w-4 h-4 mr-1.5" />
                    Editar
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDelete(service.id)}
                    className="flex-1 border-destructive/30 text-destructive hover:bg-destructive/10 hover:border-destructive/50"
                  >
                    <Trash2 className="w-4 h-4 mr-1.5" />
                    Excluir
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ServicesPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ServicesContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
