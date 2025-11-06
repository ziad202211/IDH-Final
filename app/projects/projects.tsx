"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import SectionAnimation from "@/components/section-animation"
import { getAllProjects, getProjectsByCategory, type Project } from "@/lib/project-service"

function CrossfadeImage({ src, alt }: { src: string; alt: string }) {
  const [currentSrc, setCurrentSrc] = useState(src)
  const [prevSrc, setPrevSrc] = useState<string | null>(null)
  const [showNew, setShowNew] = useState(false)

  useEffect(() => {
    if (src !== currentSrc) {
      setPrevSrc(currentSrc)
      setCurrentSrc(src)
      setShowNew(true)
      const timer = setTimeout(() => {
        setPrevSrc(null)
        setShowNew(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [src, currentSrc])

  return (
    <>
      {prevSrc && <Image src={prevSrc} alt={alt} fill className="object-cover" />}
      <Image
        src={currentSrc}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${showNew ? "opacity-0" : "opacity-100"}`}
        onLoadingComplete={() => requestAnimationFrame(() => setShowNew(false))}
      />
    </>
  )
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState("All")
  const [featuredIndex, setFeaturedIndex] = useState(0)
  const [projectIndexById, setProjectIndexById] = useState<Record<string, number>>({})
  const categories = ["All", "House", "Malls", "Hotels", "Offices", "Residential", "Other"]

  const router = useRouter()
  const searchParams = useSearchParams()
  const queryCategory = searchParams.get("category") || "All"

  useEffect(() => {
    filterByCategory(queryCategory)
  }, [queryCategory])

  const getSampleProjects = (): Project[] => [
    {
      id: "1",
      title: "Harmony House",
      category: "House",
      description: "A beautiful modern house with harmony in design.",
      featured: true,
      images: ["/placeholder.svg?height=526&width=877"],
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "The Coffee Corner",
      category: "Food & Beverage",
      description: "A cozy coffee shop with modern design.",
      featured: false,
      images: ["/placeholder.svg?height=526&width=877"],
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Paradis Hotel",
      category: "Hotels",
      description: "Luxury hotel with stunning views.",
      featured: true,
      images: ["/placeholder.svg?height=526&width=877"],
      created_at: new Date().toISOString(),
    },
  ]

  const filterByCategory = async (category: string) => {
    const normalized = category.trim()
    setActiveCategory(normalized)
    setLoading(true)
    try {
      let data: Project[]
      if (normalized === "All") {
        data = await getAllProjects()
      } else {
        data = await getProjectsByCategory(normalized)
      }
      setProjects(data)
      const initial: Record<string, number> = {}
      for (const p of data) initial[p.id] = 0
      setProjectIndexById(initial)
      setFeaturedIndex(0)
    } catch (error) {
      console.error("Error filtering projects:", error)
      let sample = getSampleProjects()
      if (normalized !== "All") sample = sample.filter((p) => p.category === normalized)
      setProjects(sample)
      const initial: Record<string, number> = {}
      for (const p of sample) initial[p.id] = 0
      setProjectIndexById(initial)
      setFeaturedIndex(0)
    } finally {
      setLoading(false)
    }
  }

  const handleCategoryClick = (category: string) => {
    const newUrl = category === "All" ? "/projects" : `/projects?category=${encodeURIComponent(category)}`
    router.push(newUrl)
  }

  return (
    <main className="overflow-x-hidden pt-12 sm:pt-16">
      <div className="container mx-auto px-3 sm:px-4 lg:px-8 py-10 sm:py-16">
        <SectionAnimation>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center text-[#171A1F] mt-6 sm:mt-8 mb-8 sm:mb-12">
            Our Projects
          </h1>
        </SectionAnimation>

        {/* Filter Buttons */}
        <SectionAnimation direction="up" delay={100}>
          <div className="flex flex-wrap justify-center mb-10 sm:mb-16 border border-white overflow-hidden rounded-md">
            {categories.map((category) => (
              <button
                key={category}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base ${
                  activeCategory === category
                    ? "bg-[#323842] text-white"
                    : "text-[#323842] hover:bg-gray-100 border-l border-[#dee1e6]"
                }`}
                onClick={() => handleCategoryClick(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </SectionAnimation>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-[#636AE8]"></div>
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-20">
            <h3 className="text-lg sm:text-xl font-medium text-gray-700">No projects found</h3>
            <p className="text-gray-500 mt-2 text-sm sm:text-base">Try selecting a different category</p>
          </div>
        ) : (
          <>
            {/* Featured Project */}
            {projects.filter((p) => p.featured).length > 0 && (
              <SectionAnimation direction="left" delay={200}>
                <section className="mb-16 sm:mb-24">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8">
                    <div className="space-y-3 sm:space-y-4 px-2 sm:px-0 text-center lg:text-left">
                      <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#171A1F]">
                        Featured Project
                      </h2>
                      <p className="text-[#424955] text-sm sm:text-base">
                        {projects.find((p) => p.featured)?.description ||
                          "Our featured project showcases our best work."}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 mt-6 sm:mt-8 relative">
                    <div className="lg:col-span-2 relative h-[200px] sm:h-[400px] md:h-[526px]">
                      {(() => {
                        const featured = projects.find((p) => p.featured)
                        const images = featured?.images || []
                        const idx = images.length ? featuredIndex % images.length : 0
                        const src = images.length ? images[idx] : "/placeholder.svg?height=526&width=877"
                        return <CrossfadeImage src={src} alt="Project showcase" />
                      })()}
                      <Button
                        size="icon"
                        onClick={() => {
                          const featured = projects.find((p) => p.featured)
                          const len = featured?.images?.length || 0
                          if (len > 0) setFeaturedIndex((i) => (i - 1 + len) % len)
                        }}
                        className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 bg-[#cfd2da] hover:bg-[#bbbfc8] rounded-full h-8 w-8 sm:h-12 sm:w-12"
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6" />
                      </Button>
                    </div>
                    <div className="relative h-[200px] sm:h-[400px] md:h-[526px]">
                      {(() => {
                        const featured = projects.find((p) => p.featured)
                        const images = featured?.images || []
                        const len = images.length
                        const nextIdx = len ? (featuredIndex + 1) % len : 0
                        const src = len ? images[nextIdx] : "/placeholder.svg?height=526&width=537"
                        return <CrossfadeImage src={src} alt="Project detail" />
                      })()}
                      <Button
                        size="icon"
                        onClick={() => {
                          const featured = projects.find((p) => p.featured)
                          const len = featured?.images?.length || 0
                          if (len > 0) setFeaturedIndex((i) => (i + 1) % len)
                        }}
                        className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 bg-[#171A1F] hover:bg-[#2A2D35] rounded-full h-8 w-8 sm:h-12 sm:w-12"
                      >
                        <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                      </Button>
                    </div>
                  </div>
                </section>
              </SectionAnimation>
            )}

            {/* Project List */}
            {projects.map((project, index) => (
              <SectionAnimation
                key={project.id}
                direction={index % 2 === 0 ? "right" : "left"}
                delay={300 + index * 100}
              >
                <section className="mb-16 sm:mb-24">
                  <div className="flex flex-wrap justify-between items-center mb-6 sm:mb-8 px-2 sm:px-0">
                    <div>
                      <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#171A1F]">
                        {project.title}
                      </h2>
                      <p className="text-[#171A1F] text-xs sm:text-sm">{project.category}</p>
                    </div>
                    <Link href={`/projects/${project.id}`}>
                      <Button variant="outline" className="border-[#171A1F] text-[#171A1F] text-sm sm:text-base">
                        View more
                      </Button>
                    </Link>
                  </div>

                  {/* ✅ Changed grid for mobile: 2 columns */}
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6 relative">
                    <div
                      className={`${index % 2 === 0 ? "lg:col-span-2" : ""} relative h-[180px] sm:h-[400px] md:h-[526px]`}
                    >
                      {(() => {
                        const len = project.images?.length || 0
                        const idx = projectIndexById[project.id] ? projectIndexById[project.id] % len : 0
                        const src = len ? project.images[idx] : "/placeholder.svg?height=526&width=877"
                        return <CrossfadeImage src={src} alt={project.title} />
                      })()}
                      <Button
                        size="icon"
                        onClick={() => {
                          const len = project.images?.length || 0
                          if (len > 0) {
                            setProjectIndexById((map) => ({
                              ...map,
                              [project.id]: ((map[project.id] || 0) - 1 + len) % len,
                            }))
                          }
                        }}
                        className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 bg-[#171A1F] hover:bg-[#2A2D35] rounded-full h-7 w-7 sm:h-12 sm:w-12"
                      >
                        <ChevronLeft className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                      </Button>
                    </div>
                    <div
                      className={`${index % 2 !== 0 ? "lg:col-span-2" : ""} relative h-[180px] sm:h-[400px] md:h-[526px]`}
                    >
                      {(() => {
                        const len = project.images?.length || 0
                        const base = projectIndexById[project.id] || 0
                        const nextIdx = len ? (base + 1) % len : 0
                        const src = len ? project.images[nextIdx] : "/placeholder.svg?height=526&width=537"
                        return <CrossfadeImage src={src} alt={`${project.title} detail`} />
                      })()}
                      <Button
                        size="icon"
                        onClick={() => {
                          const len = project.images?.length || 0
                          if (len > 0) {
                            setProjectIndexById((map) => ({
                              ...map,
                              [project.id]: ((map[project.id] || 0) + 1) % len,
                            }))
                          }
                        }}
                        className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 bg-[#171A1F] hover:bg-[#2A2D35] rounded-full h-7 w-7 sm:h-12 sm:w-12"
                      >
                        <ChevronRight className="h-4 w-4 sm:h-6 sm:w-6 text-white" />
                      </Button>
                    </div>
                  </div>
                </section>
              </SectionAnimation>
            ))}
          </>
        )}

        {/* Load More Button */}
        <SectionAnimation direction="up" delay={600}>
          <div className="flex justify-center mt-12 sm:mt-16 mb-6 sm:mb-8">
            <Button className="btn-primary text-sm sm:text-base px-5 sm:px-8 py-2 sm:py-3">
              Load more
            </Button>
          </div>
        </SectionAnimation>
      </div>
    </main>
  )
}
