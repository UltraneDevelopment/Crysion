// sessionManager.js
const { session } = require('electron');

function clearSession() {
  session.defaultSession.clearStorageData({
    storages: ['cookies', 'localstorage']
  });
}

function setSession(sessionId) {
  // Implement the logic for setting session ID
  localStorage.setItem('sessionId', sessionId);
}

function getSession() {
  // Retrieve the session ID
  return localStorage.getItem('sessionId');
}

module.exports = { clearSession, setSession, getSession };
