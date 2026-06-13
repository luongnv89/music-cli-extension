const input = document.querySelector('#baseUrl');
const status = document.querySelector('#status');
const save = document.querySelector('#save');

const { musicCliBaseUrl = 'https://music-cli.luongnv.com/' } = await chrome.storage.sync.get('musicCliBaseUrl');
input.value = musicCliBaseUrl;

save.addEventListener('click', async () => {
  try {
    const url = new URL(input.value.trim());
    await chrome.storage.sync.set({ musicCliBaseUrl: url.toString() });
    status.textContent = 'Saved.';
  } catch (_) {
    status.textContent = 'Enter a valid URL.';
  }
});
