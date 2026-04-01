import { test, expect } from '@playwright/test';

test.describe('Members Page Forms', () => {
  // Mock authentication state or intercept requests to allow testing the UI
  test.beforeEach(async ({ page }) => {
    // Inject bypass token for ProtectedRoute
    await page.addInitScript(() => {
      localStorage.setItem('e2e_bypass', 'true');
    });

    // Intercept API calls to prevent requiring a full backend running
    await page.route('**/api/persons*', async (route) => {
      if (route.request().method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            data: [
              {
                id: '1',
                first_name: 'John',
                last_name: 'Doe',
                email: 'john@example.com',
                category: 'Member',
              },
            ],
            meta: { totalPages: 1 },
          }),
        });
      } else if (route.request().method() === 'POST') {
        // Mock successful creation
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({ id: '2', message: 'Person created' }),
        });
      } else {
        await route.continue();
      }
    });

    // Mock an auth context if the application requires it to load /members
    // Alternatively, if the app doesn't enforce strict redirect on mocked network:
    await page.goto('/members');
  });

  test('should display validation errors for empty required fields', async ({ page }) => {
    // Click the "+ Add Member" button
    await page.click('button:has-text("+ Add Member")');

    // Make sure modal opened
    await expect(page.locator('text=Add New Member')).toBeVisible();

    // Submit early to trigger validation
    await page.click('button:has-text("Add Member")');

    // Zod validation messages should appear
    await expect(page.locator('text=First name should have at least 2 letters')).toBeVisible();
    await expect(page.locator('text=Last name should have at least 2 letters')).toBeVisible();
  });

  test('should submit successfully with valid data', async ({ page }) => {
    await page.click('button:has-text("+ Add Member")');
    await expect(page.locator('text=Add New Member')).toBeVisible();

    // Fill the required fields
    await page.fill('input[placeholder="Ali"]', 'Jane'); // First name
    await page.fill('input[placeholder="Ahmed"]', 'Smith'); // Last name

    // Select category (Mantine select inputs can be tricky, typically you click it then click the option)
    // Here we'll just test standard input as it defaults to 'Member'

    // Submit
    await page.click('button[type="submit"]');

    // Expect success notification
    await expect(page.locator('text=Member added successfully')).toBeVisible();

    // Modal should close
    await expect(page.locator('text=Add New Member')).toBeHidden();
  });
});
