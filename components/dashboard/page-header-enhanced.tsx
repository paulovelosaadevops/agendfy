import type React from "react"
import type { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface PageHeaderEnhancedProps {
  title: string
  description?: string
  icon?: LucideIcon
  action?: React.ReactNode
  badge?: React.ReactNode
  className?: string
}

export function PageHeaderEnhanced({
  title,
  description,
  icon: Icon,
  action,
  badge,
  className,
}: PageHeaderEnhancedProps) {
  return (
    <div className={cn("flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between", className)}>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className="p-2.5 bg-primary/10 rounded-xl">
              <Icon className="w-7 h-7 text-primary" />
            </div>
          )}
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">{title}</h1>
              {badge}
            </div>
            {description && <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">{description}</p>}
          </div>
        </div>
      </div>
      {action && <div className="flex items-center">{action}</div>}
    </div>
  )
}
