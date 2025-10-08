import { Linkedin, Twitter, Mail } from "lucide-react"

export function Footer() {
  const footerLinks = {
    platform: [
      { label: "Platform", href: "/platform" },
      { label: "How It Works", href: "/#how-it-works" },
      { label: "Pricing", href: "/#business-model" },
    ],
    solutions: [
      { label: "For Talent", href: "/#audiences" },
      { label: "For Domains", href: "/#audiences" },
      { label: "For Agencies", href: "/#audiences" },
    ],
    company: [
      { label: "About", href: "/about" },
      { label: "Investors", href: "/investors" },
      { label: "Contact", href: "/#contact" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "DMCA Policy", href: "/dmca" },
    ],
  }

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-6xl mx-auto">
          {/* Top section */}
          <div className="grid md:grid-cols-6 gap-8 mb-12">
            {/* Brand */}
            <div className="md:col-span-2">
              <div className="mb-4">
                <span className="text-2xl font-bold gradient-text">Corsoro Media</span>
              </div>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm">
                Monetize the open web with AI-optimized fan destinations. Turn brand names and domain names into revenue-generating assets.
              </p>
              <div className="flex gap-4">
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Twitter className="h-4 w-4" />
                </a>
                <a 
                  href="#" 
                  className="w-10 h-10 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
                <a 
                  href="mailto:partnerships@corsoro.com" 
                  className="w-10 h-10 rounded-full glass flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <Mail className="h-4 w-4" />
                </a>
              </div>
            </div>

            {/* Links */}
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-3">
                {footerLinks.platform.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Solutions</h4>
              <ul className="space-y-3">
                {footerLinks.solutions.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-3">
                {footerLinks.legal.map((link, index) => (
                  <li key={index}>
                    <a 
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom section */}
          <div className="pt-8 border-t border-border/50 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Corsoro Media. All rights reserved.
            </p>
            <p className="text-xs text-muted-foreground">
              Built for the AI era of discovery
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}

