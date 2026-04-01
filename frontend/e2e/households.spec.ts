import { test, expect } from '@playwright/test';

test.describe('Households Page Forms', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('e2e_bypass', 'true');
    });

    await page.route('**/api/households*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [{ id: '1', address_line_1: '123 Test St', city: 'Test City' }],
          }),
        });
      } else if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: '2', message: 'Household created' }),
        });
      } else {
        await route.continue();
      }
    });

    await page.goto('/households');
  });

  test('should display validation errors for empty required fields', async ({ page }) => {
    await page.click('button:has-text("+ Add Household")');
    await expect(page.locator('text=Add New Household')).toBeVisible();

    await page.click('button:has-text("Create Household")');

    await expect(page.locator('text=Address must be at least 5 characters long')).toBeVisible();
  });

  test('should submit successfully with valid data', async ({ page }) => {
    await page.click('button:has-text("+ Add Household")');
    await expect(page.locator('text=Add New Household')).toBeVisible();

    await page.fill('input[placeholder="123 Main St"]', '456 New Household Lane');

    await page.click('button[type="submit"]');

    await expect(page.locator('text=Household created successfully')).toBeVisible();
    await expect(page.locator('text=Add New Household')).toBeHidden();
  });
});
