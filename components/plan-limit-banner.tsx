"use client"

import { Crown, Lock, AlertTriangle, Sparkles } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface PlanLimitBannerProps {
  currentCount: number
  maxCount: number
  resourceName: string
  resourceNamePlural?: string
  showUpgradeCard?: boolean
  className?: string
}

export function PlanLimitBanner({
  currentCount,
  maxCount,
  resourceName,
  resourceNamePlural,
  showUpgradeCard = true,
  className,
}: PlanLimitBannerProps) {
  const isAtLimit = currentCount >= maxCount
  const isNearLimit = currentCount >= maxCount * 0.8
  const percentage = Math.min((currentCount / maxCount) * 100, 100)
  const plural = resourceNamePlural || `${resourceName}s`

  return (
    <div className={cn("space-y-4", className)}>
      {/* Usage Counter Badge */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className={cn(
              "px-3 py-1.5 text-sm font-medium",
              isAtLimit
                ? "bg-destructive/10 text-destructive border-destructive/20"
                : isNearLimit
                  ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                  : "bg-muted text-muted-foreground border-border",
            )}
          >
            {isAtLimit ? (
              <Lock className="w-3.5 h-3.5 mr-1.5" />
            ) : isNearLimit ? (
              <AlertTriangle className="w-3.5 h-3.5 mr-1.5" />
            ) : null}
            {currentCount}/{maxCount} {currentCount === 1 ? resourceName : plural}
          </Badge>

          <Badge variant="outline" className="bg-muted/50 text-muted-foreground border-border text-xs">
            Plano Free
          </Badge>
        </div>

        {!isAtLimit && (
          <span className="text-xs text-muted-foreground">
            {maxCount - currentCount} {maxCount - currentCount === 1 ? "restante" : "restantes"}
          </span>
        )}
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress
          value={percentage}
          className={cn(
            "h-2",
            isAtLimit ? "[&>div]:bg-destructive" : isNearLimit ? "[&>div]:bg-amber-500" : "[&>div]:bg-primary",
          )}
        />
      </div>

      {/* Limit Reached Card */}
      {isAtLimit && showUpgradeCard && (
        <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/20 p-5">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="p-3 bg-amber-500/20 rounded-xl">
              <Crown className="w-6 h-6 text-amber-400" />
            </div>
            <div className="flex-1 space-y-1">
              <h4 className="font-semibold text-foreground">Limite de {plural} atingido</h4>
              <p className="text-sm text-muted-foreground">
                Faça upgrade para o plano Premium e tenha {plural} ilimitados, além de visualizações de semana e mês na
                agenda.
              </p>
            </div>
            <Button
              asChild
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/20 w-full sm:w-auto"
            >
              <Link href="/dashboard?upgrade=true">
                <Sparkles className="w-4 h-4 mr-2" />
                Fazer Upgrade
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Near Limit Warning */}
      {isNearLimit && !isAtLimit && (
        <Card className="bg-amber-500/5 border-amber-500/20 p-4">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />
            <p className="text-sm text-muted-foreground">
              Você está perto do limite do plano Free.
              <Link href="/dashboard?upgrade=true" className="text-amber-400 hover:text-amber-300 ml-1 font-medium">
                Considere fazer upgrade
              </Link>
            </p>
          </div>
        </Card>
      )}
    </div>
  )
}

// Compact version for inline use
export function PlanLimitIndicator({
  currentCount,
  maxCount,
  resourceName,
}: {
  currentCount: number
  maxCount: number
  resourceName: string
}) {
  const isAtLimit = currentCount >= maxCount
  const isNearLimit = currentCount >= maxCount * 0.8

  return (
    <Badge
      variant="secondary"
      className={cn(
        "text-xs",
        isAtLimit
          ? "bg-destructive/10 text-destructive border-destructive/20"
          : isNearLimit
            ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
            : "bg-muted text-muted-foreground border-border",
      )}
    >
      {isAtLimit && <Lock className="w-3 h-3 mr-1" />}
      {currentCount}/{maxCount} {resourceName}
    </Badge>
  )
}
