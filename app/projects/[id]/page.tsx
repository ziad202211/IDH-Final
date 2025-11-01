"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react"
import SectionAnimation from "@/components/section-animation"

type ProjectDetails = {
  id: string
  title: string
  category: string
  description: string
  featured: boolean
  location?: string
  area?: string
  completed?: string
  images: string[]
  created_at: string
}

export default function ProjectDetailsPage() {
  const params = useParams()
  const router = useRouter()
  const [project, setProject] = useState<ProjectDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)

  const testimonials = [
    {
      name: "William King",
      text: "Sit aliquip excepteur aliqua dolore aliquip ullamco enim non amet pariatur aliqua occaecat dolor anim ea.",
    },
    {
      name: "Angel Gomez",
      text: "Amet pariatur nostrud cupidatat ex sit consectetur laborum tempor quis duis in.",
    },
    {
      name: "Anthony Adams",
      text: "Consequat cupidatat duis magna ad eiusmod nostrud eu incididunt reprehenderit quis quis reprehenderit proident commodo.",
    },
  ]
  const [testimonialIndex, setTestimonialIndex] = useState(0)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (mounted && params.id) fetchProject()
  }, [mounted, params.id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const res = await fetch(`/api/projects/${params.id}`)
      const data = await res.json()
      if (data.success && data.data) setProject(data.data)
      else setProject(getSampleProject())
    } catch (e) {
      console.error(e)
      setProject(getSampleProject())
    } finally {
      setLoading(false)
    }
  }

  const getSampleProject = (): ProjectDetails => ({
    id: params.id as string,
    title: "Sample Project",
    category: "House",
    description:
      "This is a sample project description. The project features modern design elements with a focus on sustainability and comfort.",
    featured: true,
    location: "San Francisco, CA",
    area: "180 m²",
    completed: "2023",
    images: Array.from({ length: 12 }, (_, i) => `/placeholder.svg?height=600&width=800&text=Image+${i + 1}`),
    created_at: new Date().toISOString(),
  })

  const nextImage = () => {
    if (!project) return
    setCurrentImageIndex((prev) => (prev + 1) % project.images.length)
  }
  const prevImage = () => {
    if (!project) return
    setCurrentImageIndex((prev) => (prev - 1 + project.images.length) % project.images.length)
  }

  const nextTestimonial = () =>
    setTestimonialIndex((prev) => (prev === testimonials.length - 1 ? 0 : prev + 1))
  const prevTestimonial = () =>
    setTestimonialIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))

  const openImage = (idx: number) => {
    setLightboxIndex(idx)
    setIsLightboxOpen(true)
  }
  const closeLightbox = () => setIsLightboxOpen(false)

  const nextLightboxImage = () => {
    if (!project) return
    setLightboxIndex((prev) => (prev + 1) % project.images.length)
  }
  const prevLightboxImage = () => {
    if (!project) return
    setLightboxIndex((prev) => (prev - 1 + project.images.length) % project.images.length)
  }

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!isLightboxOpen) return
      if (e.key === "ArrowRight") nextLightboxImage()
      if (e.key === "ArrowLeft") prevLightboxImage()
      if (e.key === "Escape") closeLightbox()
    }
    window.addEventListener("keydown", handleKey)
    return () => window.removeEventListener("keydown", handleKey)
  }, [isLightboxOpen])

  // Parallax effect for gallery tiles
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return

    const updateParallax = () => {
      const tiles = container.querySelectorAll<HTMLElement>("[data-parallax]")
      tiles.forEach((el) => {
        const speed = parseFloat(el.dataset.parallax || "0.1")
        const rect = el.getBoundingClientRect()
        const viewportMid = window.innerHeight / 2
        const distanceFromCenter = rect.top + rect.height / 2 - viewportMid
        const translateY = -distanceFromCenter * speed * 0.2
        el.style.transform = `translateY(${translateY.toFixed(2)}px)`
      })
    }

    window.addEventListener("scroll", updateParallax, { passive: true })
    window.addEventListener("resize", updateParallax)
    updateParallax()
    return () => {
      window.removeEventListener("scroll", updateParallax)
      window.removeEventListener("resize", updateParallax)
    }
  }, [])

  if (!mounted)
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-pulse h-12 w-12 rounded-full bg-gray-300"></div>
      </div>
    )

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#636AE8]"></div>
      </div>
    )

  if (!project)
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-16">
        <h1 className="text-2xl font-semibold mb-4">Project not found</h1>
        <Link href="/projects" >
          <Button className="btn-primary">Back to Projects</Button>
        </Link>
      </div>
    )

  return (
    <main className="overflow-x-hidden pt-16 bg-[#F8F8F8]">
      {/* Hero Section */}
      <SectionAnimation>
        <section className="relative bg-white">
          <div className="container mx-auto px-4 lg:px-8 mt-8">
            <div className="flex items-center gap-2 py-6">
              <Link href="/projects" className="text-sm text-[#171A1F] hover:underline flex items-center ">
                <ArrowLeft className="h-4 w-4 mr-1 " />
                Back to Projects
              </Link>
              <span className="text-gray-400 mx-2">/</span>
              <Link href={`/projects?category=${encodeURIComponent(project.category)}`} className="hover:underline">
              <span className="text-sm text-[#171A1F]">{project.category}</span>
              </Link>
              <span className="text-gray-400 mx-2">/</span>
              <span className="text-sm text-[#171A1F] font-medium">{project.title}</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-semibold text-[#171A1F] mb-8">
              {project.title}
            </h1>

            <div className="relative h-[490px] w-full mb-16 rounded-xl overflow-hidden shadow-md">
              <Image
                src={project.images[currentImageIndex]}
                alt={project.title}
                fill
                className="object-cover transition-transform duration-700 ease-in-out"
                priority
              />
              <div className="absolute inset-0 flex items-center justify-between px-4">
                <Button
                  size="icon"
                  className="bg-black/40 hover:bg-black/70 rounded-full h-12 w-12"
                  onClick={prevImage}
                >
                  <ChevronLeft className="h-6 w-6 text-white" />
                </Button>
                <Button
                  size="icon"
                  className="bg-black/40 hover:bg-black/70 rounded-full h-12 w-12"
                  onClick={nextImage}
                >
                  <ChevronRight className="h-6 w-6 text-white" />
                </Button>
              </div>
            </div>
          </div>
        </section>
      </SectionAnimation>

      {/* Project Info */}
      <SectionAnimation direction="left" delay={200}>
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-8">
                <div className="border border-[#dee1e6] overflow-hidden rounded-lg">
                  {[
                    ["Project", `${project.title} - ${project.category}`],
                    ["Location", project.location ],
                    ["Area", project.area ],
                    ["Completed", project.completed ],
                  ].map(([label, value], i) => (
                    <div key={i} className="grid grid-cols-2 border-b border-[#dee1e6] last:border-b-0">
                      <div className="p-4 border-r border-[#dee1e6] font-medium text-[#171A1F]">
                        {label}
                      </div>
                      <div className="p-4 text-[#171A1F]">{value}</div>
                    </div>
                  ))}
                </div>

                <p className="text-[#424955] text-lg leading-relaxed">{project.description}</p>

                <Link href="/contact">
                  <Button className="btn-primary px-8 py-5 text-lg" style={{marginTop:'14px'}}>Contact us</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </SectionAnimation>

      {/* Premium Masonry Gallery */}
      {/* Masonry Gallery – Larger View */}
<SectionAnimation direction="right" delay={300}>
  <section className="bg-white py-24" ref={scrollRef}>
    <div className="container mx-auto px-4 lg:px-8">
      <h2 className="text-3xl md:text-4xl font-semibold text-[#171A1F] mb-12 text-center">
        Project Gallery
      </h2>

      <div
        className="
          columns-1 sm:columns-2 md:columns-2 lg:columns-3
          gap-6 [column-fill:_balance]
        "
      >
        {project.images.map((img, idx) => (
          <div
            key={idx}
            data-parallax={(0.1 + (idx % 4) * 0.03).toFixed(2)}
            className="
              mb-6 break-inside-avoid overflow-hidden
              rounded-3xl relative group cursor-pointer
            "
            onClick={() => openImage(idx)}
          >
            <Image
              src={img}
              alt={`${project.title} - ${idx + 1}`}
              width={1000}
              height={800}
              className="
                w-full h-auto object-cover rounded-3xl
                transition-transform duration-700 ease-out
                group-hover:scale-[1.08] group-hover:brightness-110
              "
            />
            <div
              className="
                absolute inset-0 bg-black/40
                opacity-0 group-hover:opacity-100
                transition-opacity duration-500
                flex items-center justify-center
              "
            >
              <p className="text-white text-sm uppercase tracking-wide">
                View
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* <div className="flex justify-center mt-20">
        <Link href="/contact">
          <Button className="btn-primary px-10 py-6 text-lg shadow-md hover:scale-105 transition-transform">
            Contact us
          </Button>
        </Link>
      </div> */}
    </div>
  </section>
</SectionAnimation>


      {/* Testimonials */}
      <SectionAnimation direction="right" delay={500}>
  <section className="py-20 bg-gradient-to-b from-[#0F1115] to-[#1D2128]">
    <div className="container mx-auto px-4 lg:px-8">
      <div className="rounded-3xl overflow-hidden shadow-xl border border-gray-800">
        <div className="grid grid-cols-1 lg:grid-cols-4">
          {/* Left Panel */}
          <div className="bg-black p-10 flex flex-col justify-between">
            <div>
              <h2 className="text-3xl font-semibold text-[#636AE8] mb-4">
                Testimonials
              </h2>
              <p className="text-gray-400 text-sm leading-relaxed">
                What our clients say about their experience working with us.
              </p>
            </div>
            <div className="flex gap-4 mt-10">
              <Button
                size="icon"
                variant="outline"
                className="rounded-full border-[#636AE8] text-[#636AE8] hover:bg-[#636AE8] hover:text-white transition-all duration-300"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                size="icon"
                variant="outline"
                className="rounded-full border-[#636AE8] text-[#636AE8] hover:bg-[#636AE8] hover:text-white transition-all duration-300"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Testimonial 1 */}
          <div className="p-10 border-t lg:border-t-0 border-r border-gray-800 hover:bg-[#22252E] transition-colors duration-300">
            <p className="text-gray-300 text-sm leading-relaxed mb-8">
              “Working with Iwan Design House was seamless. Their team captured
              our vision perfectly and elevated it into something truly
              remarkable.”
            </p>
            <div>
              <h3 className="text-lg font-medium text-white">William King</h3>
              <p className="text-xs text-gray-500">Real Estate Developer</p>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="p-10 border-t lg:border-t-0 border-r border-gray-800 hover:bg-[#22252E] transition-colors duration-300">
            <p className="text-gray-300 text-sm leading-relaxed mb-8">
              “Their interior design approach is both strategic and creative.
              Every detail was considered, resulting in a timeless and
              functional space.”
            </p>
            <div>
              <h3 className="text-lg font-medium text-white">Angel Gomez</h3>
              <p className="text-xs text-gray-500">Hospitality Brand Owner</p>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="p-10 border-t lg:border-t-0 hover:bg-[#22252E] transition-colors duration-300">
            <p className="text-gray-300 text-sm leading-relaxed mb-8">
              “Their professionalism and creativity exceeded expectations. The
              final outcome reflected both luxury and functionality.”
            </p>
            <div>
              <h3 className="text-lg font-medium text-white">Anthony Adams</h3>
              <p className="text-xs text-gray-500">Private Client</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</SectionAnimation>


      {/* Lightbox */}
      {isLightboxOpen && project && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <Button
            size="icon"
            className="absolute top-6 right-6 bg-white/20 hover:bg-white/40 rounded-full"
            onClick={closeLightbox}
          >
            ✕
          </Button>

          <Button
            size="icon"
            className="absolute left-6 bg-white/20 hover:bg-white/40 rounded-full"
            onClick={prevLightboxImage}
          >
            <ChevronLeft className="h-7 w-7 text-white" />
          </Button>

          <div className="relative w-[90vw] h-[80vh]">
            <Image
              src={project.images[lightboxIndex]}
              alt={`Expanded view ${lightboxIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          <Button
            size="icon"
            className="absolute right-6 bg-white/20 hover:bg-white/40 rounded-full"
            onClick={nextLightboxImage}
          >
            <ChevronRight className="h-7 w-7 text-white" />
          </Button>
        </div>
      )}
    </main>
  )
}
