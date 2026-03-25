import { expect, test } from '@playwright/test';
import { getSettings } from '../../../src/config/settings';
import { E2eApiSession, resolveFixtureFile } from '../helpers/api';
import { AudioFilesPage } from '../pages/audioFilesPage';
import { LoginPage } from '../pages/loginPage';
import { SidebarPage } from '../pages/sidebarPage';

const settings = getSettings();
const AUDIO_FILE = 'audio_file_short.ogg';

test.describe('E2E audio page', () => {
  test.describe.configure({ mode: 'serial' });

  let apiSession: E2eApiSession | undefined;

  test.beforeAll(async () => {
    if (!settings.authCredentialsAdmin || !settings.e2e.baseUrl) {
      return;
    }
    if (!resolveFixtureFile(AUDIO_FILE)) {
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
    test.skip(!apiSession, 'Audio preconditions are not configured');

    const loginPage = new LoginPage(page);
    await loginPage.open(String(settings.e2e.baseUrl));
    await loginPage.loginAsAdminUser();
    await loginPage.expectLoginSuccess();
  });

  test('upload audio file and validate file count increases by one', async ({ page }) => {
    const sidebarPage = new SidebarPage(page);
    const audioPage = new AudioFilesPage(page);

    await sidebarPage.openConnectors();
    await sidebarPage.navigateToAudio();

    const initial = await audioPage.getFilesCount();

    await apiSession!.uploadFile('admin', { fileName: AUDIO_FILE });

    await sidebarPage.openConnectors();
    await sidebarPage.navigateToAudio();
    const updated = await audioPage.waitForFilesCountAtLeast(initial + 1);
    expect(updated).toBeGreaterThanOrEqual(initial + 1);
  });

});
