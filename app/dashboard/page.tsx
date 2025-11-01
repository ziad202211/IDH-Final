"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Check, Clock, Plus, RefreshCw } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function Dashboard() {
  const [projects, setProjects] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [loading, setLoading] = useState({
    projects: true,
    messages: true,
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading({ projects: true, messages: true })

    // Fetch projects
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from("projects")
        .select("*")
        .order("created_at", { ascending: false })

      if (projectsError) throw projectsError
      setProjects(projectsData || [])
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setLoading((prev) => ({ ...prev, projects: false }))
    }

    // Fetch messages
    try {
      const { data: messagesData, error: messagesError } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })

      if (messagesError) throw messagesError
      setMessages(messagesData || [])
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading((prev) => ({ ...prev, messages: false }))
    }
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Button onClick={fetchData} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh Data
        </Button>
      </div>

      <Tabs defaultValue="projects">
        <TabsList className="mb-6">
          <TabsTrigger value="projects">Projects ({projects.length})</TabsTrigger>
          <TabsTrigger value="messages">Contact Messages ({messages.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <div className="mb-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">Projects</h2>
            <Link href="/dashboard/add-project">
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add New Project
              </Button>
            </Link>
          </div>

          {loading.projects ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : projects.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No projects found. Add your first project to get started.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  <div className="relative h-48 w-full">
                    <Image
                      src={project.images[0] || "/placeholder.svg?height=200&width=400"}
                      alt={project.title}
                      fill
                      className="object-cover"
                    />
                    {project.featured && <Badge className="absolute top-2 right-2 bg-yellow-500">Featured</Badge>}
                  </div>
                  <CardHeader>
                    <CardTitle>{project.title}</CardTitle>
                    <CardDescription>{project.category}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="line-clamp-3">{project.description}</p>
                    {project.location && (
                      <p className="text-sm text-muted-foreground mt-2">Location: {project.location}</p>
                    )}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(project.created_at).toLocaleDateString()}
                    </span>
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                    <Link href={`/dashboard/edit-project/${project.id}`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="messages">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Contact Messages</h2>
          </div>

          {loading.messages ? (
            <div className="flex justify-center py-10">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <p className="text-muted-foreground">No messages found.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <Card key={message.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{message.name}</CardTitle>
                        <CardDescription>{message.email}</CardDescription>
                      </div>
                      <Badge variant={message.read ? "outline" : "default"}>
                        {message.read ? (
                          <span className="flex items-center gap-1">
                            <Check className="h-3 w-3" /> Read
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" /> Unread
                          </span>
                        )}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{message.message}</p>
                    {message.phone && <p className="text-sm text-muted-foreground mt-2">Phone: {message.phone}</p>}
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(message.created_at).toLocaleDateString()}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => (window.location.href = `mailto:${message.email}`)}
                    >
                      Reply
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
