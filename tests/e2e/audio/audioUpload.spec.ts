import { test, expect } from '../fixtures';
import { resolveFixtureFile } from '../helpers/api';
import { openAudioPage } from './helpers';
import { AudioFilesPage } from '../pages/audioFilesPage';
import { SidebarPage } from '../pages/sidebarPage';

const AUDIO_FILE = 'audio_file_with_a_very_long_filename_for_testing.ogg';

test.describe('E2E audio upload', () => {
  test.describe.configure({ mode: 'serial' });

  test('upload audio file and validate file count increases by one', async ({ authedPageAdmin: page, apiSession }) => {
    test.skip(!resolveFixtureFile(AUDIO_FILE), `Fixture file not found: ${AUDIO_FILE}`);

    const sidebarPage = new SidebarPage(page);
    const audioPage = new AudioFilesPage(page);

    await openAudioPage(sidebarPage);

    const initial = await audioPage.getFilesCount();

    await apiSession.uploadFile('admin', { fileName: AUDIO_FILE });

    await openAudioPage(sidebarPage);
    const updated = await audioPage.waitForFilesCountAtLeast(initial + 1);
    expect(updated).toBeGreaterThanOrEqual(initial + 1);
  });
});
