import { collection, addDoc, updateDoc, doc, getDocs, query, where, Timestamp, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Appointment, AppointmentInput, AppointmentStatus } from "@/types/firestore"
import { getServiceById } from "./services"

export const appointmentsCollection = "appointments"

export async function createAppointment(professionalId: string, data: AppointmentInput): Promise<string> {
  const service = await getServiceById(data.serviceId)
  if (!service) throw new Error("Serviço não encontrado")

  // Calcular horário de término
  const [hours, minutes] = data.startTime.split(":").map(Number)
  const startMinutes = hours * 60 + minutes
  const endMinutes = startMinutes + service.duration
  const endHours = Math.floor(endMinutes / 60)
  const endMins = endMinutes % 60
  const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`

  const appointmentData = {
    professionalId,
    clientId: "", // será preenchido quando o cliente confirmar
    serviceId: data.serviceId,
    clientName: data.clientName,
    clientWhatsapp: data.clientWhatsapp,
    serviceName: service.name,
    date: Timestamp.fromDate(data.date),
    startTime: data.startTime,
    endTime,
    duration: service.duration,
    price: service.price,
    status: "pending" as AppointmentStatus,
    notes: data.notes || "",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  const docRef = await addDoc(collection(db, appointmentsCollection), appointmentData)
  return docRef.id
}

export async function createAppointmentWithClient(
  professionalId: string,
  clientId: string,
  data: AppointmentInput,
): Promise<string> {
  const service = await getServiceById(data.serviceId)
  if (!service) throw new Error("Serviço não encontrado")

  const [hours, minutes] = data.startTime.split(":").map(Number)
  const startMinutes = hours * 60 + minutes
  const endMinutes = startMinutes + service.duration
  const endHours = Math.floor(endMinutes / 60)
  const endMins = endMinutes % 60
  const endTime = `${String(endHours).padStart(2, "0")}:${String(endMins).padStart(2, "0")}`

  const appointmentData = {
    professionalId,
    clientId,
    serviceId: data.serviceId,
    clientName: data.clientName,
    clientWhatsapp: data.clientWhatsapp,
    serviceName: service.name,
    date: Timestamp.fromDate(data.date),
    startTime: data.startTime,
    endTime,
    duration: service.duration,
    price: service.price,
    status: "pending" as AppointmentStatus,
    notes: data.notes || "",
    bookedByClient: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  const docRef = await addDoc(collection(db, appointmentsCollection), appointmentData)
  return docRef.id
}

export async function updateAppointmentStatus(appointmentId: string, status: AppointmentStatus): Promise<void> {
  const appointmentRef = doc(db, appointmentsCollection, appointmentId)
  await updateDoc(appointmentRef, {
    status,
    updatedAt: Timestamp.now(),
  })
}

export async function updateAppointment(
  appointmentId: string,
  updates: Partial<{
    date: Date
    startTime: string
    endTime: string
    notes: string
  }>,
): Promise<void> {
  const appointmentRef = doc(db, appointmentsCollection, appointmentId)
  const updateData: any = {
    ...updates,
    updatedAt: Timestamp.now(),
  }

  if (updates.date) {
    updateData.date = Timestamp.fromDate(updates.date)
  }

  await updateDoc(appointmentRef, updateData)
}

export async function getAppointmentsByProfessional(professionalId: string): Promise<Appointment[]> {
  const q = query(
    collection(db, appointmentsCollection),
    where("professionalId", "==", professionalId),
    orderBy("date", "desc"),
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Appointment[]
}

export async function getAppointmentsByDate(professionalId: string, date: Date): Promise<Appointment[]> {
  const startOfDay = new Date(date)
  startOfDay.setHours(0, 0, 0, 0)

  const endOfDay = new Date(date)
  endOfDay.setHours(23, 59, 59, 999)

  const q = query(
    collection(db, appointmentsCollection),
    where("professionalId", "==", professionalId),
    where("date", ">=", Timestamp.fromDate(startOfDay)),
    where("date", "<=", Timestamp.fromDate(endOfDay)),
    orderBy("date"),
    orderBy("startTime"),
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Appointment[]
}

export async function getAppointmentsByDateRange(
  professionalId: string,
  startDate: Date,
  endDate: Date,
): Promise<Appointment[]> {
  const start = new Date(startDate)
  start.setHours(0, 0, 0, 0)

  const end = new Date(endDate)
  end.setHours(23, 59, 59, 999)

  const q = query(
    collection(db, appointmentsCollection),
    where("professionalId", "==", professionalId),
    where("date", ">=", Timestamp.fromDate(start)),
    where("date", "<=", Timestamp.fromDate(end)),
    orderBy("date"),
    orderBy("startTime"),
  )

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Appointment[]
}

export async function getAppointmentsByClient(clientId: string): Promise<Appointment[]> {
  const q = query(collection(db, appointmentsCollection), where("clientId", "==", clientId), orderBy("date", "desc"))

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    date: doc.data().date?.toDate(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Appointment[]
}

export async function getMonthlyAppointmentsCount(professionalId: string): Promise<number> {
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const q = query(
    collection(db, appointmentsCollection),
    where("professionalId", "==", professionalId),
    where("date", ">=", Timestamp.fromDate(startOfMonth)),
    where("date", "<=", Timestamp.fromDate(endOfMonth)),
  )

  const snapshot = await getDocs(q)
  return snapshot.size
}

export async function getAllProfessionals(): Promise<any[]> {
  const usersCollection = collection(db, "users")
  const businessCollection = collection(db, "business")

  const q = query(usersCollection, where("role", "==", "professional"))
  const snapshot = await getDocs(q)

  const professionals = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const userData = doc.data()
      const businessDoc = await getDocs(query(businessCollection, where("professionalId", "==", doc.id)))
      const businessData = businessDoc.docs[0]?.data()

      return {
        id: doc.id,
        name: userData.name,
        businessName: userData.businessName || userData.name,
        businessType: userData.businessType || businessData?.businessType || "Serviço",
        whatsapp: userData.whatsapp,
        email: userData.email,
        address: businessData?.address || "",
        location: userData.location || null,
        createdAt: userData.createdAt?.toDate(),
      }
    }),
  )

  return professionals
}
