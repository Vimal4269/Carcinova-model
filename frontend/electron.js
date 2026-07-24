const { app, BrowserWindow } = require('electron');
const http = require('http');
const path = require('path');

let mainWindow;

const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 1024,
    minHeight: 600,
    frame: true,
    backgroundColor: '#0A1628',
    icon: isDev ? path.join(__dirname, '..', 'Carcinova.ico') : path.join(__dirname, 'Carcinova.ico'),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  mainWindow.setMenuBarVisibility(false);

  if (isDev) {
    // Dev mode: load from Vite dev server
    mainWindow.loadURL('http://localhost:5174');
  } else {
    // Production mode: load built files
    mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

if (isDev) {
  // In dev mode, wait for Vite server
  function waitForVite(retries = 30) {
    http.get('http://localhost:5174', (res) => {
      app.whenReady().then(createWindow);
    }).on('error', () => {
      if (retries > 0) {
        setTimeout(() => waitForVite(retries - 1), 1000);
      }
    });
  }

  app.on('ready', () => {
    waitForVite();
  });
} else {
  // In production, just create the window
  app.on('ready', createWindow);
}

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
