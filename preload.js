const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  // General IPC methods
  ipcRenderer: {
    send: (channel, ...args) => ipcRenderer.send(channel, ...args),
    on: (channel, listener) => ipcRenderer.on(channel, listener),
    removeListener: (channel, listener) => ipcRenderer.removeListener(channel, listener),
  },

  // Method to set preferences
  setPreferences: (preferences) => ipcRenderer.invoke('set-preferences', preferences),

  // Method to navigate between pages
  navigate: (page) => ipcRenderer.send('navigate', page),

  // Method to handle theme change from main process
  setTheme: (callback) => ipcRenderer.on('set-theme', callback),

  // Method to get preferences
  getPreferences: () => ipcRenderer.invoke('get-preferences'),

  // Method to invalidate sessions
  invalidateSession: () => ipcRenderer.send('invalidate-session'),

  // Method to send back to sign in

  navigateToSignIn: () => ipcRenderer.invoke('navigate-to-sign-in'),

  // External URL handling
  shell: {
    openExternal: (url) => ipcRenderer.invoke('open-external', url)
  }
});

// Expose app version
contextBridge.exposeInMainWorld('electronAPI', {
  onVersion: (callback) => ipcRenderer.on('app-version', (event, version) => callback(version))
});
