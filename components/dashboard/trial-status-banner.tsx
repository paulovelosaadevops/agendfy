"use client"

import { useAuth } from "@/contexts/auth-context"
import { Card } from "@/components/ui/card"
import { Clock, Sparkles } from "lucide-react"
import { useEffect, useState } from "react"

export function TrialStatusBanner() {
  const { userData } = useAuth()
  const [daysLeft, setDaysLeft] = useState<number>(0)
  const [hoursLeft, setHoursLeft] = useState<number>(0)

  useEffect(() => {
    if (userData?.trial?.active && userData.trial.endsAt) {
      const calculateTimeLeft = () => {
        const now = new Date()
        const end = new Date(userData.trial!.endsAt)
        const diff = end.getTime() - now.getTime()

        if (diff > 0) {
          const days = Math.floor(diff / (1000 * 60 * 60 * 24))
          const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
          setDaysLeft(days)
          setHoursLeft(hours)
        } else {
          setDaysLeft(0)
          setHoursLeft(0)
        }
      }

      calculateTimeLeft()
      const interval = setInterval(calculateTimeLeft, 1000 * 60)

      return () => clearInterval(interval)
    }
  }, [userData])

  if (!userData?.trial?.active || userData.subscriptionStatus !== "premium_trial") {
    return null
  }

  return (
    <Card className="bg-gradient-to-r from-blue-500/10 via-blue-600/10 to-blue-700/10 border-blue-500/30 p-4">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/20 rounded-lg">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-semibold text-foreground">Premium Trial Ativo</h4>
            <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs font-medium rounded-full">PREMIUM</span>
          </div>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="w-3 h-3 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {daysLeft > 0 ? (
                <>
                  Expira em{" "}
                  <span className="font-bold text-primary">
                    {daysLeft} dia{daysLeft !== 1 ? "s" : ""}
                  </span>{" "}
                  e <span className="font-bold text-primary">{hoursLeft}h</span>
                </>
              ) : hoursLeft > 0 ? (
                <>
                  Expira em{" "}
                  <span className="font-bold text-primary">
                    {hoursLeft} hora{hoursLeft !== 1 ? "s" : ""}
                  </span>
                </>
              ) : (
                <span className="font-bold text-yellow-500">Expirando em breve!</span>
              )}
            </p>
          </div>
        </div>
      </div>
    </Card>
  )
}
