"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Play, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import SectionAnimation from "@/components/section-animation"
import { getSupabaseClient, type Project } from "@/lib/supabase"
import { WebsiteImage } from "@/components/website-image"

export default function Home() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFeaturedProjects()
  }, [])

  const fetchFeaturedProjects = async () => {
    try {
      const supabase = getSupabaseClient()

      if (!supabase) {
        console.error("Supabase client not initialized")
        setFeaturedProjects(getSampleProjects())
        setLoading(false)
        return
      }

      const { data, error } = await supabase.from("projects").select("*").eq("featured", true).limit(6)

      if (error) {
        console.error("Error fetching featured projects:", error)
        setFeaturedProjects(getSampleProjects())
      } else {
        setFeaturedProjects(data?.length ? data : getSampleProjects())
      }
    } catch (error) {
      console.error("Error:", error)
      setFeaturedProjects(getSampleProjects())
    } finally {
      setLoading(false)
    }
  }

  // Sample projects as fallback
  const getSampleProjects = (): Project[] => [
    {
      id: "1",
      title: "Harmony House",
      category: "House",
      description: "A beautiful modern house with harmony in design.",
      featured: true,
      images: ["/placeholder.svg?height=276&width=368"],
      created_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "The Coffee Corner",
      category: "Food & Beverage",
      description: "A cozy coffee shop with modern design.",
      featured: true,
      images: ["/placeholder.svg?height=276&width=368"],
      created_at: new Date().toISOString(),
    },
    {
      id: "3",
      title: "Paradis hotel",
      category: "Hotels",
      description: "Luxury hotel with stunning views.",
      featured: true,
      images: ["/placeholder.svg?height=276&width=368"],
      created_at: new Date().toISOString(),
    },
    {
      id: "4",
      title: "NeuWave Offices",
      category: "Offices",
      description: "Modern office space for productivity.",
      featured: true,
      images: ["/placeholder.svg?height=276&width=368"],
      created_at: new Date().toISOString(),
    },
    {
      id: "5",
      title: "Tranquil Tides Hotel and Spa",
      category: "Hotels",
      description: "Relaxing hotel and spa retreat.",
      featured: true,
      images: ["/placeholder.svg?height=276&width=368"],
      created_at: new Date().toISOString(),
    },
    {
      id: "6",
      title: "Charming Cottage",
      category: "House",
      description: "A charming cottage in the countryside.",
      featured: true,
      images: ["/placeholder.svg?height=276&width=368"],
      created_at: new Date().toISOString(),
    },
  ]

  return (
    <main className="overflow-x-hidden">
      {/* Hero Section */}
      <SectionAnimation>
        <section className="relative bg-white min-h-[810px]">
          <div className="container mx-auto px-4 lg:px-8">
            {/* Hero Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-20 pb-10">
              <div className="flex flex-col justify-center space-y-6">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal text-[#171A1F]">
                  Find your
                  <span className="block font-bold">dream space</span>
                </h1>
                <p className="text-[#424955] text-lg max-w-md">
                  We are an innovative interior design and construction company dedicated to transforming spaces into
                  stunning works of art.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Link href="/contact">
                    <Button className="btn-primary px-8 py-6">Let&apos;s chat</Button>
                  </Link>
                  <Link href="/projects">
                    <Button variant="outline" className="px-8 py-6">
                      View our work
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative h-[490px]">
                <WebsiteImage
                  imageId="hero"
                  alt="Interior design showcase"
                  fill
                  className="object-cover"
                  priority
                  fallbackSrc="/placeholder.svg?height=490&width=700"
                />
                <div className="absolute right-4 bottom-4 md:right-8 md:bottom-8">
                  <Button size="icon" className="rounded-full bg-[#171A1F] hover:bg-[#2A2D35] h-12 w-12">
                    <Play className="h-6 w-6 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionAnimation>

      {/* What We Do Section */}
      <SectionAnimation direction="right" delay={200}>
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <h2 className="text-4xl font-semibold text-[#171A1F]">What we do</h2>
                <div className="border border-[#dee1e6] rounded-md overflow-hidden">
                  {[
                    "Architecture Design",
                    " Interior Design",
                    "Urban Planning",
                    "Landscape Design",
                    "Project Management ",
                  ].map((service, index) => (
                    <div key={index} className="border-b border-[#dee1e6] last:border-b-0">
                      <div className="p-4">
                        <h3 className="text-xl md:text-2xl text-[#171A1F]">{service}</h3>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative h-[530px]">
                  <WebsiteImage
                    imageId="about1"
                    alt="Interior design showcase 1"
                    fill
                    className="object-cover"
                    fallbackSrc="/placeholder.svg?height=530&width=318"
                  />
                </div>
                <div className="relative h-[530px]">
                  <WebsiteImage
                    imageId="about2"
                    alt="Interior design showcase 2"
                    fill
                    className="object-cover"
                    fallbackSrc="/placeholder.svg?height=530&width=318"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionAnimation>

      {/* About Us Section */}
      <SectionAnimation direction="left" delay={300}>
        <section className="bg-[#171A1F] py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="relative h-[490px]">
                <WebsiteImage
                  imageId="about_hero"
                  alt="About us"
                  fill
                  className="object-cover"
                  fallbackSrc="/placeholder.svg?height=490&width=817"
                />
              </div>
              <div className="text-white space-y-8">
                <h2 className="text-4xl font-semibold">About us</h2>
                <p className="text-base md:text-lg">
                  Work without benefit in non-exceptional areas, with carelessness and oversight. A desire for pain
                  results from wrongdoing, neglect, and focus.
                </p>
                <div className="border-t border-white pt-4 ">
                  <h3 className="text-xl font-semibold mb-4">Why Choose Us</h3>
                  <ul className="space-y-4">
                    <li className="flex items-start">
                      <div className="h-4 w-4 rounded-full bg-white mt-1 mr-3"></div>
                      <span>Preferential Price</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-4 w-4 rounded-full bg-white mt-1 mr-3"></div>
                      <span>After Care</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-4 w-4 rounded-full bg-white mt-1 mr-3"></div>
                      <span>We convey the unique appeal and color plan</span>
                    </li>
                    <li className="flex items-start">
                      <div className="h-4 w-4 rounded-full bg-white mt-1 mr-3"></div>
                      <span>We provide the most effective exclusive solutions</span>
                    </li>
                  </ul>
                </div>
                <br />
                <Link href="/who-we-are" >
                  <Button className="btn-secondary">View more</Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </SectionAnimation>

      {/* Recent Projects Section */}
      <SectionAnimation direction="left" delay={500}>
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-4xl font-semibold text-center text-[#171A1F] mb-12">Recent Projects</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {loading
                ? Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <div key={index} className="border border-[#dee1e6] overflow-hidden animate-pulse">
                      <div className="bg-gray-200 h-[276px]"></div>
                      <div className="p-6">
                        <div className="h-5 bg-gray-200 rounded w-2/3 mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </div>
                    </div>
                  ))
                : featuredProjects.map((project) => (
                  <Link href={`/projects/${project.id}`} key={project.id}>
                    <div className="border border-[#dee1e6] overflow-hidden hover:shadow-lg transition-shadow duration-300">
                      <div className="relative h-[276px] overflow-hidden">
                        <WebsiteImage
                          imageId={project.id}
                          alt={project.title}
                          fill
                          className="object-cover transition-transform duration-300 hover:scale-105"
                          fallbackSrc={project.images?.[0] || "/placeholder.svg?height=276&width=368"}
                        />
                      </div>
                      <div className="p-6">
                        <h3 className="text-lg font-semibold text-[#171A1F]">{project.title}</h3>
                        <p className="text-[#171A1F] mt-1">{project.category}</p>
                      </div>
                    </div>
                  </Link>
                ))}
            </div>

            <div className="flex justify-center mt-12">
              <Link href="/projects">
                <Button className="btn-primary">View more</Button>
              </Link>
            </div>
          </div>
        </section>
      </SectionAnimation>

      {/* Testimonials Section */}
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


      {/* Newsletter Section - New Feature */}
      <SectionAnimation direction="up" delay={600}>
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-semibold text-[#171A1F] mb-4">Subscribe to our newsletter</h2>
              <p className="text-[#424955] mb-8">
                Stay updated with our latest projects, design tips, and exclusive offers.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Your email address"
                  className="flex-1 px-4 py-3 border border-[#dee1e6] rounded-md focus:outline-none focus:ring-2 focus:ring-[#636AE8]"
                />
                <Button className="btn-secondary whitespace-nowrap">Subscribe</Button>
              </div>
            </div>
          </div>
        </section>
      </SectionAnimation>
    </main>
  )
}
