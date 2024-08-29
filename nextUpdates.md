# Notes for v1.2.8

# Next Updates To Do (Quick Notes)

- Setup backend client database for the client panel on dashboard 

    - Database Setup [DONE]
    - server.js Setup (API) [NOT STARTED]

- Setup backend integration with frontend (software) for clients to be shown on dashboard [Work In Progress]
- Add current clients / maximum clients to clients panel [Work In Progress]
- Add feature to add new clients onto the database from the frontend 
- Begin development on the settings tab (both front and backend) so users can customise their experience, integrate other services
    (stripe .etc.) as needed.

# Next Updates To Do (In Detail)

- The backend database does not show on GitHub but is required for the second part of the update.
- Setup integration with the backend to automatically fetch clients and create the boxes required to present the user with all of the data,
    this should happen in the background before the clients tab is opened, alternatively, a loading screen can be implemented onto the client
    part of this page until all clients have been loaded from the database.
- To allow users to see whether they are at the maximum clients easier, a counter should be added onto the clients side of the dashboard, which
    should show clearly how close they are to reaching their maximum.
- Allow the user to add a new client onto the dashboard, whilst simultaneously checking if the user has maxed out the number of clients their plan
    allows (this is the plus plan, so 150 clients maximum).
- Setup the settings tab to allow users to integrate stripe .etc. which will be required in update v1.3 where the majority of the sidebar will be
    completed, including accounting and payments, allowing for everything to be done within Crysion. Integration methods should not yet be introduced,
    but the software should be ready for it.

# Long Term Aims (As of 19th August 2024)

- Finish Computer Software Development (3 months potentially)
- Finish Backend Configuration with Cross Platform Support (3-5 months potentialy)
- Begin Mobile App Development (4 Months Minimum)
- Ensure Backend is Working w/ Mobile Apps (6 Months Minimum)
- Finish Mobile App Development (7 Months Minimum)
- Launch! (8-12 Months)