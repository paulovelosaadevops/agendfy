"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Building2, Search, Calendar, Briefcase } from "lucide-react"
import { getProfessionalsWithDetails, type UserWithDetails } from "@/lib/firestore/ceo"
import { formatDate } from "@/lib/utils/format"

export default function CEOProfessionalsPage() {
  const { user } = useAuth()
  const [professionals, setProfessionals] = useState<UserWithDetails[]>([])
  const [filtered, setFiltered] = useState<UserWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    loadProfessionals()
  }, [])

  useEffect(() => {
    filterProfessionals()
  }, [searchTerm, professionals])

  async function loadProfessionals() {
    setLoading(true)
    try {
      const data = await getProfessionalsWithDetails()
      setProfessionals(data)
      setFiltered(data)
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error)
    } finally {
      setLoading(false)
    }
  }

  function filterProfessionals() {
    if (!searchTerm) {
      setFiltered(professionals)
      return
    }

    const term = searchTerm.toLowerCase()
    const result = professionals.filter(
      (p) =>
        p.name.toLowerCase().includes(term) ||
        p.businessName?.toLowerCase().includes(term) ||
        p.businessType?.toLowerCase().includes(term),
    )
    setFiltered(result)
  }

  function getTrialStatus(p: UserWithDetails): string {
    if (p.subscriptionStatus === "premium_trial" && p.trial?.active) {
      return "Em Trial"
    }
    if (p.subscriptionStatus === "premium") {
      return "Premium"
    }
    if (p.trial && !p.trial.active) {
      return "Expirado"
    }
    return "Free"
  }

  function getTrialColor(p: UserWithDetails): string {
    if (p.subscriptionStatus === "premium_trial" && p.trial?.active) {
      return "bg-blue-600/10 text-blue-600 dark:text-blue-400"
    }
    if (p.subscriptionStatus === "premium") {
      return "bg-green-500/10 text-green-600 dark:text-green-400"
    }
    return "bg-muted text-muted-foreground"
  }

  if (user?.role !== "ceo") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-destructive">Acesso negado</p>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-foreground">Profissionais</h2>
            <p className="text-muted-foreground mt-1">Visualizar todos os profissionais cadastrados</p>
          </div>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold text-foreground">{professionals.length}</span>
          </div>
        </div>

        <Card className="bg-card border-border p-6">
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, negócio ou tipo de serviço..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Carregando profissionais...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum profissional encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Negócio</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Responsável</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Tipo</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Serviços</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Agendamentos</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.uid} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="text-foreground font-medium">{p.businessName || "Não informado"}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-foreground text-sm">{p.name}</p>
                        <p className="text-muted-foreground text-xs">{p.email}</p>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{p.businessType || "-"}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${getTrialColor(p)}`}>{getTrialStatus(p)}</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Briefcase className="w-4 h-4" />
                          <span className="text-sm">{p.servicesCount || 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">{p.appointmentsCount || 0}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{formatDate(p.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  )
}
