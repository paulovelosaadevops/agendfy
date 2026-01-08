"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, X } from "lucide-react"
import { checkExcessResources, markTransitionNotificationAsSeen } from "@/lib/utils/plan-transition"
import Link from "next/link"

export function ExcessResourcesBanner() {
  const { user } = useAuth()
  const [excessInfo, setExcessInfo] = useState<{
    hasExcess: boolean
    excessServices: number
    excessClients: number
    message: string
  } | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    async function checkExcess() {
      if (!user?.uid || user.role !== "professional") return

      const alreadyNotified = user.planTransition?.notified
      if (alreadyNotified) {
        setDismissed(true)
        return
      }

      const info = await checkExcessResources(user.uid, user)
      setExcessInfo(info)
    }

    checkExcess()
  }, [user])

  async function handleDismiss() {
    if (!user?.uid) return
    setDismissed(true)
    await markTransitionNotificationAsSeen(user.uid)
  }

  if (!excessInfo?.hasExcess || dismissed) return null

  return (
    <Card className="bg-warning/10 border-warning/30 p-4 shadow-lg relative">
      <Button variant="ghost" size="sm" className="absolute top-2 right-2 h-8 w-8 p-0" onClick={handleDismiss}>
        <X className="h-4 w-4" />
      </Button>

      <div className="flex items-start gap-4 pr-8">
        <div className="p-2 bg-warning/20 rounded-lg">
          <AlertTriangle className="w-6 h-6 text-warning" />
        </div>
        <div className="flex-1 space-y-2">
          <h3 className="font-semibold text-foreground">Trial expirado - Recursos excedentes</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{excessInfo.message}</p>
          <div className="flex gap-3 pt-2">
            {excessInfo.excessServices > 0 && (
              <Link href="/dashboard/services">
                <Button variant="outline" size="sm" className="border-warning/30 hover:bg-warning/10 bg-transparent">
                  Gerenciar Serviços
                </Button>
              </Link>
            )}
            <Link href="/dashboard/subscription">
              <Button size="sm" className="bg-primary hover:bg-primary/90">
                Fazer Upgrade
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}
