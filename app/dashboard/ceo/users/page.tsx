"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Users, Search } from "lucide-react"
import { getAllUsers, type UserWithDetails } from "@/lib/firestore/ceo"
import { formatDate } from "@/lib/utils/format"

export default function CEOUsersPage() {
  const { user } = useAuth()
  const [users, setUsers] = useState<UserWithDetails[]>([])
  const [filteredUsers, setFilteredUsers] = useState<UserWithDetails[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [roleFilter, setRoleFilter] = useState<string>("all")

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [searchTerm, roleFilter, users])

  async function loadUsers() {
    setLoading(true)
    try {
      const data = await getAllUsers()
      setUsers(data)
      setFilteredUsers(data)
    } catch (error) {
      console.error("Erro ao carregar usuários:", error)
    } finally {
      setLoading(false)
    }
  }

  function filterUsers() {
    let filtered = users

    if (roleFilter !== "all") {
      filtered = filtered.filter((u) => u.role === roleFilter)
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter((u) => u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term))
    }

    setFilteredUsers(filtered)
  }

  function getRoleLabel(role: string): string {
    const labels: Record<string, string> = {
      client: "Cliente",
      professional: "Profissional",
      ceo: "CEO",
    }
    return labels[role] || role
  }

  function getStatusLabel(u: UserWithDetails): string {
    if (u.role === "professional") {
      if (u.subscriptionStatus === "premium_trial" && u.trial?.active) {
        return "Trial Ativo"
      }
      if (u.subscriptionStatus === "premium") {
        return "Premium"
      }
      return "Free"
    }
    return "Ativo"
  }

  function getStatusColor(u: UserWithDetails): string {
    if (u.role === "professional") {
      if (u.subscriptionStatus === "premium_trial" && u.trial?.active) {
        return "bg-blue-600/10 text-blue-600 dark:text-blue-400"
      }
      if (u.subscriptionStatus === "premium") {
        return "bg-green-500/10 text-green-600 dark:text-green-400"
      }
      return "bg-muted text-muted-foreground"
    }
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400"
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
            <h2 className="text-3xl font-bold text-foreground">Usuários</h2>
            <p className="text-muted-foreground mt-1">Gerenciar todos os usuários da plataforma</p>
          </div>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            <span className="text-2xl font-bold text-foreground">{users.length}</span>
          </div>
        </div>

        <Card className="bg-card border-border p-6">
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-secondary border-border"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2 bg-secondary border border-border rounded-lg text-foreground"
            >
              <option value="all">Todos os perfis</option>
              <option value="client">Clientes</option>
              <option value="professional">Profissionais</option>
              <option value="ceo">CEOs</option>
            </select>
          </div>

          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-muted-foreground">Carregando usuários...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center py-8">
              <Users className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
              <p className="text-muted-foreground">Nenhum usuário encontrado</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Nome</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Email</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Perfil</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-muted-foreground">Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u.uid} className="border-b border-border hover:bg-muted/50">
                      <td className="py-3 px-4 text-foreground">{u.name}</td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{u.email}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-1 rounded text-xs bg-blue-500/10 text-blue-600 dark:text-blue-400">
                          {getRoleLabel(u.role)}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded text-xs ${getStatusColor(u)}`}>{getStatusLabel(u)}</span>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground text-sm">{formatDate(u.createdAt)}</td>
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
