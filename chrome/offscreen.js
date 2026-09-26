// Runs inside the hidden offscreen document, which (unlike the service
// worker) has access to window.matchMedia.

const media = window.matchMedia('(prefers-color-scheme: dark)');

function reportScheme() {
  chrome.runtime.sendMessage({ type: 'THEME_CHANGED', isDark: media.matches });
}

media.addEventListener('change', reportScheme);
reportScheme();
