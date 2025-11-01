"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { LogOut, Menu, X } from "lucide-react"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700" />
      </div>
    )
  }

  if (!user) return null

  const navigation = [
    { name: "Dashboard", href: "/admin/dashboard" },
    { name: "Projects", href: "/admin/dashboard/projects" },
    { name: "Messages", href: "/admin/dashboard/messages" },
    { name: "Media", href: "/admin/dashboard/media" },
    { name: "SEO", href: "/admin/dashboard/seo" },
    { name: "Database", href: "/admin/database" },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`
          fixed inset-y-0 left-0 z-30 w-64 transform lg:translate-x-0 
          lg:relative lg:flex lg:flex-col
          mt-[80px]
          rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700
          bg-white dark:bg-gray-800 overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
        `}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-between px-4 pt-4">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            Admin Panel
          </span>
        </div>

        {/* Navigation */}
        <nav className="mt-5 flex-1 px-2 space-y-1 overflow-y-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                pathname?.startsWith(item.href)
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                  : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-4">
          <div>
            <div className="text-sm font-medium text-gray-800 dark:text-white">
              {user.email}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-1 text-xs text-gray-500 dark:text-gray-400 flex items-center"
              onClick={logout}
            >
              <LogOut className="mr-2 h-3 w-3" />
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      {/* Dark overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm lg:hidden z-20"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div
        className={`flex-1 transition-all duration-300 ${
          sidebarOpen ? "lg:ml-1" : "lg:ml-0"
        } pt-[80px] pb-[60px]`}
      >
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 bg-white dark:bg-gray-800 shadow items-center px-4">
          {/* ✅ One toggle, only visible on mobile */}
          <button
            type="button"
            className="mr-4 text-gray-500 dark:text-gray-400 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#636AE8] lg:hidden"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>

          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {pathname === "/admin/dashboard"
              ? "Dashboard"
              : pathname?.includes("/projects")
              ? "Projects"
              : pathname?.includes("/messages")
              ? "Messages"
              : pathname?.includes("/database")
              ? "Database"
              : "Admin"}
          </h1>
        </div>

        <main className="flex-1 min-h-[calc(100vh-140px)]">
          <div className="py-6 px-4 sm:px-6 md:px-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
