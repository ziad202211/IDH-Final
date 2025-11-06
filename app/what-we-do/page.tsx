import SectionAnimation from "@/components/section-animation"
import { WebsiteImage } from "@/components/website-image"

export default function WhatWeDoPage() {
  return (
    <main className="overflow-x-hidden pt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <SectionAnimation>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-center text-[#171A1F] mt-6 sm:mt-8 mb-10 sm:mb-16">
            What we do
          </h1>
        </SectionAnimation>

        {/* Architecture Design Section */}
        <SectionAnimation direction="right" delay={200}>
          <section className="py-10 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="order-2 lg:order-1 space-y-4 sm:space-y-6 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#171A1F]">
                  Architecture Design
                </h2>
                <p className="text-[#424955] text-base sm:text-lg leading-relaxed">
                  We craft innovative and functional architectural solutions that blend creativity, sustainability, and purpose. Every project is approached with a deep understanding of space, form, and context — transforming ideas into meaningful built environments.
                </p>
              </div>
              <div className="order-1 lg:order-2 relative h-[240px] sm:h-[320px] md:h-[404px] rounded-lg overflow-hidden">
                <WebsiteImage
                  imageId="whatwedo1"
                  alt="Architecture Design"
                  fill
                  className="object-cover"
                  fallbackSrc="/placeholder.svg?height=404&width=673"
                />
              </div>
            </div>
          </section>
        </SectionAnimation>

        {/* Interior Design Section */}
        <SectionAnimation direction="left" delay={300}>
          <section className="py-10 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="relative h-[240px] sm:h-[320px] md:h-[404px] rounded-lg overflow-hidden">
                <WebsiteImage
                  imageId="whatwedo2"
                  alt="Interior Design"
                  fill
                  className="object-cover"
                  fallbackSrc="/placeholder.svg?height=404&width=673"
                />
              </div>
              <div className="space-y-4 sm:space-y-6 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#171A1F]">
                  Interior Design
                </h2>
                <p className="text-[#424955] text-base sm:text-lg leading-relaxed">
                  Our interior design work focuses on creating spaces that inspire and reflect individuality. From concept to completion, we balance aesthetics with functionality to deliver interiors that elevate everyday experiences.
                </p>
              </div>
            </div>
          </section>
        </SectionAnimation>

        {/* Urban Planning & Landscape Design Section */}
        <SectionAnimation direction="up" delay={400}>
          <section className="py-10 sm:py-16 bg-[#171A1F] text-white -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 rounded-none sm:rounded-xl">
            <div className="container mx-auto py-8 sm:py-12">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 mb-10 sm:mb-16 text-center lg:text-left">
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-semibold">Urban Planning</h2>
                  <p className="text-base sm:text-lg leading-relaxed">
                    We design forward-thinking urban environments that promote connectivity, livability, and long-term growth. Our approach integrates social, economic, and environmental factors to shape cohesive and sustainable communities.
                  </p>
                </div>
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-2xl sm:text-3xl font-semibold">Landscape Design</h2>
                  <p className="text-base sm:text-lg leading-relaxed">
                    Our landscape design philosophy merges nature and design to create harmonious outdoor experiences. We emphasize sustainability, functionality, and beauty — crafting spaces that enhance both environment and lifestyle.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 mt-8 sm:mt-12">
                <div className="relative h-[220px] sm:h-[280px] md:h-[334px] rounded-lg overflow-hidden">
                  <WebsiteImage
                    imageId="whatwedo3"
                    alt="Urban Planning"
                    fill
                    className="object-cover"
                    fallbackSrc="/placeholder.svg?height=334&width=557"
                  />
                </div>
                <div className="relative h-[220px] sm:h-[280px] md:h-[334px] rounded-lg overflow-hidden">
                  <WebsiteImage
                    imageId="whatwedo4"
                    alt="Landscape Design"
                    fill
                    className="object-cover"
                    fallbackSrc="/placeholder.svg?height=334&width=557"
                  />
                </div>
              </div>
            </div>
          </section>
        </SectionAnimation>

        {/* Project Management Section */}
        <SectionAnimation direction="right" delay={500}>
          <section className="py-10 sm:py-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
              <div className="order-2 lg:order-1 space-y-4 sm:space-y-6 text-center lg:text-left">
                <h2 className="text-2xl sm:text-3xl font-semibold text-[#171A1F]">
                  Project Management
                </h2>
                <p className="text-[#424955] text-base sm:text-lg leading-relaxed">
                  From inception to completion, our project management team ensures every phase runs smoothly. We coordinate resources, timelines, and quality control to deliver exceptional results with precision and efficiency.
                </p>
              </div>
              <div className="order-1 lg:order-2 relative h-[240px] sm:h-[320px] md:h-[404px] rounded-lg overflow-hidden">
                <WebsiteImage
                  imageId="whatwedo5"
                  alt="Project management"
                  fill
                  className="object-cover"
                  fallbackSrc="/placeholder.svg?height=404&width=673"
                />
              </div>
            </div>
          </section>
        </SectionAnimation>
      </div>
    </main>
  )
}
