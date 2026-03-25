import { Page } from '@playwright/test';
import { FilesPage } from './filesPage';

export class AudioFilesPage extends FilesPage {
  constructor(page: Page) {
    super(page, 'audio');
  }
}
