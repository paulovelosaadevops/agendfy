"use client"

import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  variant?: "default" | "primary" | "success" | "warning"
}

const variantStyles = {
  default: "bg-card border-border",
  primary: "bg-gradient-to-br from-blue-500/10 to-blue-600/10 border-blue-500/20",
  success: "bg-gradient-to-br from-emerald-500/10 to-green-500/10 border-emerald-500/20",
  warning: "bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20",
}

const iconVariantStyles = {
  default: "bg-muted",
  primary: "bg-primary/20",
  success: "bg-emerald-500/20",
  warning: "bg-amber-500/20",
}

const iconColorStyles = {
  default: "text-muted-foreground",
  primary: "text-primary",
  success: "text-emerald-400",
  warning: "text-amber-400",
}

export function StatCard({ title, value, subtitle, icon: Icon, trend, variant = "default" }: StatCardProps) {
  return (
    <Card className={cn("p-6 transition-all duration-200", variantStyles[variant])}>
      <div className="flex items-start justify-between">
        <div className="space-y-2 flex-1">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground tracking-tight">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className={cn("text-xs font-medium", trend.value >= 0 ? "text-emerald-400" : "text-red-400")}>
                {trend.value >= 0 ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl transition-colors", iconVariantStyles[variant])}>
          <Icon className={cn("w-6 h-6", iconColorStyles[variant])} />
        </div>
      </div>
    </Card>
  )
}
