import { expect, test, type Page } from '@playwright/test';
import { AccountPage } from './pages/account.page';
import { CartPage } from './pages/cart.page';
import { LoginPage } from './pages/login.page';
import { WishlistPage, wishlistProduct } from './pages/wishlist.page';

async function login(page: Page): Promise<string> {
    const email = process.env.TEST_EMAIL?.trim();
    const password = process.env.TEST_PASSWORD;

    if (!email || !password) {
        test.skip(
            true,
            'Set TEST_EMAIL and TEST_PASSWORD to run the logged-in wishlist tests.'
        );
    }

    await page.goto('/index.php?route=account/login');
    await new LoginPage(page).login({ email, password });
    await new AccountPage(page).expectDashboard();

    const customerToken = new URL(page.url()).searchParams.get('customer_token');
    if (!customerToken) {
        throw new Error('The account login response did not include a customer token.');
    }
    return customerToken;
}

const loggedInTest = test.extend<{ wishlistPage: WishlistPage }>({
    wishlistPage: async ({ page, browser }, use) => {
        const customerToken = await login(page);
        const wishlistPage = new WishlistPage(page, customerToken);
        const productWasPresent = await wishlistPage.hasProduct(
            wishlistProduct.name
        );
        if (productWasPresent) {
            await wishlistPage.removeProduct(wishlistProduct.name);
        }

        try {
            await use(wishlistPage);
        } finally {
            const cleanupContext = await browser.newContext();
            try {
                const cleanupPage = await cleanupContext.newPage();
                const cleanupToken = await login(cleanupPage);
                const cleanupWishlistPage = new WishlistPage(
                    cleanupPage,
                    cleanupToken
                );
                await cleanupWishlistPage.removeProductIfPresent(
                    wishlistProduct.name
                );
                if (productWasPresent) {
                    await cleanupWishlistPage.openProduct();
                    await cleanupWishlistPage.addProductToWishlist();
                }
            } finally {
                await cleanupContext.close();
            }
        }
    },
});

test.describe('Add to Wish List', () => {
    loggedInTest.describe.configure({ mode: 'serial' });

    // Verifies the add action shows a success notification containing the product name.
    loggedInTest('add product to wish list shows success popup', async ({
        page,
        wishlistPage,
    }) => {
        await test.step('Open the product and add it to the wish list', async () => {
            await wishlistPage.openProduct();
        });
        const notification = await test.step(
            'Verify the success popup names the product',
            async () => wishlistPage.addProductToWishlist()
        );
        await expect(notification).toContainText(wishlistProduct.name);
    });

    // Verifies the header icon opens the list; the live site currently drops customer_token.
    loggedInTest('open wish list through the header icon', async ({
        wishlistPage,
    }) => {
        test.fail(
            true,
            'The live playground header link omits customer_token and redirects to login.'
        );
        await test.step('Add a product to the wish list', async () => {
            await wishlistPage.openProduct();
            await wishlistPage.addProductToWishlist();
        });
        await test.step('Open the wish list from the header and verify the product', async () => {
            await wishlistPage.openFromHeader();
            await wishlistPage.expectProduct(wishlistProduct.name);
        });
    });

    // Verifies the wish list link in the success popup opens the list and shows the product.
    loggedInTest('open wish list through the success popup', async ({
        wishlistPage,
    }) => {
        await test.step('Add a product to the wish list', async () => {
            await wishlistPage.openProduct();
        });
        const notification = await wishlistPage.addProductToWishlist();

        await test.step('Follow the popup wish list link and verify the product', async () => {
            await wishlistPage.openFromNotification(notification);
            await wishlistPage.expectProduct(wishlistProduct.name);
        });
    });

    // Verifies removing a wish list item shows success and removes its row.
    loggedInTest('remove an item from the wish list', async ({
        wishlistPage,
    }) => {
        await test.step('Add the product and open the wish list', async () => {
            await wishlistPage.openProduct();
            await wishlistPage.addProductToWishlist();
            await wishlistPage.openWishlist();
        });
        await test.step('Remove the product and verify it is absent', async () => {
            await wishlistPage.removeProduct(wishlistProduct.name);
        });
    });

    // Verifies adding a wish list item to the cart shows success and lists it in the cart.
    loggedInTest('add to cart from the wish list', async ({ page, wishlistPage }) => {
        await test.step('Add the product to the wish list and open it', async () => {
            await wishlistPage.openProduct();
            await wishlistPage.addProductToWishlist();
            await wishlistPage.openWishlist();
        });

        const cartPage = new CartPage(page);
        await wishlistPage.openCart();
        const priorItemCount = await cartPage.itemCount();
        const priorOrderTotal = await cartPage.orderTotal();
        const priorProductQuantity = await cartPage.productQuantity(
            wishlistProduct.name
        );

        try {
            await wishlistPage.openWishlist();
            const notification = await test.step(
                'Add the wish list product to the cart',
                async () => wishlistPage.addProductToCart(wishlistProduct.name)
            );
            await expect(notification).toContainText(
                /\d+ item\(s\) - \$[\d,.]+\.\d{2}/
            );

            await test.step('Verify cart count, total, and product', async () => {
                await wishlistPage.openCart();
                await cartPage.expectProduct(wishlistProduct.name);
                expect(await cartPage.itemCount()).toBe(priorItemCount + 1);
                expect(await cartPage.orderTotal()).toBeGreaterThan(
                    priorOrderTotal
                );
            });
        } finally {
            await wishlistPage.openCart();
            await cartPage.restoreProductQuantity(
                wishlistProduct.name,
                priorProductQuantity
            );
        }
    });

    // Verifies Continue returns the signed-in user from the wish list to My Account.
    loggedInTest('continue browsing from the wish list', async ({
        page,
        wishlistPage,
    }) => {
        await wishlistPage.openWishlist();
        await test.step('Continue to the expected account page', async () => {
            await wishlistPage.continueBrowsing();
            await expect(page).toHaveURL(/route=account\/account/);
            await expect(
                page.getByRole('heading', {
                    name: 'My Account',
                    exact: true,
                    level: 2,
                })
            ).toBeVisible();
        });
    });
});

// Verifies a fresh guest session is prompted to sign in and cannot open its wish list.
test('guest user is prompted to log in when adding to the wish list', async ({
    browser,
}) => {
    const context = await browser.newContext();

    try {
        const page = await context.newPage();
        const wishlistPage = new WishlistPage(page);

        await test.step('Open a product as a guest and try to save it', async () => {
            await wishlistPage.openProduct();
        });
        const notification = await test.step(
            'Click Add to Wish List',
            async () => wishlistPage.clickAddToWishlist()
        );

        await test.step('Verify the prompt and that the product was not added', async () => {
            await wishlistPage.expectGuestPrompt(notification);
        });

        await test.step('Verify the guest wish list requires login', async () => {
            await page.getByTitle('Wish List').click();
            await wishlistPage.expectLoginPage();
        });
    } finally {
        await context.close();
    }
});
