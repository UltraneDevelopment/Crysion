document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const lightModeButton = document.getElementById('light-mode-button-sidebar');
    const darkModeButton = document.getElementById('dark-mode-button-sidebar');
    const signOutButton = document.querySelector('.sign-out');

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

    // Event listeners for theme buttons
    if (lightModeButton) {
        lightModeButton.addEventListener('click', setLightMode);
    }
    if (darkModeButton) {
        darkModeButton.addEventListener('click', setDarkMode);
    }

    // Fetching Saved Preferences (Styles) & Applying
    async function applyInitialTheme() {
        try {
            if (window.electron) {
                const preferences = await window.electron.getPreferences();
                const initialTheme = preferences.theme || 'light';
                if (initialTheme === 'dark') {
                    setDarkMode();
                } else {
                    setLightMode();
                }
            }
        } catch (error) {
            console.error('Error fetching preferences:', error);
        }
    }

    applyInitialTheme();

    // Sign Out Functionality
    if (signOutButton) {
        signOutButton.addEventListener('click', async () => {
            console.log('Sign out button clicked');
            try {
                if (window.electron) {
                    await window.electron.invalidateSession();
                    console.log('Session invalidated, navigating to sign-in page');
                    await window.electron.navigateToSignIn();
                    console.log('Successfully navigated to sign-in page');
                }
            } catch (error) {
                console.error('Error during sign-out process:', error);
            }
        });
    }
});
