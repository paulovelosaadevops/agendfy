import { doc, setDoc, getDoc, updateDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Business, BusinessInput, BusinessHours } from "@/types/firestore"

export const businessCollection = "business"

const defaultBusinessHours: BusinessHours[] = [
  { day: "monday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "tuesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "wednesday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "thursday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "friday", isOpen: true, openTime: "09:00", closeTime: "18:00" },
  { day: "saturday", isOpen: false, openTime: "09:00", closeTime: "18:00" },
  { day: "sunday", isOpen: false, openTime: "09:00", closeTime: "18:00" },
]

export async function createBusiness(professionalId: string, data: Partial<BusinessInput>): Promise<void> {
  const businessData = {
    professionalId,
    businessName: data.businessName || "Meu Negócio",
    businessType: data.businessType || "Serviços",
    whatsapp: data.whatsapp || "",
    address: data.address || "",
    businessHours: data.businessHours || defaultBusinessHours,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  const docRef = doc(db, businessCollection, professionalId)
  await setDoc(docRef, businessData)
}

export async function updateBusiness(professionalId: string, data: Partial<BusinessInput>): Promise<void> {
  const docRef = doc(db, businessCollection, professionalId)
  await updateDoc(docRef, {
    ...data,
    updatedAt: Timestamp.now(),
  })
}

export async function getBusinessByProfessional(professionalId: string): Promise<Business | null> {
  const docRef = doc(db, businessCollection, professionalId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) return null

  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate(),
    updatedAt: docSnap.data().updatedAt?.toDate(),
  } as Business
}
