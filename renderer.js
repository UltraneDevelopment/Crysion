document.addEventListener('DOMContentLoaded', async () => {
  const body = document.body;
  const lightModeButton = document.getElementById('light-mode-button');
  const darkModeButton = document.getElementById('dark-mode-button');
  const settingsIcon = document.querySelector('.settings-icon');
  const overlay = document.getElementById('overlay');
  const settingsSidebar = document.querySelector('.settings-sidebar');
  const stylesSidebar = document.querySelector('.styles-sidebar');
  const stylesButton = document.getElementById('styles-button');
  const getSupportButton = document.getElementById('get-support-button');
  const lightModeButtonSidebar = document.getElementById('light-mode-button-sidebar');
  const darkModeButtonSidebar = document.getElementById('dark-mode-button-sidebar');
  const closeSettingsSidebar = document.getElementById('close-settings-sidebar');

  // Sidebar

  function toggleSidebar() {
      settingsSidebar.classList.toggle('show');
      overlay.classList.toggle('show');
      console.log('Settings icon clicked')
  }

  function toggleStylesSidebar() {
      stylesSidebar.classList.toggle('show');
  }

  settingsIcon.addEventListener('click', toggleSidebar);

  overlay.addEventListener('click', () => {
      if (settingsSidebar.classList.contains('show')) {
          toggleSidebar();
      }
      if (stylesSidebar.classList.contains('show')) {
          toggleStylesSidebar();
      }
  });

  stylesButton.addEventListener('click', toggleStylesSidebar);

  getSupportButton.addEventListener('click', () => {
      window.open('https://www.crysion.com/support', '_blank');
      toggleSidebar();
      
  });

  lightModeButtonSidebar.addEventListener('click', () => {
      setLightMode();
      toggleStylesSidebar();
      toggleSidebar();
  });

  darkModeButtonSidebar.addEventListener('click', () => {
      setDarkMode();
      toggleStylesSidebar();
      toggleSidebar();
  });

  closeSettingsSidebar.addEventListener('click', () => {
    toggleSidebar(); // Close the sidebar
  });

  // Application of Styles

  function setLightMode() {
      body.classList.remove('dark-mode');
      body.classList.add('light-mode');
      lightModeButton.classList.add('active');
      darkModeButton.classList.remove('active');
      window.electron.setPreferences({ theme: 'light' });
  }

  function setDarkMode() {
      body.classList.remove('light-mode');
      body.classList.add('dark-mode');
      darkModeButton.classList.add('active');
      lightModeButton.classList.remove('active');
      window.electron.setPreferences({ theme: 'dark' });
  }

  // Fetching Saved Preferences (Styles) & Applying

  if (window.electron) {
      const preferences = await window.electron.getPreferences();
      const initialTheme = preferences.theme || 'light';
      if (initialTheme === 'dark') {
          setDarkMode();
      } else {
          setLightMode();
      }
  }

  // Changing Current Style

  lightModeButton.addEventListener('click', () => {
      setLightMode();
      window.electron.ipcRenderer.send('set-theme', 'light');
  });

  darkModeButton.addEventListener('click', () => {
      setDarkMode();
      window.electron.ipcRenderer.send('set-theme', 'dark');
  });

  // Forgot Password

  document.querySelector('.forgot-password').addEventListener('click', (event) => {
      event.preventDefault();
      if (window.electron) {
          window.electron.navigate('forgotten-password');
      }
  });

  // Sign In Button & Server Request

  document.querySelector('.sign-in-button').addEventListener('click', async (event) => {
      event.preventDefault();

      const email = document.querySelector('#email').value;
      const password = document.querySelector('#password').value;

      try {
          const response = await fetch('http://213.165.84.44:3000/login', {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ email, password })
          });

          // Sign In Server Result Handling & Error Notification

          if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
          }

          const result = await response.json();

          if (result.message === 'Login successful') {
              // Handle login success
          } else {
              document.getElementById('error-notification').classList.add('show');
          }
      } catch (error) {
          document.getElementById('error-notification').classList.add('show');
      }
  });

  document.querySelector('.close-button').addEventListener('click', () => {
      document.getElementById('error-notification').classList.remove('show');
  });

  document.querySelector('.back-button').addEventListener('click', () => {
      if (window.electron) {
          window.electron.navigate('home');
      } else {
          window.location.href = 'index.html';
      }
  });
});
