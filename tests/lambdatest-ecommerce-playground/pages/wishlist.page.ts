import { expect, type Locator, type Page } from '@playwright/test';

export const wishlistProduct = {
    name: 'HTC Touch HD',
    url: '/index.php?route=product/product&product_id=28',
} as const;

export class WishlistPage {
    constructor(
        private readonly page: Page,
        private customerToken?: string
    ) {}

    private withCustomerToken(url: string): string {
        return this.customerToken
            ? `${url}&customer_token=${encodeURIComponent(this.customerToken)}`
            : url;
    }

    private notification(): Locator {
        return this.page.locator('[role="alert"], .alert');
    }

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

    async openProduct(): Promise<void> {
        await this.page.goto(this.withCustomerToken(wishlistProduct.url));
        await expect(
            this.page.getByRole('heading', {
                name: wishlistProduct.name,
                exact: true,
                level: 1,
            })
        ).toBeVisible();
    }

    async addProductToWishlist(): Promise<Locator> {
        const notification = await this.clickAddToWishlist();
        await expect(notification).toContainText(wishlistProduct.name);

        const wishlistLink = notification.getByRole('link', {
            name: 'wish list',
            exact: true,
        });
        const href = await wishlistLink.getAttribute('href');
        if (href) {
            this.customerToken =
                new URL(href, this.page.url()).searchParams.get(
                    'customer_token'
                ) ?? this.customerToken;
        }

        return notification;
    }

    async clickAddToWishlist(): Promise<Locator> {
        await this.page
            .getByRole('button', { name: 'Add to Wish List' })
            .click();

        const notification = this.notification();
        await expect(notification).toBeVisible();
        return notification;
    }

    async expectGuestPrompt(notification: Locator): Promise<void> {
        await expect(notification).toContainText('You must');
        await expect(notification).toContainText('login');
        await expect(notification).toContainText('create an account');
        await expect(notification).toContainText(wishlistProduct.name);
        await expect(notification).toContainText('wish list');
        await expect(notification).not.toContainText('Success:');
    }

    async expectLoginPage(): Promise<void> {
        await expect(this.page).toHaveURL(/route=account\/login/);
        await expect(
            this.page.getByRole('heading', { name: 'Returning Customer' })
        ).toBeVisible();
    }

    async openFromHeader(): Promise<void> {
        await this.page.getByTitle('Wish List').click();
        await this.expectWishlistPage();
    }

    async openFromNotification(notification: Locator): Promise<void> {
        await notification
            .getByRole('link', { name: 'wish list', exact: true })
            .click();
        await this.expectWishlistPage();
    }

    async expectWishlistPage(): Promise<void> {
        await expect(this.page).toHaveURL(/route=account\/wishlist/);
        await expect(
            this.page.getByRole('heading', {
                name: 'My Wishlist',
                exact: true,
            })
        ).toBeVisible();
    }

    async openWishlist(): Promise<void> {
        await this.page.goto(
            this.withCustomerToken('/index.php?route=account/wishlist')
        );
        await this.expectWishlistPage();
    }

    async hasProduct(productName: string): Promise<boolean> {
        await this.openWishlist();
        return (await this.productRow(productName).count()) > 0;
    }

    async expectProduct(productName: string): Promise<void> {
        await expect(this.productRow(productName)).toHaveCount(1);
        await expect(
            this.productRow(productName).getByRole('link', {
                name: productName,
                exact: true,
            }).first()
        ).toBeVisible();
    }

    async removeProduct(productName: string): Promise<void> {
        await this.productRow(productName)
            .getByRole('link', { name: 'Remove', exact: true })
            .click();
        await expect(this.notification()).toContainText('Success:');
        await expect(this.productRow(productName)).toHaveCount(0);
    }

    async removeProductIfPresent(productName: string): Promise<void> {
        await this.openWishlist();

        if (await this.productRow(productName).count()) {
            await this.removeProduct(productName);
        }
    }

    async addProductToCart(productName: string): Promise<Locator> {
        await this.productRow(productName)
            .getByRole('button', { name: 'Add to Cart', exact: true })
            .click();

        const notification = this.notification();
        await expect(notification).toContainText('Success:');
        await expect(notification).toContainText(productName);
        return notification;
    }

    async openCart(): Promise<void> {
        await this.page.getByTitle('Shopping Cart').click();
        await expect(this.page).toHaveURL(/route=checkout\/cart/);
    }

    async continueBrowsing(): Promise<void> {
        await this.page
            .getByRole('link', { name: 'Continue', exact: true })
            .click();
    }
}
