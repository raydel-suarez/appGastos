import { test as base } from 'playwright-bdd';
import { GastosPage } from '../pages/GastosPage';

export const test = base.extend<{ gastosPage: GastosPage }>({
  gastosPage: async ({ page }, use) => {
    await use(new GastosPage(page));
  },
});

export const { Given, When, Then, Before } = test;
