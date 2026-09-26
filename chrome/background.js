// Chrome has no declarative equivalent of Firefox's theme_icons, so we use
// a hidden offscreen document (which has access to window.matchMedia) to
// detect the light/dark preference, and swap the toolbar icon from here.

const ICONS = {
  dark: {
    16: 'icons/light-16.png',
    32: 'icons/light-32.png',
    48: 'icons/light-48.png',
    128: 'icons/light-128.png',
  },
  light: {
    16: 'icons/dark-16.png',
    32: 'icons/dark-32.png',
    48: 'icons/dark-48.png',
    128: 'icons/dark-128.png',
  },
};

function setIconForScheme(isDark) {
  chrome.action.setIcon({ path: isDark ? ICONS.dark : ICONS.light });
}

let creatingOffscreen;

async function ensureOffscreenDocument() {
  const offscreenUrl = chrome.runtime.getURL('offscreen.html');
  const existing = await chrome.runtime.getContexts({
    contextTypes: ['OFFSCREEN_DOCUMENT'],
    documentUrls: [offscreenUrl],
  });
  if (existing.length > 0) return;

  if (creatingOffscreen) {
    await creatingOffscreen;
    return;
  }

  creatingOffscreen = chrome.offscreen.createDocument({
    url: 'offscreen.html',
    reasons: ['MATCH_MEDIA'],
    justification: 'Detect the browser light/dark preference to pick a visible toolbar icon.',
  });
  await creatingOffscreen;
  creatingOffscreen = null;
}

chrome.runtime.onMessage.addListener((message) => {
  if (message && message.type === 'THEME_CHANGED') {
    setIconForScheme(message.isDark);
  }
});

chrome.runtime.onStartup.addListener(ensureOffscreenDocument);
chrome.runtime.onInstalled.addListener(ensureOffscreenDocument);
