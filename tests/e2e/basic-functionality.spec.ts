/**
 * Basic Functionality Tests
 * Tests core features without authentication complexity
 */

import { test, expect } from '@playwright/test';

test.describe('Basic Functionality Tests', () => {
  test('App loads and shows homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Curated Content Portal/);
  });

  test('Admin page redirects to signin', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForURL('/auth/signin');
    await expect(page.locator('h1')).toContainText('Sign In');
  });

  test('API endpoints respond correctly', async ({ page }) => {
    // Test the AI call count endpoint (should return 404 when not in test mode)
    const response = await page.request.get('/api/test/ai-call-count');
    expect(response.status()).toBe(404);
  });

  test('Keywords page structure exists', async ({ page }) => {
    await page.goto('/admin/keywords');
    await page.waitForURL('/auth/signin');
    
    // Check that signin page has the expected elements
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});
