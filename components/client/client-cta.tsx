import { Button } from "@/components/ui/button"
import { Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

export function ClientCTA() {
  return (
    <section className="relative py-20 sm:py-32 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background -z-10" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-96 bg-primary/10 rounded-full blur-3xl -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Heading */}
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">
            Pronto para nunca mais perder um <span className="text-gradient">agendamento?</span>
          </h2>

          {/* Description */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
            Junte-se a milhares de pessoas que já descobriram a forma mais fácil de agendar serviços
          </p>

          {/* CTA Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Button size="lg" className="w-full sm:w-auto text-base px-8 h-12 group" asChild>
              <Link href="/register/cliente">
                <Calendar className="w-5 h-5 mr-2" />
                Começar agora
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </Button>
          </div>

          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-8 pt-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">100%</div>
              <div className="text-sm text-muted-foreground">Grátis</div>
            </div>
            <div className="h-12 w-px bg-border/50" />
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">Instantâneo</div>
              <div className="text-sm text-muted-foreground">Confirmação</div>
            </div>
            <div className="h-12 w-px bg-border/50" />
            <div className="text-center">
              <div className="text-3xl font-bold text-gradient">24/7</div>
              <div className="text-sm text-muted-foreground">Disponível</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
