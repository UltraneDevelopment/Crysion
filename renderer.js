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
    const closeButton = document.getElementById('close-button');
    const errorNotification = document.getElementById('error-notification');

    // Sidebar Functions
    function toggleSidebar() {
        settingsSidebar.classList.toggle('show');
        overlay.classList.toggle('show');
    }

    function toggleStylesSidebar() {
        stylesSidebar.classList.toggle('show');
    }

    // Event Listeners
    if (settingsIcon) {
        settingsIcon.addEventListener('click', toggleSidebar);
    } else {
        console.error('Settings icon not found.');
    }

    if (overlay) {
        overlay.addEventListener('click', () => {
            if (settingsSidebar.classList.contains('show')) {
                toggleSidebar();
            }
            if (stylesSidebar.classList.contains('show')) {
                toggleStylesSidebar();
            }
        });
    } else {
        console.error('Overlay not found.');
    }

    if (stylesButton) {
        stylesButton.addEventListener('click', toggleStylesSidebar);
    } else {
        console.error('Styles button not found.');
    }

    if (getSupportButton) {
        getSupportButton.addEventListener('click', () => {
            if (window.electron && window.electron.shell) {
                window.electron.shell.openExternal('https://www.crysion.com/support');
            } else {
                console.error('Electron shell module is not available.');
            }
        });
    } else {
        console.error('Get support button not found.');
    }

    if (lightModeButtonSidebar) {
        lightModeButtonSidebar.addEventListener('click', () => {
            setLightMode();
            toggleStylesSidebar();
            toggleSidebar();
        });
    } else {
        console.error('Light mode button sidebar not found.');
    }

    if (darkModeButtonSidebar) {
        darkModeButtonSidebar.addEventListener('click', () => {
            setDarkMode();
            toggleStylesSidebar();
            toggleSidebar();
        });
    } else {
        console.error('Dark mode button sidebar not found.');
    }

    if (closeSettingsSidebar) {
        closeSettingsSidebar.addEventListener('click', () => {
            toggleSidebar(); // Close the sidebar
        });
    } else {
        console.error('Close settings sidebar button not found.');
    }

    // Application of Styles
    function setLightMode() {
        body.classList.remove('dark-mode');
        body.classList.add('light-mode');
        if (lightModeButton) lightModeButton.classList.add('active');
        if (darkModeButton) darkModeButton.classList.remove('active');
        if (window.electron) {
            window.electron.setPreferences({ theme: 'light' });
        }
    }

    function setDarkMode() {
        body.classList.remove('light-mode');
        body.classList.add('dark-mode');
        if (darkModeButton) darkModeButton.classList.add('active');
        if (lightModeButton) lightModeButton.classList.remove('active');
        if (window.electron) {
            window.electron.setPreferences({ theme: 'dark' });
        }
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
    if (lightModeButton) {
        lightModeButton.addEventListener('click', () => {
            setLightMode();
            if (window.electron) {
                window.electron.ipcRenderer.send('set-theme', 'light');
            }
        });
    }

    if (darkModeButton) {
        darkModeButton.addEventListener('click', () => {
            setDarkMode();
            if (window.electron) {
                window.electron.ipcRenderer.send('set-theme', 'dark');
            }
        });
    }

    // Forgot Password
    const forgotPassword = document.querySelector('.forgot-password');
    if (forgotPassword) {
        forgotPassword.addEventListener('click', (event) => {
            event.preventDefault();
            if (window.electron) {
                window.electron.navigate('forgotten-password');
            }
        });
    } else {
        console.error('Forgot password element not found.');
    }

    // Sign In Button & Server Request
    const signInButton = document.querySelector('.sign-in-button');
    if (signInButton) {
        signInButton.addEventListener('click', async (event) => {
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
                    // Retrieve the plan type from the response
                    const userPlanType = result.planType;

                    console.log('User logged in with plan type:', userPlanType);

                    // Redirect user based on plan type
                    switch (userPlanType) {
                        case 'plus':
                            window.electron.navigate('plus-dashboard');
                            break;
                        case 'premium':
                            window.electron.navigate('premium-dashboard');
                            break;
                        case 'demo':
                            window.electron.navigate('demo-dashboard');
                            break;
                        case 'platinum':
                            window.electron.navigate('platinum-dashboard');
                            break;
                        default:
                            window.electron.navigate('home');
                            break;
                    }
                } else {
                    console.log('Login failed:', result);
                    errorNotification.classList.add('show');
                }
            } catch (error) {
                console.log('Error occurred:', error);
                errorNotification.classList.add('show');
            }
        });
    } else {
        console.error('Sign in button not found.');
    }

    // Close Error Notification
    if (closeButton) {
        closeButton.addEventListener('click', () => {
            console.log('Close button clicked');
            errorNotification.classList.remove('show');
        });
    } else {
        console.error('Close button for error notification not found.');
    }
});

// Package.json HTML Version
// Version Updates (Package.json To HTML Sidebar)
document.addEventListener('DOMContentLoaded', () => {
    window.electronAPI.onVersion((version) => {
        const versionElement = document.getElementById('app-version');
        if (versionElement) {
            versionElement.textContent = `Version: v${version}`;
        }
    });
});
