"use client"

import { useEffect, useState } from "react"
import Head from "next/head"
import { usePathname } from "next/navigation"
import { supabase } from "@/lib/supabase"

type SEOMetaProps = {
  title?: string
  description?: string
  keywords?: string
  ogImage?: string
  ogTitle?: string
  ogDescription?: string
  noIndex?: boolean
}

export default function SEOMeta({
  title,
  description,
  keywords,
  ogImage,
  ogTitle,
  ogDescription,
  noIndex,
}: SEOMetaProps) {
  const pathname = usePathname()
  const [pageSEO, setPageSEO] = useState<any>(null)
  const [globalSEO, setGlobalSEO] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchSEOData = async () => {
      try {
        setLoading(true)

        // Fetch global SEO settings
        const { data: globalData } = await supabase.from("global_seo").select("*").single()

        setGlobalSEO(globalData || {})

        // Fetch page-specific SEO data
        const { data: pageData } = await supabase.from("page_seo").select("*").eq("path", pathname).single()

        setPageSEO(pageData || null)
      } catch (error) {
        console.error("Error fetching SEO data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchSEOData()
  }, [pathname])

  if (loading) return null

  // Determine final values, with priority: props > page SEO > global SEO
  const finalTitle = title || pageSEO?.title || globalSEO?.default_title || "Interior Design Studio"
  const finalDescription = description || pageSEO?.description || globalSEO?.default_description || ""
  const finalKeywords = keywords || pageSEO?.keywords || globalSEO?.default_keywords || ""
  const finalOgImage = ogImage || pageSEO?.og_image || globalSEO?.default_og_image || ""
  const finalOgTitle = ogTitle || pageSEO?.og_title || finalTitle
  const finalOgDescription = ogDescription || pageSEO?.og_description || finalDescription
  const finalNoIndex = noIndex !== undefined ? noIndex : pageSEO?.no_index || false

  // Construct full title with site name if available
  const fullTitle = globalSEO?.site_name ? `${finalTitle} | ${globalSEO.site_name}` : finalTitle

  return (
    <Head>
      <title>{fullTitle}</title>
      {finalDescription && <meta name="description" content={finalDescription} />}
      {finalKeywords && <meta name="keywords" content={finalKeywords} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={typeof window !== "undefined" ? window.location.href : ""} />
      <meta property="og:title" content={finalOgTitle} />
      {finalOgDescription && <meta property="og:description" content={finalOgDescription} />}
      {finalOgImage && <meta property="og:image" content={finalOgImage} />}

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={typeof window !== "undefined" ? window.location.href : ""} />
      <meta property="twitter:title" content={finalOgTitle} />
      {finalOgDescription && <meta property="twitter:description" content={finalOgDescription} />}
      {finalOgImage && <meta property="twitter:image" content={finalOgImage} />}

      {/* No index if specified */}
      {finalNoIndex && <meta name="robots" content="noindex" />}

      {/* Google Analytics */}
      {globalSEO?.google_analytics_id && (
        <>
          <script async src={`https://www.googletagmanager.com/gtag/js?id=${globalSEO.google_analytics_id}`} />
          <script
            dangerouslySetInnerHTML={{
              __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${globalSEO.google_analytics_id}');
            `,
            }}
          />
        </>
      )}
    </Head>
  )
}
