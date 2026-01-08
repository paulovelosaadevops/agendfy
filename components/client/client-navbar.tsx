"use client"

import Link from "next/link"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import Image from "next/image"

export function ClientNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const professionalId = searchParams.get("professional")
  const loginUrl = professionalId ? `/login?from=client` : `/login?from=client`

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-primary/20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/cliente" className="flex items-center gap-2 group">
            <div className="relative w-[400px] h-[125px] group-hover:scale-105 transition-transform duration-300">
              <Image src="/agendfy-logo.png" alt="AgendFy" fill className="object-contain" priority />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-lg border border-primary/10">
              <Link href="/">
                <Button
                  size="sm"
                  className={
                    pathname === "/"
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-transparent hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                  }
                  variant={pathname === "/" ? "default" : "ghost"}
                >
                  Sou profissional
                </Button>
              </Link>
              <Link href="/cliente">
                <Button
                  size="sm"
                  className={
                    pathname === "/cliente"
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                      : "bg-transparent hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                  }
                  variant={pathname === "/cliente" ? "default" : "ghost"}
                >
                  Sou cliente
                </Button>
              </Link>
            </div>

            <Link href={loginUrl}>
              <Button variant="ghost" className="hover:bg-primary/10 text-foreground">
                Entrar
              </Button>
            </Link>
          </div>

          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-accent rounded-lg transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-border/50">
            <div className="space-y-3">
              <div className="space-y-2 p-2 bg-muted/30 rounded-lg border border-primary/10">
                <Link href="/" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    size="default"
                    className={
                      pathname === "/"
                        ? "w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                        : "w-full bg-transparent hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                    }
                    variant={pathname === "/" ? "default" : "ghost"}
                  >
                    Sou profissional
                  </Button>
                </Link>
                <Link href="/cliente" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    size="default"
                    className={
                      pathname === "/cliente"
                        ? "w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20"
                        : "w-full bg-transparent hover:bg-primary/10 text-muted-foreground hover:text-foreground"
                    }
                    variant={pathname === "/cliente" ? "default" : "ghost"}
                  >
                    Sou cliente
                  </Button>
                </Link>
              </div>

              <Link href={loginUrl} onClick={() => setIsMenuOpen(false)}>
                <Button variant="ghost" className="w-full justify-start hover:bg-primary/10">
                  Entrar
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
