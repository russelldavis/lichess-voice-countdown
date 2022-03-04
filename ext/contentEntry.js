// Inject the script so we have access to window and dom properties
const script = document.createElement('script');
script.type = "module";
script.src = chrome.runtime.getURL('./content.js');
script.onload = () => script.remove();
document.documentElement.appendChild(script);

// Old way, for an isolated script:
// Dynamically import the main script as a module.
// This allows us to use static imports in the main script.
// See https://stackoverflow.com/questions/48104433/how-to-import-es6-modules-in-content-script-for-chrome-extension
// import("./content.js");


// This has to be here rather than content.js in order to use the chrome.runtime API
function speakMp3(text, voiceName) {
  // Sites for generating mp3 files:
  // https://ttsfree.com/
  // https://ttsmp3.com/
  const audio = new Audio(chrome.runtime.getURL(`audio/${voiceName}/${text}.mp3`));
  audio.play();
}

window.addEventListener("message", (event) => {
  const data = event.data;
  if (data?.src === "lichess-voice-countdown") {
    if (data.command === "speakMp3") {
      speakMp3(data.text, data.voiceName);
    }
  }
});
