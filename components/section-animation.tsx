"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface SectionAnimationProps {
  children: React.ReactNode
  className?: string
  delay?: number
  direction?: "left" | "right" | "up" | "down"
}

export default function SectionAnimation({ children, className, delay = 0, direction = "up" }: SectionAnimationProps) {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
          if (sectionRef.current) observer.unobserve(sectionRef.current)
        }
      },
      {
        root: null,
        rootMargin: "0px",
        threshold: 0.1,
      },
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current)
      }
    }
  }, [delay])

  const getAnimationClass = () => {
    switch (direction) {
      case "left":
        return "translate-x-[-50px]"
      case "right":
        return "translate-x-[50px]"
      case "down":
        return "translate-y-[-50px]"
      case "up":
      default:
        return "translate-y-[50px]"
    }
  }

  return (
    <div
      ref={sectionRef}
      className={cn(
        "transition-all duration-700 ease-out",
        isVisible ? "opacity-100 transform-none" : `opacity-0 ${getAnimationClass()}`,
        className,
      )}
    >
      {children}
    </div>
  )
}
