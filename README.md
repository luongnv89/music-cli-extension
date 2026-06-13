# Open with MusicCLI

Browser extension that adds an **Open with MusicCLI** context-menu action for YouTube videos and links.

When selected, it opens the video in MusicCLI's ad-free web player:

```text
https://music-cli.luongnv.com/?v=YOUTUBE_VIDEO_ID
```

## Features

- Chrome/Chromium Manifest V3 extension
- Right-click menu on YouTube pages, videos, and links
- Supports `youtube.com/watch`, `youtu.be`, `embed`, `live`, and `shorts` URLs
- Preserves YouTube timestamps (`t` / `start`) when available
- Configurable MusicCLI base URL from the popup

## Install for development

1. Clone this repository.
2. Open `chrome://extensions` in Chrome or Chromium.
3. Enable **Developer mode**.
4. Click **Load unpacked**.
5. Select this repository folder.

## Usage

1. Open a YouTube video or right-click a YouTube video link.
2. Choose **Open with MusicCLI**.
3. The extension opens MusicCLI with the video ID passed as `?v=`.

## Package for distribution

```bash
npm run zip
```

Upload `music-cli-extension.zip` to the Chrome Web Store developer dashboard, or distribute it for sideloading.

## Development

```bash
npm test
```
