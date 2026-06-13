import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMusicCliUrl, extractTimestampSeconds, extractYouTubeVideoId } from '../src/youtube.js';

test('extracts video IDs from common YouTube URLs', () => {
  assert.equal(extractYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeVideoId('https://youtu.be/dQw4w9WgXcQ?t=43'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeVideoId('https://www.youtube.com/shorts/dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
  assert.equal(extractYouTubeVideoId('dQw4w9WgXcQ'), 'dQw4w9WgXcQ');
});

test('extracts timestamps', () => {
  assert.equal(extractTimestampSeconds('https://youtu.be/dQw4w9WgXcQ?t=1m3s'), 63);
  assert.equal(extractTimestampSeconds('https://www.youtube.com/watch?v=dQw4w9WgXcQ&start=90'), 90);
});

test('builds MusicCLI URL', () => {
  assert.equal(buildMusicCliUrl('dQw4w9WgXcQ', { t: 42 }), 'https://music-cli.luongnv.com/?v=dQw4w9WgXcQ&t=42');
});
