import { Card } from "@/components/ui/card"
import { CalendarCheck, MessageSquare, BarChart3, Users } from "lucide-react"

export function Benefits() {
  const benefits = [
    {
      icon: CalendarCheck,
      title: "Agenda Inteligente",
      description: "Sistema de agendamento que se adapta à sua rotina e evita conflitos automaticamente",
      features: [
        "Calendário sincronizado em tempo real",
        "Bloqueio automático de horários",
        "Reagendamento em um clique",
        "Múltiplos profissionais e serviços",
      ],
    },
    {
      icon: MessageSquare,
      title: "Comunicação Eficiente",
      description: "Mantenha seus clientes sempre informados com notificações automáticas e personalizadas",
      features: [
        "Lembretes por SMS e WhatsApp",
        "Confirmações automáticas",
        "Mensagens personalizáveis",
        "Histórico completo de conversas",
      ],
    },
    {
      icon: BarChart3,
      title: "Gestão Completa",
      description: "Tenha controle total do seu negócio com relatórios e métricas em tempo real",
      features: [
        "Dashboard com métricas-chave",
        "Relatórios de faturamento",
        "Análise de performance",
        "Exportação de dados",
      ],
    },
    {
      icon: Users,
      title: "Experiência do Cliente",
      description: "Ofereça uma jornada premium desde o primeiro contato até o pós-atendimento",
      features: [
        "Portal exclusivo do cliente",
        "Histórico de atendimentos",
        "Avaliações e feedback",
        "Programa de fidelidade",
      ],
    },
  ]

  return (
    <section className="relative py-16 sm:py-24 lg:py-32 bg-secondary/30">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />

      <div className="relative container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
          {/* Section header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
              Benefícios que <span className="text-gradient">fazem a diferença</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              Descubra como o AgendFy pode transformar a operação do seu negócio
            </p>
          </div>

          {/* Benefits grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            {benefits.map((benefit, index) => (
              <Card
                key={index}
                className="p-6 sm:p-8 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
              >
                <div className="space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <benefit.icon className="w-7 h-7 text-primary" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-2xl font-semibold text-foreground">{benefit.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>

                  <ul className="space-y-3 pl-0">
                    {benefit.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-foreground/80">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
