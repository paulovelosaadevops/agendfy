import { Timestamp } from "firebase/firestore"

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

export function formatDate(date: Date | Timestamp | string | null | undefined): string {
  if (!date) return "-"

  try {
    let dateObj: Date

    // Handle Firestore Timestamp
    if (date instanceof Timestamp) {
      dateObj = date.toDate()
    }
    // Handle object with toDate method (Firestore Timestamp from different import)
    else if (
      typeof date === "object" &&
      date !== null &&
      "toDate" in date &&
      typeof (date as any).toDate === "function"
    ) {
      dateObj = (date as any).toDate()
    }
    // Handle object with seconds property (serialized Timestamp)
    else if (typeof date === "object" && date !== null && "seconds" in date) {
      dateObj = new Date((date as any).seconds * 1000)
    }
    // Handle string
    else if (typeof date === "string") {
      dateObj = new Date(date)
    }
    // Handle Date object
    else if (date instanceof Date) {
      dateObj = date
    }
    // Unknown format
    else {
      return "-"
    }

    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      return "-"
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(dateObj)
  } catch (error) {
    return "-"
  }
}

export function formatDateTime(date: Date | Timestamp | string | null | undefined): string {
  if (!date) return "-"

  try {
    let dateObj: Date

    if (date instanceof Timestamp) {
      dateObj = date.toDate()
    } else if (
      typeof date === "object" &&
      date !== null &&
      "toDate" in date &&
      typeof (date as any).toDate === "function"
    ) {
      dateObj = (date as any).toDate()
    } else if (typeof date === "object" && date !== null && "seconds" in date) {
      dateObj = new Date((date as any).seconds * 1000)
    } else if (typeof date === "string") {
      dateObj = new Date(date)
    } else if (date instanceof Date) {
      dateObj = date
    } else {
      return "-"
    }

    if (isNaN(dateObj.getTime())) {
      return "-"
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(dateObj)
  } catch (error) {
    return "-"
  }
}

export function formatTime(time: string): string {
  return time
}
