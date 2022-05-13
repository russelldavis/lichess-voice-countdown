const $ = document.querySelector.bind(document);
const isLichess = document.domain == "lichess.org";

const OPTIONS = {
  alertTimes: [45, 30, 15, 10, 5, 2],
  moveAlertInterval: 30,
  synthVoiceName: "Alex",
  mp3VoiceName: "Eric",
  // If true, uses mp3 files instead of the SpeechSynthesis API.
  // I added this due to crashes caused by the API: https://bugs.chromium.org/p/chromium/issues/detail?id=1301855#c2
  useMp3s: true,
  // debug: true,
}

if (OPTIONS.debug) {
  OPTIONS.alertTimes.push(59);
  OPTIONS.moveAlertInterval = 3;
}

let voice = null;
if (!OPTIONS.useMp3s) {
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

  const voices = await getVoices();
  voice = voices.find((voice) => voice.name === OPTIONS.synthVoiceName);
}

let prevSeconds = null;
let prevNumMoves = null;
let moveStartTime = null;

function speakSynth(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  speechSynthesis.speak(utterance);
}

function speakMp3(text) {
  window.postMessage(
    {
      src: "lichess-voice-countdown",
      command: "speakMp3",
      voiceName: OPTIONS.mp3VoiceName,
      text
    },
    "*"
  );
}

function speak(text) {
  // This is meant to be set externally in the console
  if (window["lvcMute"]) {
    console.log(`Muted: ${text}`);
    return;
  }
  console.log(`Speaking: ${text}`);
  OPTIONS.useMp3s ?
    speakMp3(text) :
    speakSynth(text);
}

function onTimeMutation(movesEl, timeStr) {
  const match = timeStr.match(
    isLichess ?
      /(\d\d)\s*[^\d]\s*(\d\d)\s*([^\d]\d*)?$/ :
      /(\d\d?):(\d\d)(\.\d+)?$/
  );
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
  if (seconds >= prevSeconds) {
    // When equal: The clock was re-rendered w/ no change, or the milliseconds changed but not the rest.
    // When greater: We just finished a move and the increment time was added.
    // Either way, just ignore.
    // console.log("Ignoring time change >= previous time");
    // Important to set prevSeconds for the case when we've just added the increment, so that we only
    // ignore the uptick, not every downtick back to the pre-increment time.
    prevSeconds = seconds;
    return;
  }
  prevSeconds = seconds;
  // console.log(seconds);
  if (OPTIONS.alertTimes.includes(seconds)) {
    speak(`${seconds}`);
    return;
  }

  const numMoves = movesEl.querySelectorAll(isLichess ? "u8t" : ".move").length;
  if (numMoves !== prevNumMoves) {
    // console.log("Restarting move clock at: ", seconds);
    prevNumMoves = numMoves;
    // + 1 because the move started a second ago, before the clock changed
    moveStartTime = seconds + 1;
  }

  //console.log("Move timer: ", (moveStartTime - seconds))
  if ((moveStartTime - seconds) % OPTIONS.moveAlertInterval === 0) {
    speak("move!");
  }
}

function tryInit() {
  const timeEl = isLichess ?
    $(".rclock-bottom .time") : (
      // For games against humans
      $('.clock-bottom [data-cy="clock-time"]') ||
      // For games against computers
      $(".layout-bottom-player .move-time-content")
    );
  const movesEl = isLichess ? $("rm6") : $("vertical-move-list");
  if (!timeEl || !movesEl) {
    return false;
  }
  const playerControlsEl = isLichess ?
    $(".rcontrols") : (
      // For games against humans
      $(".live-game-buttons-component") ||
      // For games against computers
      $(".game-control-buttons-wrapper")
    );
  if (!playerControlsEl) {
    // Everything is initialized, but this page is just observing a game.
    // Return true so we don't keep trying to initialize.
    console.log("This page just observing, disabling countdown timer");
    return true;
  }

  console.log("Countdown Timer is activated");
  const timeObserver = new MutationObserver(() => {
    onTimeMutation(movesEl, timeEl.innerText);
  }).observe(timeEl, {childList: true});

  // TODO: In chess.com, if you click Rematch, a new set of clock elements gets
  // used, so we need to watch for that and reinitialize.
  // const resetObserver =  new MutationObserver(() => {
  //
  // }).observe(timeEl.parentNode)

  return true;
}

function sendMouseEvent(el, eventName) {
  console.log("clicking on:", el)
  el.dispatchEvent(new MouseEvent(eventName, {buttons: 1, bubbles: true}));
}

function onKeyDown(event) {
  if (event.target !== document.body) {
    return;
  }
  if (event.key === "Enter") {
    // NB: Lichess already has the space key for "Play best computer move". However:
    // 1) The space key is meant for scrolling (and my smoothscroll extension will take
    // precedence for that.
    // 2) Sometimes the server evaluation doesn't agree with the client on what the best move is.
    // Lichess's space key will use the server's move in that case, even though it uses the client's
    // move for drawing its arrows. For consistency it's best to just always use the client's move,
    // so we do that here.
    sendMouseEvent($(".pv_box .pv"), "mousedown");
    return;
  }
  if (event.key === "o") {
    sendMouseEvent($(".friend_box_title"), "click");
    return;
  }
}

function main() {
  console.log("Chess Countdown Timer is initializing");
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
