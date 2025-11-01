"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { getSupabaseClient } from "@/lib/supabase-auth"

export default function DebugPage() {
  const { user, loading, error, logout } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [sessionData, setSessionData] = useState<any>(null)
  const [checkingSession, setCheckingSession] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const checkSession = async () => {
    setCheckingSession(true)
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        throw new Error("No Supabase client available")
      }

      const { data, error } = await supabase.auth.getSession()
      if (error) {
        throw error
      }

      setSessionData(data)
    } catch (error) {
      console.error("Session check error:", error)
      setSessionData({ error })
    } finally {
      setCheckingSession(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    setSessionData(null)
  }

  if (!mounted) {
    return <div>Loading...</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Auth Debug Page</h1>

      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Auth Context State</h2>
        <div className="space-y-2">
          <p>
            <strong>Loading:</strong> {loading ? "Yes" : "No"}
          </p>
          <p>
            <strong>Error:</strong> {error || "None"}
          </p>
          <p>
            <strong>User:</strong> {user ? "Logged in" : "Not logged in"}
          </p>
          {user && (
            <div className="mt-2">
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>ID:</strong> {user.id}
              </p>
              <p>
                <strong>Last Sign In:</strong> {new Date(user.last_sign_in_at || "").toLocaleString()}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Session Check</h2>
        <Button onClick={checkSession} disabled={checkingSession} className="mb-4">
          {checkingSession ? "Checking..." : "Check Current Session"}
        </Button>

        {sessionData && (
          <pre className="bg-gray-200 dark:bg-gray-700 p-4 rounded overflow-auto max-h-60">
            {JSON.stringify(sessionData, null, 2)}
          </pre>
        )}
      </div>

      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Actions</h2>
        <div className="space-x-4">
          <Button onClick={handleLogout} variant="destructive">
            Logout
          </Button>
          <Button onClick={() => (window.location.href = "/admin/login")}>Go to Login Page</Button>
          <Button onClick={() => (window.location.href = "/admin/dashboard")}>Go to Dashboard</Button>
        </div>
      </div>

      <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
        <h2 className="text-xl font-semibold mb-2">Browser Storage</h2>
        <Button
          onClick={() => {
            localStorage.clear()
            sessionStorage.clear()
            alert("Browser storage cleared")
          }}
          variant="destructive"
        >
          Clear All Browser Storage
        </Button>
      </div>
    </div>
  )
}
