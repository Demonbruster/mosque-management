# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: households.spec.ts >> Households Page Forms >> should display validation errors for empty required fields
- Location: e2e/households.spec.ts:34:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('text=Address must be at least 5 characters long')
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for locator('text=Address must be at least 5 characters long')

```

# Page snapshot

```yaml
- generic [ref=e1]:
    - generic [ref=e3]:
        - banner [ref=e4]:
            - generic [ref=e5]:
                - generic [ref=e7] [cursor=pointer]:
                    - paragraph [ref=e9]: 🕌
                    - heading "MMS" [level=3] [ref=e10]
                - paragraph [ref=e12] [cursor=pointer]: Sign In
        - navigation [ref=e13]:
            - generic [ref=e16]:
                - paragraph [ref=e18]: MAIN MENU
                - generic [ref=e20] [cursor=pointer]:
                    - img [ref=e22]
                    - generic [ref=e26]: Dashboard
        - main [ref=e27]:
            - generic [ref=e29]:
                - generic [ref=e30]:
                    - heading "Households" [level=2] [ref=e31]
                    - button "+ Add Household" [ref=e33] [cursor=pointer]:
                        - generic [ref=e35]: + Add Household
                - generic [ref=e39]:
                    - generic [ref=e40]:
                        - paragraph [ref=e41]: 123 Test St
                        - button [ref=e42] [cursor=pointer]:
                            - img [ref=e44]
                    - paragraph [ref=e49]: 'City: Test City'
                    - link "View Household Context" [ref=e50] [cursor=pointer]:
                        - /url: /households/1
                        - generic [ref=e52]: View Household Context
    - dialog "Add New Household" [ref=e54]:
        - banner [ref=e55]:
            - heading "Add New Household" [level=2] [ref=e56]
            - button [ref=e57] [cursor=pointer]:
                - img [ref=e58]
        - generic [ref=e61]:
            - generic [ref=e62]:
                - generic [ref=e63]:
                    - generic [ref=e64]: Address Line 1 *
                    - textbox "Address Line 1" [ref=e66]:
                        - /placeholder: 123 Main St
                - generic [ref=e67]:
                    - generic [ref=e68]: Address Line 2
                    - textbox "Address Line 2" [ref=e70]:
                        - /placeholder: Apt 4B
                - generic [ref=e71]:
                    - generic [ref=e72]:
                        - generic [ref=e73]: City
                        - textbox "City" [ref=e75]:
                            - /placeholder: Springfield
                    - generic [ref=e76]:
                        - generic [ref=e77]: State/Province
                        - textbox "State/Province" [ref=e79]:
                            - /placeholder: IL
                - generic [ref=e80]:
                    - generic [ref=e81]:
                        - generic [ref=e82]: Postal Code
                        - textbox "Postal Code" [ref=e84]:
                            - /placeholder: '62701'
                    - generic [ref=e85]:
                        - generic [ref=e86]: Country
                        - textbox "Country" [ref=e88]:
                            - /placeholder: USA
                - generic [ref=e89]:
                    - generic [ref=e90]: Mahalla/Zone
                    - textbox "Mahalla/Zone" [ref=e92]:
                        - /placeholder: North Side
                - generic [ref=e93]:
                    - generic [ref=e94]: Notes
                    - textbox "Notes" [ref=e96]:
                        - /placeholder: Any additional information...
            - generic [ref=e97]:
                - button "Cancel" [ref=e98] [cursor=pointer]:
                    - generic [ref=e100]: Cancel
                - button "Create Household" [active] [ref=e101] [cursor=pointer]:
                    - generic [ref=e103]: Create Household
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  |
  3  | test.describe('Households Page Forms', () => {
  4  |   test.beforeEach(async ({ page }) => {
  5  |     await page.addInitScript(() => {
  6  |       localStorage.setItem('e2e_bypass', 'true');
  7  |     });
  8  |
  9  |     await page.route('**/api/households*', async (route) => {
  10 |       if (route.request().method() === 'GET') {
  11 |         await route.fulfill({
  12 |           status: 200,
  13 |           contentType: 'application/json',
  14 |           body: JSON.stringify({
  15 |             data: [
  16 |                { id: '1', address_line_1: '123 Test St', city: 'Test City' }
  17 |             ],
  18 |           })
  19 |         });
  20 |       } else if (route.request().method() === 'POST') {
  21 |         await route.fulfill({
  22 |           status: 201,
  23 |           contentType: 'application/json',
  24 |           body: JSON.stringify({ id: '2', message: 'Household created' })
  25 |         });
  26 |       } else {
  27 |         await route.continue();
  28 |       }
  29 |     });
  30 |
  31 |     await page.goto('/households');
  32 |   });
  33 |
  34 |   test('should display validation errors for empty required fields', async ({ page }) => {
  35 |     await page.click('button:has-text("+ Add Household")');
  36 |     await expect(page.locator('text=Add New Household')).toBeVisible();
  37 |
  38 |     await page.click('button:has-text("Create Household")');
  39 |
> 40 |     await expect(page.locator('text=Address must be at least 5 characters long')).toBeVisible();
     |                                                                                   ^ Error: expect(locator).toBeVisible() failed
  41 |   });
  42 |
  43 |   test('should submit successfully with valid data', async ({ page }) => {
  44 |     await page.click('button:has-text("+ Add Household")');
  45 |     await expect(page.locator('text=Add New Household')).toBeVisible();
  46 |
  47 |     await page.fill('input[placeholder="123 Main St"]', '456 New Household Lane');
  48 |
  49 |     await page.click('button[type="submit"]');
  50 |
  51 |     await expect(page.locator('text=Household created successfully')).toBeVisible();
  52 |     await expect(page.locator('text=Add New Household')).toBeHidden();
  53 |   });
  54 | });
  55 |
```
