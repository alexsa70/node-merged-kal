import { expect, test } from '@playwright/test';
import { getSettings } from '../../../src/config/settings';
import { E2eApiSession, resolveFixtureFile } from '../helpers/api';
import { DocFilesPage } from '../pages/docFilesPage';
import { LoginPage } from '../pages/loginPage';
import { SidebarPage } from '../pages/sidebarPage';

const settings = getSettings();
const docFiles = ['word_file.docx', 'medical_records.csv'] as const;

test.describe('E2E document page', () => {
  test.describe.configure({ mode: 'serial' });

  let apiSession: E2eApiSession | undefined;

  test.beforeAll(async () => {
    if (!settings.authCredentialsAdmin || !settings.e2e.baseUrl) {
      return;
    }
    if (docFiles.some((name) => !resolveFixtureFile(name))) {
      return;
    }

    try {
      apiSession = await E2eApiSession.create(settings);
    } catch {
      apiSession = undefined;
    }
  });

  test.afterAll(async () => {
    await apiSession?.dispose();
  });

  test.beforeEach(async ({ page }) => {
    test.skip(!settings.e2e.baseUrl, 'E2E_BASE_URL is not configured in .env');
    test.skip(!settings.authCredentialsAdmin, 'AUTH_CREDENTIALS_ADMIN.* is not configured');
    test.skip(!apiSession, 'Document preconditions are not configured');

    const loginPage = new LoginPage(page);
    await loginPage.open(String(settings.e2e.baseUrl));
    await loginPage.loginAsAdminUser();
    await loginPage.expectLoginSuccess();
  });

  for (const fileName of docFiles) {
    test(`upload document and validate count increase (${fileName})`, async ({ page }) => {
      const sidebarPage = new SidebarPage(page);
      const docPage = new DocFilesPage(page);

      await sidebarPage.openConnectors();
      await sidebarPage.navigateToDocuments();

      const initial = await docPage.getFilesCount();

      await apiSession!.uploadFile('admin', { fileName });

      await sidebarPage.openConnectors();
      await sidebarPage.navigateToDocuments();
      const updated = await docPage.waitForFilesCountAtLeast(initial + 1);
      expect(updated).toBeGreaterThanOrEqual(initial + 1);
    });

    test(`docs file name length in table (${fileName})`, async ({ page }) => {
      await apiSession!.uploadFile('admin', { fileName });

      const sidebarPage = new SidebarPage(page);
      const docPage = new DocFilesPage(page);

      await sidebarPage.navigateToAudio();
      await sidebarPage.navigateToDocuments();
      await docPage.switchToTableView();

      const firstName = await docPage.getFirstFileName();
      expect(firstName.length).toBeLessThanOrEqual(38);
    });
  }
});
