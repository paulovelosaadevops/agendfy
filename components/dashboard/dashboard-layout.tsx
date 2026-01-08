"use client"

import type React from "react"

import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/dashboard/app-sidebar"
import { Button } from "@/components/ui/button"
import { LogOut, User } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { Separator } from "@/components/ui/separator"
import { TrialStatusBanner } from "@/components/dashboard/trial-status-banner"
import { ExcessResourcesBanner } from "@/components/dashboard/excess-resources-banner"

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { logout, user } = useAuth()
  const router = useRouter()

  async function handleLogout() {
    try {
      await logout()
      router.push("/")
    } catch (error) {
      console.error("[v0] Logout error:", error)
    }
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-14 md:h-16 shrink-0 items-center gap-2 border-b border-border bg-card/50 backdrop-blur-sm px-3 md:px-4 sticky top-0 z-10">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4 bg-border" />
          <div className="flex flex-1 items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <span className="text-base md:text-lg font-bold text-primary">A</span>
              </div>
              <div className="hidden xs:block">
                <h1 className="text-sm font-semibold text-foreground">AgendFy</h1>
                <p className="text-xs text-muted-foreground">Gestão Profissional</p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg border border-border">
                <User className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-sm text-foreground truncate max-w-[150px] lg:max-w-none">{user?.email}</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                className="border-border hover:bg-secondary bg-transparent h-9 px-3"
              >
                <LogOut className="h-4 w-4 md:mr-2" />
                <span className="hidden md:inline">Sair</span>
              </Button>
            </div>
          </div>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 md:p-6 bg-background min-h-screen">
          {user?.role === "professional" && <TrialStatusBanner />}
          {user?.role === "professional" && <ExcessResourcesBanner />}
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
