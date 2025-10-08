import { Navbar } from "@/components/marketing/navbar"
import { Footer } from "@/components/marketing/footer"
import { AlertCircle } from "lucide-react"

export const metadata = {
  title: "DMCA Policy - Corsoro Media",
  description: "Corsoro Media's DMCA Policy. Learn how to report copyright infringement and our takedown procedures.",
}

export default function DmcaPage() {
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
              <AlertCircle className="h-8 w-8" style={{ color: 'hsl(var(--corsoro-primary))' }} />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">DMCA Policy</h1>
            <p className="text-muted-foreground">
              Digital Millennium Copyright Act Compliance
            </p>
            <p className="text-sm text-muted-foreground mt-2">
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
                <h2 className="text-2xl font-bold text-foreground mb-4">Copyright Policy</h2>
                <p>
                  Corsoro Media respects the intellectual property rights of others and expects our users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 ("DMCA"), we will respond expeditiously to claims of copyright infringement on our platform.
                </p>
              </div>

              <div className="p-6 glass-dark rounded-xl border-l-4" style={{ borderColor: 'hsl(var(--corsoro-accent))' }}>
                <h3 className="text-xl font-semibold text-foreground mb-3">Designated Copyright Agent</h3>
                <p className="mb-4">
                  All DMCA notices should be sent to our designated Copyright Agent:
                </p>
                <div className="space-y-2">
                  <p><strong className="text-foreground">DMCA Agent</strong></p>
                  <p><strong className="text-foreground">Corsoro Media</strong></p>
                  <p><strong className="text-foreground">Email:</strong> <a href="mailto:dmca@corsoro.com" className="font-semibold hover:underline" style={{ color: 'hsl(var(--corsoro-primary))' }}>dmca@corsoro.com</a></p>
                  <p className="text-sm italic mt-4">
                    Please allow 1-2 business days for email responses. Notices sent to any other address or contact method may result in delays.
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Filing a DMCA Notice of Copyright Infringement</h2>
                <p>
                  If you believe that content on our platform infringes your copyright, please provide our Copyright Agent with a written notice containing the following information:
                </p>
                <ol className="list-decimal pl-6 space-y-3 mt-4">
                  <li>
                    <strong className="text-foreground">Identification of the copyrighted work:</strong> Describe the copyrighted work that you claim has been infringed. If multiple works are covered by a single notification, provide a representative list.
                  </li>
                  <li>
                    <strong className="text-foreground">Identification of the infringing material:</strong> Provide specific URLs or other identifying information that allows us to locate the allegedly infringing material.
                  </li>
                  <li>
                    <strong className="text-foreground">Your contact information:</strong> Include your name, address, telephone number, and email address.
                  </li>
                  <li>
                    <strong className="text-foreground">Good faith statement:</strong> Include the following statement: "I have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law."
                  </li>
                  <li>
                    <strong className="text-foreground">Accuracy statement:</strong> Include the following statement: "The information in this notification is accurate, and under penalty of perjury, I am the copyright owner or authorized to act on behalf of the copyright owner."
                  </li>
                  <li>
                    <strong className="text-foreground">Your signature:</strong> Provide a physical or electronic signature of the copyright owner or a person authorized to act on their behalf.
                  </li>
                </ol>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Sample DMCA Notice</h2>
                <div className="p-6 glass-dark rounded-xl">
                  <pre className="text-sm whitespace-pre-wrap font-mono">
{`To: dmca@corsoro.com
Subject: DMCA Takedown Notice

I am writing to notify you of copyright infringement on your platform.

1. Copyrighted Work:
[Describe the copyrighted work]

2. Infringing Material:
[Provide specific URLs where the infringing material is located]

3. Contact Information:
Name: [Your Full Name]
Address: [Your Address]
Phone: [Your Phone Number]
Email: [Your Email]

4. Good Faith Statement:
I have a good faith belief that use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law.

5. Accuracy Statement:
The information in this notification is accurate, and under penalty of perjury, I am the copyright owner or authorized to act on behalf of the copyright owner.

6. Signature:
[Your Physical or Electronic Signature]
Date: [Date]`}
                  </pre>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Our Response to DMCA Notices</h2>
                <p>Upon receipt of a valid DMCA notice, we will:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Remove or disable access to the allegedly infringing material</li>
                  <li>Notify the user who posted the material of the removal</li>
                  <li>Terminate repeat infringers' accounts in appropriate circumstances</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Filing a Counter-Notice</h2>
                <p>
                  If you believe that content you posted was removed or disabled in error or misidentification, you may file a counter-notice with our Copyright Agent containing the following information:
                </p>
                <ol className="list-decimal pl-6 space-y-3 mt-4">
                  <li>
                    <strong className="text-foreground">Identification of the material:</strong> Describe the material that was removed and its location before removal.
                  </li>
                  <li>
                    <strong className="text-foreground">Your contact information:</strong> Include your name, address, telephone number, and email address.
                  </li>
                  <li>
                    <strong className="text-foreground">Consent to jurisdiction:</strong> Include the following statement: "I consent to the jurisdiction of the Federal District Court for the judicial district in which my address is located, or if my address is outside of the United States, the judicial district in which Corsoro Media is located, and I will accept service of process from the person who filed the original DMCA notice or an agent of that person."
                  </li>
                  <li>
                    <strong className="text-foreground">Good faith statement:</strong> Include the following statement: "I swear, under penalty of perjury, that I have a good faith belief that the material was removed or disabled as a result of mistake or misidentification."
                  </li>
                  <li>
                    <strong className="text-foreground">Your signature:</strong> Provide a physical or electronic signature.
                  </li>
                </ol>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Counter-Notice Process</h2>
                <p>Upon receipt of a valid counter-notice:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>We will forward the counter-notice to the original complainant</li>
                  <li>If the complainant does not file a lawsuit within 10-14 business days, we may restore the removed content</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Repeat Infringer Policy</h2>
                <p>
                  We have adopted a policy of terminating, in appropriate circumstances, users or account holders who are repeat infringers. We may also, at our discretion, limit access to our services and/or terminate accounts of any users who infringe intellectual property rights, whether or not there is repeat infringement.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Misrepresentations</h2>
                <p>
                  Under Section 512(f) of the DMCA, any person who knowingly materially misrepresents that material or activity is infringing, or that material or activity was removed or disabled by mistake or misidentification, may be subject to liability.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Important Notes</h2>
                <div className="p-6 glass-dark rounded-xl">
                  <ul className="space-y-3">
                    <li className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'hsl(var(--corsoro-accent))' }}></div>
                      <span><strong className="text-foreground">Not legal advice:</strong> This policy is for informational purposes only and does not constitute legal advice. Consult an attorney for legal guidance.</span>
                    </li>
                    <li className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'hsl(var(--corsoro-accent))' }}></div>
                      <span><strong className="text-foreground">Incomplete notices:</strong> DMCA notices that do not include all required information may not be acted upon.</span>
                    </li>
                    <li className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'hsl(var(--corsoro-accent))' }}></div>
                      <span><strong className="text-foreground">Fair use:</strong> Before submitting a DMCA notice, consider whether the use might be protected under fair use or other exemptions.</span>
                    </li>
                    <li className="flex gap-3">
                      <div className="flex-shrink-0 w-2 h-2 rounded-full mt-2" style={{ backgroundColor: 'hsl(var(--corsoro-accent))' }}></div>
                      <span><strong className="text-foreground">Perjury:</strong> Submitting false information in a DMCA notice or counter-notice is considered perjury and may result in legal consequences.</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">Contact Information</h2>
                <p>For all DMCA-related matters, please contact:</p>
                <div className="mt-4 p-6 glass-dark rounded-xl">
                  <p className="mb-2"><strong className="text-foreground">DMCA Agent:</strong> <a href="mailto:dmca@corsoro.com" className="hover:underline" style={{ color: 'hsl(var(--corsoro-primary))' }}>dmca@corsoro.com</a></p>
                  <p className="mb-2"><strong className="text-foreground">Legal Department:</strong> <a href="mailto:legal@corsoro.com" className="hover:underline" style={{ color: 'hsl(var(--corsoro-primary))' }}>legal@corsoro.com</a></p>
                  <p className="mt-4 text-sm italic">
                    For non-copyright matters, please use our general contact at <a href="mailto:partnerships@corsoro.com" className="hover:underline" style={{ color: 'hsl(var(--corsoro-primary))' }}>partnerships@corsoro.com</a>
                  </p>
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
