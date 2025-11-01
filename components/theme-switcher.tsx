"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Palette, Check, Moon, Sun } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useTheme } from "next-themes"

const themes = [
  { name: "Default", primary: "#171A1F", secondary: "#636AE8" },
  { name: "Earthy", primary: "#5C4033", secondary: "#8B7355" },
  { name: "Modern", primary: "#2C3E50", secondary: "#E74C3C" },
  { name: "Minimalist", primary: "#000000", secondary: "#FFFFFF" },
  { name: "Coastal", primary: "#1E3A8A", secondary: "#38BDF8" },
]

export default function ThemeSwitcher() {
  const [activeTheme, setActiveTheme] = useState(themes[0])
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // After mounting, we can safely show the UI
  useEffect(() => {
    setMounted(true)
  }, [])

  const applyTheme = (theme: (typeof themes)[0]) => {
    document.documentElement.style.setProperty("--primary-color", theme.primary)
    document.documentElement.style.setProperty("--secondary-color", theme.secondary)
    setActiveTheme(theme)
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      <Button
        variant="outline"
        size="icon"
        className="rounded-full h-12 w-12 shadow-lg"
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      >
        {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        <span className="sr-only">Toggle dark mode</span>
      </Button>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="icon" className="rounded-full h-12 w-12 shadow-lg">
            <Palette className="h-5 w-5" />
            <span className="sr-only">Change theme</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {themes.map((theme) => (
            <DropdownMenuItem
              key={theme.name}
              onClick={() => applyTheme(theme)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <div className="flex gap-1">
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: theme.primary }} />
                <div className="h-4 w-4 rounded-full" style={{ backgroundColor: theme.secondary }} />
              </div>
              <span>{theme.name}</span>
              {activeTheme.name === theme.name && <Check className="h-4 w-4 ml-auto" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}
