"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@supabase/supabase-js"
import { useAuth } from "@/context/auth-context"
import AdminLayout from "@/components/admin/layout"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Loader2,
  Mail,
  Image,
  ArrowRight,
  Home,
  Database,
  Search,
} from "lucide-react"

// ✅ Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  // === Dashboard State ===
  const [totalProjects, setTotalProjects] = useState(0)
  const [totalMessages, setTotalMessages] = useState(0)
  const [unreadMessages, setUnreadMessages] = useState(0)
  const [loadingProjects, setLoadingProjects] = useState(true)
  const [loadingMessages, setLoadingMessages] = useState(true)

  useEffect(() => setMounted(true), [])

  // Redirect unauthenticated users
  useEffect(() => {
    if (mounted && !loading && !user) router.push("/admin/login")
  }, [mounted, loading, user, router])

  // === Fetch Projects Count ===
  useEffect(() => {
    const fetchProjectsCount = async () => {
      const { count, error } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
      if (error) console.error("Error fetching projects:", error)
      setTotalProjects(count ?? 0)
      setLoadingProjects(false)
    }
    fetchProjectsCount()
  }, [])

  // === Fetch Messages Count & Unread Count ===
  useEffect(() => {
    const fetchMessages = async () => {
      setLoadingMessages(true)
      try {
        const response = await fetch("/api/messages")
        const result = await response.json()

        if (result.success && result.data) {
          setTotalMessages(result.data.length)
          setUnreadMessages(result.data.filter((msg: any) => !msg.read).length)
        } else {
          setTotalMessages(0)
          setUnreadMessages(0)
        }
      } catch (error) {
        setTotalMessages(0)
        setUnreadMessages(0)
      } finally {
        setLoadingMessages(false)
      }
    }

    fetchMessages()

    // ✅ Real-time listener for new messages & read updates
    const channel = supabase
      .channel("dashboard-messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "contact_messages" },
        (payload) => {
          setTotalMessages((prev) => prev + 1)
          setUnreadMessages((prev) => prev + 1)
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "contact_messages" },
        (payload) => {
          const wasRead = payload.old.read
          const isRead = payload.new.read
          if (wasRead && !isRead) {
            setUnreadMessages((prev) => prev + 1)
          } else if (!wasRead && isRead) {
            setUnreadMessages((prev) => Math.max(0, prev - 1))
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "contact_messages" },
        (payload) => {
          setTotalMessages((prev) => Math.max(0, prev - 1))
          if (!payload.old.read) {
            setUnreadMessages((prev) => Math.max(0, prev - 1))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // === Loading State ===
  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-gray-500 dark:text-gray-400" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Loading dashboard...
          </p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      {/* === Dashboard Stats === */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {/* Messages Card */}
        <DashboardCard
          title="Contact Messages"
          icon={<Mail className="h-6 w-6 text-[#636AE8]" />}
          mainValue={
            loadingMessages ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-500 dark:text-gray-400" />
            ) : (
              totalMessages
            )
          }
          subValue="total messages"
          unreadCount={unreadMessages}
          buttons={[
            {
              text: "View Messages",
              link: "/admin/dashboard/messages",
              variant: "outline",
            },
          ]}
        />

        {/* Projects Card */}
        <DashboardCard
          title="Projects"
          icon={<Image className="h-6 w-6 text-[#636AE8]" />}
          mainValue={
            loadingProjects ? (
              <Loader2 className="h-5 w-5 animate-spin text-gray-500 dark:text-gray-400" />
            ) : (
              totalProjects
            )
          }
          subValue="total projects"
          buttons={[
            {
              text: "Manage Projects",
              link: "/admin/dashboard/projects",
              variant: "outline",
            },
            {
              text: "Add New Project",
              link: "/admin/dashboard/projects/add",
              variant: "default",
            },
          ]}
        />

        {/* SEO Card */}
        <DashboardCard
          title="SEO Management"
          icon={<Search className="h-6 w-6 text-[#636AE8]" />}
          description="Manage SEO settings and optimize your website for better visibility."
          buttons={[
            { text: "SEO Tools", link: "/admin/dashboard/seo", variant: "outline" },
          ]}
        />

        {/* Database Card */}
        <DashboardCard
          title="Database"
          icon={<Database className="h-6 w-6 text-[#636AE8]" />}
          description="Manage your database tables and schema safely."
          buttons={[
            { text: "Database Management", link: "/admin/database", variant: "outline" },
          ]}
        />

        {/* Media Library */}
        <DashboardCard
          title="Media Library"
          icon={<Image className="h-6 w-6 text-[#636AE8]" />}
          description="Upload, replace, and manage all website images and assets."
          buttons={[
            { text: "Manage Media", link: "/admin/dashboard/media", variant: "outline" },
          ]}
        />

        {/* Website Link */}
        <DashboardCard
          title="Website"
          icon={<Home className="h-6 w-6 text-[#636AE8]" />}
          description="Open the public website to view your latest updates."
          buttons={[{ text: "Go to Website", link: "/", variant: "outline" }]}
        />
      </div>

      {/* === Quick Guide === */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Quick Guide
        </h2>
        <div className="space-y-4">
          <GuideItem
            title="Managing Contact Messages"
            text="View and respond to messages from the contact form. Mark messages as read once reviewed. The unread counter updates live."
          />
          <GuideItem
            title="Managing Projects"
            text="Add, edit, or remove projects. Upload images through the media library or direct URLs."
          />
          <GuideItem
            title="SEO Management"
            text="Optimize metadata and generate sitemaps to improve search visibility."
          />
          <GuideItem
            title="Database Management"
            text="Reset or maintain your tables with care — actions here are irreversible."
          />
        </div>
      </div>
    </AdminLayout>
  )
}

/* === Dashboard Card Component === */
function DashboardCard({
  title,
  icon,
  mainValue,
  subValue,
  description,
  buttons,
  unreadCount,
}: {
  title: string
  icon: React.ReactNode
  mainValue?: React.ReactNode
  subValue?: string
  description?: string
  buttons?: { text: string; link: string; variant: "default" | "outline" }[]
  unreadCount?: number
}) {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 relative">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
          {title}
          {typeof unreadCount === "number" && unreadCount > 0 && (
            <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full animate-pulse">
              {unreadCount} unread
            </span>
          )}
        </h2>
        <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-full">{icon}</div>
      </div>

      {mainValue && (
        <div className="flex items-end gap-2">
          <span className="text-3xl font-bold dark:text-white">{mainValue}</span>
          {subValue && (
            <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">{subValue}</span>
          )}
        </div>
      )}

      {description && (
        <p className="text-gray-600 dark:text-gray-400 mt-2 mb-4 text-sm">{description}</p>
      )}

      {buttons && (
        <div className="space-y-2">
          {buttons.map((btn, i) => (
            <Link key={i} href={btn.link} target={btn.link === "/" ? "_blank" : "_self"}>
              <Button variant={btn.variant} className="w-full justify-between hover:opacity-90">
                {btn.text}
                <ArrowRight size={16} />
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

/* === Quick Guide Item === */
function GuideItem({ title, text }: { title: string; text: string }) {
  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
      <h3 className="font-medium mb-2 dark:text-white">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 text-sm">{text}</p>
    </div>
  )
}
