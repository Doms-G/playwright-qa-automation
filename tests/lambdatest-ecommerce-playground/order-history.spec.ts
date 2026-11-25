import { expect, test, type Page } from '@playwright/test';
import { AccountPage } from './pages/account.page';
import { LoginPage } from './pages/login.page';
import {
    OrderDetailsPage,
    OrderHistoryPage,
} from './pages/order-history.page';

async function login(page: Page): Promise<void> {
    const email = process.env.TEST_EMAIL?.trim();
    const password = process.env.TEST_PASSWORD;

    if (!email || !password) {
        test.skip(
            true,
            'Set TEST_EMAIL and TEST_PASSWORD to run the logged-in order history tests.'
        );
    }

    await page.goto('/index.php?route=account/login');
    await new LoginPage(page).login({ email, password });
    await new AccountPage(page).expectDashboard();
}

const loggedInTest = test.extend<{ orderHistoryPage: OrderHistoryPage }>({
    orderHistoryPage: async ({ page }, use) => {
        await test.step('Log in with the configured test account', async () => {
            await login(page);
        });
        await use(new OrderHistoryPage(page));
    },
});

test.describe('Order History', () => {
    // Verifies the order history table, its column headings, and view actions are present.
    loggedInTest('shows the order history list', async ({ page, orderHistoryPage }) => {
        await test.step('Open Order History from My Account', async () => {
            await orderHistoryPage.openFromAccount();
        });

        await test.step('Verify the Order History page and order table', async () => {
            await expect(page).toHaveURL(
                url => url.searchParams.get('route') === 'account/order'
            );
            await expect(orderHistoryPage.heading).toBeVisible();
            await expect(orderHistoryPage.orderTable).toBeVisible();

            for (const header of [
                'Order ID',
                'No. of Products',
                'Status',
                'Total',
                'Date Added',
            ]) {
                await expect(
                    orderHistoryPage.columnHeader(orderHistoryPage.orderTable, header)
                ).toBeVisible();
            }
        });

        await test.step('Verify at least one order and a View action for each row', async () => {
            await expect
                .poll(() => orderHistoryPage.orderRows.count())
                .toBeGreaterThan(0);

            const orderCount = await orderHistoryPage.orderRows.count();
            for (let index = 0; index < orderCount; index += 1) {
                const row = orderHistoryPage.orderRows.nth(index);
                await expect(row).toBeVisible();
                await expect(orderHistoryPage.viewLink(row)).toBeVisible();
            }
        });
    });

    // Verifies the order details page's breadcrumb, details, tables, totals, and account menu.
    loggedInTest('shows the order details sections', async ({ page, orderHistoryPage }) => {
        const orderDetailsPage = new OrderDetailsPage(page);

        await test.step('Open an order from Order History', async () => {
            await orderHistoryPage.openFromAccount();
            await orderHistoryPage.openFirstOrder();
        });

        await test.step('Verify the Order Information page', async () => {
            await expect(page).toHaveURL(
                url => url.searchParams.get('route') === 'account/order/info'
            );
            await expect(orderDetailsPage.heading).toBeVisible();
        });

        await test.step('Verify the breadcrumb', async () => {
            await expect.soft(orderDetailsPage.breadcrumb).toBeVisible();
            await expect.soft(orderDetailsPage.breadcrumbHomeLink).toBeVisible();
            await expect
                .soft(orderDetailsPage.breadcrumb.getByText('Account', { exact: true }))
                .toBeVisible();
            await expect
                .soft(orderDetailsPage.breadcrumb.getByText('Orders', { exact: true }))
                .toBeVisible();
            await expect.soft(orderDetailsPage.breadcrumbOrderNumber).toBeVisible();
        });

        await test.step('Verify order detail labels and shipping address content', async () => {
            for (const label of [
                'Invoice No.',
                'Order ID',
                'Shipping Address',
                'Shipping Method',
                'Payment Method',
            ]) {
                await expect.soft(page.getByText(label, { exact: true })).toBeVisible();
            }

            const addressRow = page
                .getByRole('row')
                .filter({ hasText: 'Shipping Address' });
            await expect.soft(addressRow).toBeVisible();
            await expect.soft(addressRow.getByRole('cell').nth(1)).toBeVisible();
            await expect.soft(addressRow.getByRole('cell').nth(1)).not.toBeEmpty();
        });

        await test.step('Verify the products table and row actions', async () => {
            const table = orderDetailsPage.productTable;
            await expect.soft(table).toBeVisible();

            for (const header of [
                'Product',
                'Quantity',
                'Price',
                'Total',
                'Action',
            ]) {
                await expect
                    .soft(orderDetailsPage.getColumnHeader(table, header))
                    .toBeVisible();
            }

            await expect.soft(orderDetailsPage.productRows.first()).toBeVisible();
            const productCount = await orderDetailsPage.productRows.count();
            for (let index = 0; index < productCount; index += 1) {
                const row = orderDetailsPage.productRows.nth(index);
                await expect
                    .soft(row.getByRole('cell').first().getByRole('link'))
                    .toBeVisible();
                await expect
                    .soft(orderDetailsPage.getRowAction(row, 'Buy Again'))
                    .toBeVisible();
                await expect
                    .soft(orderDetailsPage.getRowAction(row, 'Return Item'))
                    .toBeVisible();
            }
        });

        await test.step('Verify order totals', async () => {
            await expect.soft(page.getByText('Sub-Total', { exact: true })).toBeVisible();
            await expect.soft(page.getByText(/Shipping Rate/i)).toBeVisible();
            await expect
                .soft(page.getByText('Total', { exact: true }).last())
                .toBeVisible();
        });

        await test.step('Verify the order status history and pagination', async () => {
            const table = orderDetailsPage.statusTable;
            await expect.soft(table).toBeVisible();

            for (const header of ['Date Added', 'Comment', 'Status']) {
                await expect
                    .soft(orderDetailsPage.getColumnHeader(table, header))
                    .toBeVisible();
            }

            await expect.soft(table.getByRole('row').nth(1)).toBeVisible();
            await expect
                .soft(
                    page.getByText(
                        /Showing \d+ to \d+ of \d+ \(\d+ Pages?\)/
                    )
                )
                .toBeVisible();
        });

        await test.step('Verify Continue and the right-side account menu', async () => {
            await expect
                .soft(page.getByRole('link', { name: 'Continue', exact: true }))
                .toBeVisible();
            for (const link of orderDetailsPage.accountMenuLinks) {
                await expect.soft(link).toBeVisible();
            }
        });
    });

    // Verifies Continue returns the user to Order History or My Account.
    loggedInTest('Continue returns to an account page', async ({ page, orderHistoryPage }) => {
        const orderDetailsPage = new OrderDetailsPage(page);

        await test.step('Open an order detail page', async () => {
            await orderHistoryPage.openFromAccount();
            await orderHistoryPage.openFirstOrder();
            await expect(orderDetailsPage.heading).toBeVisible();
        });

        await test.step('Continue to Order History or My Account', async () => {
            await page.getByRole('link', { name: 'Continue', exact: true }).click();
            await expect(page).toHaveURL(url => {
                const route = url.searchParams.get('route');
                return route === 'account/order' || route === 'account/account';
            });
            await expect(
                page.getByRole('heading', {
                    name: /^(Order History|My Account)$/,
                    exact: true,
                })
            ).toBeVisible();
        });
    });
});
