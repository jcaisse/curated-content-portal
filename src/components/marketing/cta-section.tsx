"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowRight, Mail } from "lucide-react"

export function CTASection() {
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
            <form className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Name</label>
                  <Input 
                    placeholder="Your name" 
                    className="bg-background/50 border-border/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Email</label>
                  <Input 
                    type="email" 
                    placeholder="you@company.com" 
                    className="bg-background/50 border-border/50"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Company</label>
                <Input 
                  placeholder="Your company or domain portfolio" 
                  className="bg-background/50 border-border/50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">I'm interested in</label>
                <select className="w-full px-4 py-3 rounded-md bg-background/50 border border-border/50">
                  <option>Talent monetization partnership</option>
                  <option>Domain portfolio monetization</option>
                  <option>Studio/Agency partnership</option>
                  <option>Investment opportunity</option>
                  <option>General inquiry</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea 
                  placeholder="Tell us about your goals and what you'd like to explore..."
                  rows={4}
                  className="bg-background/50 border-border/50"
                />
              </div>

              <Button 
                size="lg" 
                className="w-full gradient-primary text-white hover:opacity-90 transition-opacity text-lg py-6"
              >
                Start the Conversation
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </form>

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

