export function setStorage(items) {
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

export function getStorage(keysOrDefaults) {
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
