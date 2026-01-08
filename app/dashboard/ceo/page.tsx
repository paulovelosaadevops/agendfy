"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { EnhancedStatCard } from "@/components/dashboard/enhanced-stat-card"
import { PageHeaderEnhanced } from "@/components/dashboard/page-header-enhanced"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Building2,
  Calendar,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  DollarSign,
  Activity,
  CreditCard,
} from "lucide-react"
import { getCEOMetrics, type CEOMetrics } from "@/lib/firestore/ceo"
import { formatCurrency } from "@/lib/utils/format"
import Link from "next/link"

interface StripeMetrics {
  mrr: number
  activeSubscriptions: number
  trialingSubscriptions: number
}

export default function CEODashboardPage() {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<CEOMetrics | null>(null)
  const [stripeMetrics, setStripeMetrics] = useState<StripeMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadMetrics()
  }, [])

  async function loadMetrics() {
    setLoading(true)
    try {
      // Carregar métricas do Firestore
      const data = await getCEOMetrics()
      setMetrics(data)

      // Carregar métricas do Stripe
      const stripeRes = await fetch("/api/stripe/subscriptions")
      if (stripeRes.ok) {
        const stripeData = await stripeRes.json()
        setStripeMetrics(stripeData.metrics)
      }
    } catch (error) {
      console.error("Erro ao carregar métricas:", error)
    } finally {
      setLoading(false)
    }
  }

  if (user?.role !== "ceo") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="bg-card-elevated border-destructive/20 p-8 text-center max-w-md shadow-xl">
          <div className="p-4 bg-destructive/10 rounded-2xl inline-block mb-4">
            <Activity className="w-8 h-8 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">Acesso Negado</h3>
          <p className="text-sm text-muted-foreground">Apenas CEOs podem acessar esta área.</p>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto"></div>
            <p className="text-sm text-muted-foreground">Carregando métricas...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const conversionRate =
    metrics && metrics.totalProfessionals > 0
      ? ((metrics.totalProfessionals - metrics.professionalsInTrial - metrics.professionalsExpired) /
          metrics.totalProfessionals) *
        100
      : 0

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <PageHeaderEnhanced
          title="Dashboard Executivo"
          description="Visão estratégica completa do AgendFy SaaS"
          icon={TrendingUp}
          badge={
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
              <Activity className="w-3.5 h-3.5 mr-1.5" />
              CEO Access
            </Badge>
          }
        />

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Receita do SaaS (Assinaturas)
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <EnhancedStatCard
              title="MRR"
              value={formatCurrency(stripeMetrics?.mrr || 0)}
              subtitle="Receita Mensal Recorrente"
              icon={DollarSign}
              variant="success"
            />
            <EnhancedStatCard
              title="Assinantes Ativos"
              value={stripeMetrics?.activeSubscriptions || 0}
              subtitle="Pagando mensalmente"
              icon={CreditCard}
              variant="primary"
            />
            <EnhancedStatCard
              title="Em Trial"
              value={stripeMetrics?.trialingSubscriptions || 0}
              subtitle="Testando o produto"
              icon={Sparkles}
              variant="info"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Métricas da Plataforma
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <EnhancedStatCard
              title="Total de Usuários"
              value={metrics?.totalUsers || 0}
              subtitle="Cadastrados"
              icon={Users}
              variant="default"
            />
            <EnhancedStatCard
              title="Clientes"
              value={metrics?.totalClients || 0}
              subtitle="Usuários finais"
              icon={Users}
              variant="success"
            />
            <EnhancedStatCard
              title="Profissionais"
              value={metrics?.totalProfessionals || 0}
              subtitle="Usando a plataforma"
              icon={Building2}
              variant="primary"
            />
            <EnhancedStatCard
              title="Agendamentos"
              value={metrics?.totalAppointments || 0}
              subtitle="Total criados"
              icon={Calendar}
              variant="info"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">
            Trial & Conversão
          </h3>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <EnhancedStatCard
              title="Em Trial (Firestore)"
              value={metrics?.professionalsInTrial || 0}
              subtitle="Profissionais ativos"
              icon={Sparkles}
              variant="primary"
            />
            <EnhancedStatCard
              title="Trial Expirado"
              value={metrics?.professionalsExpired || 0}
              subtitle="Sem conversão"
              icon={Clock}
              variant="warning"
            />
            <EnhancedStatCard
              title="Taxa de Conversão"
              value={`${conversionRate.toFixed(1)}%`}
              subtitle="Trial para pago"
              icon={TrendingUp}
              variant="success"
            />
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="bg-card-elevated shadow-lg">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-semibold text-foreground">Financeiro do SaaS</h3>
                  <p className="text-sm text-muted-foreground">Receita de assinaturas</p>
                </div>
                <Link href="/dashboard/ceo/financial">
                  <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80 hover:bg-primary/10">
                    Ver detalhes
                    <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">MRR (Receita Mensal Recorrente)</p>
                <p className="text-4xl font-bold text-gradient">{formatCurrency(stripeMetrics?.mrr || 0)}</p>
              </div>
              <div className="pt-4 border-t border-border grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">ARR Projetado</p>
                  <p className="text-xl font-semibold text-foreground">
                    {formatCurrency((stripeMetrics?.mrr || 0) * 12)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Assinantes</p>
                  <p className="text-xl font-semibold text-foreground">{stripeMetrics?.activeSubscriptions || 0}</p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="bg-card-elevated shadow-lg">
            <div className="p-6 border-b border-border">
              <div className="space-y-1">
                <h3 className="text-xl font-semibold text-foreground">Acesso Rápido</h3>
                <p className="text-sm text-muted-foreground">Navegação rápida para áreas principais</p>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {[
                  { href: "/dashboard/ceo/financial", icon: DollarSign, label: "Financeiro (Assinaturas)" },
                  { href: "/dashboard/ceo/users", icon: Users, label: "Gerenciar Usuários" },
                  { href: "/dashboard/ceo/professionals", icon: Building2, label: "Ver Profissionais" },
                  { href: "/dashboard/ceo/subscriptions", icon: Sparkles, label: "Assinaturas" },
                  { href: "/dashboard/ceo/reports", icon: TrendingUp, label: "Relatórios" },
                ].map(({ href, icon: Icon, label }) => (
                  <Link key={href} href={href}>
                    <Button
                      variant="outline"
                      className="w-full justify-start border-border hover:bg-secondary h-12 bg-transparent group"
                    >
                      <Icon className="w-5 h-5 mr-3 text-muted-foreground group-hover:text-primary transition-colors" />
                      {label}
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
