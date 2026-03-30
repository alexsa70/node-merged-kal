import { test } from '../fixtures';
import { CollectionsPage } from '../pages/collectionsPage';
import { SidebarPage } from '../pages/sidebarPage';

const COLLECTION_NAME = `auto_col_${Math.random().toString(36).slice(2, 8)}`;

test.describe.skip('E2E collections page', () => {
  test('create/validate/delete collection', async ({ authedPageAdmin: page }) => {
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
