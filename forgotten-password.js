document.addEventListener('DOMContentLoaded', async () => {
  const body = document.body;
  const lightModeButton = document.getElementById('light-mode-button');
  const darkModeButton = document.getElementById('dark-mode-button');
  const backButton = document.getElementById('back-button');
  const closeBtn = document.getElementById('close-button');
  const minimizeBtn = document.getElementById('minimize-button');
  const maximizeBtn = document.getElementById('maximize-button');

  if (closeBtn) {
      closeBtn.addEventListener('click', () => {
          console.log('Close button clicked');
          window.electron.send('close-window');
      });
  }

  if (minimizeBtn) {
      minimizeBtn.addEventListener('click', () => {
          console.log('Minimize button clicked');
          window.electron.send('minimize-window');
      });
  }

  if (maximizeBtn) {
      maximizeBtn.addEventListener('click', () => {
          console.log('Maximize button clicked');
          window.electron.send('maximize-window');
      });
  }

  // Retrieve and apply the initial theme from stored preferences
  if (window.electron) {
    const preferences = await window.electron.getPreferences();
    const initialTheme = preferences.theme || 'light'; // Default to light if no preference is set
    if (initialTheme === 'dark') {
      setDarkMode();
    } else {
      setLightMode();
    }
  }

  // Function to set light mode
  function setLightMode() {
    body.classList.remove('dark-mode');
    body.classList.add('light-mode');
    lightModeButton.classList.add('active');
    darkModeButton.classList.remove('active');
    window.electron.setPreferences({ theme: 'light' });
  }

  // Function to set dark mode
  function setDarkMode() {
    body.classList.remove('light-mode');
    body.classList.add('dark-mode');
    darkModeButton.classList.add('active');
    lightModeButton.classList.remove('active');
    window.electron.setPreferences({ theme: 'dark' });
  }

  // Theme switching event listeners
  lightModeButton.addEventListener('click', () => {
    setLightMode();
    window.electron.ipcRenderer.send('set-theme', 'light');
  });

  darkModeButton.addEventListener('click', () => {
    setDarkMode();
    window.electron.ipcRenderer.send('set-theme', 'dark');
  });

  // Back button event listener
  if (backButton) {
    backButton.addEventListener('click', () => {
      window.electron.navigate('home');
    });
  }
});

// Prevent white flicker

app.disableHardwareAcceleration();