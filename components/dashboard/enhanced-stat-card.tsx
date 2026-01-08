import { Card } from "@/components/ui/card"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface EnhancedStatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  variant?: "default" | "primary" | "success" | "warning" | "info"
  trend?: {
    value: number
    label: string
  }
  className?: string
}

const variantStyles = {
  default: {
    card: "bg-card border-border hover:border-border/60",
    iconBg: "bg-muted",
    iconColor: "text-muted-foreground",
    valueColor: "text-foreground",
  },
  primary: {
    card: "bg-card border-primary/20 hover:border-primary/30",
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    valueColor: "text-foreground",
  },
  success: {
    card: "bg-card border-success/20 hover:border-success/30",
    iconBg: "bg-success/10",
    iconColor: "text-success",
    valueColor: "text-foreground",
  },
  warning: {
    card: "bg-card border-warning/20 hover:border-warning/30",
    iconBg: "bg-warning/10",
    iconColor: "text-warning",
    valueColor: "text-foreground",
  },
  info: {
    card: "bg-card border-info/20 hover:border-info/30",
    iconBg: "bg-info/10",
    iconColor: "text-info",
    valueColor: "text-foreground",
  },
}

export function EnhancedStatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  trend,
  className,
}: EnhancedStatCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card
      className={cn(
        "group p-6 transition-all duration-300 hover:shadow-lg hover:shadow-black/10",
        styles.card,
        className,
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className={cn("text-3xl font-bold tracking-tight", styles.valueColor)}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <div className="flex items-center gap-1.5 pt-1">
              <span className={cn("text-xs font-medium", trend.value >= 0 ? "text-success" : "text-destructive")}>
                {trend.value >= 0 ? "+" : ""}
                {trend.value}%
              </span>
              <span className="text-xs text-muted-foreground">{trend.label}</span>
            </div>
          )}
        </div>
        <div className={cn("p-3 rounded-xl transition-transform duration-300 group-hover:scale-110", styles.iconBg)}>
          <Icon className={cn("w-6 h-6", styles.iconColor)} />
        </div>
      </div>
    </Card>
  )
}
