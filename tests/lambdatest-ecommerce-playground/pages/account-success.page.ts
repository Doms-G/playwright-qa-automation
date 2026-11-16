import { expect, type Page } from '@playwright/test';

export class AccountSuccessPage {
    constructor(private readonly page: Page) {}

    async expectVisible(): Promise<void> {
        await expect(
            this.page.getByRole('heading', {
                name: 'Your Account Has Been Created!',
            })
        ).toBeVisible();
    }

    async continueToAccount(): Promise<void> {
        await this.page
            .getByRole('link', { name: 'Continue', exact: true })
            .click();
    }
}
