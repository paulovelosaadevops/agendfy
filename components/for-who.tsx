import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Scissors, Stethoscope, Dumbbell, Briefcase, GraduationCap, Sparkles } from "lucide-react"

export function ForWho() {
  const whatsappLink =
    "https://wa.me/5511966107578?text=Ol%C3%A1%21%20N%C3%A3o%20encontrei%20meu%20segmento%20no%20site%20do%20AgendFy.%20Poderia%20me%20ajudar%3F"

  const audiences = [
    {
      icon: Scissors,
      title: "Salões e Barbearias",
      description: "Controle completo de horários, profissionais e serviços",
    },
    {
      icon: Stethoscope,
      title: "Clínicas e Consultórios",
      description: "Gestão profissional de pacientes e prontuários",
    },
    {
      icon: Dumbbell,
      title: "Academias e Studios",
      description: "Agendamento de aulas e personal trainers",
    },
    {
      icon: Briefcase,
      title: "Consultores",
      description: "Organize suas reuniões e mentorias",
    },
    {
      icon: GraduationCap,
      title: "Professores",
      description: "Agende aulas particulares com facilidade",
    },
    {
      icon: Sparkles,
      title: "E muito mais",
      description: "Qualquer negócio que trabalha com agendamentos",
    },
  ]

  return (
    <section className="relative py-16 sm:py-24 lg:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12 sm:space-y-16">
          {/* Section header */}
          <div className="text-center space-y-4">
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-balance">
              Para quem é o <span className="text-gradient">AgendFy</span>?
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-pretty leading-relaxed">
              Profissionais e empresas que buscam organização, eficiência e crescimento
            </p>
          </div>

          {/* Audience grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {audiences.map((audience, index) => (
              <Card
                key={index}
                className="p-6 bg-card/50 backdrop-blur-sm border-primary/20 hover:border-primary/40 transition-all duration-300 hover:glow-purple-sm group cursor-pointer"
              >
                <div className="space-y-4">
                  <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <audience.icon className="w-7 h-7 text-primary" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold text-foreground">{audience.title}</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">{audience.description}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Bottom CTA */}
          <div className="text-center pt-8 sm:pt-12">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 border border-primary/30">
              <div className="space-y-2 text-center sm:text-left">
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground">Não encontrou seu segmento?</h3>
                <p className="text-muted-foreground">
                  O AgendFy se adapta a qualquer tipo de negócio que trabalha com agendamentos
                </p>
              </div>
              <Button
                size="lg"
                className="whitespace-nowrap bg-primary hover:bg-primary/90 text-primary-foreground glow-purple-sm hover:glow-purple transition-all duration-300"
                asChild
              >
                <a href={whatsappLink} target="_blank" rel="noopener noreferrer">
                  Falar com especialista
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
