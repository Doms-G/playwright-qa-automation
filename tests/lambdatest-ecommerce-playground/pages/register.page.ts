import { expect, type Page } from '@playwright/test';

export interface RegistrationDetails {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export class RegisterPage {
    constructor(private readonly page: Page) {}

    async register(details: RegistrationDetails): Promise<void> {
        await this.page.getByPlaceholder('First Name').fill(details.firstName);
        await this.page.getByPlaceholder('Last Name').fill(details.lastName);
        await this.page.getByPlaceholder('E-Mail').fill(details.email);
        await this.page.getByPlaceholder('Password').fill(details.password);

        const privacyAgreement = this.page.locator('input[name="agree"]');
        await privacyAgreement.check();
        await expect(privacyAgreement).toBeChecked();

        await this.page
            .getByRole('button', { name: 'Continue', exact: true })
            .click();
    }
}
