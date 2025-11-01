"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import AdminLayout from "@/components/admin/layout"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Save, RefreshCw, FileText, Globe, Search, AlertTriangle, CheckCircle } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/context/auth-context"
import { Loader2 } from "lucide-react"

type PageSEO = {
  id: string
  path: string
  title: string
  description: string
  keywords: string
  og_title: string
  og_description: string
  og_image: string
  no_index: boolean
  created_at: string
  updated_at: string
}

type GlobalSEO = {
  id: string
  site_name: string
  default_title: string
  default_description: string
  default_keywords: string
  default_og_image: string
  google_analytics_id: string
  created_at: string
  updated_at: string
}

export default function SEOManagement() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  const [pages, setPages] = useState<PageSEO[]>([])
  const [globalSEO, setGlobalSEO] = useState<GlobalSEO | null>(null)
  const [selectedPage, setSelectedPage] = useState<PageSEO | null>(null)
  const [newPagePath, setNewPagePath] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isGeneratingSitemap, setIsGeneratingSitemap] = useState(false)
  const [seoScore, setSeoScore] = useState<Record<string, number>>({})
  const [activeTab, setActiveTab] = useState("pages")

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && !user) {
      router.push("/admin/login")
    } else if (mounted && user) {
      fetchSEOData()
    }
  }, [mounted, loading, user, router])

  const fetchSEOData = async () => {
    try {
      // Fetch page SEO data
      const { data: pagesData, error: pagesError } = await supabase.from("page_seo").select("*").order("path")

      if (pagesError) throw pagesError
      setPages(pagesData || [])

      // Fetch global SEO settings
      const { data: globalData, error: globalError } = await supabase.from("global_seo").select("*").single()

      if (globalError && globalError.code !== "PGRST116") throw globalError
      setGlobalSEO(globalData)

      // Calculate SEO scores
      const scores: Record<string, number> = {}
      pagesData?.forEach((page) => {
        scores[page.id] = calculateSEOScore(page)
      })
      setSeoScore(scores)
    } catch (error) {
      console.error("Error fetching SEO data:", error)
    }
  }

  const calculateSEOScore = (page: PageSEO): number => {
    let score = 0
    const maxScore = 100

    // Title checks
    if (page.title) {
      score += 15
      if (page.title.length >= 30 && page.title.length <= 60) score += 10
    }

    // Description checks
    if (page.description) {
      score += 15
      if (page.description.length >= 120 && page.description.length <= 160) score += 10
    }

    // Keywords check
    if (page.keywords) score += 10

    // OG tags check
    if (page.og_title) score += 5
    if (page.og_description) score += 5
    if (page.og_image) score += 10

    // Path check
    if (page.path && !page.path.includes(" ") && page.path.includes("/")) score += 10

    // No index penalty
    if (page.no_index) score -= 10

    return Math.min(Math.max(score, 0), maxScore)
  }

  const getSEOScoreColor = (score: number): string => {
    if (score >= 80) return "text-green-500"
    if (score >= 60) return "text-yellow-500"
    return "text-red-500"
  }

  const handleSelectPage = (page: PageSEO) => {
    setSelectedPage(page)
  }

  const handleCreateNewPage = async () => {
    if (!newPagePath) return

    try {
      setIsSaving(true)

      const newPage: Omit<PageSEO, "id" | "created_at" | "updated_at"> = {
        path: newPagePath.startsWith("/") ? newPagePath : `/${newPagePath}`,
        title: "",
        description: "",
        keywords: "",
        og_title: "",
        og_description: "",
        og_image: "",
        no_index: false,
      }

      const { data, error } = await supabase.from("page_seo").insert([newPage]).select()

      if (error) throw error

      await fetchSEOData()
      setNewPagePath("")
      if (data && data[0]) {
        setSelectedPage(data[0])
      }
    } catch (error) {
      console.error("Error creating new page SEO:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSavePageSEO = async () => {
    if (!selectedPage) return

    try {
      setIsSaving(true)

      const { error } = await supabase
        .from("page_seo")
        .update({
          title: selectedPage.title,
          description: selectedPage.description,
          keywords: selectedPage.keywords,
          og_title: selectedPage.og_title,
          og_description: selectedPage.og_description,
          og_image: selectedPage.og_image,
          no_index: selectedPage.no_index,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedPage.id)

      if (error) throw error

      await fetchSEOData()
    } catch (error) {
      console.error("Error saving page SEO:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveGlobalSEO = async () => {
    if (!globalSEO) return

    try {
      setIsSaving(true)

      if (globalSEO.id) {
        // Update existing global SEO
        const { error } = await supabase
          .from("global_seo")
          .update({
            site_name: globalSEO.site_name,
            default_title: globalSEO.default_title,
            default_description: globalSEO.default_description,
            default_keywords: globalSEO.default_keywords,
            default_og_image: globalSEO.default_og_image,
            google_analytics_id: globalSEO.google_analytics_id,
            updated_at: new Date().toISOString(),
          })
          .eq("id", globalSEO.id)

        if (error) throw error
      } else {
        // Create new global SEO
        const { error } = await supabase.from("global_seo").insert([
          {
            site_name: globalSEO.site_name,
            default_title: globalSEO.default_title,
            default_description: globalSEO.default_description,
            default_keywords: globalSEO.default_keywords,
            default_og_image: globalSEO.default_og_image,
            google_analytics_id: globalSEO.google_analytics_id,
          },
        ])

        if (error) throw error
      }

      await fetchSEOData()
    } catch (error) {
      console.error("Error saving global SEO:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleGenerateSitemap = async () => {
    try {
      setIsGeneratingSitemap(true)

      // Call API to generate sitemap
      const response = await fetch("/api/seo/generate-sitemap", {
        method: "POST",
      })

      if (!response.ok) {
        throw new Error("Failed to generate sitemap")
      }

      alert("Sitemap generated successfully!")
    } catch (error) {
      console.error("Error generating sitemap:", error)
      alert("Failed to generate sitemap. Please try again.")
    } finally {
      setIsGeneratingSitemap(false)
    }
  }

  const handleDeletePageSEO = async (id: string) => {
    if (!confirm("Are you sure you want to delete this page SEO data?")) return

    try {
      const { error } = await supabase.from("page_seo").delete().eq("id", id)

      if (error) throw error

      await fetchSEOData()
      setSelectedPage(null)
    } catch (error) {
      console.error("Error deleting page SEO:", error)
    }
  }

  if (!mounted || loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Loader2 className="h-8 w-8 mx-auto animate-spin text-gray-500 dark:text-gray-400" />
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading SEO management...</p>
        </div>
      </div>
    )
  }

  return (
    <AdminLayout>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
          <Link href="/admin/dashboard" className="mr-4">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h2 className="text-xl font-semibold dark:text-white">SEO Management</h2>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
          <TabsList className="mb-6">
            <TabsTrigger value="pages" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Page SEO
            </TabsTrigger>
            <TabsTrigger value="global" className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              Global Settings
            </TabsTrigger>
            <TabsTrigger value="tools" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              SEO Tools
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pages" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Pages</CardTitle>
                    <CardDescription>Manage SEO for individual pages</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Input
                        placeholder="New page path (e.g., /about)"
                        value={newPagePath}
                        onChange={(e) => setNewPagePath(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleCreateNewPage()}
                      />
                      <Button size="sm" onClick={handleCreateNewPage} disabled={isSaving || !newPagePath}>
                        Add
                      </Button>
                    </div>

                    <div className="max-h-[400px] overflow-y-auto border rounded-md">
                      {pages.length === 0 ? (
                        <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                          No pages found. Add your first page.
                        </div>
                      ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                          {pages.map((page) => (
                            <li
                              key={page.id}
                              className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${selectedPage?.id === page.id ? "bg-gray-100 dark:bg-gray-700" : ""}`}
                              onClick={() => handleSelectPage(page)}
                            >
                              <div className="flex items-center justify-between">
                                <span className="font-medium truncate max-w-[180px]">{page.path}</span>
                                <span className={`text-sm font-semibold ${getSEOScoreColor(seoScore[page.id] || 0)}`}>
                                  {seoScore[page.id] || 0}%
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                                {page.title || "No title set"}
                              </p>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="md:col-span-2">
                {selectedPage ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Edit Page SEO</CardTitle>
                      <CardDescription>
                        Editing SEO for{" "}
                        <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">{selectedPage.path}</code>
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="title">
                            Meta Title <span className="text-xs text-gray-500">({selectedPage.title.length}/60)</span>
                          </Label>
                          <Input
                            id="title"
                            value={selectedPage.title}
                            onChange={(e) => setSelectedPage({ ...selectedPage, title: e.target.value })}
                            maxLength={60}
                          />
                          {selectedPage.title.length > 60 && (
                            <p className="text-xs text-red-500">Title is too long (max 60 characters)</p>
                          )}
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="keywords">Meta Keywords</Label>
                          <Input
                            id="keywords"
                            value={selectedPage.keywords}
                            onChange={(e) => setSelectedPage({ ...selectedPage, keywords: e.target.value })}
                            placeholder="keyword1, keyword2, keyword3"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="description">
                          Meta Description{" "}
                          <span className="text-xs text-gray-500">({selectedPage.description.length}/160)</span>
                        </Label>
                        <Textarea
                          id="description"
                          value={selectedPage.description}
                          onChange={(e) => setSelectedPage({ ...selectedPage, description: e.target.value })}
                          rows={3}
                          maxLength={160}
                        />
                        {selectedPage.description.length > 160 && (
                          <p className="text-xs text-red-500">Description is too long (max 160 characters)</p>
                        )}
                      </div>

                      <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                        <h3 className="text-sm font-medium mb-3">Open Graph Settings</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="og_title">OG Title</Label>
                            <Input
                              id="og_title"
                              value={selectedPage.og_title}
                              onChange={(e) => setSelectedPage({ ...selectedPage, og_title: e.target.value })}
                              placeholder="Same as meta title if empty"
                            />
                          </div>

                          <div className="space-y-2">
                            <Label htmlFor="og_image">OG Image URL</Label>
                            <Input
                              id="og_image"
                              value={selectedPage.og_image}
                              onChange={(e) => setSelectedPage({ ...selectedPage, og_image: e.target.value })}
                              placeholder="https://example.com/image.jpg"
                            />
                          </div>
                        </div>

                        <div className="space-y-2 mt-4">
                          <Label htmlFor="og_description">OG Description</Label>
                          <Textarea
                            id="og_description"
                            value={selectedPage.og_description}
                            onChange={(e) => setSelectedPage({ ...selectedPage, og_description: e.target.value })}
                            rows={2}
                            placeholder="Same as meta description if empty"
                          />
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 pt-4">
                        <Switch
                          id="no_index"
                          checked={selectedPage.no_index}
                          onCheckedChange={(checked) => setSelectedPage({ ...selectedPage, no_index: checked })}
                        />
                        <Label htmlFor="no_index" className="font-medium">
                          No Index (Hide from search engines)
                        </Label>
                      </div>

                      <div className="bg-gray-50 dark:bg-gray-700 p-3 rounded-md mt-4">
                        <div className="flex items-center gap-2 mb-2">
                          {seoScore[selectedPage.id] >= 80 ? (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                          ) : (
                            <AlertTriangle className="h-5 w-5 text-yellow-500" />
                          )}
                          <h3 className="font-medium">
                            SEO Score:{" "}
                            <span className={getSEOScoreColor(seoScore[selectedPage.id] || 0)}>
                              {seoScore[selectedPage.id] || 0}%
                            </span>
                          </h3>
                        </div>

                        <ul className="text-sm space-y-1">
                          {!selectedPage.title && <li className="text-red-500">• Missing meta title</li>}
                          {selectedPage.title && (selectedPage.title.length < 30 || selectedPage.title.length > 60) && (
                            <li className="text-yellow-500">• Title should be between 30-60 characters</li>
                          )}
                          {!selectedPage.description && <li className="text-red-500">• Missing meta description</li>}
                          {selectedPage.description &&
                            (selectedPage.description.length < 120 || selectedPage.description.length > 160) && (
                              <li className="text-yellow-500">• Description should be between 120-160 characters</li>
                            )}
                          {!selectedPage.keywords && <li className="text-yellow-500">• Missing keywords</li>}
                          {!selectedPage.og_image && <li className="text-yellow-500">• Missing OG image</li>}
                          {selectedPage.no_index && (
                            <li className="text-red-500">• Page is set to no-index (won't appear in search results)</li>
                          )}
                        </ul>
                      </div>
                    </CardContent>
                    <CardFooter className="flex justify-between">
                      <Button variant="destructive" onClick={() => handleDeletePageSEO(selectedPage.id)}>
                        Delete
                      </Button>
                      <Button onClick={handleSavePageSEO} disabled={isSaving}>
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="mr-2 h-4 w-4" />
                            Save Changes
                          </>
                        )}
                      </Button>
                    </CardFooter>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="p-8 text-center">
                      <FileText className="h-12 w-12 mx-auto text-gray-400 dark:text-gray-500 mb-4" />
                      <h3 className="text-lg font-medium mb-2 dark:text-white">No Page Selected</h3>
                      <p className="text-gray-500 dark:text-gray-400 mb-4">
                        Select a page from the list or create a new one to manage its SEO settings.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="global" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Global SEO Settings</CardTitle>
                <CardDescription>Configure site-wide SEO settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="site_name">Site Name</Label>
                    <Input
                      id="site_name"
                      value={globalSEO?.site_name || ""}
                      onChange={(e) => setGlobalSEO((prev) => (prev ? { ...prev, site_name: e.target.value } : null))}
                      placeholder="Your Site Name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="default_title">Default Title</Label>
                    <Input
                      id="default_title"
                      value={globalSEO?.default_title || ""}
                      onChange={(e) =>
                        setGlobalSEO((prev) => (prev ? { ...prev, default_title: e.target.value } : null))
                      }
                      placeholder="Default page title"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_description">Default Description</Label>
                  <Textarea
                    id="default_description"
                    value={globalSEO?.default_description || ""}
                    onChange={(e) =>
                      setGlobalSEO((prev) => (prev ? { ...prev, default_description: e.target.value } : null))
                    }
                    rows={3}
                    placeholder="Default meta description"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_keywords">Default Keywords</Label>
                  <Input
                    id="default_keywords"
                    value={globalSEO?.default_keywords || ""}
                    onChange={(e) =>
                      setGlobalSEO((prev) => (prev ? { ...prev, default_keywords: e.target.value } : null))
                    }
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="default_og_image">Default OG Image URL</Label>
                  <Input
                    id="default_og_image"
                    value={globalSEO?.default_og_image || ""}
                    onChange={(e) =>
                      setGlobalSEO((prev) => (prev ? { ...prev, default_og_image: e.target.value } : null))
                    }
                    placeholder="https://example.com/default-og-image.jpg"
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-sm font-medium mb-3">Analytics</h3>

                  <div className="space-y-2">
                    <Label htmlFor="google_analytics_id">Google Analytics ID</Label>
                    <Input
                      id="google_analytics_id"
                      value={globalSEO?.google_analytics_id || ""}
                      onChange={(e) =>
                        setGlobalSEO((prev) => (prev ? { ...prev, google_analytics_id: e.target.value } : null))
                      }
                      placeholder="G-XXXXXXXXXX"
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="ml-auto" onClick={handleSaveGlobalSEO} disabled={isSaving || !globalSEO}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Global Settings
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="tools" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sitemap Generator</CardTitle>
                  <CardDescription>Generate an XML sitemap for search engines</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                    Generate a sitemap.xml file based on your pages. This helps search engines discover and index your
                    content.
                  </p>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleGenerateSitemap} disabled={isGeneratingSitemap} className="w-full">
                    {isGeneratingSitemap ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Generate Sitemap
                      </>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Robots.txt Editor</CardTitle>
                  <CardDescription>Configure crawling instructions for search engines</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="robots_txt">robots.txt Content</Label>
                    <Textarea
                      id="robots_txt"
                      rows={8}
                      className="font-mono text-sm"
                      defaultValue={`User-agent: *
Allow: /

# Disallow admin pages
Disallow: /admin/

# Sitemap location
Sitemap: ${typeof window !== "undefined" ? window.location.origin : ""}/sitemap.xml`}
                    />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <Save className="mr-2 h-4 w-4" />
                    Save robots.txt
                  </Button>
                </CardFooter>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>SEO Checklist</CardTitle>
                <CardDescription>Essential SEO tasks for your website</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 relative mt-1">
                      <input type="checkbox" className="h-4 w-4" id="check1" />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="check1" className="font-medium">
                        Set up meta tags for all pages
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ensure all pages have proper title, description, and keywords.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 relative mt-1">
                      <input type="checkbox" className="h-4 w-4" id="check2" />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="check2" className="font-medium">
                        Configure Google Analytics
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Set up Google Analytics to track visitor behavior and page performance.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 relative mt-1">
                      <input type="checkbox" className="h-4 w-4" id="check3" />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="check3" className="font-medium">
                        Generate and submit sitemap
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Create a sitemap.xml file and submit it to Google Search Console.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 relative mt-1">
                      <input type="checkbox" className="h-4 w-4" id="check4" />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="check4" className="font-medium">
                        Optimize image alt tags
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add descriptive alt text to all images for better accessibility and SEO.
                      </p>
                    </div>
                  </li>

                  <li className="flex items-start">
                    <div className="flex-shrink-0 h-5 w-5 relative mt-1">
                      <input type="checkbox" className="h-4 w-4" id="check5" />
                    </div>
                    <div className="ml-3">
                      <label htmlFor="check5" className="font-medium">
                        Implement schema markup
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Add structured data to help search engines understand your content better.
                      </p>
                    </div>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  )
}
