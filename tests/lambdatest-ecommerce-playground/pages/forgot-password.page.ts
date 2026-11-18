import { type Page } from '@playwright/test';

export class ForgotPasswordPage {
    constructor(private readonly page: Page) {}

    async openFromLogin(): Promise<void> {
        await this.page
            .getByRole('link', { name: 'Forgotten Password', exact: true })
            .click();
    }

    async openFromAccountMenu(): Promise<void> {
        await this.page
            .locator('.list-group')
            .getByRole('link', { name: /Forgotten Password/ })
            .click();
    }

    async submitEmail(email: string): Promise<void> {
        await this.page.getByPlaceholder('E-Mail Address').fill(email);
        await this.page
            .getByRole('button', { name: 'Continue', exact: true })
            .click();
    }

    async expectAccountLogin(): Promise<void> {
        await this.page.waitForURL(url =>
            url.searchParams.get('route') === 'account/login'
        );
    }
}
