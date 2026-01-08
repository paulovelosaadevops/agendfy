import Link from "next/link"
import { ArrowLeft, Calendar, Shield } from "lucide-react"

export default function PrivacidadePage() {
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
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Política de Privacidade</h1>
            <p className="text-muted-foreground">Última atualização: Dezembro 2025</p>
          </div>
        </div>

        <div className="prose prose-invert max-w-none space-y-8">
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">1. Informações que coletamos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Coletamos informações que você nos fornece diretamente, como nome, email, telefone e dados do seu negócio
              ao criar uma conta. Também coletamos dados de uso do serviço para melhorar sua experiência.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">2. Como usamos suas informações</h2>
            <p className="text-muted-foreground leading-relaxed">
              Utilizamos suas informações para fornecer, manter e melhorar nossos serviços, processar transações, enviar
              notificações importantes e personalizar sua experiência na plataforma.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">3. Compartilhamento de dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Não vendemos suas informações pessoais. Compartilhamos dados apenas com provedores de serviços necessários
              para operar a plataforma (processamento de pagamentos, hospedagem, etc.) e quando exigido por lei.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">4. Segurança dos dados</h2>
            <p className="text-muted-foreground leading-relaxed">
              Implementamos medidas de segurança técnicas e organizacionais para proteger suas informações contra acesso
              não autorizado, alteração, divulgação ou destruição.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">5. Seus direitos</h2>
            <p className="text-muted-foreground leading-relaxed">
              Você tem direito de acessar, corrigir, excluir ou exportar seus dados pessoais a qualquer momento. Para
              exercer esses direitos, entre em contato conosco através do email paulo.velosa@icloud.com.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-foreground">6. Contato</h2>
            <p className="text-muted-foreground leading-relaxed">
              Se você tiver dúvidas sobre esta Política de Privacidade, entre em contato conosco pelo email{" "}
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
