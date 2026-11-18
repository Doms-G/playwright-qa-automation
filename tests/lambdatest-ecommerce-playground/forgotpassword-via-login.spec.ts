import { test } from '@playwright/test';
import { AccountPage } from './pages/account.page';
import { ForgotPasswordPage } from './pages/forgot-password.page';

test('request a password reset and return to Account Login', async ({ page }) => {
    await page.goto('https://ecommerce-playground.lambdatest.io/');

    const accountPage = new AccountPage(page);
    await accountPage.openFromMyAccountIcon();

    const forgotPasswordPage = new ForgotPasswordPage(page);
    await forgotPasswordPage.openFromLogin();
    await forgotPasswordPage.submitEmail('doms@test.com');
    await forgotPasswordPage.expectAccountLogin();
});