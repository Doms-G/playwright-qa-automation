import { expect, test, type Locator } from '@playwright/test';
import { ProductPage } from './pages/product.page';

const expected = {
    name: 'HTC Touch HD',
    brand: 'HTC',
    productCode: 'Product 1',
    rewardPoints: '400',
    availability: 'In Stock',
    price: '$146.00',
    exTax: '$120.00',
    priceInRewardPoints: '200',
    featureCount: 21,
    defaultQty: '1',
} as const;

const productUrl =
    '/index.php?route=product/product&product_id=28';

async function expectVisibleLinkWithHref(link: Locator): Promise<void> {
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', /.+/);
}

test.describe('Product detail page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto(productUrl);
    });

    test.describe('Breadcrumb', () => {
        test('home icon link is visible and has a destination', async ({ page }) => {
            const homeLink = page.locator('.breadcrumb').getByRole('link').first();
            await expectVisibleLinkWithHref(homeLink);
        });

        test('"Software" link is visible and has a destination', async ({ page }) => {
            const softwareLink = page
                .locator('.breadcrumb')
                .getByRole('link', { name: 'Software', exact: true });
            await expectVisibleLinkWithHref(softwareLink);
        });

        test('breadcrumb last item shows the product name', async ({ page }) => {
            const lastItem = page.locator('.breadcrumb').getByRole('listitem').last();
            await expect(lastItem.getByRole('link')).toHaveText(expected.name);
        });
    });

    test.describe('Image gallery', () => {
        test('main product image is visible with a non-empty source', async ({ page }) => {
            const mainImage = page.getByRole('img', { name: expected.name }).first();
            await expect(mainImage).toBeVisible();
            await expect(mainImage).toHaveAttribute('src', /.+/);
        });

        test('four thumbnails are visible with non-empty sources', async ({ page }) => {
            const thumbnails = page.locator(
                '.image.magnific-popup > div img'
            );
            await expect(thumbnails).toHaveCount(4);
            for (const thumbnail of await thumbnails.all()) {
                await expect(thumbnail).toBeVisible();
                await expect(thumbnail).toHaveAttribute('src', /.+/);
            }
        });
    });

    test.describe('Product info', () => {
        test('title shows the product name', async ({ page }) => {
            await new ProductPage(page).expectProduct(expected.name);
        });

        test('brand is visible and has a destination', async ({ page }) => {
            const brandLink = page.getByRole('link', {
                name: expected.brand,
                exact: true,
            });
            await expectVisibleLinkWithHref(brandLink);
        });

        test('product code is "Product 1"', async ({ page }) => {
            await expect(
                page.getByText(`Product Code: ${expected.productCode}`, {
                    exact: true,
                })
            ).toBeVisible();
        });

        test('reward points show the expected value', async ({ page }) => {
            await expect(
                page.getByText(`Reward Points: ${expected.rewardPoints}`, {
                    exact: true,
                })
            ).toBeVisible();
        });

        test('availability shows the expected status', async ({ page }) => {
            await expect(
                page.getByText(`Availability: ${expected.availability}`, {
                    exact: true,
                })
            ).toBeVisible();
        });
    });

    test.describe('Rating and reviews links', () => {
        test('five rating stars are visible', async ({ page }) => {
            const stars = page.locator('.rating i.fa-star');
            await expect(stars).toHaveCount(5);
            for (const star of await stars.all()) {
                await expect(star).toBeVisible();
            }
        });

        test('"0 reviews" link is visible and has a destination', async ({ page }) => {
            const reviewsLink = page.getByRole('link', {
                name: '0 reviews',
                exact: true,
            });
            await expectVisibleLinkWithHref(reviewsLink);
        });

        test('"Write a review" link is visible and has a destination', async ({ page }) => {
            const writeReviewLink = page.getByRole('link', {
                name: 'Write a review',
                exact: true,
            });
            await expectVisibleLinkWithHref(writeReviewLink);
        });
    });

    test.describe('Pricing', () => {
        test('price matches the expected value', async ({ page }) => {
            await expect(
                page.getByRole('heading', { name: expected.price, exact: true })
            ).toBeVisible();
        });

        test('Ex Tax matches the expected value', async ({ page }) => {
            await expect(
                page.getByText(`Ex Tax: ${expected.exTax}`, { exact: true })
            ).toBeVisible();
        });

        test('price in reward points matches the expected value', async ({ page }) => {
            await expect(
                page.getByText(
                    `Price in reward points: ${expected.priceInRewardPoints}`,
                    { exact: true }
                )
            ).toBeVisible();
        });

        test('Ex Tax is less than or equal to the price', async ({ page }) => {
            const price = page.getByRole('heading', {
                name: /^\$\d+(?:\.\d{2})?$/,
            });
            const exTax = page.getByText(/^Ex Tax:\s*\$\d+(?:\.\d{2})?$/);
            await expect(price).toBeVisible();
            await expect(exTax).toBeVisible();

            const priceValue = Number((await price.innerText()).replace(/[^\d.]/g, ''));
            const exTaxValue = Number((await exTax.innerText()).replace(/[^\d.]/g, ''));
            expect(exTaxValue).toBeLessThanOrEqual(priceValue);
        });
    });

    test.describe('Action buttons', () => {
        test('wishlist button is visible and enabled', async ({ page }) => {
            const wishlistButton = page.getByRole('button', {
                name: 'Add to Wish List',
            });
            await expect(wishlistButton).toBeVisible();
            await expect(wishlistButton).toBeEnabled();
        });

        test('compare button is visible and enabled', async ({ page }) => {
            const compareButton = page.getByRole('button', {
                name: 'Compare this Product',
            });
            await expect(compareButton).toBeVisible();
            await expect(compareButton).toBeEnabled();
        });
    });

    test.describe('Add to cart area', () => {
        test('"Qty" label is visible', async ({ page }) => {
            await expect(page.getByText('Qty', { exact: true })).toBeVisible();
        });

        test('quantity input defaults to 1', async ({ page }) => {
            await expect(page.locator('input[name="quantity"]')).toHaveValue(
                expected.defaultQty
            );
        });

        test('Add to Cart button is visible and enabled', async ({ page }) => {
            const addToCartButton = page.getByRole('button', {
                name: /add to cart/i,
            });
            await expect(addToCartButton).toBeVisible();
            await expect(addToCartButton).toBeEnabled();
        });
    });

    test.describe('Tabs', () => {
        test('DESCRIPTION and REVIEWS (0) tabs are visible', async ({ page }) => {
            await expect(
                page.getByRole('tab', { name: /^DESCRIPTION$/i })
            ).toBeVisible();
            await expect(
                page.getByRole('tab', { name: /^REVIEWS \(0\)$/i })
            ).toBeVisible();
        });
    });

    test.describe('Description content', () => {
        test('description paragraph is visible', async ({ page }) => {
            await expect(
                page.locator('#tab-description p').first()
            ).toBeVisible();
        });

        test('"Features" heading is visible', async ({ page }) => {
            await expect(
                page.getByRole('tabpanel').getByText('Features', { exact: true })
            ).toBeVisible();
        });

        test('features list has 21 visible items', async ({ page }) => {
            const features = page.getByRole('tabpanel').getByRole('listitem');
            await expect(features).toHaveCount(expected.featureCount);
            for (const feature of await features.all()) {
                await expect(feature).toBeVisible();
            }
        });
    });

    test.describe('Interactions', () => {
        test.describe('Tabs', () => {
            test('Description is selected by default and its content is visible', async ({
                page,
            }) => {
                await expect(
                    page.getByRole('tab', { name: /^DESCRIPTION$/i })
                ).toHaveAttribute('aria-selected', 'true');
                await expect(
                    page
                        .locator('#tab-description p')
                        .first()
                ).toBeVisible();
            });

            test('clicking REVIEWS (0) shows reviews and hides the description', async ({
                page,
            }) => {
                await page.getByRole('tab', { name: /^REVIEWS \(0\)$/i }).click();
                await expect(
                    page.getByRole('tabpanel').getByText(
                        'Be the first to write a review for this product.'
                    )
                ).toBeVisible();
                await expect(
                    page.locator('#tab-description')
                ).toBeHidden();
            });

            test('clicking DESCRIPTION shows its content again', async ({
                page,
            }) => {
                await page.getByRole('tab', { name: /^REVIEWS \(0\)$/i }).click();
                await page.getByRole('tab', { name: /^DESCRIPTION$/i }).click();
                await expect(
                    page
                        .locator('#tab-description p')
                        .first()
                ).toBeVisible();
            });
        });

        test.describe('Quantity', () => {
            test('quantity input accepts 3', async ({ page }) => {
                const quantityInput = page.locator('input[name="quantity"]');
                await quantityInput.fill('3');
                await expect(quantityInput).toHaveValue('3');
            });
        });
    });
});
