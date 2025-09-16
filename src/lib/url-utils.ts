import { createHash } from 'crypto'

/**
 * Normalize URL for consistent hashing
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url)
    
    // Remove common tracking parameters
    const trackingParams = [
      'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content',
      'fbclid', 'gclid', 'ref', 'source', 'campaign'
    ]
    
    trackingParams.forEach(param => {
      urlObj.searchParams.delete(param)
    })
    
    // Remove trailing slash
    urlObj.pathname = urlObj.pathname.replace(/\/$/, '') || '/'
    
    // Convert to lowercase
    urlObj.hostname = urlObj.hostname.toLowerCase()
    
    return urlObj.toString()
  } catch (error) {
    console.error('Error normalizing URL:', url, error)
    return url
  }
}

/**
 * Generate consistent hash for URL deduplication
 */
export function generateUrlHash(url: string): string {
  const normalized = normalizeUrl(url)
  return createHash('sha256').update(normalized).digest('hex')
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname
  } catch (error) {
    return 'unknown'
  }
}

/**
 * Check if URL is valid
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Clean and format URL for display
 */
export function formatUrl(url: string, maxLength: number = 50): string {
  try {
    const urlObj = new URL(url)
    const displayUrl = `${urlObj.hostname}${urlObj.pathname}`
    
    if (displayUrl.length > maxLength) {
      return displayUrl.substring(0, maxLength - 3) + '...'
    }
    
    return displayUrl
  } catch {
    return url.length > maxLength ? url.substring(0, maxLength - 3) + '...' : url
  }
}
