import { getStorage } from "./storage.js";

export const DEFAULT_OPTIONS = {
  alertTimes: [45, 30, 15, 10, 5, 2],
  voiceName: null,
}

export function getOptions() {
  return getStorage(DEFAULT_OPTIONS);
}
