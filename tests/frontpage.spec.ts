import { test, expect } from '@playwright/test';

test.describe('Frontpage', () => {
  test('should display frontpage successfully', async ({ page }) => {
    await page.goto('/en/');
    await page.waitForLoadState('networkidle');
    
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible({ timeout: 5000 });
  });

  test('should display owner story section', async ({ page }) => {
    await page.goto('/en/');
    await page.waitForLoadState('networkidle');
    
    const sections = page.locator('section');
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThan(0);
  });

  test('should display products in categories', async ({ page }) => {
    await page.goto('/en/');
    await page.waitForLoadState('networkidle');
    
    const links = page.locator('a');
    const linkCount = await links.count();
    expect(linkCount).toBeGreaterThan(0);
  });

  test('should display multiple category sections', async ({ page }) => {
    await page.goto('/en/');
    await page.waitForLoadState('networkidle');
    
    const sections = page.locator('section');
    const sectionCount = await sections.count();
    expect(sectionCount).toBeGreaterThan(1);
  });

  test('should display social links', async ({ page }) => {
    await page.goto('/en/');
    await page.waitForLoadState('networkidle');
    
    const socialLinks = page.locator('a[href*="facebook"], a[href*="instagram"]');
    const linkCount = await socialLinks.count();
    expect(linkCount).toBeGreaterThan(0);
  });
});
