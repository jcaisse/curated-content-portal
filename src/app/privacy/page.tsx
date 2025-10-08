import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"
import { Shield } from "lucide-react"

export const metadata = {
  title: "Privacy Policy - Corsoro Media",
  description: "Corsoro Media's Privacy Policy. Learn how we collect, use, and protect your personal information.",
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Hero Section */}
      <section className="relative py-20 border-b mt-16">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <div 
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6"
              style={{ backgroundColor: 'hsla(var(--corsoro-primary) / 0.1)' }}
            >
              <Shield className="h-8 w-8" style={{ color: 'hsl(var(--corsoro-primary))' }} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
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
                <h2 className="text-2xl font-bold text-foreground mb-4">1. Introduction</h2>
                <p>
                  Corsoro Media ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">2. Information We Collect</h2>
                <h3 className="text-xl font-semibold text-foreground mb-3">Personal Information</h3>
                <p>We may collect personally identifiable information that you voluntarily provide to us when you:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fill out contact forms or request information</li>
                  <li>Subscribe to our newsletter</li>
                  <li>Register for an account or partnership</li>
                  <li>Communicate with us via email or other channels</li>
                </ul>
                <p>This information may include:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and contact information (email address, phone number)</li>
                  <li>Company name and professional details</li>
                  <li>Any other information you choose to provide</li>
                </ul>

                <h3 className="text-xl font-semibold text-foreground mb-3 mt-6">Automatically Collected Information</h3>
                <p>When you visit our website, we automatically collect certain information about your device, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>IP address and geographic location</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Referring URLs and pages visited</li>
                  <li>Date and time of visits</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">3. How We Use Your Information</h2>
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, operate, and maintain our services</li>
                  <li>Respond to your inquiries and provide customer support</li>
                  <li>Send you updates, marketing communications, and other information (with your consent)</li>
                  <li>Analyze usage trends and improve our website and services</li>
                  <li>Detect, prevent, and address technical issues or fraudulent activity</li>
                  <li>Comply with legal obligations</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">4. Cookies and Tracking Technologies</h2>
                <p>
                  We use cookies, web beacons, and similar tracking technologies to collect information about your browsing activities. Cookies are small data files stored on your device that help us improve your experience.
                </p>
                <p>You can control cookies through your browser settings. However, disabling cookies may limit your ability to use certain features of our website.</p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">5. Third-Party Services</h2>
                <p>We may use third-party service providers to help us operate our business and website, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Analytics:</strong> Google Analytics (to understand website usage)</li>
                  <li><strong>Advertising:</strong> Google Ad Manager and other ad technology platforms</li>
                  <li><strong>Email:</strong> Email service providers for communications</li>
                </ul>
                <p>
                  These third parties may have access to your information only to perform specific tasks on our behalf and are obligated to protect your information.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">6. Data Sharing and Disclosure</h2>
                <p>We do not sell, trade, or rent your personal information to third parties. We may share your information in the following circumstances:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>With your consent:</strong> When you authorize us to share your information</li>
                  <li><strong>Service providers:</strong> With trusted third parties who assist us in operating our business</li>
                  <li><strong>Legal requirements:</strong> When required by law or to protect our rights</li>
                  <li><strong>Business transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">7. Data Security</h2>
                <p>
                  We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the internet or electronic storage is 100% secure.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">8. Your Rights</h2>
                <p>Depending on your location, you may have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
                  <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Data portability:</strong> Request a copy of your data in a machine-readable format</li>
                </ul>
                <p>
                  To exercise these rights, please contact us at <a href="mailto:privacy@corsoro.com" className="font-semibold hover:underline" style={{ color: 'hsl(var(--corsoro-primary))' }}>privacy@corsoro.com</a>.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">9. International Data Transfers</h2>
                <p>
                  Your information may be transferred to and maintained on servers located outside of your state, province, country, or other governmental jurisdiction where data protection laws may differ. By using our services, you consent to such transfers.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">10. Children's Privacy</h2>
                <p>
                  Our services are not directed to individuals under the age of 13 (or 16 in the EEA). We do not knowingly collect personal information from children. If we become aware that a child has provided us with personal information, we will take steps to delete such information.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">11. Changes to This Privacy Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last updated" date. You are advised to review this Privacy Policy periodically for any changes.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">12. Contact Us</h2>
                <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
                <div className="mt-4 p-6 glass-dark rounded-xl">
                  <p className="mb-2"><strong className="text-foreground">Email:</strong> <a href="mailto:privacy@corsoro.com" className="hover:underline" style={{ color: 'hsl(var(--corsoro-primary))' }}>privacy@corsoro.com</a></p>
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
