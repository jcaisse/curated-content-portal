import { Footer } from "@/components/marketing/footer"
import { FileText } from "lucide-react"

export const metadata = {
  title: "Terms of Service - Corsoro Media",
  description: "Corsoro Media's Terms of Service. Read the terms and conditions governing your use of our platform and services.",
}

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 border-b">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
              style={{ backgroundColor: 'hsla(var(--corsoro-primary) / 0.1)' }}
            >
              <FileText className="h-8 w-8" style={{ color: 'hsl(var(--corsoro-primary))' }} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
            <p className="text-muted-foreground">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto prose prose-lg">
            <div className="space-y-8 text-muted-foreground leading-relaxed">
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Acceptance of Terms</h2>
                <p>
                  Welcome to Corsoro Media. By accessing or using our website and services, you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, please do not use our services.
                </p>
                <p>
                  We reserve the right to modify these Terms at any time. Your continued use of our services after changes are posted constitutes acceptance of the modified Terms.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Description of Services</h2>
                <p>
                  Corsoro Media provides a platform for building, operating, and monetizing AI-optimized fan destinations and content sites. Our services include:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Automated site generation and content management</li>
                  <li>SEO, AEO, and GEO optimization</li>
                  <li>Ad monetization infrastructure</li>
                  <li>Analytics and reporting tools</li>
                  <li>Partner revenue sharing programs</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. User Accounts and Registration</h2>
                <p>
                  To access certain features of our services, you may be required to create an account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Promptly update your account information as needed</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized use</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Acceptable Use</h2>
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe on intellectual property rights of others</li>
                  <li>Upload or distribute malicious code, viruses, or harmful software</li>
                  <li>Engage in fraudulent, deceptive, or misleading activities</li>
                  <li>Attempt to gain unauthorized access to our systems</li>
                  <li>Scrape, crawl, or harvest content without permission</li>
                  <li>Interfere with or disrupt our services</li>
                  <li>Use our services for any illegal or unauthorized purpose</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Content and Intellectual Property</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">Our Content</h3>
                <p>
                  All content on our platform, including text, graphics, logos, software, and design elements, is the property of Corsoro Media or our licensors and is protected by copyright, trademark, and other intellectual property laws.
                </p>
                
                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Partner Content</h3>
                <p>
                  When you provide content or grant us access to domains, you represent and warrant that:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>You own or have the right to use the content</li>
                  <li>The content does not infringe on third-party rights</li>
                  <li>You grant us a license to use, display, and monetize the content as part of our services</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Revenue Sharing and Payment Terms</h2>
                <p>
                  For partners participating in our revenue share program:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Revenue share percentages will be specified in your partnership agreement</li>
                  <li>Payments are subject to minimum thresholds and payment schedules</li>
                  <li>We reserve the right to withhold payments if fraud or policy violations are suspected</li>
                  <li>All revenue calculations are based on validated traffic and compliant monetization</li>
                  <li>Detailed reporting will be provided through your partner dashboard</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Third-Party Services and Links</h2>
                <p>
                  Our services may contain links to third-party websites or integrate with third-party services. We are not responsible for the content, privacy practices, or terms of service of third-party sites. Your interactions with third parties are solely between you and the third party.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Disclaimers and Limitations of Liability</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">Service Availability</h3>
                <p>
                  Our services are provided "as is" and "as available." We do not guarantee uninterrupted, error-free, or secure access to our services. We may modify, suspend, or discontinue services at any time without liability.
                </p>
                
                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Limitation of Liability</h3>
                <p>
                  To the maximum extent permitted by law, Corsoro Media shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including loss of profits, data, or business opportunities, arising from your use of our services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">9. Indemnification</h2>
                <p>
                  You agree to indemnify, defend, and hold harmless Corsoro Media, its affiliates, officers, directors, employees, and agents from any claims, liabilities, damages, losses, and expenses (including legal fees) arising from:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your use of our services</li>
                  <li>Your violation of these Terms</li>
                  <li>Your violation of any rights of third parties</li>
                  <li>Content you provide or make available through our services</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">10. DMCA Compliance</h2>
                <p>
                  We respect intellectual property rights and comply with the Digital Millennium Copyright Act (DMCA). If you believe content on our platform infringes your copyright, please see our <a href="/dmca" className="font-semibold hover:underline" style={{ color: 'hsl(var(--corsoro-primary))' }}>DMCA Policy</a> for information on filing a notice.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Termination</h2>
                <p>
                  We reserve the right to suspend or terminate your access to our services at any time, with or without cause, and with or without notice. Upon termination:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your right to use our services will cease immediately</li>
                  <li>We may delete your account and content</li>
                  <li>Outstanding payment obligations will remain in effect</li>
                  <li>Provisions intended to survive termination will remain in effect</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">12. Governing Law and Dispute Resolution</h2>
                <p>
                  These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which Corsoro Media operates, without regard to its conflict of law provisions.
                </p>
                <p>
                  Any disputes arising from these Terms or your use of our services shall be resolved through binding arbitration, except where prohibited by law.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">13. General Provisions</h2>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Entire Agreement:</strong> These Terms constitute the entire agreement between you and Corsoro Media</li>
                  <li><strong>Severability:</strong> If any provision is found to be unenforceable, the remaining provisions will remain in effect</li>
                  <li><strong>Waiver:</strong> Our failure to enforce any right or provision does not constitute a waiver</li>
                  <li><strong>Assignment:</strong> You may not assign these Terms without our written consent</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">14. Contact Information</h2>
                <p>If you have questions about these Terms of Service, please contact us:</p>
                <div className="mt-4 p-6 glass-dark rounded-xl">
                  <p className="mb-2"><strong className="text-foreground">Email:</strong> <a href="mailto:legal@corsoro.com" className="hover:underline" style={{ color: 'hsl(var(--corsoro-primary))' }}>legal@corsoro.com</a></p>
                  <p className="mb-2"><strong className="text-foreground">General Inquiries:</strong> <a href="mailto:partnerships@corsoro.com" className="hover:underline" style={{ color: 'hsl(var(--corsoro-primary))' }}>partnerships@corsoro.com</a></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
