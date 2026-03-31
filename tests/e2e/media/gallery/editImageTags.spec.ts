import { test, expect } from '../../fixtures';
import { SidebarPage } from '../../pages/sidebarPage';

const TAG = `auto_tag_${Math.random().toString(36).slice(2, 6)}`;

test.describe('E2E media gallery edit tags', () => {
  // BUG: tag is not actually saved — API returns 200 OK but with denied_count=1
  test('select image and add tag via edit tags modal @bug', async ({ authedPageAdmin: page }) => {
    const sidebarPage = new SidebarPage(page);

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
