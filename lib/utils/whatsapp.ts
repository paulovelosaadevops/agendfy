export function formatWhatsApp(value: string): string {
  const numbers = value.replace(/\D/g, "")

  if (numbers.length <= 2) {
    return numbers
  }
  if (numbers.length <= 7) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`
  }
  if (numbers.length <= 11) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`
  }

  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`
}

export function formatPhoneNumber(value: string): string {
  return formatWhatsApp(value)
}

export function validateWhatsApp(value: string): boolean {
  const numbers = value.replace(/\D/g, "")
  return numbers.length === 11
}

export function cleanWhatsApp(value: string): string {
  return value.replace(/\D/g, "")
}
