"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Menu, X, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { WebsiteImage } from "@/components/website-image"

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Only run client-side code after mount
  useEffect(() => {
    setMounted(true)
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    // Set initial scroll state
    handleScroll()

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Close mobile menu when changing pages
  useEffect(() => {
    if (mounted) {
      setMobileMenuOpen(false)
    }
  }, [pathname, mounted])

  const isActive = (path: string) => {
    return pathname === path
  }

  const navigationItems = [
    { name: "Who we are", path: "/who-we-are" },
    { name: "What we do", path: "/what-we-do" },
    { name: "Projects", path: "/projects" },
    { name: "Contact", path: "/contact" },
  ]

  // Don't render until client-side hydration is complete
  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-white py-4">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16" />
        </div>
      </header>
    )
  }

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white shadow-md py-2" : "bg-white/90 backdrop-blur-sm py-3",
      )}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center">
  <div className="relative h-14 w-32 sm:h-14 sm:w-32 md:h-14 md:w-32 flex items-center justify-center overflow-hidden">
    <WebsiteImage
      imageId="logo"
      alt="Design Studio Logo"
      fill
      className="object-contain !w-full !h-full"
      fallbackSrc="/placeholder.svg?height=64&width=192"
      priority
    />
  </div>
</Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "text-sm hover:text-[#171A1F] transition-colors relative group",
                  isActive(item.path) ? "text-[#171A1F] font-bold" : "text-[#6E7787]",
                )}
              >
                {item.name}
                <span
                  className={cn(
                    "absolute -bottom-1 left-0 w-0 h-0.5 bg-[#636AE8] transition-all duration-300 group-hover:w-full",
                    isActive(item.path) ? "w-full" : "",
                  )}
                ></span>
              </Link>
            ))}

            {/* Admin Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="text-sm text-[#6E7787] hover:text-[#171A1F] transition-colors flex items-center gap-1">
                  Admin <ChevronDown className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href="/admin/login">Admin Login</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard">Dashboard</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard/projects">Projects</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/admin/dashboard/messages">Messages</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>

          {/* Contact Button */}
          <Link href="/contact" className="hidden md:block">
            <Button className="bg-[#171A1F] hover:bg-[#2A2D35] text-white h-10 px-6 rounded-full">
              <span>Contact us</span>
              <svg
                width="12"
                height="8"
                viewBox="0 0 12 8"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="ml-2"
              >
                <path d="M0.181152 4L11.5812 4" stroke="white" strokeWidth="1.368" strokeMiterlimit="10" />
                <path
                  d="M7.59619 0.0100098L11.5862 4.00001L7.59619 7.99001"
                  stroke="white"
                  strokeWidth="1.368"
                  strokeMiterlimit="10"
                  strokeLinecap="square"
                />
              </svg>
            </Button>
          </Link>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? <X className="h-6 w-6 text-[#171A1F]" /> : <Menu className="h-6 w-6 text-[#171A1F]" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={cn(
          "md:hidden bg-white border-t overflow-hidden transition-all duration-300 ease-in-out",
          mobileMenuOpen ? "max-h-[500px] shadow-lg" : "max-h-0",
        )}
      >
        <div className="container mx-auto px-4 py-4">
          <nav className="flex flex-col space-y-4">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={cn(
                  "py-2 hover:text-[#171A1F] transition-colors border-b border-gray-100 last:border-0",
                  isActive(item.path) ? "text-[#171A1F] font-bold" : "text-[#6E7787]",
                )}
              >
                {item.name}
              </Link>
            ))}

            {/* Admin Links for Mobile */}
            <div className="py-2 text-[#6E7787]">
              <p className="font-medium mb-2">Admin</p>
              <div className="pl-4 flex flex-col space-y-2">
                <Link href="/admin/login" className="text-[#6E7787] hover:text-[#171A1F]">
                  Admin Login
                </Link>
                <Link href="/admin/dashboard" className="text-[#6E7787] hover:text-[#171A1F]">
                  Dashboard
                </Link>
                <Link href="/admin/dashboard/projects" className="text-[#6E7787] hover:text-[#171A1F]">
                  Projects
                </Link>
                <Link href="/admin/dashboard/messages" className="text-[#6E7787] hover:text-[#171A1F]">
                  Messages
                </Link>
              </div>
            </div>

            <Link href="/contact">
              <Button className="bg-[#171A1F] hover:bg-[#2A2D35] text-white w-full mt-2 rounded-full">
                Contact us
                <svg
                  width="12"
                  height="8"
                  viewBox="0 0 12 8"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="ml-2"
                >
                  <path d="M0.181152 4L11.5812 4" stroke="white" strokeWidth="1.368" strokeMiterlimit="10" />
                  <path
                    d="M7.59619 0.0100098L11.5862 4.00001L7.59619 7.99001"
                    stroke="white"
                    strokeWidth="1.368"
                    strokeMiterlimit="10"
                    strokeLinecap="square"
                  />
                </svg>
              </Button>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
