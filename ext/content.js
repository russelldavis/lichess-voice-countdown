import { getOptions, getVoices, speak, voicePredicate } from "./lib.js";
const $ = document.querySelector.bind(document);

class Handler {
  constructor(voice, extOpts) {
    this.voice = voice;
    this.extOpts = extOpts;
    this.prevSeconds = null;
  }

  onTimeMutation(timeStr) {
    const match = timeStr.match(/(\d\d)\s*[^\d]\s*(\d\d)\s*([^\d]\d*)?$/);
    if (!match) {
      console.log("Can't parse time:", timeStr);
      return;
    }
    const seconds = (Number(match[1]) * 60) + Number(match[2]);
    if (this.prevSeconds == null) {
      // It's the first render. If the starting time happens to fall on an alert marker,
      // no need to alert at the start of the game. This also avoids alerting when loading
      // an already finished game, if the ending time of the game happened to fall on an
      // alert time.
      this.prevSeconds = seconds;
      return;
    }
    if (seconds === this.prevSeconds) {
      // The clock was re-rendered w/ no change, or the milliseconds changed but not the rest.
      return;
    }
    this.prevSeconds = seconds;
    if (this.extOpts.alertTimes.includes(seconds)) {
      speak(`${seconds}`, this.voice);
    }
  }

  tryInit() {
    const timeEl = $(".rclock-bottom .time");
    if (!timeEl) {
      return false;
    }

    console.log("Lichess Countdown Timer is activated")
    new MutationObserver(() => {
      this.onTimeMutation(timeEl.innerText);
    }).observe(timeEl, {childList: true});
    return true;
  }
}

async function main() {
  console.log("Lichess Countdown Timer is initializing");
  const extOpts = await getOptions();
  const voices = await getVoices();
  const voice = voices.find(voicePredicate(extOpts.voiceName));
  const handler = new Handler(voice, extOpts);

  if (!handler.tryInit()) {
    const observer = new MutationObserver(() => {
      if (handler.tryInit()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, {childList: true, subtree: true})
  }
}

main().then();

export {};
