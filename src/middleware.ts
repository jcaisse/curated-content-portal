import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const url = request.nextUrl

  // Extract base domain from hostname
  // For subdomains like ginmeup.spoot.com, we need to identify the base domain
  // We'll extract the last two parts of the hostname as the base domain
  const parts = hostname.split('.')
  const baseDomain = parts.length >= 2 ? parts.slice(-2).join('.') : hostname
  
  // Skip middleware for localhost and direct IP access
  if (
    hostname.includes('localhost') ||
    hostname.includes('127.0.0.1') ||
    hostname.match(/^\d+\.\d+\.\d+\.\d+/)
  ) {
    return NextResponse.next()
  }

  // Skip for admin, api, auth, and _next routes
  if (
    url.pathname.startsWith('/admin') ||
    url.pathname.startsWith('/api') ||
    url.pathname.startsWith('/auth') ||
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/static')
  ) {
    return NextResponse.next()
  }

  // Check if this is a subdomain request
  // If hostname is exactly baseDomain (e.g., spoot.com or portal.spoot.com), it's the main site
  if (
    hostname === baseDomain ||
    hostname === `www.${baseDomain}` ||
    hostname === `portal.${baseDomain}`
  ) {
    return NextResponse.next()
  }

  // If we have more than 2 parts and it ends with baseDomain, extract subdomain
  // e.g., ginmeup.spoot.com -> subdomain = ginmeup
  if (parts.length >= 3 && hostname.endsWith(`.${baseDomain}`)) {
    const subdomain = parts[0]
    
    // Skip special subdomains
    if (subdomain === 'www' || subdomain === 'portal' || subdomain === 'admin') {
      return NextResponse.next()
    }

    // Rewrite to the dynamic subdomain route
    // This makes ginmeup.spoot.com/* route to /ginmeup/*
    const rewriteUrl = url.clone()
    rewriteUrl.pathname = `/${subdomain}${url.pathname}`
    
    console.log(`[Middleware] Subdomain detected: ${subdomain} -> Rewriting ${url.pathname} to ${rewriteUrl.pathname}`)
    
    return NextResponse.rewrite(rewriteUrl)
  }

  // Default: pass through
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|_next).*)',
  ],
}

