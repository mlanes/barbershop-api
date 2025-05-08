# Barbershop API

A **RESTful API** built with **Node.js**, **Express.js**, **Sequelize**, and **PostgreSQL** to manage barbershops.

## 🚀 Features

- **AWS Cognito Authentication** (Token verification)
- **Barbershop Management** (CRUD operations for barbershops and services)
- **Appointment Booking System** (Schedule, update, and cancel appointments)
- **Sequelize ORM** for PostgreSQL interactions
- **Token Verification Middleware** for Cognito JWTs
- **Environment Configuration** with dotenv

## 📁 Folder Structure

```
├── migrations/                     # Database migrations
│   └── 20250301082920-add_indexes_and_triggers.js
├── seeders/                       # Database seed files
│   ├── 20250301093730-insert_default_roles.js
│   ├── 20250301093759-insert_default_users.js
│   ├── 20250301093810-insert_initial_barber.js
│   ├── 20250301093910-insert_initial_barbershop.js
│   ├── 20250301093932-insert_initial_services.js
│   ├── 20250301094005-insert_initial_barbershop_schedule.js
│   └── 20250301094042-insert_initial_appointments.js
├── app/
│   ├── config/
│   │   └── config.js             # Sequelize and environment configuration
│   ├── controllers/
│   │   └── v1/
│   │       ├── appointment.controller.js   # Appointment management
│   │       ├── auth.controller.js         # Token verification
│   │       ├── barber.controller.js       # Barber management
│   │       ├── barbershop.controller.js   # Barbershop operations
│   │       ├── service.controller.js      # Service management
│   │       └── user.controller.js         # User management
│   ├── middleware/
│   │   └── v1/
│   │       └── auth.middleware.js    # JWT verification middleware
│   ├── models/
│   │   ├── index.js                  # Model loader and associations
│   │   ├── appointment.js            # Appointment model
│   │   ├── barber.js                 # Barber model
│   │   ├── barber_availability.js    # Barber availability model
│   │   ├── barber_service.js         # Barber-service relation model
│   │   ├── barbershop.js             # Barbershop model
│   │   ├── barbershop_open_day.js    # Barbershop schedule model
│   │   ├── payment.js                # Payment model
│   │   ├── role.js                   # Role model
│   │   ├── service.js                # Service model
│   │   └── user.js                   # User model
│   ├── routes/
│   │   ├── index.js                  # Route aggregator
│   │   └── v1/
│   │       ├── appointment.routes.js  # Appointment routes
│   │       ├── auth.routes.js        # Authentication routes
│   │       ├── barber.routes.js      # Barber management routes
│   │       ├── barbershop.routes.js  # Barbershop routes
│   │       ├── service.routes.js     # Service management routes
│   │       └── user.routes.js        # User management routes
│   └── express.js                    # Express configuration and middleware
├── app.js                            # Application entry point
├── package.json                      # Project configuration and dependencies
└── README.md                         # Project documentation
```

## 🛠️ Installation

1. **Clone the Repository**

```sh
 git clone <repository_url>
 cd barbershop-api
```

2. **Install Dependencies**

```sh
npm install
```

3. **Configure the .env File**

```sh
cp .env.example .env
```

Modify `.env` with your database credentials and AWS Cognito configuration.

4. **Setup PostgreSQL Database**

```sh
psql -U your_database_user -c "CREATE DATABASE barbershop;"
```

5. **Run Migrations**

```sh
npm run migrate
```

6. **Run Seeders**

```sh
npm run seed
```

7. **Start the Server**

```sh
npm run dev  # For development mode
npm start    # For production mode
```

## 🔥 API Endpoints

### **Authentication**
- Authentication is handled by AWS Cognito in the frontend
- Backend verifies Cognito JWT tokens

### **Users**
- `GET /api/v1/users` → List all users (Admin only)
- `GET /api/v1/users/:id` → Get user details
- `PUT /api/v1/users/:id` → Update user profile

### **Barbershops**
- `GET /api/v1/barbershops` → List all barbershops
- `GET /api/v1/barbershops/:id` → Get barbershop details
- `POST /api/v1/barbershops` → Create a barbershop (Admin only)
- `PUT /api/v1/barbershops/:id` → Update barbershop (Admin only)
- `DELETE /api/v1/barbershops/:id` → Delete barbershop (Admin only)

### **Barbers**
- `GET /api/v1/barbers` → List all barbers
- `GET /api/v1/barbers/:id` → Get barber details
- `POST /api/v1/barbers` → Add a barber (Admin only)
- `PUT /api/v1/barbers/:id` → Update barber details
- `DELETE /api/v1/barbers/:id` → Remove barber (Admin only)

### **Services**
- `GET /api/v1/services` → List all services
- `GET /api/v1/services/:id` → Get service details
- `POST /api/v1/services` → Add a service (Admin only)
- `PUT /api/v1/services/:id` → Update service
- `DELETE /api/v1/services/:id` → Remove service (Admin only)

### **Appointments**
- `GET /api/v1/appointments` → List user's appointments
- `GET /api/v1/appointments/:id` → Get appointment details
- `POST /api/v1/appointments` → Book an appointment
- `PUT /api/v1/appointments/:id` → Update appointment
- `DELETE /api/v1/appointments/:id` → Cancel appointment

## 🔄 Running Migrations

To undo the last migration:

```sh
npx sequelize-cli db:migrate:undo
```

To undo all migrations:

```sh
npx sequelize-cli db:migrate:undo:all
```

## 🚀 Deployment

For production, run:

```sh
npm start
```

Or use **Docker**:

```sh
docker build -t barbershop-api .
docker run -p 3000:3000 --env-file .env barbershop-api
```
