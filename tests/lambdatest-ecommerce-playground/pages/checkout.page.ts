import { expect, type Page } from '@playwright/test';

export interface GuestDetails {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
    city: string;
    postCode: string;
}

export class CheckoutPage {
    constructor(private readonly page: Page) {}

    async selectGuestCheckout(): Promise<void> {
        await this.page.getByRole('radio', { name: 'Guest Checkout' }).check();

        const continueButton = this.page
            .getByRole('button', { name: 'Continue', exact: true })
            .first();
        await expect(continueButton).toBeVisible();
        await continueButton.click();
    }

    async fillGuestDetails(details: GuestDetails): Promise<void> {
        const fields = [
            { label: 'First Name', value: details.firstName },
            { label: 'Last Name', value: details.lastName },
            { label: 'E-Mail', value: details.email },
            { label: 'Address 1', value: details.address },
            { label: 'City', value: details.city },
            { label: 'Post Code', value: details.postCode },
        ];

        for (const { label, value } of fields) {
            const field = this.page.getByLabel(label);
            await expect(field).toBeVisible();
            await field.fill(value);
        }

        const country = this.page.locator('#input-shipping-country');
        const region = this.page.locator('#input-shipping-zone');

        await country.selectOption({ label: 'Australia' });
        await expect(country.locator('option:checked')).toHaveText('Australia');
        await expect(
            region.getByRole('option', {
                name: 'New South Wales',
                exact: true,
            })
        ).toBeAttached({ timeout: 15_000 });
        await region.selectOption({ label: 'New South Wales' });
        await expect(region.locator('option:checked')).toHaveText('New South Wales');
    }

    async continueToShipping(): Promise<void> {
        await this.page
            .getByRole('button', { name: 'Continue', exact: true })
            .last()
            .click();
        await expect(
            this.page.getByRole('group', { name: 'Shipping Method' })
        ).toBeVisible({ timeout: 15_000 });
    }

    async selectFlatRateShipping(): Promise<void> {
        const shippingMethod = this.page.getByRole('group', {
            name: 'Shipping Method',
        });
        await shippingMethod
            .getByRole('button', { name: 'Choose', exact: true })
            .click();

        const shippingDialog = this.page.getByRole('dialog');
        await expect(shippingDialog).toBeVisible();

        const flatRate = shippingDialog.getByRole('radio', {
            name: /Flat Shipping Rate/i,
        });
        await flatRate.check();
        await expect(flatRate).toBeChecked();

        const continueButton = shippingDialog.getByRole('button', {
            name: 'Continue',
            exact: true,
        });
        await expect(continueButton).toBeEnabled();
        const saveResponse = this.page.waitForResponse(
            response =>
                response.url().includes('checkout/shipping_method.save') &&
                response.status() === 200,
            { timeout: 15_000 }
        );
        await continueButton.click();
        await saveResponse;

        // The checkout page may leave Bootstrap's modal classes applied.
        // Remove the stale modal state after the save request succeeds.
        await shippingDialog.evaluate((dialog: HTMLElement) => {
            const bootstrap = (window as unknown as {
                bootstrap?: {
                    Modal: {
                        getInstance: (element: HTMLElement) => { hide: () => void } | null;
                    };
                };
            }).bootstrap;
            const modal = bootstrap?.Modal.getInstance(dialog);
            if (modal) {
                modal.hide();
            } else {
                dialog.classList.remove('show');
                dialog.style.display = 'none';
            }
        });
        await expect(shippingDialog).toBeHidden({ timeout: 15_000 });
    }

    async selectCashOnDelivery(): Promise<void> {
        const paymentMethod = this.page.getByRole('group', {
            name: 'Payment Method',
        });
        await expect(paymentMethod).toBeVisible();
        await paymentMethod
            .getByRole('button', { name: 'Choose', exact: true })
            .click();

        const paymentDialog = this.page.getByRole('dialog');
        await expect(paymentDialog).toBeVisible();
        await expect(
            paymentDialog.getByRole('heading', {
                name: /Payment method options/i,
            })
        ).toBeVisible();

        await paymentDialog
            .getByRole('radio', { name: 'Cash On Delivery', exact: true })
            .check();
        const saveResponse = this.page.waitForResponse(
            response =>
                response.url().includes('checkout/payment_method.save') &&
                response.status() === 200,
            { timeout: 15_000 }
        );
        await paymentDialog.getByRole('button', { name: 'Continue' }).click();
        await saveResponse;
        await paymentDialog.evaluate((dialog: HTMLElement) => {
            const bootstrap = (window as unknown as {
                bootstrap?: {
                    Modal: {
                        getInstance: (element: HTMLElement) => { hide: () => void } | null;
                    };
                };
            }).bootstrap;
            const modal = bootstrap?.Modal.getInstance(dialog);
            if (modal) {
                modal.hide();
            } else {
                dialog.classList.remove('show');
                dialog.style.display = 'none';
            }
        });
    }

    async confirmOrder(): Promise<void> {
        await this.page
            .getByRole('button', { name: 'Confirm Order', exact: true })
            .click();
    }
}
