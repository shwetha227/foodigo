# Foodigo - Online Food Delivery Website

This project is an online food delivery platform built with HTML, CSS, JavaScript for the frontend, and Node.js with Express.js for the backend. MySQL is used as the database.

## Project Structure

```
/
├── public/              # Frontend files (HTML, CSS, JS)
│   ├── index.html       # Welcome page (role selection)
│   ├── login.html       # Login/Signup page
│   ├── customer_dashboard.html # Page for customers to view restaurants
│   ├── style.css        # Main stylesheet
│   └── script.js        # Main JavaScript for frontend logic
├── server/              # Backend files
│   └── server.js        # Main Express.js server application
├── database/
│   └── schema.sql       # MySQL database schema definitions
├── package.json         # Node.js project metadata and dependencies
└── README.md            # This file
```

## Features (Planned)

*   User role selection (Customer, Restaurant, Delivery Partner).
*   User authentication (Signup and Login) for each role.
*   Customers can view a list of restaurants (at least 20) and their menus (at least 5 items per restaurant).
*   Restaurant owners can manage their restaurant details and menu items (TODO).
*   Delivery partners can manage their availability and deliveries (TODO).
*   Responsive design for accessibility on various devices.

## Prerequisites

*   Node.js and npm (or yarn)
*   MySQL Server

## Setup and Running the Project

1.  **Clone the repository (if applicable).**

2.  **Database Setup:**
    *   Ensure your MySQL server is running.
    *   Connect to your MySQL server and create the database. You can use the `CREATE DATABASE foodigo_db;` command (or similar, see `database/schema.sql`).
    *   Execute the `database/schema.sql` script to create the necessary tables. You can do this via a MySQL client (e.g., MySQL Workbench, DBeaver, or the `mysql` command-line tool):
        ```bash
        mysql -u your_mysql_user -p foodigo_db < database/schema.sql
        ```
    *   **Important:** Update the database connection details (username, password) in `server/server.js` (currently commented out placeholder).

3.  **Install Backend Dependencies:**
    Navigate to the project root directory in your terminal and run:
    ```bash
    npm install
    ```
    or if you prefer yarn:
    ```bash
    yarn install
    ```

4.  **Configure Backend:**
    *   Open `server/server.js` and update the MySQL connection details within the commented-out `db.createConnection` block with your actual MySQL username, password, and ensure the database name matches what you created (e.g., `foodigo_db`).

5.  **Run the Application:**
    *   To start the server:
        ```bash
        npm start
        ```
    *   For development with automatic server restart on file changes (using nodemon):
        ```bash
        npm run dev
        ```
    The application should then be accessible at `http://localhost:3000` (or the port specified in `server.js`).

## Next Steps & TODO

*   Implement actual database interaction in `server/server.js` for:
    *   User signup (hashing passwords, inserting into correct tables).
    *   User login (querying users, comparing passwords, session/token management).
    *   Fetching restaurant and food item data from the database.
*   Connect frontend forms (`public/script.js`) to backend API endpoints (`/signup`, `/login`, `/api/restaurants`).
*   Develop dashboards and functionality for Restaurant and Delivery Partner roles.
*   Implement order placement and management.
*   Add input validation and error handling on both frontend and backend.
*   Enhance security (e.g., password hashing with bcrypt, input sanitization, HTTPS).
*   Refine UI/UX. 