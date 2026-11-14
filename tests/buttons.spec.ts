import { test, expect } from '@playwright/test';

test('Basic Elements Buttons Test', async ({ page }) => {
    await test.step('Open buttons page', async () => {
        await page.goto('https://playwright-playground.com/basic/buttons');
    });
    
    await test.step('Click the first button', async () => {
        await page.getByRole('button', { name: 'Click me', exact: true }).click();
        await expect(page.getByText('Button clicked')).toBeVisible();
    });
    
    await test.step('Click the primary action button', async () => {
        await page.getByRole('button', { name: 'Primary action'}).click();
        await expect(page.getByText('Primary button clicked')).toBeVisible();
    });
    
    await test.step('Verify the disabled button is disabled', async () => {
        await expect(page.getByRole('button', { name: 'Disabled button' })).toBeDisabled();
    });

    await test.step('Double-click the button', async () => {
        await page.getByRole('button', { name: 'Double click me'}).dblclick();
        await expect(page.getByText('Double click detected')).toBeVisible();
    });

    await test.step('Right click the button', async () => {
        await page.getByRole('button', { name: 'Right click me' }).click({ button: 'right' });
        await expect(page.getByText('Right click detected')).toBeVisible();
    });

});