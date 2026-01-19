"use client"

import { Button } from "@/components/ui/button"
import { LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"
import { ThemeToggle } from "@/components/theme-toggle"
import Image from "next/image"

export function Navbar() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  async function handleLogout() {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-primary/10 bg-background/80 backdrop-blur-xl">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="relative w-[140px] h-[44px] sm:w-[180px] sm:h-[56px] md:w-[220px] md:h-[69px] lg:w-[280px] lg:h-[88px] group-hover:scale-105 transition-transform duration-300">
              <Image src="/agendfy-logo.png" alt="AgendFy" fill className="object-contain" priority />
            </div>
          </Link>

          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />

            {user ? (
              <>
                <Link href="/dashboard">
                  <Button
                    variant="outline"
                    className="border-primary/20 hover:bg-primary/10 hover:border-primary/30 bg-transparent backdrop-blur-sm"
                  >
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  onClick={handleLogout}
                  className="border-primary/20 hover:bg-primary/10 hover:border-primary/30 bg-transparent"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </>
            ) : (
              <>
                <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-xl border border-primary/10 backdrop-blur-sm">
                  <Link href="/">
                    <Button
                      size="sm"
                      className={
                        pathname === "/"
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-lg"
                          : "bg-transparent hover:bg-primary/10 text-muted-foreground hover:text-foreground rounded-lg"
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
                          ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-lg"
                          : "bg-transparent hover:bg-primary/10 text-muted-foreground hover:text-foreground rounded-lg"
                      }
                      variant={pathname === "/cliente" ? "default" : "ghost"}
                    >
                      Sou cliente
                    </Button>
                  </Link>
                </div>

                <Link href="/login?from=professional">
                  <Button variant="ghost" className="hover:bg-primary/10 text-foreground rounded-xl">
                    Entrar
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center gap-2 md:hidden flex-shrink-0">
            <ThemeToggle />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 hover:bg-accent rounded-xl transition-colors"
              aria-label="Menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden pb-4 pt-2 border-t border-border/50">
            {user ? (
              <div className="space-y-2">
                <Link href="/dashboard" onClick={() => setIsMenuOpen(false)}>
                  <Button variant="ghost" className="w-full justify-start hover:bg-primary/10 rounded-xl">
                    Dashboard
                  </Button>
                </Link>
                <Button
                  variant="ghost"
                  onClick={() => {
                    handleLogout()
                    setIsMenuOpen(false)
                  }}
                  className="w-full justify-start hover:bg-primary/10 rounded-xl"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="space-y-2 p-2 bg-muted/30 rounded-xl border border-primary/10">
                  <Link href="/" onClick={() => setIsMenuOpen(false)}>
                    <Button
                      size="default"
                      className={
                        pathname === "/"
                          ? "w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl"
                          : "w-full bg-transparent hover:bg-primary/10 text-muted-foreground hover:text-foreground rounded-xl"
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
                          ? "w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 rounded-xl"
                          : "w-full bg-transparent hover:bg-primary/10 text-muted-foreground hover:text-foreground rounded-xl"
                      }
                      variant={pathname === "/cliente" ? "default" : "ghost"}
                    >
                      Sou cliente
                    </Button>
                  </Link>
                </div>

                <Link href="/login?from=professional" onClick={() => setIsMenuOpen(false)}>
                  <Button
                    variant="ghost"
                    className="w-full justify-start hover:bg-primary/10 text-foreground rounded-xl"
                  >
                    Entrar
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
