import type React from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home, LayoutDashboard } from "lucide-react"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div>
      <header className="border-b">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <Link href="/" className="font-bold text-xl">
              DESIGN STUDIO
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium hover:text-primary">
                Dashboard
              </Link>
              <Link href="/dashboard/add-project" className="text-sm font-medium hover:text-primary">
                Add Project
              </Link>
              <Link href="/contact-test" className="text-sm font-medium hover:text-primary">
                Contact Form Test
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/">
              <Button variant="outline" size="sm" className="flex items-center gap-1">
                <Home className="h-4 w-4" />
                <span className="hidden md:inline">Back to Website</span>
              </Button>
            </Link>
            <Link href="/admin/dashboard">
              <Button size="sm" className="flex items-center gap-1">
                <LayoutDashboard className="h-4 w-4" />
                <span className="hidden md:inline">Admin Dashboard</span>
              </Button>
            </Link>
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  )
}
