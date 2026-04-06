import path from 'path';
import { test, expect } from '../../fixtures';
import { SidebarPage } from '../../pages/sidebarPage';
import { uploadFile } from '../../pages/uploadFile';
import { TagsDescriptForm } from '../../pages/tagsDescriptForm';

const IMAGE_FILE = path.join(process.cwd(), 'assets', 'files', 'test-image.png');
const TAG = `auto_tag_${Math.random().toString(36).slice(2, 6)}`;

test.describe('E2E media gallery upload', () => {
  test.beforeEach(async ({ authedPageAdmin: page }) => {
    const sidebarPage = new SidebarPage(page);
    await sidebarPage.openMediaGallery();
    await page.waitForLoadState('networkidle');
  });

  test('upload image to gallery shows success toast', async ({ authedPageAdmin: page }) => {
    const uploader = new uploadFile(page);
    await uploader.uploadAndWaitForSuccess(IMAGE_FILE);
  });

  test('upload progress indicator closes automatically after upload @bug', async ({ authedPageAdmin: page }) => {
    const uploader = new uploadFile(page);
    const uploadProgress = await uploader.uploadAndWaitForSuccess(IMAGE_FILE);

    // BUG: progress indicator should close automatically after success
    await expect(uploadProgress).toBeHidden({ timeout: 10_000 });
  });

  test('select image and add tag via edit tags modal @bug', async ({ authedPageAdmin: page }) => {
    const tagsForm = new TagsDescriptForm(page);
    await page.getByTestId('files-page-media-map-image-0').click();
    await page.getByTestId('chat-input-edit-tags-button').click();
    
    await expect(tagsForm.formInput).toBeVisible();

    await tagsForm.addTag(TAG);

    await tagsForm.save();

    // BUG: modal should close after saving tags
    await expect(tagsForm.formInput).toBeHidden();
  });
});
