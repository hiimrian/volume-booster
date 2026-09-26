const slider = document.getElementById('volumeSlider');
const numberInput = document.getElementById('volumeNumber');
const valueLabel = document.getElementById('volumeValue');
const resetBtn = document.getElementById('resetBtn');
const siteLabel = document.getElementById('siteLabel');
const warningEl = document.getElementById('warning');
const controls = document.getElementById('controls');

let currentTab = null;
let hostname = null;

function zoneClass(value) {
  if (value <= 150) return 'safe';
  if (value <= 300) return 'boost';
  if (value <= 600) return 'danger';
  return 'extreme';
}

function setDisplay(value) {
  slider.value = value;
  numberInput.value = value;
  valueLabel.textContent = value + '%';
  valueLabel.className = zoneClass(value);
}

function apply(value) {
  value = Math.min(1000, Math.max(0, value));
  setDisplay(value);
  browser.storage.session.set({ [`tab_${currentTab.id}`]: value });
  browser.tabs.sendMessage(currentTab.id, { type: 'SET_VOLUME', value }).catch(() => {
  });
}

function onSliderInput() {
  apply(Number(slider.value));
}

function onNumberChange() {
  const value = Number(numberInput.value);
  apply(Number.isNaN(value) ? 100 : value);
}

async function init() {
  const tabs = await browser.tabs.query({ active: true, currentWindow: true });
  currentTab = tabs[0];

  if (!currentTab || !currentTab.url || !/^https?:/.test(currentTab.url)) {
    controls.style.display = 'none';
    siteLabel.style.display = 'none';
    warningEl.style.display = 'block';
    warningEl.textContent = 'This extension does not work on this page.';
    return;
  }

  hostname = new URL(currentTab.url).hostname;
  siteLabel.textContent = hostname;
  siteLabel.style.display = 'block';

  const key = `tab_${currentTab.id}`;
  const stored = await browser.storage.session.get(key);
  
  setDisplay(stored[key] ?? 100);

  slider.addEventListener('input', onSliderInput);
  numberInput.addEventListener('keydown', (event) => {
    const allowedKeys = [
      'Enter',
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Home',
      'End'
    ];

    if (event.ctrlKey || event.metaKey) {
      return;
    }
    
    if (!/[0-9]/.test(event.key) && !allowedKeys.includes(event.key)) {
      event.preventDefault();
    }
  });

  numberInput.addEventListener('input', () => {
    numberInput.value = numberInput.value.replace(/\D/g, '');
  });

  numberInput.addEventListener('change', onNumberChange);

  resetBtn.addEventListener('click', () => apply(100));
}

init();
