"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Phone, MapPin, SearchIcon } from "lucide-react"
import { getAppointmentsByClient, updateAppointmentStatus } from "@/lib/firestore/appointments"
import { getBusinessByProfessional } from "@/lib/firestore/business"
import type { Appointment } from "@/types/firestore"
import { formatDate } from "@/lib/utils/format"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { PageHeaderEnhanced } from "@/components/dashboard/page-header-enhanced"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"

function MyAppointmentsContent() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [businessAddresses, setBusinessAddresses] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user?.uid) {
      loadAppointments()
    }
  }, [user])

  async function loadAppointments() {
    if (!user?.uid) return
    setLoading(true)
    try {
      const data = await getAppointmentsByClient(user.uid)
      setAppointments(data)

      const addresses: Record<string, string> = {}
      for (const apt of data) {
        if (apt.professionalId && !addresses[apt.professionalId]) {
          try {
            const business = await getBusinessByProfessional(apt.professionalId)
            if (business?.address) {
              addresses[apt.professionalId] = business.address
            }
          } catch (error) {
            console.error("Erro ao carregar endereço:", error)
          }
        }
      }
      setBusinessAddresses(addresses)
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error)
      setAppointments([])
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-500/10 text-green-400 border-green-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "completed":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      default:
        return "bg-gray-500/10 text-gray-400 border-gray-500/20"
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmado"
      case "pending":
        return "Pendente"
      case "cancelled":
        return "Cancelado"
      case "completed":
        return "Concluído"
      default:
        return status
    }
  }

  const canModifyAppointment = (appointment: Appointment): boolean => {
    if (appointment.status === "cancelled" || appointment.status === "completed") {
      return false
    }
    const appointmentDateTime = new Date(appointment.date)
    const [hours, minutes] = appointment.startTime.split(":").map(Number)
    appointmentDateTime.setHours(hours, minutes, 0, 0)

    const now = new Date()
    const hoursDiff = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60)

    return hoursDiff >= 24
  }

  const generateWhatsAppMessage = (appointment: Appointment): string => {
    const dateStr = formatDate(appointment.date)
    return `Olá! Tenho um agendamento confirmado no AgendFy:
📋 Serviço: ${appointment.serviceName}
📅 Data: ${dateStr}
⏰ Horário: ${appointment.startTime}
💰 Valor: R$ ${appointment.price.toFixed(2)}

Qualquer dúvida, fico à disposição!`
  }

  const filteredAppointments = appointments
    .filter((apt) => {
      if (filter === "upcoming") {
        return (apt.status === "confirmed" || apt.status === "pending") && new Date(apt.date) >= new Date()
      }
      if (filter === "past") {
        return apt.status === "completed" || new Date(apt.date) < new Date()
      }
      return true
    })
    .filter((apt) => {
      if (!searchTerm) return true
      const search = searchTerm.toLowerCase()
      return apt.serviceName?.toLowerCase().includes(search) || apt.professionalName?.toLowerCase().includes(search)
    })

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) return

    setIsProcessing(true)
    try {
      await updateAppointmentStatus(selectedAppointment.id, "cancelled")

      if (selectedAppointment.professionalWhatsapp) {
        const message = `Olá! Preciso cancelar meu agendamento de ${selectedAppointment.serviceName} no dia ${formatDate(selectedAppointment.date)} às ${selectedAppointment.startTime}. Podemos remarcar?`
        window.open(
          `https://wa.me/55${selectedAppointment.professionalWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
          "_blank",
        )
      }

      await loadAppointments()
      setCancelDialogOpen(false)
      setSelectedAppointment(null)
    } catch (error) {
      console.error("Erro ao cancelar agendamento:", error)
      alert("Erro ao cancelar agendamento. Tente novamente.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRescheduleAppointment = () => {
    if (!selectedAppointment?.professionalWhatsapp) return

    const message = `Olá! Gostaria de reagendar meu agendamento de ${selectedAppointment.serviceName} que está marcado para ${formatDate(selectedAppointment.date)} às ${selectedAppointment.startTime}. Quais horários você tem disponíveis?`
    window.open(
      `https://wa.me/55${selectedAppointment.professionalWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
      "_blank",
    )
    setRescheduleDialogOpen(false)
    setSelectedAppointment(null)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando seus agendamentos...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <PageHeaderEnhanced
        title="Meus Agendamentos"
        description="Visualize e gerencie todos os seus agendamentos"
        icon={Calendar}
      />

      <div className="flex flex-col sm:flex-row gap-4">
        <Card className="flex-1 glass-effect p-4 shadow-lg">
          <div className="relative">
            <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Buscar por serviço ou profissional..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 bg-secondary border-border h-12 text-base"
            />
          </div>
        </Card>
        <div className="flex gap-2">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            onClick={() => setFilter("all")}
            className={
              filter === "all" ? "bg-primary hover:bg-primary/90" : "border-border bg-transparent hover:bg-secondary"
            }
          >
            Todos
          </Button>
          <Button
            variant={filter === "upcoming" ? "default" : "outline"}
            onClick={() => setFilter("upcoming")}
            className={
              filter === "upcoming"
                ? "bg-primary hover:bg-primary/90"
                : "border-border bg-transparent hover:bg-secondary"
            }
          >
            Próximos
          </Button>
          <Button
            variant={filter === "past" ? "default" : "outline"}
            onClick={() => setFilter("past")}
            className={
              filter === "past" ? "bg-primary hover:bg-primary/90" : "border-border bg-transparent hover:bg-secondary"
            }
          >
            Anteriores
          </Button>
        </div>
      </div>

      {filteredAppointments.length > 0 ? (
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => {
            const canModify = canModifyAppointment(appointment)

            return (
              <Card
                key={appointment.id}
                className="bg-card-interactive p-6 shadow-md hover:shadow-xl transition-all duration-300"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-foreground mb-1">{appointment.serviceName}</h3>
                        <p className="text-muted-foreground">{appointment.professionalName || "Profissional"}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs border font-medium ${getStatusColor(appointment.status)}`}
                      >
                        {getStatusLabel(appointment.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="w-4 h-4 text-primary" />
                        <span>{formatDate(appointment.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="w-4 h-4 text-primary" />
                        <span>
                          {appointment.startTime} - {appointment.endTime}
                        </span>
                      </div>
                      {appointment.professionalWhatsapp && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Phone className="w-4 h-4 text-primary" />
                          <span>{appointment.professionalWhatsapp}</span>
                        </div>
                      )}
                      {businessAddresses[appointment.professionalId] && (
                        <div className="flex items-center gap-2 text-muted-foreground sm:col-span-2">
                          <MapPin className="w-4 h-4 text-primary" />
                          <span className="truncate">{businessAddresses[appointment.professionalId]}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 border-t pt-4">
                    {!canModify && appointment.status !== "cancelled" && appointment.status !== "completed" && (
                      <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-2">
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          ⚠️ Cancelamento ou reagendamento disponível apenas com 24h de antecedência
                        </p>
                      </div>
                    )}

                    <div className="flex gap-2 flex-wrap">
                      {appointment.professionalWhatsapp && appointment.status === "confirmed" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-500/50 hover:bg-green-500/10 bg-transparent text-green-600 dark:text-green-400"
                          onClick={() => {
                            const message = generateWhatsAppMessage(appointment)
                            window.open(
                              `https://wa.me/55${appointment.professionalWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
                              "_blank",
                            )
                          }}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Enviar detalhes via WhatsApp
                        </Button>
                      )}

                      {appointment.professionalWhatsapp && appointment.status === "pending" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-border hover:bg-secondary bg-transparent"
                          onClick={() => {
                            const message = `Olá! Gostaria de confirmar meu agendamento de ${appointment.serviceName} no dia ${formatDate(appointment.date)} às ${appointment.startTime}.`
                            window.open(
                              `https://wa.me/55${appointment.professionalWhatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
                              "_blank",
                            )
                          }}
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Contatar profissional
                        </Button>
                      )}

                      {(appointment.status === "pending" || appointment.status === "confirmed") && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canModify}
                          className={`${
                            canModify
                              ? "border-red-500/50 hover:bg-red-500/10 text-red-600 dark:text-red-400"
                              : "opacity-50 cursor-not-allowed"
                          }`}
                          onClick={() => {
                            if (canModify) {
                              setSelectedAppointment(appointment)
                              setCancelDialogOpen(true)
                            }
                          }}
                        >
                          Cancelar
                        </Button>
                      )}

                      {(appointment.status === "pending" || appointment.status === "confirmed") && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={!canModify}
                          className={`${
                            canModify ? "border-border hover:bg-secondary" : "opacity-50 cursor-not-allowed"
                          }`}
                          onClick={() => {
                            if (canModify) {
                              setSelectedAppointment(appointment)
                              setRescheduleDialogOpen(true)
                            }
                          }}
                        >
                          Reagendar
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card className="bg-card-elevated p-12 text-center">
          <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
            <div className="p-4 bg-muted rounded-2xl">
              <Calendar className="w-12 h-12 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-semibold text-foreground">
                {searchTerm ? "Nenhum resultado encontrado" : "Nenhum agendamento"}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm
                  ? "Tente buscar com outros termos"
                  : "Você ainda não possui agendamentos. Encontre profissionais e agende!"}
              </p>
            </div>
            {!searchTerm && (
              <Link href="/dashboard/search">
                <Button className="bg-primary hover:bg-primary/90 mt-2">
                  <SearchIcon className="w-4 h-4 mr-2" />
                  Encontrar profissionais
                </Button>
              </Link>
            )}
          </div>
        </Card>
      )}

      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja cancelar este agendamento? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-3 py-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Serviço</Label>
                <p className="text-base">{selectedAppointment.serviceName}</p>
              </div>
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Data e Horário</Label>
                <p className="text-base">
                  {formatDate(selectedAppointment.date)} às {selectedAppointment.startTime}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={isProcessing}>
              Voltar
            </Button>
            <Button
              variant="destructive"
              onClick={handleCancelAppointment}
              disabled={isProcessing}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? "Cancelando..." : "Sim, cancelar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={rescheduleDialogOpen} onOpenChange={setRescheduleDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground">
          <DialogHeader>
            <DialogTitle>Reagendar Agendamento</DialogTitle>
            <DialogDescription>
              Entre em contato com o profissional via WhatsApp para escolher uma nova data e horário.
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-3 py-4">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Agendamento atual</Label>
                <p className="text-base">
                  {selectedAppointment.serviceName} - {formatDate(selectedAppointment.date)} às{" "}
                  {selectedAppointment.startTime}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setRescheduleDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleRescheduleAppointment} className="bg-green-600 hover:bg-green-700">
              <Phone className="w-4 h-4 mr-2" />
              Abrir WhatsApp
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function MyAppointmentsPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <MyAppointmentsContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
