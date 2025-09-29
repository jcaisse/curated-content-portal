import { test, expect } from '@playwright/test'
import { setupAuthTest } from './helpers/auth'

test.describe('Crawlers CRUD and Keyword Tools', () => {
  test('redirects legacy keywords to crawlers', async ({ page }) => {
    await page.goto('/admin/keywords')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/admin/crawlers')
  })

  test('create crawler, edit, extract AI keywords, add manual, and remove', async ({ page }) => {
    const auth = await setupAuthTest(page)
    const ok = await auth.signIn()
    expect(ok).toBeTruthy()

    // Go to crawlers list
    await page.goto('/admin/crawlers')
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Crawlers' })).toBeVisible()

    // Create new crawler
    await page.getByRole('link', { name: 'New Crawler' }).click()
    await expect(page.getByRole('heading', { name: 'Create Crawler' })).toBeVisible()

    const name = `Crawler ${Date.now()}`
    await page.getByLabel('Name').fill(name)
    await page.getByLabel('Description').fill('E2E created crawler')
    await page.getByRole('button', { name: 'Create' }).click()

    // Land on edit page
    await page.waitForLoadState('networkidle')
    await expect(page.getByRole('heading', { name: 'Edit Crawler' })).toBeVisible()

    // Keyword tools: paste text and extract (mock AI may be disabled; still exercise endpoint)
    const text = 'This is some test content about web scraping, crawlers, and keyword extraction for AI tools.'
    await page.getByLabel('Paste up to 5000 chars for AI extraction').fill(text)
    await page.getByRole('button', { name: 'Extract' }).click()

    // Wait briefly; selection UI might appear
    await page.waitForTimeout(1000)

    // Add manual keywords CSV
    await page.getByLabel('Add manual keywords (comma separated)').fill('alpha,beta,gamma')
    await page.getByRole('button', { name: 'Add Manual' }).click()

    // Current keywords should include manual
    await expect(page.getByText('alpha')).toBeVisible()

    // Remove one keyword
    const removeButtons = page.getByRole('button', { name: 'Remove' })
    const count = await removeButtons.count()
    if (count > 0) {
      await removeButtons.nth(0).click()
    }

    // Save details change
    await page.getByLabel('Name').fill(`${name} Updated`)
    await page.getByRole('button', { name: 'Save Changes' }).click()
    await page.waitForLoadState('networkidle')
  })
})


