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
├── src/
│   ├── api/
│   │   └── v1/
│   │       ├── controllers/       # API Controllers
│   │       │   ├── appointment.controller.js
│   │       │   ├── auth.controller.js
│   │       │   ├── barber.controller.js
│   │       │   ├── barbershop.controller.js
│   │       │   ├── service.controller.js
│   │       │   └── user.controller.js
│   │       ├── middlewares/       # API Middlewares
│   │       │   ├── auth.middleware.js
│   │       │   └── error.middleware.js
│   │       ├── routes/           # API Routes
│   │       │   ├── appointment.routes.js
│   │       │   ├── auth.routes.js
│   │       │   ├── barber.routes.js
│   │       │   ├── barbershop.routes.js
│   │       │   ├── index.js
│   │       │   ├── service.routes.js
│   │       │   └── user.routes.js
│   │       └── validators/       # Request Validators
│   │           ├── appointment.js
│   │           ├── barbershop.js
│   │           ├── common.js
│   │           ├── service.js
│   │           └── user.js
│   ├── config/                   # Configuration Files
│   │   ├── database.js          # Database configuration
│   │   ├── env.js              # Environment variables
│   │   └── express.js          # Express configuration
│   ├── models/                  # Database Models
│   │   ├── entities/
│   │   │   ├── appointment.js
│   │   │   ├── barber.js
│   │   │   ├── barber_availability.js
│   │   │   ├── barber_service.js
│   │   │   ├── barbershop.js
│   │   │   ├── barbershop_open_day.js
│   │   │   ├── payment.js
│   │   │   ├── role.js
│   │   │   ├── service.js
│   │   │   └── user.js
│   │   └── index.js            # Model initialization
│   ├── services/               # Business Logic Services
│   │   ├── appointment.service.js
│   │   ├── auth.service.js
│   │   ├── barbershop.service.js
│   │   └── user.service.js
│   ├── utils/                  # Utility Functions
│   │   ├── errors/
│   │   │   └── api-error.js
│   │   ├── logger.js
│   │   └── response.js
│   └── app.js                  # Application Entry Point
├── package.json                # Project Dependencies
└── README.md                   # Project Documentation
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

## 📚 API Documentation

The API is documented using Swagger/OpenAPI. You can access the interactive documentation at:

```
http://localhost:3000/api-docs
```

This provides a detailed view of all endpoints, request/response schemas, and allows you to test the API directly from your browser.

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