"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import AdminLayout from "@/components/admin/layout"
import { AlertTriangle, Database, RefreshCw, SproutIcon as Seedling, ArrowRight } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabaseClient"
import { resetAndCreateTablesQuery } from "@/lib/supabase-schema"

export default function DatabaseManagementPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success?: boolean; message?: string }>({})

  const handleResetDatabase = async () => {
    if (
      !confirm(
        "WARNING: This will delete ALL data in your database. This action cannot be undone. Are you sure you want to continue?",
      )
    ) {
      return
    }

    setLoading(true)
    try {
      // Use the exec_sql function to execute the reset query
      const { error } = await supabase.rpc("exec_sql", {
        sql: resetAndCreateTablesQuery,
      })

      if (error) {
        throw error
      }

      setResult({ success: true, message: "Database tables reset and recreated successfully" })
    } catch (error: any) {
      console.error("Error:", error)
      setResult({
        success: false,
        message: error.message || "An unexpected error occurred",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold mb-6">Database Management</h2>

        <div className="bg-blue-50 border border-blue-200 text-blue-800 p-4 rounded-md mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Database Setup Required</h3>
              <p className="text-sm mt-1">
                If you're seeing an error about "exec_sql" function not found, you need to set up the database first.
              </p>
              <Link href="/admin/setup" className="text-blue-600 hover:underline text-sm mt-2 inline-block">
                Go to Database Setup
              </Link>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-md mb-6">
          <div className="flex items-start">
            <AlertTriangle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-medium">Warning: Destructive Action</h3>
              <p className="text-sm mt-1">
                Resetting the database will delete ALL existing data and recreate the tables from scratch. This action
                cannot be undone. Make sure you have a backup if needed.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2 flex items-center">
              <Database className="h-5 w-5 mr-2 text-gray-500" />
              Reset Database and Create Tables
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              This will drop all existing tables in the public schema and create new tables with proper Row Level
              Security (RLS) policies.
            </p>
            <Button onClick={handleResetDatabase} disabled={loading} className="bg-red-600 hover:bg-red-700 text-white">
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                "Reset Database"
              )}
            </Button>
          </div>

          <div className="p-4 bg-gray-50 rounded-md">
            <h3 className="font-medium mb-2 flex items-center">
              <Seedling className="h-5 w-5 mr-2 text-gray-500" />
              Seed Database with Sample Data
            </h3>
            <p className="text-gray-600 text-sm mb-4">
              Add sample projects and contact messages to your database for testing purposes.
            </p>
            <Link href="/admin/database/seed">
              <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                Go to Database Seeding
                <ArrowRight size={16} />
              </Button>
            </Link>
          </div>

          {result.message && (
            <div
              className={`p-4 rounded-md ${result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
            >
              {result.message}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}
