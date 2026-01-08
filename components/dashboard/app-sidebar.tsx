"use client"

import type React from "react"

import {
  LayoutDashboard,
  Clock,
  Briefcase,
  Users,
  DollarSign,
  Building2,
  Search,
  UserCircle,
  Sparkles,
  FileText,
  CreditCard,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar"
import { useAuth } from "@/contexts/auth-context"
import type { UserRole } from "@/types/auth"
import { useEffect, useState } from "react"
import { SupportButton } from "@/components/dashboard/support-button"
import { ThemeToggle } from "@/components/theme-toggle"

interface MenuItem {
  title: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  roles: UserRole[]
}

const menuItems: MenuItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard/professional",
    icon: LayoutDashboard,
    roles: ["professional"],
  },
  {
    title: "Agenda",
    href: "/dashboard/agenda",
    icon: Clock,
    roles: ["professional"],
  },
  {
    title: "Serviços",
    href: "/dashboard/services",
    icon: Briefcase,
    roles: ["professional"],
  },
  {
    title: "Clientes",
    href: "/dashboard/clients",
    icon: Users,
    roles: ["professional"],
  },
  {
    title: "Financeiro",
    href: "/dashboard/financial",
    icon: DollarSign,
    roles: ["professional"],
  },
  {
    title: "Meu negócio",
    href: "/dashboard/business",
    icon: Building2,
    roles: ["professional"],
  },
  {
    title: "Minha Assinatura",
    href: "/dashboard/subscription",
    icon: Sparkles,
    roles: ["professional"],
  },
  {
    title: "Dashboard",
    href: "/dashboard/client",
    icon: LayoutDashboard,
    roles: ["client"],
  },
  {
    title: "Meus agendamentos",
    href: "/dashboard/my-appointments",
    icon: Clock,
    roles: ["client"],
  },
  {
    title: "Encontrar profissionais",
    href: "/dashboard/search",
    icon: Search,
    roles: ["client"],
  },
  {
    title: "Perfil",
    href: "/dashboard/profile",
    icon: UserCircle,
    roles: ["client"],
  },
  {
    title: "Dashboard",
    href: "/dashboard/ceo",
    icon: LayoutDashboard,
    roles: ["ceo"],
  },
  {
    title: "Usuários",
    href: "/dashboard/ceo/users",
    icon: Users,
    roles: ["ceo"],
  },
  {
    title: "Profissionais",
    href: "/dashboard/ceo/professionals",
    icon: Building2,
    roles: ["ceo"],
  },
  {
    title: "Assinaturas",
    href: "/dashboard/ceo/subscriptions",
    icon: CreditCard,
    roles: ["ceo"],
  },
  {
    title: "Financeiro",
    href: "/dashboard/ceo/financial",
    icon: DollarSign,
    roles: ["ceo"],
  },
  {
    title: "Relatórios",
    href: "/dashboard/ceo/reports",
    icon: FileText,
    roles: ["ceo"],
  },
]

export function AppSidebar() {
  const { user } = useAuth()
  const pathname = usePathname()
  const [daysLeft, setDaysLeft] = useState<number>(0)

  useEffect(() => {
    if (user?.trial?.active && user.trial.endsAt) {
      const calculateDays = () => {
        const now = new Date()
        const end = new Date(user.trial!.endsAt)
        const diff = end.getTime() - now.getTime()
        const days = Math.ceil(diff / (1000 * 60 * 60 * 24))
        setDaysLeft(days > 0 ? days : 0)
      }
      calculateDays()
    }
  }, [user])

  const filteredMenuItems = menuItems.filter((item) => user?.role && item.roles.includes(user.role))

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarHeader className="border-b border-sidebar-border bg-sidebar">
        {/* Logo - Increased size significantly to 300x94 */}
        <Link href="/" className="flex items-center gap-2 p-4">
          <div className="relative w-[300px] h-[94px]">
            <Image src="/agendfy-logo.png" alt="AgendFy" fill className="object-contain" priority />
          </div>
        </Link>
      </SidebarHeader>

      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground text-xs font-semibold uppercase tracking-wider px-4">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className={`${isActive ? "bg-primary/10 text-primary border-l-2 border-primary" : "text-muted-foreground hover:text-foreground hover:bg-sidebar-accent"}`}
                    >
                      <Link href={item.href} className="flex items-center gap-3 px-4 py-2.5">
                        <Icon className="w-5 h-5" />
                        <span className="font-medium">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4 bg-sidebar">
        <div className="mb-4 flex items-center gap-2">
          {user?.role !== "client" && <SupportButton />}
          <ThemeToggle />
        </div>

        {user?.role === "professional" && user?.subscriptionStatus === "premium_trial" && (
          <div className="mb-3 p-3 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-500/20">
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Premium Trial</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {daysLeft > 0
                ? `${daysLeft} dia${daysLeft !== 1 ? "s" : ""} restante${daysLeft !== 1 ? "s" : ""}`
                : "Expirando hoje"}
            </p>
          </div>
        )}
        <div className="text-sm">
          <p className="font-semibold text-foreground truncate">{user?.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
