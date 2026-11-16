import { test } from '@playwright/test';
import { AccountPage } from './pages/account.page';
import { AccountSuccessPage } from './pages/account-success.page';
import { RegisterPage } from './pages/register.page';

test('Register through the My Account icon', async ({ page }) => {
    await page.goto('https://ecommerce-playground.lambdatest.io/');

    const accountPage = new AccountPage(page);
    await accountPage.openFromMyAccountIcon();
    await accountPage.startRegistration();

    const registerPage = new RegisterPage(page);
    await registerPage.register({
        firstName: 'Doms',
        lastName: 'Test',
        email: `doms-${Date.now()}@example.com`,
        password: 'doms-test-1234',
    });

    const successPage = new AccountSuccessPage(page);
    await successPage.expectVisible();
    await successPage.continueToAccount();
    await accountPage.expectDashboard();
});