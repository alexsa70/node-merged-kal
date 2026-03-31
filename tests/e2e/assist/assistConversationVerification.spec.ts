import { test } from '../fixtures';
import { AssistPage } from '../pages/assistPage';
import { SidebarPage } from '../pages/sidebarPage';

const regularQuery = 'תן לי רקע כללי';
const adminQuery = 'מה נבדק באמ״ן';

test.describe('E2E assist conversation verification', () => {
  test.describe.configure({ mode: 'serial' });

  test('verify Assist displays conversation results', async ({ authedPage: page }) => {
    const sidebarPage = new SidebarPage(page);
    const assistPage = new AssistPage(page);    

    await sidebarPage.navigateToAssist();
    await assistPage.sendMessageAndWaitForResponse(regularQuery);     
  });
  
});
