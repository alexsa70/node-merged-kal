import { expect, Locator, Page } from '@playwright/test';

export class TagsDescriptForm {
  constructor(private readonly page: Page) {}

  get formInput(): Locator {
    return this.page.getByTestId('global-modal-body');
  }

  get tagInput(): Locator {
    return this.formInput.getByPlaceholder('Type A Tag');
  }

  get descriptionInput(): Locator {
    return this.formInput.getByPlaceholder('Add a description');
  }

  get saveButton(): Locator {
    return this.formInput.getByRole('button', { name: 'Save' });
  }

  async addTag(tag: string): Promise<void> {
    await this.tagInput.fill(tag);
    await this.page.keyboard.press('Enter');
  }

  async addDescription(description: string): Promise<void> {
    await this.descriptionInput.fill(description);
  }

  async save(): Promise<void> {
    await expect(this.saveButton).toBeEnabled();
    await this.saveButton.click();
  } 
}  