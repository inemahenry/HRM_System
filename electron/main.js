const { app, BrowserWindow } = require("electron");
const path = require("path");

function createWindow() {
    const win = new BrowserWindow({
        width: 1400,
        height: 900,
        minWidth: 1100,
        minHeight: 700,
        autoHideMenuBar: false,
        icon: path.join(__dirname, "../assets/logo.ico"),
        title: "Hallmark Residences | HRMS",
        webPreferences: {
            preload: path.join(__dirname, "preload.js"),
        },
    });

   const isDev = !app.isPackaged;

if (isDev) {
    win.loadURL("http://localhost:5173");
} else {
    win.loadFile(
        path.join(__dirname, "../frontend/dist/index.html")
    );
}
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});