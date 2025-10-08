"use client"

import * as React from "react"
import ReCAPTCHA from "react-google-recaptcha"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Mail, CheckCircle, AlertCircle } from "lucide-react"

export function CTASection() {
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    company: "",
    interest: "Talent monetization partnership",
    message: "",
  })
  const [recaptchaToken, setRecaptchaToken] = React.useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [submitStatus, setSubmitStatus] = React.useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = React.useState("")
  const recaptchaRef = React.useRef<ReCAPTCHA>(null)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleRecaptchaChange = (token: string | null) => {
    setRecaptchaToken(token)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset status
    setSubmitStatus("idle")
    setErrorMessage("")

    // Validate form
    if (!formData.name || !formData.email || !formData.message) {
      setSubmitStatus("error")
      setErrorMessage("Please fill in all required fields")
      return
    }

    if (!recaptchaToken) {
      setSubmitStatus("error")
      setErrorMessage("Please complete the reCAPTCHA")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          recaptchaToken,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSubmitStatus("success")
        // Reset form
        setFormData({
          name: "",
          email: "",
          company: "",
          interest: "Talent monetization partnership",
          message: "",
        })
        setRecaptchaToken(null)
        recaptchaRef.current?.reset()
      } else {
        setSubmitStatus("error")
        setErrorMessage(data.error || "Failed to send message. Please try again.")
      }
    } catch (error) {
      setSubmitStatus("error")
      setErrorMessage("Network error. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const recaptchaSiteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY

  return (
    <section id="contact" className="py-32 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 gradient-primary opacity-10" />
      <div className="absolute top-0 left-0 w-96 h-96 rounded-full glow-primary opacity-20 blur-3xl" />
      <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full glow-accent opacity-20 blur-3xl" />

      <div className="container relative mx-auto px-6">
        <div className="max-w-4xl mx-auto">
          {/* Headline */}
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Join the platforms winning in{" "}
              <span className="gradient-text">AI-driven discovery</span>
            </h2>
            <p className="text-xl text-muted-foreground">
              Partner with Corsoro to monetize the open web and capture attention before it consolidates further
            </p>
          </div>

          {/* Contact form */}
          <div className="glass-dark rounded-3xl p-12 backdrop-blur-lg">
            {submitStatus === "success" ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-2xl font-bold mb-2">Message Sent!</h3>
                <p className="text-muted-foreground mb-6">
                  Thank you for reaching out. We'll get back to you within 24 hours.
                </p>
                <Button
                  onClick={() => setSubmitStatus("idle")}
                  variant="outline"
                  className="border-border/50"
                >
                  Send Another Message
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {submitStatus === "error" && (
                  <div className="flex items-center gap-2 p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive">
                    <AlertCircle className="h-5 w-5 flex-shrink-0" />
                    <p className="text-sm">{errorMessage}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="bg-background/50 border-border/50"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      Email <span className="text-destructive">*</span>
                    </label>
                    <Input
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="you@company.com"
                      className="bg-background/50 border-border/50"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Company</label>
                  <Input
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your company or domain portfolio"
                    className="bg-background/50 border-border/50"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">I'm interested in</label>
                  <select
                    name="interest"
                    value={formData.interest}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-md bg-background/50 border border-border/50"
                  >
                    <option>Talent monetization partnership</option>
                    <option>Domain portfolio monetization</option>
                    <option>Studio/Agency partnership</option>
                    <option>Investment opportunity</option>
                    <option>General inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Message <span className="text-destructive">*</span>
                  </label>
                  <Textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us about your goals and what you'd like to explore..."
                    rows={4}
                    className="bg-background/50 border-border/50"
                    required
                  />
                </div>

                {/* reCAPTCHA */}
                {recaptchaSiteKey && (
                  <div className="flex justify-center">
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      sitekey={recaptchaSiteKey}
                      onChange={handleRecaptchaChange}
                      theme="dark"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || !recaptchaToken}
                  className="w-full gradient-primary text-white hover:opacity-90 transition-opacity text-lg py-6 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>Processing...</>
                  ) : (
                    <>
                      Start the Conversation
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </form>
            )}

            {/* Alternative contact */}
            <div className="mt-8 pt-8 border-t border-border/50 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Prefer email?
              </p>
              <a
                href="mailto:partnerships@corsoro.com"
                className="inline-flex items-center gap-2 text-sm font-medium hover:underline"
                style={{ color: 'hsl(var(--corsoro-accent))' }}
              >
                <Mail className="h-4 w-4" />
                partnerships@corsoro.com
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

