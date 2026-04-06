import { expect, Locator, Page } from '@playwright/test';

export class uploadFile {
  constructor(private readonly page: Page) {}

  get uploadButton(): Locator {
    return this.page.getByTestId('chat-input-upload-button');
  }

  get uploadProgress(): Locator {
    return this.page.getByTestId('chat-input-upload-progress');
  }

  async upload(filePath: string): Promise<void> {
    const [fileChooser] = await Promise.all([
      this.page.waitForEvent('filechooser'),
      this.uploadButton.click(),
    ]);

    await fileChooser.setFiles(filePath);
  }

  async expectUploadSucceeded(timeout = 30_000): Promise<void> {
    await expect(this.uploadProgress).toBeVisible({ timeout });
    await expect(this.uploadProgress).toContainText(/uploaded successfully/i);
  }

  async uploadAndWaitForSuccess(filePath: string, timeout = 30_000): Promise<Locator> {
    await this.upload(filePath);
    await this.expectUploadSucceeded(timeout);
    return this.uploadProgress;
  }
}
