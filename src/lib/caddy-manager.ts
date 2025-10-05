/**
 * Caddy Configuration Manager
 * Automatically updates Caddyfile and reloads Caddy when portals are created/updated
 */

import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs/promises'
import path from 'path'

const execAsync = promisify(exec)

const CADDYFILE_PATH = process.env.CADDYFILE_PATH || '/etc/caddy/Caddyfile'
const CADDY_RELOAD_COMMAND = process.env.CADDY_RELOAD_COMMAND || 'docker-compose restart caddy'

interface SubdomainConfig {
  subdomain: string
  enabled?: boolean
}

/**
 * Add or update a subdomain in the Caddyfile
 */
export async function addSubdomainToCaddy(subdomain: string): Promise<void> {
  try {
    // Read current Caddyfile
    let caddyfileContent = await fs.readFile(CADDYFILE_PATH, 'utf-8')

    // Check if subdomain already exists
    const subdomainBlock = `${subdomain}.spoot.com {`
    if (caddyfileContent.includes(subdomainBlock)) {
      console.log(`[Caddy] Subdomain ${subdomain}.spoot.com already exists in Caddyfile`)
      return
    }

    // Add new subdomain block
    const newBlock = `
# Crawler portal: ${subdomain}
${subdomain}.spoot.com {
    reverse_proxy app:3000
    encode gzip
    log {
        output stdout
        format console
    }
}
`

    // Append to Caddyfile
    caddyfileContent += newBlock
    await fs.writeFile(CADDYFILE_PATH, caddyfileContent, 'utf-8')

    console.log(`[Caddy] Added ${subdomain}.spoot.com to Caddyfile`)

    // Reload Caddy
    await reloadCaddy()
  } catch (error) {
    console.error(`[Caddy] Error adding subdomain ${subdomain}:`, error)
    throw new Error(`Failed to add subdomain to Caddy: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Remove a subdomain from the Caddyfile
 */
export async function removeSubdomainFromCaddy(subdomain: string): Promise<void> {
  try {
    // Read current Caddyfile
    let caddyfileContent = await fs.readFile(CADDYFILE_PATH, 'utf-8')

    // Find and remove the subdomain block
    const commentPattern = `# Crawler portal: ${subdomain}\n`
    const blockPattern = new RegExp(
      `# Crawler portal: ${subdomain}\\n${subdomain}\\.spoot\\.com \\{[^}]+\\}\\n`,
      'g'
    )

    if (!caddyfileContent.match(blockPattern)) {
      console.log(`[Caddy] Subdomain ${subdomain}.spoot.com not found in Caddyfile`)
      return
    }

    // Remove the block
    caddyfileContent = caddyfileContent.replace(blockPattern, '')
    await fs.writeFile(CADDYFILE_PATH, caddyfileContent, 'utf-8')

    console.log(`[Caddy] Removed ${subdomain}.spoot.com from Caddyfile`)

    // Reload Caddy
    await reloadCaddy()
  } catch (error) {
    console.error(`[Caddy] Error removing subdomain ${subdomain}:`, error)
    throw new Error(`Failed to remove subdomain from Caddy: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Reload Caddy configuration
 */
async function reloadCaddy(): Promise<void> {
  try {
    console.log('[Caddy] Reloading configuration...')
    const { stdout, stderr } = await execAsync(CADDY_RELOAD_COMMAND)
    
    if (stderr && !stderr.includes('warning')) {
      console.error('[Caddy] Reload stderr:', stderr)
    }
    
    console.log('[Caddy] Configuration reloaded successfully')
  } catch (error) {
    console.error('[Caddy] Error reloading:', error)
    throw new Error(`Failed to reload Caddy: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Validate Caddyfile syntax
 */
export async function validateCaddyfile(): Promise<boolean> {
  try {
    const { stdout, stderr } = await execAsync('caddy validate --config ' + CADDYFILE_PATH)
    return true
  } catch (error) {
    console.error('[Caddy] Validation failed:', error)
    return false
  }
}
