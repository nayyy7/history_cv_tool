const { clipboard, nativeImage } = require("electron");

const POLL_MS = 500;
const COOLDOWN_MS = 800;
const MAX_IMAGE_PIXELS = 4_000_000;

let lastText = "";
let lastImageKey = "";
let coolUntil = 0;
/** @type {ReturnType<typeof setInterval> | null} */
let pollTimer = null;

function imageKey(img) {
  if (!img || img.isEmpty()) return "";
  const { width, height } = img.getSize();
  return `${width}x${height}:${img.toBitmap().length}`;
}

function armCooldown(text, imgKey) {
  coolUntil = Date.now() + COOLDOWN_MS;
  if (typeof text === "string") lastText = text;
  if (typeof imgKey === "string") lastImageKey = imgKey;
}

/**
 * @param {() => boolean} isAlive
 * @param {(item: object) => void} emitItem
 */
function startClipboardPoll(isAlive, emitItem) {
  if (pollTimer) return;
  pollTimer = setInterval(() => {
    if (!isAlive()) return;
    if (Date.now() < coolUntil) return;

    const text = clipboard.readText();
    if (text && text !== lastText) {
      lastText = text;
      emitItem({ type: "text", text, at: Date.now() });
    }

    const img = clipboard.readImage();
    const key = imageKey(img);
    if (key && key !== lastImageKey) {
      lastImageKey = key;
      const { width, height } = img.getSize();
      if (width * height > MAX_IMAGE_PIXELS) {
        emitItem({ type: "image", text: "图片过大", at: Date.now() });
      } else {
        emitItem({ type: "image", dataUrl: img.toDataURL(), at: Date.now() });
      }
    }
  }, POLL_MS);
}

function stopClipboardPoll() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
}

function writeText(text) {
  if (typeof text !== "string" || !text) return false;
  clipboard.writeText(text);
  armCooldown(text, undefined);
  return true;
}

function writeImage(dataUrl) {
  if (typeof dataUrl !== "string" || !dataUrl) return false;
  const img = nativeImage.createFromDataURL(dataUrl);
  if (img.isEmpty()) return false;
  clipboard.writeImage(img);
  armCooldown(undefined, imageKey(img));
  return true;
}

module.exports = {
  startClipboardPoll,
  stopClipboardPoll,
  writeText,
  writeImage,
};
