# 🎟️ Eventora — Full-Stack Event Booking Platform

![MERN Stack](https://img.shields.io/badge/Stack-MERN-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=for-the-badge&logo=mongodb&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)
![JWT](https://img.shields.io/badge/Auth-JWT_%2B_2FA_OTP-4f46e5?style=for-the-badge)

**Eventora** is a full-stack MERN (MongoDB, Express.js, React, Node.js) application engineered to allow users to seamlessly browse, register, and pay for events natively without relying on third-party ticketing or payment tools. It features a dedicated administrative dashboard for event organizers to create and manage both free and paid events, while managing all incoming booking requests and payment statuses (`Paid` / `Not Paid`) directly.

---

## 📋 Table of Contents

1. [Key Features](#-key-features)
2. [Technology Stack](#-technology-stack)
3. [System Workflow & 2FA OTP Lifecycle](#-system-workflow--2fa-otp-lifecycle)
4. [Role-Based Access Control (RBAC)](#-role-based-access-control-rbac)
5. [Setup & Installation Instructions](#-setup--installation-instructions)
6. [Complete REST API Reference](#-complete-rest-api-reference)
7. [Postman Collection & Automation](#-postman-collection--automation)

---

## ✨ Key Features

- **🔐 User Authentication:** Secure user registration and login powered by `bcrypt` password hashing and stateless `JWT` Bearer authentication.
- **🛡️ Dual-Stage 2FA OTP Verification:**
  - **Stage 1 (Account Activation):** Mandatory Email OTP required to activate an account upon initial Registration (or triggered during delayed login attempts).
  - **Stage 2 (Booking Authorization):** Mandatory Email OTP required to finalize and secure every event ticket booking request.
- **👥 Role-Based Access Control:** Strict separation between standard authenticated Users and Database-Flagged Administrators.
- **📅 Comprehensive Event Management:** Create, update, and delete both **free and paid events** with detailed descriptions, external image URLs, event dates, locations, categories, and total seating capacity.
- **🧠 Smart Booking Queue & Overbooking Protection:**
  - Every booking request (both free and paid) enters a centralized `'Pending'` queue after 2FA OTP validation for Admin verification.
  - Seat availability updates accurately in real time and validates against overbooking logic.
- **📊 Admin Analytics Dashboard:** Track live metrics directly from the admin panel, including **Pending Requests**, **Total Revenue**, and **Total Confirmed Paid Clients**.
- **📧 Automated Email Notifications:** Powered by **Nodemailer**, automatically delivering OTP verification codes and booking confirmation emails upon admin approval.
- **🎨 Sleek UI/UX:** Built entirely with **React**, **Vite**, and **Tailwind CSS**, polished with smooth micro-interactions.

---

## 🛠️ Technology Stack

| System Layer | Core Technology / Package | Implementation Role in Eventora |
| :--- | :--- | :--- |
| **Frontend Client** | React, Vite, Tailwind CSS | Responsive UI with micro-interactions, personal user booking dashboard, and real-time Admin Analytics Panel (`http://localhost:5173`). |
| **Backend API Server** | Node.js, Express.js | RESTful API server (`http://localhost:5000`) managing authentication, event CRUD operations, seat validation, and booking state transitions. |
| **Database Layer** | MongoDB (Atlas) | Document store persisting user credentials, database-flagged admin roles, event metadata, seating capacity, and booking queue records via `MONGO_URI`. |
| **Authentication & Crypto** | JWT & `bcrypt` | Password hashing via `bcrypt` and stateless session management signed with `JWT_SECRET` (`Authorization: Bearer <token>`). |
| **Email & 2FA Engine** | Nodemailer + Gmail App Pass | Dispatches mandatory 2FA OTP verification codes (registration & booking authorization) and automated booking confirmation emails via `EMAIL_USER`. |
| **Process Orchestration** | `concurrently` & npm scripts | Enables single-terminal root orchestration (`npm run dev`, `npm run dev:all`, `npm run start`) alongside split-terminal workflows. |

---

## 🔄 System Workflow & 2FA OTP Lifecycle

```text
[1. USER REGISTRATION]        [2. BOOKING 2FA OTP]          [3. PENDING QUEUE]
POST /api/auth/register  ───► Browse Free/Paid Events  ───► POST /api/bookings
bcrypt hash + Email OTP       POST /bookings/send-otp       Payload: { eventId, otp }
POST /api/auth/verify-otp     Mandatory Email OTP sent      Enters 'Pending' Queue
Account Activated + JWT       Secures ticket request        Seat Overbooking Check
                                                                      │
                                                                      ▼
                              [5. CONFIRMED & NOTIFIED]     [4. ADMIN VERIFICATION]
                              Seats Accurately Updated ◄─── DB-Flagged Admin Only
                              Live Analytics Updated        PUT /bookings/:id/confirm
                              Nodemailer Email Sent         Mark 'Paid' or 'Not Paid'
                                                            (or DELETE to Reject/Cancel)
```

---

## 🔐 Role-Based Access Control (RBAC)

### 👑 Administrator Role (Database-Flagged Users Only)
> **Security Note:** Administrative access is strictly locked to database-flagged users only (e.g., `admin@eventora.com`). Unflagged accounts cannot escalate privileges via client-side manipulation.

- **Event Lifecycle CRUD:** Create new free/paid events, edit existing event details (such as updating `ticketPrice`), and delete events.
- **Manual Payment & Booking Control:** Inspect all incoming booking requests, confirm or reject requests, and manually mark bookings as `'Paid'` (`"paymentStatus": "paid"`) or `'Not Paid'`.
- **Live Telemetry Access:** View real-time Pending Requests, Total Revenue, and Total Confirmed Paid Clients.

### 👤 Standard User Role
- **Catalog Discovery:** Publicly browse all upcoming free and paid events and inspect individual event pages.
- **OTP-Secured Booking Requests:** Request a 2FA booking OTP via email and submit ticket booking requests into the `'Pending'` queue.
- **Personal Dashboard & Cancellation:** Monitor personal booking statuses (`Pending`, `Confirmed`, `Paid`) and cancel bookings at any time.

---

## 🚀 Setup & Installation Instructions

### Prerequisites
Ensure you have **Node.js** installed on your machine along with a **MongoDB database** (e.g., a **MongoDB Atlas Free Tier** cluster).

### 1. Environment Variables Configuration
Navigate to `server/.env` and configure the following environment variables:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=supersecretjwtkey_eventora
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
PORT=5000
```

> ⚠️ **Important Note on `EMAIL_PASS`:** You must generate an **"App Password"** from your Google Account security settings. Standard Gmail passwords will not work due to Google's mandatory Two-Factor Authentication (2FA) restrictions on SMTP transport.

---

### 2. Option A: Run from Outer Folder (Single Terminal)
You can manage both the backend and frontend concurrently directly from the project root directory:

```bash
# From Eventora project root
npm install
npm run install:all
npm run dev
```

#### Available Root Scripts:
- `npm run dev` — Starts both backend server and frontend client together using `concurrently`.
- `npm run dev:all` — Installs dependencies for both `server` and `client` and starts both in a single command.
- `npm run start` — Runs the backend production start script and frontend preview server together.

---

### 3. Option B: Run in Two Separate Terminals (Split Mode)

#### Step 3.1: Install Dependencies
Open two separate terminal windows for the backend and frontend:

**Backend Terminal:**
```bash
cd server
npm install --legacy-peer-deps
```

**Frontend Terminal:**
```bash
cd client
npm install
```

#### Step 3.2: Run the Local Servers

**Run Backend (`http://localhost:5000`):**
```bash
cd server
npm run dev
```

**Run Frontend (`http://localhost:5173`):**
```bash
cd client
npm run dev
```

---

## 📡 Complete REST API Reference

**Base URL:** `http://localhost:5000`  
**Protected Endpoints Header:** `Authorization: Bearer {{token}}`

### 1. Authentication APIs (`/api/auth`)

| Method | Endpoint | Access | Request Body / Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Public | Registers a new user and sends an account activation OTP email.<br>`{"name": "Test User", "email": "test@example.com", "password": "password123"}` |
| `POST` | `/api/auth/verify-otp` | Public | Verifies account activation OTP and returns a signed JWT `token`.<br>`{"email": "test@example.com", "otp": "123456"}` |
| `POST` | `/api/auth/login` | Public | Authenticates an existing user or Admin and returns a signed JWT `token`.<br>`{"email": "admin@eventora.com", "password": "password123"}` |

### 2. Events APIs (`/api/events`)

| Method | Endpoint | Access | Request Body / Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | Public | Retrieves a list of all published free and paid events. |
| `GET` | `/api/events/:id` | Public | Retrieves full details and seat availability for a specific event ID (`{{event_id}}`). |
| `POST` | `/api/events` | Bearer (Admin) | Creates a new event. Returns created event object with `_id`. |
| `PUT` | `/api/events/:id` | Bearer (Admin) | Updates an existing event (e.g., `{"ticketPrice": 550}`). |
| `DELETE` | `/api/events/:id` | Bearer (Admin) | Permanently deletes an event by ID (`{{event_id}}`). |

#### Sample `POST /api/events` Request Payload (Admin):
```json
{
    "title": "Tech Conference 2024",
    "description": "A massive conference for developers",
    "date": "2024-12-01",
    "location": "San Francisco, CA",
    "category": "Technology",
    "totalSeats": 100,
    "ticketPrice": 500,
    "image": "https://images.unsplash.com/photo-1540575467063-178a50c2df87"
}
```

### 3. Bookings APIs (`/api/bookings`)

| Method | Endpoint | Access | Request Body / Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/bookings/send-otp` | Bearer (User) | Sends a mandatory 2FA booking authorization OTP to the logged-in user's email. |
| `POST` | `/api/bookings` | Bearer (User) | Verifies the booking OTP and places the request in the `'Pending'` queue.<br>`{"eventId": "{{event_id}}", "otp": "123456"}` |
| `PUT` | `/api/bookings/:id/confirm` | Bearer (Admin) | Confirms a pending booking, updates seat count, and triggers a confirmation email.<br>`{"paymentStatus": "paid"}` |
| `GET` | `/api/bookings/my` | Bearer (User) | Retrieves all bookings and live statuses (`Pending` / `Confirmed`) for the logged-in user. |
| `DELETE` | `/api/bookings/:id` | Bearer (Admin/User) | Cancels a booking (User) or rejects an incoming booking request (Admin). |

---

## 🧪 Postman Collection & Automation

The repository includes `Eventora_Postman_Collection.json` (Collection ID: `c7a8b29e-4c5d-4a1v-b3nf-9a8x7b6c5d4e`, Schema v2.1.0) with pre-configured environment/collection variables and automated post-response scripts.

### Collection Variables
| Variable Key | Initial Value | Purpose |
| :--- | :--- | :--- |
| `token` | `""` | Stores the JWT Bearer token captured from `/api/auth/verify-otp` or `/api/auth/login`. |
| `event_id` | `""` | Stores the `_id` of the newly created event from `POST /api/events`. |
| `free_event_id` | `""` | Reserved variable for testing free event booking flows. |
| `booking_id` | `""` | Stores `booking._id` returned from `POST /api/bookings` for confirmation or cancellation. |

### Automated Postman Test Scripts
The collection automatically chains API requests by capturing IDs and tokens in the **Tests** tab:

```javascript
// 1. Verify Account OTP & Login Endpoints
const responseData = pm.response.json();
if (responseData.token) {
    pm.environment.set("token", responseData.token);
}

// 2. Create Event (Admin) Endpoint
const responseData = pm.response.json();
if (responseData._id) {
    pm.environment.set("event_id", responseData._id);
}

// 3. Verify & Request Booking Endpoint
const responseData = pm.response.json();
if (responseData.booking && responseData.booking._id) {
    pm.environment.set("booking_id", responseData.booking._id);
}
```
