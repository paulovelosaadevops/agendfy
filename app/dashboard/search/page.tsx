"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { ProtectedRoute } from "@/components/protected-route"
import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Calendar } from "@/components/ui/calendar"
import { Search, Phone, MapPin, Briefcase, CalendarIcon, Check, Clock } from "lucide-react"
import { getAllProfessionals } from "@/lib/firestore/appointments"
import { getServicesByProfessional } from "@/lib/firestore/services"
import { getAppointmentsByDate, createAppointmentWithClient } from "@/lib/firestore/appointments"
import type { Service, AppointmentInput } from "@/types/firestore"

interface Professional {
  id: string
  name: string
  businessName: string
  businessType: string
  whatsapp: string
  email: string
  address?: string
  location?: {
    state: string
    city: string
  }
}

function SearchProfessionalsContent() {
  const { user } = useAuth()
  const [professionals, setProfessionals] = useState<Professional[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [locationContext, setLocationContext] = useState<{
    type: "exact" | "state" | "all"
    message: string
  } | null>(null)

  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)
  const [selectedProfessional, setSelectedProfessional] = useState<Professional | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const [selectedTime, setSelectedTime] = useState("")
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [booking, setBooking] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)

  useEffect(() => {
    loadProfessionals()
  }, [])

  async function loadProfessionals() {
    setLoading(true)
    try {
      const data = await getAllProfessionals()
      let filtered = data
      let context = null

      if (user?.location) {
        const cityMatch = data.filter(
          (prof) =>
            prof.location && prof.location.city === user.location.city && prof.location.state === user.location.state,
        )

        if (cityMatch.length > 0) {
          filtered = cityMatch
          context = {
            type: "exact" as const,
            message: `Exibindo profissionais em ${user.location.city} - ${user.location.state}`,
          }
        } else {
          const stateMatch = data.filter((prof) => prof.location && prof.location.state === user.location.state)

          if (stateMatch.length > 0) {
            filtered = stateMatch
            context = {
              type: "state" as const,
              message: `Nenhum profissional encontrado em ${user.location.city}. Exibindo profissionais de todo o estado de ${user.location.state}`,
            }
          } else {
            filtered = data
            context = {
              type: "all" as const,
              message: `Nenhum profissional encontrado em ${user.location.state}. Exibindo todos os profissionais`,
            }
          }
        }
      }

      setProfessionals(filtered)
      setLocationContext(context)
    } catch (error) {
      console.error("Erro ao carregar profissionais:", error)
      setProfessionals([])
      setLocationContext(null)
    } finally {
      setLoading(false)
    }
  }

  async function openBookingDialog(professional: Professional) {
    setSelectedProfessional(professional)
    setBookingDialogOpen(true)
    setBookingSuccess(false)

    try {
      const servicesData = await getServicesByProfessional(professional.id)
      setServices(servicesData.filter((s) => s.status === "active"))
    } catch (error) {
      console.error("Erro ao carregar serviços:", error)
      setServices([])
    }
  }

  async function loadAvailableSlots() {
    if (!selectedDate || !selectedProfessional) return

    try {
      const appointments = await getAppointmentsByDate(selectedProfessional.id, selectedDate)
      const bookedTimes = appointments
        .filter((apt) => apt.status === "confirmed" || apt.status === "pending")
        .map((apt) => apt.startTime)

      const slots = []
      for (let hour = 8; hour < 20; hour++) {
        for (const min of [0, 30]) {
          const time = `${String(hour).padStart(2, "0")}:${String(min).padStart(2, "0")}`
          if (!bookedTimes.includes(time)) {
            slots.push(time)
          }
        }
      }
      setAvailableSlots(slots)
    } catch (error) {
      console.error("Erro ao carregar horários:", error)
      setAvailableSlots([])
    }
  }

  useEffect(() => {
    if (selectedDate) {
      loadAvailableSlots()
    }
  }, [selectedDate, selectedProfessional])

  async function handleConfirmBooking() {
    if (!selectedProfessional || !selectedService || !selectedDate || !selectedTime || !user) return

    setBooking(true)
    try {
      const appointmentData: AppointmentInput = {
        serviceId: selectedService.id,
        clientName: user.name,
        clientWhatsapp: user.whatsapp || "",
        date: selectedDate,
        startTime: selectedTime,
        notes: "",
      }

      await createAppointmentWithClient(selectedProfessional.id, user.uid, appointmentData)
      setBookingSuccess(true)
    } catch (error) {
      console.error("Erro ao criar agendamento:", error)
      alert("Erro ao criar agendamento. Tente novamente.")
    } finally {
      setBooking(false)
    }
  }

  const filteredProfessionals = professionals.filter((prof) => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      prof.businessName?.toLowerCase().includes(search) ||
      prof.businessType?.toLowerCase().includes(search) ||
      prof.name?.toLowerCase().includes(search) ||
      prof.location?.city?.toLowerCase().includes(search) ||
      prof.location?.state?.toLowerCase().includes(search)
    )
  })

  if (loading) {
    return <div className="p-8 text-center text-muted-foreground">Carregando profissionais...</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold text-foreground">Encontrar Profissionais</h2>
        <p className="text-muted-foreground mt-1">Busque e agende com profissionais próximos a você</p>
      </div>

      {locationContext && (
        <div
          className={`rounded-lg p-4 border ${
            locationContext.type === "exact"
              ? "bg-primary/5 border-primary/20"
              : locationContext.type === "state"
                ? "bg-yellow-500/5 border-yellow-500/20"
                : "bg-muted border-border"
          }`}
        >
          <div className="flex items-start gap-3">
            <MapPin
              className={`w-5 h-5 mt-0.5 ${
                locationContext.type === "exact"
                  ? "text-primary"
                  : locationContext.type === "state"
                    ? "text-yellow-600 dark:text-yellow-400"
                    : "text-muted-foreground"
              }`}
            />
            <div className="flex-1">
              <p
                className={`text-sm font-medium ${
                  locationContext.type === "exact"
                    ? "text-primary"
                    : locationContext.type === "state"
                      ? "text-yellow-700 dark:text-yellow-300"
                      : "text-foreground"
                }`}
              >
                {locationContext.message}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Buscar por nome, tipo de serviço, cidade..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-12 py-6 text-lg bg-secondary border-border text-foreground"
        />
      </div>

      {filteredProfessionals.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredProfessionals.map((professional) => (
            <Card
              key={professional.id}
              className="bg-card border-border p-6 hover:border-primary/30 transition-all hover:shadow-lg hover:shadow-primary/10"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-xl font-bold text-foreground mb-1">{professional.businessName}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="w-4 h-4 text-primary" />
                    <span>{professional.businessType}</span>
                  </div>
                </div>
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Briefcase className="w-5 h-5 text-primary" />
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>{professional.whatsapp}</span>
                </div>
                {professional.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>
                      {professional.location.city} - {professional.location.state}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-primary hover:bg-primary/90"
                  onClick={() => openBookingDialog(professional)}
                >
                  <CalendarIcon className="w-4 h-4 mr-2" />
                  Agendar horário
                </Button>
                <Button
                  variant="outline"
                  className="border-border hover:bg-secondary bg-transparent"
                  onClick={() => {
                    window.open(`https://wa.me/55${professional.whatsapp.replace(/\D/g, "")}`, "_blank")
                  }}
                >
                  <Phone className="w-4 h-4" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border p-12">
          <div className="text-center text-muted-foreground">
            <Search className="w-16 h-16 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">
              {searchTerm ? "Nenhum profissional encontrado" : "Nenhum profissional cadastrado"}
            </h3>
            <p>
              {searchTerm
                ? "Tente buscar com outros termos"
                : "Aguarde enquanto novos profissionais se cadastram na plataforma"}
            </p>
          </div>
        </Card>
      )}

      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent
          className="sm:max-w-[700px] max-h-[90vh] overflow-hidden flex flex-col"
          aria-describedby="booking-dialog-description"
        >
          <DialogHeader className="border-b pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Briefcase className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold">
                  {bookingSuccess ? "✓ Agendamento Criado!" : selectedProfessional?.businessName}
                </DialogTitle>
                {!bookingSuccess && (
                  <p className="text-sm text-muted-foreground">{selectedProfessional?.businessType}</p>
                )}
              </div>
            </div>
            <p id="booking-dialog-description" className="sr-only">
              {bookingSuccess
                ? "Seu agendamento foi criado com sucesso"
                : "Selecione um serviço, data e horário para agendar"}
            </p>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-1">
            {bookingSuccess ? (
              <div className="py-8 text-center space-y-6">
                <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-10 h-10 text-green-500" />
                </div>
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold">Agendamento enviado!</h3>
                  <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 max-w-md mx-auto">
                    <p className="text-sm text-yellow-600 dark:text-yellow-400">
                      Seu agendamento está <span className="font-semibold">pendente</span> e aguardando confirmação do
                      profissional.
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">Você pode acompanhar o status em "Meus Agendamentos"</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    variant="outline"
                    className="flex-1 border-green-500/50 hover:bg-green-500/10 text-green-600 dark:text-green-400 bg-transparent"
                    onClick={() => {
                      const dateStr = selectedDate?.toLocaleDateString("pt-BR")
                      const message = `Olá! Acabei de fazer um agendamento pelo AgendFy:
📅 ${dateStr} às ${selectedTime}
📋 ${selectedService?.name}

Aguardo sua confirmação!`
                      window.open(
                        `https://wa.me/55${selectedProfessional?.whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}`,
                        "_blank",
                      )
                    }}
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Avisar profissional via WhatsApp
                  </Button>
                  <Button
                    className="flex-1 bg-primary hover:bg-primary/90"
                    onClick={() => {
                      setBookingDialogOpen(false)
                      window.location.href = "/dashboard/my-appointments"
                    }}
                  >
                    Ver meus agendamentos
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-8 py-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <h4 className="font-semibold text-lg">Selecione o serviço</h4>
                  </div>

                  {services.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3 pl-11">
                      {services.map((service) => (
                        <Card
                          key={service.id}
                          className={`p-4 cursor-pointer transition-all hover:scale-[1.02] ${
                            selectedService?.id === service.id
                              ? "border-primary bg-primary/5 shadow-lg shadow-primary/20"
                              : "border-border hover:border-primary/50 hover:shadow-md"
                          }`}
                          onClick={() => setSelectedService(service)}
                        >
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                              <h5 className="font-semibold text-base mb-1">{service.name}</h5>
                              <p className="text-sm text-muted-foreground line-clamp-2">{service.description}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <div className="text-primary font-bold text-lg">R$ {service.price.toFixed(2)}</div>
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {service.duration} min
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground pl-11">Nenhum serviço disponível</p>
                  )}
                </div>

                {selectedService && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          selectedDate ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        2
                      </div>
                      <h4 className="font-semibold text-lg">Escolha a data</h4>
                    </div>
                    <div className="pl-11">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date()}
                        className="rounded-md border w-fit"
                      />
                    </div>
                  </div>
                )}

                {selectedDate && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                          selectedTime ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        3
                      </div>
                      <h4 className="font-semibold text-lg">Escolha o horário</h4>
                    </div>
                    <div className="pl-11">
                      {availableSlots.length > 0 ? (
                        <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                          {availableSlots.map((slot) => (
                            <Button
                              key={slot}
                              variant={selectedTime === slot ? "default" : "outline"}
                              size="sm"
                              onClick={() => setSelectedTime(slot)}
                              className={`font-semibold ${
                                selectedTime === slot
                                  ? "bg-primary hover:bg-primary/90 shadow-lg"
                                  : "hover:border-primary/50"
                              }`}
                            >
                              {slot}
                            </Button>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 bg-muted/50 rounded-lg">
                          <p className="text-sm text-muted-foreground">Nenhum horário disponível nesta data</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {!bookingSuccess && selectedService && selectedDate && selectedTime && (
            <div className="border-t pt-4 mt-4">
              <Button
                className="w-full bg-primary hover:bg-primary/90 h-12 text-base font-semibold"
                onClick={handleConfirmBooking}
                disabled={booking}
              >
                {booking ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Criando agendamento...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5 mr-2" />
                    Confirmar agendamento
                  </>
                )}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SearchPage() {
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <SearchProfessionalsContent />
      </DashboardLayout>
    </ProtectedRoute>
  )
}
