import { expect, test, type Locator, type Page } from '@playwright/test';

async function expectVisibleLink(link: Locator): Promise<void> {
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute('href', /.+/);
}

async function expectProductCards(page: Page, selector: string, count?: number): Promise<void> {
    const cards = page.locator(selector);
    if (count !== undefined) {
        await expect(cards).toHaveCount(count);
    } else {
        expect(await cards.count()).toBeGreaterThan(0);
    }

    for (const card of await cards.all()) {
        await expect(card.locator('.pg-prod-img img')).toBeVisible();
        await expect(card.locator('.pg-prod-name')).toBeVisible();
        await expect(card.locator('.pg-prod-name')).not.toBeEmpty();
        await expect(card.locator('.pg-prod-price')).toBeVisible();
        await expect(card.locator('.pg-btn-primary')).toBeVisible();
    }
}

test.describe('Homepage', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test.describe('Announcement bar', () => {
        test('announcement text is visible', async ({ page }) => {
            await expect(page.locator('.pg-announce')).toBeVisible();
            await expect(page.locator('.pg-announce')).toHaveText(
                'This is a dummy website for Web Automation Testing'
            );
        });
    });

    test.describe('Header (logo, category dropdown, search box, search button, wishlist/account/cart icons)', () => {
        test('logo is visible and links to the homepage', async ({ page }) => {
            await expectVisibleLink(page.getByRole('link', { name: 'LambdaTest Playground', exact: true }));
        });

        test('All Categories dropdown is visible and enabled', async ({ page }) => {
            const dropdown = page.getByRole('button', { name: 'All Categories', exact: true });
            await expect(dropdown).toBeVisible();
            await expect(dropdown).toBeEnabled();
        });

        test('search box is visible and enabled', async ({ page }) => {
            const searchBox = page.getByPlaceholder('Search For Products');
            await expect(searchBox).toBeVisible();
            await expect(searchBox).toBeEnabled();
        });

        test('search button is visible and enabled', async ({ page }) => {
            const searchButton = page.locator('.pg-search-btn');
            await expect(searchButton).toBeVisible();
            await expect(searchButton).toBeEnabled();
        });

        test('wishlist icon is visible and links to a destination', async ({ page }) => {
            await expectVisibleLink(page.getByTitle('Wish List'));
        });

        test('account icon is visible and links to a destination', async ({ page }) => {
            await expectVisibleLink(page.getByTitle('My Account'));
        });

        test('cart icon is visible and links to a destination', async ({ page }) => {
            await expectVisibleLink(page.getByTitle('Shopping Cart'));
        });
    });

    test.describe('Main navigation (Shop by Category, Home, Special, Blog, Mega Menu, AddOns, My account)', () => {
        test('Shop by Category link is visible', async ({ page }) => {
            await expectVisibleLink(page.locator('.pg-nav-shop-btn'));
        });

        test('Home link is visible', async ({ page }) => {
            await expectVisibleLink(page.getByRole('link', { name: 'Home', exact: true }));
        });

        test('Special link is visible', async ({ page }) => {
            await expectVisibleLink(page.locator('.pg-nav-list').getByRole('link', { name: /Special/ }));
        });

        test('Blog link is visible', async ({ page }) => {
            await expectVisibleLink(page.getByRole('link', { name: 'Blog', exact: true }));
        });

        test('Mega Menu link is visible', async ({ page }) => {
            await expectVisibleLink(page.locator('.pg-nav-list a.pg-nav-link').filter({ hasText: 'Mega Menu' }));
        });

        test('AddOns link is visible', async ({ page }) => {
            await expectVisibleLink(page.getByRole('link', { name: /AddOns/ }));
        });

        test('My account navigation link is visible', async ({ page }) => {
            await expectVisibleLink(page.locator('.pg-nav-account').getByRole('link', { name: /My account/ }).first());
        });
    });

    test.describe('Promo strip (text and SAVE60 code)', () => {
        test('promo strip text is visible', async ({ page }) => {
            await expect(page.locator('.pg-coupon-inner')).toContainText('Upto 60% Off');
        });

        test('SAVE60 code is visible', async ({ page }) => {
            await expect(page.getByText('SAVE60', { exact: true })).toBeVisible();
        });
    });

    test.describe('Hero slider (banner, Shop Now button, pagination dots)', () => {
        test('hero banner images are visible', async ({ page }) => {
            await expect(page.locator('#pgHero .carousel-inner img').first()).toBeVisible();
        });

        test('Shop Now link is visible and links to a destination', async ({ page }) => {
            await expectVisibleLink(page.getByRole('link', { name: /Shop\s*now/i }).first());
        });

        test('three pagination dots are visible', async ({ page }) => {
            const dots = page.locator('#pgHero .carousel-indicators button');
            await expect(dots).toHaveCount(3);
            for (const dot of await dots.all()) {
                await expect(dot).toBeVisible();
            }
        });
    });

    test.describe('Benefits bar (Free Shipping, 30 Days Return, 24/7 Support, Secure Payment)', () => {
        for (const benefit of ['Free Shipping', '30 Days Return', '24/7 Support', 'Secure Payment']) {
            test(`${benefit} benefit is visible`, async ({ page }) => {
                await expect(page.getByText(benefit, { exact: true })).toBeVisible();
            });
        }
    });

    test.describe('Promo banners (Lumix S Series, MPOW H12 RC Headphone)', () => {
        test('first promo banner is visible and links to a destination', async ({ page }) => {
            await expectVisibleLink(page.locator('.pg-promos a').nth(0));
            await expect(page.locator('.pg-promos a').nth(0).locator('img')).toBeVisible();
        });

        test('second promo banner is visible and links to a destination', async ({ page }) => {
            await expectVisibleLink(page.locator('.pg-promos a').nth(1));
            await expect(page.locator('.pg-promos a').nth(1).locator('img')).toBeVisible();
        });
    });

    test.describe('Top Trending Categories (8 categories)', () => {
        test('Top Trending Categories heading is visible', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'Top Trending Categories', exact: true })).toBeVisible();
        });

        test('eight category cards are visible', async ({ page }) => {
            await expect(page.locator('.pg-cat-grid .pg-cat-card')).toHaveCount(8);
        });

        for (const category of ['Desktops', 'Laptops', 'Components', 'Tablets', 'Software', 'Phones', 'Cameras', 'MP3 Players']) {
            test(`${category} category is visible and links to a destination`, async ({ page }) => {
                const categoryLink = page.locator('.pg-cat-grid .pg-cat-card').filter({
                    has: page.getByText(category, { exact: true }),
                });
                await expectVisibleLink(categoryLink);
            });
        }
    });

    test.describe('Deals of the Day (heading, countdown timer, product cards)', () => {
        test('Deals of the Day heading is visible', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'Deals of the Day', exact: true })).toBeVisible();
        });

        test('countdown timer shows days, hours, minutes, and seconds', async ({ page }) => {
            const countdown = page.locator('#pgCountdown');
            await expect(countdown).toBeVisible();
            await expect(countdown.getByText('Days', { exact: true })).toBeVisible();
            await expect(countdown.getByText('Hrs', { exact: true })).toBeVisible();
            await expect(countdown.getByText('Min', { exact: true })).toBeVisible();
            await expect(countdown.getByText('Sec', { exact: true })).toBeVisible();
        });

        test('deal product cards contain required elements', async ({ page }) => {
            await expectProductCards(page, '.pg-deals-grid .pg-deal-card');
        });
    });

    test.describe('Top Products (heading, 8 product cards)', () => {
        test('Top Products heading is visible', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'Top Products', exact: true })).toBeVisible();
        });

        test('eight Top Products cards contain required elements', async ({ page }) => {
            await expectProductCards(page, '.pg-featured .pg-prod-card', 8);
        });
    });

    test.describe('Top Collection (heading, 3 banner cards)', () => {
        test('Top Collection heading is visible', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'Top Collection', exact: true })).toBeVisible();
        });

        test('three collection banner cards are visible', async ({ page }) => {
            const cards = page.locator('.pg-collection-grid .pg-collection-card');
            await expect(cards).toHaveCount(3);
            for (const card of await cards.all()) {
                await expectVisibleLink(card);
                await expect(card.locator('img')).toBeVisible();
                await expect(card.locator('h3')).toBeVisible();
            }
        });
    });

    test.describe('On Sale (heading, product cards)', () => {
        test('On Sale heading is visible', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'On Sale', exact: true })).toBeVisible();
        });

        test('on-sale product cards contain required elements', async ({ page }) => {
            await expectProductCards(page, '.pg-sale-wrap .pg-prod-card');
        });
    });

    test.describe('Shop by Brand (heading, brand logos)', () => {
        test('Shop by Brand heading is visible', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'Shop by Brand', exact: true })).toBeVisible();
        });

        test('brand logos are visible and link to destinations', async ({ page }) => {
            const brands = page.locator('.pg-brand-row .pg-brand-card');
            expect(await brands.count()).toBeGreaterThan(0);
            for (const brand of await brands.all()) {
                await expectVisibleLink(brand);
                await expect(brand.locator('img')).toBeVisible();
            }
        });
    });

    test.describe('We Love Our Customers (heading, 3 testimonials)', () => {
        test('We Love Our Customers heading is visible', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'We Love Our Customers', exact: true })).toBeVisible();
        });

        test('three testimonial cards are visible', async ({ page }) => {
            const testimonials = page.locator('.pg-testi-grid .pg-testi-card');
            await expect(testimonials).toHaveCount(3);
            for (const testimonial of await testimonials.all()) {
                await expect(testimonial).toBeVisible();
            }
        });
    });

    test.describe('Newsletter (heading, email field, Subscribe button)', () => {
        test('Stay in the loop heading is visible', async ({ page }) => {
            await expect(page.getByRole('heading', { name: 'Stay in the loop', exact: true })).toBeVisible();
        });

        test('email field is visible and enabled', async ({ page }) => {
            const email = page.getByPlaceholder('your@email.com');
            await expect(email).toBeVisible();
            await expect(email).toBeEnabled();
        });

        test('Subscribe button is visible and enabled', async ({ page }) => {
            const subscribe = page.getByRole('button', { name: 'Subscribe', exact: true });
            await expect(subscribe).toBeVisible();
            await expect(subscribe).toBeEnabled();
        });
    });

    test.describe('Footer (4 columns with their links, copyright text)', () => {
        for (const columnName of ['Information', 'Customer Service', 'Extras', 'My Account']) {
            test(`${columnName} footer column is visible`, async ({ page }) => {
                const column = page.locator('.pg-footer-cols > div').filter({
                    has: page.getByRole('heading', { name: columnName, exact: true }),
                });
                await expect(column).toBeVisible();
            });

            test(`${columnName} footer links are visible and have destinations`, async ({ page }) => {
                const column = page.locator('.pg-footer-cols > div').filter({
                    has: page.getByRole('heading', { name: columnName, exact: true }),
                });
                const links = column.locator('a');
                expect(await links.count()).toBeGreaterThan(0);
                for (const link of await links.all()) {
                    await expectVisibleLink(link);
                }
            });
        }

        test('copyright text is visible', async ({ page }) => {
            await expect(page.locator('.pg-footer-bottom')).toBeVisible();
            await expect(page.locator('.pg-footer-bottom')).toHaveText(
                'LambdaTest Playground — a dummy website for Web Automation Testing'
            );
        });
    });
});