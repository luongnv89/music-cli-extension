import { buildMusicCliUrl, extractTimestampSeconds, extractYouTubeVideoId } from './youtube.js';

const MENU_ID = 'open-with-musiccli';
const DEFAULT_BASE_URL = 'https://music-cli.luongnv.com/';

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: MENU_ID,
      title: 'Open with MusicCLI',
      contexts: ['page', 'link', 'video'],
      documentUrlPatterns: ['*://*.youtube.com/*', '*://youtu.be/*'],
      targetUrlPatterns: ['*://*.youtube.com/*', '*://youtu.be/*']
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== MENU_ID) return;
  await openWithMusicCli(info.linkUrl || info.srcUrl || info.pageUrl || tab?.url);
});

chrome.action.onClicked?.addListener(async (tab) => {
  await openWithMusicCli(tab?.url);
});

async function openWithMusicCli(sourceUrl) {
  const videoId = extractYouTubeVideoId(sourceUrl);
  if (!videoId) return;
  const { musicCliBaseUrl = DEFAULT_BASE_URL } = await chrome.storage.sync.get('musicCliBaseUrl');
  const targetUrl = buildMusicCliUrl(videoId, {
    baseUrl: musicCliBaseUrl,
    t: extractTimestampSeconds(sourceUrl)
  });
  await chrome.tabs.create({ url: targetUrl });
}
