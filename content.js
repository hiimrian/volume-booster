(function () {
  'use strict';

  let currentVolume = 100;
  let audioCtx = null;
  const nodeMap = new Map();

  function getAudioContext() {
    if (!audioCtx) {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      audioCtx = new Ctx();
    }
    return audioCtx;
  }

  function hookElement(el) {
    if (!el || nodeMap.has(el)) return;
    try {
      const ctx = getAudioContext();
      const source = ctx.createMediaElementSource(el);
      const gainNode = ctx.createGain();
      gainNode.gain.value = currentVolume / 100;
      source.connect(gainNode).connect(ctx.destination);
      nodeMap.set(el, gainNode);
    } catch (err) {
      console.warn('[Tab Volume Booster] ignored element:', err.message);
    }
  }

  function scanForMediaElements(root) {
    (root || document).querySelectorAll('video, audio').forEach(hookElement);
  }

  function setVolume(percent) {
    currentVolume = Math.min(1000, Math.max(0, Number(percent)));
    nodeMap.forEach((gainNode) => {
      gainNode.gain.value = currentVolume / 100;
    });
    scanForMediaElements();
  }

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== 1) return;
        if (node.tagName === 'VIDEO' || node.tagName === 'AUDIO') {
          hookElement(node);
        } else if (typeof node.querySelectorAll === 'function') {
          scanForMediaElements(node);
        }
      });
    }
  });
  observer.observe(document.documentElement, { childList: true, subtree: true });

  document.addEventListener(
    'click',
    () => {
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
    },
    { once: true, capture: true }
  );

  browser.runtime.onMessage.addListener((message) => {
    if (message && message.type === 'SET_VOLUME') {
      setVolume(message.value);
      return Promise.resolve({ ok: true });
    }
  });
})();
