import { expect, type Page } from '@playwright/test';

export class OrderSuccessPage {
    constructor(private readonly page: Page) {}

    async expectVisible(): Promise<void> {
        await expect(
            this.page.getByText('Your order has been placed!', { exact: true })
        ).toBeVisible();
    }

    async continueToStore(): Promise<void> {
        await this.page.getByText('Continue', { exact: true }).last().click();
    }
}
