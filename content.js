const $ = document.querySelector.bind(document);

function main() {
  const timeEl = $("rclock-bottom .time");
  if (!timeEl) {
    return;
  }
  function onMutation() {
    const timeStr = timeEl.innerText;
    const match = timeStr.match(/(\d\d)[^\d](\d\d)([^d]\d\d)?$/);
    if (!match) {
      console.debug("Can't parse time:", timeStr);
      return;
    }
    const seconds = match[2];
  }

  const observer = new MutationObserver(onMutation);
  observer.observe(timeEl, {childList: true})
}

main();
