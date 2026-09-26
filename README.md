# Volume Booster

Boost the audio/video volume of the current tab beyond the browser's normal
limit (up to 1000%), or turn it down below 100%. 100% is untouched original
volume.

This repo has one build per browser, since Chrome (Manifest V3, no SVG
icons, no declarative theme icons) and Firefox (Manifest V2, native SVG +
`theme_icons`) diverge enough to need separate manifests:

```
chrome/    -> load this folder in Chrome
firefox/   -> load this folder in Firefox
```

`popup.html`, `popup.js` and `content.js` are identical in both folders
(a tiny `browserAPI = browser ?? chrome` shim at the top of each script is
what makes the same code run on both).

## How it works

- `content.js` connects each `<video>`/`<audio>` element to a `GainNode` via
  the Web Audio API, which is what allows going above the browser's native
  100% ceiling.
- The popup applies the new value live and stores it under
  `storage.session` keyed by tab id, so nothing is written to disk and it
  clears when the browser closes.
- Nothing is ever sent off the device.

## Toolbar icon: light/dark theme

- **Firefox**: fully declarative, via the `theme_icons` key in
  `manifest.json` — no JS involved.
- **Chrome**: Chrome has no equivalent manifest key, so `background.js`
  opens a hidden offscreen document (`offscreen.html`/`offscreen.js`) that
  watches `matchMedia('(prefers-color-scheme: dark)')` and tells the
  service worker to call `chrome.action.setIcon()` whenever it changes.

## Install locally (developer mode)

**Firefox**
1. `about:debugging#/runtime/this-firefox`
2. "Load Temporary Add-on…" → select `firefox/manifest.json`

**Chrome**
1. `chrome://extensions`
2. Enable "Developer mode" (top right)
3. "Load unpacked" → select the `chrome/` folder

## Known limitations

- The saved volume is per **tab**, not per **site**, and is cleared on
  browser restart (session storage). Reloading or navigating a tab resets
  it to 100% until you reopen the popup — the content script currently has
  no way to read back its own tab's saved value on page load, since content
  scripts aren't told their own tab id. If you want the "remembers this
  site automatically" behavior back, that needs either switching back to
  hostname-keyed `storage.local`, or adding a small background relay so the
  content script can ask "what's my saved volume?" on load.

## License

MIT — see `LICENSE`.
