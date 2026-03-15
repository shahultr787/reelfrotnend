/**
 * utils/fingerprint.js
 *
 * Generates browser fingerprint + bot detection signals
 * Lightweight and compatible with all browsers
 */

export const getFingerprint = () => {
  try {

    const data = [
      navigator.userAgent,
      navigator.language,
      navigator.platform,
      window.screen.width,
      window.screen.height,
      window.screen.colorDepth,
      navigator.hardwareConcurrency || "unknown",
      navigator.deviceMemory || "unknown",
      new Date().getTimezoneOffset()
    ].join("::");

    return btoa(data); // base64 fingerprint

  } catch {
    return "unknown_device";
  }
};


/**
 * Detect bot / automation browsers
 * (Selenium, Puppeteer, headless browsers)
 */

export const getBotSignals = () => {

  try {

    return {
      webdriver: navigator.webdriver || false,
      headless: /HeadlessChrome/.test(navigator.userAgent),
      pluginsLength: navigator.plugins ? navigator.plugins.length : 0,
      languagesLength: navigator.languages ? navigator.languages.length : 0,
      hardwareConcurrency: navigator.hardwareConcurrency || 0
    };

  } catch {

    return {
      webdriver: false,
      headless: false,
      pluginsLength: 0,
      languagesLength: 0,
      hardwareConcurrency: 0
    };

  }

};