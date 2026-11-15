import { test, expect } from '@playwright/test';

test('search for HTC and fill guest checkout details', async ({ page }) => {
    test.setTimeout(90_000);
    await page.goto('https://ecommerce-playground.lambdatest.io/');

    // Search for HTC and open a matching product.
    await page.getByPlaceholder('Search For Products').fill('htc');
    const searchButton = page.locator('form.pg-search button.pg-search-btn');
        await expect(searchButton).toBeVisible();
        await searchButton.click();

    const product = page.getByRole('link', {
        name: 'HTC Touch HD',
        exact: true,
    }).first();

    await expect(product).toBeVisible();
    await product.click();
    await expect(
        page.getByRole('heading', { name: 'HTC Touch HD', level: 1 })
    ).toBeVisible();

    // Add the product to the cart and open the cart.
    await page.locator('#button-cart').click();
    await page.locator('a[title="Shopping Cart"]').click();

    await expect(page).toHaveURL(/route=checkout\/cart/);
    await expect(
        page.getByText('HTC Touch HD', { exact: true }).first()
    ).toBeVisible();

    // Start checkout and choose guest checkout.
    await page.getByRole('link', { name: 'Checkout', exact: true }).click();
    await page.getByRole('radio', { name: 'Guest Checkout' }).check();
    const continueButton = page.getByRole('button', {
        name: 'Continue',
        exact: true,
    }).first();

    await expect(continueButton).toBeVisible();
    await continueButton.click();

    // Fill the guest billing details, including optional fields.
    const fields = [
        { label: 'First Name', value: 'Doms' },
        { label: 'Last Name', value: 'Test' },
        { label: 'E-Mail', value: 'doms@test.com' },
        { label: 'Address 1', value: '62 Hume Highway' },
        { label: 'City', value: 'Chullora' },
        { label: 'Post Code', value: '2190' },
    ];

    for (const { label, value } of fields) {
        const field = page.getByLabel(label);
        await expect(field).toBeVisible();
        await field.fill(value);
    }

    const country = page.getByLabel('Country');
    await country.selectOption({ label: 'Australia' });

    const region = page.getByLabel('Region / State');
    await expect(region).toContainText('New South Wales');
    await region.selectOption({ label: 'New South Wales' });

    // Submit the guest address and continue to shipping.
    await page.getByRole('button', { name: 'Continue', exact: true }).last().click();

    const shippingMethod = page.getByRole('group', { name: 'Shipping Method' });
    await shippingMethod.getByRole('button', { name: 'Choose', exact: true }).click();

    const shippingDialog = page.getByRole('dialog');
    await expect(shippingDialog).toBeVisible();

    const flatRate = shippingDialog.getByRole('radio', {
        name: /Flat Shipping Rate/i,
    });
    await flatRate.click();
    await expect(flatRate).toBeChecked();

    const shippingContinue = shippingDialog.getByRole('button', {
        name: 'Continue',
        exact: true,
    });

    await expect(shippingContinue).toBeEnabled();
    await shippingContinue.click();

    // Choose cash on delivery.
    const paymentMethod = page.getByRole('group', { name: 'Payment Method' });
    await expect(paymentMethod).toBeVisible();
    await paymentMethod.getByRole('button', { name: 'Choose', exact: true }).click();

    const paymentDialog = page.getByRole('dialog');
    await expect(paymentDialog).toBeVisible();
    await expect(
        paymentDialog.getByRole('heading', { name: /Payment method options/i })
    ).toBeVisible();

    await paymentDialog
        .getByRole('radio', { name: 'Cash On Delivery', exact: true })
        .check();
    await paymentDialog.getByRole('button', { name: 'Continue' }).click();

    // Confirm the order, verify success, then return to the homepage.
    await page.getByRole('button', { name: 'Confirm Order', exact: true }).click();
    await expect(
        page.getByText('Your order has been placed!', { exact: true })
    ).toBeVisible();

    await page.getByText('Continue', { exact: true }).last().click();
    await expect(page).toHaveTitle(/Your Store/);
    await expect(page).toHaveURL(/ecommerce-playground\.lambdatest\.io\/(?:\?.*)?$/);
});