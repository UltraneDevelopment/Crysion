const { app, BrowserWindow, ipcMain, nativeTheme, shell, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const packageJson = require('./package.json');

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
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  const initialWidth = Math.round(width * 0.75);   // 75% of screen width
  const initialHeight = Math.round(height * 0.85); // 80% of screen height

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
      nodeIntegration: false
    },
  });

  mainWindow.loadFile('index.html');

  // Send Version Number

  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.send('app-version', packageJson.version);
});

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
    case 'plus-dashboard':
      filePath = path.join(__dirname, 'dashboards/plus-dashboard.html');
      break;
    case 'premium-dashboard':
      filePath = path.join(__dirname, 'dashboards/premium-dashboard.html');
      break;
    case 'demo-dashboard':
      filePath = path.join(__dirname, 'dashboards/demo-dashboard.html');
      break;
    case 'platinum-dashboard':
      filePath = path.join(__dirname, 'dashboards/platinum-dashboard.html');
      break;
    default:
      filePath = path.join(__dirname, 'index.html');
  }

  mainWindow.loadFile(filePath);
});

// External URL Open
ipcMain.handle('open-external', (event, url) => {
  shell.openExternal(url);
});
