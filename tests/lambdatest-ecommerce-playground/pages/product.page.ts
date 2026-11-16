import { expect, type Page } from '@playwright/test';

export class ProductPage {
    constructor(private readonly page: Page) {}

    async expectProduct(productName: string): Promise<void> {
        await expect(
            this.page.getByRole('heading', { name: productName, level: 1 })
        ).toBeVisible();
    }

    async addToCart(): Promise<void> {
        await this.page.locator('#button-cart').click();
    }

    async openCart(): Promise<void> {
        await this.page.locator('a[title="Shopping Cart"]').click();
    }
}
