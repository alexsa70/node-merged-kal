import { test, expect } from '../fixtures';
import { resolveFixtureFile } from '../helpers/api';
import { AudioFilesPage } from '../pages/audioFilesPage';
import { SidebarPage } from '../pages/sidebarPage';

const AUDIO_FILE = 'audio_file_short.ogg';

test.describe('E2E audio page', () => {
  test.describe.configure({ mode: 'serial' });

  test('file audio page details', async ({ authedPageAdmin: page }) => {
    const sidebarPage = new SidebarPage(page);
    const audioPage = new AudioFilesPage(page);

    await sidebarPage.openConnectors();
    await sidebarPage.navigateToAudio();
    await audioPage.filterByCurrentDay();

    const count = await audioPage.getFilesCount();
    expect(Number.isFinite(count)).toBeTruthy();
  });

  test('audio file name length in table', async ({ authedPageAdmin: page, apiSession }) => {
    test.skip(!resolveFixtureFile(AUDIO_FILE), `Fixture file not found: ${AUDIO_FILE}`);

    await apiSession.uploadFile('admin', { fileName: AUDIO_FILE });

    const sidebarPage = new SidebarPage(page);
    const audioPage = new AudioFilesPage(page);

    await sidebarPage.openConnectors();
    await sidebarPage.navigateToAudio();
    await audioPage.filterByCurrentDay();
    await audioPage.switchToTableView();

    const fileName = await audioPage.getFirstFileName();
    expect(fileName.length).toBeLessThanOrEqual(38);
  });
});
