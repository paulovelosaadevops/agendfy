import { Search, Calendar, MessageCircle, Clock } from "lucide-react"

const features = [
  {
    icon: Search,
    title: "Encontre profissionais",
    description: "Pesquise por categoria, localização ou nome. Descubra os melhores profissionais da sua região.",
  },
  {
    icon: Calendar,
    title: "Agende em segundos",
    description: "Escolha data e horário disponível. Confirmação instantânea direto no seu celular.",
  },
  {
    icon: MessageCircle,
    title: "Comunicação direta",
    description: "Fale com seu profissional via WhatsApp. Tire dúvidas e receba lembretes automáticos.",
  },
  {
    icon: Clock,
    title: "Gerencie seus horários",
    description: "Veja todos os seus agendamentos em um só lugar. Cancele ou reagende com facilidade.",
  },
]

export function ClientFeatures() {
  return (
    <section className="relative py-20 sm:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-balance">
              Tudo que você precisa para <span className="text-gradient">agendar melhor</span>
            </h2>
            <p className="text-lg text-muted-foreground text-pretty leading-relaxed">
              Uma plataforma simples e prática para você nunca mais perder um horário
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group relative p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
              >
                <div className="flex flex-col gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
