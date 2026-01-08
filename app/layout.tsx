import type React from "react"
import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/auth-context"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "AgendFy - Sistema de Agendamento Inteligente",
  description:
    "Gerencie seus agendamentos de forma profissional com AgendFy. Plataforma completa para profissionais autônomos e pequenos negócios.",
  keywords: ["agendamento", "gestão", "agenda", "profissionais", "SaaS", "negócios", "clientes", "serviços"],
  authors: [{ name: "AgendFy Team" }],
  creator: "AgendFy",
  publisher: "AgendFy",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "pt_BR",
    url: "https://agendfy.com",
    siteName: "AgendFy",
    title: "AgendFy - Sistema de Agendamento Inteligente",
    description: "Transforme sua gestão de agendamentos com tecnologia profissional",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AgendFy - Sistema de Agendamento",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AgendFy - Sistema de Agendamento Inteligente",
    description: "Transforme sua gestão de agendamentos com tecnologia profissional",
    images: ["/og-image.png"],
  },
    generator: 'v0.app'
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f8fafc" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a12" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('agendfy-theme');
                  if (!theme || theme === 'system') {
                    theme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                  }
                  document.documentElement.classList.add(theme);
                } catch (e) {
                  document.documentElement.classList.add('dark');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-background text-foreground min-h-screen transition-colors duration-300`}
      >
        <ThemeProvider defaultTheme="dark" storageKey="agendfy-theme">
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
