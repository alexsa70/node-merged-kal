import { test } from '@playwright/test';
import { getSettings } from '../../../src/config/settings';
import { CollectionsPage } from '../pages/collectionsPage';
import { LoginPage } from '../pages/loginPage';
import { SidebarPage } from '../pages/sidebarPage';

const settings = getSettings();
const COLLECTION_NAME = `auto_col_${Math.random().toString(36).slice(2, 8)}`;

test.describe.skip('E2E collections page', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(!settings.e2e.baseUrl, 'E2E_BASE_URL is not configured in .env');
    test.skip(!settings.authCredentialsAdmin, 'AUTH_CREDENTIALS_ADMIN.* is not configured');

    const loginPage = new LoginPage(page);
    await loginPage.open(String(settings.e2e.baseUrl));
    await loginPage.loginAsAdminUser();
    await loginPage.expectLoginSuccess();
  });

  test('create/validate/delete collection', async ({ page }) => {
    const sidebarPage = new SidebarPage(page);
    const collectionsPage = new CollectionsPage(page);

    await sidebarPage.navigateToCollections();
    await collectionsPage.createCollection(COLLECTION_NAME);

    await collectionsPage.searchCollections(COLLECTION_NAME);
    await collectionsPage.filterByCurrentDay();
    await collectionsPage.expectCollectionCardVisible(COLLECTION_NAME);

    await collectionsPage.deleteCollection(COLLECTION_NAME);
    await collectionsPage.expectDeleteSuccessToast();
  });
});
