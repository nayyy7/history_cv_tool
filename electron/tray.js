const { Tray, Menu, nativeImage, Notification, app } = require("electron");
const path = require("path");

/** @type {Tray | null} */
let tray = null;
let hintedOnce = false;

function loadTrayIcon() {
  const iconPath = path.join(__dirname, "assets", "tray.png");
  const img = nativeImage.createFromPath(iconPath);
  if (!img.isEmpty()) return img;
  // 兜底：16x16 浅粉像素
  return nativeImage.createFromDataURL(
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAGUlEQVQ4T2P8z8BQz0BFw8gwajDsYBg1GAYDAClpAwGdP1/mAAAAAElFTkSuQmCC",
  );
}

/**
 * @param {{ showWindow: () => void; quitApp: () => void }} handlers
 */
function createAppTray(handlers) {
  if (tray) return tray;

  tray = new Tray(loadTrayIcon());
  tray.setToolTip("历史粘贴板");
  tray.setContextMenu(
    Menu.buildFromTemplate([
      { label: "显示窗口", click: () => handlers.showWindow() },
      { type: "separator" },
      { label: "退出", click: () => handlers.quitApp() },
    ]),
  );

  tray.on("double-click", () => handlers.showWindow());
  tray.on("click", () => handlers.showWindow());
  return tray;
}

function notifyMinimizedToTray() {
  if (hintedOnce) return;
  hintedOnce = true;
  const flag = path.join(app.getPath("userData"), "tray-hinted");
  const fs = require("fs");
  if (fs.existsSync(flag)) return;
  try {
    fs.writeFileSync(flag, "1");
  } catch {
    /* ignore */
  }
  if (Notification.isSupported()) {
    new Notification({
      title: "历史粘贴板",
      body: "已在托盘继续运行，记录仍会保留。右键托盘图标可退出并清空。",
    }).show();
  }
}

function destroyTray() {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}

module.exports = { createAppTray, notifyMinimizedToTray, destroyTray };
