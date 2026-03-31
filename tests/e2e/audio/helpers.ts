import { SidebarPage } from '../pages/sidebarPage';

export async function openAudioPage(sidebarPage: SidebarPage): Promise<void> {
  await sidebarPage.openConnectors();
  await sidebarPage.navigateToAudio();
}
