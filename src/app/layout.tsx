import type { Metadata } from "next"
import { Poppins } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/components/auth-provider"

const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-poppins"
})

export const metadata: Metadata = {
  title: "Corsoro Media - AI-Optimized Fan Destinations for the Open Web",
  description: "Turn brand names and domain names into revenue-generating assets. AI-optimized fan destinations that rank in search and appear as answers in AI engines. SEO + AEO + GEO monetization at scale.",
  keywords: ["fan destinations", "domain monetization", "AI optimization", "SEO", "AEO", "GEO", "influencer monetization", "revenue share"],
  openGraph: {
    title: "Corsoro Media - Monetize the Open Web",
    description: "AI-optimized fan destinations with $8-$20+ session RPM at scale",
    type: "website",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={`${poppins.className} bg-blue-100`}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
