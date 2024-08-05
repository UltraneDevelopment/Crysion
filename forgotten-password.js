document.addEventListener('DOMContentLoaded', async () => {
  const body = document.body;
  const lightModeButton = document.getElementById('light-mode-button');
  const darkModeButton = document.getElementById('dark-mode-button');
  const backButton = document.getElementById('back-button');

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