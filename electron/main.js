const {
  app,
  BrowserWindow,
  clipboard,
  ipcMain,
  nativeImage,
  protocol,
  net,
} = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");

const DEV_URL = "http://127.0.0.1:3000";
const POLL_MS = 500;
const COOLDOWN_MS = 800;
const MAX_IMAGE_PIXELS = 4_000_000;

protocol.registerSchemesAsPrivileged([
  {
    scheme: "histclip",
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      stream: true,
    },
  },
]);

/** @type {BrowserWindow | null} */
let mainWindow = null;
let lastText = "";
let lastImageKey = "";
let coolUntil = 0;
/** @type {ReturnType<typeof setInterval> | null} */
let pollTimer = null;

function isDev() {
  return !app.isPackaged;
}

function outRoot() {
  return path.join(app.getAppPath(), "out");
}

function registerStaticProtocol() {
  protocol.handle("histclip", (request) => {
    const { pathname } = new URL(request.url);
    let rel = decodeURIComponent(pathname);
    if (rel === "/" || rel === "") rel = "/index.html";
    const filePath = path.join(outRoot(), rel.replace(/^\//, ""));
    return net.fetch(pathToFileURL(filePath).href);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 480,
    height: 720,
    title: "历史粘贴板",
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  if (isDev()) {
    mainWindow.loadURL(DEV_URL);
  } else {
    mainWindow.loadURL("histclip://localhost/index.html");
  }

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

function emitItem(item) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("clipboard:item", item);
}

function imageKey(img) {
  if (!img || img.isEmpty()) return "";
  const { width, height } = img.getSize();
  return `${width}x${height}:${img.toBitmap().length}`;
}

function pollClipboard() {
  if (!mainWindow || mainWindow.isDestroyed()) return;
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
      emitItem({
        type: "image",
        dataUrl: img.toDataURL(),
        at: Date.now(),
      });
    }
  }
}

function startClipboardPoll() {
  if (pollTimer) return;
  pollTimer = setInterval(pollClipboard, POLL_MS);
}

function armCooldown(text, imgKey) {
  coolUntil = Date.now() + COOLDOWN_MS;
  if (typeof text === "string") lastText = text;
  if (typeof imgKey === "string") lastImageKey = imgKey;
}

ipcMain.handle("clipboard:writeText", (_e, text) => {
  if (typeof text !== "string" || !text) return false;
  clipboard.writeText(text);
  armCooldown(text, undefined);
  return true;
});

ipcMain.handle("clipboard:writeImage", (_e, dataUrl) => {
  if (typeof dataUrl !== "string" || !dataUrl) return false;
  const img = nativeImage.createFromDataURL(dataUrl);
  if (img.isEmpty()) return false;
  clipboard.writeImage(img);
  armCooldown(undefined, imageKey(img));
  return true;
});

ipcMain.handle("settings:getOpenAtLogin", () => {
  return app.getLoginItemSettings().openAtLogin;
});

ipcMain.handle("settings:setOpenAtLogin", (_e, enabled) => {
  app.setLoginItemSettings({
    openAtLogin: Boolean(enabled),
    path: process.execPath,
  });
  return app.getLoginItemSettings().openAtLogin;
});

app.whenReady().then(() => {
  if (!isDev()) registerStaticProtocol();
  createWindow();
  startClipboardPoll();

  // 首次打包运行：默认开启开机自启
  if (app.isPackaged) {
    const { openAtLogin, wasOpenedAtLogin } = app.getLoginItemSettings();
    if (!openAtLogin && !wasOpenedAtLogin) {
      // 仅当用户尚未配置时默认打开；用 userData 标记避免每次重置
      const fs = require("fs");
      const flag = path.join(app.getPath("userData"), "login-defaulted");
      if (!fs.existsSync(flag)) {
        app.setLoginItemSettings({ openAtLogin: true, path: process.execPath });
        fs.writeFileSync(flag, "1");
      }
    }
  }

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
      startClipboardPoll();
    }
  });
});

app.on("window-all-closed", () => {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (process.platform !== "darwin") app.quit();
});
