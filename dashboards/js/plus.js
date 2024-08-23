document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const lightModeButton = document.getElementById('light-mode-button-sidebar');
    const darkModeButton = document.getElementById('dark-mode-button-sidebar');
    const signOutButton = document.querySelector('.sign-out');
    const navLinks = document.querySelectorAll('.nav-links a');
    const mainContent = document.querySelector('.main-content');
    
    // Function to update the main content box
    function updateContent(contentId) {
        let headerText = '';
        switch(contentId) {
            case 'dashboard':
                headerText = 'Dashboard';
                break;
            case 'clients':
                headerText = 'Clients';
                break;
            case 'payments':
                headerText = 'Payments';
                break;
            case 'projects':
                headerText = 'Projects';
                break;
            case 'time-tracking':
                headerText = 'Time Tracking';
                break;
            case 'reports':
                headerText = 'Reports';
                break;
            case 'accounting':
                headerText = 'Accounting';
                break;
            case 'inbox':
                headerText = 'Inbox';
                break;
            case 'profile':
                headerText = 'Profile';
                break;
            case 'team':
                headerText = 'Team';
                break;
            case 'settings':
                headerText = 'Settings';
                break;
            default:
                headerText = 'Welcome Back, John Doe.';
        }
        mainContent.innerHTML = `
            <h1>${headerText}</h1>
            <div class="card-container">
                <div class="card"></div>
                <div class="card"></div>
                <div class="card"></div>
                <div class="card"></div>
                <div class="card"></div>
                <div class="card"></div>
                <div class="card"></div>
                <div class="card"></div>
            </div>
        `;
    }

    // Function to set the active link
    function setActiveLink(clickedLink) {
        navLinks.forEach(link => link.classList.remove('active'));
        clickedLink.classList.add('active');
    }

    // Event listener for sidebar links
    navLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            const contentId = link.getAttribute('data-content');
            setActiveLink(link);
            updateContent(contentId);
        });
    });

    // Existing theme functionality
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

    if (lightModeButton) {
        lightModeButton.addEventListener('click', setLightMode);
    }
    if (darkModeButton) {
        darkModeButton.addEventListener('click', setDarkMode);
    }

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

    document.addEventListener("DOMContentLoaded", function() {
        OverlayScrollbars(document.querySelector(".sidebar"), {
            scrollbars: {
                visibility: "auto",
            },
            className: "os-theme-dark",
        });
    });

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
