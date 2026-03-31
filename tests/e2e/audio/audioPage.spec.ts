import { test, expect } from '../fixtures';
import { resolveFixtureFile } from '../helpers/api';
import { openAudioPage } from './helpers';
import { AudioFilesPage } from '../pages/audioFilesPage';
import { SidebarPage } from '../pages/sidebarPage';

const AUDIO_FILE = 'audio_file_with_a_very_long_filename_for_testing.ogg';

test.describe('E2E audio page', () => {
  test.describe.configure({ mode: 'serial' });

  test('audio page loads and shows files count for today', async ({ authedPageAdmin: page }) => {
    const sidebarPage = new SidebarPage(page);
    const audioPage = new AudioFilesPage(page);

    await openAudioPage(sidebarPage);
    await audioPage.filterByCurrentDay();

    const count = await audioPage.getFilesCount();
    expect(Number.isFinite(count)).toBeTruthy();
  });

  test('uploaded audio file name is truncated to 38 chars in table view', async ({ authedPageAdmin: page, apiSession }) => {
    test.skip(!resolveFixtureFile(AUDIO_FILE), `Fixture file not found: ${AUDIO_FILE}`);

    await apiSession.uploadFile('admin', { fileName: AUDIO_FILE });

    const sidebarPage = new SidebarPage(page);
    const audioPage = new AudioFilesPage(page);

    await openAudioPage(sidebarPage);
    await audioPage.filterByCurrentDay();
    await audioPage.switchToTableView();

    const fileName = await audioPage.getFirstFileName();
    expect(fileName.length).toBeLessThanOrEqual(38);
  });
});
