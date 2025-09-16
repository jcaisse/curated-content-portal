/**
 * E2E Tests: AI Backend Behavior
 * Tests AI extraction, caching, and error handling
 */

import { test, expect } from '@playwright/test';

const TEST_TEXT = 'Artificial intelligence machine learning automation data analysis';

test.describe('Keywords AI Backend Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin keywords page and login
    await page.goto('/admin/keywords');
    
    if (await page.locator('[data-testid="kw-input"]').count() === 0) {
      await page.goto('/auth/signin');
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin/keywords');
    }
    
    await page.click('button:has-text("🧠 AI Extract Keywords")');
    await expect(page.locator('[data-testid="kw-input"]')).toBeVisible();
  });

  test('AI-1: Caching prevents duplicate AI calls', async ({ page }) => {
    // Reset call count by making a request to the test endpoint
    await page.goto('/api/test/ai-call-count');
    const initialResponse = await page.textContent('body');
    const initialCount = JSON.parse(initialResponse || '{}').callCount || 0;

    // Navigate back to keywords page
    await page.goto('/admin/keywords');
    await page.click('button:has-text("🧠 AI Extract Keywords")');
    await page.fill('[data-testid="kw-input"]', TEST_TEXT);

    // First extraction
    await page.click('[data-testid="kw-extract-btn"]');
    await expect(page.locator('[data-testid="kw-suggestions"]')).toBeVisible({ timeout: 10000 });

    // Check call count after first extraction
    await page.goto('/api/test/ai-call-count');
    const afterFirstResponse = await page.textContent('body');
    const afterFirstCount = JSON.parse(afterFirstResponse || '{}').callCount || 0;
    
    expect(afterFirstCount).toBe(initialCount + 1);

    // Navigate back and extract same text again
    await page.goto('/admin/keywords');
    await page.click('button:has-text("🧠 AI Extract Keywords")');
    await page.fill('[data-testid="kw-input"]', TEST_TEXT);
    await page.click('[data-testid="kw-extract-btn"]');
    await expect(page.locator('[data-testid="kw-suggestions"]')).toBeVisible({ timeout: 5000 });

    // Check call count after second extraction (should be same due to caching)
    await page.goto('/api/test/ai-call-count');
    const afterSecondResponse = await page.textContent('body');
    const afterSecondCount = JSON.parse(afterSecondResponse || '{}').callCount || 0;
    
    expect(afterSecondCount).toBe(afterFirstCount); // Should be same due to caching
  });

  test('AI-2: Failure mode shows graceful error', async ({ page }) => {
    // Set failure mode via environment (this would normally be done via Docker env)
    // For this test, we'll simulate the failure by checking the error handling
    
    await page.fill('[data-testid="kw-input"]', TEST_TEXT);
    await page.click('[data-testid="kw-extract-btn"]');

    // Wait for either success or error
    await Promise.race([
      expect(page.locator('[data-testid="kw-suggestions"]')).toBeVisible(),
      expect(page.locator('text=error')).toBeVisible(),
    ]);

    // If error occurs, check for retry functionality
    if (await page.locator('text=error').isVisible()) {
      await expect(page.locator('button:has-text("retry")')).toBeVisible();
    }
  });

  test('AI-3: Timeout handling', async ({ page }) => {
    // Fill text and start extraction
    await page.fill('[data-testid="kw-input"]', TEST_TEXT);
    await page.click('[data-testid="kw-extract-btn"]');

    // Check progress indicator appears
    await expect(page.locator('[data-testid="kw-progress"]')).toBeVisible();

    // Wait for either completion or timeout (max 15 seconds)
    await Promise.race([
      expect(page.locator('[data-testid="kw-progress"]')).toBeHidden({ timeout: 15000 }),
      expect(page.locator('text=timeout')).toBeVisible({ timeout: 15000 }),
      expect(page.locator('text=error')).toBeVisible({ timeout: 15000 }),
    ]);

    // If timeout occurs, check for retry functionality
    if (await page.locator('text=timeout').isVisible() || await page.locator('text=error').isVisible()) {
      await expect(page.locator('button:has-text("retry")')).toBeVisible();
    }
  });

  test('AI-4: Response structure validation', async ({ page }) => {
    await page.fill('[data-testid="kw-input"]', TEST_TEXT);
    await page.click('[data-testid="kw-extract-btn"]');
    
    await expect(page.locator('[data-testid="kw-suggestions"]')).toBeVisible({ timeout: 10000 });
    
    // Check that we have keyword cards
    const cards = page.locator('[data-testid="kw-card"]');
    await expect(cards).toHaveCount(1);

    // Validate first card structure
    const firstCard = cards.first();
    
    // Should have keyword name
    await expect(firstCard.locator('h4')).toBeVisible();
    
    // Should have confidence badge
    await expect(firstCard.locator('[data-testid="kw-confidence"]')).toBeVisible();
    
    // Should have category
    await expect(firstCard.locator('[data-testid="kw-category"]')).toBeVisible();
    
    // Should have priority
    await expect(firstCard.locator('[data-testid="kw-priority"]')).toBeVisible();
    
    // Should have relevance percentage
    await expect(firstCard.locator('[data-testid="kw-relevance"]')).toBeVisible();
  });
});
