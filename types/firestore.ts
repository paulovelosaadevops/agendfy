// Firestore data types for AgendFy

export type ServiceStatus = "active" | "inactive"

export interface Service {
  id: string
  professionalId: string
  name: string
  description: string
  duration: number // em minutos
  price: number
  status: ServiceStatus
  createdAt: Date
  updatedAt: Date
}

export interface ServiceInput {
  name: string
  description: string
  duration: number
  price: number
  status?: ServiceStatus
}

export type AppointmentStatus = "pending" | "confirmed" | "cancelled" | "completed"

export interface Appointment {
  id: string
  professionalId: string
  clientId: string
  serviceId: string
  clientName: string
  clientWhatsapp: string
  serviceName: string
  date: Date
  startTime: string
  endTime: string
  duration: number
  price: number
  status: AppointmentStatus
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface AppointmentInput {
  clientName: string
  clientWhatsapp: string
  serviceId: string
  date: Date
  startTime: string
  notes?: string
}

export interface Client {
  id: string
  professionalId: string
  name: string
  whatsapp: string
  email?: string
  totalAppointments: number
  lastAppointment?: Date
  createdAt: Date
}

export type DayOfWeek = "sunday" | "monday" | "tuesday" | "wednesday" | "thursday" | "friday" | "saturday"

export interface BusinessHours {
  day: DayOfWeek
  isOpen: boolean
  openTime: string
  closeTime: string
}

export interface Business {
  id: string // mesmo ID do user professional
  professionalId: string
  businessName: string
  businessType: string
  whatsapp: string
  address?: string
  businessHours: BusinessHours[]
  createdAt: Date
  updatedAt: Date
}

export interface BusinessInput {
  businessName: string
  businessType: string
  whatsapp: string
  address?: string
  businessHours: BusinessHours[]
}

export interface FinancialSummary {
  totalRevenue: number
  totalAppointments: number
  averageTicket: number
  month: string
  year: number
}

export interface DashboardStats {
  todayAppointments: number
  totalClients: number
  nextAppointments: Appointment[]
  monthRevenue: number
}
