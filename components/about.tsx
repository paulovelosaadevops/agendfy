import { Card } from "@/components/ui/card"
import { Clock, Zap, Shield, TrendingUp } from "lucide-react"

export function About() {
  return (
    <section className="relative py-16 sm:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
          {/* Section header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
              O que é o <span className="text-gradient">AgendFy</span>?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              Uma plataforma completa que centraliza agendamentos, comunicação e gestão do seu negócio em um único
              lugar. Simples, poderoso e feito para profissionais que valorizam seu tempo.
            </p>
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Clock className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Automação Total</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Agendamentos automáticos 24/7, lembretes inteligentes e confirmações instantâneas
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Integração Simples</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Conecte com suas ferramentas favoritas e sincronize tudo em tempo real
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Segurança Premium</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Seus dados protegidos com criptografia de ponta e conformidade total com LGPD
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
              <div className="space-y-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground">Análises Inteligentes</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Dashboards completos com insights que impulsionam o crescimento do seu negócio
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </section>
  )
}
