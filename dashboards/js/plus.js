document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const lightModeButton = document.getElementById('light-mode-button-sidebar');
    const darkModeButton = document.getElementById('dark-mode-button-sidebar');
    const signOutButton = document.querySelector('.sign-out');
    const navLinks = document.querySelectorAll('.nav-links a');
    const mainContent = document.querySelector('.main-content');
    const clientList = document.querySelector('.client-list');

    // Function to fetch client data from the server
    async function fetchClientData() {
        try {
            const response = await fetch('http://213.165.84.44:3000/clients');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching client data:', error);
        }
    }

    // Function to update the client list and client counter
    async function updateClientList() {
        try {
            const clients = await fetchClientData();
            if (clients) {
                // Update the client counter
                document.getElementById('current-clients').textContent = clients.length;

                // Update the client list display
                if (clientList) {
                    clientList.innerHTML = clients.map(client => `<div>${client.firstName}</div>`).join('');
                }
            }
        } catch (error) {
            console.error('Error updating client list:', error);
        }
    }

    // Function to update the main content box
    function updateContent(contentId) {
        let headerText = '';
        let contentHTML = '';

        switch(contentId) {
            case 'dashboard':
                headerText = 'Dashboard';
                contentHTML = `
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
                break;
            case 'clients':
                headerText = 'Clients';
                contentHTML = `
                    <div class="client-counter">
                        <p>Current Clients: <span id="current-clients">0</span> / 150</p>
                    </div>
                    <div class="client-list"></div>
                `;
                updateClientList(); // Fetch and display client data
                break;
            case 'payments':
                headerText = 'Payments';
                contentHTML = `
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
                break;
            case 'projects':
                headerText = 'Projects';
                contentHTML = `
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
                `
                break;
            case 'time-tracking':
                headerText = 'Time Tracking';
                contentHTML = `
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
                `
                break;
            default:
                headerText = 'Welcome Back, John Doe.';
                contentHTML = `
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

        mainContent.innerHTML = `
            <h1>${headerText}</h1>
            ${contentHTML}
        `;

        // Ensure client list is updated when clients section is loaded
        if (contentId === 'clients') {
            updateClientList();
        }
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
