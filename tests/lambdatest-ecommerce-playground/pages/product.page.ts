import { expect, type Page } from '@playwright/test';

export class ProductPage {
    constructor(private readonly page: Page) {}

    async expectProduct(productName: string): Promise<void> {
        await expect(
            this.page.getByRole('heading', { name: productName, level: 1 })
        ).toBeVisible();
    }

    async addToCart(): Promise<void> {
        const cartResponse = this.page.waitForResponse(
            response =>
                response.url().includes('checkout/cart.add') &&
                response.status() === 200,
            { timeout: 15_000 }
        );
        await this.page.locator('#button-cart').click();
        await cartResponse;
        await expect(this.page.locator('.alert-success')).toContainText(
            'Success:',
            { timeout: 15_000 }
        );
    }

    async openCart(): Promise<void> {
        await Promise.all([
            this.page.waitForURL(/route=checkout\/cart/, { timeout: 15_000 }),
            this.page.locator('a[title="Shopping Cart"]').click(),
        ]);
    }
}
