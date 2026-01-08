import { Button } from "@/components/ui/button"
import { Calendar, Sparkles } from "lucide-react"
import Link from "next/link"

export function Hero() {
  const whatsappLink =
    "https://wa.me/5511966107578?text=Ol%C3%A1%21%20Vim%20pelo%20site%20do%20AgendFy%20e%20gostaria%20de%20tirar%20algumas%20d%C3%BAvidas%20sobre%20a%20plataforma."

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-16 sm:pt-20">
      {/* Background effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-[120px] animate-pulse" />
      <div
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-[120px] animate-pulse"
        style={{ animationDelay: "1s" }}
      />

      <div className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-5xl mx-auto text-center space-y-6 sm:space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-primary/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm sm:text-base text-foreground">Gestão profissional de agendamentos</span>
          </div>

          {/* Main headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight text-balance">
            Transforme sua
            <span className="block text-gradient">agenda em resultados</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
            O AgendFy revoluciona a forma como você gerencia seu tempo. Agendamentos inteligentes, organização eficiente
            e comunicação que realmente funciona.
          </p>

          {/* Updated CTA buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 sm:pt-8">
            <Link href="/register/profissional">
              <Button
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 glow-purple-sm hover:glow-purple transition-all duration-300 bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Calendar className="w-5 h-5 mr-2" />
                Começar grátis
              </Button>
            </Link>
            <a href="#about">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-5 sm:py-6 border-primary/30 hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 bg-transparent"
              >
                Ver demonstração
              </Button>
            </a>
          </div>

          {/* Trust indicators */}
          <div className="pt-8 sm:pt-12 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Sem cartão de crédito</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Configuração em 5 minutos</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span>Suporte em português</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  )
}
