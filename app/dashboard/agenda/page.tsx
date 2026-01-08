"use client"

import React from "react"

import type { ReactElement } from "react"
import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  CalendarIcon,
  Plus,
  Check,
  X,
  Clock,
  ChevronLeft,
  ChevronRight,
  Phone,
  Sparkles,
  CalendarDays,
  CalendarRange,
  Crown,
  Lock,
} from "lucide-react"
import {
  createAppointment,
  updateAppointmentStatus,
  getAppointmentsByDate,
  getAppointmentsByDateRange,
  getMonthlyAppointmentsCount,
} from "@/lib/firestore/appointments"
import { getBusinessByProfessional } from "@/lib/firestore/business"
import { getServicesByProfessional } from "@/lib/firestore/services"
import type { Appointment, AppointmentInput, Service } from "@/types/firestore"
import { formatCurrency, formatDate } from "@/lib/utils/format"
import { Textarea } from "@/components/ui/textarea"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ProtectedRoute } from "@/components/protected-route"
import { PageHeaderEnhanced } from "@/components/dashboard/page-header-enhanced"
import { PlanLimitBanner } from "@/components/plan-limit-banner"
import { FREE_PLAN_LIMITS, hasPremiumAccess } from "@/lib/plan-limits"
import { cn } from "@/lib/utils"
import { userMessages, getFriendlyErrorMessage } from "@/lib/user-messages"
import { ToastMessage } from "@/components/ui/toast-message"
import { UpgradePromptModal } from "@/components/dashboard/upgrade-prompt-modal"

const statusConfig = {
  pending: {
    style: "status-pending",
    label: "Pendente",
    icon: Clock,
  },
  confirmed: {
    style: "status-success",
    label: "Confirmado",
    icon: Check,
  },
  cancelled: {
    style: "status-error",
    label: "Cancelado",
    icon: X,
  },
  completed: {
    style: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    label: "Concluído",
    icon: Check,
  },
}

type CalendarView = "day" | "week" | "month"

