"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { PageHeaderEnhanced } from "@/components/dashboard/page-header-enhanced"
import { EnhancedStatCard } from "@/components/dashboard/enhanced-stat-card"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Calendar, Phone, TrendingUp, UserCircle, AlertCircle } from "lucide-react"
import { getClientsByProfessional } from "@/lib/firestore/clients"
import type { Client } from "@/types/firestore"
import { formatDate } from "@/lib/utils/format"
import { PlanLimitBanner } from "@/components/plan-limit-banner"
import { FREE_PLAN_LIMITS, hasPremiumAccess } from "@/lib/plan-limits"
import { UpgradePromptModal } from "@/components/dashboard/upgrade-prompt-modal"
import { cn } from "@/lib/utils"

function ClientsContent() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [filteredClients, setFilteredClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  const userPlan = user?.subscriptionStatus || "free"
  const hasPremium = hasPremiumAccess(userPlan, user?.trial?.active)
  const isFreePlan = !hasPremium
  const hasExceededLimit = !hasPremium && clients.length > FREE_PLAN_LIMITS.clients
  const displayableClients = hasExceededLimit ? clients.slice(0, FREE_PLAN_LIMITS.clients) : clients

  useEffect(() => {
    if (user?.uid) {
      loadClients()
    }
  }, [user])

  useEffect(() => {
    if (searchTerm) {
      const filtered = displayableClients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) || client.whatsapp.includes(searchTerm),
      )
      setFilteredClients(filtered)
    } else {
      setFilteredClients(displayableClients)
    }
  }, [searchTerm, displayableClients])

  async function loadClients() {
    if (!user?.uid) return
    setLoading(true)
    try {
      const data = await getClientsByProfessional(user.uid)
      setClients(data)
      setFilteredClients(data)
    } catch (error) {
      console.error("Erro ao carregar clientes:", error)
    } finally {
      setLoading(false)
    }
  }

  const totalAppointments = clients.reduce((sum, client) => sum + client.totalAppointments, 0)
  const averageAppointments = clients.length > 0 ? (totalAppointments / clients.length).toFixed(1) : "0"

  useEffect(() => {
    if (isFreePlan && clients.length >= FREE_PLAN_LIMITS.clients) {
      const hasShownModal = sessionStorage.getItem("clientLimitModalShown")
      if (!hasShownModal) {
        setShowUpgradeModal(true)
        sessionStorage.setItem("clientLimitModalShown", "true")
      }
    }
  }, [clients.length, isFreePlan])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando clientes...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <UpgradePromptModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="visualizar todos os clientes"
        description={`Você possui ${clients.length} clientes, mas o plano gratuito permite visualizar apenas ${FREE_PLAN_LIMITS.clients}. Faça upgrade para Premium e tenha acesso completo à sua base de clientes!`}
      />

      <PageHeaderEnhanced
        title="Clientes"
        description="Gerencie sua base de clientes e acompanhe o histórico de atendimentos"
        icon={Users}
        badge={
          clients.length > 0 ? (
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              {clients.length} {clients.length === 1 ? "cliente" : "clientes"}
            </Badge>
          ) : null
        }
      />

      {hasExceededLimit && (
        <Card className="bg-warning/10 border-warning/30 p-4 shadow-lg">
          <div className="flex items-start gap-4">
            <div className="p-2 bg-warning/20 rounded-lg">
              <AlertCircle className="w-6 h-6 text-warning" />
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="font-semibold text-foreground">Limite de clientes excedido</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Você possui {clients.length} clientes, mas o plano gratuito permite visualizar apenas os primeiros{" "}
                {FREE_PLAN_LIMITS.clients}. Todos os dados estão preservados e você pode fazer upgrade a qualquer
                momento para acessá-los.
              </p>
            </div>
          </div>
        </Card>
      )}

      {isFreePlan && (
        <PlanLimitBanner
          currentCount={clients.length}
          maxCount={FREE_PLAN_LIMITS.clients}
          resourceName="cliente"
          resourceNamePlural="clientes"
        />
      )}

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <EnhancedStatCard
          title="Total de Clientes"
          value={clients.length}
          subtitle="Cadastrados"
          icon={Users}
          variant="primary"
        />
        <EnhancedStatCard
          title="Agendamentos"
          value={totalAppointments}
          subtitle="Total realizado"
          icon={Calendar}
          variant="info"
        />
        <EnhancedStatCard
          title="Média"
          value={averageAppointments}
          subtitle="Agendamentos por cliente"
          icon={TrendingUp}
          variant="success"
        />
      </div>

      <Card className="glass-effect p-5 shadow-lg">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nome ou telefone..."
            className="pl-12 bg-secondary border-border h-12 text-base"
          />
        </div>
      </Card>

      {filteredClients.length === 0 ? (
        <Card className="bg-card-elevated p-12 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="p-4 bg-muted rounded-2xl group-hover:bg-primary/20 transition-colors">
              <Users className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                {searchTerm ? "Nenhum cliente encontrado" : "Nenhum cliente cadastrado"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Tente buscar por outro termo"
                  : "Seus clientes aparecerão aqui automaticamente após o primeiro agendamento"}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredClients.map((client, index) => (
            <Card
              key={client.id}
              className={cn(
                "group bg-card-interactive p-6 shadow-md hover:shadow-xl transition-all duration-300",
                index >= FREE_PLAN_LIMITS.clients && !hasPremium && "opacity-50",
              )}
            >
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                  <UserCircle className="w-8 h-8 text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                      {client.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <a
                        href={`https://wa.me/55${client.whatsapp.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-primary hover:text-primary/80 hover:underline transition-colors font-medium"
                      >
                        {client.whatsapp}
                      </a>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                      <Calendar className="w-3.5 h-3.5 mr-1.5" />
                      {client.totalAppointments} {client.totalAppointments === 1 ? "agendamento" : "agendamentos"}
                    </Badge>
                    {client.lastAppointment && (
                      <span className="text-sm text-muted-foreground">
                        Último agendamento:{" "}
                        <span className="text-foreground font-medium">{formatDate(client.lastAppointment)}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

export default function ClientsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <ClientsContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
