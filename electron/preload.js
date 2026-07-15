const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("clipboardAPI", {
  onItem(callback) {
    if (typeof callback !== "function") return () => {};
    const listener = (_event, payload) => callback(payload);
    ipcRenderer.on("clipboard:item", listener);
    return () => ipcRenderer.removeListener("clipboard:item", listener);
  },
  writeText(text) {
    return ipcRenderer.invoke("clipboard:writeText", text);
  },
  writeImage(dataUrl) {
    return ipcRenderer.invoke("clipboard:writeImage", dataUrl);
  },
  getOpenAtLogin() {
    return ipcRenderer.invoke("settings:getOpenAtLogin");
  },
  setOpenAtLogin(enabled) {
    return ipcRenderer.invoke("settings:setOpenAtLogin", enabled);
  },
});
