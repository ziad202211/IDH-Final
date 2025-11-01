"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { useAuth } from "@/context/auth-context"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams?.get("redirect") || "/admin/dashboard"
  const { login, user, loading: authLoading } = useAuth()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Only run client-side code after component is mounted
  useEffect(() => {
    setMounted(true)
    console.log("Login page mounted")
  }, [])

  // Redirect if already logged in
  useEffect(() => {
    if (user && mounted && !authLoading) {
      console.log("User already logged in, redirecting to:", redirectPath)
      router.push(redirectPath)
    }
  }, [user, mounted, authLoading, redirectPath, router])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("Submitting login form")
      const result = await login(email, password)

      if (!result.success) {
        throw new Error(result.error || "Login failed")
      }

      console.log("Login successful, redirecting to:", redirectPath)
      // Add a small delay to ensure the session is properly set
      setTimeout(() => {
        router.push(redirectPath)
      }, 1000)
    } catch (error: any) {
      console.error("Login form error:", error)
      setError(error.message || "Failed to login")
    } finally {
      setLoading(false)
    }
  }

  // Don't render anything until client-side hydration is complete
  if (!mounted || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-pulse h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-700"></div>
      </div>
    )
  }

  // If already logged in, show loading
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-500 dark:text-gray-400" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Already logged in, redirecting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
        <div>
          <div className="flex justify-center">
            <div className="relative h-16 w-48">
              <Image
                src="/placeholder.svg?height=64&width=192"
                alt="Design Studio Logo"
                fill
                className="object-contain dark:invert"
              />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">Admin Login</h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Sign in to access the admin dashboard
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          {error && (
            <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 p-4 rounded-md text-sm">
              {error}
            </div>
          )}

          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-t-md focus:outline-none focus:ring-[#636AE8] focus:border-[#636AE8] focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white dark:bg-gray-700 rounded-b-md focus:outline-none focus:ring-[#636AE8] focus:border-[#636AE8] focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="text-sm text-center">
            <p className="text-gray-600 dark:text-gray-400">Use your Supabase credentials to log in</p>
            <Link href="/admin/setup" className="mt-2 inline-block text-[#636AE8] hover:text-[#4a4eb8]">
              Need to create an admin user?
            </Link>
          </div>

          <div>
            <Button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#171A1F] dark:bg-[#636AE8] hover:bg-[#2A2D35] dark:hover:bg-[#4a4eb8] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#636AE8]"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </div>

          <div className="text-center text-sm">
            <Link href="/" className="text-[#636AE8] hover:text-[#4a4eb8]">
              Return to website
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
