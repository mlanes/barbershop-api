# Barbershop API

A **RESTful API** built with **Node.js**, **Express.js**, **Sequelize**, and **PostgreSQL** to manage barbershops.

## 🚀 Features

- **Third-party Authentication** (Auth0 integration with JWT)
- **Barbershop Management** (CRUD operations for barbershops and services)
- **Appointment Booking System** (Schedule, update, and cancel appointments)
- **Sequelize ORM** for PostgreSQL interactions
- **Authorization Middleware** with Auth0
- **Environment Configuration** with dotenv

## 📁 Folder Structure

```
├── migrations/
├── seeders/
├── app/
│   ├── config/
│   │   ├── config.js                    # Sequelize and environment configuration
│   ├── controllers/
|   │   ├── v1/
│   │   │   ├── authController.js       # Handles user authentication (register, login)
│   │   │   ├── barbershopController.js # Handles barbershop-related operations
│   │   │   ├── appointmentController.js # Manages appointment bookings, updates, cancellations
│   │   │   ├── userController.js       # Manages user profiles and roles
│   ├── middlewares/
│   │   ├── authMiddleware.js       # Middleware to verify JWT tokens
|   ├── models/
│   |   |── index.js                     # Loads all Sequelize models and sets associations
│   |   ├── role.js                      # Defines Role model
│   |   ├── user.js                      # Defines User model
│   |   ├── barbershop.js                # Defines Barbershop model
│   |   ├── barber.js                    # Defines Barber model
│   |   ├── service.js                   # Defines Service model
│   |   ├── appointment.js               # Defines Appointment model
│   |   ├── barberAvailability.js
│   |   ├── barbershopOpenDays.js
│   |   ├── barberServices.js
│   ├── routes/
│   │   ├── index.js                 # Route aggregator
│   │   ├── v1/
│   │   │   ├── auth.routes.js      # Defines authentication routes
│   │   │   ├── barbershop.routes.js # Defines barbershop management routes
│   │   │   ├── appointment.routes.js # Defines appointment-related routes
│   │   │   ├── user.routes.js      # Defines user-related routes
│   │   │   ├── barber.routes.js    # Defines barber management routes
│   │   │   ├── service.routes.js   # Defines service management routes
│   ├── express.js                  # Initializes Express app, applies middleware, sets up routes
├── .env                              # Stores environment variables like DB credentials, JWT secret
├── .gitignore                        # Ignores node_modules, .env, etc.
├── app.js                            # Starts the Express server and syncs Sequelize
├── package.json                      # Project dependencies and scripts
├── README.md                         # Project documentation
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

Modify `.env` with your database credentials and Auth0 configuration.

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
- `GET /api/v1/auth/login` → Initiate Auth0 login flow
- `GET /api/v1/auth/callback` → Handle Auth0 callback

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
