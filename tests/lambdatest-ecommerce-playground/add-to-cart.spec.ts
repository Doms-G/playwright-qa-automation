import { expect, test, type Page } from '@playwright/test';
import { CartPage } from './pages/cart.page';
import { ProductPage } from './pages/product.page';
import { StorePage } from './pages/store.page';

async function addDealProductToCart(
    page: Page,
    productName: string
): Promise<void> {
    await page
        .getByRole('heading', { name: 'Deals of the Day', exact: true })
        .scrollIntoViewIfNeeded();

    const productCard = page
        .locator('.pg-deals-grid .pg-deal-card')
        .filter({ hasText: productName });
    await expect(productCard).toHaveCount(1);
    await productCard
        .getByRole('link', { name: /Add to Cart/ })
        .click();

    await expect(
        page.getByRole('heading', { name: productName, level: 1 })
    ).toBeVisible();
    await new ProductPage(page).addToCart();

    await expect(page.locator('.alert.alert-success')).toContainText(
        `Success: You have added ${productName} to your shopping cart!`
    );
}

test('add HTC Touch HD and iPod Touch from Deals of the Day to the cart', async ({
    page,
}) => {
    test.setTimeout(90_000);

    const storePage = new StorePage(page);
    await storePage.open();
    await addDealProductToCart(page, 'HTC Touch HD');

    await storePage.open();
    await addDealProductToCart(page, 'iPod Touch');

    await new ProductPage(page).openCart();

    const cartPage = new CartPage(page);
    await cartPage.expectProduct('HTC Touch HD');
    await cartPage.expectProduct('iPod Touch');

    await page.pause();
});