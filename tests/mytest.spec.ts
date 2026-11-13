import { test, expect } from '@playwright/test';

test('Todo test', async ({ page }) => {
    await page.goto('https://demo.playwright.dev/todomvc');
    await page.getByPlaceholder('What needs to be done?').fill('Learn Playwright');
    await page.keyboard.press('Enter');

    const items = await page.locator('.todo-list li').count();
    expect(items).toBeGreaterThan(0);
});