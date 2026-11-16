import { expect, type Page } from '@playwright/test';

export class StorePage {
    constructor(private readonly page: Page) {}

    async open(): Promise<void> {
        await this.page.goto('https://ecommerce-playground.lambdatest.io/');
    }

    async searchForProduct(searchTerm: string): Promise<void> {
        await this.page.getByPlaceholder('Search For Products').fill(searchTerm);

        const searchButton = this.page.locator(
            'form.pg-search button.pg-search-btn'
        );
        await expect(searchButton).toBeVisible();
        await searchButton.click();
    }

    async openProduct(productName: string): Promise<void> {
        const product = this.page.getByRole('link', {
            name: productName,
            exact: true,
        }).first();

        await expect(product).toBeVisible();
        await product.click();
    }

    async expectHome(): Promise<void> {
        await expect(this.page).toHaveTitle(/Your Store/);
        await expect(this.page).toHaveURL(
            /ecommerce-playground\.lambdatest\.io\/(?:\?.*)?$/
        );
    }
}
