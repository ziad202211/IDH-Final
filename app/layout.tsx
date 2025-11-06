import type React from "react"
import "./globals.css"
import { Inter, Archivo } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import Header from "@/components/header"
import Footer from "@/components/footer"
import ThemeSwitcher from "@/components/theme-switcher"
import ClientProviders from "@/components/client-providers"

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
})

export const metadata = {
  title: "Architecture Design Studio",
  description: "Transform your space with our innovative Architecture design solutions",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${archivo.variable} font-sans`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <ClientProviders>
            <Header />
            <div className="min-h-screen">{children}</div>
            <Footer />
            <ThemeSwitcher />
          </ClientProviders>
        </ThemeProvider>
      </body>
    </html>
  )
}
