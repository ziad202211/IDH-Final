"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import SectionAnimation from "@/components/section-animation"
import { WebsiteImage } from "@/components/website-image"
import { getFeaturedProjects, type Project } from "@/lib/project-service"
import { motion } from "framer-motion"
import Image from "next/image"

export default function WhoWeArePage() {
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const data = await getFeaturedProjects(6)
        setFeaturedProjects(data)
      } catch (e) {
        console.error("Error loading featured projects:", e)
        setFeaturedProjects([])
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])
  return (
    <main className="overflow-x-hidden">
      {/* Hero Section */}
      <SectionAnimation>
        <section className="relative bg-white pt-24 pb-16 min-h-[810px] md:min-h-[600px]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="pt-8 md:pt-16 text-center lg:text-left">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-[#171A1F] mb-6">
                  Who we are
                </h1>
                <p className="text-[#424955] text-base sm:text-lg leading-relaxed max-w-lg mx-auto lg:mx-0">

                  Iwan Design House is a premium architecture and interior 
                  design firm creating high-value, functional spaces for real 
                  estate developers, hospitality brands, and high-net-worth individuals.
                  With partners in Egypt and Saudi Arabia, we deliver design solutions 
                  that blend superior aesthetics with business insight to ensure every project is profitable.

                </p>
              </div>
              <div className="relative h-64 sm:h-80 md:h-[490px] w-full">
                <WebsiteImage
                  imageId="about_hero"
                  alt="Interior design showcase"
                  fill
                  className="object-cover rounded-xl"
                  priority
                  fallbackSrc="/placeholder.svg?height=490&width=700"
                />
              </div>
            </div>
          </div>
        </section>
      </SectionAnimation>

      {/* Founders Section
      <SectionAnimation direction="left" delay={200}>
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="order-2 lg:order-1 space-y-8">
                <p className="text-[#424955] text-xl md:text-2xl leading-9">
                  We expect living to be in an aesthetic form which is also an attitude. We try to apply beautiful life
                  experience to design and to optimize the interaction between users and spaces.
                </p>
                <div className="pt-8">
                  <h3 className="text-[#323842] text-lg font-bold">Daniel Moore & Julia Lopez</h3>
                  <p className="text-[#323842]">Co-Founder A.studio</p>
                </div>
              </div>
              <div className="order-1 lg:order-2 grid grid-cols-2 gap-4">
                <div className="relative h-[530px]">
                  <WebsiteImage
                    imageId="about1"
                    alt="Founder 1"
                    fill
                    className="object-cover"
                    fallbackSrc="/placeholder.svg?height=530&width=318"
                  />
                </div>
                <div className="relative h-[530px]">
                  <WebsiteImage
                    imageId="about2"
                    alt="Founder 2"
                    fill
                    className="object-cover"
                    fallbackSrc="/placeholder.svg?height=530&width=318"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>
      </SectionAnimation> */}
      {/* Partners Section */}
      <SectionAnimation direction="left" delay={200}>
        <section className="bg-white py-16">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-semibold text-center text-[#171A1F] mb-10 sm:mb-12">
              Our Trusted Partners
            </h2>

            {/* Slider Wrapper */}
            <div className="overflow-hidden relative">
              <motion.div
                className="flex gap-12"
                animate={{ x: ["0%", "-100%"] }}
                transition={{
                  repeat: Infinity,
                  duration: 30,
                  ease: "linear",
                }}
              >
                {/* Duplicate slides for infinite loop */}
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="flex gap-12">
                    {[
                      { id: "partner1", alt: "Partner 1" },
                      { id: "partner2", alt: "Partner 2" },
                      { id: "partner3", alt: "Partner 3" },
                      { id: "partner4", alt: "Partner 4" },
                      { id: "partner5", alt: "Partner 5" },
                      { id: "partner6", alt: "Partner 6" },
                    ].map((p, index) => (
                      <div
                        key={`${i}-${p.id}-${index}`}
                        className="relative w-40 h-20 flex-shrink-0 grayscale hover:grayscale-0 transition-all"
                      >
                        <WebsiteImage
                          imageId={p.id}
                          alt={p.alt}
                          fill
                          className="object-contain"
                          fallbackSrc="/placeholder.svg?height=80&width=160"
                        />
                      </div>
                    ))}
                  </div>
                ))}
              </motion.div>
            </div>
          </div>
        </section>
      </SectionAnimation>


      {/* Meet Our Team Section */}
      <SectionAnimation direction="right" delay={300}>
        <section className="bg-white py-16">
          <div className="container mx-auto px-4 lg:px-8">
            <h2 className="text-4xl font-semibold text-center text-[#171A1F] mb-12">Meet Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { id: "ceo", name: "Eng. Ahmed ElDakroory", imageId: "team1" ,role: "CEO"},
                { id: "Operation Manager", name: "Mahmoud Hazem", imageId: "team2" ,role: "Operation Manager"},
                { id: " Architecture Team", name: "Mohamed Suleiman", imageId: "team3" ,role: "Head of Architecture"},
                { id: "Interior Design Team", name: "Mostafa Hesham", imageId: "team4" ,role: "Head of Interior Design"},
                { id: "Marketing Team", name: "Ziad Rashad", imageId: "team5" ,role: "Head of Marketing"},
                { id: "Business Team", name: "Osama Abo Azab", imageId: "team6" ,role: "Head of Business"},
                { id: "Technical Team", name: "Magdy Abo Rayah", imageId: "team7" ,role: "Head of Technical"},
                { id: "Admin", name: "Hussein Khaled", imageId: "team8" ,role: "Strategy & Ops Coordinator"},


              ].map((member) => (
                <div
                  key={member.id}
                  className="border border-[#dee1e6] overflow-hidden h-[569px] relative hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="relative h-[491px] overflow-hidden">
                    <WebsiteImage
                      imageId={member.imageId}
                      alt={member.name}
                      fill
                      className="object-cover transition-transform duration-300 hover:scale-105"
                      fallbackSrc="/placeholder.svg?height=491&width=368"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-[#171A1F]">{member.name}</h3>
                    <h5 className="text-sm font-normal text-[#171A1F]">{member.role}</h5>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </SectionAnimation>

      {/* Our Process Section */}
       {/* Our Process Section */}
      <SectionAnimation direction="up" delay={400}>
        <section className="bg-[#171A1F] py-16 text-white">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl sm:text-4xl font-semibold text-center mb-10 sm:mb-12">
              Our Process
            </h2>

            <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6 mb-6">
              <div className="col-span-2 bg-[#1D2128] relative rounded-xl overflow-hidden">
                <div className="p-6 sm:p-10 pr-0 lg:pr-[305px] relative z-10 min-h-[260px] sm:min-h-[290px]">
                  <div className="text-[#636AE8] text-[140px] sm:text-[200px] font-semibold absolute top-0 left-4 opacity-15 leading-none">
                    1
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-4">Preconstruction Design</h3>
                  <p className="text-sm sm:text-base leading-relaxed">
                    Officia elit ipsum ad velit exercitation do est nisi elit. Exercitation reprehenderit cupidatat
                    fugiat voluptate mollit mollit fugiat consequa
                  </p>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-[200px] sm:w-[305px] hidden md:block">
                  <WebsiteImage
                    imageId="process1"
                    alt="Preconstruction Design"
                    fill
                    className="object-cover"
                    fallbackSrc="/placeholder.svg?height=290&width=305"
                  />
                </div>
              </div>
              <div className="bg-[#171A1F] p-6 sm:p-10 rounded-xl">
                <div className="text-[#636AE8] text-[140px] sm:text-[200px] font-semibold absolute opacity-15 leading-none">
                  2
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4">Design & Construction Estimate</h3>
                <p className="text-sm sm:text-base leading-relaxed">
                  Qui nisi sint excepteur irure incididunt nostrud consectetur ad voluptate eiusmod esse voluptate id ut
                  commodo in reprehen
                </p>
              </div>
            </div>

            <div className="space-y-6 lg:space-y-0 lg:grid lg:grid-cols-3 lg:gap-6 mb-12">
              <div className="bg-[#171A1F] p-6 sm:p-10 rounded-xl">
                <div className="text-[#636AE8] text-[140px] sm:text-[200px] font-semibold absolute opacity-15 leading-none">
                  3
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold mb-4">On-Site Consultations</h3>
                <p className="text-sm sm:text-base leading-relaxed">
                  Proident duis adipisicing duis irure occaecat est nisi cupidatat anim duis proident ut enim nulla
                  veniam ea sunt dolore
                </p>
              </div>
              <div className="col-span-2 bg-[#1D2128] relative rounded-xl overflow-hidden">
                <div className="p-6 sm:p-10 pr-0 lg:pr-[305px] relative z-10 min-h-[260px] sm:min-h-[290px]">
                  <div className="text-[#636AE8] text-[140px] sm:text-[200px] font-semibold absolute top-0 left-4 opacity-15 leading-none">
                    4
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold mb-4">The Finishing Touches</h3>
                  <p className="text-sm sm:text-base leading-relaxed">
                    Ut ut aliqua mollit amet cupidatat minim cillum fugiat cillum quis ullamco sint culpa ullamco
                    commodo amet. Nostrud enim pariatur et ad
                  </p>
                </div>
                <div className="absolute right-0 top-0 bottom-0 w-[200px] sm:w-[305px] hidden md:block">
                  <WebsiteImage
                    imageId="process2"
                    alt="Finishing Touches"
                    fill
                    className="object-cover"
                    fallbackSrc="/placeholder.svg?height=290&width=305"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-center">
              <Button className="btn-secondary">Contact us</Button>
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
    </main>
  )
} 
