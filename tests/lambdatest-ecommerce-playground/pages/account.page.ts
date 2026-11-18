import { expect, type Page } from '@playwright/test';

export class AccountPage {
    constructor(private readonly page: Page) {}

    async openFromMyAccountIcon(): Promise<void> {
        await this.page.locator('a[title="My Account"]').click();
    }

    async openRegistrationFromMenu(): Promise<void> {
        await this.page.getByRole('link', { name: /My account/ }).hover();
        await this.page.getByRole('link', { name: 'Register', exact: true }).click();
    }

    async openLoginFromMenu(): Promise<void> {
        await this.page.getByRole('link', { name: /My account/ }).hover();
        await this.page.getByRole('link', { name: 'Login', exact: true }).click();
    }

    async startRegistration(): Promise<void> {
        const newCustomer = this.page
            .getByRole('heading', { name: 'New Customer' })
            .locator('..');

        await newCustomer
            .getByRole('link', { name: 'Continue', exact: true })
            .click();
    }

    async expectDashboard(): Promise<void> {
        await expect(this.page).toHaveTitle(/My Account/);
        await expect(this.page).toHaveURL(
            url => url.searchParams.get('route') === 'account/account'
        );
    }
}
