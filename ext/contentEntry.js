// Dynamically import the main script as a module.
// This allows us to use static imports in the main script.
// See https://stackoverflow.com/questions/48104433/how-to-import-es6-modules-in-content-script-for-chrome-extension
import("./content.js");
