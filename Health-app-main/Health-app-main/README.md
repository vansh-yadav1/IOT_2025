# Hospital Management System

A modern web-based Hospital Management System built with React, FastAPI, and Supabase.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Project Structure](#project-structure)
- [Setup and Installation](#setup-and-installation)
- [Database Schema](#database-schema)
- [API Documentation](#api-documentation)
- [Authentication](#authentication)
- [Role-Based Access](#role-based-access)
- [Development Guidelines](#development-guidelines)
- [Contributing](#contributing)
- [License](#license)
- [Wearable Data Integration](#wearable-data-integration)

## Overview

The Hospital Management System is a comprehensive solution for managing hospital operations, patient records, appointments, and medical staff. It provides role-based access for patients, doctors, and administrators.

### Key Features Highlights
- User authentication with email verification
- Role-based access control
- Appointment scheduling system
- Patient health metrics tracking
- Doctor availability management
- Medical records management
- Real-time notifications

## Features

### Patient Features
- Schedule and manage appointments
- View personal health metrics
- Access medical history
- Communicate with doctors
- View prescriptions and reports
- Receive appointment reminders

### Doctor Features
- Manage daily appointments
- Set availability schedule
- Access patient records
- Write prescriptions
- Update patient health metrics
- View medical history

### Admin Features
- User management
- Role assignment
- System configuration
- Analytics dashboard
- Report generation

## Technology Stack

### Frontend
- React 18.x
- TypeScript
- Material-UI (MUI)
- Context API for state management
- Supabase Client

### Backend
- FastAPI (Python)
- Supabase (PostgreSQL)
- JWT Authentication
- SQLAlchemy ORM

### Database
- PostgreSQL (via Supabase)
- Row Level Security
- Real-time subscriptions

### DevOps
- Git for version control
- GitHub Actions for CI/CD
- Docker for containerization

## Project Structure

```
project-root/
├── frontend/
│   ├── public/
│   └── src/
│       ├── components/
│       │   ├── auth/
│       │   ├── layout/
│       │   └── shared/
│       ├── context/
│       ├── hooks/
│       ├── pages/
│       ├── services/
│       ├── types/
│       └── utils/
├── backend/
│   ├── src/
│   │   ├── models/
│   │   ├── routers/
│   │   └── utils/
│   ├── tests/
│   └── main.py
└── docs/
```

## Setup and Installation

### Prerequisites
- Node.js (v16 or higher)
- Python (v3.8 or higher)
- PostgreSQL
- Supabase Account

### Frontend Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/hospital-management.git
   cd hospital-management/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create .env file:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start development server:
   ```bash
   npm start
   ```

### Backend Setup
1. Navigate to backend directory:
   ```bash
   cd ../backend
   ```

2. Create virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create .env file:
   ```env
   SUPABASE_URL=your_supabase_url
   SUPABASE_KEY=your_service_role_key
   ```

5. Start the server:
   ```bash
   python main.py
   ```

## Database Schema

### Core Tables

#### profiles
```sql
create table profiles (
    id uuid references auth.users primary key,
    email text unique not null,
    first_name text,
    last_name text,
    full_name text,
    role text,
    roles text[],
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
```

#### doctor_profiles
```sql
create table doctor_profiles (
    id uuid references auth.users primary key,
    specialization text,
    license_number text,
    availability_hours jsonb,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
```

#### appointments
```sql
create table appointments (
    id uuid primary key default uuid_generate_v4(),
    patient_id uuid references auth.users not null,
    doctor_id uuid references auth.users not null,
    appointment_date timestamptz not null,
    status text default 'PENDING',
    reason text,
    notes text,
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);
```

## API Documentation

### Authentication Endpoints

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepassword",
    "firstName": "John",
    "lastName": "Doe",
    "role": "PATIENT"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
    "email": "user@example.com",
    "password": "securepassword"
}
```

### Appointment Endpoints

#### Create Appointment
```http
POST /appointments
Content-Type: application/json
Authorization: Bearer <token>

{
    "doctor_id": "uuid",
    "appointment_date": "2024-03-20T10:00:00Z",
    "reason": "Regular checkup"
}
```

## Authentication

### Registration Flow
1. User submits registration form
2. System creates auth.users entry
3. Trigger creates profile entry
4. Confirmation email sent
5. User verifies email
6. Account activated

### Login Flow
1. User submits credentials
2. System validates email/password
3. JWT token generated
4. User session created
5. Role-based redirect

## Role-Based Access

### Patient Access
- View own profile
- Book appointments
- View health metrics
- Access medical history

### Doctor Access
- Manage appointments
- Update availability
- Access patient records
- Write prescriptions

### Admin Access
- Full system access
- User management
- Configuration control
- Analytics access

## Development Guidelines

### Code Style
- Use TypeScript for type safety
- Follow ESLint configuration
- Use Prettier for formatting
- Write unit tests for components

### Git Workflow
1. Create feature branch
2. Make changes
3. Write tests
4. Create pull request
5. Code review
6. Merge to main

### Commit Messages
- Use conventional commits
- Include ticket number
- Be descriptive
- Keep it concise

## Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## Contact

For any queries, please contact:
- Email: your.email@example.com
- GitHub: [@yourusername](https://github.com/yourusername)

## Acknowledgments

- Material-UI for the component library
- Supabase for the backend infrastructure
- FastAPI for the API framework

## Wearable Data Integration

This project now includes integration with smartwatch data through the Vital API, which provides access to data from 300+ different wearable devices including:

- Apple Watch
- Fitbit devices
- Garmin watches
- Oura Ring
- And many more

### Features

- **Activity Tracking**: View steps, distance, calories burned, and activity minutes
- **Heart Rate Monitoring**: Track average, resting, maximum, and minimum heart rates
- **Sleep Analysis**: Monitor sleep duration, efficiency, deep sleep, and REM sleep phases
- **Blood Oxygen Levels**: Track blood oxygen saturation levels
- **Device Management**: Connect and manage multiple wearable devices

### Setup

1. Sign up for a Vital API account at [tryvital.io](https://www.tryvital.io/)
2. Get your API key from the Vital dashboard
3. Add your API key to the backend environment configuration:
   ```
   VITAL_API_KEY=your_api_key_here
   ```
4. Run the database migrations to create the necessary tables
5. Access the wearable data dashboard at `/wearable-data` route

### How It Works

The integration uses Vital's unified API to access data from various wearable devices. Users can connect their devices through a link generated by the Vital API, and the application will automatically fetch and display their health data.

This approach allows the application to support hundreds of different wearable devices without having to implement device-specific integrations for each one. 