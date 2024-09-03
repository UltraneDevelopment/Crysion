document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const lightModeButton = document.getElementById('light-mode-button-sidebar');
    const darkModeButton = document.getElementById('dark-mode-button-sidebar');
    const signOutButton = document.querySelector('.sign-out');
    const navLinks = document.querySelectorAll('.nav-links a');
    const mainContent = document.querySelector('.main-content');
    const clientList = document.querySelector('.client-list');
    const closeBtn = document.getElementById('close-button');
    const minimizeBtn = document.getElementById('minimize-button');
    const maximizeBtn = document.getElementById('maximize-button');
    const addClientBtn = document.getElementById('add-client-btn');

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

    async function fetchSession() {
        try {
            const session = await window.electron.getSession();
            console.log('Fetched session:', session); // Debugging line
            if (!session || !session.token) {
                throw new Error('No session token found.');
            }
            return session.token;
        } catch (error) {
            console.error('Error fetching session:', error);
            window.electron.navigate('index.html'); // Redirect to sign-in page
        }
    }

    async function makeAuthenticatedRequest(url, options = {}) {
        const token = await fetchSession();
        console.log('Using token:', token); // Debugging line
        if (!token) {
            throw new Error('No session token found.');
        }

        options.headers = {
            ...options.headers,
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };

        try {
            const response = await fetch(url, options);
            console.log('Response:', response); // Debugging line
            if (response.status === 401) {
                throw new Error('Unauthorized. Redirecting to sign-in.');
            }
            return response;
        } catch (error) {
            console.error('Error making authenticated request:', error);
            errorNotification.classList.add('show');
            window.electron.navigate('index.html');
        }
    }

    async function fetchClientData() {
        try {
            const response = await makeAuthenticatedRequest('http://213.165.84.44:3000/clients');
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            const data = await response.json();
            console.log('Fetched client data:', data); // Debugging line
            return data.clients; // Access clients array directly
        } catch (error) {
            console.error('Error fetching client data:', error);
        }
    }

    async function updateClientList() {
        try {
            const clients = await fetchClientData();
            const clientCounterElement = document.getElementById('current-clients');
            if (clientCounterElement) {
                clientCounterElement.textContent = clients.length;
            }
    
            const clientListElement = document.querySelector('.client-list');
            if (clientListElement) {
                clientListElement.innerHTML = clients.map(client => `
                    <div class="client-card">
                        <p><strong>Name:</strong> ${client.client_firstname} ${client.client_surname}</p>
                        <p>
                            <button class="info-button" data-type="email" data-info="${client.client_email}">Show Email</button>
                            <button class="info-button" data-type="phone" data-info="${client.client_phonenumber}">Show Phone Number</button>
                        </p>
                    </div>
                `).join('');
    
                // Check if the button already exists
                if (!document.getElementById('open-new-client-modal')) {
                    // Add the button to open the new client modal
                    document.querySelector('.main-content').insertAdjacentHTML('beforeend', `
                        <button id="open-new-client-modal" class="open-modal-button">Add New Client</button>
                    `);
    
                    // Attach click event listener to the "Add New Client" button
                    document.getElementById('open-new-client-modal').addEventListener('click', () => {
                        document.getElementById('newClientModal').classList.add('show');
                        document.getElementById('newClientModal-overlay').classList.add('show');
                    });
                }
    
                // Inject modal HTML only if it doesn't exist
                if (!document.getElementById('newClientModal')) {
                    document.body.insertAdjacentHTML('beforeend', `
                        <div id="newClientModal-overlay" class="modal-overlay"></div>
                        <div id="newClientModal" class="modal">
                            <div class="modal-header">
                                <h2>Add New Client</h2>
                            </div>
                            <div class="modal-body">
                                <form id="newClientForm">
                                    <div class="form-group">
                                        <label for="first_name">First Name:</label>
                                        <input type="text" id="first_name" name="first_name" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="surname">Surname:</label>
                                        <input type="text" id="surname" name="surname" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="email">Email:</label>
                                        <input type="email" id="email" name="email" required>
                                    </div>
                                    <div class="form-group">
                                        <label for="phone">Phone:</label>
                                        <input type="tel" id="phone" name="phone" required>
                                    </div>
                                    <div class="form-actions">
                                        <button type="submit">Submit</button>
                                        <button type="button" id="cancel-new-client">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    `);
                }
    
                // Attach click event listener to the cancel button
                document.getElementById('cancel-new-client').addEventListener('click', () => {
                    document.getElementById('newClientModal').classList.remove('show');
                    document.getElementById('newClientModal-overlay').classList.remove('show');
                });
    
                // Attach click event listener to the overlay to close modal when clicking outside
                document.getElementById('newClientModal-overlay').addEventListener('click', () => {
                    document.getElementById('newClientModal').classList.remove('show');
                    document.getElementById('newClientModal-overlay').classList.remove('show');
                });
    
                // Attach submit event listener to the form
                document.getElementById('newClientForm').addEventListener('submit', async (event) => {
                    event.preventDefault();
                    const formData = new FormData(event.target);
                    const newClientData = {
                        first_name: formData.get('first_name'),
                        surname: formData.get('surname'),
                        email: formData.get('email'),
                        phone: formData.get('phone')
                    };
    
                    // Check for duplicates by email and phone
                    const existingClientEmails = clients.map(client => client.client_email);
                    const existingClientPhones = clients.map(client => client.client_phonenumber);
                    if (existingClientEmails.includes(newClientData.email) || existingClientPhones.includes(newClientData.phone)) {
                        alert('A client with this email or phone number already exists.');
                        return;
                    }
    
                    try {
                        const response = await makeAuthenticatedRequest('http://213.165.84.44:3000/clients', {
                            method: 'POST',
                            body: JSON.stringify(newClientData)
                        });
    
                        if (!response.ok) {
                            throw new Error('Failed to add client');
                        }
    
                        // Close the modal and update the client list
                        document.getElementById('newClientModal').classList.remove('show');
                        document.getElementById('newClientModal-overlay').classList.remove('show');
                        await updateClientList();
                    } catch (error) {
                        console.error('Error adding client:', error);
                    }
                });
    
                // Attach click event listeners to all info buttons
                document.querySelectorAll('.info-button').forEach(button => {
                    console.log('Attaching event listener to button:', button); // Debug log
                    button.addEventListener('click', (event) => {
                        const type = button.getAttribute('data-type');
                        const info = button.getAttribute('data-info');
                        
                        // Ensure modal elements exist
                        const modalHeader = document.querySelector('#modal-header');
                        const modalContent = document.querySelector('#modal-content');
                        const modal = document.querySelector('#modal');
                        const modalOverlay = document.querySelector('#modal-overlay');
                        const copyModal = document.querySelector('#copy-modal');
    
                        if (modalHeader && modalContent && modal && modalOverlay && copyModal) {
                            // Set modal content and header
                            modalHeader.textContent = type === 'email' ? 'Email' : 'Phone Number';
                            modalContent.textContent = info;
                            
                            // Show the modal
                            modal.classList.add('show');
                            modalOverlay.classList.add('show');
                            
                            // Reset the modal to its default state
                            copyModal.style.display = 'block';
                            modalHeader.textContent = type === 'email' ? 'Email' : 'Phone Number';
                            modalContent.textContent = info;
                        } else {
                            console.error('Modal elements not found');
                        }
                    });
                });
    
                // Attach click event listener to the close button
                document.querySelector('#close-modal').addEventListener('click', () => {
                    document.querySelector('#modal').classList.remove('show');
                    document.querySelector('#modal-overlay').classList.remove('show');
                });
    
                // Attach click event listener to the copy button
                document.querySelector('#copy-modal').addEventListener('click', () => {
                    const content = document.querySelector('#modal-content').textContent;
                    navigator.clipboard.writeText(content).then(() => {
                        // Change modal content and header after copying
                        document.querySelector('#modal-header').textContent = 'Copied!';
                        document.querySelector('#modal-content').textContent = 'Copied to clipboard';
                        document.querySelector('#copy-modal').style.display = 'none'; // Hide the copy button
                    }).catch(err => {
                        console.error('Failed to copy: ', err);
                    });
                });
    
                // Attach click event listener to the overlay to close modal when clicking outside
                document.querySelector('#modal-overlay').addEventListener('click', () => {
                    document.querySelector('#modal').classList.remove('show');
                    document.querySelector('#modal-overlay').classList.remove('show');
                });
            }
        } catch (error) {
            console.error('Error updating client list:', error);
        }
    }

    // Function to update the main content box
    async function updateContent(contentId) {
        let headerText = '';
        let contentHTML = '';

        switch (contentId) {
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
                        <div id="modal-overlay" class="modal-overlay"></div>
                        <div id="modal" class="modal">
                            <div class="modal-header">
                                <h2 id="modal-header">Header</h2>
                            </div>
                            <div class="modal-body">
                                <p id="modal-content">Content</p>
                                <button id="copy-modal">Copy</button>
                                <button id="close-modal">Close</button>
                            </div>
                        </div>
                    `;
                    document.querySelector('.main-content').innerHTML = contentHTML;
                    await updateClientList(); // Ensure async update
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
                `;
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
                `;
                break;
            case 'reports':
                headerText = 'Reports';
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
            case 'accounting':
                headerText = 'Accounting';
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
            case 'inbox':
                headerText = 'Inbox';
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
            case 'profile':
                headerText = 'Profile';
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
            case 'team':
                headerText = 'Team';
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
            case 'settings':
                headerText = 'Settings';
                contentHTML = `
                `;
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
            await updateClientList(); // Ensure async update
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

    document.addEventListener("DOMContentLoaded", function () {
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