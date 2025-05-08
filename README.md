# Barbershop API

A **RESTful API** built with **Node.js**, **Express.js**, **Sequelize**, and **PostgreSQL** to manage barbershops.

## 🚀 Features

- **User Authentication** (Register/Login with JWT)
- **Barbershop Management** (CRUD operations for barbershops and services)
- **Appointment Booking System** (Schedule, update, and cancel appointments)
- **Sequelize ORM** for database interactions
- **Middleware for Authentication**
- **.env Support** for environment variables

## 📁 Folder Structure

```
├── migrations/
├── seeders/
├── app/
│   ├── config/
│   │   ├── config.json                  # Sequelize configuration for different environments
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
│   │   ├── index.js		    # List routes
│   │   ├── authRoutes.js           # Defines authentication routes (login, register)
│   │   ├── barbershopRoutes.js     # Defines barbershop management routes
│   │   ├── appointmentRoutes.js    # Defines appointment-related routes
│   │   ├── userRoutes.js           # Defines user-related routes
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

Modify `.env` with your database and JWT secret configurations.

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

- `POST /api/v1/auth/register` → Register a new user
- `POST /api/v1/auth/login` → Authenticate and get JWT token

### **Barbershops**

- `GET /api/v1/barbershops` → Get all barbershops
- `POST /api/v1/barbershops` → Add a new barbershop (Admin only)

### **Appointments**

- `POST /api/v1/appointments` → Book an appointment
- `DELETE /api/v1/appointments/:id` → Cancel an appointment

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
