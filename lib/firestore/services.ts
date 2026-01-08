import {
  collection,
  addDoc,
  updateDoc,
  doc,
  deleteDoc,
  getDocs,
  query,
  where,
  Timestamp,
  getDoc,
} from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Service, ServiceInput } from "@/types/firestore"

export const servicesCollection = "services"

export async function createService(professionalId: string, data: ServiceInput): Promise<string> {
  const serviceData = {
    professionalId,
    name: data.name,
    description: data.description,
    duration: data.duration,
    price: data.price,
    status: data.status || "active",
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  }

  const docRef = await addDoc(collection(db, servicesCollection), serviceData)
  return docRef.id
}

export async function updateService(serviceId: string, data: Partial<ServiceInput>): Promise<void> {
  const serviceRef = doc(db, servicesCollection, serviceId)
  await updateDoc(serviceRef, {
    ...data,
    updatedAt: Timestamp.now(),
  })
}

export async function deleteService(serviceId: string): Promise<void> {
  const serviceRef = doc(db, servicesCollection, serviceId)
  await deleteDoc(serviceRef)
}

export async function getServicesByProfessional(professionalId: string): Promise<Service[]> {
  const q = query(collection(db, servicesCollection), where("professionalId", "==", professionalId))

  const snapshot = await getDocs(q)
  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate(),
  })) as Service[]
}

export async function getServiceById(serviceId: string): Promise<Service | null> {
  const docRef = doc(db, servicesCollection, serviceId)
  const docSnap = await getDoc(docRef)

  if (!docSnap.exists()) return null

  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate(),
    updatedAt: docSnap.data().updatedAt?.toDate(),
  } as Service
}
