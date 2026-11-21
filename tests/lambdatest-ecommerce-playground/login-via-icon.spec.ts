import { test } from '@playwright/test';
import { AccountPage } from './pages/account.page';
import { LoginPage } from './pages/login.page';

test('log in through the My Account icon and verify the account dashboard', async ({ page }) => {
    await page.goto('https://ecommerce-playground.lambdatest.io/');

    const accountPage = new AccountPage(page);
    await accountPage.openFromMyAccountIcon();

    const loginPage = new LoginPage(page);
    await loginPage.login({
        email: 'doms@test.com',
        password: 'doms-test-1234',
    });

    await accountPage.expectDashboard();
});