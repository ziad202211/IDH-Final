"use client"

import type React from "react"

import { ThemeProvider } from "next-themes"
import { AuthProvider } from "@/context/auth-context"
import { ImageProvider } from "@/context/image-context"

export default function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <AuthProvider>
        <ImageProvider>{children}</ImageProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
