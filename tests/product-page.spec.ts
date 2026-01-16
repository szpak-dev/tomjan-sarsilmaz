import { test, expect } from '@playwright/test';

test.describe('Product Page', () => {
  test('should display product page with name', async ({ page }) => {
    await page.goto('/en/sar9-black/');
    await page.waitForLoadState('networkidle');
    
    const productName = page.locator('h1').first();
    await expect(productName).toBeVisible({ timeout: 5000 });
    const text = await productName.textContent();
    expect(text?.length).toBeGreaterThan(0);
  });

  test('should display product picture', async ({ page }) => {
    await page.goto('/en/sar9-black/');
    await page.waitForLoadState('networkidle');
    
    const images = page.locator('img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(0);
    
    const mainImage = images.first();
    await expect(mainImage).toBeVisible({ timeout: 5000 });
  });

  test('should display specification section', async ({ page }) => {
    await page.goto('/en/sar9-black/');
    await page.waitForLoadState('networkidle');
    
    const specElements = page.locator('text=Specification');
    await expect(specElements.first()).toBeVisible({ timeout: 5000 });
  });

  test('should display category name', async ({ page }) => {
    await page.goto('/en/sar9-black/');
    await page.waitForLoadState('networkidle');
    
    const headings = page.locator('h1, h2');
    const headingCount = await headings.count();
    expect(headingCount).toBeGreaterThanOrEqual(2);
  });

  test('should display description section', async ({ page }) => {
    await page.goto('/en/sar9-black/');
    await page.waitForLoadState('networkidle');
    
    const descElements = page.locator('text=Description');
    await expect(descElements.first()).toBeVisible({ timeout: 5000 });
    
    const paragraphs = page.locator('p');
    const paragraphCount = await paragraphs.count();
    expect(paragraphCount).toBeGreaterThan(0);
  });

  test('should have proper layout structure', async ({ page }) => {
    await page.goto('/en/sar9-black/');
    await page.waitForLoadState('networkidle');
    
    const mainPage = page.locator('#productPage');
    await expect(mainPage).toBeVisible({ timeout: 5000 });
    
    const images = page.locator('img');
    await expect(images.first()).toBeVisible({ timeout: 5000 });
  });
});