function AgendaContent(): ReactElement {
  const { user } = useAuth()
  const [calendarView, setCalendarView] = useState<CalendarView>("day")
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [monthlyCount, setMonthlyCount] = useState(0)
  const [businessAddress, setBusinessAddress] = useState<string>("")
  const [formData, setFormData] = useState<AppointmentInput>({
    clientName: "",
    clientWhatsapp: "",
    serviceId: "",
    date: new Date(),
    startTime: "09:00",
    notes: "",
  })
  const [toastMessage, setToastMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [weekAppointments, setWeekAppointments] = useState<Appointment[]>([])
  const [monthAppointments, setMonthAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [appointmentDialogOpen, setAppointmentDialogOpen] = useState(false)

  const userPlan = user?.subscriptionStatus || "free"
  const hasPremium = hasPremiumAccess(userPlan, user?.trial?.active)
  const canAddAppointment = hasPremium || monthlyCount < FREE_PLAN_LIMITS.appointmentsPerMonth

  useEffect(() => {
    if (user?.uid) {
      loadServices()
      loadAppointments(selectedDate)
      loadMonthlyCount()
      loadBusinessAddress()
      if (calendarView === "week") {
        loadWeekAppointments(selectedDate)
      } else if (calendarView === "month") {
        loadMonthAppointments(selectedDate)
      }
    }
  }, [user, selectedDate, calendarView])

  async function loadServices() {
    if (!user?.uid) return
    try {
      const data = await getServicesByProfessional(user.uid)
      const activeServices = data.filter((s) => s.status === "active")
      setServices(activeServices)
    } catch (error) {
      console.error("Erro ao carregar serviços:", error)
    }
  }

  async function loadAppointments(date: Date) {
    if (!user?.uid) return
    setLoading(true)
    try {
      const data = await getAppointmentsByDate(user.uid, date)
      setAppointments(data)
    } catch (error) {
      console.error("Erro ao carregar agendamentos:", error)
    } finally {
      setLoading(false)
    }
  }

  async function loadMonthlyCount() {
    if (!user?.uid) return
    try {
      const count = await getMonthlyAppointmentsCount(user.uid)
      setMonthlyCount(count)
    } catch (error) {
      console.error("Erro ao carregar contagem mensal:", error)
    }
  }

  async function loadWeekAppointments(date: Date) {
    if (!user?.uid) return
    setLoading(true)
    try {
      const startOfWeek = new Date(date)
      const day = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - day
      startOfWeek.setDate(diff)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      const data = await getAppointmentsByDateRange(user.uid, startOfWeek, endOfWeek)
      setWeekAppointments(data)
    } catch (error) {
      console.error("Erro ao carregar agendamentos da semana:", error)
    } finally {
      setLoading(false)
    }
  }

  async function loadMonthAppointments(date: Date) {
    if (!user?.uid) return
    setLoading(true)
    try {
      const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1)
      const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0)

      const data = await getAppointmentsByDateRange(user.uid, startOfMonth, endOfMonth)
      setMonthAppointments(data)
    } catch (error) {
      console.error("Erro ao carregar agendamentos do mês:", error)
    } finally {
      setLoading(false)
    }
  }

  async function loadBusinessAddress() {
    if (!user?.uid) return
    try {
      const business = await getBusinessByProfessional(user.uid)
      if (business?.address) {
        setBusinessAddress(business.address)
      }
    } catch (error) {
      console.error("Erro ao carregar endereço:", error)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!user?.uid) return

    if (!canAddAppointment) {
      setToastMessage({
        type: "error",
        text: userMessages.error.appointmentsLimit + " " + userMessages.info.upgradeForMore + ".",
      })
      return
    }

    try {
      await createAppointment(user.uid, { ...formData, date: selectedDate })
      await loadAppointments(selectedDate)
      await loadMonthlyCount()
      setToastMessage({ type: "success", text: userMessages.success.appointmentCreated })
      handleCloseDialog()

      setTimeout(() => setToastMessage(null), 3000)
    } catch (error) {
      setToastMessage({ type: "error", text: getFriendlyErrorMessage(error) })
    }
  }

  async function handleUpdateStatus(appointmentId: string, newStatus: string) {
    try {
      await updateAppointmentStatus(appointmentId, newStatus)
      await loadAppointments(selectedDate)
      setToastMessage({ type: "success", text: userMessages.success.appointmentUpdated })
      setTimeout(() => setToastMessage(null), 2000)
    } catch (error) {
      setToastMessage({ type: "error", text: getFriendlyErrorMessage(error) })
    }
  }

  function handleCloseDialog() {
    setDialogOpen(false)
    setFormData({
      clientName: "",
      clientWhatsapp: "",
      serviceId: "",
      date: selectedDate,
      startTime: "09:00",
      notes: "",
    })
  }

  function handleNewAppointment() {
    if (!canAddAppointment) {
      setShowUpgradeModal(true)
      return
    }
    setDialogOpen(true)
  }

  function navigateDate(direction: "prev" | "next") {
    const newDate = new Date(selectedDate)
    if (calendarView === "day") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1))
    } else if (calendarView === "week") {
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7))
    } else {
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1))
    }
    setSelectedDate(newDate)
  }

  function goToToday() {
    setSelectedDate(new Date())
  }

  const dayName = selectedDate.toLocaleDateString("pt-BR", { weekday: "long" })
  const formattedDate = formatDate(selectedDate)
  const monthYear = selectedDate.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })

  const pendingCount = appointments.filter((a) => a.status === "pending").length
  const confirmedCount = appointments.filter((a) => a.status === "confirmed").length

  if (loading && appointments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-3">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto"></div>
          <p className="text-sm text-muted-foreground">Carregando agenda...</p>
        </div>
      </div>
    )
  }

  function renderWeekView() {
    const startOfWeek = new Date(selectedDate)
    const day = startOfWeek.getDay()
    const diff = startOfWeek.getDate() - day
    startOfWeek.setDate(diff)

    const weekDays = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      weekDays.push(day)
    }

    return (
      <>
        {/* Desktop View: Grid Calendar */}
        <div className="hidden lg:block overflow-x-auto">
          <div className="min-w-[800px]">
            {/* Header with days */}
            <div className="grid grid-cols-8 gap-px bg-border rounded-t-xl overflow-hidden">
              <div className="bg-card p-3"></div>
              {weekDays.map((day, i) => (
                <div
                  key={i}
                  className={cn(
                    "bg-card p-3 text-center",
                    day.toDateString() === new Date().toDateString() && "bg-primary/10",
                  )}
                >
                  <div className="text-xs text-muted-foreground">
                    {day.toLocaleDateString("pt-BR", { weekday: "short" })}
                  </div>
                  <div
                    className={cn(
                      "text-lg font-semibold",
                      day.toDateString() === new Date().toDateString() && "text-primary",
                    )}
                  >
                    {day.getDate()}
                  </div>
                </div>
              ))}
            </div>

            {/* Time slots grid */}
            <div className="grid grid-cols-8 gap-px bg-border">
              {Array.from({ length: 14 }, (_, i) => i + 7).map((hour) => {
                const time = `${String(hour).padStart(2, "0")}:00`
                return (
                  <React.Fragment key={`time-${time}`}>
                    <div className="bg-card p-2 text-sm text-muted-foreground text-right pr-3">{time}</div>
                    {weekDays.map((day, dayIndex) => {
                      const dayAppointments = weekAppointments.filter(
                        (apt) =>
                          apt.date.toDateString() === day.toDateString() && apt.startTime.startsWith(time.slice(0, 2)),
                      )

                      return (
                        <div key={`slot-${time}-${dayIndex}`} className="bg-card p-1 min-h-[60px] relative">
                          {dayAppointments.map((apt) => {
                            const statusColor =
                              apt.status === "confirmed"
                                ? "bg-green-500/20 border-green-500/50 text-green-400"
                                : apt.status === "pending"
                                  ? "bg-yellow-500/20 border-yellow-500/50 text-yellow-400"
                                  : "bg-red-500/20 border-red-500/50 text-red-400"

                            return (
                              <div
                                key={apt.id}
                                className={cn(
                                  "absolute inset-1 rounded p-1 text-xs border cursor-pointer hover:scale-105 transition-transform",
                                  statusColor,
                                )}
                                onClick={() => {
                                  setSelectedAppointment(apt)
                                  setAppointmentDialogOpen(true)
                                }}
                              >
                                <div className="font-medium truncate">{apt.clientName}</div>
                                <div className="truncate">{apt.serviceName}</div>
                              </div>
                            )
                          })}
                        </div>
                      )
                    })}
                  </React.Fragment>
                )
              })}
            </div>
          </div>
        </div>

        {/* Mobile View: Vertical List by Day */}
        <div className="lg:hidden space-y-4">
          {weekDays.map((day) => {
            const dayAppointments = weekAppointments.filter((apt) => apt.date.toDateString() === day.toDateString())
            const isToday = day.toDateString() === new Date().toDateString()

            return (
              <div
                key={day.toISOString()}
                className={cn("rounded-xl overflow-hidden border", isToday ? "border-primary" : "border-border")}
              >
                {/* Day Header */}
                <div className={cn("p-3 flex items-center justify-between", isToday ? "bg-primary/10" : "bg-card")}>
                  <div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {day.toLocaleDateString("pt-BR", { weekday: "long" })}
                    </div>
                    <div className={cn("text-lg font-semibold", isToday && "text-primary")}>
                      {day.toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
                    </div>
                  </div>
                  {dayAppointments.length > 0 && (
                    <Badge variant="secondary" className="bg-primary/20 text-primary">
                      {dayAppointments.length}
                    </Badge>
                  )}
                </div>

                {/* Appointments List */}
                <div className="bg-card divide-y divide-border">
                  {dayAppointments.length === 0 ? (
                    <div className="p-6 text-center text-sm text-muted-foreground">Nenhum agendamento</div>
                  ) : (
                    dayAppointments
                      .sort((a, b) => a.startTime.localeCompare(b.startTime))
                      .map((apt) => {
                        const statusConfig =
                          apt.status === "confirmed"
                            ? { bg: "bg-green-500/20", text: "text-green-400", label: "Confirmado" }
                            : apt.status === "pending"
                              ? { bg: "bg-yellow-500/20", text: "text-yellow-400", label: "Pendente" }
                              : { bg: "bg-red-500/20", text: "text-red-400", label: "Cancelado" }

                        return (
                          <div
                            key={apt.id}
                            className="p-4 hover:bg-card-interactive cursor-pointer transition-colors"
                            onClick={() => {
                              setSelectedAppointment(apt)
                              setAppointmentDialogOpen(true)
                            }}
                          >
                            <div className="flex items-start gap-3">
                              {/* Time Badge */}
                              <div className="flex-shrink-0 text-center">
                                <div className="text-lg font-bold text-foreground">{apt.startTime}</div>
                                <div className="text-xs text-muted-foreground">{apt.endTime}</div>
                              </div>

                              {/* Appointment Info */}
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-foreground truncate">{apt.clientName}</div>
                                <div className="text-sm text-muted-foreground truncate">{apt.serviceName}</div>
                                {apt.clientWhatsapp && (
                                  <div className="text-xs text-muted-foreground mt-1">{apt.clientWhatsapp}</div>
                                )}
                              </div>

                              {/* Status Badge */}
                              <Badge className={cn("flex-shrink-0", statusConfig.bg, statusConfig.text)}>
                                {statusConfig.label}
                              </Badge>
                            </div>
                          </div>
                        )
                      })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </>
    )
  }

  function renderMonthView() {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const weeks = []
    let currentWeek = []

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      currentWeek.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeks.push(currentWeek)
        currentWeek = []
      }
    }

    // Add empty cells for remaining days
    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        currentWeek.push(null)
      }
      weeks.push(currentWeek)
    }

    return (
      <div className="space-y-2">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-1 md:gap-px md:bg-border md:rounded-t-xl md:overflow-hidden">
          {["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"].map((day) => (
            <div key={day} className="bg-card p-2 text-center text-xs md:text-sm font-medium text-muted-foreground">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="space-y-1 md:space-y-px">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1 md:gap-px md:bg-border">
              {week.map((day, dayIndex) => {
                if (!day) {
                  return (
                    <div
                      key={`empty-${weekIndex}-${dayIndex}`}
                      className="bg-card/50 min-h-[60px] md:min-h-[100px] rounded md:rounded-none"
                    />
                  )
                }

                const date = new Date(year, month, day)
                const isToday = date.toDateString() === new Date().toDateString()
                const dayAppointments = monthAppointments.filter(
                  (apt) => apt.date.toDateString() === date.toDateString(),
                )

                return (
                  <div
                    key={`day-${day}`}
                    className={cn(
                      "bg-card min-h-[60px] md:min-h-[100px] p-1 md:p-2 rounded md:rounded-none",
                      isToday && "ring-2 ring-primary ring-inset",
                    )}
                  >
                    <div
                      className={cn(
                        "text-xs md:text-sm font-semibold mb-1 text-center md:text-left",
                        isToday ? "text-primary" : "text-foreground",
                      )}
                    >
                      {day}
                    </div>
                    <div className="md:hidden flex justify-center gap-0.5 mt-1">
                      {dayAppointments.slice(0, 3).map((apt, i) => {
                        const statusColor =
                          apt.status === "confirmed"
                            ? "bg-green-500"
                            : apt.status === "pending"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                        return (
                          <div
                            key={i}
                            className={cn(
                              "w-1.5 h-1.5 rounded-full cursor-pointer hover:scale-150 transition-transform",
                              statusColor,
                            )}
                            onClick={() => {
                              setSelectedAppointment(apt)
                              setAppointmentDialogOpen(true)
                            }}
                          />
                        )
                      })}
                      {dayAppointments.length > 3 && (
                        <div
                          className="text-[10px] text-muted-foreground ml-0.5 cursor-pointer hover:underline"
                          onClick={() => {
                            setSelectedDate(date)
                            setCalendarView("day")
                          }}
                        >
                          +{dayAppointments.length - 3}
                        </div>
                      )}
                    </div>
                    <div className="hidden md:block space-y-1">
                      {dayAppointments.slice(0, 2).map((apt) => {
                        const statusColor =
                          apt.status === "confirmed"
                            ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                            : apt.status === "pending"
                              ? "bg-yellow-500/20 text-yellow-400 hover:bg-yellow-500/30"
                              : "bg-red-500/20 text-red-400 hover:bg-red-500/30"

                        return (
                          <div
                            key={apt.id}
                            className={cn("text-xs p-1 rounded truncate cursor-pointer transition-colors", statusColor)}
                            onClick={() => {
                              setSelectedAppointment(apt)
                              setAppointmentDialogOpen(true)
                            }}
                          >
                            {apt.startTime} {apt.clientName}
                          </div>
                        )
                      })}
                      {dayAppointments.length > 2 && (
                        <div
                          className="text-xs text-muted-foreground cursor-pointer hover:underline"
                          onClick={() => {
                            setSelectedDate(date)
                            setCalendarView("day")
                          }}
                        >
                          +{dayAppointments.length - 2} mais
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <UpgradePromptModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        feature="criar mais agendamentos este mês"
        description={`Você atingiu o limite de ${FREE_PLAN_LIMITS.appointmentsPerMonth} agendamentos por mês do plano gratuito. Faça upgrade para Premium e tenha agendamentos ilimitados!`}
      />

      {toastMessage && (
        <ToastMessage type={toastMessage.type} message={toastMessage.text} className="animate-in slide-in-from-top" />
      )}

      <Dialog open={appointmentDialogOpen} onOpenChange={setAppointmentDialogOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">Detalhes do Agendamento</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              {selectedAppointment && formatDate(selectedAppointment.date)}
            </DialogDescription>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Cliente</Label>
                <p className="text-lg font-semibold">{selectedAppointment.clientName}</p>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">WhatsApp</Label>
                <a
                  href={`https://wa.me/55${selectedAppointment.clientWhatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Phone className="w-4 h-4" />
                  {selectedAppointment.clientWhatsapp}
                </a>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Serviço</Label>
                <p className="text-lg">{selectedAppointment.serviceName}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Horário</Label>
                  <p className="text-lg font-semibold">
                    {selectedAppointment.startTime} - {selectedAppointment.endTime}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Valor</Label>
                  <p className="text-lg font-semibold text-primary">{formatCurrency(selectedAppointment.price)}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Status</Label>
                <Badge variant="secondary" className={statusConfig[selectedAppointment.status].style}>
                  {statusConfig[selectedAppointment.status].label}
                </Badge>
              </div>

              {selectedAppointment.notes && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-muted-foreground">Observações</Label>
                  <p className="text-sm">{selectedAppointment.notes}</p>
                </div>
              )}

              <div className="pt-4 border-t">
                <Button
                  onClick={() => {
                    const dateStr = formatDate(selectedAppointment.date)
                    const locationText = businessAddress
                      ? `${user?.businessName || "Nosso estabelecimento"} - ${businessAddress}`
                      : user?.businessName || "Nosso estabelecimento"
                    const message = `Olá ${selectedAppointment.clientName}! 😊\nSeu agendamento no AgendFy está confirmado:\n\n📋 Serviço: ${selectedAppointment.serviceName}\n📅 Data: ${dateStr}\n⏰ Horário: ${selectedAppointment.startTime}\n📍 Local: ${locationText}\n\nQualquer dúvida, fico à disposição!`
                    window.open(
                      `https://api.whatsapp.com/send?phone=55${selectedAppointment.clientWhatsapp.replace(/\D/g, "")}&text=${encodeURIComponent(message)}`,
                      "_blank",
                    )
                  }}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  <Phone className="w-4 h-4 mr-2" />
                  Enviar WhatsApp ao cliente
                </Button>
              </div>

              {selectedAppointment.status === "pending" && (
                <div className="flex gap-2 pt-4">
                  <Button
                    onClick={() => {
                      handleUpdateStatus(selectedAppointment.id, "confirmed")
                      setAppointmentDialogOpen(false)
                    }}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirmar
                  </Button>
                  <Button
                    onClick={() => {
                      handleUpdateStatus(selectedAppointment.id, "cancelled")
                      setAppointmentDialogOpen(false)
                    }}
                    variant="destructive"
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancelar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      <PageHeaderEnhanced
        title="Agenda"
        description="Gerencie seus agendamentos de forma intuitiva e eficiente"
        icon={CalendarIcon}
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button
                className={cn(
                  "shadow-lg",
                  canAddAppointment
                    ? "bg-primary hover:bg-primary/90 shadow-primary/20"
                    : "bg-muted text-muted-foreground cursor-not-allowed",
                )}
                onClick={handleNewAppointment}
                disabled={!canAddAppointment}
              >
                {canAddAppointment ? (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Agendamento
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4 mr-2" />
                    Limite Mensal
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border text-foreground max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl">Novo Agendamento</DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  Agende um novo atendimento para {formattedDate}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="clientName" className="text-sm font-medium">
                    Nome do cliente
                  </Label>
                  <Input
                    id="clientName"
                    value={formData.clientName}
                    onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
                    placeholder="Nome completo"
                    required
                    className="bg-secondary border-border h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="clientWhatsapp" className="text-sm font-medium">
                    WhatsApp
                  </Label>
                  <Input
                    id="clientWhatsapp"
                    value={formData.clientWhatsapp}
                    onChange={(e) => setFormData({ ...formData, clientWhatsapp: e.target.value })}
                    placeholder="(00) 00000-0000"
                    required
                    className="bg-secondary border-border h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-sm font-medium">Serviço</Label>
                  <Select
                    value={formData.serviceId}
                    onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
                  >
                    <SelectTrigger className="bg-secondary border-border h-11">
                      <SelectValue placeholder="Selecione um serviço" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} - {formatCurrency(service.price)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="startTime" className="text-sm font-medium">
                    Horário
                  </Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    required
                    className="bg-secondary border-border h-11"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Observações (opcional)
                  </Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Observações sobre o agendamento"
                    rows={3}
                    className="bg-secondary border-border resize-none"
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
                  <Button
                    type="submit"
                    className="flex-1 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                    disabled={!formData.serviceId}
                  >
                    Agendar
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {/* Conditionally render PlanLimitBanner, considering premium status */}
      {!hasPremium && (
        <PlanLimitBanner
          currentCount={monthlyCount}
          maxCount={FREE_PLAN_LIMITS.appointmentsPerMonth}
          resourceName="agendamento"
          resourceNamePlural="agendamentos este mês"
        />
      )}

      {/* Calendar View Selector */}
      <Card className="glass-effect p-4 shadow-lg">
        <div className="flex flex-col sm:flex-flex-row items-center justify-between gap-4">
          {/* View Tabs */}
          <div className="flex items-center gap-1 p-1 bg-secondary rounded-xl w-full sm:w-auto">
            <button
              onClick={() => setCalendarView("day")}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-none justify-center",
                calendarView === "day"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>Dia</span>
            </button>

            <button
              onClick={() => setCalendarView("week")}
              disabled={!hasPremium}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-none justify-center relative",
                calendarView === "week"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : !hasPremium
                    ? "text-muted-foreground/50 cursor-not-allowed"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <CalendarDays className="w-4 h-4" />
              <span>Semana</span>
              {!hasPremium && <Crown className="w-3.5 h-3.5 text-amber-400 ml-1" />}
            </button>

            <button
              onClick={() => setCalendarView("month")}
              disabled={!hasPremium}
              className={cn(
                "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all flex-1 sm:flex-none justify-center relative",
                calendarView === "month"
                  ? "bg-primary text-primary-foreground shadow-md"
                  : !hasPremium
                    ? "text-muted-foreground/50 cursor-not-allowed"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
              )}
            >
              <CalendarRange className="w-4 h-4" />
              <span>Mês</span>
              {!hasPremium && <Crown className="w-3.5 h-3.5 text-amber-400 ml-1" />}
            </button>
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={goToToday}
              className="border-border hover:bg-secondary text-xs bg-transparent"
            >
              Hoje
            </Button>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate("prev")}
                className="h-9 w-9 hover:bg-secondary"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigateDate("next")}
                className="h-9 w-9 hover:bg-secondary"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </Card>

      {/* Date Display */}
      <Card className="glass-effect p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-foreground capitalize">
              {calendarView === "month" ? monthYear : formattedDate}
            </h2>
            {calendarView === "day" && <p className="text-muted-foreground capitalize">{dayName}</p>}
          </div>
          <div className="flex items-center gap-3">
            {pendingCount > 0 && (
              <Badge variant="secondary" className="status-pending">
                <Clock className="w-3.5 h-3.5 mr-1.5" />
                {pendingCount} pendente{pendingCount > 1 ? "s" : ""}
              </Badge>
            )}
            {confirmedCount > 0 && (
              <Badge variant="secondary" className="status-success">
                <Check className="w-3.5 h-3.5 mr-1.5" />
                {confirmedCount} confirmado{confirmedCount > 1 ? "s" : ""}
              </Badge>
            )}
          </div>
        </div>
      </Card>

      {/* Appointments List */}
      {calendarView === "week" ? (
        <Card className="glass-effect p-6 shadow-lg">{renderWeekView()}</Card>
      ) : calendarView === "month" ? (
        <Card className="glass-effect p-6 shadow-lg">{renderMonthView()}</Card>
      ) : (
        <>
          {appointments.length === 0 ? (
            <Card className="bg-card-elevated p-12 text-center">
              <div className="flex flex-col items-center gap-4 max-w-md mx-auto">
                <div className="p-4 bg-muted rounded-2xl">
                  <CalendarIcon className="w-12 h-12 text-muted-foreground" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl font-semibold text-foreground">Nenhum agendamento</h3>
                  <p className="text-muted-foreground">Não há agendamentos para este dia</p>
                </div>
                {canAddAppointment && (
                  <Button onClick={() => setDialogOpen(true)} className="bg-primary hover:bg-primary/90 mt-2">
                    <Plus className="w-4 h-4 mr-2" />
                    Criar agendamento
                  </Button>
                )}
              </div>
            </Card>
          ) : (
            <div className="grid gap-4">
              {appointments.map((appointment) => {
                const status = statusConfig[appointment.status]
                const StatusIcon = status.icon

                return (
                  <Card
                    key={appointment.id}
                    className="group bg-card-interactive p-6 shadow-md hover:shadow-xl transition-all duration-300"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      {/* Time */}
                      <div className="flex items-center gap-3 sm:w-32 shrink-0">
                        <div className="p-2.5 bg-primary/10 rounded-xl group-hover:bg-primary/20 transition-colors">
                          <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-lg text-foreground">{appointment.startTime}</p>
                          <p className="text-sm text-muted-foreground">{appointment.endTime}</p>
                        </div>
                      </div>

                      {/* Divider */}
                      <div className="hidden sm:block w-px h-16 bg-border" />

                      {/* Client & Service Info */}
                      <div className="flex-1 space-y-2">
                        <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
                          {appointment.clientName}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3">
                          <Badge variant="secondary" className="bg-secondary text-foreground border-border">
                            {appointment.serviceName}
                          </Badge>
                          <span className="text-sm text-primary font-medium">{formatCurrency(appointment.price)}</span>
                          <a
                            href={`https://wa.me/55${appointment.clientWhatsapp.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-primary transition-colors"
                          >
                            <Phone className="w-3.5 h-3.5" />
                            {appointment.clientWhatsapp}
                          </a>
                        </div>
                      </div>

                      {/* Status & Actions */}
                      <div className="flex items-center gap-3 sm:ml-auto">
                        <Badge variant="secondary" className={status.style}>
                          <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                          {status.label}
                        </Badge>

                        {appointment.status === "pending" && (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(appointment.id, "confirmed")}
                              className="border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/10"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleUpdateStatus(appointment.id, "cancelled")}
                              className="border-destructive/30 text-destructive hover:bg-destructive/10"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mt-4 pt-4 border-t border-border">
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium text-foreground">Obs:</span> {appointment.notes}
                        </p>
                      </div>
                    )}
                  </Card>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Show upgrade banner only if not premium */}
      {!hasPremium && (
        <Card className="bg-gradient-to-r from-purple-500/10 to-indigo-500/10 border-purple-500/20 p-6 shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-foreground">Desbloqueie todo o potencial da sua agenda</h4>
              <p className="text-sm text-muted-foreground mt-1">
                Com o Premium, você tem visualização de semana e mês, agendamentos ilimitados, e muito mais.
              </p>
            </div>
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 w-full sm:w-auto"
            >
              <Crown className="w-4 h-4 mr-2" />
              Fazer Upgrade
            </Button>
          </div>
        </Card>
      )}
    </div>
  )
}

export default function AgendaPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <AgendaContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
