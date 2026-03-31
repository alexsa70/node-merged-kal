import { test } from '../../fixtures';
import { UiEndpoints } from '../../constants/ui';
import { AlbumsPage } from '../../pages/albumsPage';
import { SidebarPage } from '../../pages/sidebarPage';

const ALBUM_NAME = `auto_album_${Math.random().toString(36).slice(2, 8)}`;

test.describe('E2E albums page', () => {
  test('create / validate / delete /validate album', async ({ authedPageAdmin: page }) => {
    const sidebarPage = new SidebarPage(page);
    const albumsPage = new AlbumsPage(page);

    await sidebarPage.openMediaAlbums();
    await sidebarPage.expectCurrentPath(UiEndpoints.mediaAlbums);
    await albumsPage.expectPageVisible();

    await albumsPage.createAlbum(ALBUM_NAME);
    await albumsPage.expectAlbumVisible(ALBUM_NAME);
    await albumsPage.openAlbum(ALBUM_NAME);
    await albumsPage.deleteAlbum();
    await albumsPage.expectAlbumNotVisible(ALBUM_NAME);
  });
});
