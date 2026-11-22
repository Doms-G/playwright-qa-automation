import { expect, test, type Locator, type Page } from '@playwright/test';

const shopByCategoryOptions = [
    'Desktops',
    'Laptops & Notebooks',
    'Components',
    'Tablets',
    'Software',
    'Phones & PDAs',
    'Cameras',
    'MP3 Players',
] as const;

const megaMenuGroups = [
    { name: 'Electronics', options: ['Desktops', 'Laptops', 'Components'] },
    { name: 'Mobile & Tablets', options: ['Tablets', 'Phones & PDAs'] },
    { name: 'Media', options: ['Cameras', 'MP3 Players', 'Software'] },
] as const;

const megaMenuOptions = megaMenuGroups.flatMap(({ options }) => options);

const addonsOptions = ['All Brands', 'Deals & Specials', 'Compare Products'] as const;

const myAccountOptions = ['Login', 'Register', 'My Orders', 'Wishlist'] as const;

function shopByCategoryPanel(page: Page): Locator {
    return page.locator('.pg-nav-shop-panel');
}

function megaMenuPanel(page: Page): Locator {
    const trigger = page.getByRole('link', { name: /Mega Menu/ });
    return page.locator('.pg-nav-list li.pg-dd').filter({ has: trigger }).locator('.pg-mega');
}

function addonsPanel(page: Page): Locator {
    const trigger = page.getByRole('link', { name: /AddOns/ });
    return page.locator('.pg-nav-list li.pg-dd').filter({ has: trigger }).locator('.pg-dd-panel');
}

function myAccountPanel(page: Page): Locator {
    return page.locator('.pg-nav-account .pg-dd-panel');
}

function myAccountTrigger(page: Page): Locator {
    return page.locator('.pg-nav-account').getByRole('link', { name: /My account/i });
}

async function expectOptionLink(panel: Locator, option: string): Promise<void> {
    const link = panel.getByRole('link').filter({ hasText: option });
    await expect(link).toHaveCount(1);
    await expect(link).toBeVisible();
    await expect(link).toHaveText(option);
    await expect(link).toHaveAttribute('href', /.+/);
}

test.describe('Navigation dropdowns', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test.describe('Shop by Category', () => {
        test('opens when I hover it', async ({ page }) => {
            await page.getByRole('link', { name: /Shop by Category/ }).hover();
            await expect(shopByCategoryPanel(page)).toBeVisible();
        });

        test('shows all expected options', async ({ page }) => {
            await page.getByRole('link', { name: /Shop by Category/ }).hover();
            const panel = shopByCategoryPanel(page);
            const options = panel.getByRole('link');
            await expect(options).toHaveCount(shopByCategoryOptions.length);

            for (const option of shopByCategoryOptions) {
                await expectOptionLink(panel, option);
            }
        });

        for (const option of shopByCategoryOptions) {
            test(`Shop by Category shows "${option}"`, async ({ page }) => {
                await page.getByRole('link', { name: /Shop by Category/ }).hover();
                await expectOptionLink(shopByCategoryPanel(page), option);
            });
        }

        test('closes when I move away', async ({ page }) => {
            const panel = shopByCategoryPanel(page);
            await page.getByRole('link', { name: /Shop by Category/ }).hover();
            await expect(panel).toBeVisible();
            await page.locator('.pg-coupon-inner').hover();
            await expect(panel).toBeHidden();
        });
    });

    test.describe('Mega Menu', () => {
        test('opens when I hover it', async ({ page }) => {
            await page.getByRole('link', { name: /Mega Menu/ }).hover();
            await expect(megaMenuPanel(page)).toBeVisible();
        });

        test('shows all expected options', async ({ page }) => {
            await page.getByRole('link', { name: /Mega Menu/ }).hover();
            const panel = megaMenuPanel(page);
            const groups = panel.locator('.pg-mega-col');
            await expect(groups).toHaveCount(megaMenuGroups.length);
            await expect(panel.getByRole('link')).toHaveCount(megaMenuOptions.length);

            for (const option of megaMenuOptions) {
                await expectOptionLink(panel, option);
            }
        });

        for (const option of megaMenuOptions) {
            test(`Mega Menu shows "${option}"`, async ({ page }) => {
                await page.getByRole('link', { name: /Mega Menu/ }).hover();
                await expectOptionLink(megaMenuPanel(page), option);
            });
        }

        for (const group of megaMenuGroups) {
            test(`Mega Menu shows the "${group.name}" group`, async ({ page }) => {
                await page.getByRole('link', { name: /Mega Menu/ }).hover();
                const panel = megaMenuPanel(page);
                const menuGroup = panel.locator('.pg-mega-col').filter({
                    has: page.getByRole('heading', { name: group.name, exact: true }),
                });
                await expect(menuGroup).toHaveCount(1);
                await expect(menuGroup.getByRole('heading', { name: group.name, exact: true })).toBeVisible();

                const options = menuGroup.getByRole('link');
                await expect(options).toHaveCount(group.options.length);
                for (const option of group.options) {
                    await expectOptionLink(menuGroup, option);
                }
            });
        }

        test('closes when I move away', async ({ page }) => {
            const panel = megaMenuPanel(page);
            await page.getByRole('link', { name: /Mega Menu/ }).hover();
            await expect(panel).toBeVisible();
            await page.getByRole('navigation').getByRole('link', { name: 'Home', exact: true }).hover();
            await expect(panel).toBeHidden();
        });
    });

    test.describe('AddOns', () => {
        test('opens when I hover it', async ({ page }) => {
            await page.getByRole('link', { name: /AddOns/ }).hover();
            await expect(addonsPanel(page)).toBeVisible();
        });

        test('shows all expected options', async ({ page }) => {
            await page.getByRole('link', { name: /AddOns/ }).hover();
            const panel = addonsPanel(page);
            await expect(panel.getByRole('link')).toHaveCount(addonsOptions.length);

            for (const option of addonsOptions) {
                await expectOptionLink(panel, option);
            }
        });

        for (const option of addonsOptions) {
            test(`AddOns shows "${option}"`, async ({ page }) => {
                await page.getByRole('link', { name: /AddOns/ }).hover();
                await expectOptionLink(addonsPanel(page), option);
            });
        }

        test('closes when I move away', async ({ page }) => {
            const panel = addonsPanel(page);
            await page.getByRole('link', { name: /AddOns/ }).hover();
            await expect(panel).toBeVisible();
            await page.locator('.pg-coupon-inner').hover();
            await expect(panel).toBeHidden();
        });
    });

    test.describe('My Account', () => {
        test('opens when I hover it', async ({ page }) => {
            await myAccountTrigger(page).hover();
            await expect(myAccountPanel(page)).toBeVisible();
        });

        test('shows all expected options', async ({ page }) => {
            await myAccountTrigger(page).hover();
            const panel = myAccountPanel(page);
            await expect(panel.getByRole('link')).toHaveCount(myAccountOptions.length);

            for (const option of myAccountOptions) {
                await expectOptionLink(panel, option);
            }
        });

        for (const option of myAccountOptions) {
            test(`My Account shows "${option}"`, async ({ page }) => {
                await myAccountTrigger(page).hover();
                await expectOptionLink(myAccountPanel(page), option);
            });
        }

        test('closes when I move away', async ({ page }) => {
            const panel = myAccountPanel(page);
            await myAccountTrigger(page).hover();
            await expect(panel).toBeVisible();
            await page.locator('.pg-coupon-inner').hover();
            await expect(panel).toBeHidden();
        });
    });
});
