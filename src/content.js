// NOTE: classic content scripts can't `import` from src/youtube.js, so the
// video-id / timestamp parsing below is intentionally a small standalone copy.
// Keep it in sync with src/youtube.js if that logic changes.
const BUTTON_ID = 'musiccli-open-button';
const DEFAULT_BASE_URL = 'https://music-cli.luongnv.com/';

// music-cli "Pulse Prompt" logo — waveform bars with a bright-green center bar.
const LOGO_SVG = `
<svg viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" width="22" height="22" aria-hidden="true" focusable="false">
  <rect width="512" height="512" rx="100" fill="#09090B"/>
  <rect x="82"  y="302" width="58" height="136" rx="14" fill="white" opacity="0.3"/>
  <rect x="158" y="228" width="58" height="210" rx="14" fill="white" opacity="0.6"/>
  <rect x="234" y="138" width="58" height="300" rx="14" fill="#22C55E"/>
  <rect x="310" y="228" width="58" height="210" rx="14" fill="white" opacity="0.6"/>
  <rect x="386" y="302" width="58" height="136" rx="14" fill="white" opacity="0.3"/>
  <rect x="82" y="455" width="362" height="16" rx="8" fill="#22C55E" opacity="0.2"/>
</svg>`;

function extractVideoIdFromLocation() {
  const params = new URLSearchParams(location.search);
  const v = params.get('v');
  if (v && /^[a-zA-Z0-9_-]{11}$/.test(v)) return v;
  const shorts = location.pathname.match(/^\/shorts\/([a-zA-Z0-9_-]{11})/);
  return shorts ? shorts[1] : null;
}

function currentTimestampSeconds() {
  const params = new URLSearchParams(location.search);
  const raw = params.get('t') || params.get('start');
  if (!raw) return null;
  if (/^\d+$/.test(raw)) return Number(raw);
  const match = String(raw).match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/i);
  if (!match) return null;
  const seconds = (Number(match[1] || 0) * 3600) + (Number(match[2] || 0) * 60) + Number(match[3] || 0);
  return seconds > 0 ? seconds : null;
}

async function openInMusicCli() {
  const videoId = extractVideoIdFromLocation();
  if (!videoId) return;
  let baseUrl = DEFAULT_BASE_URL;
  try {
    const stored = await chrome.storage.sync.get('musicCliBaseUrl');
    if (stored && stored.musicCliBaseUrl) baseUrl = stored.musicCliBaseUrl;
  } catch (_) {
    // storage may be unavailable (e.g. invalidated context); fall back to default
  }
  const normalized = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const url = new URL(normalized);
  url.searchParams.set('v', videoId);
  const t = currentTimestampSeconds();
  if (Number.isInteger(t) && t > 0) url.searchParams.set('t', String(t));
  window.open(url.toString(), '_blank', 'noopener');
}

function createButton() {
  const button = document.createElement('button');
  button.id = BUTTON_ID;
  button.type = 'button';
  button.title = 'Open with MusicCLI';
  button.setAttribute('aria-label', 'Open with MusicCLI');
  button.innerHTML = `${LOGO_SVG}<span class="musiccli-btn-label">MusicCLI</span>`;
  button.addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    openInMusicCli();
  });
  return button;
}

function findActionsContainer() {
  // Primary watch-page action row (Like/Share/Download live here).
  return (
    document.querySelector('ytd-watch-metadata #actions #top-level-buttons-computed') ||
    document.querySelector('ytd-watch-metadata #actions-inner #menu') ||
    document.querySelector('#top-level-buttons-computed') ||
    document.querySelector('ytd-menu-renderer #top-level-buttons-computed')
  );
}

function injectButton() {
  if (!extractVideoIdFromLocation()) {
    document.getElementById(BUTTON_ID)?.remove();
    return;
  }
  if (document.getElementById(BUTTON_ID)) return;
  const container = findActionsContainer();
  if (!container) return;
  container.appendChild(createButton());
}

let scheduled = false;
function scheduleInject() {
  if (scheduled) return;
  scheduled = true;
  requestAnimationFrame(() => {
    scheduled = false;
    injectButton();
  });
}

function start() {
  injectButton();
  // YouTube renders the action row asynchronously and rebuilds it on SPA
  // navigation; coalesce the flood of mutations into one check per frame.
  const observer = new MutationObserver(scheduleInject);
  observer.observe(document.documentElement, { childList: true, subtree: true });
  // YouTube SPA navigation fires these when a new video page is ready.
  window.addEventListener('yt-navigate-finish', scheduleInject);
  document.addEventListener('yt-page-data-updated', scheduleInject);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', start);
} else {
  start();
}
