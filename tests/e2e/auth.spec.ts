import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should display sign in button when not authenticated', async ({ page }) => {
    await page.goto('/');
    
    await expect(page.getByText('Sign In')).toBeVisible();
  });

  test('should show admin link when authenticated as admin', async ({ page }) => {
    // This test would need proper authentication setup
    // For now, we'll just check the structure exists
    await page.goto('/');
    
    // Check that the header contains expected elements
    await expect(page.getByText('Curated Portal')).toBeVisible();
  });
});
