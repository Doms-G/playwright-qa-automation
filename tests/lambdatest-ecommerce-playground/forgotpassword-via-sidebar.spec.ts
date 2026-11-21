import { test } from '@playwright/test';
import { AccountPage } from './pages/account.page';
import { ForgotPasswordPage } from './pages/forgot-password.page';

test('request a password reset from the My Account menu', async ({ page }) => {
    await page.goto('https://ecommerce-playground.lambdatest.io/');

    const accountPage = new AccountPage(page);
    await accountPage.openLoginFromMenu();

    const forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.openFromAccountMenu();
    await forgotPasswordPage.submitEmail('doms@test.com');
    await forgotPasswordPage.expectAccountLogin();
});