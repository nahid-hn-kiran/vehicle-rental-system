# Vehicle Rental System

A backend API for a vehicle rental platform where users can book vehicles and admins can manage inventory. Built with **Node.js**, **Express.js**, **TypeScript**, and **PostgreSQL (NeonDB)**.

**Live Deployment:** [https://vehicle-rental-system-lake.vercel.app/]  
**GitHub Repository:** [https://github.com/nahid-hn-kiran/vehicle-rental-system]

## Test Credentials

Use these credentials to test the Admin features (Vehicle Management, User Management):

| Role         | Email                  | Password            |
| :----------- | :--------------------- | :------------------ |
| **Admin**    | `john.doe@example.com` | `securePassword123` |
| **Customer** | `nahid@gmail.com`      | `nahid1234`         |

---

## Features

- **Authentication & Authorization:** Secure JWT-based login with Role-Based Access Control (Admin/Customer).
- **Vehicle Management:** Admins can add, update, and delete vehicles with availability tracking.
- **Booking System:** Customers can book vehicles with automatic price calculation based on rental duration.
- **Transaction Management:** Uses database transactions (ACID) to ensure booking creation and vehicle status updates happen simultaneously.
- **Auto-Return System:** The system automatically checks for expired bookings and marks vehicles as "Returned/Available" instantly when bookings are retrieved.
- - User Management:\*\* Admins can manage user roles; customers can securely manage their own profiles.
- **Validation:** input validation for booking dates, status updates, and user permissions.

---

## Technology Stack

- **Runtime:** Node.js
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** PostgreSQL (Hosted on NeonDB)
- **Database Driver:** `pg` (node-postgres)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt

---

## Setup & Installation

Follow these steps to run the project locally.

### 1. Clone the Repository

```bash
git clone https://github.com/nahid-hn-kiran/vehicle-rental-system.git
cd vehicle-rental-system
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory and add the following configuration:

```env
DATABASE_URL=postgresql://neondb_owner:npg_8Isow0txpiTf@ep-solitary-river-a4zo5q5u-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
PORT=5000
JWT_SECRET=KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30
```

### 4. Database Setup

The application is configured to automatically create the necessary tables (`users`, `vehicles`, `bookings`) upon the first run.

### 5. Run the Application

**Development Mode:**

```bash
npm run dev
```

**Production Build:**

```bash
npm run build
```

---

## API Endpoints

### Authentication

- `POST /api/v1/auth/signup` - Register a new user
- `POST /api/v1/auth/signin` - Login user

### Vehicles

- `POST /api/v1/vehicles` - Create a vehicle (Admin)
- `GET /api/v1/vehicles` - Get all vehicles
- `GET /api/v1/vehicles/:id` - Get vehicle details
- `PUT /api/v1/vehicles/:id` - Update vehicle (Admin)
- `DELETE /api/v1/vehicles/:id` - Delete vehicle (Admin)

### Bookings

- `POST /api/v1/bookings` - Create a booking
- `GET /api/v1/bookings` - Get bookings (Admin sees all, Customer sees own)
- `PUT /api/v1/bookings/:id` - Cancel (Customer) or Return (Admin) booking

### Users

- `GET /api/v1/users` - Get all users (Admin)
- `PUT /api/v1/users/:id` - Update profile (Admin or Own)
- `DELETE /api/v1/users/:id` - Delete user (Admin)
