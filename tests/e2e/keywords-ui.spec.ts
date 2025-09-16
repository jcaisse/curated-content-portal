/**
 * E2E Tests: Keywords UI Components
 * Tests the enhanced UI components and user interactions
 */

import { test, expect } from '@playwright/test';

// Test data
const TEST_TEXT = 'Artificial intelligence and machine learning are transforming businesses. Companies use AI for automation and data analysis. Machine learning algorithms process vast amounts of data to identify patterns and make predictions. This technology revolutionizes industries from healthcare to finance.';
const LONG_TEXT = 'A'.repeat(5001); // 5001 characters to test limit
const EXACT_5000_TEXT = 'A'.repeat(5000); // Exactly 5000 characters

test.describe('Keywords UI Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin keywords page
    await page.goto('/admin/keywords');
    
    // Login if needed
    if (await page.locator('[data-testid="kw-input"]').count() === 0) {
      await page.goto('/auth/signin');
      await page.fill('input[type="email"]', 'admin@example.com');
      await page.fill('input[type="password"]', 'testpassword123');
      await page.click('button[type="submit"]');
      await page.waitForURL('/admin/keywords');
    }
    
    // Open AI extraction panel
    await page.click('button:has-text("🧠 AI Extract Keywords")');
    await expect(page.locator('[data-testid="kw-input"]')).toBeVisible();
  });

  test('UI-1: 5000 character rule enforcement', async ({ page }) => {
    // Test exact 5000 characters - should work
    await page.fill('[data-testid="kw-input"]', EXACT_5000_TEXT);
    await expect(page.locator('[data-testid="kw-char-counter"]')).toContainText('5000/5,000');
    await expect(page.locator('[data-testid="kw-extract-btn"]')).toBeEnabled();

    // Test 5001 characters - should disable button
    await page.fill('[data-testid="kw-input"]', LONG_TEXT);
    await expect(page.locator('[data-testid="kw-char-counter"]')).toContainText('5001/5,000');
    await expect(page.locator('[data-testid="kw-extract-btn"]')).toBeDisabled();

    // Test validation error message appears
    await expect(page.locator('text=Text cannot exceed 5000 characters')).toBeVisible();
  });

  test('UI-2: Progress indicators during extraction', async ({ page }) => {
    // Fill text and start extraction
    await page.fill('[data-testid="kw-input"]', TEST_TEXT);
    await page.click('[data-testid="kw-extract-btn"]');

    // Check progress indicator appears
    await expect(page.locator('[data-testid="kw-progress"]')).toBeVisible();
    await expect(page.locator('button:has-text("Extracting...")')).toBeVisible();

    // Wait for extraction to complete
    await expect(page.locator('[data-testid="kw-progress"]')).toBeHidden({ timeout: 10000 });
    await expect(page.locator('[data-testid="kw-suggestions"]')).toBeVisible();
  });

  test('UI-3: Keyword cards display all required information', async ({ page }) => {
    // Fill text and extract keywords
    await page.fill('[data-testid="kw-input"]', TEST_TEXT);
    await page.click('[data-testid="kw-extract-btn"]');

    // Wait for suggestions to appear
    await expect(page.locator('[data-testid="kw-suggestions"]')).toBeVisible();
    await expect(page.locator('[data-testid="kw-card"]')).toHaveCount(1);

    // Check each keyword card has required elements
    const cards = page.locator('[data-testid="kw-card"]');
    const cardCount = await cards.count();

    for (let i = 0; i < Math.min(cardCount, 3); i++) {
      const card = cards.nth(i);
      
      // Check keyword text is present
      await expect(card.locator('h4')).toBeVisible();
      
      // Check confidence badge
      await expect(card.locator('[data-testid="kw-confidence"]')).toBeVisible();
      
      // Check category
      await expect(card.locator('[data-testid="kw-category"]')).toBeVisible();
      
      // Check priority
      await expect(card.locator('[data-testid="kw-priority"]')).toBeVisible();
      
      // Check relevance percentage
      await expect(card.locator('[data-testid="kw-relevance"]')).toBeVisible();
    }
  });

  test('UI-4: Bulk selection tools work correctly', async ({ page }) => {
    // Extract keywords first
    await page.fill('[data-testid="kw-input"]', TEST_TEXT);
    await page.click('[data-testid="kw-extract-btn"]');
    await expect(page.locator('[data-testid="kw-suggestions"]')).toBeVisible();

    // Test Select All
    await page.click('[data-testid="kw-select-all"]');
    
    // Check all cards are selected (blue border)
    const cards = page.locator('[data-testid="kw-card"]');
    const cardCount = await cards.count();
    
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      await expect(card).toHaveClass(/border-blue-500/);
    }

    // Check save button shows correct count
    await expect(page.locator('[data-testid="kw-save"]')).toContainText(`Create Selected (${cardCount})`);

    // Test Deselect All
    await page.click('[data-testid="kw-deselect-all"]');
    
    // Check all cards are deselected
    for (let i = 0; i < cardCount; i++) {
      const card = cards.nth(i);
      await expect(card).toHaveClass(/border-gray-200/);
    }

    // Test individual selection
    await cards.first().click();
    await expect(cards.first()).toHaveClass(/border-blue-500/);
    await expect(page.locator('[data-testid="kw-save"]')).toContainText('Create Selected (1)');
  });

  test('UI-5: Manual keyword addition', async ({ page }) => {
    const manualKeyword = 'custom test keyword';

    // Extract keywords first to show the panel
    await page.fill('[data-testid="kw-input"]', TEST_TEXT);
    await page.click('[data-testid="kw-extract-btn"]');
    await expect(page.locator('[data-testid="kw-suggestions"]')).toBeVisible();

    // Add manual keyword
    await page.fill('[data-testid="kw-add-manual"]', manualKeyword);
    await page.click('button:has-text("Add")');

    // Check the keyword appears in the grid
    await expect(page.locator('[data-testid="kw-card"]:has-text("' + manualKeyword + '")')).toBeVisible();
    
    // Check it has default category and priority
    const manualCard = page.locator('[data-testid="kw-card"]:has-text("' + manualKeyword + '")');
    await expect(manualCard.locator('[data-testid="kw-category"]')).toContainText('manual');
    await expect(manualCard.locator('[data-testid="kw-priority"]')).toContainText('Priority: medium');
  });

  test('UI-6: Save and persist keywords', async ({ page }) => {
    // Extract keywords
    await page.fill('[data-testid="kw-input"]', TEST_TEXT);
    await page.click('[data-testid="kw-extract-btn"]');
    await expect(page.locator('[data-testid="kw-suggestions"]')).toBeVisible();

    // Select a few keywords
    await page.click('[data-testid="kw-select-all"]');
    
    // Save selected keywords
    await page.click('[data-testid="kw-save"]');

    // Check for success message (toast or similar)
    await expect(page.locator('text=Successfully created')).toBeVisible({ timeout: 5000 });

    // Refresh page and check keywords are persisted
    await page.reload();
    await page.click('button:has-text("🧠 AI Extract Keywords")');
    
    // Check that saved keywords appear in the main list
    await expect(page.locator('text=test keyword')).toBeVisible();
  });
});
