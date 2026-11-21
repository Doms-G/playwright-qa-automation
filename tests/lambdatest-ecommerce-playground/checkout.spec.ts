import { test } from '@playwright/test';
import { CartPage } from './pages/cart.page';
import { CheckoutPage } from './pages/checkout.page';
import { OrderSuccessPage } from './pages/order-success.page';
import { ProductPage } from './pages/product.page';
import { StorePage } from './pages/store.page';

test('search for HTC and fill guest checkout details', async ({ page }) => {
    test.setTimeout(90_000);
    const storePage = new StorePage(page);
    await storePage.open();
    await storePage.searchForProduct('htc');
    await storePage.openProduct('HTC Touch HD');

    const productPage = new ProductPage(page);
    await productPage.expectProduct('HTC Touch HD');
    await productPage.addToCart();
    await productPage.openCart();

    const cartPage = new CartPage(page);
    await cartPage.expectProduct('HTC Touch HD');
    await cartPage.startCheckout();

    const checkoutPage = new CheckoutPage(page);
    await checkoutPage.selectGuestCheckout();
    await checkoutPage.fillGuestDetails({
        firstName: 'Doms',
        lastName: 'Test',
        email: 'doms@test.com',
        address: '62 Hume Highway',
        city: 'Chullora',
        postCode: '2190',
    });
    await checkoutPage.continueToShipping();
    await checkoutPage.selectFlatRateShipping();
    await checkoutPage.selectCashOnDelivery();
    await checkoutPage.confirmOrder();

    const orderSuccessPage = new OrderSuccessPage(page);
    await orderSuccessPage.expectVisible();
    await orderSuccessPage.continueToStore();
    await storePage.expectHome();
});