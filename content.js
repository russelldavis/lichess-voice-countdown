import { getOptions } from "./lib.js";
const $ = document.querySelector.bind(document);
let opts = null;

function speak(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  console.log(`Speaking: ${text}`);
  speechSynthesis.speak(utterance);
}

let prevSeconds = null;
function onTimeMutation(timeStr) {
  const match = timeStr.match(/(\d\d)\s*[^\d]\s*(\d\d)\s*([^\d]\d*)?$/);
  if (!match) {
    console.log("Can't parse time:", timeStr);
    return;
  }
  const seconds = (Number(match[1]) * 60) + Number(match[2]);
  if (seconds === prevSeconds) {
    // The clock was re-rendered w/ no change
    return;
  }
  prevSeconds = seconds;
  if (opts.alertTimes.includes(seconds)) {
    speak(`${seconds}`);
  }
}

function tryInit() {
  const timeEl = $(".rclock-bottom .time");
  if (!timeEl) {
    return false;
  }

  console.log("Lichess Countdown Timer is activated")
  new MutationObserver(() => {
    onTimeMutation(timeEl.innerText);
  }).observe(timeEl, {childList: true});
  return true;
}

async function main() {
  console.log("Lichess Countdown Timer is initializing");
  opts = await getOptions();
  if (!tryInit()) {
    const observer = new MutationObserver(() => {
      if (tryInit()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, {childList: true, subtree: true})
  }
}

main().then();

export {};
