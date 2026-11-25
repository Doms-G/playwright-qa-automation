import { type Locator, type Page } from '@playwright/test';

export class OrderHistoryPage {
    constructor(private readonly page: Page) {}

    get heading(): Locator {
        return this.page.getByRole('heading', {
            name: 'Order History',
            exact: true,
        });
    }

    get orderTable(): Locator {
        return this.page.getByRole('table').filter({ hasText: 'Order ID' });
    }

    get orderRows(): Locator {
        return this.orderTable
            .getByRole('row')
            .filter({ has: this.orderTable.getByTitle('View') });
    }

    viewLink(row: Locator): Locator {
        return row
            .getByRole('link', { name: 'View', exact: true })
            .or(row.getByTitle('View'))
            .first();
    }

    async openFromAccount(): Promise<void> {
        await this.page
            .getByRole('link', { name: 'View your order history', exact: true })
            .click();
    }

    async openFirstOrder(): Promise<void> {
        await this.viewLink(this.orderRows.first()).click();
    }

    columnHeader(table: Locator, name: string): Locator {
        const semanticHeader = table.getByRole('columnheader', {
            name,
            exact: true,
        });
        const legacyHeaderCell = table.getByRole('cell', {
            name,
            exact: true,
        });

        // The storefront may render table headings as cells instead of <th> elements.
        return semanticHeader.or(legacyHeaderCell).first();
    }
}

export class OrderDetailsPage {
    constructor(private readonly page: Page) {}

    get heading(): Locator {
        return this.page.getByRole('heading', {
            name: 'Order Information',
            exact: true,
        });
    }

    get breadcrumb(): Locator {
        return this.page
            .getByRole('list')
            .filter({ hasText: /Order #\d+/ });
    }

    get breadcrumbHomeLink(): Locator {
        // TODO: Confirm the live theme exposes the breadcrumb home icon as a named or titled link.
        return this.breadcrumb
            .getByRole('link', { name: /Home/i })
            .or(this.breadcrumb.getByTitle('Home'))
            .first();
    }

    get breadcrumbOrderNumber(): Locator {
        return this.breadcrumb.getByText(/Order #\d+/);
    }

    get productTable(): Locator {
        return this.page
            .getByRole('table')
            .filter({ hasText: 'Product' })
            .filter({ hasText: 'Action' });
    }

    get productRows(): Locator {
        return this.productTable.getByRole('row').filter({
            has: this.productTable.getByTitle('Buy Again'),
        });
    }

    get statusTable(): Locator {
        return this.page
            .getByRole('table')
            .filter({ hasText: 'Comment' })
            .filter({ hasText: 'Status' });
    }

    get accountMenuLinks(): Locator[] {
        return [
            'My Account',
            'Edit Account',
            'Password',
            'Address Book',
            'Wish List',
            'Notification',
            'Order History',
            'Transactions',
            'Newsletter',
            'Logout',
        ].map(name =>
            this.page.getByRole('link', { name, exact: true })
        );
    }

    getColumnHeader(table: Locator, name: string): Locator {
        const semanticHeader = table.getByRole('columnheader', {
            name,
            exact: true,
        });
        const legacyHeaderCell = table.getByRole('cell', {
            name,
            exact: true,
        });

        return semanticHeader.or(legacyHeaderCell).first();
    }

    getRowAction(row: Locator, name: string): Locator {
        // TODO: Confirm the live theme exposes icon-only action labels via accessible names or title attributes.
        return row
            .getByRole('link', { name, exact: true })
            .or(row.getByTitle(name))
            .first();
    }
}
