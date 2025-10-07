import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Caddy on-demand TLS validation endpoint
 * Returns 200 if subdomain is valid, 404 if not
 */
export async function GET(request: NextRequest) {
  try {
    const domain = request.nextUrl.searchParams.get('domain')
    
    if (!domain) {
      return NextResponse.json({ error: 'Missing domain parameter' }, { status: 400 })
    }

    // Extract subdomain from domain (e.g., "haveadrinkonme" from "haveadrinkonme.spoot.com")
    const parts = domain.split('.')
    if (parts.length < 3) {
      return NextResponse.json({ error: 'Invalid domain format' }, { status: 404 })
    }
    
    const subdomain = parts[0]
    
    // Skip main domains
    if (subdomain === 'portal' || subdomain === 'www' || subdomain === 'admin') {
      return NextResponse.json({ error: 'Reserved subdomain' }, { status: 404 })
    }

    // Check if a portal with this subdomain exists and is active
    const portal = await prisma.crawlerPortal.findFirst({
      where: {
        subdomain: subdomain,
        crawler: {
          isActive: true
        }
      },
      select: {
        id: true,
        subdomain: true
      }
    })

    if (!portal) {
      return NextResponse.json({ error: 'Subdomain not found' }, { status: 404 })
    }

    // Subdomain is valid
    return NextResponse.json({ 
      allowed: true,
      subdomain: portal.subdomain 
    }, { status: 200 })

  } catch (error) {
    console.error('[validate-subdomain] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
