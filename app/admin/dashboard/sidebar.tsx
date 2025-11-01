import { LayoutDashboard, Settings, Image, Database } from "lucide-react"

import type { MainNavItem, SidebarNavItem } from "@/types"

interface DashboardConfig {
  mainNav: MainNavItem[]
  sidebarNav: SidebarNavItem[]
}

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Documentation",
      href: "/docs",
    },
    {
      title: "Support",
      href: "/support",
      disabled: true,
    },
  ],
  sidebarNav: [
    {
      title: "Dashboard",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "Settings",
      href: "/admin/settings",
      icon: Settings,
    },
    {
      title: "Media",
      href: "/admin/media",
      icon: Image,
    },
    {
      title: "Database Setup",
      href: "/admin/setup",
      icon: Database,
    },
  ],
}
