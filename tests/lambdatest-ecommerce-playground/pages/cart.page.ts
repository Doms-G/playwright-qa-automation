import { expect, type Page } from '@playwright/test';

export class CartPage {
    constructor(private readonly page: Page) {}

    async expectProduct(productName: string): Promise<void> {
        await expect(this.page).toHaveURL(/route=checkout\/cart/, { timeout: 15_000 });
        await expect(
            this.page.getByText(productName, { exact: true }).first()
        ).toBeVisible({ timeout: 15_000 });
    }

    async startCheckout(): Promise<void> {
        await this.page.getByRole('link', { name: 'Checkout', exact: true }).click();
    }
}
