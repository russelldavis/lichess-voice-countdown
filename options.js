const $ = document.querySelector.bind(document);
const DEFAULT_OPTIONS = {
  alertTimes: [45, 30, 15, 10, 5, 2],
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

function init() {
  document.addEventListener('DOMContentLoaded', restoreOptions);
  $("#alertsText").addEventListener('input', debounce(saveAlertsText, 50));
  $("#resetToDefaults").addEventListener('click', resetToDefaults);
}

function saveAlertsText(e) {
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
  setStorage({alertTimes});
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
  $("#alertsText").value = opts.alertTimes.join(", ");
}

async function resetToDefaults() {
  await setStorage(DEFAULT_OPTIONS);
  await restoreOptions();
}

init();
export {};
