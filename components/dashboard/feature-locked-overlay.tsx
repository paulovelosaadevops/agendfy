"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Lock, Sparkles, ArrowLeft } from "lucide-react"
import { useState } from "react"
import { UpgradePromptModal } from "./upgrade-prompt-modal"
import { useRouter } from "next/navigation"

interface FeatureLockedOverlayProps {
  featureName: string
  description: string
}

export function FeatureLockedOverlay({ featureName, description }: FeatureLockedOverlayProps) {
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const router = useRouter()

  return (
    <>
      <div className="min-h-[60vh] flex flex-col">
        {/* Mobile back button */}
        <div className="md:hidden mb-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground min-h-[44px] -ml-2"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Voltar</span>
          </Button>
        </div>

        <div className="flex-1 flex items-center justify-center">
          <Card className="bg-card border-border p-6 md:p-8 max-w-md mx-4 text-center">
            <div className="p-4 bg-primary/10 rounded-full w-fit mx-auto mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold text-foreground mb-2">{featureName}</h3>
            <p className="text-muted-foreground mb-6 text-sm md:text-base">{description}</p>

            <div className="space-y-3">
              <Button
                onClick={() => setShowUpgradeModal(true)}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 w-full min-h-[48px] md:min-h-[44px] text-base"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Fazer Upgrade para Premium
              </Button>

              {/* Mobile-friendly back button */}
              <Button
                variant="outline"
                onClick={() => router.back()}
                className="w-full border-border min-h-[48px] md:min-h-[44px] text-base md:hidden"
              >
                Voltar ao Dashboard
              </Button>
            </div>
          </Card>
        </div>
      </div>

      <UpgradePromptModal open={showUpgradeModal} onClose={() => setShowUpgradeModal(false)} feature={featureName} />
    </>
  )
}
