// References:
// https://github.com/mdn/web-speech-api/tree/master/speak-easy-synthesis
// https://mdn.github.io/web-speech-api/speak-easy-synthesis/
import { DEFAULT_OPTIONS, getOptions, getVoices, speak, voicePredicate } from "./lib.js";
import { setStorage } from "./storage.js";

const $ = document.querySelector.bind(document);
const voicesPromise = getVoices();

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

async function playVoice() {
  const opts = await getOptions();
  const text = opts.alertTimes[0] || 0;
  speak(text, await selectedVoice());
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
  await playVoice();
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

async function restoreOptions() {
  const opts = await getOptions();
  const voices = await voicesPromise;
  $("#alertsText").value = opts.alertTimes.join(", ");
  $("#voice").selectedIndex = voices.findIndex(voicePredicate(opts.voiceName));
}

async function resetToDefaults() {
  await setStorage(DEFAULT_OPTIONS);
  await restoreOptions();
}

init().then();
export {};
