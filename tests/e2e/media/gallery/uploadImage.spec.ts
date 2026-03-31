import path from 'path';
import { test, expect } from '../../fixtures';
import { SidebarPage } from '../../pages/sidebarPage';

const IMAGE_FILE = path.join(process.cwd(), 'assets', 'files', 'test-image.png');

test.describe('E2E media gallery upload', () => {
  test('upload image to gallery shows success toast', async ({ authedPageAdmin: page }) => {
    const sidebarPage = new SidebarPage(page);

    await sidebarPage.openMediaGallery();
    await page.waitForLoadState('networkidle');

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByTestId('chat-input-upload-button').click(),
    ]);

    await fileChooser.setFiles(IMAGE_FILE);

    const uploadProgress = page.getByTestId('chat-input-upload-progress');
    await expect(uploadProgress).toBeVisible({ timeout: 30_000 });
    await expect(uploadProgress).toContainText(/uploaded successfully/i);
  });

  test('upload progress indicator closes automatically after upload @bug', async ({ authedPageAdmin: page }) => {
    const sidebarPage = new SidebarPage(page);

    await sidebarPage.openMediaGallery();
    await page.waitForLoadState('networkidle');

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      page.getByTestId('chat-input-upload-button').click(),
    ]);

    await fileChooser.setFiles(IMAGE_FILE);

    const uploadProgress = page.getByTestId('chat-input-upload-progress');
    await expect(uploadProgress).toBeVisible({ timeout: 30_000 });
    await expect(uploadProgress).toContainText(/uploaded successfully/i);

    // BUG: progress indicator should close automatically after success
    await expect(uploadProgress).toBeHidden({ timeout: 10_000 });
  });
});
