import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
  test('should display homepage with title', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText('Curated Content Portal')).toBeVisible();
    await expect(page.getByText('Discover the best content on the web')).toBeVisible();
  });

  test('should have working RSS feed', async ({ page }) => {
    const response = await page.request.get('/rss.xml');
    expect(response.status()).toBe(200);
    
    const content = await response.text();
    expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(content).toContain('<rss version="2.0"');
  });

  test('should have working sitemap', async ({ page }) => {
    const response = await page.request.get('/sitemap.xml');
    expect(response.status()).toBe(200);
    
    const content = await response.text();
    expect(content).toContain('<?xml version="1.0" encoding="UTF-8"?>');
    expect(content).toContain('<urlset');
  });

  test('should have robots.txt', async ({ page }) => {
    const response = await page.request.get('/robots.txt');
    expect(response.status()).toBe(200);
    
    const content = await response.text();
    expect(content).toContain('User-agent: *');
    expect(content).toContain('Allow: /');
  });

  test('should have health check endpoint', async ({ page }) => {
    const response = await page.request.get('/api/health');
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data.status).toBe('healthy');
    expect(data.database).toBe('connected');
  });
});
