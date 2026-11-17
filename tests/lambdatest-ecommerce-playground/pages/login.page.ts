import { type Page } from '@playwright/test';

export interface LoginDetails {
    email: string;
    password: string;
}

export class LoginPage {
    constructor(private readonly page: Page) {}

    async login(details: LoginDetails): Promise<void> {
        await this.page.getByPlaceholder('E-Mail Address').fill(details.email);
        await this.page.getByPlaceholder('Password').fill(details.password);
        await this.page.getByRole('button', { name: 'Login', exact: true }).click();
    }
}
