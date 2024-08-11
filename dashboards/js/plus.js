document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const lightModeButton = document.getElementById('light-mode-button-sidebar');
    const darkModeButton = document.getElementById('dark-mode-button-sidebar');

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
    if (window.electron) {
        window.electron.getPreferences().then(preferences => {
            const initialTheme = preferences.theme || 'light';
            if (initialTheme === 'dark') {
                setDarkMode();
            } else {
                setLightMode();
            }
        });
    }
});
