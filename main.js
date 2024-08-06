const { app, BrowserWindow, ipcMain, nativeTheme, shell } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
const preferencesPath = path.join(app.getPath('userData'), 'preferences.json');
const defaultPreferences = { theme: 'light' };

app.disableHardwareAcceleration();

function readPreferences() {
  try {
    if (fs.existsSync(preferencesPath)) {
      const data = fs.readFileSync(preferencesPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading preferences:', err);
  }
  return defaultPreferences;
}

function writePreferences(preferences) {
  try {
    fs.writeFileSync(preferencesPath, JSON.stringify(preferences, null, 2));
  } catch (err) {
    console.error('Error writing preferences:', err);
  }
}

function applyThemeToPage(theme) {
  if (theme === 'dark') {
    mainWindow.webContents.send('set-theme', 'dark');
    nativeTheme.themeSource = 'dark';
  } else {
    mainWindow.webContents.send('set-theme', 'light');
    nativeTheme.themeSource = 'light';
  }
}

function createWindow() {
  const initialWidth = 1440;
  const initialHeight = 960;

  mainWindow = new BrowserWindow({
    width: initialWidth,
    height: initialHeight,
    minWidth: initialWidth,
    minHeight: initialHeight,
    frame: true,
    autoHideMenuBar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');

  // Apply the saved theme on startup
  const preferences = readPreferences();
  applyThemeToPage(preferences.theme || 'light');

  mainWindow.webContents.on('did-finish-load', () => {
    applyThemeToPage(preferences.theme || 'light');
  });

  nativeTheme.on('updated', () => {
    applyThemeToPage(nativeTheme.themeSource);
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const csp = `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      connect-src 'self' http://213.165.84.44:3000;
      font-src 'self' https://fonts.gstatic.com;
      style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
      frame-src 'none';
      object-src 'none';
      base-uri 'self';
      form-action 'self';
    `;
    callback({
      responseHeaders: Object.assign(
        { 'Content-Security-Policy': [csp] },
        details.responseHeaders
      ),
    });
  });
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

ipcMain.handle('get-preferences', async () => {
  return readPreferences();
});

ipcMain.handle('set-preferences', async (event, preferences) => {
  writePreferences(preferences);
  applyThemeToPage(preferences.theme); // Apply the theme immediately
});

ipcMain.on('navigate', (event, page) => {
  let filePath = '';

  switch (page) {
    case 'forgotten-password':
      filePath = path.join(__dirname, 'forgotten-password.html');
      break;
    case 'home':
      filePath = path.join(__dirname, 'index.html');
      break;
    default:
      filePath = path.join(__dirname, 'index.html');
  }

  mainWindow.loadFile(filePath);
});

// External URL Open
ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url); // Ensure this function is correctly used to open the URL
});
