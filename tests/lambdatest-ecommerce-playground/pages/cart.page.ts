import { expect, type Locator, type Page } from '@playwright/test';

export class CartPage {
    constructor(private readonly page: Page) {}

    private productRow(productName: string): Locator {
        return this.page
            .getByRole('row')
            .filter({
                has: this.page.getByRole('link', {
                    name: productName,
                    exact: true,
                }),
            });
    }

    async expectProduct(productName: string): Promise<void> {
        await expect(this.page).toHaveURL(/route=checkout\/cart/, { timeout: 15_000 });
        await expect(
            this.page.getByText(productName, { exact: true }).first()
        ).toBeVisible({ timeout: 15_000 });
    }

    async itemCount(): Promise<number> {
        const quantities = this.page
            .getByRole('table')
            .getByRole('textbox');
        let count = 0;

        for (const input of await quantities.all()) {
            const quantity = Number(await input.inputValue());
            if (!Number.isInteger(quantity) || quantity < 1) {
                throw new Error(`Unexpected cart quantity: ${quantity}`);
            }
            count += quantity;
        }

        return count;
    }

    async orderTotal(): Promise<number> {
        if ((await this.itemCount()) === 0) {
            return 0;
        }

        const totalRow = this.page
            .getByRole('row')
            .filter({
                has: this.page.getByRole('cell', {
                    name: 'Total',
                    exact: true,
                }),
            });
        const totalText = await totalRow.innerText();
        const amount = totalText.match(/\$([\d,]+\.\d{2})/);
        if (!amount) {
            throw new Error(`Could not read the cart total from "${totalText}".`);
        }

        return Number(amount[1].replace(/,/g, ''));
    }

    async productQuantity(productName: string): Promise<number> {
        const row = this.productRow(productName);
        if ((await row.count()) === 0) {
            return 0;
        }

        const quantity = Number(await row.getByRole('textbox').inputValue());
        if (!Number.isInteger(quantity) || quantity < 1) {
            throw new Error(`Unexpected cart quantity: ${quantity}`);
        }

        return quantity;
    }

    async restoreProductQuantity(
        productName: string,
        quantity: number
    ): Promise<void> {
        const row = this.productRow(productName);
        const currentQuantity = await this.productQuantity(productName);

        if (quantity === 0) {
            if (currentQuantity > 0) {
                await row.getByRole('link', { name: 'Remove', exact: true }).click();
                await expect(row).toHaveCount(0);
            }
            return;
        }

        await expect(row).toHaveCount(1);
        if (currentQuantity !== quantity) {
            await row.getByRole('textbox').fill(String(quantity));
            await row.getByRole('button', { name: 'Update' }).click();
            await expect(row.getByRole('textbox')).toHaveValue(String(quantity));
        }
    }

    async startCheckout(): Promise<void> {
        await this.page.getByRole('link', { name: 'Checkout', exact: true }).click();
    }
}
