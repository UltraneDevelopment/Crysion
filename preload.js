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

  // Method to invoke new session

  getSession: () => ipcRenderer.invoke('get-session'),

  // Method to set session

  setSession: (session) => ipcRenderer.invoke('set-session', session),

  // Method to invalidate session

  invalidateSession: () => ipcRenderer.invoke('invalidate-session'),

  // Method to send back to sign in

  navigateToSignIn: () => ipcRenderer.invoke('navigate-to-sign-in'),

  // External URL handling
  shell: {
    openExternal: (url) => ipcRenderer.invoke('open-external', url)
  },
  
  send: (channel, data) => {
    // Whitelist channels
    const validChannels = ['close-window', 'minimize-window', 'maximize-window'];
    if (validChannels.includes(channel)) {
        ipcRenderer.send(channel, data);
    }
},
receive: (channel, func) => {
    const validChannels = ['fromMain'];
    if (validChannels.includes(channel)) {
        // Deliberately strip event as it includes `sender` 
        ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
}
  
});

// Expose app version
contextBridge.exposeInMainWorld('electronAPI', {
  onVersion: (callback) => ipcRenderer.on('app-version', (event, version) => callback(version))
});
