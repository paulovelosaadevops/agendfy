import { UserPlus, Search, Calendar, CheckCircle } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Crie sua conta",
    description: "Cadastro rápido e gratuito. Basta seu nome e WhatsApp.",
  },
  {
    icon: Search,
    title: "Encontre profissionais",
    description: "Busque por salões, clínicas, academias e muito mais.",
  },
  {
    icon: Calendar,
    title: "Escolha data e horário",
    description: "Veja os horários disponíveis e agende em segundos.",
  },
  {
    icon: CheckCircle,
    title: "Pronto!",
    description: "Receba confirmação e lembretes automáticos no WhatsApp.",
  },
]

export function ClientHowItWorks() {
  return (
    <section className="relative py-20 sm:py-32 bg-accent/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">Como funciona</h2>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
              Em 4 passos simples você está pronto para agendar
            </p>
          </div>

          {/* Steps */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="relative flex flex-col items-center text-center">
                {/* Connector line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-12 left-1/2 w-full h-0.5 bg-gradient-to-r from-primary/50 to-primary/20" />
                )}

                {/* Step number */}
                <div className="relative z-10 w-24 h-24 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mb-6">
                  <step.icon className="w-10 h-10 text-primary" />
                </div>

                {/* Content */}
                <div className="space-y-3">
                  <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold text-sm mb-2">
                    {index + 1}
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
