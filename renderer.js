document.addEventListener('DOMContentLoaded', async () => {
    const body = document.body;
    const lightModeButton = document.getElementById('light-mode-button');
    const darkModeButton = document.getElementById('dark-mode-button');

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

    // Theme switching event listeners
    lightModeButton.addEventListener('click', () => {
        setLightMode();
        window.electron.ipcRenderer.send('set-theme', 'light');
    });

    darkModeButton.addEventListener('click', () => {
        setDarkMode();
        window.electron.ipcRenderer.send('set-theme', 'dark');
    });

    document.querySelector('.forgot-password').addEventListener('click', (event) => {
        event.preventDefault();
        if (window.electron) {
            window.electron.navigate('forgotten-password');
        }
    });

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

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.json();

            if (result.message === 'Login successful') {
                // Handle login success
            } else {
                document.getElementById('error-notification').style.display = 'flex';
            }
        } catch (error) {
            document.getElementById('error-notification').style.display = 'flex';
        }
    });

    document.querySelector('.close-button').addEventListener('click', () => {
        document.getElementById('error-notification').style.display = 'none';
    });

    document.querySelector('.back-button').addEventListener('click', () => {
        if (window.electron) {
            window.electron.navigate('home');
        } else {
            window.location.href = 'index.html'; // Fallback for non-Electron environments
        }
    });
});
