import path from 'path';
import { test, expect } from '../../fixtures';
import { SidebarPage } from '../../pages/sidebarPage';

const IMAGE_FILE = path.join(process.cwd(), 'assets', 'files', 'test-image.png');
const TAG = `auto_tag_${Math.random().toString(36).slice(2, 6)}`;

test.describe('E2E media gallery upload', () => {
  let sidebarPage: SidebarPage;
  
  test.beforeEach(async ({ authedPageAdmin: page }) => {    sidebarPage = new SidebarPage(page);
    await sidebarPage.openMediaGallery();
    await page.waitForLoadState('networkidle');
  });

  test('upload image to gallery shows success toast', async ({ authedPageAdmin: page }) => {
    //const sidebarPage = new SidebarPage(page);

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
    //const sidebarPage = new SidebarPage(page);

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

  test('select image and add tag via edit tags modal @bug', async ({ authedPageAdmin: page }) => {
    //const sidebarPage = new SidebarPage(page);

    await sidebarPage.openMediaGallery();
    await page.waitForLoadState('networkidle');

    // Select first image
    await page.getByTestId('files-page-media-map-image-0').click();

    // Click Edit tags button
    await page.getByTestId('chat-input-edit-tags-button').click();

    // Modal opens
    const modal = page.getByTestId('global-modal-body');
    await expect(modal).toBeVisible();

    // Add tag
    const tagInput = modal.getByPlaceholder('Type A Tag');
    await tagInput.fill(TAG);
    await page.keyboard.press('Enter');

    // Save button becomes enabled after tag added
    const saveButton = modal.getByRole('button', { name: 'Save' });
    await expect(saveButton).toBeEnabled();
    await saveButton.click();

    await expect(modal).toBeHidden();
  });
});
