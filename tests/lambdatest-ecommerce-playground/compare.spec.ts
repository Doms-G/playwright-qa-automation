import { expect, test, type Page } from '@playwright/test';
import { CartPage } from './pages/cart.page';
import { StorePage } from './pages/store.page';

async function addFirstSearchResultToCompare(
    page: Page,
    searchTerm: string
): Promise<string> {
    const storePage = new StorePage(page);
    await storePage.open();
    await storePage.searchForProduct(searchTerm);

    const productLink = page.locator('.product-thumb h4.title a').first();
    await expect(productLink).toBeVisible();
    const productName = (await productLink.innerText()).trim();
    await productLink.click();
    await expect(
        page.getByRole('heading', { name: productName, level: 1 })
    ).toBeVisible();

    const compareResponse = page.waitForResponse(
        (response) =>
            response.url().includes('compare.add') &&
            response.request().method() === 'POST'
    );
    await page.getByRole('button', { name: 'Compare this Product' }).click();
    await compareResponse;
    await expect(page.getByRole('alert')).toContainText(
        `Success: You have added ${productName} to your product comparison!`
    );

    return productName;
}

test.describe('Product compare', () => {
    let firstProductName: string;
    let secondProductName: string;

    test.beforeEach(async ({ page }) => {
        firstProductName = await addFirstSearchResultToCompare(page, 'HTC');
        secondProductName = await addFirstSearchResultToCompare(page, 'iPhone');

        const compareLink = page
            .getByRole('alert')
            .getByRole('link', { name: /Product Compare/ });
        await expect(compareLink).toBeVisible();
        await compareLink.click();
        await expect(page).toHaveURL(/route=product\/compare/);
    });

    test('compare page shows the products I selected', async ({ page }) => {
        const productRow = page
            .locator('table')
            .getByRole('row')
            .filter({
                has: page.getByRole('link', {
                    name: firstProductName,
                    exact: true,
                }),
            });

        await expect(productRow).toBeVisible();
        await expect
            .poll(async () =>
                (await productRow.getByRole('link').allTextContents()).map(
                    (name) => name.trim()
                )
            )
            .toEqual([firstProductName, secondProductName]);
    });

    test('removing a product updates the comparison', async ({ page }) => {
        const compareTable = page.locator('table');

        await compareTable.getByRole('link', { name: 'Remove' }).first().click();

        await expect(
            compareTable.getByRole('link', {
                name: firstProductName,
                exact: true,
            })
        ).toHaveCount(0);
        await expect(
            compareTable.getByRole('link', {
                name: secondProductName,
                exact: true,
            })
        ).toBeVisible();
    });

    test('can add a compared product to the cart', async ({ page }) => {
        const compareTable = page.locator('table');

        await compareTable
            .getByRole('button', { name: 'Add to Cart' })
            .first()
            .click();

        const notification = page.getByRole('alert');
        await expect(notification).toContainText(
            `Success: You have added ${firstProductName} to your shopping cart!`
        );
        await notification.getByRole('link', { name: 'View Cart' }).click();

        await new CartPage(page).expectProduct(firstProductName);
    });
});