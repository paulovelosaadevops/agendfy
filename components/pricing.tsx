import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check, X, Sparkles } from "lucide-react"
import Link from "next/link"

export function Pricing() {
  const plans = [
    {
      name: "Plano Free",
      price: "R$ 0",
      period: "",
      description: "Ideal para começar",
      badge: null,
      features: [
        { text: "Agendamentos básicos", included: true },
        { text: "Cadastro de clientes", included: true },
        { text: "Agenda diária", included: true },
        { text: "Comunicação automática via WhatsApp", included: false },
        { text: "Relatórios financeiros", included: false },
        { text: "Personalização avançada", included: false },
      ],
      cta: "Começar grátis",
      ctaLink: "/register/profissional", // Updated ctaLink to use /register/profissional route
      highlighted: false,
    },
    {
      name: "Plano Premium",
      price: "R$ 9,90",
      period: "/ mês",
      description: "Ideal para crescer",
      badge: "Mais popular",
      features: [
        { text: "Agendamentos ilimitados", included: true },
        { text: "Comunicação via WhatsApp", included: true },
        { text: "Confirmação e lembretes automáticos", included: true },
        { text: "Gestão financeira", included: true },
        { text: "Relatórios e métricas", included: true },
        { text: "Suporte prioritário", included: true },
      ],
      cta: "Assinatura Premium",
      ctaLink: "/register/profissional", // Updated ctaLink to use /register/profissional route
      highlighted: true,
    },
  ]

  return (
    <section className="relative py-16 sm:py-24 lg:py-32 bg-secondary/30">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[150px]" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-12 sm:space-y-16">
          {/* Section header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
              Escolha o plano ideal para <span className="text-gradient">o seu negócio</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty leading-relaxed">
              Compare os recursos e comece grátis por 3 dias.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {plans.map((plan, index) => (
              <Card
                key={index}
                className={`relative p-6 sm:p-8 backdrop-blur-sm transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-card/80 border-primary/50 glow-purple-sm hover:glow-purple scale-105"
                    : "bg-card/50 border-primary/20 hover:border-primary/30"
                }`}
              >
                {/* Badge for popular plan */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                      <Sparkles className="w-3.5 h-3.5" />
                      {plan.badge}
                    </div>
                  </div>
                )}

                <div className="space-y-6">
                  {/* Plan header */}
                  <div className="space-y-4 text-center md:text-left">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground">{plan.name}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
                    </div>
                    <div className="flex items-baseline justify-center md:justify-start gap-2">
                      <span className="text-4xl sm:text-5xl font-bold text-foreground">{plan.price}</span>
                      {plan.period && <span className="text-muted-foreground">{plan.period}</span>}
                    </div>
                  </div>

                  {/* Features list */}
                  <ul className="space-y-4 py-6">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        {feature.included ? (
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="w-5 h-5 text-muted-foreground/50 flex-shrink-0 mt-0.5" />
                        )}
                        <span className={feature.included ? "text-foreground" : "text-muted-foreground line-through"}>
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.ctaLink}>
                    <Button
                      size="lg"
                      className={`w-full py-6 text-base transition-all duration-300 ${
                        plan.highlighted
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground glow-purple-sm hover:glow-purple"
                          : "bg-secondary hover:bg-secondary/80 text-foreground border border-primary/20"
                      }`}
                    >
                      {plan.cta}
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>

          {/* Trial highlight */}
          <div className="text-center pt-4">
            <p className="text-muted-foreground">
              Teste grátis por <span className="text-primary font-semibold">3 dias</span>, sem cartão de crédito
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
