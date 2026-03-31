import { test, expect } from '../fixtures';
import { resolveFixtureFile } from '../helpers/api';
import { DocFilesPage } from '../pages/docFilesPage';
import { SidebarPage } from '../pages/sidebarPage';

const docFiles = [
  'word_file_with_a_very_long_filename_for_testing.docx',
  'medical_records_with_a_very_long_filename_for_testing.csv',
] as const;

test.describe('E2E document uploading and validation', () => {
  test.describe.configure({ mode: 'serial' });

  for (const fileName of docFiles) {
    test(`upload document and validate count increase (${fileName})`, async ({ authedPageAdmin: page, apiSession }) => {
      test.skip(!resolveFixtureFile(fileName), `Fixture file not found: ${fileName}`);

      const sidebarPage = new SidebarPage(page);
      const docPage = new DocFilesPage(page);

      await sidebarPage.openConnectors();
      await sidebarPage.navigateToDocuments();

      const initial = await docPage.getFilesCount();

      await apiSession.uploadFile('admin', { fileName });

      //await sidebarPage.openConnectors();
      await sidebarPage.navigateToDocuments();
      const updated = await docPage.waitForFilesCountAtLeast(initial + 1);
      expect(updated).toBeGreaterThanOrEqual(initial + 1);
    });

    test(`uploaded doc file name is truncated to 38 chars in table view (${fileName})`, async ({ authedPageAdmin: page, apiSession }) => {
      test.skip(!resolveFixtureFile(fileName), `Fixture file not found: ${fileName}`);

      await apiSession.uploadFile('admin', { fileName });

      const sidebarPage = new SidebarPage(page);
      const docPage = new DocFilesPage(page);

      //await sidebarPage.navigateToAudio();
      await sidebarPage.navigateToDocuments();
      await docPage.switchToTableView();

      const firstName = await docPage.getFirstFileName();
      expect(firstName.length).toBeLessThanOrEqual(38);
    });
  }
});
