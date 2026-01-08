import Link from "next/link"
import { ArrowLeft, Calendar, FileText } from "lucide-react"

export default function TermosPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary" />
              </div>
              <span className="text-xl font-bold">AgendFy</span>
            </Link>
            <Link href="/" className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-2">
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileText className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Termos de Uso</h1>
            <p className="text-muted-foreground">Última atualização: Dezembro 2025</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Aceitação dos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Ao acessar e usar o AgendFy, você concorda em cumprir e estar vinculado a estes Termos de Uso. Se você não
              concordar com qualquer parte destes termos, não poderá acessar o serviço.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. Descrição do Serviço</h2>
            <p className="text-muted-foreground leading-relaxed">
              O AgendFy é uma plataforma de gestão de agendamentos que permite que profissionais gerenciem sua agenda e
              que clientes agendem serviços de forma online.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. Conta de Usuário</h2>
            <p className="text-muted-foreground leading-relaxed">
              Você é responsável por manter a confidencialidade de sua conta e senha. Concorda em notificar-nos
              imediatamente sobre qualquer uso não autorizado de sua conta.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. Planos e Pagamentos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Oferecemos planos gratuitos e pagos. Os pagamentos são processados de forma segura através do Stripe.
              Assinaturas são renovadas automaticamente até serem canceladas.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">5. Cancelamento</h2>
            <p className="text-muted-foreground leading-relaxed">
              Você pode cancelar sua assinatura a qualquer momento. O acesso aos recursos premium continuará até o final
              do período já pago. Não oferecemos reembolsos por períodos parciais.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">6. Uso Aceitável</h2>
            <p className="text-muted-foreground leading-relaxed">
              Você concorda em não usar o serviço para fins ilegais, não enviar spam, não tentar acessar sistemas não
              autorizados e não interferir no funcionamento da plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">7. Limitação de Responsabilidade</h2>
            <p className="text-muted-foreground leading-relaxed">
              O AgendFy não será responsável por quaisquer danos indiretos, incidentais ou consequenciais decorrentes do
              uso ou impossibilidade de uso do serviço.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">8. Alterações nos Termos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Reservamo-nos o direito de modificar estes termos a qualquer momento. Notificaremos sobre alterações
              significativas por email ou através da plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">9. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Para dúvidas sobre estes Termos de Uso, entre em contato pelo email{" "}
              <a href="mailto:paulo.velosa@icloud.com" className="text-primary hover:underline">
                paulo.velosa@icloud.com
              </a>
            </p>
          </section>
        </div>
      </main>
    </div>
  )
}
