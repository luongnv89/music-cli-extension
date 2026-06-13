import { buildMusicCliUrl, extractTimestampSeconds, extractYouTubeVideoId } from './youtube.js';

const PAGE_MENU_ID = 'open-page-with-musiccli';
const LINK_MENU_ID = 'open-link-with-musiccli';
const VIDEO_MENU_ID = 'open-video-with-musiccli';
const MENU_IDS = new Set([PAGE_MENU_ID, LINK_MENU_ID, VIDEO_MENU_ID]);
const DEFAULT_BASE_URL = 'https://music-cli.luongnv.com/';

chrome.runtime.onInstalled.addListener(async () => {
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: PAGE_MENU_ID,
      title: 'Open with MusicCLI',
      contexts: ['page'],
      documentUrlPatterns: ['*://*.youtube.com/*', '*://youtu.be/*']
    });
    chrome.contextMenus.create({
      id: LINK_MENU_ID,
      title: 'Open with MusicCLI',
      contexts: ['link'],
      targetUrlPatterns: ['*://*.youtube.com/*', '*://youtu.be/*']
    });
    chrome.contextMenus.create({
      id: VIDEO_MENU_ID,
      title: 'Open with MusicCLI',
      contexts: ['video'],
      targetUrlPatterns: ['*://*.youtube.com/*', '*://youtu.be/*']
    });
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (!MENU_IDS.has(info.menuItemId)) return;
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
