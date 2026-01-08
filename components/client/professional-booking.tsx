"use client"

import { useState, useEffect } from "react"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { getServicesByProfessional } from "@/lib/firestore/services"
import { getAppointmentsByDate, createAppointmentWithClient } from "@/lib/firestore/appointments"
import type { Service } from "@/types/firestore"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  Building2,
  CalendarIcon,
  Clock,
  DollarSign,
  Phone,
  CheckCircle2,
  ArrowLeft,
  AlertCircle,
  LogIn,
} from "lucide-react"
import { formatCurrency } from "@/lib/utils/format"
import { formatPhoneNumber } from "@/lib/utils/whatsapp"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface ProfessionalData {
  name: string
  businessName: string
  businessType: string
  whatsapp: string
  email: string
}

export function ProfessionalBooking({ professionalId }: { professionalId: string }) {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [professional, setProfessional] = useState<ProfessionalData | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [bookedSlots, setBookedSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [booking, setBooking] = useState(false)
  const [success, setSuccess] = useState(false)

  const [notes, setNotes] = useState("")

  const isAuthenticated = !authLoading && !!user
  const isClient = user?.role === "client"

  useEffect(() => {
    loadProfessionalData()
  }, [professionalId])

  useEffect(() => {
    if (selectedDate && selectedService) {
      loadBookedSlots()
    }
  }, [selectedDate, selectedService])

  async function loadProfessionalData() {
    try {
      console.log("[v0] Loading professional with ID:", professionalId)
      const userDoc = await getDoc(doc(db, "users", professionalId))
      console.log("[v0] Document exists:", userDoc.exists())

      if (!userDoc.exists()) {
        console.log("[v0] Professional document not found for ID:", professionalId)
        toast.error("Profissional não encontrado")
        return
      }

      const data = userDoc.data()
      console.log("[v0] Professional data:", data)
      setProfessional({
        name: data.name,
        businessName: data.businessName || data.name,
        businessType: data.businessType || "Serviço",
        whatsapp: data.whatsapp,
        email: data.email,
      })

      const servicesData = await getServicesByProfessional(professionalId)
      const activeServices = servicesData.filter((s) => s.status === "active")
      setServices(activeServices)

      if (activeServices.length > 0) {
        setSelectedService(activeServices[0])
      }
    } catch (error) {
      console.error("[v0] Error loading professional:", error)
      toast.error("Erro ao carregar dados do profissional")
    } finally {
      setLoading(false)
    }
  }

  async function loadBookedSlots() {
    if (!selectedDate || !selectedService) return

    try {
      const appointments = await getAppointmentsByDate(professionalId, selectedDate)
      const slots = appointments.filter((apt) => apt.status !== "cancelled").map((apt) => apt.startTime)
      setBookedSlots(slots)
    } catch (error) {
      console.error("Error loading booked slots:", error)
    }
  }

  function generateTimeSlots(): string[] {
    const slots: string[] = []
    const start = 8 * 60 // 8:00 AM
    const end = 20 * 60 // 8:00 PM
    const interval = 30 // 30 minutes

    for (let minutes = start; minutes < end; minutes += interval) {
      const hours = Math.floor(minutes / 60)
      const mins = minutes % 60
      const time = `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`
      slots.push(time)
    }

    return slots
  }

  function isSlotAvailable(time: string): boolean {
    if (!selectedService) return false

    const [hours, minutes] = time.split(":").map(Number)
    const slotMinutes = hours * 60 + minutes
    const serviceEndMinutes = slotMinutes + selectedService.duration

    return !bookedSlots.some((bookedTime) => {
      const [bookedHours, bookedMinutes] = bookedTime.split(":").map(Number)
      const bookedStartMinutes = bookedHours * 60 + bookedMinutes

      return (
        (slotMinutes >= bookedStartMinutes && slotMinutes < bookedStartMinutes + selectedService.duration) ||
        (serviceEndMinutes > bookedStartMinutes &&
          serviceEndMinutes <= bookedStartMinutes + selectedService.duration) ||
        (slotMinutes <= bookedStartMinutes && serviceEndMinutes >= bookedStartMinutes + selectedService.duration)
      )
    })
  }

  async function handleBooking() {
    if (!user || user.role !== "client") {
      toast.error("Você precisa estar logado como cliente para agendar")
      return
    }

    if (!selectedService || !selectedDate || !selectedTime) {
      toast.error("Preencha todos os campos obrigatórios")
      return
    }

    setBooking(true)
    try {
      await createAppointmentWithClient(professionalId, user.uid, {
        serviceId: selectedService.id!,
        clientName: user.name || "",
        clientWhatsapp: user.whatsapp || "",
        date: selectedDate,
        startTime: selectedTime,
        notes,
      })

      setSuccess(true)
      toast.success("Agendamento realizado com sucesso!")
    } catch (error) {
      console.error("Booking error:", error)
      toast.error("Erro ao criar agendamento")
    } finally {
      setBooking(false)
    }
  }

  function handleAuthRedirect() {
    // Save the current URL to return after auth
    const currentUrl = `/cliente?professional=${professionalId}`
    sessionStorage.setItem("redirectAfterLogin", currentUrl)
    router.push("/register/cliente")
  }

  if (loading || authLoading) {
    return (
      <div className="container mx-auto px-4 py-20">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mx-auto" />
            <p className="text-sm text-muted-foreground">Carregando...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!professional) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="p-8 text-center max-w-md mx-auto">
          <p className="text-muted-foreground">Profissional não encontrado</p>
          <Button onClick={() => router.push("/")} className="mt-4">
            Voltar para home
          </Button>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="container mx-auto px-4 py-20">
        <Card className="p-8 max-w-2xl mx-auto text-center space-y-6">
          <div className="flex justify-center">
            <div className="p-4 bg-primary/10 rounded-full">
              <CheckCircle2 className="w-16 h-16 text-primary" />
            </div>
          </div>
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-foreground">Agendamento Confirmado!</h2>
            <p className="text-lg text-muted-foreground">Seu horário foi reservado com sucesso</p>
          </div>
          <Card className="bg-secondary p-6 space-y-4 text-left">
            <div className="flex items-center gap-3">
              <Building2 className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Profissional</p>
                <p className="font-semibold">{professional.businessName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <CalendarIcon className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Data e horário</p>
                <p className="font-semibold">
                  {selectedDate?.toLocaleDateString("pt-BR")} às {selectedTime}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-primary" />
              <div>
                <p className="text-sm text-muted-foreground">Serviço</p>
                <p className="font-semibold">{selectedService?.name}</p>
              </div>
            </div>
          </Card>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Você receberá uma confirmação via WhatsApp no número {user?.whatsapp && formatPhoneNumber(user.whatsapp)}
            </p>
            <Button onClick={() => router.push("/dashboard/my-appointments")} size="lg" className="w-full">
              Ver meus agendamentos
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <Button onClick={() => router.push("/")} variant="ghost" className="mb-6">
        <ArrowLeft className="w-4 h-4 mr-2" />
        Voltar
      </Button>

      {!isAuthenticated && (
        <Alert className="mb-6 border-primary/50 bg-primary/5">
          <AlertCircle className="h-4 w-4 text-primary" />
          <AlertDescription className="text-sm">
            Você precisa estar logado como cliente para realizar um agendamento.{" "}
            <Button variant="link" className="h-auto p-0 text-primary font-semibold" onClick={handleAuthRedirect}>
              Criar conta ou fazer login
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {isAuthenticated && !isClient && (
        <Alert className="mb-6 border-destructive/50 bg-destructive/5">
          <AlertCircle className="h-4 w-4 text-destructive" />
          <AlertDescription className="text-sm text-destructive">
            Você precisa de uma conta de cliente para realizar agendamentos. Entre com uma conta de cliente ou crie uma
            nova.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <Building2 className="w-8 h-8 text-primary" />
              </div>
              <div className="flex-1">
                <h1 className="text-2xl font-bold text-foreground">{professional.businessName}</h1>
                <p className="text-muted-foreground">{professional.businessType}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4" />
                    {formatPhoneNumber(professional.whatsapp)}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Selecione um serviço</h3>
            <div className="grid gap-3">
              {services.map((service) => (
                <button
                  key={service.id}
                  onClick={() => {
                    setSelectedService(service)
                    setSelectedTime("")
                  }}
                  disabled={!isClient}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedService?.id === service.id
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-border/60"
                  } ${!isClient ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1 flex-1">
                      <p className="font-semibold text-foreground">{service.name}</p>
                      <p className="text-sm text-muted-foreground">{service.description}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <Badge variant="outline" className="text-xs">
                          <Clock className="w-3 h-3 mr-1" />
                          {service.duration} min
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          <DollarSign className="w-3 h-3 mr-1" />
                          {formatCurrency(service.price)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {selectedService && isClient && (
            <>
              <Card className="p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Escolha a data</h3>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                  className="rounded-md border"
                />
              </Card>

              {selectedDate && (
                <Card className="p-6 space-y-4">
                  <h3 className="text-lg font-semibold text-foreground">Escolha o horário</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {generateTimeSlots().map((time) => {
                      const available = isSlotAvailable(time)
                      return (
                        <Button
                          key={time}
                          onClick={() => available && setSelectedTime(time)}
                          variant={selectedTime === time ? "default" : "outline"}
                          disabled={!available}
                          className="h-10"
                        >
                          {time}
                        </Button>
                      )
                    })}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>

        <div className="lg:col-span-1">
          <Card className="p-6 space-y-6 sticky top-20">
            {!isAuthenticated ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Faça login para agendar</h3>
                <p className="text-sm text-muted-foreground">
                  Você precisa estar logado como cliente para realizar um agendamento.
                </p>
                <Button onClick={handleAuthRedirect} className="w-full h-12" size="lg">
                  <LogIn className="w-4 h-4 mr-2" />
                  Criar conta ou fazer login
                </Button>
              </div>
            ) : !isClient ? (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-foreground">Conta incorreta</h3>
                <p className="text-sm text-muted-foreground">
                  Você precisa de uma conta de cliente para agendar serviços.
                </p>
                <Button onClick={handleAuthRedirect} className="w-full h-12" size="lg">
                  Criar conta de cliente
                </Button>
              </div>
            ) : (
              <>
                <h3 className="text-lg font-semibold text-foreground">Seus dados</h3>

                <div className="space-y-4">
                  <div className="p-4 bg-secondary rounded-lg space-y-2">
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-medium">{user.name}</p>
                  </div>

                  <div className="p-4 bg-secondary rounded-lg space-y-2">
                    <p className="text-sm text-muted-foreground">WhatsApp</p>
                    <p className="font-medium">{user.whatsapp && formatPhoneNumber(user.whatsapp)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Textarea
                      id="notes"
                      placeholder="Alguma informação adicional?"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      disabled={booking}
                      rows={3}
                    />
                  </div>
                </div>

                {selectedService && selectedDate && selectedTime && (
                  <div className="p-4 bg-secondary rounded-lg space-y-2">
                    <p className="text-sm font-semibold text-foreground">Resumo</p>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>{selectedService.name}</p>
                      <p>
                        {selectedDate.toLocaleDateString("pt-BR")} às {selectedTime}
                      </p>
                      <p className="text-lg font-bold text-foreground mt-2">{formatCurrency(selectedService.price)}</p>
                    </div>
                  </div>
                )}

                <Button
                  onClick={handleBooking}
                  disabled={!selectedService || !selectedDate || !selectedTime || booking}
                  className="w-full h-12"
                  size="lg"
                >
                  {booking ? "Agendando..." : "Confirmar agendamento"}
                </Button>
              </>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
