"use client"

import { CheckCircle, XCircle, AlertCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

interface ToastMessageProps {
  type: "success" | "error" | "warning" | "info"
  message: string
  className?: string
}

export function ToastMessage({ type, message, className }: ToastMessageProps) {
  const config = {
    success: {
      icon: CheckCircle,
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/30",
      textColor: "text-emerald-400",
      iconBg: "bg-emerald-500/20",
    },
    error: {
      icon: XCircle,
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/30",
      textColor: "text-red-400",
      iconBg: "bg-red-500/20",
    },
    warning: {
      icon: AlertCircle,
      bgColor: "bg-amber-500/10",
      borderColor: "border-amber-500/30",
      textColor: "text-amber-400",
      iconBg: "bg-amber-500/20",
    },
    info: {
      icon: Info,
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/30",
      textColor: "text-blue-400",
      iconBg: "bg-blue-500/20",
    },
  }

  const { icon: Icon, bgColor, borderColor, textColor, iconBg } = config[type]

  return (
    <div className={cn("flex items-start gap-3 p-4 rounded-xl border", bgColor, borderColor, className)}>
      <div className={cn("p-2 rounded-lg shrink-0", iconBg)}>
        <Icon className={cn("w-5 h-5", textColor)} />
      </div>
      <p className={cn("text-sm leading-relaxed", textColor)}>{message}</p>
    </div>
  )
}
