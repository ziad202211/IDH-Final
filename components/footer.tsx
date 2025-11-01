import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Facebook, Twitter, Instagram, Linkedin, ImagesIcon } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-[#171A1F] text-white">
      <div className="container mx-auto px-4 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Logo and Description */}
          <div className="space-y-6">
            <h2 className="text-xl font-bold">DESIGN STUDIO</h2>
            <p className="text-gray-400">
              We are an innovative interior design and construction company dedicated to transforming spaces into
              stunning works of art.
            </p>
            <div className="flex space-x-4">
              <Link href="https://www.facebook.com/IWANDesignHouse/" className="hover:text-[#636AE8] transition-colors">
                <Facebook className="h-5 w-5" />
                <span className="sr-only">Facebook</span>
              </Link>
              <Link href="https://www.instagram.com/iwandesignhouse/" className="hover:text-[#636AE8] transition-colors">
                <Instagram className="h-5 w-5" />
                <span className="sr-only">Instagram</span>
              </Link>
              <Link href="https://www.linkedin.com/company/iwandesignhouse/?originalSubdomain=eg" className="hover:text-[#636AE8] transition-colors">
                <Linkedin className="h-5 w-5" />
                <span className="sr-only">LinkedIn</span>
              </Link>
              <Link href="https://www.behance.net/IWANDH" className="hover:text-[#636AE8] transition-colors">
                <ImagesIcon className="h-5 w-5" />
                <span className="sr-only">Behance</span>
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/who-we-are" className="text-gray-400 hover:text-white transition-colors">
                  Who we are
                </Link>
              </li>
              <li>
                <Link href="/what-we-do" className="text-gray-400 hover:text-white transition-colors">
                  What we do
                </Link>
              </li>
              <li>
                <Link href="/projects" className="text-gray-400 hover:text-white transition-colors">
                  Projects
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/what-we-do" className="text-gray-400 hover:text-white transition-colors">
                  Architecture Design
                </Link>
              </li>
              <li>
                <Link href="/what-we-do" className="text-gray-400 hover:text-white transition-colors">
                  Interior Design
                </Link>
              </li>
              <li>
                <Link href="/what-we-do" className="text-gray-400 hover:text-white transition-colors">
                  Urban Planning
                </Link>
              </li>
              <li>
                <Link href="/what-we-do" className="text-gray-400 hover:text-white transition-colors">
                  Landscape Design
                </Link>
              </li>
              <li>
                <Link href="/what-we-do" className="text-gray-400 hover:text-white transition-colors">
                  Project Management 
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-semibold mb-6">Contact</h3>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">Address:</span>
                <span>111 -90th Street - 5th Settlement-New Cairo</span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">Phone:</span>
                <span>(+20 ) 1554800040 </span>
              </li>
              <li className="flex items-start">
                <span className="text-gray-400 mr-2">Email:</span>
                <span>info@iwandesignhouse.com</span>
              </li>
            </ul>
            <Link href="/contact">
            <Button className="btn-secondary mt-6">Contact us</Button>
            </Link>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} Design Studio. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
