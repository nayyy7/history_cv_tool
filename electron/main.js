const {
  app,
  BrowserWindow,
  ipcMain,
  protocol,
  net,
} = require("electron");
const path = require("path");
const { pathToFileURL } = require("url");
const {
  createAppTray,
  notifyMinimizedToTray,
  destroyTray,
} = require("./tray");
const {
  startClipboardPoll,
  stopClipboardPoll,
  writeText,
  writeImage,
} = require("./clipboard-watch");

const DEV_URL = "http://127.0.0.1:3000";

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
let quitting = false;

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

function emitItem(item) {
  if (!mainWindow || mainWindow.isDestroyed()) return;
  mainWindow.webContents.send("clipboard:item", item);
}

function showWindow() {
  if (!mainWindow || mainWindow.isDestroyed()) {
    createWindow();
    return;
  }
  mainWindow.show();
  mainWindow.focus();
}

function quitApp() {
  quitting = true;
  destroyTray();
  app.quit();
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

  if (isDev()) mainWindow.loadURL(DEV_URL);
  else mainWindow.loadURL("histclip://localhost/index.html");

  mainWindow.on("close", (e) => {
    if (quitting) return;
    e.preventDefault();
    mainWindow.hide();
    notifyMinimizedToTray();
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

ipcMain.handle("clipboard:writeText", (_e, text) => writeText(text));
ipcMain.handle("clipboard:writeImage", (_e, dataUrl) => writeImage(dataUrl));

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
  startClipboardPoll(
    () => Boolean(mainWindow && !mainWindow.isDestroyed()),
    emitItem,
  );
  createAppTray({ showWindow, quitApp });

  if (app.isPackaged) {
    const { openAtLogin, wasOpenedAtLogin } = app.getLoginItemSettings();
    if (!openAtLogin && !wasOpenedAtLogin) {
      const fs = require("fs");
      const flag = path.join(app.getPath("userData"), "login-defaulted");
      if (!fs.existsSync(flag)) {
        app.setLoginItemSettings({ openAtLogin: true, path: process.execPath });
        fs.writeFileSync(flag, "1");
      }
    }
  }

  app.on("activate", () => showWindow());
});

app.on("before-quit", () => {
  quitting = true;
  stopClipboardPoll();
});

app.on("window-all-closed", () => {
  /* keep process alive for tray */
});
