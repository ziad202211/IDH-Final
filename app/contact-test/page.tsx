"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { CheckCircle2, AlertCircle, Loader2 } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"

export default function ContactTest() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<{
    success?: boolean
    message?: string
  }>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "Name is required"
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid"
    }

    if (!formData.message.trim()) {
      newErrors.message = "Message is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitStatus({})

    try {
      // Direct insert to contact_messages table
      const { data, error } = await supabase
        .from("contact_messages")
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone || null,
            message: formData.message,
            read: false,
          },
        ])
        .select()

      if (error) throw error

      // Success
      setSubmitStatus({
        success: true,
        message: "Your message has been sent successfully! We'll get back to you soon.",
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
      })
    } catch (error: any) {
      console.error("Error submitting form:", error)
      setSubmitStatus({
        success: false,
        message: `Failed to send message: ${error.message || "Unknown error"}`,
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-10 px-4 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Contact Form Test</CardTitle>
          <CardDescription>Test the contact form functionality with direct database insertion</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {submitStatus.message && (
              <Alert variant={submitStatus.success ? "default" : "destructive"}>
                {submitStatus.success ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                <AlertTitle>{submitStatus.success ? "Success" : "Error"}</AlertTitle>
                <AlertDescription>{submitStatus.message}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} placeholder="Your name" />
              {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Your email"
              />
              {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Your phone number (optional)"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="message">
                Message <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                placeholder="Your message"
                rows={5}
              />
              {errors.message && <p className="text-sm text-red-500">{errors.message}</p>}
            </div>
          </CardContent>

          <CardFooter>
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Message"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
