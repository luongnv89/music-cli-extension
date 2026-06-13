export function extractYouTubeVideoId(input) {
  if (!input || typeof input !== 'string') return null;
  const value = input.trim();
  const raw = value.match(/^[a-zA-Z0-9_-]{11}$/);
  if (raw) return value;
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');
    if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'music.youtube.com') {
      if (url.pathname === '/watch') return cleanId(url.searchParams.get('v'));
      const match = url.pathname.match(/^\/(embed|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (match) return match[2];
    }
    if (host === 'youtu.be') {
      const id = url.pathname.split('/').filter(Boolean)[0];
      return cleanId(id);
    }
  } catch (_) {
    const loose = value.match(/(?:v=|youtu\.be\/|embed\/|shorts\/|live\/)([a-zA-Z0-9_-]{11})/);
    return loose ? loose[1] : null;
  }
  return null;
}

export function extractTimestampSeconds(input) {
  if (!input || typeof input !== 'string') return null;
  try {
    const url = new URL(input);
    return parseTimestamp(url.searchParams.get('t') || url.searchParams.get('start'));
  } catch (_) {
    const match = input.match(/[?&#](?:t|start)=([^&#]+)/);
    return match ? parseTimestamp(match[1]) : null;
  }
}

export function buildMusicCliUrl(videoId, options = {}) {
  const baseUrl = (options.baseUrl || 'https://music-cli.luongnv.com/').trim();
  const url = new URL(baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`);
  url.searchParams.set('v', videoId);
  if (Number.isInteger(options.t) && options.t > 0) url.searchParams.set('t', String(options.t));
  return url.toString();
}

function cleanId(id) {
  return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
}

function parseTimestamp(value) {
  if (!value) return null;
  if (/^\d+$/.test(value)) return Number(value);
  const match = String(value).match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?$/i);
  if (!match) return null;
  const seconds = (Number(match[1] || 0) * 3600) + (Number(match[2] || 0) * 60) + Number(match[3] || 0);
  return seconds > 0 ? seconds : null;
}
