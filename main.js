const { app, BrowserWindow, ipcMain, nativeTheme } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;

// Path to preferences file in the user's data directory
const preferencesPath = path.join(app.getPath('userData'), 'preferences.json');

// Default preferences
const defaultPreferences = {
  theme: 'light',
};

// Function to read preferences from the file
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

// Function to write preferences to the file
function writePreferences(preferences) {
  try {
    fs.writeFileSync(preferencesPath, JSON.stringify(preferences, null, 2));
  } catch (err) {
    console.error('Error writing preferences:', err);
  }
}

// Function to apply the theme to the page
function applyThemeToPage() {
  const preferences = readPreferences();
  mainWindow.webContents.send('set-theme', preferences.theme);
}

function createWindow() {
  const initialWidth = 1440;
  const initialHeight = 960;

  mainWindow = new BrowserWindow({
    width: initialWidth,
    height: initialHeight,
    minWidth: initialWidth,
    minHeight: initialHeight,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    },
  });

  mainWindow.loadFile('index.html');

  mainWindow.webContents.on('did-finish-load', () => {
    applyThemeToPage();
  });

  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    const csp =
      "default-src 'self'; " +
      "script-src 'self' 'unsafe-eval' 'unsafe-inline'; " +
      "connect-src 'self' http://213.165.84.44:3000; " +
      "font-src 'self' https://fonts.gstatic.com; " +
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
      "frame-src 'none'; " +
      "object-src 'none'; " +
      "base-uri 'self'; " +
      "form-action 'self';";
    callback({
      responseHeaders: Object.assign(
        {
          'Content-Security-Policy': [csp],
        },
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

  // Update theme when the native theme is updated
  nativeTheme.on('updated', applyThemeToPage);
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Listen for theme change from renderer process
ipcMain.handle('get-preferences', async () => {
  return readPreferences();
});

ipcMain.handle('set-preferences', async (event, preferences) => {
  writePreferences(preferences);
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
