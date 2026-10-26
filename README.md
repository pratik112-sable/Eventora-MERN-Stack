# Eventora – Full-Stack Event Booking Platform

Eventora is a full-stack MERN application that allows users to browse events, register for events, and submit booking requests securely. It includes email OTP verification, role-based access control, an administrative dashboard, and email notifications.

Event organizers can create and manage free and paid events, review booking requests, confirm or reject bookings, and manually update payment statuses.

## Features

- **User Authentication:** Secure registration and login using JWT and bcrypt.
- **Email OTP Verification:** Email OTP verification during account activation and event booking.
- **Role-Based Access Control:**
  - **Admin:** Create, edit, and delete events; approve or reject booking requests; and update payment statuses.
  - **User:** Browse events, book tickets, view booking status, and cancel bookings.
- **Event Management:** Create free and paid events with descriptions, image URLs, dates, categories, and seating capacity.
- **Smart Booking System:** Booking requests enter a pending queue for admin verification, with seat availability validation to prevent overbooking.
- **Admin Analytics Dashboard:** Track pending requests, total revenue, and confirmed paid bookings.
- **Email Notifications:** Send booking confirmation emails using Nodemailer.
- **Modern UI/UX:** React, Tailwind CSS, and interactive UI elements.
- **Concurrent Development Servers:** Run the frontend and backend together from the project root using `concurrently`.

---

## Technology Stack

- **Frontend:** React, Tailwind CSS, Vite
- **Backend:** Node.js, Express.js
- **Database:** MongoDB, Mongoose
- **Authentication:** JWT, bcrypt
- **Email Service:** Nodemailer
- **OTP Verification:** Email-based OTP
- **Development Tool:** concurrently

---

## Setup Instructions

### Prerequisites

Install the following before running the application:

- [Node.js](https://nodejs.org/)
- npm (included with Node.js)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) or a local MongoDB instance

### 1. Configure Environment Variables

Create or update the `server/.env` file:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secure_jwt_secret
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
PORT=5000
```

**Important:** Use a Gmail App Password when your email configuration requires one. Never commit `.env` files or real credentials to GitHub.

### 2. Install Dependencies

Open a terminal in the Eventora project root:

```bash
npm install
npm run install:all
```

The `install:all` script should install dependencies in both the `server` and `client` directories. It must be defined in the root `package.json`.

If you prefer to install dependencies separately:

**Backend:**

```bash
cd server
npm install --legacy-peer-deps
```

**Frontend:**

```bash
cd client
npm install
```

### 3. Run Frontend and Backend Concurrently

From the Eventora root directory, execute:

```bash
npm run dev
```

This command starts both development servers together in a single terminal using the `concurrently` package.

- **Backend:** `http://localhost:5000`
- **Frontend:** Usually `http://localhost:5173`

The frontend and backend run as separate processes, but `concurrently` launches and manages both commands together. Keep the terminal open while developing.

### 4. How `concurrently` Works

`concurrently` is an npm package that allows multiple commands or processes to run at the same time.

In Eventora, it is used to start the backend Express server and frontend Vite development server simultaneously.

**Benefits:**

- Run frontend and backend using one command.
- Avoid opening two separate terminals during normal development.
- View output from both processes in the same terminal.
- Identify frontend or backend startup errors more easily.
- Stop the managed development processes together when the command is terminated.

### 5. Root `package.json` Configuration

Ensure the root `package.json` contains scripts similar to these:

```json
{
  "scripts": {
    "install:all": "npm install --prefix server --legacy-peer-deps && npm install --prefix client",
    "dev": "concurrently -k -n SERVER,CLIENT -c blue,green \"npm run dev --prefix server\" \"npm run dev --prefix client\"",
    "dev:all": "npm run install:all && npm run dev",
    "start": "concurrently -k -n SERVER,CLIENT \"npm run start --prefix server\" \"npm run preview --prefix client"
  },
  "devDependencies": {
    "concurrently": "^9.0.0"
  }
}
```

Install `concurrently` in the root project if it is not already installed:

```bash
npm install --save-dev concurrently
```

**Note:** The scripts above are example configurations. Check your existing root `package.json` and preserve its other dependencies and scripts. The backend must define the appropriate `dev` and `start` scripts, and the frontend must define `dev` and `preview` scripts. The `start` command shown above is for local preview workflows; it is not, by itself, a production deployment configuration.

### 6. Run the Application

From the project root:

```bash
npm run dev
```

Expected workflow:

1. npm starts the Express backend.
2. npm starts the Vite frontend.
3. `concurrently` displays output from both processes.
4. Open the frontend URL printed by Vite in your browser.
5. The frontend communicates with the backend API at the configured backend URL.

### 7. Run Servers Separately (Optional)

If you need to debug either application independently, open separate terminals.

**Backend:**

```bash
cd server
npm run dev
```

**Frontend:**

```bash
cd client
npm run dev
```

This is optional. For regular development, the root `npm run dev` command is sufficient when the scripts are configured correctly.

---

## Project Structure

```text
Eventora/
├── client/          # React frontend
├── server/          # Express backend and API
│   └── .env         # Environment variables (do not commit)
├── package.json     # Root scripts and concurrently
└── README.md
```

## Security Notes

- Keep JWT secrets, database credentials, and email passwords private.
- Add `.env` to `.gitignore`.
- Validate and authorize booking and payment-status updates on the backend.
- Use HTTPS and secure production environment variables when deploying.

## Conclusion

Eventora demonstrates a full-stack MERN event booking workflow with authentication, OTP verification, event management, booking approvals, payment-status tracking, and email notifications. Using `concurrently`, developers can launch the React frontend and Express backend with a single command, making local development simpler and more efficient.
