import { getStorage } from "./storage.js";

export const DEFAULT_OPTIONS = {
  alertTimes: [45, 30, 15, 10, 5, 2],
  voiceName: null,
}

export function getOptions() {
  return getStorage(DEFAULT_OPTIONS);
}

export function speak(text, voice) {
  console.log(`Speaking: ${text}`);
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  speechSynthesis.speak(utterance);
}

export function voicePredicate(voiceName) {
  return voiceName ?
    (voice) => voice.name === voiceName :
    (voice) => voice.default
}

export function getVoices() {
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
