const $ = document.querySelector.bind(document);

const OPTIONS = {
  alertTimes: [45, 30, 15, 10, 5, 2],
  moveAlertInterval: 30,
  voiceName: "Alex",
  // debug: true,
}

if (OPTIONS.debug) {
  OPTIONS.alertTimes.push(59);
  OPTIONS.moveAlertInterval = 3;
}

const voices = await getVoices();
const voice = voices.find((voice) => voice.name === OPTIONS.voiceName);
let prevSeconds = null;
let prevNumMoves = null;
let moveStartTime = null;

function speak(text) {
  // This is meant to be set externally in the console
  if (window["lvcMute"]) {
    console.log(`Muted: ${text}`);
    return;
  }
  console.log(`Speaking: ${text}`);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  speechSynthesis.speak(utterance);
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


function onTimeMutation(movesEl, timeStr) {
  const match = timeStr.match(/(\d\d)\s*[^\d]\s*(\d\d)\s*([^\d]\d*)?$/);
  if (!match) {
    console.log("Can't parse time:", timeStr);
    return;
  }
  const seconds = (Number(match[1]) * 60) + Number(match[2]);
  if (prevSeconds == null) {
    // It's the first render. If the starting time happens to fall on an alert marker,
    // no need to alert at the start of the game. This also avoids alerting when loading
    // an already finished game, if the ending time of the game happened to fall on an
    // alert time.
    prevSeconds = seconds;
    return;
  }
  if (seconds === prevSeconds) {
    // The clock was re-rendered w/ no change, or the milliseconds changed but not the rest.
    return;
  }
  prevSeconds = seconds;
  if (OPTIONS.alertTimes.includes(seconds)) {
    speak(`${seconds}`);
    return;
  }

  const numMoves = movesEl.querySelectorAll("u8t").length
  if (numMoves !== prevNumMoves) {
    prevNumMoves = numMoves;
    // + 1 because the move started a second ago, beore the clock changed
    moveStartTime = seconds + 1;
  }

  if ((moveStartTime - seconds) % OPTIONS.moveAlertInterval === 0) {
    speak("move!");
  }
}

function tryInit() {
  const timeEl = $(".rclock-bottom .time");
  const movesEl = $("rm6"); // lichess uses a weird custom tag
  if (!timeEl || !movesEl) {
    return false;
  }
  if (!$(".rcontrols")) {
    // Everything is initialized, but this page is just observing a game.
    // Return true so we don't keep trying to initialize.
    console.log("This page just observing, disabling countdown timer");
    return true;
  }

  console.log("Lichess Countdown Timer is activated");
  new MutationObserver(() => {
    onTimeMutation(movesEl, timeEl.innerText);
  }).observe(timeEl, {childList: true});
  return true;
}

function onKeyDown(event) {
  if (event.target === document.body && event.key === "Enter") {
    // NB: Lichess already has the space key for "Play best computer move". However:
    // 1) The space key is meant for scrolling (and my smoothscroll extension will take
    // precedence for that.
    // 2) Sometimes the server evaluation doesn't agree with the client on what the best move is.
    // Lichess's space key will use the server's move in that case, even though it uses the client's
    // move for drawing its arrows. For consistency it's best to just always use the client's move,
    // so we do that here.
    const el = $(".pv_box .pv");
    el.dispatchEvent(new MouseEvent("mousedown", {buttons: 1, bubbles: true}));
  }
}

function main() {
  console.log("Lichess Countdown Timer is initializing");
  document.body.addEventListener("keydown", onKeyDown);

  if (!tryInit()) {
    const observer = new MutationObserver(() => {
      if (tryInit()) {
        observer.disconnect();
      }
    });
    observer.observe(document.body, {childList: true, subtree: true})
  }
}

main();

export {};
