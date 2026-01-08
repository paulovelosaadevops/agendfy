import Link from "next/link"
import { Calendar, Instagram, MessageCircle } from "lucide-react"

export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="relative border-t border-border/50 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12 mb-12">
            {/* Brand */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <span className="text-xl font-bold text-gradient">AgendFy</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                A plataforma completa para gestão profissional de agendamentos
              </p>
              <div className="flex items-center gap-3 pt-2">
                <a
                  href="https://instagram.com/agendfy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="h-4 w-4 text-muted-foreground" />
                </a>
                <a
                  href="https://wa.me/5511999999999"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-9 w-9 rounded-lg bg-muted/50 hover:bg-primary/20 flex items-center justify-center transition-colors"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                </a>
              </div>
            </div>

            {/* Produto */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Produto</h3>
              <ul className="space-y-3">
                <li>
                  <Link
                    href="/#funcionalidades"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Funcionalidades
                  </Link>
                </li>
                <li>
                  <Link href="/#precos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Preços
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#como-funciona"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Como funciona
                  </Link>
                </li>
                <li>
                  <Link
                    href="/#depoimentos"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Depoimentos
                  </Link>
                </li>
              </ul>
            </div>

            {/* Conta */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Conta</h3>
              <ul className="space-y-3">
                <li>
                  <Link href="/login" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Entrar
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Criar conta
                  </Link>
                </li>
                <li>
                  <Link
                    href="/register/profissional"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Sou profissional
                  </Link>
                </li>
                <li>
                  <Link
                    href="/reset-password"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    Recuperar senha
                  </Link>
                </li>
              </ul>
            </div>

            {/* Suporte */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider">Suporte</h3>
              <ul className="space-y-3">
                <li>
                  <a
                    href="mailto:suporte@agendfy.com.br"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    suporte@agendfy.com.br
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/5511999999999"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    WhatsApp
                  </a>
                </li>
                <li>
                  <Link href="/#faq" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                    Perguntas frequentes
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground text-center sm:text-left">
              © {currentYear} AgendFy. Todos os direitos reservados.
            </p>
            <div className="flex items-center gap-6">
              <Link href="/privacidade" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Privacidade
              </Link>
              <Link href="/termos" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                Termos de uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
