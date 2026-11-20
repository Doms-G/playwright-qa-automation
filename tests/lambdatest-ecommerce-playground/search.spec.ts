import { expect, test } from '@playwright/test';
import { StorePage } from './pages/store.page';

test('search for iPhone and verify all result names contain iPhone', async ({ page }) => {
    test.setTimeout(90_000);

    const storePage = new StorePage(page);
    await storePage.open();
    await storePage.searchForProduct('iPhone');

    const productNames = page.locator('.product-thumb h4.title a');
    await expect(productNames.first()).toBeVisible();

    const names = await productNames.allTextContents();
    expect(names.length).toBeGreaterThan(0);
    for (const name of names) {
        expect(name.toLowerCase()).toContain('iphone');
    }

});