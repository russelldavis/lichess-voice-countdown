const $ = document.querySelector.bind(document);
const voicesPromise = getVoices();
const DEFAULT_OPTIONS = {
  alertTimes: [45, 30, 15, 10, 5, 2],
  voiceName: null,
}


function debounce(callback, time) {
  let timeoutId = null;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => {
      timeoutId = null;
      callback(...args);
    }, time);
  };
}

function getVoices() {
  return new Promise((resolve, _reject) => {
    const voices = speechSynthesis.getVoices();
    if (voices.length !== 0) {
      resolve(voices);
    } else {
      const listener = () => {
        speechSynthesis.removeEventListener("voiceschanged", listener);
        resolve(speechSynthesis.getVoices());
      };
      speechSynthesis.addEventListener("voiceschanged", listener);
    }
  });
}

async function selectedVoice() {
  return (await voicesPromise)[$("#voice").selectedIndex];
}

async function initVoices() {
  const voiceEl = $("#voice");
  for (const voice of await voicesPromise) {
    const option = document.createElement('option');
    option.textContent = `${voice.name} (${voice.lang})`;
    voiceEl.appendChild(option);
  }
}

async function saveVoice() {
  await setStorage({ voiceName: (await selectedVoice()).name });
}

async function init() {
  await initVoices();
  await restoreOptions();
  $("#alertsText").addEventListener('input', debounce(saveAlertsText, 50));
  $("#voice").addEventListener('change', saveVoice);
  $("#resetToDefaults").addEventListener('click', resetToDefaults);
}

async function saveAlertsText() {
  const el = $("#alertsText");
  const alertsText = $("#alertsText").value;
  const alertStrs = alertsText.split(",");
  const alertTimes = [];
  for (const alertStr of alertStrs) {
    if (alertStr.trim() === "") {
      continue;
    }
    const alertTime = Number(alertStr);
    if (!isFinite(alertTime) || alertTime < 0) {
      el.setCustomValidity(`Invalid value: ${alertStr}`);
      el.reportValidity();
      return;
    }
    alertTimes.push(alertTime)
  }
  el.setCustomValidity("");
  await setStorage({ alertTimes });
}

function getStorage(keysOrDefaults) {
  return new Promise((resolve, _reject) => {
    chrome.storage.sync.get(keysOrDefaults, (items) => {
      if (chrome.runtime.lastError) {
        alert(`Sorry, there was an error loading the options: ${chrome.runtime.lastError.message}`);
      } else {
        resolve(items);
      }
    });
  });
}

function setStorage(items) {
  return new Promise((resolve, _reject) => {
    chrome.storage.sync.set(items, () => {
      if (chrome.runtime.lastError) {
        alert(`Sorry, there was an error saving the options: ${chrome.runtime.lastError.message}`);
      } else {
        resolve();
      }
    });
  })
}

async function restoreOptions() {
  const opts = await getStorage(DEFAULT_OPTIONS);
  const voices = await voicesPromise;
  $("#alertsText").value = opts.alertTimes.join(", ");
  $("#voice").selectedIndex = opts.voiceName ?
    voices.findIndex((voice) => voice.name === opts.voiceName) :
    voices.findIndex((voice) => voice.default);
}

async function resetToDefaults() {
  await setStorage(DEFAULT_OPTIONS);
  await restoreOptions();
}

init().then();
export {};
