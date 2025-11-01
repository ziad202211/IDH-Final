"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function SetupPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [setupComplete, setSetupComplete] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const { toast } = useToast()

  const handleSetup = async () => {
    setIsLoading(true)
    setErrorMessage(null)

    try {
      const response = await fetch("/api/setup-database", {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Setup Complete",
          description: "Database has been successfully set up.",
        })
        setSetupComplete(true)
      } else {
        const errorMsg = data.error || "An error occurred during setup."
        setErrorMessage(errorMsg)
        toast({
          variant: "destructive",
          title: "Setup Failed",
          description: errorMsg,
        })
      }
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : "An unexpected error occurred."
      setErrorMessage(errorMsg)
      toast({
        variant: "destructive",
        title: "Setup Failed",
        description: errorMsg,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Database Setup</h1>

      <Alert className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Important</AlertTitle>
        <AlertDescription>
          You must run this setup process before using the media management features. This will create necessary
          database tables and initialize storage buckets.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Initialize Database</CardTitle>
          <CardDescription>
            This will set up all required database tables, functions, and storage buckets needed for the application.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">The setup process will:</p>
          <ul className="list-disc pl-5 space-y-1 mb-4">
            <li>Create the SQL execution function</li>
            <li>Initialize Supabase storage buckets</li>
            <li>Create the image mappings table</li>
            <li>Set up initial website image mappings</li>
          </ul>

          {errorMessage && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription className="whitespace-pre-wrap">
                {errorMessage}
                <div className="mt-2">
                  <p className="font-semibold">Troubleshooting:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Make sure your Supabase credentials are correctly set up</li>
                    <li>Check that your Supabase service role key has sufficient permissions</li>
                    <li>Try refreshing the page and running setup again</li>
                  </ul>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button onClick={handleSetup} disabled={isLoading || setupComplete}>
            {isLoading ? "Setting Up..." : setupComplete ? "Setup Complete" : "Run Setup"}
          </Button>

          {setupComplete && (
            <Button variant="outline" asChild>
              <Link href="/admin/dashboard/media">Go to Media Management</Link>
            </Button>
          )}
        </CardFooter>
      </Card>

      {setupComplete && (
        <Alert className="mt-6 bg-green-50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertTitle className="text-green-600">Setup Complete</AlertTitle>
          <AlertDescription className="text-green-700">
            The database has been successfully set up. You can now use all features of the application.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}
