import { Page } from '@playwright/test';
import { FilesPage } from './filesPage';

export class DocFilesPage extends FilesPage {
  constructor(page: Page) {
    super(page, 'doc');
  }
}
