import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import fs from "fs"
import path from "path"
import type { Database } from "@/types/supabase"

export async function POST(request: Request) {
  try {
    // Create a new Supabase client for this request
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error("Missing Supabase credentials")
      return NextResponse.json({ error: "Server configuration error" }, { status: 500 })
    }

    const supabase = createClient<Database>(supabaseUrl, supabaseKey)

    // Get all pages from the page_seo table that are not set to no_index
    const { data: pages, error } = await supabase.from("page_seo").select("path, updated_at").eq("no_index", false)

    if (error) {
      console.error("Error fetching pages:", error)
      return NextResponse.json({ error: "Failed to fetch pages: " + error.message }, { status: 500 })
    }

    // Get all projects for the sitemap
    const { data: projects, error: projectsError } = await supabase
      .from("projects")
      .select("id, created_at, updated_at")

    if (projectsError) {
      console.error("Error fetching projects:", projectsError)
      return NextResponse.json({ error: "Failed to fetch projects: " + projectsError.message }, { status: 500 })
    }

    // Generate sitemap XML
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://example.com"

    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`

    // Add pages to sitemap
    pages?.forEach((page) => {
      const path = page.path.startsWith("/") ? page.path : `/${page.path}`
      sitemap += `  <url>
    <loc>${baseUrl}${path}</loc>
    <lastmod>${page.updated_at || new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`
    })

    // Add projects to sitemap
    projects?.forEach((project) => {
      sitemap += `  <url>
    <loc>${baseUrl}/projects/${project.id}</loc>
    <lastmod>${project.updated_at || project.created_at || new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>
`
    })

    sitemap += `</urlset>`

    // Write sitemap to public directory
    const publicDir = path.join(process.cwd(), "public")
    fs.writeFileSync(path.join(publicDir, "sitemap.xml"), sitemap)

    return NextResponse.json({ success: true, message: "Sitemap generated successfully" })
  } catch (error: any) {
    console.error("Error generating sitemap:", error)
    return NextResponse.json({ error: "Internal server error: " + (error.message || "Unknown error") }, { status: 500 })
  }
}
