"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { XCircle } from "lucide-react"
import Link from "next/link"

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="bg-card border-border p-8 max-w-md w-full text-center">
        <div className="p-3 bg-muted rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <XCircle className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Pagamento cancelado</h2>
        <p className="text-muted-foreground mb-6">
          Você cancelou o processo de pagamento. Não se preocupe, você pode tentar novamente quando quiser.
        </p>
        <Link href="/dashboard/professional">
          <Button className="w-full bg-primary hover:bg-primary/90">Voltar ao Dashboard</Button>
        </Link>
      </Card>
    </div>
  )
}
