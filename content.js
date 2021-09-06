const $ = document.querySelector.bind(document);
const alertTimes = [45, 30, 15, 10, 5, 2];

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
  if (alertTimes.includes(seconds)) {
    speak(`${seconds}`);
  }
}

function onFirstRender() {
  const timeEl = $(".rclock-bottom .time");
  if (!timeEl) {
    console.log("No time element");
    return;
  }

  console.log("Lichess Countdown Timer is activated")
  new MutationObserver(() => {
    onTimeMutation(timeEl.innerText);
  }).observe(timeEl, {childList: true});
}

function main() {
  const observer = new MutationObserver(() => {
    observer.disconnect();
    onFirstRender();
  });
  observer.observe(document.body, {childList: true, subtree: true})
}

main();
